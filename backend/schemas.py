## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class BlogPostBase(BaseModel):
    title:str
    content:str
    author:str

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BlogPostBase):
    pass

class BlogPost(BlogPostBase):
    id:UUID
    created_at:datetime
    updated_at:datetime

    class Config:
        from_attributes = True
