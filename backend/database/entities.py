## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in imports
import typing

## third-party imports
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID as schemaUUID, uuid4
from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime, timezone
from database.manager import Base
from sqlalchemy.dialects.postgresql import UUID as modelUUID


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

    class Config:
        from_attributes = True

class BlogPostModel(Base):
    __tablename__ = "blog_posts"
    id = Column(modelUUID(as_uuid=True), primary_key=True, index=True, default=uuid4)
    title = Column(String, index=True)
    content = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))