## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## Stage 1: Build backend
FROM python:3.11-slim

WORKDIR /app

# 1) Install Python deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 2) OS deps (gnupg, openssh-client)
RUN apt-get update \
 && apt-get install -y --no-install-recommends gnupg2 openssh-client \
 && rm -rf /var/lib/apt/lists/*

# 3) Copy ALL backend code into /app (not just main.py)
COPY backend/ ./

# 4) Ensure db dir exists (you still bind-mount it)
RUN mkdir -p /app/database/logs

# 5) Entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV PYTHONPATH=/app
EXPOSE 8000
VOLUME ["/app/database"]
CMD ["/app/entrypoint.sh"]