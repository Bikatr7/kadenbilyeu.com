## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in libraries
from uuid import UUID as schemaUUID, uuid4
from datetime import datetime, timedelta, timezone

import typing
import os
import time
import threading
import shutil

import zipfile
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

## third-party libraries
from fastapi import FastAPI, HTTPException, status, Cookie, Depends, File, UploadFile, Request, Header
from fastapi.responses import JSONResponse, Response
from fastapi.security import  HTTPBasicCredentials, HTTPBasic, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sqlalchemy import create_engine, Engine, Column, String, Text, DateTime, inspect, Inspector, Integer, text
from sqlalchemy.orm import sessionmaker, close_all_sessions, Session
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta
from sqlalchemy.dialects.postgresql import UUID as modelUUID

from apscheduler.schedulers.background import BackgroundScheduler
from gnupg import GPG
from passlib.context import CryptContext
from jwt import PyJWTError

import pyotp
import jwt
import atexit
import shelve

##-----------------------------------------start-of-pydantic-models----------------------------------------------------------------------------------------------------------------------------------------------------------

class LoginModel(BaseModel):
    username:str
    password:str
    totp:str

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
        from_attributes = True

##-----------------------------------------start-of-constants----------------------------------------------------------------------------------------------------------------------------------------------------------

def get_env_variables() -> None:

    """

    Only used in development. This function reads the .env file and sets the environment variables.

    """

    if(not os.path.exists(".env")):
        return

    with open(".env") as f:
        for line in f:
            key, value = line.strip().split("=")
            os.environ[key] = value

get_env_variables()

maintenance_mode = False
maintenance_lock = threading.Lock()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")
ADMIN_USER = os.environ.get("ADMIN_USER")
ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH")
TOTP_SECRET = os.environ.get("TOTP_SECRET")
ACCESS_TOKEN_SECRET = os.environ.get("ACCESS_TOKEN_SECRET")
REFRESH_TOKEN_SECRET = os.environ.get("REFRESH_TOKEN_SECRET")

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

TOKEN_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440

if(not os.path.exists("database") and ADMIN_USER == "admin"):
    os.makedirs("database", exist_ok=True)

elif(not os.path.exists("database") and ADMIN_USER != "admin"):
    raise NotImplementedError("Database volume not attached and running in production mode, please exit and attach the volume")

DATABASE_URL: str = "sqlite:///./database/blog.db"
DATABASE_PATH: str = "database/blog.db"
BACKUP_LOGS_DIR = 'database/logs'

Base:DeclarativeMeta = declarative_base()

security = HTTPBasic()

if(not os.path.exists(BACKUP_LOGS_DIR)):
    os.makedirs(BACKUP_LOGS_DIR, exist_ok=True)

assert ADMIN_USER, "ADMIN_USER environment variable not set"
assert ADMIN_PASS_HASH, "ADMIN_PASS_HASH environment variable not set"
assert TOTP_SECRET, "TOTP_SECRET environment variable not set"
assert ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET environment variable not set"
assert REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET environment variable not set"
assert ENCRYPTION_KEY, "ENCRYPTION_KEY environment variable not set"
##----------------------------------/----------------------------------##

class BlogPostModel(Base):
    __tablename__ = "blog_posts"
    id = Column(modelUUID(as_uuid=True), primary_key=True, index=True, default=uuid4)
    title = Column(String, index=True)
    content = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    view_count = Column(Integer, default=0)

##-----------------------------------------start-of-migrations----------------------------------------------------------------------------------------------------------------------------------------------------------

def migrate_database(engine:Engine) -> None:

    """

    Performs database migrations if needed.
    
    """

    inspector = inspect(engine)

    inspector.clear_cache()

    columns = [col['name'] for col in inspector.get_columns('blog_posts')]
    
    ## Migration 1 (2024-08-14) (Addition of view_count to blog_posts)
    try:
        columns = [col['name'].lower() for col in inspector.get_columns('blog_posts')]

        print(f"Current columns in blog_posts: {columns}")

        if('view_count' not in columns):
            print("view_count column not found. Attempting to add it.")
            with engine.connect() as connection:
                connection.execute(text("ALTER TABLE blog_posts ADD COLUMN view_count INTEGER DEFAULT 0"))
                connection.commit()

            print("Added view_count column to blog_posts table")
        else:
            print("view_count column already exists in blog_posts table")
        
        inspector.clear_cache()
        columns = [col['name'].lower() for col in inspector.get_columns('blog_posts')]
        
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        pass

##----------------------------------/----------------------------------##

engine:Engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal:sessionmaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables_if_not_exist(engine, base:DeclarativeMeta) -> None:
    inspector:Inspector = inspect(engine)
    for table_name in base.metadata.tables.keys():
        if(not inspector.has_table(table_name)):
            base.metadata.tables[table_name].create(engine)

create_tables_if_not_exist(engine, Base)

migrate_database(engine)

##----------------------------------/----------------------------------##

def get_envs() -> typing.Tuple[str, str, int, str, str, str, str]:

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

    assert(ENCRYPTION_KEY != ""), "ENCRYPTION_KEY is required"
    assert(SMTP_SERVER != ""), "SMTP_SERVER is required"
    assert(SMTP_PORT != 0), "SMTP_PORT is required"
    assert(SMTP_USER != ""), "SMTP_USER is required"
    assert(SMTP_PASSWORD != ""), "SMTP_PASSWORD is required"
    assert(FROM_EMAIL != ""), "FROM_EMAIL is required"
    assert(TO_EMAIL != ""), "TO_EMAIL is required"

    return ENCRYPTION_KEY, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, TO_EMAIL

##-----------------------------------------start-of-backup----------------------------------------------------------------------------------------------------------------------------------------------------------

def export_db(db_path:str, export_path:str) -> str:

    """

    Export the SQLite database to a new file

    Args:
    db_path (str): The path to the SQLite database file
    export_path (str): The path to the exported SQLite database file

    Returns:
    export_path (str): The path to the exported SQLite database file

    """

    shutil.copy(db_path, export_path)
    return export_path

##----------------------------------/----------------------------------##

def encrypt_file(file_path:str, passphrase:str) -> str:

    """

    Encrypt the file using the GPG encryption algorithm

    Args:
    file_path (str): The path to the file to encrypt
    passphrase (str): The passphrase to encrypt the file with

    Returns:
    encrypted_path (str): The path to the encrypted file

    """

    gpg = GPG()
    encrypted_path = file_path + '.pgp'
    
    with open(file_path, 'rb') as f:
        status = gpg.encrypt_file(
            f, 
            recipients=None, 
            symmetric=True, 
            passphrase=passphrase, 
            output=encrypted_path
        )
        
    if(not status.ok):
        raise ValueError(f'Failed to encrypt the file: {status.stderr}')

    return encrypted_path

def decrypt_file(file_path:str, passphrase:str) -> str:

    """

    Decrypt the file using the GPG encryption algorithm

    Args:
    file_path (str): The path to the file to decrypt

    Returns:
    decrypted_path (str): The path to the decrypted file

    """

    gpg = GPG()
    decrypted_path = file_path.replace('.pgp', '')
    
    with open(file_path, 'rb') as f:
        status = gpg.decrypt_file(
            f, 
            passphrase=passphrase, 
            output=decrypted_path
        )
        
    if(not status.ok):
        raise ValueError(f'Failed to decrypt the file: {status.stderr}')

    return decrypted_path

##----------------------------------/----------------------------------##

def compress_file(file_path:str) -> str:

    """

    Compress the file into a zip archive

    Args:
    file_path (str): The path to the file to compress

    Returns:
    compressed_path (str): The path to the compressed file

    """

    compressed_path = file_path + '.zip'

    with zipfile.ZipFile(compressed_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(file_path, os.path.basename(file_path))

    return compressed_path

def decompress_file(file_path:str, decompressed_path:str) -> str:

    """

    Decompress the file from a zip archive

    Args:
    file_path (str): The path to the file to decompress

    Returns:
    decompressed_path (str): The path to the decompressed file

    """
    
    with zipfile.ZipFile(file_path, 'r') as zipf:
        
        ## Extract all files to a temporary directory
        temp_dir = os.path.join(os.getcwd(), "temp_extracted")
        os.makedirs(temp_dir, exist_ok=True)
        zipf.extractall(temp_dir)
        
        extracted_files = os.listdir(temp_dir)
        
        if(not extracted_files):
            raise FileNotFoundError("No files found in the zip archive")
        
        extracted_file = extracted_files[0]
        extracted_file_path = os.path.join(temp_dir, extracted_file)
        
        shutil.move(extracted_file_path, decompressed_path)
    
        shutil.rmtree(temp_dir)
        
    return decompressed_path

##----------------------------------/----------------------------------##

def send_email(subject:str, body:str, to_email:str, attachment_path:str, from_email:str, smtp_server:str, smtp_port:int, smtp_user:str, smtp_password:str) -> None:

    """

    Send an email with an attachment

    Args:
    subject (str): The subject of the email
    body (str): The body of the email
    to_email (str): The email address to send the email to
    attachment_path (str): The path to the attachment to send
    from_email (str): The email address to send the email from
    smtp_server (str): The SMTP server to send the email
    smtp_port (int): The SMTP port to send the email
    smtp_user (str): The SMTP user to send the email
    smtp_password (str): The SMTP password to send the email

    """


    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    msg.attach(MIMEText(body, 'plain'))

    with open(attachment_path, 'rb') as f:
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f'attachment; filename={os.path.basename(attachment_path)}')
        msg.attach(part)

    try:

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls() 
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            server.quit()

    except Exception as e:
        print(f"Error: {e}")

##----------------------------------/----------------------------------##

def perform_backup() -> None:

    """

    Perform the backup process

    """

    ENCRYPTION_KEY, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, TO_EMAIL = get_envs()

    timestamp = datetime.now().strftime("%Y-%m-%d %H_%M_%S")

    db:Session = SessionLocal()

    number_of_blog_posts = db.query(BlogPostModel).count()

    export_path = f'exported_db_{timestamp}.db'

    export_db(DATABASE_PATH, export_path)

    compressed_path = compress_file(export_path)
    os.remove(export_path)

    encrypted_path = encrypt_file(compressed_path, ENCRYPTION_KEY)
    os.remove(compressed_path)

    send_email(
        subject=f'SQLite Database Backup ({timestamp})',
        body='Please find the attached encrypted and compressed SQLite database backup. This email was sent automatically. Do not reply.\n\nNumber of blog posts: ' + str(number_of_blog_posts),
        to_email=TO_EMAIL,
        attachment_path=encrypted_path,
        from_email=FROM_EMAIL,
        smtp_server=SMTP_SERVER,
        smtp_port=SMTP_PORT,
        smtp_user=SMTP_USER,
        smtp_password=SMTP_PASSWORD
    )

    os.remove(encrypted_path)

    try:

        os.remove(export_path)
        os.remove(compressed_path)
        os.remove(encrypted_path)

    except Exception:
        pass

    finally:
        try:
            os.remove(export_path)
            os.remove(compressed_path)
            os.remove(encrypted_path)

        except:
            pass

##----------------------------------/----------------------------------##

def perform_backup_scheduled() -> None:

    """

    Perform the backup process on a scheduled interval

    """

    with shelve.open(os.path.join(BACKUP_LOGS_DIR, 'backup_scheduler.db')) as db:
        perform_backup()
        db['last_run'] = datetime.now()

##----------------------------------/----------------------------------##

def start_scheduler():
    max_retries = 5
    retry_delay = 3

    for _ in range(max_retries):
        try:
            with shelve.open(os.path.join(BACKUP_LOGS_DIR, 'backup_scheduler.db')) as db:
                last_run = db.get('last_run', None)

                should_run_initial = True
                if(last_run):
                    time_since_last_run = datetime.now() - last_run
                    if(time_since_last_run < timedelta(hours=6)):
                        should_run_initial = False

            break

        except Exception as e:
            if("Resource temporarily unavailable" in str(e)):
                time.sleep(retry_delay)
            else:
                raise
    else:
        print("Failed to initialize scheduler after multiple attempts")
        return

    if(should_run_initial):
        perform_backup_scheduled()

    scheduler = BackgroundScheduler()
    scheduler.add_job(perform_backup_scheduled, 'interval', hours=6)
    scheduler.start()

    atexit.register(lambda: scheduler.shutdown())

##-----------------------------------------start-of-auth----------------------------------------------------------------------------------------------------------------------------------------------------------

def create_access_token(data:dict, expires_delta:typing.Optional[timedelta] = None) -> str:

    """
    
    Create an access token with the given data and expiration time

    Args:
    data (dict): The data to encode into the token
    expires_delta (timedelta): The time until the token expires

    Returns:
    encoded_jwt (str): The encoded JWT token

    """

    to_encode = data.copy()

    if(expires_delta):
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, ACCESS_TOKEN_SECRET, algorithm=TOKEN_ALGORITHM) # type: ignore
    return encoded_jwt

def create_refresh_token(data:dict, expires_delta:typing.Optional[timedelta] = None) -> str:

    """

    Create a refresh token with the given data and expiration time

    Args:
    data (dict): The data to encode into the token
    expires_delta (timedelta): The time until the token expires

    Returns:
    encoded_jwt (str): The encoded JWT token

    """

    to_encode = data.copy()

    if(expires_delta):
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=1)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, REFRESH_TOKEN_SECRET, algorithm=TOKEN_ALGORITHM) # type: ignore
    return encoded_jwt

def verify_token(token:str) -> TokenData:
    
        """

        Verify the given token and return the data

        Args:    
        token (str): The token to verify

        Returns:
        TokenData: The data from the token

        """

        try:
            payload = jwt.decode(token, ACCESS_TOKEN_SECRET, algorithms=[TOKEN_ALGORITHM]) # type: ignore
            username:str = payload.get("sub")

            if(username is None):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
            
            return TokenData(username=username)
        
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        
        except PyJWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def verify_credentials(credentials:HTTPBasicCredentials) -> None:

    """
    
    Verify the given credentials

    Args:
    credentials (HTTPBasicCredentials): The credentials to verify

    """

    if(not(credentials.username == ADMIN_USER and pwd_context.verify(credentials.password, ADMIN_PASS_HASH))):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )

def verify_totp(totp_code:str) -> None:

    """

    Verify the given TOTP code

    Args:
    totp_code (str): The TOTP code to verify

    """

    totp = pyotp.TOTP(TOTP_SECRET) # type: ignore

    if(not totp.verify(totp_code)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
def get_current_user(token:str = Depends(oauth2_scheme)):

    """

    Get the current user from the given token

    Args:
    token (str): The token to get the user from

    Returns:
    str: The username of the user

    """

    try:
        token_data = verify_token(token)
        return token_data.username
    except HTTPException as e:
        raise e

def get_current_active_user(current_user:str = Depends(get_current_user)):

    """

    Get the current active user

    Args:
    current_user (str): The current user

    Returns:
    str: The username of the user

    """

    if(current_user != ADMIN_USER):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return current_user

##-----------------------------------------start-of-database----------------------------------------------------------------------------------------------------------------------------------------------------------

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
    skip (int): The number of blog posts to skip
    limit (int): The number of blog posts to get

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

    import re
    
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
        for key, value in blog_post.model_dump().items():
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

##-----------------------------------------start-of-utility-functions----------------------------------------------------------------------------------------------------------------------------------------------------------

def get_url() -> str:
    if(ENVIRONMENT == "development"):
        return "http://api.localhost:5000"
    
    return "https://api.kadenbilyeu.com"

##-----------------------------------------start-of-main----------------------------------------------------------------------------------------------------------------------------------------------------------

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    start_scheduler()

##-----------------------------------------start-of-middleware----------------------------------------------------------------------------------------------------------------------------------------------------------

@app.middleware("http")
async def maintenance_middleware(request:Request, call_next):
    global maintenance_mode
    if(maintenance_mode):
        return JSONResponse(status_code=503, content={"message": "Server is in maintenance mode"})
    
    response = await call_next(request)
    
    return response

## CORS setup
origins = [
    "https://bikatr7.com",
    "https://kadenbilyeu.com",
    "http://localhost:5173",
    "https://kadenbilyeu-com.pages.dev",
    "https://*.kadenbilyeu-com.pages.dev",
    "https://*.bikatr7.com",
    "https://bikatr7.pages.dev",
    "https://*.bikatr7.pages.dev"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https://([a-z0-9-]\.)?(kadenbilyeu-com\.pages\.dev|bikatr7\.pages\.dev)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

##-----------------------------------------start-of-endpoints----------------------------------------------------------------------------------------------------------------------------------------------------------

@app.get("/")
async def api_home():
    return {"message": "API is running"}

@app.post("/login", response_model=LoginToken)
def login(data:LoginModel) -> typing.Dict[str, str]:
    
    """
    
    Login endpoint for the API

    Args:
    data (LoginModel): The data required to login

    Returns:
    typing.Dict[str, str]: The access token and token type

    """

    credentials = HTTPBasicCredentials(username=data.username, password=data.password)
    verify_credentials(credentials)
    verify_totp(data.totp)

    access_token_expires = timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": data.username}, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    refresh_token = create_refresh_token(
        data={"sub": data.username}, expires_delta=refresh_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@app.post("/refresh", response_model=LoginToken)
def refresh_token(refresh_token: str = Cookie(None)) -> JSONResponse:
    
    """

    Refresh the access token using the refresh token

    Args:
    refresh_token (str): The refresh token

    Returns:
    typing.Dict[str, str]: The access token and token type

    """

    if(refresh_token is None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token provided")

    token_data = verify_token(refresh_token)
    access_token_expires = timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": token_data.username}, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    new_refresh_token = create_refresh_token(
        data={"sub": token_data.username}, expires_delta=refresh_token_expires
    )

    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=TOKEN_EXPIRE_MINUTES
    )
    return response

@app.post("/blog", response_model=BlogPostRead)
def create_blog_post(blog_post:BlogPostCreate, db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:
    
    """

    Create a new blog post

    Args:
    blog_post (BlogPostCreate): The data for the new blog post
    db (Session): The database session
    current_user (str): The current user

    Returns:
    BlogPostRead: The new blog post

    """

    db_blog_post = BlogPostModel(
        title=blog_post.title,
        content=blog_post.content,
        author=blog_post.author,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        view_count=0
    )

    return func_create_blog_post(db=db, db_blog_post=db_blog_post)

@app.get("/blog", response_model=list[BlogPostRead])
def read_blog_posts(skip:int = 0, limit:int = 10, db:Session = Depends(get_db)):
    
    """
    
    Read blog posts from the database

    Args:
    skip (int): The number of posts to skip
    limit (int): The number of posts to return
    db (Session): The database session

    """

    return func_get_blog_posts(db, skip=skip, limit=limit)

@app.get("/blog/{blog_post_id}", response_model=BlogPostRead)
def read_blog_post(blog_post_id:schemaUUID, db:Session = Depends(get_db), authorization: str = Header(None)) -> BlogPostRead:

    """
    
    Read a single blog post from the database

    Args:
    blog_post_id (UUID): The ID of the blog post
    db (Session): The database session
    
    Returns:
    BlogPostRead: The blog post

    """

    db_blog_post = func_get_blog_post(db, blog_post_id=blog_post_id)

    if(db_blog_post is None):
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    ## I'm the only one who can login and there's no point and logging at my own views
    is_logged_in = False
    if(authorization):
        try:
            token = authorization.split()[-1]
            get_current_user(token)
            is_logged_in = True
        except:
            pass

    if(not is_logged_in):
        func_increment_view_count(db, db_blog_post.id)  # type: ignore

    return db_blog_post

@app.get("/blog/slug/{slug}", response_model=BlogPostRead)
def read_blog_post_by_slug(slug:str, db:Session = Depends(get_db), authorization: str = Header(None)) -> BlogPostRead:

    """
    
    Read a single blog post from the database by slug

    Args:
    slug (str): The slug of the blog post
    db (Session): The database session
    
    Returns:
    BlogPostRead: The blog post

    """

    db_blog_post = func_get_blog_post_by_slug(db, slug=slug)

    if(db_blog_post is None):
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    ## I'm the only one who can login and there's no point and logging at my own views
    is_logged_in = False
    if(authorization):
        try:
            token = authorization.split()[-1]
            get_current_user(token)
            is_logged_in = True
        except:
            pass

    if(not is_logged_in):
        func_increment_view_count(db, db_blog_post.id)  # type: ignore

    return db_blog_post

@app.put("/blog/{blog_post_id}", response_model=BlogPostRead)
def update_blog_post(blog_post_id:schemaUUID, blog_post:BlogPostUpdate, db:Session = Depends(get_db)) -> BlogPostRead:
    
    """

    Update a blog post

    Args:
    blog_post_id (UUID): The ID of the blog post
    blog_post (BlogPostUpdate): The updated data for the blog post
    db (Session): The database session
    
    Returns:
    blog_post (BlogPostUpdate): The updated data for the blog post

    """

    db_blog_post = func_update_blog_post(db=db, blog_post_id=blog_post_id, blog_post=blog_post)

    if(db_blog_post is None):
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return db_blog_post

@app.delete("/blog/{blog_post_id}", response_model=BlogPostRead)
def delete_blog_post(blog_post_id:schemaUUID, db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:
    
    """

    Delete a blog post

    Args:
    blog_post_id (UUID): The ID of the blog post
    db (Session): The database session
    current_user (str): The current user
    
    Returns:
    BlogPostRead: The deleted blog post

    """
    
    db_blog_post = func_delete_blog_post(db=db, blog_post_id=blog_post_id)

    if(db_blog_post is None):
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return db_blog_post

@app.get("/latest-blogs", response_model=list[BlogPostRead])
def read_latest_blog_posts(limit:int = 5, db:Session = Depends(get_db)):
    
    """

    Read the latest blog posts

    Args:
    limit (int): The number of posts to return
    db (Session): The database session

    """

    return func_get_recent_blog_posts(db, skip=0, limit=limit)

@app.get("/blog-count", response_model=int)
def get_blog_count(db: Session = Depends(get_db)) -> int:

    """
    
    Get the number of blog posts in the database

    Args:
    db (Session): The database session

    Returns:
    int: The number of blog posts in the database

    """

    
    return db.query(BlogPostModel).count()

@app.get("/all-blogs", response_model=list[BlogPostRead])
def read_all_blog_posts(db:Session = Depends(get_db)):

    """

    Read all blog posts from the database

    Args:
    db (Session): The database session

    """

    return func_get_all_blog_posts(db)

@app.post("/replace-database")
@app.post("/replace-database/")
@app.post("/replace-database/")
@app.post("/replace-database/")
async def upload_backup(file: UploadFile = File(...),current_user:str = Depends(get_current_active_user)) -> typing.Dict[str, str]:

    """

    Replace the database with a backup

    Args:
    file (UploadFile): The backup file
    db (Session): The database session
    current_user (str): The current user

    Returns:
    typing.Dict[str, str]: The result of the operation

    """

    try:
        global maintenance_mode
        with maintenance_lock:
            maintenance_mode = True

        with open("backup.zip.pgp", "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        with open("backup.zip.pgp", "rb") as f:
            decrypted_file = decrypt_file("backup.zip.pgp", ENCRYPTION_KEY) # type: ignore

        with open(decrypted_file, "rb") as f:
            decompressed_file = decompress_file(decrypted_file, "backup.db")

        replace_sqlite_db(decompressed_file, DATABASE_PATH)

        os.remove("backup.zip.pgp")
        os.remove(decrypted_file)

        return {"message": "Database replaced successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        with maintenance_lock:
            maintenance_mode = False

@app.post('/force-backup')
def force_backup(current_user:str = Depends(get_current_active_user), db:Session = Depends(get_db)) -> typing.Dict[str, str]:

    """

    Force a backup

    Args:
    current_user (str): The current user

    Returns:
    typing.Dict[str, str]: The result of the operation

    """

    perform_backup()

    return {"message": "Backup started"}

@app.options("/{rest_of_path:path}")
async def any_options(rest_of_path: str):
    return Response(status_code=204)


@app.options("/replace-database")
async def _opts_rb():
    from fastapi.responses import Response
    return Response(status_code=204)


@app.options("/replace-database/")
async def _opts_rb_slash():
    from fastapi.responses import Response
    return Response(status_code=204)


@app.on_event("startup")
async def _disable_redirect_slashes():
    app.router.redirect_slashes = False

