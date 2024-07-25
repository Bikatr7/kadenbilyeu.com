## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

from sqlalchemy.orm import Session
from . import models, schemas

def get_blog_posts(db:Session, skip:int = 0, limit:int = 10):
    return db.query(models.BlogPost).offset(skip).limit(limit).all()

def get_blog_post(db:Session, blog_post_id:int):
    return db.query(models.BlogPost).filter(models.BlogPost.id == blog_post_id).first()

def create_blog_post(db:Session, blog_post:schemas.BlogPostCreate):
    db_blog_post = models.BlogPost(**blog_post.model_dump())
    db.add(db_blog_post)
    db.commit()
    db.refresh(db_blog_post)
    return db_blog_post

def update_blog_post(db:Session, blog_post_id:int, blog_post:schemas.BlogPostUpdate):
    db_blog_post = db.query(models.BlogPost).filter(models.BlogPost.id == blog_post_id).first()
    if(db_blog_post):
        for key, value in blog_post.model_dump().items():
            setattr(db_blog_post, key, value)
        db.commit()
        db.refresh(db_blog_post)
    return db_blog_post

def delete_blog_post(db:Session, blog_post_id:int):
    db_blog_post = db.query(models.BlogPost).filter(models.BlogPost.id == blog_post_id).first()
    if(db_blog_post):
        db.delete(db_blog_post)
        db.commit()
    return db_blog_post
