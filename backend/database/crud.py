## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in libraries
from uuid import UUID

import typing

## third-party libraries
from sqlalchemy.orm import Session

## custom modules
import models, schemas

def get_blog_posts(db:Session, skip:int=0, limit:int=10) -> typing.List[models.BlogPost]:
    
    """
    
    Get the blog posts from the database with the given skip and limit.

    Args:
    db (Session): The SQLAlchemy session
    skip (int): The number of blog posts to skip
    limit (int): The number of blog posts to get

    Returns:
    typing.List[models.BlogPost]: The list of blog posts

    """

    return db.query(models.BlogPost).offset(skip).limit(limit).all()

def get_all_blog_posts(db:Session) -> typing.List[models.BlogPost]:

    """

    Get all the blog posts from the database in descending order.

    Args:
    db (Session): The SQLAlchemy session
    skip (int): The number of blog posts to skip
    limit (int): The number of blog posts to get

    Returns:
    typing.List[models.BlogPost]: The list of blog posts

    """

    return db.query(models.BlogPost).order_by(models.BlogPost.created_at.desc()).all()

def get_recent_blog_posts(db:Session, skip:int=0, limit:int=10) -> typing.List[models.BlogPost]:

    """

    Get the recent blog posts from the database with the given skip and limit.

    Args:
    db (Session): The SQLAlchemy session
    skip (int): The number of blog posts to skip
    limit (int): The number of blog posts to get

    Returns:
    typing.List[models.BlogPost]: The list of blog posts

    """

    return db.query(models.BlogPost).order_by(models.BlogPost.created_at.desc()).offset(skip).limit(limit).all()

def get_blog_post(db:Session, blog_post_id:UUID) -> models.BlogPost:

    """

    Get the blog post from the database with the given ID.

    Args:
    db (Session): The SQLAlchemy session
    blog_post_id (UUID): The ID of the blog post

    Returns:
    models.BlogPost: The blog post

    """

    return db.query(models.BlogPost).filter(models.BlogPost.id == blog_post_id).first()

def create_blog_post(db:Session, db_blog_post:models.BlogPost) -> models.BlogPost:

    """

    Create a blog post in the database.

    Args:
    db (Session): The SQLAlchemy session
    db_blog_post (models.BlogPost): The blog post to create

    Returns:
    models.BlogPost: The created blog post

    """

    db.add(db_blog_post)
    db.commit()
    db.refresh(db_blog_post)

    return db_blog_post

def update_blog_post(db:Session, blog_post_id:UUID, blog_post:schemas.BlogPostUpdate) -> models.BlogPost:

    """

    Update the blog post in the database with the given ID.

    Args:
    db (Session): The SQLAlchemy session
    blog_post_id (UUID): The ID of the blog post
    blog_post (schemas.BlogPostUpdate): The blog post to update

    Returns:
    models.BlogPost: The updated blog post

    """

    db_blog_post = db.query(models.BlogPost).filter(models.BlogPost.id == blog_post_id).first()

    if(db_blog_post):
        for key, value in blog_post.model_dump().items():
            setattr(db_blog_post, key, value)
        db.commit()
        db.refresh(db_blog_post)

    return db_blog_post

def delete_blog_post(db:Session, blog_post_id:UUID) -> models.BlogPost:

    """

    Delete the blog post in the database with the given ID.

    Args:
    db (Session): The SQLAlchemy session
    blog_post_id (UUID): The ID of the blog post
    
    Returns:
    models.BlogPost: The deleted blog post

    """

    db_blog_post = db.query(models.BlogPost).filter(models.BlogPost.id == blog_post_id).first()
    if(db_blog_post):
        db.delete(db_blog_post)
        db.commit()
    return db_blog_post
