import os
import sys

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

os.environ.setdefault('ADMIN_USER', 'admin')
os.environ.setdefault('ACCESS_TOKEN_SECRET', 'test_access_secret')
os.environ.setdefault('REFRESH_TOKEN_SECRET', 'test_refresh_secret')
os.environ.setdefault('JWT_ISSUER', 'test-issuer')
os.environ.setdefault('JWT_AUDIENCE', 'test-audience')
os.environ.setdefault('ENCRYPTION_KEY', 'test-encryption-key')
os.environ.setdefault('WEBAUTHN_REGISTER_SECRET', 'test-webauthn-secret')
os.environ.setdefault('DATABASE_URL', 'sqlite:///./test_terminal.db')
os.environ.setdefault('ENVIRONMENT', 'testing')

from auth import create_access_token
from main import app

client = TestClient(app)


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
