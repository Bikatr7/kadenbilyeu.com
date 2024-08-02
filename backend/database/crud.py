## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in libraries
from uuid import UUID

import typing

## third-party libraries
from sqlalchemy.orm import Session

## custom modules
from .entities import BlogPostModel, BlogPostUpdate

def get_blog_posts(db:Session, skip:int=0, limit:int=10) -> typing.List[BlogPostModel]:
    
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

def get_all_blog_posts(db:Session) -> typing.List[BlogPostModel]:

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

def get_recent_blog_posts(db:Session, skip:int=0, limit:int=10) -> typing.List[BlogPostModel]:

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

def get_blog_post(db:Session, blog_post_id:UUID) -> BlogPostModel:

    """

    Get the blog post from the database with the given ID.

    Args:
    db (Session): The SQLAlchemy session
    blog_post_id (UUID): The ID of the blog post

    Returns:
    BlogPostModel: The blog post

    """

    return db.query(BlogPostModel).filter(BlogPostModel.id == blog_post_id).first()

def create_blog_post(db:Session, db_blog_post:BlogPostModel) -> BlogPostModel:

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

def update_blog_post(db:Session, blog_post_id:UUID, blog_post:BlogPostUpdate) -> BlogPostModel:

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

def delete_blog_post(db:Session, blog_post_id:UUID) -> BlogPostModel:

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
