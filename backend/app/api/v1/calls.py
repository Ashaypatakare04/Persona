from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.call import Call, TranscriptTurn
from app.models.conversation import Conversation
from app.schemas.common import CallRead
from app.api.websocket import manager

router = APIRouter(prefix="/calls", tags=["Calls"])

@router.get("", response_model=List[CallRead])
async def list_calls(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Call).options(selectinload(Call.transcript_turns)).order_by(Call.created_at.desc())
    if status:
        query = query.where(Call.status == status)
    res = await db.execute(query)
    return res.scalars().all()

@router.get("/{call_id}", response_model=CallRead)
async def get_call(call_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Call).options(selectinload(Call.transcript_turns)).where(Call.id == call_id)
    res = await db.execute(stmt)
    call = res.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call

@router.post("/{call_id}/control")
async def call_control(
    call_id: int,
    action: str, # "takeover", "continue_ai", "end_call"
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Call).where(Call.id == call_id)
    res = await db.execute(stmt)
    call = res.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if action == "takeover":
        call.status = "taken_over"
        c_stmt = select(Conversation).where(Conversation.id == call.conversation_id)
        c_res = await db.execute(c_stmt)
        conv = c_res.scalar_one_or_none()
        if conv:
            conv.human_taken_over = True
            conv.status = "human_takeover"
    elif action == "continue_ai":
        call.status = "active"
    elif action == "end_call":
        call.status = "completed"

    await db.commit()

    await manager.broadcast({
        "type": "call_status_changed",
        "call_id": call_id,
        "action": action,
        "status": call.status
    })

    return {"status": "success", "action": action, "call_status": call.status}
