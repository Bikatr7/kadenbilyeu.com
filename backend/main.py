## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in libraries
from uuid import UUID

import typing
import os
import threading
import shutil
from datetime import datetime, timedelta, timezone

## third-party libraries

from fastapi import FastAPI, HTTPException, status, Cookie, Depends, File, UploadFile, Request
from fastapi.responses import JSONResponse
from fastapi.security import  HTTPBasicCredentials, HTTPBasic, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

from passlib.context import CryptContext

from pydantic import BaseModel

import pyotp

import jwt
from jwt import PyJWTError

from sqlalchemy.orm import Session

## custom modules
import schemas
from dependencies import get_db
from database import crud
from database.manager import Base, engine, replace_sqlite_db
from backup import decompress_file, decrypt_file
import models

## I promise I will clean this up backend code up later. I'm just trying to get it to work for now.

maintenance_mode = False
maintenance_lock = threading.Lock()

TOKEN_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440

##-----------------------------------------start-of-utility-functions----------------------------------------------------------------------------------------------------------------------------------------------------------

def get_url() -> str:
    if(ENVIRONMENT == "development"):
        return "http://api.localhost:5000"
    
    return "https://api.kadenbilyeu.com"

def get_env_variables() -> None:

    """

    Only used in development. This function reads the .env file and sets the environment variables.

    """

    with open(".env") as f:
        for line in f:
            key, value = line.strip().split("=")
            os.environ[key] = value

##-----------------------------------------start-of-pydantic-models----------------------------------------------------------------------------------------------------------------------------------------------------------

class LoginModel(BaseModel):
    username: str
    password: str
    totp: str

class LoginToken(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class TokenData(BaseModel):
    username: str

##-----------------------------------------start-of-main----------------------------------------------------------------------------------------------------------------------------------------------------------

app = FastAPI()

Base.metadata.create_all(bind=engine)

## CORS setup
origins = ["https://kadenbilyeu.com", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TURNSTILE_SECRET_KEY = os.environ.get("TURNSTILE_SECRET_KEY")
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

ADMIN_USER = os.environ.get("ADMIN_USER")
ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH")
TOTP_SECRET = os.environ.get("TOTP_SECRET")
ACCESS_TOKEN_SECRET = os.environ.get("ACCESS_TOKEN_SECRET")
REFRESH_TOKEN_SECRET = os.environ.get("REFRESH_TOKEN_SECRET")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

security = HTTPBasic()

## Turnstile verification endpoint won't be used if the secret key is not set
## but for the other endpoints, we need to make sure the root keys are set
if(not any([ADMIN_USER, ADMIN_PASS_HASH])):
    get_env_variables()
    ADMIN_USER = os.environ.get("ADMIN_USER")
    ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH")
    TOTP_SECRET = os.environ.get("TOTP_SECRET")
    ACCESS_TOKEN_SECRET = os.environ.get("ACCESS_TOKEN_SECRET")
    REFRESH_TOKEN_SECRET = os.environ.get("REFRESH_TOKEN_SECRET")
    ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")

assert ADMIN_USER, "ADMIN_USER environment variable not set"
assert ADMIN_PASS_HASH, "ADMIN_PASS_HASH environment variable not set"
assert TOTP_SECRET, "TOTP_SECRET environment variable not set"
assert ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET environment variable not set"
assert REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET environment variable not set"
assert ENCRYPTION_KEY, "ENCRYPTION_KEY environment variable not set"

def create_access_token(data:dict, expires_delta:typing.Optional[timedelta] = None):
    to_encode = data.copy()
    if(expires_delta):
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, ACCESS_TOKEN_SECRET, algorithm=TOKEN_ALGORITHM) # type: ignore
    return encoded_jwt


def create_refresh_token(data:dict, expires_delta:typing.Optional[timedelta] = None):
    to_encode = data.copy()
    if(expires_delta):
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=1)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, REFRESH_TOKEN_SECRET, algorithm=TOKEN_ALGORITHM) # type: ignore
    return encoded_jwt

def verify_token(token:str):
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


def verify_credentials(credentials:HTTPBasicCredentials):
    if(not(credentials.username == ADMIN_USER and pwd_context.verify(credentials.password, ADMIN_PASS_HASH))):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )

def verify_totp(totp_code:str):
    totp = pyotp.TOTP(TOTP_SECRET) # type: ignore

    if(not totp.verify(totp_code)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
def get_current_user(token:str = Depends(oauth2_scheme)):
    try:
        token_data = verify_token(token)
        return token_data.username
    except HTTPException as e:
        raise e

def get_current_active_user(current_user:str = Depends(get_current_user)):
    if(current_user != ADMIN_USER):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return current_user

@app.middleware("http")
async def maintenance_middleware(request:Request, call_next):
    global maintenance_mode
    if(maintenance_mode):
        return JSONResponse(status_code=503, content={"message": "Server is in maintenance mode"})
    
    response = await call_next(request)
    
    return response


@app.post("/login", response_model=LoginToken)
def login(data: LoginModel):
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
def refresh_token(refresh_token: str = Cookie(None)):
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
        samesite="strict",
        max_age=TOKEN_EXPIRE_MINUTES
    )
    return response

@app.post("/blog", response_model=schemas.BlogPost)
def create_blog_post(
    blog_post:schemas.BlogPostCreate, 
    db:Session = Depends(get_db), 
    current_user:str = Depends(get_current_active_user)):
    
    db_blog_post = models.BlogPost(
        title=blog_post.title,
        content=blog_post.content,
        author=blog_post.author,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    return crud.create_blog_post(db=db, db_blog_post=db_blog_post)

@app.get("/blog", response_model=list[schemas.BlogPost])
def read_blog_posts(
    skip:int = 0, 
    limit:int = 10, 
    db:Session = Depends(get_db)):

    return crud.get_blog_posts(db, skip=skip, limit=limit)

@app.get("/blog/{blog_post_id}", response_model=schemas.BlogPost)
def read_blog_post(
    blog_post_id:UUID, 
    db:Session = Depends(get_db)):

    db_blog_post = crud.get_blog_post(db, blog_post_id=blog_post_id)
    if(db_blog_post is None):
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_blog_post

@app.put("/blog/{blog_post_id}", response_model=schemas.BlogPost)
def update_blog_post(
    blog_post_id:UUID, 
    blog_post:schemas.BlogPostUpdate, 
    db:Session = Depends(get_db), 
    current_user:str = Depends(get_current_active_user)):

    db_blog_post = crud.update_blog_post(db=db, blog_post_id=blog_post_id, blog_post=blog_post)
    if(db_blog_post is None):
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_blog_post

@app.delete("/blog/{blog_post_id}", response_model=schemas.BlogPost)
def delete_blog_post(
    blog_post_id:UUID, 
    db:Session = Depends(get_db), 
    current_user:str = Depends(get_current_active_user)):

    db_blog_post = crud.delete_blog_post(db=db, blog_post_id=blog_post_id)
    if(db_blog_post is None):
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_blog_post

@app.get("/latest-blogs", response_model=list[schemas.BlogPost])
def read_latest_blog_posts(
    limit:int = 5,
    db:Session = Depends(get_db)):

    return crud.get_recent_blog_posts(db, skip=0, limit=limit)

@app.get("/blog-count", response_model=int)
def get_blog_count(db: Session = Depends(get_db)):
    return db.query(models.BlogPost).count()

@app.get("/all-blogs", response_model=list[schemas.BlogPost])
def read_all_blog_posts(db:Session = Depends(get_db)):
    return crud.get_all_blog_posts(db)

@app.post("/replace-database")
async def upload_backup(file: UploadFile = File(...),
                        db:Session = Depends(get_db),
                        current_user:str = Depends(get_current_active_user)):

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

        replace_sqlite_db(decompressed_file, "blog.db")

        os.remove("backup.zip.pgp")
        os.remove(decrypted_file)

        return {"message": "Database replaced successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        with maintenance_lock:
            maintenance_mode = False
