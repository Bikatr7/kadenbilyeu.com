## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in libraries
import os
import typing

## third-party libraries
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, close_all_sessions, Session
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta

DATABASE_URL:str = "sqlite:///./blog.db"

Base:DeclarativeMeta = declarative_base()

engine:Engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal:sessionmaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def replace_sqlite_db(extracted_db_path:str, current_db_path:str) -> None:

    """

    Replace the current SQLite database with the extracted SQLite database.

    Args:
    extracted_db_path (str): The path to the extracted SQLite database

    current_db_path (str): The path to the current SQLite database
    
    """

    global engine, SessionLocal

    close_all_sessions()
    
    engine.dispose()
    
    os.replace(extracted_db_path, current_db_path)

    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> typing.Generator[Session, None, None]:
    
    """

    Get the database session.

    Returns:
    typing.Generator[Session, None, None]: The database session

    """

    db:Session = SessionLocal()
    
    try:
        yield db
    
    finally:
        db.close()