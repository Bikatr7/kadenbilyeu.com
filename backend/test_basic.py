#!/usr/bin/env python3
"""Basic test to verify imports and functionality."""

import os
import sys

# Set up environment variables
os.environ['ADMIN_USER'] = 'admin'
os.environ['ADMIN_PASS_HASH'] = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfLkIwFzI8zUeO'  # 'password'
os.environ['TOTP_SECRET'] = 'JBSWY3DPEHPK3PXP'
os.environ['ACCESS_TOKEN_SECRET'] = 'test_access_secret'
os.environ['REFRESH_TOKEN_SECRET'] = 'test_refresh_secret'
os.environ['CSRF_SECRET'] = 'test_csrf_secret'
os.environ['DATABASE_URL'] = 'sqlite:///./test_basic.db'

def test_imports():
    """Test that all modules can be imported."""
    try:
        import config
        import database
        import auth
        import utils
        from routes import auth as auth_routes
        from routes import blog as blog_routes
        from routes import admin as admin_routes
        print("✓ All imports successful")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

def test_token_creation():
    """Test token creation functionality."""
    try:
        from auth import create_access_token
        token = create_access_token({"sub": "testuser"})
        assert isinstance(token, str)
        assert len(token) > 0
        print("✓ Token creation works")
        return True
    except Exception as e:
        print(f"✗ Token creation failed: {e}")
        return False

def test_database_connection():
    """Test database connection."""
    try:
        from database import get_db
        db = next(get_db())
        db.close()
        print("✓ Database connection works")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def test_app_creation():
    """Test that the FastAPI app can be created."""
    try:
        import main
        assert hasattr(main, 'app')
        print("✓ FastAPI app creation works")
        return True
    except Exception as e:
        print(f"✗ App creation failed: {e}")
        return False

if __name__ == "__main__":
    print("Running basic tests...\n")

    results = []
    results.append(test_imports())
    results.append(test_token_creation())
    results.append(test_database_connection())
    results.append(test_app_creation())

    print(f"\nResults: {sum(results)}/{len(results)} tests passed")

    if all(results):
        print("🎉 All basic tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed")
        sys.exit(1)
