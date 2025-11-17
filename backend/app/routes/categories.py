from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import Category, Video

router = APIRouter(prefix="/api/categories", tags=["categories"])

class CategoryCreate(BaseModel):
    name: str
    order_position: Optional[int] = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    order_position: Optional[int] = None

@router.get("/")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all categories"""
    result = await db.execute(select(Category).order_by(Category.order_position, Category.name))
    categories = result.scalars().all()
    return [cat.to_dict() for cat in categories]

@router.post("/")
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    """Create a new category"""
    # Check if category with same name already exists
    result = await db.execute(select(Category).where(Category.name == category.name))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")

    new_category = Category(
        name=category.name,
        order_position=category.order_position
    )
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category.to_dict()

@router.put("/{category_id}")
async def update_category(category_id: int, category: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    """Update a category"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    db_category = result.scalar_one_or_none()

    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check for duplicate name if updating name
    if category.name and category.name != db_category.name:
        result = await db.execute(select(Category).where(Category.name == category.name))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
        db_category.name = category.name

    if category.order_position is not None:
        db_category.order_position = category.order_position

    await db.commit()
    await db.refresh(db_category)
    return db_category.to_dict()

@router.delete("/{category_id}")
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a category"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    await db.delete(category)
    await db.commit()
    return {"message": "Category deleted successfully"}
