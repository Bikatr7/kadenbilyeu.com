import asyncio
import fcntl
import os
import sys
import threading
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ACCESS_TOKEN_SECRET", "test_access_secret")
os.environ.setdefault("REFRESH_TOKEN_SECRET", "test_refresh_secret")
os.environ.setdefault("JWT_ISSUER", "test-issuer")
os.environ.setdefault("JWT_AUDIENCE", "test-audience")
os.environ.setdefault("ENCRYPTION_KEY", "test-encryption-key")
os.environ.setdefault("WEBAUTHN_REGISTER_SECRET", "test-webauthn-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_terminal.db")
os.environ.setdefault("ENVIRONMENT", "testing")

from auth import create_access_token
from main import app
import maintenance
from routes import terminal

client = TestClient(app)


class _FakePty:
    def __init__(self):
        self.alive = True
        self.writes = []
        self.dimensions = []

    def isalive(self):
        return self.alive

    def read(self, _size):
        self.alive = False
        return "terminal-ready"

    def write(self, payload):
        self.writes.append(payload)

    def setwinsize(self, rows, columns):
        self.dimensions.append((rows, columns))

    def terminate(self, force=False):
        self.alive = False


class _BlockingPty(_FakePty):
    def __init__(self):
        super().__init__()
        self.read_started = threading.Event()
        self.stopped = threading.Event()

    def read(self, _size):
        self.read_started.set()
        self.stopped.wait(timeout=2)
        raise EOFError

    def terminate(self, force=False):
        super().terminate(force=force)
        self.stopped.set()


class _FailingTerminatePty(_BlockingPty):
    def terminate(self, force=False):
        super().terminate(force=force)
        raise RuntimeError("PTY terminate failed")


class _LifecycleWebSocket:
    def __init__(self, disconnect_immediately):
        self.disconnect_immediately = disconnect_immediately
        self.receive_cancelled = False
        self.close_calls = []
        self.accepted = False

    async def accept(self):
        self.accepted = True

    async def receive(self):
        if self.disconnect_immediately:
            raise WebSocketDisconnect
        try:
            await asyncio.Future()
        except asyncio.CancelledError:
            self.receive_cancelled = True
            raise

    async def send_text(self, _payload):
        pass

    async def close(self, code=1000, reason=None):
        self.close_calls.append((code, reason))


def test_terminal_ssh_command_is_noninteractive_and_pins_host_key():
    command = terminal.build_terminal_ssh_command()

    assert "kbssh@host.docker.internal" in command
    assert "kbilyeu@host.docker.internal" not in command
    assert "BatchMode=yes" in command
    assert "StrictHostKeyChecking=yes" in command
    assert "ClearAllForwardings=yes" in command
    assert "EscapeChar=none" in command
    assert terminal.TERMINAL_SSH_KEY_PATH in command
    assert f"UserKnownHostsFile={terminal.TERMINAL_SSH_KNOWN_HOSTS_PATH}" in command


@pytest.mark.parametrize(
    "origin",
    [
        "https://kadenbilyeu.com.evil.example",
        "https://evil.example/kadenbilyeu.com",
        "https://user@kadenbilyeu.com",
        "null",
        "",
    ],
)
def test_terminal_origin_check_rejects_confusable_origins(origin):
    assert terminal.is_terminal_origin_allowed(origin) is False


def test_terminal_websocket_rejects_non_admin_token():
    token = create_access_token({"sub": "not-admin"})

    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(
            "/admin/terminal/ws",
            headers={"origin": "https://kadenbilyeu.com"},
            cookies={"access_token": token},
        ):
            pass

    assert exc_info.value.code == 1008


def test_terminal_websocket_rejects_unapproved_origin():
    token = create_access_token({"sub": "admin"})

    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(
            "/admin/terminal/ws",
            headers={"origin": "https://attacker.example"},
            cookies={"access_token": token},
        ):
            pass

    assert exc_info.value.code == 1008


def test_terminal_rejects_malformed_token_before_blacklist_lookup(monkeypatch):
    blacklist_lookups = []

    def unexpected_blacklist_lookup(token):
        blacklist_lookups.append(token)
        return False

    monkeypatch.setattr(terminal, "is_token_blacklisted", unexpected_blacklist_lookup)

    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(
            "/admin/terminal/ws",
            headers={"origin": "https://kadenbilyeu.com"},
            cookies={"access_token": "not-a-valid-jwt"},
        ):
            pass

    assert exc_info.value.code == 1008
    assert blacklist_lookups == []


def test_terminal_handshake_retries_when_database_maintenance_is_active(monkeypatch):
    token = create_access_token({"sub": "admin"})
    blacklist_lookups = []
    monkeypatch.setattr(terminal, "is_maintenance_active", lambda: True)
    monkeypatch.setattr(
        terminal,
        "is_token_blacklisted",
        lambda value: blacklist_lookups.append(value),
    )

    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(
            "/admin/terminal/ws",
            headers={"origin": "https://kadenbilyeu.com"},
            cookies={"access_token": token},
        ):
            pass

    assert exc_info.value.code == 1013
    assert blacklist_lookups == []


@pytest.mark.asyncio
async def test_terminal_blacklist_lookup_holds_database_activity_lock(
    tmp_path,
    monkeypatch,
):
    activity_lock = tmp_path / "database.lock"
    monkeypatch.setattr(maintenance, "DATABASE_ACTIVITY_LOCK_PATH", activity_lock)
    monkeypatch.setattr(terminal, "is_maintenance_active", lambda: False)

    def blacklist_lookup(_token):
        probe_fd = os.open(activity_lock, os.O_CREAT | os.O_RDWR, 0o600)
        try:
            with pytest.raises(BlockingIOError):
                fcntl.flock(probe_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        finally:
            os.close(probe_fd)
        return False

    monkeypatch.setattr(terminal, "is_token_blacklisted", blacklist_lookup)

    assert await terminal._is_terminal_token_blacklisted("access-token") is False


@pytest.mark.asyncio
async def test_cancelled_terminal_blacklist_lookup_keeps_lock_until_worker_exits(
    tmp_path,
    monkeypatch,
):
    activity_lock = tmp_path / "database.lock"
    lookup_started = threading.Event()
    release_lookup = threading.Event()
    monkeypatch.setattr(maintenance, "DATABASE_ACTIVITY_LOCK_PATH", activity_lock)
    monkeypatch.setattr(terminal, "is_maintenance_active", lambda: False)

    def blocking_blacklist_lookup(_token):
        lookup_started.set()
        release_lookup.wait(timeout=2)
        return False

    monkeypatch.setattr(terminal, "is_token_blacklisted", blocking_blacklist_lookup)
    lookup_task = asyncio.create_task(
        terminal._is_terminal_token_blacklisted("access-token")
    )
    while not lookup_started.is_set():
        await asyncio.sleep(0.001)

    lookup_task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await lookup_task

    probe_fd = os.open(activity_lock, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        with pytest.raises(BlockingIOError):
            fcntl.flock(probe_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)

        release_lookup.set()
        for _ in range(100):
            try:
                fcntl.flock(probe_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                await asyncio.sleep(0.01)
        else:
            pytest.fail("Database activity lock was not released after lookup exited")
    finally:
        release_lookup.set()
        try:
            fcntl.flock(probe_fd, fcntl.LOCK_UN)
        finally:
            os.close(probe_fd)


def test_terminal_websocket_starts_ssh_for_authenticated_admin(monkeypatch):
    fake_pty = _FakePty()
    token = create_access_token({"sub": "admin"})
    monkeypatch.setattr(terminal, "_validate_terminal_files", lambda: None)
    monkeypatch.setattr(
        terminal.ptyprocess.PtyProcessUnicode,
        "spawn",
        lambda *args, **kwargs: fake_pty,
    )

    with client.websocket_connect(
        "/admin/terminal/ws",
        headers={"origin": "https://kadenbilyeu.com"},
        cookies={"access_token": token},
    ) as websocket:
        assert websocket.receive_text() == "terminal-ready"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "disconnect_immediately",
    [False, True],
    ids=["timeout", "disconnect"],
)
async def test_terminal_cleanup_releases_tasks_and_session_lock(
    tmp_path,
    monkeypatch,
    disconnect_immediately,
):
    fake_pty = _BlockingPty()
    websocket = _LifecycleWebSocket(disconnect_immediately)

    async def authenticate(_websocket):
        lifetime = 0.02 if not disconnect_immediately else 30
        return "test-access-token", datetime.now(timezone.utc) + timedelta(seconds=lifetime)

    monkeypatch.setattr(terminal, "_authenticate_terminal", authenticate)
    monkeypatch.setattr(terminal, "_validate_terminal_files", lambda: None)
    monkeypatch.setattr(terminal, "TERMINAL_LOCK_PATH", str(tmp_path / "terminal.lock"))
    monkeypatch.setattr(
        terminal,
        "TERMINAL_SESSION_MAX_SECONDS",
        30,
    )
    monkeypatch.setattr(
        terminal.ptyprocess.PtyProcessUnicode,
        "spawn",
        lambda *args, **kwargs: fake_pty,
    )

    await asyncio.wait_for(terminal.terminal_websocket(websocket), timeout=1)
    await asyncio.sleep(0)

    assert websocket.accepted
    assert fake_pty.stopped.is_set()
    if not disconnect_immediately:
        assert websocket.receive_cancelled
    terminal_coroutines = {
        task.get_coro().__qualname__
        for task in asyncio.all_tasks()
        if task is not asyncio.current_task()
    }
    assert not any(
        name.endswith(("read_from_pty", "write_to_pty", "watch_token_revocation"))
        for name in terminal_coroutines
    )

    next_session = terminal._TerminalSessionLock()
    assert next_session.acquire()
    next_session.release()


@pytest.mark.asyncio
async def test_terminal_cleanup_survives_pty_terminate_failure(tmp_path, monkeypatch):
    fake_pty = _FailingTerminatePty()
    websocket = _LifecycleWebSocket(disconnect_immediately=True)

    async def authenticate(_websocket):
        return "test-access-token", datetime.now(timezone.utc) + timedelta(minutes=5)

    monkeypatch.setattr(terminal, "_authenticate_terminal", authenticate)
    monkeypatch.setattr(terminal, "_validate_terminal_files", lambda: None)
    monkeypatch.setattr(terminal, "TERMINAL_LOCK_PATH", str(tmp_path / "terminal.lock"))
    monkeypatch.setattr(
        terminal.ptyprocess.PtyProcessUnicode,
        "spawn",
        lambda *args, **kwargs: fake_pty,
    )

    await asyncio.wait_for(terminal.terminal_websocket(websocket), timeout=1)
    await asyncio.sleep(0)

    assert fake_pty.stopped.is_set()
    terminal_coroutines = {
        task.get_coro().__qualname__
        for task in asyncio.all_tasks()
        if task is not asyncio.current_task()
    }
    assert not any(
        name.endswith(("read_from_pty", "write_to_pty", "watch_token_revocation"))
        for name in terminal_coroutines
    )
    next_session = terminal._TerminalSessionLock()
    assert next_session.acquire()
    next_session.release()


@pytest.mark.asyncio
async def test_terminal_periodically_closes_a_revoked_session(tmp_path, monkeypatch):
    fake_pty = _BlockingPty()
    websocket = _LifecycleWebSocket(disconnect_immediately=False)

    async def authenticate(_websocket):
        return "revoked-access-token", datetime.now(timezone.utc) + timedelta(minutes=5)

    maintenance_checks = 0
    blacklist_lookups = 0

    def maintenance_active():
        nonlocal maintenance_checks
        maintenance_checks += 1
        return maintenance_checks == 1

    def blacklist_lookup(_token):
        nonlocal blacklist_lookups
        blacklist_lookups += 1
        return True

    monkeypatch.setattr(terminal, "_authenticate_terminal", authenticate)
    monkeypatch.setattr(terminal, "_validate_terminal_files", lambda: None)
    monkeypatch.setattr(terminal, "TERMINAL_LOCK_PATH", str(tmp_path / "terminal.lock"))
    monkeypatch.setattr(terminal, "TERMINAL_TOKEN_RECHECK_SECONDS", 0.01)
    monkeypatch.setattr(terminal, "is_maintenance_active", maintenance_active)
    monkeypatch.setattr(terminal, "is_token_blacklisted", blacklist_lookup)
    monkeypatch.setattr(
        terminal.ptyprocess.PtyProcessUnicode,
        "spawn",
        lambda *args, **kwargs: fake_pty,
    )

    await asyncio.wait_for(terminal.terminal_websocket(websocket), timeout=1)

    assert (1008, "Token revoked") in websocket.close_calls
    assert fake_pty.stopped.is_set()
    assert maintenance_checks >= 3
    assert blacklist_lookups == 1
    next_session = terminal._TerminalSessionLock()
    assert next_session.acquire()
    next_session.release()
