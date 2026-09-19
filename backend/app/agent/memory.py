from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.knowledge import KnowledgeItem
from app.models.message import Message

class MemoryManager:
    """
    Multi-tier memory retriever:
    - Short-term conversation context
    - Filtered personal knowledge (calendar, availability, public facts)
    """

    @classmethod
    async def get_permitted_knowledge(
        cls,
        db: AsyncSession,
        calendar_allowed: bool,
        notes_allowed: bool
    ) -> str:
        stmt = select(KnowledgeItem).where(KnowledgeItem.is_active == True)
        res = await db.execute(stmt)
        items = res.scalars().all()

        permitted_chunks = []
        for item in items:
            if item.category == "calendar" and not calendar_allowed:
                continue
            if item.category == "note" and not notes_allowed:
                continue
            if item.sensitivity == "STRICT_PRIVATE" and not notes_allowed:
                continue

            permitted_chunks.append(f"- [{item.category.upper()}] {item.title}: {item.content}")

        return "\n".join(permitted_chunks)

    @classmethod
    async def get_recent_conversation_history(
        cls,
        db: AsyncSession,
        conversation_id: int,
        limit: int = 6
    ) -> List[Dict[str, str]]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        res = await db.execute(stmt)
        messages = list(reversed(res.scalars().all()))

        history = []
        for m in messages:
            history.append({
                "sender": m.sender_type,
                "text": m.content
            })
        return history
