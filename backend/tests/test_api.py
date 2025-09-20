import os
import sys
from fastapi.testclient import TestClient
from unittest.mock import patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

os.environ['ADMIN_USER'] = 'admin'
os.environ['ADMIN_PASS_HASH'] = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfLkIwFzI8zUeO'
os.environ['TOTP_SECRET'] = 'JBSWY3DPEHPK3PXP'
os.environ['ACCESS_TOKEN_SECRET'] = 'test_access_secret'
os.environ['REFRESH_TOKEN_SECRET'] = 'test_refresh_secret'
os.environ['CSRF_SECRET'] = 'test_csrf_secret'
os.environ['DATABASE_URL'] = 'sqlite:///./test_api.db'

from main import app

client = TestClient(app)


class TestAuthEndpoints:
    def test_api_home(self):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "API is running"}

    def test_auth_check_unauthenticated(self):
        response = client.get("/auth/check")
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] == False

    @patch('pyotp.TOTP.verify')
    def test_login_success(self, mock_totp_verify):
        mock_totp_verify.return_value = True

        response = client.post("/login", json={
            "username": "admin",
            "password": "password",
            "totp": "123456"
        })

        assert response.status_code == 200
        data = response.json()
        assert "Login successful" in data["message"]
        assert data["token_type"] == "bearer"

        assert "access_token" in response.cookies
        assert "refresh_token" in response.cookies

    def test_login_invalid_credentials(self):
        response = client.post("/login", json={
            "username": "admin",
            "password": "wrongpassword",
            "totp": "123456"
        })

        assert response.status_code == 401

    @patch('pyotp.TOTP.verify')
    def test_login_invalid_totp(self, mock_totp_verify):
        mock_totp_verify.return_value = False

        response = client.post("/login", json={
            "username": "admin",
            "password": "password",
            "totp": "123456"
        })

        assert response.status_code == 401

    def test_logout(self):
        response = client.post("/logout")
        assert response.status_code == 200
        assert "Logged out successfully" in response.json()["message"]

    def test_csrf_token_endpoint(self):
        response = client.get("/csrf-token")
        assert response.status_code == 200
        data = response.json()
        assert "csrf_token" in data
        assert isinstance(data["csrf_token"], (str, list))

    def test_refresh_token_no_token(self):
        response = client.post("/refresh")
        assert response.status_code == 400
        assert "No refresh token provided" in response.json()["detail"]


class TestBlogEndpoints:
    def test_get_blog_posts(self):
        response = client.get("/blog")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_latest_blogs(self):
        response = client.get("/latest-blogs")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_blog_count(self):
        response = client.get("/blog-count")
        assert response.status_code == 200
        assert isinstance(response.json(), int)

    def test_get_all_blogs(self):
        response = client.get("/all-blogs")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_create_blog_post_unauthenticated(self):
        response = client.post("/blog", json={
            "title": "Test Post",
            "content": "Test content",
            "author": "Test Author"
        })
        assert response.status_code == 401

    def test_get_blog_post_not_found(self):
        from uuid import uuid4
        response = client.get(f"/blog/{uuid4()}")
        assert response.status_code == 404

    def test_update_blog_post_unauthenticated(self):
        from uuid import uuid4
        response = client.put(f"/blog/{uuid4()}", json={
            "title": "Updated Title"
        })
        assert response.status_code == 401

    def test_delete_blog_post_unauthenticated(self):
        from uuid import uuid4
        response = client.delete(f"/blog/{uuid4()}")
        assert response.status_code == 401


class TestAdminEndpoints:
    def test_replace_database_unauthenticated(self):
        response = client.post("/replace-database")
        assert response.status_code == 401

    def test_force_backup_unauthenticated(self):
        response = client.post("/force-backup")
        assert response.status_code == 401


class TestRateLimiting:
    def test_login_rate_limiting(self):
        responses = []
        for i in range(10):
            response = client.post("/login", json={
                "username": "admin",
                "password": "wrong",
                "totp": "123456"
            })
            responses.append(response)

        rate_limited_responses = [r for r in responses if r.status_code == 429]
        assert len(rate_limited_responses) > 0


class TestCORS:
    def test_cors_headers(self):
        response = client.options("/", headers={
            "Origin": "https://kadenbilyeu.com",
            "Access-Control-Request-Method": "GET"
        })

        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-credentials" in response.headers