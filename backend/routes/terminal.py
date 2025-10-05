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

router = APIRouter()

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

    def is_valid_origin(origin_host: str, allowed_domain: str) -> bool:
        """Check if origin is exact match or valid subdomain"""
        return origin_host == allowed_domain or origin_host.endswith('.' + allowed_domain)

    try:
        origin = websocket.headers.get("origin", "")
        origin_host = origin.split("//", 1)[-1].split('/')[0]  # Extract just the host:port
        allowed_origins = (
            "localhost:5173",
            "kadenbilyeu.com",
            "bikatr7.com",
            "kadenbilyeu-com.pages.dev",
            "bikatr7.pages.dev",
        )
        if not any(is_valid_origin(origin_host, allowed) for allowed in allowed_origins):
            print(f"[TERMINAL] ❌ Disallowed WS Origin: {origin}")
            await websocket.close(code=1008, reason="Origin not allowed")
            return
    except Exception as e:
        print(f"[TERMINAL] ❌ Origin check error: {str(e)}")
        await websocket.close(code=1008, reason="Origin check failed")
        return

    # Verify auth token from cookies
    try:
        print(f"[TERMINAL] New WebSocket connection attempt")
        cookies = websocket.cookies
        print(f"[TERMINAL] Cookies received: {list(cookies.keys())}")

        access_token = cookies.get("access_token")
        if not access_token:
            print(f"[TERMINAL] ❌ No access_token cookie found")
            await websocket.close(code=1008, reason="Not authenticated")
            return

        print(f"[TERMINAL] Access token found, checking blacklist")
        if is_token_blacklisted(access_token):
            print(f"[TERMINAL] ❌ Token is blacklisted")
            await websocket.close(code=1008, reason="Token revoked")
            return

        print(f"[TERMINAL] Verifying token")
        token_data = verify_token(access_token)
        if not token_data or not token_data.username:
            print(f"[TERMINAL] ❌ Invalid token data")
            await websocket.close(code=1008, reason="Invalid token")
            return

        print(f"[TERMINAL] ✅ Authentication successful for user: {token_data.username}")
    except Exception as e:
        print(f"[TERMINAL] ❌ Authentication error: {str(e)}")
        import traceback
        traceback.print_exc()
        await websocket.close(code=1008, reason="Authentication failed")
        return

    await websocket.accept()
    print(f"[TERMINAL] WebSocket connection accepted")

    # Spawn SSH process to connect to host
    try:
        print(f"[TERMINAL] Starting SSH connection to host.docker.internal")
        ssh_command = [
            "ssh",
            "-o", "StrictHostKeyChecking=accept-new",
            "-o", "UserKnownHostsFile=/dev/null",
            "-i", "/root/.ssh/id_ed25519",
            "kbilyeu@host.docker.internal"
        ]

        print(f"[TERMINAL] SSH command: {' '.join(ssh_command)}")

        # Spawn PTY process
        pty_process = ptyprocess.PtyProcessUnicode.spawn(
            ssh_command,
            dimensions=(24, 80)  # default terminal size
        )
        print(f"[TERMINAL] PTY process spawned successfully")

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
                        print(f"Error reading from PTY: {e}")
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
                        print(f"[TERMINAL] Received data from WebSocket: {data}")

                        if "text" in data and data["text"] is not None:
                            text_payload = data["text"]

                            if text_payload and text_payload.startswith("{"):
                                try:
                                    json_data = json.loads(text_payload)
                                    if json_data.get("type") == "resize":
                                        rows = int(json_data.get("rows", 24))
                                        cols = int(json_data.get("cols", 80))
                                        print(f"[TERMINAL] Resizing terminal to {rows}x{cols}")
                                        pty_process.setwinsize(rows, cols)
                                        continue
                                except Exception:
                                    pass

                            print(f"[TERMINAL] Writing text to PTY: {repr(text_payload)}")
                            await asyncio.to_thread(pty_process.write, text_payload)

                        elif "bytes" in data and data["bytes"] is not None:
                            print(f"[TERMINAL] Writing bytes to PTY")
                            try:
                                decoded = data["bytes"].decode('utf-8', errors='ignore')
                            except Exception:
                                decoded = ""
                            if decoded:
                                await asyncio.to_thread(pty_process.write, decoded)
                    except WebSocketDisconnect:
                        print(f"[TERMINAL] WebSocket disconnected")
                        break
                    except Exception as e:
                        print(f"[TERMINAL] Error writing to PTY: {e}")
                        import traceback
                        traceback.print_exc()
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
        print(error_msg)
        try:
            await websocket.send_text(f"\r\n\033[31m{error_msg}\033[0m\r\n")
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass
