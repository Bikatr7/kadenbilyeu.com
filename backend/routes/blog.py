## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

from fastapi import APIRouter, Request, Header, Depends
from fastapi_csrf_protect import CsrfProtect

from auth import get_current_active_user
from database import (
    BlogPostRead, BlogPostCreate, BlogPostUpdate,
    func_get_blog_posts, func_get_blog_post, func_get_blog_post_by_slug,
    func_create_blog_post, func_update_blog_post, func_delete_blog_post,
    func_get_recent_blog_posts, func_get_all_blog_posts, func_increment_view_count,
    get_db, schemaUUID
)
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/blog", response_model=BlogPostRead)
async def create_blog_post(blog_post:BlogPostCreate, request: Request, csrf_protect: CsrfProtect = Depends(), db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:

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

    try:
        await csrf_protect.validate_csrf(request)
    except:
        # If CSRF validation fails, still allow operation for authenticated users
        pass

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
def read_blog_posts(skip:int = 0, limit:int = 10, db:Session = Depends(get_db)):

    """
    Read blog posts from the database

    Args:
    skip (int): The number of posts to skip
    limit (int): The number of posts to return
    db (Session): The database session
    """

    return func_get_blog_posts(db, skip=skip, limit=limit)

@router.get("/blog/{blog_post_id}", response_model=BlogPostRead)
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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog post not found")

    from auth import is_token_blacklisted

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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog post not found")

    from auth import is_token_blacklisted

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
async def update_blog_post(blog_post_id:schemaUUID, blog_post:BlogPostUpdate, request: Request, csrf_protect: CsrfProtect = Depends(), db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:

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
    try:
        await csrf_protect.validate_csrf(request)
    except:
        # If CSRF validation fails, still allow operation for authenticated users
        pass

    db_blog_post = func_update_blog_post(db=db, blog_post_id=blog_post_id, blog_post=blog_post)

    if(db_blog_post is None):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog post not found")

    return db_blog_post

@router.delete("/blog/{blog_post_id}", response_model=BlogPostRead)
async def delete_blog_post(blog_post_id:schemaUUID, request: Request, csrf_protect: CsrfProtect = Depends(), db:Session = Depends(get_db), current_user:str = Depends(get_current_active_user)) -> BlogPostRead:

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
    try:
        await csrf_protect.validate_csrf(request)
    except:
        # If CSRF validation fails, still allow operation for authenticated users
        pass

    db_blog_post = func_delete_blog_post(db=db, blog_post_id=blog_post_id)

    if(db_blog_post is None):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog post not found")

    return db_blog_post

@router.get("/latest-blogs", response_model=list[BlogPostRead])
def read_latest_blog_posts(limit:int = 5, db:Session = Depends(get_db)):

    """
    Read the latest blog posts

    Args:
    limit (int): The number of posts to return
    db (Session): The database session

    Returns:
    list[BlogPostRead]: The latest blog posts
    """

    return func_get_recent_blog_posts(db, skip=0, limit=limit)

@router.get("/blog-count", response_model=int)
def get_blog_count(db: Session = Depends(get_db)) -> int:

    """
    Get the total count of blog posts

    Args:
    db (Session): The database session

    Returns:
    int: The total count of blog posts
    """

    from sqlalchemy import func
    from database import BlogPostModel
    return db.query(func.count(BlogPostModel.id)).scalar()

@router.get("/all-blogs", response_model=list[BlogPostRead])
def read_all_blog_posts(db:Session = Depends(get_db)):

    """
    Read all blog posts

    Args:
    db (Session): The database session

    Returns:
    list[BlogPostRead]: All blog posts
    """

    return func_get_all_blog_posts(db)
