import pytest
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

os.environ['DATABASE_URL'] = 'sqlite:///./test_blog.db'

from database import (
    BlogPostModel, BlogPostCreate, BlogPostUpdate, BlogPostRead,
    func_get_blog_posts, func_create_blog_post, func_get_blog_post,
    func_update_blog_post, func_delete_blog_post, func_increment_view_count,
    get_db, SessionLocal
)


@pytest.fixture(scope="function")
def db_session(tmp_path):
    db_path = tmp_path / "test_blog.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})

    from database import Base
    Base.metadata.create_all(bind=engine)

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


class TestBlogPostModel:
    def test_blog_post_creation(self, db_session):
        blog_post = BlogPostModel(
            title="Test Post",
            content="Test content",
            author="Test Author"
        )

        db_session.add(blog_post)
        db_session.commit()
        db_session.refresh(blog_post)

        assert blog_post.id is not None
        assert blog_post.title == "Test Post"
        assert blog_post.content == "Test content"
        assert blog_post.author == "Test Author"
        assert blog_post.view_count == 0
        assert blog_post.created_at is not None
        assert blog_post.updated_at is not None


class TestDatabaseFunctions:
    def test_func_create_blog_post(self, db_session):
        blog_post = BlogPostModel(
            title="Test Post",
            content="Test content",
            author="Test Author"
        )

        result = func_create_blog_post(db_session, blog_post)

        assert result.id is not None
        assert result.title == "Test Post"
        assert result.content == "Test content"
        assert result.author == "Test Author"

    def test_func_get_blog_post(self, db_session):
        blog_post = BlogPostModel(
            title="Test Post",
            content="Test content",
            author="Test Author"
        )
        db_session.add(blog_post)
        db_session.commit()
        db_session.refresh(blog_post)

        result = func_get_blog_post(db_session, blog_post.id)

        assert result is not None
        assert result.id == blog_post.id
        assert result.title == "Test Post"

    def test_func_get_blog_post_not_found(self, db_session):
        from uuid import uuid4
        result = func_get_blog_post(db_session, uuid4())
        assert result is None

    def test_func_get_blog_posts(self, db_session):
        posts = []
        for i in range(3):
            post = BlogPostModel(
                title=f"Test Post {i}",
                content=f"Test content {i}",
                author="Test Author"
            )
            db_session.add(post)
            posts.append(post)

        db_session.commit()

        result = func_get_blog_posts(db_session)

        assert len(result) >= 3

    def test_func_update_blog_post(self, db_session):
        blog_post = BlogPostModel(
            title="Original Title",
            content="Original content",
            author="Original Author"
        )
        db_session.add(blog_post)
        db_session.commit()
        db_session.refresh(blog_post)

        update_data = BlogPostUpdate(
            title="Updated Title",
            content="Updated content",
            author="Updated Author"
        )

        result = func_update_blog_post(db_session, blog_post.id, update_data)

        assert result is not None
        assert result.title == "Updated Title"
        assert result.content == "Updated content"
        assert result.author == "Updated Author"

    def test_func_delete_blog_post(self, db_session):
        blog_post = BlogPostModel(
            title="Test Post",
            content="Test content",
            author="Test Author"
        )
        db_session.add(blog_post)
        db_session.commit()
        db_session.refresh(blog_post)

        result = func_delete_blog_post(db_session, blog_post.id)

        assert result is not None
        assert result.id == blog_post.id

        deleted_post = func_get_blog_post(db_session, blog_post.id)
        assert deleted_post is None

    def test_func_increment_view_count(self, db_session):
        blog_post = BlogPostModel(
            title="Test Post",
            content="Test content",
            author="Test Author",
            view_count=5
        )
        db_session.add(blog_post)
        db_session.commit()
        db_session.refresh(blog_post)

        func_increment_view_count(db_session, blog_post.id)

        updated_post = func_get_blog_post(db_session, blog_post.id)
        assert updated_post.view_count == 6


class TestPydanticModels:
    def test_blog_post_create(self):
        post = BlogPostCreate(
            title="Test Title",
            content="Test content",
            author="Test Author"
        )

        assert post.title == "Test Title"
        assert post.content == "Test content"
        assert post.author == "Test Author"

    def test_blog_post_update_partial(self):
        update = BlogPostUpdate(title="New Title")
        assert update.title == "New Title"
        assert update.content is None
        assert update.author is None

    def test_blog_post_read(self):
        from datetime import datetime, timezone
        from uuid import uuid4

        post = BlogPostRead(
            id=uuid4(),
            title="Test Title",
            content="Test content",
            author="Test Author",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            view_count=10
        )

        assert post.title == "Test Title"
        assert post.view_count == 10