## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import asyncio
import fcntl
import json
import logging
import os
import re
import stat
from contextlib import suppress
from datetime import datetime, timezone

import ptyprocess
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from auth import is_token_blacklisted, verify_token
from config import ADMIN_USER
from maintenance import (
    MaintenanceBusyError,
    database_activity_window,
    is_maintenance_active,
)
from origins import is_admin_origin_allowed

router = APIRouter()
logger = logging.getLogger(__name__)

TERMINAL_SSH_USER = os.getenv("TERMINAL_SSH_USER", "kbssh")
TERMINAL_SSH_HOST = os.getenv("TERMINAL_SSH_HOST", "host.docker.internal")
TERMINAL_SSH_PORT = int(os.getenv("TERMINAL_SSH_PORT", "22"))
TERMINAL_SSH_KEY_PATH = os.getenv(
    "TERMINAL_SSH_KEY_PATH", "/run/secrets/terminal_ssh_key"
)
TERMINAL_SSH_KNOWN_HOSTS_PATH = os.getenv(
    "TERMINAL_SSH_KNOWN_HOSTS_PATH", "/run/secrets/terminal_ssh_known_hosts"
)
TERMINAL_SESSION_MAX_SECONDS = int(
    os.getenv("TERMINAL_SESSION_MAX_SECONDS", "1800")
)
TERMINAL_TOKEN_RECHECK_SECONDS = max(
    1,
    min(int(os.getenv("TERMINAL_TOKEN_RECHECK_SECONDS", "15")), 60),
)
TERMINAL_LOCK_PATH = os.getenv(
    "TERMINAL_LOCK_PATH", "/tmp/kadenbilyeu-terminal.lock"
)
TERMINAL_MAX_MESSAGE_BYTES = 16 * 1024
TERMINAL_MAX_ROWS = 200
TERMINAL_MAX_COLUMNS = 400

def is_terminal_origin_allowed(origin: str) -> bool:
    return is_admin_origin_allowed(origin, "TERMINAL_ALLOWED_ORIGINS")


def _validate_ssh_setting(value: str, pattern: str, name: str) -> None:
    if not re.fullmatch(pattern, value):
        raise RuntimeError(f"Invalid {name} configuration")


def build_terminal_ssh_command() -> list[str]:
    _validate_ssh_setting(TERMINAL_SSH_USER, r"[a-z_][a-z0-9_-]{0,31}", "SSH user")
    _validate_ssh_setting(
        TERMINAL_SSH_HOST, r"[A-Za-z0-9](?:[A-Za-z0-9.-]{0,251}[A-Za-z0-9])?", "SSH host"
    )
    if not 1 <= TERMINAL_SSH_PORT <= 65535:
        raise RuntimeError("Invalid SSH port configuration")

    return [
        "ssh",
        "-tt",
        "-F", "/dev/null",
        "-o", "BatchMode=yes",
        "-o", "IdentitiesOnly=yes",
        "-o", "PasswordAuthentication=no",
        "-o", "KbdInteractiveAuthentication=no",
        "-o", "StrictHostKeyChecking=yes",
        "-o", f"UserKnownHostsFile={TERMINAL_SSH_KNOWN_HOSTS_PATH}",
        "-o", "GlobalKnownHostsFile=/dev/null",
        "-o", "ClearAllForwardings=yes",
        "-o", "ForwardAgent=no",
        "-o", "ForwardX11=no",
        "-o", "EscapeChar=none",
        "-o", "PermitLocalCommand=no",
        "-o", "ConnectTimeout=10",
        "-o", "ServerAliveInterval=30",
        "-o", "ServerAliveCountMax=3",
        "-o", "LogLevel=ERROR",
        "-i", TERMINAL_SSH_KEY_PATH,
        "-p", str(TERMINAL_SSH_PORT),
        "--",
        f"{TERMINAL_SSH_USER}@{TERMINAL_SSH_HOST}",
    ]


def _validate_secret_file(path: str, name: str) -> None:
    try:
        file_stat = os.stat(path)
    except OSError as exc:
        raise RuntimeError(f"{name} is unavailable") from exc

    if not stat.S_ISREG(file_stat.st_mode) or not os.access(path, os.R_OK):
        raise RuntimeError(f"{name} is unavailable")
    if file_stat.st_mode & stat.S_IWOTH:
        raise RuntimeError(f"{name} must not be world-writable")


def _validate_terminal_files() -> None:
    _validate_secret_file(TERMINAL_SSH_KEY_PATH, "Terminal SSH key")
    _validate_secret_file(TERMINAL_SSH_KNOWN_HOSTS_PATH, "Terminal known-hosts file")


class _TerminalSessionLock:
    def __init__(self) -> None:
        self._fd: int | None = None

    def acquire(self) -> bool:
        self._fd = os.open(TERMINAL_LOCK_PATH, os.O_CREAT | os.O_RDWR, 0o600)
        try:
            fcntl.flock(self._fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            os.close(self._fd)
            self._fd = None
            return False
        return True

    def release(self) -> None:
        if self._fd is None:
            return
        with suppress(OSError):
            fcntl.flock(self._fd, fcntl.LOCK_UN)
        os.close(self._fd)
        self._fd = None


async def _is_terminal_token_blacklisted(access_token: str) -> bool:
    """Check revocation without racing a database restore."""
    def guarded_lookup() -> bool:
        if is_maintenance_active():
            raise MaintenanceBusyError("Database maintenance is in progress")

        with database_activity_window():
            if is_maintenance_active():
                raise MaintenanceBusyError("Database maintenance is in progress")
            return is_token_blacklisted(access_token)

    return await asyncio.to_thread(guarded_lookup)


async def _authenticate_terminal(
    websocket: WebSocket,
) -> tuple[str, datetime] | None:
    origin = websocket.headers.get("origin", "")
    if not is_terminal_origin_allowed(origin):
        logger.warning("Rejected terminal WebSocket from an unapproved origin")
        await websocket.close(code=1008, reason="Origin not allowed")
        return None

    access_token = websocket.cookies.get("access_token")
    if not access_token:
        await websocket.close(code=1008, reason="Not authenticated")
        return None

    try:
        token_data = verify_token(access_token)
    except Exception:
        await websocket.close(code=1008, reason="Authentication failed")
        return None

    if token_data.username != ADMIN_USER or token_data.expires_at is None:
        await websocket.close(code=1008, reason="Unauthorized")
        return None

    try:
        if await _is_terminal_token_blacklisted(access_token):
            await websocket.close(code=1008, reason="Token revoked")
            return None
    except MaintenanceBusyError:
        await websocket.close(code=1013, reason="Database maintenance is in progress")
        return None
    return access_token, token_data.expires_at


async def _bridge_terminal(
    websocket: WebSocket,
    pty_process,
    access_token: str,
) -> None:
    async def read_from_pty() -> None:
        while pty_process.isalive():
            try:
                output = await asyncio.to_thread(pty_process.read, 4096)
            except EOFError:
                return
            if output:
                await websocket.send_text(output)

    async def write_to_pty() -> None:
        while True:
            try:
                message = await websocket.receive()
            except WebSocketDisconnect:
                return

            payload = message.get("text")
            if payload is None and message.get("bytes") is not None:
                payload = message["bytes"].decode("utf-8", errors="ignore")
            if payload is None:
                return
            if len(payload.encode("utf-8")) > TERMINAL_MAX_MESSAGE_BYTES:
                await websocket.close(code=1009, reason="Terminal message too large")
                return

            if payload.startswith("{"):
                try:
                    resize = json.loads(payload)
                    if resize.get("type") == "resize":
                        rows = max(2, min(int(resize["rows"]), TERMINAL_MAX_ROWS))
                        columns = max(2, min(int(resize["cols"]), TERMINAL_MAX_COLUMNS))
                        pty_process.setwinsize(rows, columns)
                        continue
                except (KeyError, TypeError, ValueError, json.JSONDecodeError):
                    pass

            await asyncio.to_thread(pty_process.write, payload)

    async def watch_token_revocation() -> None:
        while True:
            await asyncio.sleep(TERMINAL_TOKEN_RECHECK_SECONDS)
            try:
                if await _is_terminal_token_blacklisted(access_token):
                    await websocket.close(code=1008, reason="Token revoked")
                    return
            except MaintenanceBusyError:
                continue

    read_task = asyncio.create_task(read_from_pty())
    write_task = asyncio.create_task(write_to_pty())
    revocation_task = asyncio.create_task(watch_token_revocation())
    tasks = {read_task, write_task, revocation_task}
    try:
        completed, _ = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for task in completed:
            task.result()
    finally:
        with suppress(Exception):
            if pty_process.isalive():
                pty_process.terminate(force=True)
        for task in tasks:
            if not task.done():
                task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)


@router.websocket("/admin/terminal/ws")
async def terminal_websocket(websocket: WebSocket) -> None:
    authentication = await _authenticate_terminal(websocket)
    if authentication is None:
        return
    access_token, expires_at = authentication

    remaining_token_seconds = (expires_at - datetime.now(timezone.utc)).total_seconds()
    if remaining_token_seconds <= 0:
        await websocket.close(code=1008, reason="Authentication expired")
        return

    session_lock = _TerminalSessionLock()
    if not session_lock.acquire():
        await websocket.close(code=1013, reason="A terminal session is already active")
        return

    pty_process = None
    try:
        _validate_terminal_files()
        command = build_terminal_ssh_command()
        env = os.environ.copy()
        env.setdefault("TERM", "xterm-256color")
        env.setdefault("COLORTERM", "truecolor")

        pty_process = ptyprocess.PtyProcessUnicode.spawn(
            command,
            dimensions=(24, 80),
            env=env,
        )
        await websocket.accept()
        logger.info("Authenticated terminal session opened")
        session_seconds = min(TERMINAL_SESSION_MAX_SECONDS, remaining_token_seconds)
        async with asyncio.timeout(session_seconds):
            await _bridge_terminal(websocket, pty_process, access_token)
    except TimeoutError:
        with suppress(Exception):
            await websocket.close(code=1000, reason="Terminal session expired")
    except Exception:
        logger.exception("Terminal session failed")
        with suppress(Exception):
            await websocket.close(code=1011, reason="Terminal unavailable")
    finally:
        with suppress(Exception):
            if pty_process is not None and pty_process.isalive():
                pty_process.terminate(force=True)
        session_lock.release()
        with suppress(Exception):
            await websocket.close()
