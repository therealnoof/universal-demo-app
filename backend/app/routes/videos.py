from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional
import os
import shutil
from pathlib import Path
from ..database import get_db
from ..models import Video
from moviepy.editor import VideoFileClip
from PIL import Image
import uuid

router = APIRouter(prefix="/api/videos", tags=["videos"])

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_video_duration(video_path: str) -> int:
    """Get video duration in seconds"""
    try:
        with VideoFileClip(video_path) as video:
            return int(video.duration)
    except:
        return 0

def generate_thumbnail(video_path: str, thumbnail_path: str) -> bool:
    """Generate thumbnail from video"""
    try:
        with VideoFileClip(video_path) as video:
            frame = video.get_frame(min(1.0, video.duration / 2))
            img = Image.fromarray(frame)
            img.thumbnail((320, 180))
            img.save(thumbnail_path)
            return True
    except:
        return False

@router.get("/")
async def get_videos(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Get all videos"""
    query = select(Video)
    if active_only:
        query = query.where(Video.is_active == True)
    query = query.order_by(Video.order_position, Video.created_at.desc())

    result = await db.execute(query)
    videos = result.scalars().all()
    return [video.to_dict() for video in videos]

@router.get("/{video_id}")
async def get_video(
    video_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a single video by ID"""
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video.to_dict()

@router.post("/")
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """Upload a new video"""
    # Validate file type
    allowed_extensions = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Get file size
    file_size = os.path.getsize(file_path)

    # Get video duration
    duration = get_video_duration(str(file_path))

    # Generate thumbnail
    thumbnail_filename = f"{uuid.uuid4()}.jpg"
    thumbnail_path = UPLOAD_DIR / thumbnail_filename
    thumbnail_generated = generate_thumbnail(str(file_path), str(thumbnail_path))

    # Create database entry
    video = Video(
        title=title,
        description=description,
        filename=unique_filename,
        thumbnail=thumbnail_filename if thumbnail_generated else None,
        duration=duration,
        file_size=file_size,
        order_position=0
    )

    db.add(video)
    await db.commit()
    await db.refresh(video)

    return video.to_dict()

@router.put("/{video_id}")
async def update_video(
    video_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    order_position: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Update video metadata"""
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if title is not None:
        video.title = title
    if description is not None:
        video.description = description
    if order_position is not None:
        video.order_position = order_position
    if is_active is not None:
        video.is_active = is_active

    await db.commit()
    await db.refresh(video)

    return video.to_dict()

@router.delete("/{video_id}")
async def delete_video(
    video_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a video"""
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Delete files
    try:
        video_path = UPLOAD_DIR / video.filename
        if video_path.exists():
            os.remove(video_path)

        if video.thumbnail:
            thumbnail_path = UPLOAD_DIR / video.thumbnail
            if thumbnail_path.exists():
                os.remove(thumbnail_path)
    except Exception as e:
        print(f"Error deleting files: {e}")

    # Delete database entry
    await db.delete(video)
    await db.commit()

    return {"message": "Video deleted successfully"}

@router.get("/stream/{filename}")
async def stream_video(filename: str):
    """Stream video file"""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.get("/thumbnail/{filename}")
async def get_thumbnail(filename: str):
    """Get video thumbnail"""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(file_path)
