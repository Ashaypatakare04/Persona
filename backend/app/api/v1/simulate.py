from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.contact import Contact
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.common import SimulateEventRequest, SimulateEventResponse, DecisionTrace
from app.agent.orchestrator import AIOrchestrator
from app.channels.web_chat import WebChatAdapter
from app.channels.web_voice import WebVoiceAdapter
from app.channels.mock_sms import MockSMSAdapter, MockEmailAdapter
from app.api.websocket import manager

router = APIRouter(prefix="/simulate", tags=["Simulation Sandbox"])

@router.post("/incoming", response_model=SimulateEventResponse)
async def simulate_incoming_communication(
    req: SimulateEventRequest,
    db: AsyncSession = Depends(get_db)
):
    channel = req.channel.lower()
    
    # 1. Resolve Contact if provided
    contact = None
    if req.contact_id:
        c_stmt = select(Contact).where(Contact.id == req.contact_id)
        c_res = await db.execute(c_stmt)
        contact = c_res.scalar_one_or_none()
    elif req.sender_name:
        c_stmt = select(Contact).where(Contact.name.ilike(f"%{req.sender_name}%"))
        c_res = await db.execute(c_stmt)
        contact = c_res.scalar_one_or_none()

    sender_name = contact.name if contact else (req.sender_name or "Unknown Inquirer")
    contact_phone = contact.phone if contact else None
    external_id = contact_phone or req.sender_phone_or_email or f"sim-{sender_name.lower().replace(' ', '_')}"

    # 2. Get or create conversation for this channel & contact
    conv_stmt = select(Conversation).where(
        Conversation.channel == channel,
        Conversation.external_identifier == external_id
    )
    conv_res = await db.execute(conv_stmt)
    conv = conv_res.scalar_one_or_none()
    if not conv:
        conv = Conversation(
            channel=channel,
            external_identifier=external_id,
            contact_id=contact.id if contact else None,
            title=f"{channel.upper()} with {sender_name}"
        )
        db.add(conv)
        await db.commit()
        await db.refresh(conv)

    # 3. Store inbound message
    inbound_msg = Message(
        conversation_id=conv.id,
        sender_type="contact",
        sender_name=sender_name,
        content=req.message_content,
        channel=channel,
        status="received"
    )
    db.add(inbound_msg)
    await db.commit()
    await db.refresh(inbound_msg)

    # 4. Route through AI Orchestrator
    result = await AIOrchestrator.process_incoming_event(
        db=db,
        conversation_id=conv.id,
        raw_text=req.message_content,
        channel=channel,
        sender_name=sender_name
    )

    trace_data = result["trace"]

    # 5. Broadcast to real-time WebSocket dashboard
    await manager.broadcast({
        "type": "simulated_event_processed",
        "conversation_id": conv.id,
        "channel": channel,
        "sender_name": sender_name,
        "message": req.message_content,
        "trace": trace_data,
        "sent_response": result.get("sent_response"),
        "pending_approval_id": result.get("pending_approval_id")
    })

    return SimulateEventResponse(
        conversation_id=conv.id,
        message_id=inbound_msg.id,
        trace=DecisionTrace(**trace_data),
        pending_approval_id=result.get("pending_approval_id"),
        sent_response=result.get("sent_response")
    )
