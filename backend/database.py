## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta

DATABASE_URL: str = "sqlite:///./blog.db"

Base:DeclarativeMeta = declarative_base()

engine:Engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal:sessionmaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)
