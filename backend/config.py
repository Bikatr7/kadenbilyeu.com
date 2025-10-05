## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import os
import threading

# Rate limiting configuration
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_env_variables() -> None:
    """
    Only used in development. This function reads the .env file and sets the environment variables.
    """

    if(not os.path.exists(".env")):
        return

    with open(".env") as f:
        for line in f:
            key, value = line.strip().split("=")
            os.environ[key] = value

get_env_variables()

# Global variables
maintenance_mode = False
maintenance_lock = threading.Lock()

# Environment variables
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")
ADMIN_USER = os.environ.get("ADMIN_USER")
ACCESS_TOKEN_SECRET = os.environ.get("ACCESS_TOKEN_SECRET")
REFRESH_TOKEN_SECRET = os.environ.get("REFRESH_TOKEN_SECRET")
WEBAUTHN_REGISTER_SECRET = os.environ.get("WEBAUTHN_REGISTER_SECRET")

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

# Cookie security settings
SECURE_COOKIES = ENVIRONMENT != "development"

# Token configuration
TOKEN_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes for access tokens
REFRESH_TOKEN_EXPIRE_MINUTES = 10080  # 7 days for refresh tokens
JWT_ISSUER = os.environ.get(
    "JWT_ISSUER",
    "http://api.localhost:5000" if ENVIRONMENT == "development" else "https://api.kadenbilyeu.com"
)
JWT_AUDIENCE = os.environ.get("JWT_AUDIENCE", "kadenbilyeu-admin")

# Rate limiting configuration
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Database configuration
if(not os.path.exists("database") and ADMIN_USER == "admin"):
    os.makedirs("database", exist_ok=True)

elif(not os.path.exists("database") and ADMIN_USER != "admin"):
    raise NotImplementedError("Database volume not attached and running in production mode, please exit and attach the volume")

DATABASE_URL: str = "sqlite:///./database/blog.db"
DATABASE_PATH: str = "database/blog.db"
BACKUP_LOGS_DIR = 'database/logs'

if(not os.path.exists(BACKUP_LOGS_DIR)):
    os.makedirs(BACKUP_LOGS_DIR, exist_ok=True)

# Validation
assert ADMIN_USER, "ADMIN_USER environment variable not set"
assert ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET environment variable not set"
assert REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET environment variable not set"
assert ENCRYPTION_KEY, "ENCRYPTION_KEY environment variable not set"
assert WEBAUTHN_REGISTER_SECRET, "WEBAUTHN_REGISTER_SECRET environment variable not set"
assert JWT_ISSUER, "JWT_ISSUER environment variable not set"
assert JWT_AUDIENCE, "JWT_AUDIENCE environment variable not set"

