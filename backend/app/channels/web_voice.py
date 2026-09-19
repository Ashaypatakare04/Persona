import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.channels.base import ChannelAdapter
from app.models.conversation import Conversation
from app.models.call import Call, TranscriptTurn
from app.models.message import Message
from app.agent.orchestrator import AIOrchestrator

class WebVoiceAdapter(ChannelAdapter):
    @property
    def channel_type(self) -> str:
        return "call"

    async def get_or_create_conversation(
        self,
        db: AsyncSession,
        external_id: str,
        contact_id: Optional[int] = None
    ) -> Conversation:
        stmt = select(Conversation).where(
            Conversation.channel == "call",
            Conversation.external_identifier == external_id
        )
        res = await db.execute(stmt)
        conv = res.scalar_one_or_none()
        if not conv:
            conv = Conversation(
                channel="call",
                external_identifier=external_id,
                contact_id=contact_id,
                title=f"Call ({external_id})"
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
        caller_name = payload.get("caller_name", "Caller")
        caller_phone = payload.get("caller_phone", "+91 00000 00000")
        call_id = payload.get("call_id")

        # Create or update Call entity
        if not call_id:
            call = Call(
                conversation_id=conv_id,
                caller_name=caller_name,
                caller_phone=caller_phone,
                status="active"
            )
            db.add(call)
            await db.commit()
            await db.refresh(call)
            call_id = call.id
        else:
            c_stmt = select(Call).where(Call.id == call_id)
            c_res = await db.execute(c_stmt)
            call = c_res.scalar_one_or_none()

        # Log caller transcript turn
        turn = TranscriptTurn(
            call_id=call_id,
            speaker="caller",
            text=text,
            confidence=1.0
        )
        db.add(turn)

        # Also mirror in conversation messages
        msg = Message(
            conversation_id=conv_id,
            sender_type="contact",
            sender_name=caller_name,
            content=f"[Voice Turn] {text}",
            channel="call",
            status="received"
        )
        db.add(msg)
        await db.commit()

        # Run AI Orchestrator
        result = await AIOrchestrator.process_incoming_event(
            db=db,
            conversation_id=conv_id,
            raw_text=text,
            channel="call",
            sender_name=caller_name
        )

        ai_response = result.get("sent_response") or result.get("trace", {}).get("generated_response")
        if ai_response:
            ai_turn = TranscriptTurn(
                call_id=call_id,
                speaker="ai_representative",
                text=ai_response,
                confidence=1.0
            )
            db.add(ai_turn)
            if call:
                call.risk_level = result["trace"]["risk_level"]
                call.priority = result["trace"]["priority_level"]
            await db.commit()

        result["call_id"] = call_id
        return result

    async def send_outbound(
        self,
        db: AsyncSession,
        conversation_id: int,
        content: str
    ) -> bool:
        msg = Message(
            conversation_id=conversation_id,
            sender_type="user_human",
            sender_name="Ashay (Human Voice Takeover)",
            content=f"[Voice Takeover] {content}",
            channel="call",
            status="sent"
        )
        db.add(msg)
        await db.commit()
        return True
