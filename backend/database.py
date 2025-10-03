## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import typing
import os
import shutil
import re

from uuid import UUID as schemaUUID, uuid4
from datetime import datetime, timezone

from pydantic import BaseModel

from sqlalchemy import create_engine, Engine, Column, String, Text, DateTime, inspect, Inspector, Integer, text, LargeBinary
from sqlalchemy.orm import sessionmaker, close_all_sessions, Session
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta
from sqlalchemy.dialects.postgresql import UUID as modelUUID

from config import DATABASE_URL, BACKUP_LOGS_DIR

## Pydantic models
class LoginToken(BaseModel):
    access_token:str
    token_type:str
    refresh_token:str

class TokenData(BaseModel):
    username:str

class BlogPostBase(BaseModel):
    title:str
    content:str
    author:str

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BaseModel):
    title:typing.Optional[str] = None
    content:typing.Optional[str] = None
    author:typing.Optional[str] = None

class BlogPostRead(BlogPostBase):
    id:schemaUUID
    created_at:datetime
    updated_at:datetime
    view_count:int

    class Config:
        orm_mode = True

class WebAuthnCredentialBase(BaseModel):
    credential_id: str
    public_key: bytes
    sign_count: int = 0
    user_id: str = "admin"

class WebAuthnCredentialCreate(WebAuthnCredentialBase):
    pass

class WebAuthnCredentialRead(WebAuthnCredentialBase):
    id: schemaUUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

## SQLAlchemy setup
Base:DeclarativeMeta = declarative_base()

class BlogPostModel(Base):
    __tablename__ = "blog_posts"
    id = Column(modelUUID(as_uuid=True), primary_key=True, index=True, default=uuid4)
    title = Column(String, index=True)
    content = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    view_count = Column(Integer, default=0)

class WebAuthnCredentialModel(Base):
    __tablename__ = "webauthn_credentials"
    id = Column(modelUUID(as_uuid=True), primary_key=True, index=True, default=uuid4)
    credential_id = Column(String, unique=True, index=True, nullable=False)
    public_key = Column(LargeBinary, nullable=False)
    sign_count = Column(Integer, default=0)
    user_id = Column(String, default="admin")
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

## Database migration functions
def migrate_database(engine:Engine) -> None:
    """
    Performs database migrations if needed.
    """

    inspector = inspect(engine)

    inspector.clear_cache()

    ## Migration 1 (2024-08-14) (Addition of view_count to blog_posts)
    try:
        blog_columns = [col['name'].lower() for col in inspector.get_columns('blog_posts')]

        print(f"Current columns in blog_posts: {blog_columns}")

        if 'view_count' not in blog_columns:
            print("view_count column not found. Attempting to add it.")
            with engine.connect() as connection:
                connection.execute(text("ALTER TABLE blog_posts ADD COLUMN view_count INTEGER DEFAULT 0"))
                connection.commit()

            print("Added view_count column to blog_posts table")
        else:
            print("view_count column already exists in blog_posts table")

        inspector.clear_cache()

        ## Migration 2 (2024-11-01) Ensure webauthn_credentials has updated_at column
        webauthn_columns = [col['name'].lower() for col in inspector.get_columns('webauthn_credentials')]
        print(f"Current columns in webauthn_credentials: {webauthn_columns}")

        if 'updated_at' not in webauthn_columns:
            print("updated_at column missing in webauthn_credentials. Attempting to add it.")
            with engine.connect() as connection:
                connection.execute(
                    text(
                        "ALTER TABLE webauthn_credentials "
                        "ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP"
                    )
                )
                connection.commit()
            print("Added updated_at column to webauthn_credentials table")
        else:
            print("updated_at column already exists in webauthn_credentials table")

    except Exception as e:
        print(f"Error during migration: {str(e)}")

## Database connection
engine:Engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal:sessionmaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables_if_not_exist(engine, base:DeclarativeMeta) -> None:
    inspector:Inspector = inspect(engine)
    for table_name in base.metadata.tables.keys():
        if(not inspector.has_table(table_name)):
            base.metadata.tables[table_name].create(engine)

create_tables_if_not_exist(engine, Base)
migrate_database(engine)

## Database utility functions
def get_envs() -> typing.Tuple[str, str, int, str, str, str, str, bool]:
    """
    Get the environment variables from the .env file

    Returns:
    ENCRYPTION_KEY (str): The encryption key to encrypt/decrypt the database
    SMTP_SERVER (str): The SMTP server to send the email
    SMTP_PORT (int): The SMTP port to send the email
    SMTP_USER (str): The SMTP user to send the email
    SMTP_PASSWORD (str): The SMTP password to send the email
    FROM_EMAIL (str): The email address to send the email from
    TO_EMAIL (str): The email address to send the email to
    ENABLE_BACKUP_EMAILS (bool): Whether to enable backup emails (default: True)
    """

    if(os.path.exists(".env")):
        with open(".env", "r") as f:
            for line in f:
                key, value = line.strip().split("=")
                os.environ[key] = value

    ENCRYPTION_KEY:str = os.getenv('ENCRYPTION_KEY') or ""
    SMTP_SERVER:str = os.getenv('SMTP_SERVER') or ""
    SMTP_PORT:int = int(os.getenv('SMTP_PORT') or 0)
    SMTP_USER = os.getenv('SMTP_USER') or ""
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD') or ""
    FROM_EMAIL = os.getenv('FROM_EMAIL') or ""
    TO_EMAIL = os.getenv('TO_EMAIL') or ""

    ENABLE_BACKUP_EMAILS:str = os.getenv('ENABLE_BACKUP_EMAILS', 'true').lower()
    enable_emails:bool = ENABLE_BACKUP_EMAILS not in ('false', '0', 'no', 'off', 'disabled')

    assert(ENCRYPTION_KEY != ""), "ENCRYPTION_KEY is required"
    assert(SMTP_SERVER != ""), "SMTP_SERVER is required"
    assert(SMTP_PORT != 0), "SMTP_PORT is required"
    assert(SMTP_USER != ""), "SMTP_USER is required"
    assert(SMTP_PASSWORD != ""), "SMTP_PASSWORD is required"
    assert(FROM_EMAIL != ""), "FROM_EMAIL is required"
    assert(TO_EMAIL != ""), "TO_EMAIL is required"

    return ENCRYPTION_KEY, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, TO_EMAIL, enable_emails

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

    shutil.move(extracted_db_path, current_db_path)

    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    migrate_database(engine)

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

## Database CRUD functions
def func_get_blog_posts(db:Session, skip:int=0, limit:int=10) -> typing.List[BlogPostModel]:
    """
    Get the blog posts from the database with the given skip and limit.

    Args:
    db (Session): The SQLAlchemy session
    skip (int): The number of blog posts to skip
    limit (int): The number of blog posts to get

    Returns:
    typing.List[BlogPostModel]: The list of blog posts
    """

    return db.query(BlogPostModel).offset(skip).limit(limit).all()

def func_get_all_blog_posts(db:Session) -> typing.List[BlogPostModel]:
    """
    Get all the blog posts from the database in descending order.

    Args:
    db (Session): The SQLAlchemy session

    Returns:
    typing.List[BlogPostModel]: The list of blog posts
    """

    return db.query(BlogPostModel).order_by(BlogPostModel.created_at.desc()).all()

def func_get_recent_blog_posts(db:Session, skip:int=0, limit:int=10) -> typing.List[BlogPostModel]:
    """
    Get the recent blog posts from the database with the given skip and limit.

    Args:
    db (Session): The SQLAlchemy session
    skip (int): The number of blog posts to skip
    limit (int): The number of blog posts to get

    Returns:
    typing.List[BlogPostModel]: The list of blog posts
    """

    return db.query(BlogPostModel).order_by(BlogPostModel.created_at.desc()).offset(skip).limit(limit).all()

def func_get_blog_post(db:Session, blog_post_id:schemaUUID) -> BlogPostModel:
    """
    Get the blog post from the database with the given ID.

    Args:
    db (Session): The SQLAlchemy session
    blog_post_id (UUID): The ID of the blog post

    Returns:
    BlogPostModel: The blog post
    """

    return db.query(BlogPostModel).filter(BlogPostModel.id == blog_post_id).first()

def func_get_blog_post_by_slug(db:Session, slug:str) -> typing.Optional[BlogPostModel]:
    """
    Get the blog post from the database with the given slug.

    Args:
    db (Session): The SQLAlchemy session
    slug (str): The slug of the blog post

    Returns:
    typing.Optional[BlogPostModel]: The blog post or None if not found
    """

    def create_slug(title: str) -> str:
        result = re.sub(r'[^\w\s-]', '', title.lower())
        result = re.sub(r'\s+', '-', result)
        result = re.sub(r'--+', '-', result)
        return result.strip().strip('-')

    all_posts = db.query(BlogPostModel).all()

    for post in all_posts:
        post_slug = create_slug(str(post.title))
        if post_slug == slug:
            return post

    return None

def func_create_blog_post(db:Session, db_blog_post:BlogPostModel) -> BlogPostModel:
    """
    Create a blog post in the database.

    Args:
    db (Session): The SQLAlchemy session
    db_blog_post (BlogPostModel): The blog post to create

    Returns:
    BlogPostModel: The created blog post
    """

    db.add(db_blog_post)
    db.commit()
    db.refresh(db_blog_post)

    return db_blog_post

def func_update_blog_post(db:Session, blog_post_id:schemaUUID, blog_post:BlogPostUpdate) -> BlogPostModel:
    """
    Update the blog post in the database with the given ID.

    Args:
    db (Session): The SQLAlchemy session
    blog_post_id (UUID): The ID of the blog post
    blog_post (schemas.BlogPostUpdate): The blog post to update

    Returns:
    BlogPostModel: The updated blog post
    """

    db_blog_post = db.query(BlogPostModel).filter(BlogPostModel.id == blog_post_id).first()

    if(db_blog_post):
        for key, value in blog_post.dict().items():
            setattr(db_blog_post, key, value)
        db.commit()
        db.refresh(db_blog_post)

    return db_blog_post

def func_delete_blog_post(db:Session, blog_post_id:schemaUUID) -> BlogPostModel:
    """
    Delete the blog post in the database with the given ID.

    Args:
    db (Session): The SQLAlchemy session
    blog_post_id (UUID): The ID of the blog post

    Returns:
    BlogPostModel: The deleted blog post
    """

    db_blog_post = db.query(BlogPostModel).filter(BlogPostModel.id == blog_post_id).first()
    if(db_blog_post):
        db.delete(db_blog_post)
        db.commit()
    return db_blog_post

def func_increment_view_count(db:Session, blog_post_id:schemaUUID):
    """
    Increment the view count of the blog post with the given ID.

    Args:
    db (Session): The SQLAlchemy session
    blog_post_id (UUID): The ID of the blog post

    Returns:
    None
    """

    db_blog_post = db.query(BlogPostModel).filter(BlogPostModel.id == blog_post_id).first()
    if(db_blog_post):
        db_blog_post.view_count = db_blog_post.view_count + 1 # type: ignore
        db.commit()

def func_create_webauthn_credential(db: Session, credential: WebAuthnCredentialCreate) -> WebAuthnCredentialModel:
    """
    Create a WebAuthn credential in the database.

    Args:
    db (Session): The SQLAlchemy session
    credential (WebAuthnCredentialCreate): The credential to create

    Returns:
    WebAuthnCredentialModel: The created credential
    """
    db_credential = WebAuthnCredentialModel(**credential.dict())
    db.add(db_credential)
    db.commit()
    db.refresh(db_credential)
    return db_credential

def func_get_webauthn_credentials(db: Session, user_id: str = "admin") -> typing.List[WebAuthnCredentialModel]:
    """
    Get all WebAuthn credentials for a user.

    Args:
    db (Session): The SQLAlchemy session
    user_id (str): The user ID (defaults to "admin")

    Returns:
    typing.List[WebAuthnCredentialModel]: List of credentials
    """
    return db.query(WebAuthnCredentialModel).filter(WebAuthnCredentialModel.user_id == user_id).all()

def func_get_webauthn_credential_by_id(db: Session, credential_id: str) -> typing.Optional[WebAuthnCredentialModel]:
    """
    Get a WebAuthn credential by its credential ID.

    Args:
    db (Session): The SQLAlchemy session
    credential_id (str): The credential ID

    Returns:
    typing.Optional[WebAuthnCredentialModel]: The credential or None
    """
    return db.query(WebAuthnCredentialModel).filter(WebAuthnCredentialModel.credential_id == credential_id).first()

def func_update_webauthn_credential_sign_count(db: Session, credential_id: str, new_sign_count: int):
    """
    Update the sign count for a WebAuthn credential.

    Args:
    db (Session): The SQLAlchemy session
    credential_id (str): The credential ID
    new_sign_count (int): The new sign count
    """
    credential = db.query(WebAuthnCredentialModel).filter(WebAuthnCredentialModel.credential_id == credential_id).first()
    if credential:
        credential.sign_count = new_sign_count
        db.commit()

def func_delete_webauthn_credential(db: Session, credential_id: str) -> bool:
    """
    Delete a WebAuthn credential.

    Args:
    db (Session): The SQLAlchemy session
    credential_id (str): The credential ID

    Returns:
    bool: True if deleted, False if not found
    """
    credential = db.query(WebAuthnCredentialModel).filter(WebAuthnCredentialModel.credential_id == credential_id).first()
    if credential:
        db.delete(credential)
        db.commit()
        return True
    return False
