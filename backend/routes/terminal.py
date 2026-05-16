## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import asyncio
import os
import struct
import json
import ptyprocess
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from auth import verify_token, is_token_blacklisted
from config import ADMIN_USER
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/admin/terminal/ws")
async def terminal_websocket(
    websocket: WebSocket
):
    """
    WebSocket endpoint for web-based terminal access to the homelab host.
    Uses SSH to connect to host.docker.internal as kbilyeu user.

    Args:
        websocket (WebSocket): The WebSocket connection
    """

    def normalize_hostport(hostport: str) -> str:
        hostport = hostport.lower()
        if hostport.endswith(":443"):
            return hostport[:-4]
        if hostport.endswith(":80"):
            return hostport[:-3]
        return hostport

    try:
        origin = websocket.headers.get("origin", "")
        origin_host = origin.split("//", 1)[-1].split('/')[0]  # Extract just the host:port
        origin_host = normalize_hostport(origin_host)

        allowed_hosts = {
            "localhost:5173",
            "localhost",
            "kadenbilyeu.com",
            "bikatr7.com",
        }
        if origin_host not in allowed_hosts:
            logger.warning(f"[TERMINAL] Disallowed WS Origin: {origin}")
            await websocket.close(code=1008, reason="Origin not allowed")
            return
    except Exception as e:
        logger.exception(f"[TERMINAL] Origin check error: {str(e)}")
        await websocket.close(code=1008, reason="Origin check failed")
        return

    # Verify auth token from cookies
    try:
        logger.info(f"[TERMINAL] New WebSocket connection attempt")
        cookies = websocket.cookies
        logger.debug(f"[TERMINAL] Cookies received: {list(cookies.keys())}")

        access_token = cookies.get("access_token")
        if not access_token:
            logger.warning(f"[TERMINAL] No access_token cookie found")
            await websocket.close(code=1008, reason="Not authenticated")
            return

        logger.debug(f"[TERMINAL] Access token found, checking blacklist")
        if is_token_blacklisted(access_token):
            logger.warning(f"[TERMINAL] Token is blacklisted")
            await websocket.close(code=1008, reason="Token revoked")
            return

        logger.debug(f"[TERMINAL] Verifying token")
        token_data = verify_token(access_token)
        if not token_data or token_data.username != ADMIN_USER:
            logger.warning(f"[TERMINAL] Invalid token data")
            await websocket.close(code=1008, reason="Invalid token")
            return

        logger.info(f"[TERMINAL] Authentication successful for user: {token_data.username}")
    except Exception as e:
        logger.exception(f"[TERMINAL] Authentication error: {str(e)}")
        await websocket.close(code=1008, reason="Authentication failed")
        return

    await websocket.accept()
    logger.info(f"[TERMINAL] WebSocket connection accepted")

    # Spawn SSH process to connect to host
    try:
        logger.info(f"[TERMINAL] Starting SSH connection to host.docker.internal")
        ssh_command = [
            "ssh",
            "-o", "StrictHostKeyChecking=accept-new",
            "-o", "UserKnownHostsFile=/dev/null",
            "-i", "/root/.ssh/id_ed25519",
            "kbilyeu@host.docker.internal"
        ]

        logger.debug(f"[TERMINAL] SSH command: {' '.join(ssh_command)}")

        # Spawn PTY process with terminal env
        env = os.environ.copy()
        env.setdefault("TERM", "xterm-256color")
        env.setdefault("COLORTERM", "truecolor")
        pty_process = ptyprocess.PtyProcessUnicode.spawn(
            ssh_command,
            dimensions=(24, 80),  # default terminal size
            env=env
        )
        logger.info(f"[TERMINAL] PTY process spawned successfully")

        # Task for reading from PTY and sending to WebSocket
        async def read_from_pty():
            try:
                while pty_process.isalive():
                    try:
                        output = await asyncio.to_thread(pty_process.read, 1024)
                        if output:
                            await websocket.send_text(output)
                        else:
                            await asyncio.sleep(0.01)
                    except EOFError:
                        break
                    except Exception as e:
                        logger.warning(f"Error reading from PTY: {e}")
                        break
            finally:
                if pty_process.isalive():
                    pty_process.terminate(force=True)

        # Task for reading from WebSocket and writing to PTY
        async def write_to_pty():
            try:
                while True:
                    try:
                        data = await websocket.receive()
                        logger.debug(f"[TERMINAL] Received data from WebSocket: {data}")

                        if "text" in data and data["text"] is not None:
                            text_payload = data["text"]

                            if text_payload and text_payload.startswith("{"):
                                try:
                                    json_data = json.loads(text_payload)
                                    if json_data.get("type") == "resize":
                                        rows = int(json_data.get("rows", 24))
                                        cols = int(json_data.get("cols", 80))
                                        logger.debug(f"[TERMINAL] Resizing terminal to {rows}x{cols}")
                                        pty_process.setwinsize(rows, cols)
                                        continue
                                except Exception:
                                    pass

                            logger.debug(f"[TERMINAL] Writing text to PTY: {repr(text_payload)}")
                            await asyncio.to_thread(pty_process.write, text_payload)

                        elif "bytes" in data and data["bytes"] is not None:
                            logger.debug(f"[TERMINAL] Writing bytes to PTY")
                            try:
                                decoded = data["bytes"].decode('utf-8', errors='ignore')
                            except Exception:
                                decoded = ""
                            if decoded:
                                await asyncio.to_thread(pty_process.write, decoded)
                    except WebSocketDisconnect:
                        logger.info(f"[TERMINAL] WebSocket disconnected")
                        break
                    except Exception as e:
                        logger.warning(f"[TERMINAL] Error writing to PTY: {e}")
                        break
            finally:
                if pty_process.isalive():
                    pty_process.terminate(force=True)

        # Run both tasks concurrently
        await asyncio.gather(
            read_from_pty(),
            write_to_pty(),
            return_exceptions=True
        )

    except Exception as e:
        error_msg = f"Terminal error: {str(e)}"
        logger.exception(error_msg)
        try:
            await websocket.send_text(f"\r\n\033[31m{error_msg}\033[0m\r\n")
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass
