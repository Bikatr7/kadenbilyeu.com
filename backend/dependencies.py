## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

from .database import SessionLocal
from sqlalchemy.orm import Session

def get_db():
    db:Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()