import pytest
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up environment variables for testing."""
    os.environ.setdefault('ADMIN_USER', 'admin')
    os.environ.setdefault('ADMIN_PASS_HASH', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfLkIwFzI8zUeO')  # 'password'
    os.environ.setdefault('TOTP_SECRET', 'JBSWY3DPEHPK3PXP')
    os.environ.setdefault('ACCESS_TOKEN_SECRET', 'test_access_secret')
    os.environ.setdefault('REFRESH_TOKEN_SECRET', 'test_refresh_secret')
    os.environ.setdefault('JWT_ISSUER', 'test-issuer')
    os.environ.setdefault('JWT_AUDIENCE', 'test-audience')
    os.environ.setdefault('ENCRYPTION_KEY', 'test-encryption-key')
    os.environ.setdefault('WEBAUTHN_REGISTER_SECRET', 'test-webauthn-secret')
    os.environ.setdefault('CSRF_SECRET', 'test_csrf_secret')
    os.environ.setdefault('DATABASE_URL', 'sqlite:///./test.db')
    os.environ.setdefault('ENVIRONMENT', 'testing')


@pytest.fixture(autouse=True)
def mock_csrf_validation():
    """Mock CSRF validation for all tests."""
    from unittest.mock import AsyncMock, patch
    with patch('fastapi_csrf_protect.CsrfProtect.validate_csrf', new_callable=AsyncMock) as mock_validate:
        mock_validate.return_value = None  # No exception raised
        yield mock_validate

