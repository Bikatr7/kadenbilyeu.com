## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import os
from urllib.parse import urlsplit


DEFAULT_ALLOWED_ADMIN_ORIGINS = {
    "https://kadenbilyeu.com",
    "https://bikatr7.com",
    "http://localhost:5173",
}


def normalized_origin(origin: str) -> str | None:
    try:
        parsed = urlsplit(origin)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            return None
        if parsed.username or parsed.password or parsed.path not in {"", "/"}:
            return None
        if parsed.query or parsed.fragment:
            return None

        host = parsed.hostname.lower()
        port = parsed.port
        if (parsed.scheme == "https" and port in {None, 443}) or (
            parsed.scheme == "http" and port in {None, 80}
        ):
            return f"{parsed.scheme}://{host}"
        return f"{parsed.scheme}://{host}:{port}"
    except ValueError:
        return None


def is_admin_origin_allowed(origin: str, env_variable: str) -> bool:
    configured = os.getenv(env_variable)
    values = configured.split(",") if configured else DEFAULT_ALLOWED_ADMIN_ORIGINS
    allowed = {
        normalized
        for value in values
        if (normalized := normalized_origin(value.strip())) is not None
    }
    normalized = normalized_origin(origin)
    return normalized is not None and normalized in allowed
