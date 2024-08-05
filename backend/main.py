## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in libraries
from uuid import UUID

import sys
import typing
import os
import threading
import shutil
from datetime import datetime, timedelta, timezone

## third-party libraries

from fastapi import FastAPI, HTTPException, status, Cookie, Depends, File, UploadFile, Request
from fastapi.responses import JSONResponse
from fastapi.security import  HTTPBasicCredentials, HTTPBasic
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sqlalchemy.orm import Session

## Add the parent directory to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

## custom modules

try: 
    from .constants import get_env_variables

except:

    from constants import get_env_variables


get_env_variables()

try:

    from .constants import ENCRYPTION_KEY, ENVIRONMENT, TOKEN_EXPIRE_MINUTES

    from .database import crud
    from .database.manager import Base, engine, replace_sqlite_db, get_db
    from .database.entities import BlogPostRead, BlogPostCreate, BlogPostModel, BlogPostUpdate

    from .backup import decompress_file, decrypt_file, start_scheduler, perform_backup

    from .auth import verify_credentials, verify_totp, verify_token, get_current_active_user, create_access_token, create_refresh_token

except:

    from constants import ENCRYPTION_KEY, ENVIRONMENT, TOKEN_EXPIRE_MINUTES

    from database import crud
    from database.manager import Base, engine, replace_sqlite_db, get_db
    from database.entities import BlogPostRead, BlogPostCreate, BlogPostModel, BlogPostUpdate

    from backup import decompress_file, decrypt_file, start_scheduler, perform_backup

    from auth import verify_credentials, verify_totp, verify_token, get_current_active_user, create_access_token, create_refresh_token

maintenance_mode = False
maintenance_lock = threading.Lock()

##-----------------------------------------start-of-utility-functions----------------------------------------------------------------------------------------------------------------------------------------------------------

def get_url() -> str:
    if(ENVIRONMENT == "development"):
        return "http://api.localhost:5000"
    
    return "https://api.kadenbilyeu.com"

##-----------------------------------------start-of-pydantic-models----------------------------------------------------------------------------------------------------------------------------------------------------------

class LoginModel(BaseModel):
    username: str
    password: str
    totp: str

class LoginToken(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

##-----------------------------------------start-of-main----------------------------------------------------------------------------------------------------------------------------------------------------------

app = FastAPI()

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
    "https://kadenbilyeu.com",
    "http://localhost:5173",
    "https://kadenbilyeu-com.pages.dev",
    "https://*.kadenbilyeu-com.pages.dev"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

##-----------------------------------------start-of-database----------------------------------------------------------------------------------------------------------------------------------------------------------

## Create the database
Base.metadata.create_all(bind=engine)

security = HTTPBasic()

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
        samesite="strict",
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
        updated_at=datetime.now(timezone.utc)
    )

    return crud.create_blog_post(db=db, db_blog_post=db_blog_post)

from typing import List, Union

@app.get("/blog", response_model=List[BlogPostRead])
def read_blog_posts(skip:int = 0, limit:int = 10, db:Session = Depends(get_db)):
    
    """
    
    Read blog posts from the database

    Args:
    skip (int): The number of posts to skip
    limit (int): The number of posts to return
    db (Session): The database session

    """

    return crud.get_blog_posts(db, skip=skip, limit=limit)

@app.get("/blog/{blog_post_id}", response_model=BlogPostRead)
def read_blog_post(blog_post_id:UUID, db:Session = Depends(get_db)) -> BlogPostRead:

    """
    
    Read a single blog post from the database

    Args:
    blog_post_id (UUID): The ID of the blog post
    db (Session): The database session
    
    Returns:
    BlogPostRead: The blog post

    """

    db_blog_post = crud.get_blog_post(db, blog_post_id=blog_post_id)

    if(db_blog_post is None):
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return db_blog_post

@app.put("/blog/{blog_post_id}", response_model=BlogPostRead)
def update_blog_post(blog_post_id:UUID, blog_post:BlogPostUpdate, db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:
    
    """

    Update a blog post

    Args:
    blog_post_id (UUID): The ID of the blog post
    blog_post (BlogPostUpdate): The updated data for the blog post
    db (Session): The database session
    
    Returns:
    blog_post (BlogPostUpdate): The updated data for the blog post

    """

    db_blog_post = crud.update_blog_post(db=db, blog_post_id=blog_post_id, blog_post=blog_post)

    if(db_blog_post is None):
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return db_blog_post

@app.delete("/blog/{blog_post_id}", response_model=BlogPostRead)
def delete_blog_post(blog_post_id:UUID, db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:
    
    """

    Delete a blog post

    Args:
    blog_post_id (UUID): The ID of the blog post
    db (Session): The database session
    current_user (str): The current user
    
    Returns:
    BlogPostRead: The deleted blog post

    """
    
    db_blog_post = crud.delete_blog_post(db=db, blog_post_id=blog_post_id)

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

    return crud.get_recent_blog_posts(db, skip=0, limit=limit)

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

    return crud.get_all_blog_posts(db)

@app.post("/replace-database")
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

        replace_sqlite_db(decompressed_file, "blog.db")

        os.remove("backup.zip.pgp")
        os.remove(decrypted_file)

        return {"message": "Database replaced successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        with maintenance_lock:
            maintenance_mode = False

@app.post('/force-backup')
def force_backup(current_user:str = Depends(get_current_active_user)) -> typing.Dict[str, str]:

    """

    Force a backup

    Args:
    current_user (str): The current user

    Returns:
    typing.Dict[str, str]: The result of the operation

    """

    perform_backup()

    return {"message": "Backup started"}