import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

os.environ['ADMIN_USER'] = 'admin'
os.environ['ACCESS_TOKEN_SECRET'] = 'test_access_secret'
os.environ['REFRESH_TOKEN_SECRET'] = 'test_refresh_secret'
os.environ['JWT_ISSUER'] = 'test-issuer'
os.environ['JWT_AUDIENCE'] = 'test-audience'
os.environ['ENCRYPTION_KEY'] = 'test-encryption-key'
os.environ['WEBAUTHN_REGISTER_SECRET'] = 'test-webauthn-secret'
os.environ['DATABASE_URL'] = 'sqlite:///./test_api.db'
os.environ['ENVIRONMENT'] = 'testing'

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

    def test_logout(self):
        response = client.post("/logout")
        assert response.status_code == 200
        assert "Logged out successfully" in response.json()["message"]

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


class TestCORS:
    def test_cors_headers(self):
        response = client.options("/", headers={
            "Origin": "https://kadenbilyeu.com",
            "Access-Control-Request-Method": "GET"
        })

        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-credentials" in response.headers