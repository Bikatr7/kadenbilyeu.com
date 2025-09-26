import pytest
import os
import sys
from unittest.mock import patch
from datetime import timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

os.environ['ADMIN_USER'] = 'admin'
os.environ['ADMIN_PASS_HASH'] = '$2b$12$MlPMcgDvVCU.s10xcB2fneIjZ/ymgz5O52yH5pshAFF5.bwPq4SMq'
os.environ['TOTP_SECRET'] = 'JBSWY3DPEHPK3PXP'
os.environ['ACCESS_TOKEN_SECRET'] = 'test_access_secret'
os.environ['REFRESH_TOKEN_SECRET'] = 'test_refresh_secret'
os.environ['JWT_ISSUER'] = 'test-issuer'
os.environ['JWT_AUDIENCE'] = 'test-audience'
os.environ['ENCRYPTION_KEY'] = 'test-encryption-key'
os.environ['WEBAUTHN_REGISTER_SECRET'] = 'test-webauthn-secret'

from auth import (
    create_access_token, create_refresh_token, verify_token,
    verify_refresh_token,
    verify_credentials, verify_totp, get_current_user,
    is_token_blacklisted, get_token_from_cookie
)
from database import TokenData
from fastapi import HTTPException
from fastapi.security import HTTPBasicCredentials


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


class TestCredentialVerification:
    def test_verify_credentials_valid(self):
        credentials = HTTPBasicCredentials(username="admin", password="password")
        verify_credentials(credentials)

    def test_verify_credentials_invalid_username(self):
        credentials = HTTPBasicCredentials(username="wronguser", password="password")
        with pytest.raises(HTTPException) as exc_info:
            verify_credentials(credentials)
        assert exc_info.value.status_code == 401

    def test_verify_credentials_invalid_password(self):
        credentials = HTTPBasicCredentials(username="admin", password="wrongpassword")
        with pytest.raises(HTTPException) as exc_info:
            verify_credentials(credentials)
        assert exc_info.value.status_code == 401


class TestTOTPVerification:
    def test_verify_totp_valid(self):
        with patch('pyotp.TOTP.verify', return_value=True):
            verify_totp("123456")

    def test_verify_totp_invalid(self):
        with patch('pyotp.TOTP.verify', return_value=False):
            with pytest.raises(HTTPException) as exc_info:
                verify_totp("123456")
            assert exc_info.value.status_code == 401


class TestTokenBlacklist:
    def setup_method(self):
        from auth import token_blacklist
        token_blacklist.clear()

    def test_is_token_blacklisted_empty(self):
        assert not is_token_blacklisted("sometoken")

    def test_is_token_blacklisted_after_adding(self):
        from auth import token_blacklist
        token_blacklist.add("blacklisted_token")
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
        from auth import token_blacklist
        token_blacklist.add("blacklisted_token")

        with pytest.raises(HTTPException) as exc_info:
            get_token_from_cookie("blacklisted_token")
        assert exc_info.value.status_code == 401
        assert "Token has been revoked" in str(exc_info.value.detail)


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