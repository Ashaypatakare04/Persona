from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.knowledge import KnowledgeItem
from app.schemas.common import KnowledgeItemRead, KnowledgeItemCreate, KnowledgeItemUpdate

router = APIRouter(prefix="/knowledge", tags=["Knowledge"])

@router.get("", response_model=List[KnowledgeItemRead])
async def list_knowledge(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(KnowledgeItem).order_by(KnowledgeItem.category)
    if category:
        query = query.where(KnowledgeItem.category == category)
    res = await db.execute(query)
    return res.scalars().all()

@router.post("", response_model=KnowledgeItemRead)
async def create_knowledge_item(
    data: KnowledgeItemCreate,
    db: AsyncSession = Depends(get_db)
):
    item = KnowledgeItem(
        category=data.category,
        title=data.title,
        content=data.content,
        sensitivity=data.sensitivity,
        is_active=data.is_active
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.put("/{item_id}", response_model=KnowledgeItemRead)
async def update_knowledge_item(
    item_id: int,
    data: KnowledgeItemUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(KnowledgeItem).where(KnowledgeItem.id == item_id)
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)

    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{item_id}")
async def delete_knowledge_item(item_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(KnowledgeItem).where(KnowledgeItem.id == item_id)
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")

    await db.delete(item)
    await db.commit()
    return {"status": "success", "message": "Item deleted"}
