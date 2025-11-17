from sqlalchemy import Column, Integer, String, DateTime, Boolean, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# Association table for many-to-many relationship between videos and categories
video_categories = Table(
    'video_categories',
    Base.metadata,
    Column('video_id', Integer, ForeignKey('videos.id', ondelete='CASCADE'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id', ondelete='CASCADE'), primary_key=True)
)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    order_position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to videos
    videos = relationship("Video", secondary=video_categories, back_populates="categories")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "order_position": self.order_position,
            "video_count": len(self.videos) if self.videos else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    filename = Column(String, nullable=False, unique=True)
    thumbnail = Column(String, nullable=True)
    duration = Column(Integer, nullable=True)  # Duration in seconds
    file_size = Column(Integer, nullable=True)  # Size in bytes
    order_position = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to categories
    categories = relationship("Category", secondary=video_categories, back_populates="videos")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "filename": self.filename,
            "thumbnail": self.thumbnail,
            "duration": self.duration,
            "file_size": self.file_size,
            "order_position": self.order_position,
            "is_active": self.is_active,
            "categories": [{"id": cat.id, "name": cat.name} for cat in self.categories] if self.categories else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
