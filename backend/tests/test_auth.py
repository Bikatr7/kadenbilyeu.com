import pytest
import os
import sys
from unittest.mock import patch
from datetime import timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

os.environ['ADMIN_USER'] = 'admin'
os.environ['ACCESS_TOKEN_SECRET'] = 'test_access_secret'
os.environ['REFRESH_TOKEN_SECRET'] = 'test_refresh_secret'
os.environ['JWT_ISSUER'] = 'test-issuer'
os.environ['JWT_AUDIENCE'] = 'test-audience'
os.environ['ENCRYPTION_KEY'] = 'test-encryption-key'
os.environ['WEBAUTHN_REGISTER_SECRET'] = 'test-webauthn-secret'

from auth import (
    create_access_token, create_refresh_token, verify_token,
    verify_refresh_token, get_current_user,
    is_token_blacklisted, get_token_from_cookie
)
from database import TokenData, func_add_token_to_blacklist, get_db, BlacklistedTokenModel
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone

import auth
import maintenance


class TestTokenFunctions:
    def test_create_access_token(self):
        data = {"sub": "testuser"}
        token = create_access_token(data)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_refresh_token(self):
        data = {"sub": "testuser"}
        token = create_refresh_token(data)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_verify_token_valid(self):
        data = {"sub": "testuser"}
        token = create_access_token(data)
        result = verify_token(token)
        assert isinstance(result, TokenData)
        assert result.username == "testuser"

    def test_verify_refresh_token_valid(self):
        data = {"sub": "testuser"}
        token = create_refresh_token(data)
        result = verify_refresh_token(token)
        assert isinstance(result, TokenData)
        assert result.username == "testuser"

    def test_verify_token_expired(self):
        data = {"sub": "testuser"}
        token = create_access_token(data, expires_delta=timedelta(seconds=-1))

        with pytest.raises(HTTPException) as exc_info:
            verify_token(token)
        assert exc_info.value.status_code == 401
        assert "Token expired" in str(exc_info.value.detail)

    def test_verify_token_invalid(self):
        with pytest.raises(HTTPException) as exc_info:
            verify_token("invalid_token")
        assert exc_info.value.status_code == 401
        assert "Invalid token" in str(exc_info.value.detail)


class TestTokenBlacklist:
    def setup_method(self):
        # Clear any existing blacklisted tokens for testing
        db = next(get_db())
        try:
            db.query(BlacklistedTokenModel).delete()
            db.commit()
        except:
            db.rollback()
        finally:
            db.close()

    def test_is_token_blacklisted_empty(self):
        assert not is_token_blacklisted("sometoken")

    def test_is_token_blacklisted_after_adding(self):
        # Add token to blacklist
        db = next(get_db())
        try:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
            func_add_token_to_blacklist(db, "blacklisted_token", expires_at)
            db.commit()
        finally:
            db.close()

        assert is_token_blacklisted("blacklisted_token")
        assert not is_token_blacklisted("other_token")


class TestTokenExtraction:
    def test_get_token_from_cookie_valid(self):
        result = get_token_from_cookie("valid_token")
        assert result == "valid_token"

    def test_get_token_from_cookie_none(self):
        with pytest.raises(HTTPException) as exc_info:
            get_token_from_cookie(None)
        assert exc_info.value.status_code == 401
        assert "Not authenticated" in str(exc_info.value.detail)

    def test_get_token_from_cookie_blacklisted(self):
        # Add token to blacklist
        db = next(get_db())
        try:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
            func_add_token_to_blacklist(db, "blacklisted_token", expires_at)
            db.commit()
        finally:
            db.close()

        with pytest.raises(HTTPException) as exc_info:
            get_token_from_cookie("blacklisted_token")
        assert exc_info.value.status_code == 401
        assert "Token has been revoked" in str(exc_info.value.detail)

    def test_cookie_blacklist_lookup_is_skipped_during_maintenance(
        self,
        tmp_path,
        monkeypatch,
    ):
        blacklist_lookups = []
        monkeypatch.setattr(
            maintenance,
            "MAINTENANCE_MARKER_PATH",
            tmp_path / "maintenance",
        )
        monkeypatch.setattr(
            maintenance,
            "MAINTENANCE_LOCK_PATH",
            tmp_path / "maintenance.lock",
        )
        monkeypatch.setattr(
            maintenance,
            "DATABASE_ACTIVITY_LOCK_PATH",
            tmp_path / "database.lock",
        )
        monkeypatch.setattr(
            auth,
            "is_token_blacklisted",
            lambda token: blacklist_lookups.append(token),
        )

        with maintenance.maintenance_window():
            with pytest.raises(HTTPException) as exc_info:
                auth.get_token_from_cookie("valid-token")

        assert exc_info.value.status_code == 503
        assert blacklist_lookups == []


class TestUserAuthentication:
    @patch('auth.verify_token')
    def test_get_current_user_valid(self, mock_verify):
        mock_verify.return_value = TokenData(username="admin")

        result = get_current_user("valid_token")
        assert result == "admin"
        mock_verify.assert_called_once_with("valid_token")

    @patch('auth.verify_token')
    def test_get_current_user_invalid(self, mock_verify):
        mock_verify.side_effect = HTTPException(status_code=401, detail="Invalid token")

        with pytest.raises(HTTPException) as exc_info:
            get_current_user("invalid_token")
        assert exc_info.value.status_code == 401
