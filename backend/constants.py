## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in libraries
import os

def get_env_variables() -> None:

    """

    Only used in development. This function reads the .env file and sets the environment variables.

    """

    if(not os.path.exists(".env")):
        raise NotImplementedError("There is no env found. If production please set the environment variables. Otherwise, run 'setup.py local'")

    with open(".env") as f:
        for line in f:
            key, value = line.strip().split("=")
            os.environ[key] = value

TURNSTILE_SECRET_KEY = os.environ.get("TURNSTILE_SECRET_KEY")
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")
ADMIN_USER = os.environ.get("ADMIN_USER")
ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH")
TOTP_SECRET = os.environ.get("TOTP_SECRET")
ACCESS_TOKEN_SECRET = os.environ.get("ACCESS_TOKEN_SECRET")
REFRESH_TOKEN_SECRET = os.environ.get("REFRESH_TOKEN_SECRET")

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

TOKEN_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440

if(not any([ADMIN_USER, ADMIN_PASS_HASH, TOTP_SECRET, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ENCRYPTION_KEY])):
    get_env_variables()
    ADMIN_USER = os.environ.get("ADMIN_USER")
    ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH")
    TOTP_SECRET = os.environ.get("TOTP_SECRET")
    ACCESS_TOKEN_SECRET = os.environ.get("ACCESS_TOKEN_SECRET")
    REFRESH_TOKEN_SECRET = os.environ.get("REFRESH_TOKEN_SECRET")
    ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")

assert ADMIN_USER, "ADMIN_USER environment variable not set"
assert ADMIN_PASS_HASH, "ADMIN_PASS_HASH environment variable not set"
assert TOTP_SECRET, "TOTP_SECRET environment variable not set"
assert ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET environment variable not set"
assert REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET environment variable not set"
assert ENCRYPTION_KEY, "ENCRYPTION_KEY environment variable not set"