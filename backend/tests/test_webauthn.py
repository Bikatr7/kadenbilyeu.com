import os
import sys
from fastapi.testclient import TestClient
from unittest.mock import patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Ensure required envs for tokens
os.environ.setdefault('ADMIN_USER', 'admin')
os.environ.setdefault('ACCESS_TOKEN_SECRET', 'test_access_secret')
os.environ.setdefault('REFRESH_TOKEN_SECRET', 'test_refresh_secret')
os.environ.setdefault('JWT_ISSUER', 'test-issuer')
os.environ.setdefault('JWT_AUDIENCE', 'test-audience')
os.environ.setdefault('ENCRYPTION_KEY', 'test-encryption-key')
os.environ.setdefault('WEBAUTHN_REGISTER_SECRET', 'test-webauthn-secret')
os.environ.setdefault('DATABASE_URL', 'sqlite:///./test_webauthn.db')
os.environ.setdefault('ENVIRONMENT', 'testing')

from main import app

client = TestClient(app)


def _options_json_with_challenge():
    # Minimal options structure the frontend expects
    return '{"challenge":"dGVzdA"}'


class TestWebAuthnEndpoints:
    @patch('routes.webauthn.generate_webauthn_registration_options')
    def test_register_start(self, mock_gen):
        mock_gen.return_value = (_options_json_with_challenge(), b'test')
        resp = client.post('/webauthn/register/start', json={"password": 'test-webauthn-secret'})
        assert resp.status_code == 200
        data = resp.json()
        assert 'challenge_id' in data
        assert 'options' in data

    @patch('routes.webauthn.verify_webauthn_registration')
    @patch('routes.webauthn.get_challenge')
    def test_register_complete_success(self, mock_get_chal, mock_verify):
        mock_get_chal.return_value = 'dGVzdA'  # base64url('test')
        mock_verify.return_value = True
        resp = client.post('/webauthn/register/complete', json={
            'challenge_id': 'cid',
            'password': 'test-webauthn-secret',
            'credential': { 'id': 'id', 'rawId': 'cmF3', 'type': 'public-key', 'response': {} }
        })
        assert resp.status_code == 200
        assert 'WebAuthn credential registered successfully' in resp.json().get('message', '')
        mock_get_chal.assert_called_once_with('cid', 'registration')

    @patch('routes.webauthn.verify_webauthn_registration')
    @patch('routes.webauthn.get_challenge')
    def test_register_complete_failure(self, mock_get_chal, mock_verify):
        mock_get_chal.return_value = 'dGVzdA'
        mock_verify.return_value = False
        resp = client.post('/webauthn/register/complete', json={
            'challenge_id': 'cid',
            'password': 'test-webauthn-secret',
            'credential': { 'id': 'id', 'rawId': 'cmF3', 'type': 'public-key', 'response': {} }
        })
        assert resp.status_code == 400

    @patch('routes.webauthn.get_challenge')
    def test_register_complete_requires_password(self, mock_get_chal):
        resp = client.post('/webauthn/register/complete', json={
            'challenge_id': 'cid',
            'credential': { 'id': 'id', 'rawId': 'cmF3', 'type': 'public-key', 'response': {} }
        })
        assert resp.status_code == 403
        mock_get_chal.assert_not_called()

    @patch('routes.webauthn.verify_webauthn_registration')
    @patch('routes.webauthn.get_challenge')
    def test_register_complete_rejects_authentication_challenge(self, mock_get_chal, mock_verify):
        mock_get_chal.return_value = None
        resp = client.post('/webauthn/register/complete', json={
            'challenge_id': 'cid',
            'password': 'test-webauthn-secret',
            'credential': { 'id': 'id', 'rawId': 'cmF3', 'type': 'public-key', 'response': {} }
        })
        assert resp.status_code == 400
        mock_get_chal.assert_called_once_with('cid', 'registration')
        mock_verify.assert_not_called()

    @patch('routes.webauthn.generate_webauthn_authentication_options')
    def test_authenticate_start(self, mock_gen):
        mock_gen.return_value = (_options_json_with_challenge(), b'test')
        resp = client.post('/webauthn/authenticate/start')
        assert resp.status_code == 200
        data = resp.json()
        assert 'challenge_id' in data
        assert 'options' in data

    @patch('routes.webauthn.verify_webauthn_authentication')
    @patch('routes.webauthn.get_challenge')
    def test_authenticate_complete_success(self, mock_get_chal, mock_verify):
        mock_get_chal.return_value = 'dGVzdA'
        mock_verify.return_value = True
        resp = client.post('/webauthn/authenticate/complete', json={
            'challenge_id': 'cid',
            'credential': { 'id': 'id', 'rawId': 'cmF3', 'type': 'public-key', 'response': {} }
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body.get('token_type') == 'bearer'
        mock_get_chal.assert_called_once_with('cid', 'authentication')
        # Cookies should be set
        cookies = resp.cookies
        assert cookies.get('access_token') is not None
        assert cookies.get('refresh_token') is not None

    @patch('routes.webauthn.verify_webauthn_authentication')
    @patch('routes.webauthn.get_challenge')
    def test_authenticate_complete_failure(self, mock_get_chal, mock_verify):
        mock_get_chal.return_value = 'dGVzdA'
        mock_verify.return_value = False
        resp = client.post('/webauthn/authenticate/complete', json={
            'challenge_id': 'cid',
            'credential': { 'id': 'id', 'rawId': 'cmF3', 'type': 'public-key', 'response': {} }
        })
        assert resp.status_code == 401

    @patch('routes.webauthn.verify_webauthn_authentication')
    @patch('routes.webauthn.get_challenge')
    def test_authenticate_complete_rejects_registration_challenge(self, mock_get_chal, mock_verify):
        mock_get_chal.return_value = None
        resp = client.post('/webauthn/authenticate/complete', json={
            'challenge_id': 'cid',
            'credential': { 'id': 'id', 'rawId': 'cmF3', 'type': 'public-key', 'response': {} }
        })
        assert resp.status_code == 400
        mock_get_chal.assert_called_once_with('cid', 'authentication')
        mock_verify.assert_not_called()

