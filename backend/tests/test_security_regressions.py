import os
import sys
from datetime import datetime, timedelta, timezone

import jwt
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ACCESS_TOKEN_SECRET", "test_access_secret")
os.environ.setdefault("REFRESH_TOKEN_SECRET", "test_refresh_secret")
os.environ.setdefault("JWT_ISSUER", "test-issuer")
os.environ.setdefault("JWT_AUDIENCE", "test-audience")
os.environ.setdefault("ENCRYPTION_KEY", "test-encryption-key")
os.environ.setdefault("WEBAUTHN_REGISTER_SECRET", "test-webauthn-secret")
os.environ.setdefault("ENVIRONMENT", "testing")

from auth import create_access_token
from config import ACCESS_TOKEN_SECRET
from main import app
from routes.auth import _get_verified_expiry


def _route_paths(routes):
    for route in routes:
        path = getattr(route, "path", None)
        if path is not None:
            yield path

        original_router = getattr(route, "original_router", None)
        if original_router is not None:
            yield from _route_paths(original_router.routes)


def test_admin_route_registration_matches_supported_features():
    paths = set(_route_paths(app.routes))

    assert "/auth/check" in paths
    assert "/healthz" in paths
    assert "/replace-database" in paths
    assert "/replace-database/" not in paths
    assert "/admin/terminal/ws" in paths


def test_logout_expiry_parser_accepts_valid_signed_access_token():
    token = create_access_token({"sub": "admin"}, expires_delta=timedelta(minutes=5))

    expiry = _get_verified_expiry(token, ACCESS_TOKEN_SECRET, "access")

    assert expiry > datetime.now(timezone.utc)


def test_logout_expiry_parser_rejects_forged_token():
    forged = jwt.encode(
        {
            "sub": "admin",
            "exp": datetime.now(timezone.utc) + timedelta(days=1),
            "token_type": "access",
            "iss": "test-issuer",
            "aud": "test-audience",
        },
        "attacker-controlled-key",
        algorithm="HS256",
    )

    with pytest.raises(jwt.InvalidTokenError):
        _get_verified_expiry(forged, ACCESS_TOKEN_SECRET, "access")
