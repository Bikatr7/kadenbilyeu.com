## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

from fastapi import APIRouter, Request, Header, Depends, HTTPException

from auth import get_current_active_user, is_token_blacklisted, verify_token
from config import ADMIN_USER
from database import (
    BlogPostRead, BlogPostCreate, BlogPostUpdate,
    func_get_blog_posts, func_get_blog_post, func_get_blog_post_by_slug,
    func_create_blog_post, func_update_blog_post, func_delete_blog_post,
    func_get_recent_blog_posts, func_get_all_blog_posts, func_increment_view_count,
    func_get_site_settings, get_db, schemaUUID
)
from sqlalchemy.orm import Session

router = APIRouter()

def request_has_admin_cookie(request:Request) -> bool:
    """
    Check whether a public request is from the admin session.
    """

    access_token = request.cookies.get("access_token")

    if not access_token:
        return False

    try:
        if is_token_blacklisted(access_token):
            return False

        token_data = verify_token(access_token)
        return token_data.username == ADMIN_USER
    except Exception:
        return False

def require_blog_available(request:Request, db:Session) -> None:
    """
    Hide public blog reads while minimal mode is enabled.
    """

    site_settings = func_get_site_settings(db)

    if site_settings.minimal_mode and not request_has_admin_cookie(request):
        raise HTTPException(status_code=404, detail="Blog not found")

@router.post("/blog", response_model=BlogPostRead)
async def create_blog_post(blog_post:BlogPostCreate, request: Request, db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:

    """
    Create a new blog post

    Args:
    blog_post (BlogPostCreate): The data for the new blog post
    request (Request): The request object
    csrf_protect (CsrfProtect): CSRF protection
    db (Session): The database session
    current_user (str): The current user

    Returns:
    BlogPostRead: The new blog post
    """
    from datetime import datetime, timezone


    from database import BlogPostModel
    db_blog_post = BlogPostModel(
        title=blog_post.title,
        content=blog_post.content,
        author=blog_post.author,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        view_count=0
    )

    return func_create_blog_post(db=db, db_blog_post=db_blog_post)

@router.get("/blog", response_model=list[BlogPostRead])
def read_blog_posts(request:Request, skip:int = 0, limit:int = 10, db:Session = Depends(get_db)):

    """
    Read blog posts from the database

    Args:
    skip (int): The number of posts to skip
    limit (int): The number of posts to return
    db (Session): The database session
    """

    require_blog_available(request, db)

    return func_get_blog_posts(db, skip=skip, limit=limit)

@router.get("/blog/{blog_post_id}", response_model=BlogPostRead)
def read_blog_post(blog_post_id:schemaUUID, request:Request, db:Session = Depends(get_db), authorization: str = Header(None)) -> BlogPostRead:

    """
    Read a single blog post from the database

    Args:
    blog_post_id (UUID): The ID of the blog post
    db (Session): The database session

    Returns:
    BlogPostRead: The blog post
    """

    require_blog_available(request, db)

    db_blog_post = func_get_blog_post(db, blog_post_id=blog_post_id)

    if(db_blog_post is None):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog post not found")

    ## I'm the only one who can login and there's no point and logging at my own views
    if not authorization or authorization == "Bearer None":
        if(db_blog_post):
            func_increment_view_count(db, db_blog_post.id)  # type: ignore
    else:
        try:
            token = authorization.split()[-1]
            from auth import get_current_user
            get_current_user(token)
        except:
            if(db_blog_post):
                func_increment_view_count(db, db_blog_post.id)  # type: ignore

    return db_blog_post

@router.get("/blog/slug/{slug}", response_model=BlogPostRead)
def read_blog_post_by_slug(slug:str, request:Request, db:Session = Depends(get_db), authorization: str = Header(None)) -> BlogPostRead:

    """
    Read a single blog post from the database by slug

    Args:
    slug (str): The slug of the blog post
    db (Session): The database session

    Returns:
    BlogPostRead: The blog post
    """

    require_blog_available(request, db)

    db_blog_post = func_get_blog_post_by_slug(db, slug=slug)

    if(db_blog_post is None):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog post not found")

    ## I'm the only one who can login and there's no point and logging at my own views
    if not authorization or authorization == "Bearer None":
        func_increment_view_count(db, db_blog_post.id)  # type: ignore
    else:
        try:
            token = authorization.split()[-1]
            from auth import get_current_user
            get_current_user(token)
        except:
            func_increment_view_count(db, db_blog_post.id)  # type: ignore

    return db_blog_post

@router.put("/blog/{blog_post_id}", response_model=BlogPostRead)
async def update_blog_post(blog_post_id:schemaUUID, blog_post:BlogPostUpdate, request: Request, db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:

    """
    Update a blog post

    Args:
    blog_post_id (UUID): The ID of the blog post
    blog_post (BlogPostUpdate): The updated data for the blog post
    request (Request): The request object
    csrf_protect (CsrfProtect): CSRF protection
    db (Session): The database session

    Returns:
    blog_post (BlogPostUpdate): The updated data for the blog post
    """

    db_blog_post = func_update_blog_post(db=db, blog_post_id=blog_post_id, blog_post=blog_post)

    if(db_blog_post is None):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog post not found")

    return db_blog_post

@router.delete("/blog/{blog_post_id}", response_model=BlogPostRead)
async def delete_blog_post(blog_post_id:schemaUUID, request: Request, db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:

    """
    Delete a blog post

    Args:
    blog_post_id (UUID): The ID of the blog post
    request (Request): The request object
    csrf_protect (CsrfProtect): CSRF protection
    db (Session): The database session
    current_user (str): The current user

    Returns:
    BlogPostRead: The deleted blog post
    """

    db_blog_post = func_delete_blog_post(db=db, blog_post_id=blog_post_id)

    if(db_blog_post is None):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog post not found")

    return db_blog_post

@router.get("/latest-blogs", response_model=list[BlogPostRead])
def read_latest_blog_posts(request:Request, limit:int = 5, db:Session = Depends(get_db)):

    """
    Read the latest blog posts

    Args:
    limit (int): The number of posts to return
    db (Session): The database session

    Returns:
    list[BlogPostRead]: The latest blog posts
    """

    require_blog_available(request, db)

    return func_get_recent_blog_posts(db, skip=0, limit=limit)

@router.get("/blog-count", response_model=int)
def get_blog_count(request:Request, db: Session = Depends(get_db)) -> int:

    """
    Get the total count of blog posts

    Args:
    db (Session): The database session

    Returns:
    int: The total count of blog posts
    """

    require_blog_available(request, db)

    from sqlalchemy import func
    from database import BlogPostModel
    return db.query(func.count(BlogPostModel.id)).scalar()

@router.get("/all-blogs", response_model=list[BlogPostRead])
def read_all_blog_posts(request:Request, db:Session = Depends(get_db)):

    """
    Read all blog posts

    Args:
    db (Session): The database session

    Returns:
    list[BlogPostRead]: All blog posts
    """

    require_blog_available(request, db)

    return func_get_all_blog_posts(db)
