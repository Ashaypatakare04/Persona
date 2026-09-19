from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.common import ConversationRead, MessageRead, MessageCreate
from app.agent.orchestrator import AIOrchestrator
from app.api.websocket import manager

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationRead])
async def list_conversations(
    channel: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Conversation)
        .options(
            selectinload(Conversation.contact),
            selectinload(Conversation.messages)
        )
        .order_by(Conversation.updated_at.desc())
    )
    if channel:
        query = query.where(Conversation.channel == channel)
    if status:
        query = query.where(Conversation.status == status)
    if priority:
        query = query.where(Conversation.priority == priority)

    res = await db.execute(query)
    return res.scalars().all()

@router.get("/{conversation_id}", response_model=ConversationRead)
async def get_conversation(conversation_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Conversation)
        .options(
            selectinload(Conversation.contact),
            selectinload(Conversation.messages)
        )
        .where(Conversation.id == conversation_id)
    )
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.post("/{conversation_id}/messages", response_model=MessageRead)
async def send_human_message(
    conversation_id: int,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # This is a human manual message (from Ashay)
    msg = Message(
        conversation_id=conversation_id,
        sender_type="user_human",
        sender_name="Ashay",
        content=data.content,
        channel=conv.channel,
        status="sent"
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    # Broadcast event
    await manager.broadcast({
        "type": "new_message",
        "conversation_id": conversation_id,
        "message": {
            "id": msg.id,
            "sender_type": msg.sender_type,
            "sender_name": msg.sender_name,
            "content": msg.content,
            "channel": msg.channel
        }
    })

    return msg

@router.post("/{conversation_id}/takeover")
async def takeover_conversation(conversation_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.human_taken_over = True
    conv.status = "human_takeover"
    await db.commit()

    await manager.broadcast({
        "type": "human_takeover",
        "conversation_id": conversation_id,
        "status": "human_takeover"
    })

    return {"status": "success", "message": "Conversation successfully taken over by Ashay."}
