## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## Stage 1: Build backend
FROM python:3.11-slim

ARG APP_UID=10001
ARG APP_GID=10001

WORKDIR /app

# 1) Install Python deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 2) OS deps
RUN apt-get update \
 && apt-get install -y --no-install-recommends gnupg2 openssh-client \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --gid "${APP_GID}" app \
 && useradd --uid "${APP_UID}" --gid "${APP_GID}" --home-dir /app --no-create-home --shell /usr/sbin/nologin app

# 3) Copy ALL backend code into /app (not just main.py)
COPY --chown=app:app backend/ ./

# 4) Ensure db dir exists (you still bind-mount it)
RUN install -d -o app -g app -m 0750 /app/database /app/database/logs

# 5) Entrypoint
COPY --chown=app:app entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV PYTHONPATH=/app \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/app \
    GNUPGHOME=/tmp/gnupg
EXPOSE 8000
VOLUME ["/app/database"]
USER ${APP_UID}:${APP_GID}
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=2).read()"]
CMD ["/app/entrypoint.sh"]
