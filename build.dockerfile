## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## Stage 1: Build backend
FROM python:3.11.8-slim as backend-build
WORKDIR /app/backend

## Copy necessary backend files
COPY backend/main.py backend/requirements.txt backend/constants.py backend/backup.py backend/auth.py ./
COPY backend/database/ /app/backend/database/

## Install required Python packages
RUN pip install --no-cache-dir -r requirements.txt

## Install required packages (linux)
FROM python:3.11.8-slim
WORKDIR /app

## Install required packages (linux)
RUN apt-get update && apt-get install -y --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

## Copy backend from the previous stage
COPY --from=backend-build /app/backend /app/backend

## Install required Python packages
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

## Copy entrypoint script and make it executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

## Expose port 8000
EXPOSE 8000

## Start the app
CMD ["/app/entrypoint.sh"]