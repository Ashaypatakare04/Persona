import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.call import Call
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.approval import Approval
from app.models.contact import Contact

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Total calls today
    call_stmt = select(func.count(Call.id)).where(Call.created_at >= today_start)
    call_res = await db.execute(call_stmt)
    calls_today = call_res.scalar() or 0

    # Total messages today
    msg_stmt = select(func.count(Message.id)).where(Message.created_at >= today_start)
    msg_res = await db.execute(msg_stmt)
    messages_today = msg_res.scalar() or 0

    # Pending approvals
    appr_stmt = select(func.count(Approval.id)).where(Approval.status == "PENDING")
    appr_res = await db.execute(appr_stmt)
    pending_approvals = appr_res.scalar() or 0

    # Escalations
    esc_stmt = select(func.count(Conversation.id)).where(Conversation.status == "escalated")
    esc_res = await db.execute(esc_stmt)
    escalations_count = esc_res.scalar() or 0

    # AI Handled Messages count
    ai_msg_stmt = select(func.count(Message.id)).where(Message.sender_type == "ai_representative")
    ai_res = await db.execute(ai_msg_stmt)
    ai_handled_count = ai_res.scalar() or 0

    # High Priority Conversations
    hp_stmt = select(func.count(Conversation.id)).where(Conversation.priority == "HIGH")
    hp_res = await db.execute(hp_stmt)
    high_priority_count = hp_res.scalar() or 0

    # Total active contacts
    contact_stmt = select(func.count(Contact.id))
    c_res = await db.execute(contact_stmt)
    contacts_count = c_res.scalar() or 0

    return {
        "calls_today": calls_today,
        "messages_today": messages_today,
        "pending_approvals": pending_approvals,
        "escalations_count": escalations_count,
        "ai_handled_count": ai_handled_count,
        "high_priority_count": high_priority_count,
        "contacts_count": contacts_count
    }
