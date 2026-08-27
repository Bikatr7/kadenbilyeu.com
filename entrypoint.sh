#!/bin/sh

## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

set -eu

umask 077
export GNUPGHOME="${GNUPGHOME:-/tmp/gnupg}"
mkdir -p "${GNUPGHOME}"
chmod 700 "${GNUPGHOME}"

exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
