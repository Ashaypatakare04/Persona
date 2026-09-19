from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.channels.base import ChannelAdapter
from app.models.conversation import Conversation
from app.models.message import Message
from app.agent.orchestrator import AIOrchestrator

class WebChatAdapter(ChannelAdapter):
    @property
    def channel_type(self) -> str:
        return "chat"

    async def get_or_create_conversation(
        self,
        db: AsyncSession,
        external_id: str,
        contact_id: Optional[int] = None
    ) -> Conversation:
        stmt = select(Conversation).where(
            Conversation.channel == "chat",
            Conversation.external_identifier == external_id
        )
        res = await db.execute(stmt)
        conv = res.scalar_one_or_none()
        if not conv:
            conv = Conversation(
                channel="chat",
                external_identifier=external_id,
                contact_id=contact_id,
                title=f"Chat ({external_id})"
            )
            db.add(conv)
            await db.commit()
            await db.refresh(conv)
        return conv

    async def receive_inbound(
        self,
        db: AsyncSession,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        conv_id = payload.get("conversation_id")
        text = payload.get("text", "")
        sender_name = payload.get("sender_name", "User")

        # Record incoming message
        msg = Message(
            conversation_id=conv_id,
            sender_type="contact",
            sender_name=sender_name,
            content=text,
            channel="chat",
            status="received"
        )
        db.add(msg)
        await db.commit()
        await db.refresh(msg)

        # Process through orchestrator
        return await AIOrchestrator.process_incoming_event(
            db=db,
            conversation_id=conv_id,
            raw_text=text,
            channel="chat",
            sender_name=sender_name
        )

    async def send_outbound(
        self,
        db: AsyncSession,
        conversation_id: int,
        content: str
    ) -> bool:
        msg = Message(
            conversation_id=conversation_id,
            sender_type="user_human",
            sender_name="Ashay (Human)",
            content=content,
            channel="chat",
            status="sent"
        )
        db.add(msg)
        await db.commit()
        return True
