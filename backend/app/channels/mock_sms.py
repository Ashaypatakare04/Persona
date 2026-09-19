from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.channels.base import ChannelAdapter
from app.models.conversation import Conversation
from app.models.message import Message
from app.agent.orchestrator import AIOrchestrator

class MockSMSAdapter(ChannelAdapter):
    @property
    def channel_type(self) -> str:
        return "sms"

    async def get_or_create_conversation(
        self,
        db: AsyncSession,
        external_id: str,
        contact_id: Optional[int] = None
    ) -> Conversation:
        stmt = select(Conversation).where(
            Conversation.channel == "sms",
            Conversation.external_identifier == external_id
        )
        res = await db.execute(stmt)
        conv = res.scalar_one_or_none()
        if not conv:
            conv = Conversation(
                channel="sms",
                external_identifier=external_id,
                contact_id=contact_id,
                title=f"SMS ({external_id})"
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
        sender_phone = payload.get("sender_phone", "+91 98000 11111")
        sender_name = payload.get("sender_name", sender_phone)

        msg = Message(
            conversation_id=conv_id,
            sender_type="contact",
            sender_name=sender_name,
            content=text,
            channel="sms",
            status="received"
        )
        db.add(msg)
        await db.commit()

        return await AIOrchestrator.process_incoming_event(
            db=db,
            conversation_id=conv_id,
            raw_text=text,
            channel="sms",
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
            sender_name="Ashay (Human SMS)",
            content=content,
            channel="sms",
            status="sent"
        )
        db.add(msg)
        await db.commit()
        return True


class MockEmailAdapter(ChannelAdapter):
    @property
    def channel_type(self) -> str:
        return "email"

    async def get_or_create_conversation(
        self,
        db: AsyncSession,
        external_id: str,
        contact_id: Optional[int] = None
    ) -> Conversation:
        stmt = select(Conversation).where(
            Conversation.channel == "email",
            Conversation.external_identifier == external_id
        )
        res = await db.execute(stmt)
        conv = res.scalar_one_or_none()
        if not conv:
            conv = Conversation(
                channel="email",
                external_identifier=external_id,
                contact_id=contact_id,
                title=f"Email ({external_id})"
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
        subject = payload.get("subject", "No Subject")
        body = payload.get("body", payload.get("text", ""))
        sender_email = payload.get("sender_email", "someone@example.com")
        sender_name = payload.get("sender_name", sender_email)

        full_content = f"Subject: {subject}\n\n{body}"
        msg = Message(
            conversation_id=conv_id,
            sender_type="contact",
            sender_name=sender_name,
            content=full_content,
            channel="email",
            status="received"
        )
        db.add(msg)
        await db.commit()

        return await AIOrchestrator.process_incoming_event(
            db=db,
            conversation_id=conv_id,
            raw_text=body,
            channel="email",
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
            sender_name="Ashay (Human Email)",
            content=content,
            channel="email",
            status="sent"
        )
        db.add(msg)
        await db.commit()
        return True
