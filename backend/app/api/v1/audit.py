from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.audit import AuditLog
from app.schemas.common import AuditLogRead

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("", response_model=List[AuditLogRead])
async def list_audit_logs(
    category: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    query = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    if category:
        query = query.where(AuditLog.category == category)
    if event_type:
        query = query.where(AuditLog.event_type == event_type)

    res = await db.execute(query)
    return res.scalars().all()
