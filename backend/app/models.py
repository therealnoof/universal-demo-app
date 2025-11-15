from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

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
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
