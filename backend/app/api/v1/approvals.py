import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.approval import Approval
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.audit import AuditLog
from app.schemas.common import ApprovalRead, ApprovalResolveRequest
from app.agent.actions import ActionExecutor
from app.api.websocket import manager

router = APIRouter(prefix="/approvals", tags=["Approvals"])

@router.get("", response_model=List[ApprovalRead])
async def list_approvals(
    status: Optional[str] = "PENDING",
    db: AsyncSession = Depends(get_db)
):
    query = select(Approval).order_by(Approval.created_at.desc())
    if status:
        query = query.where(Approval.status == status)
    res = await db.execute(query)
    return res.scalars().all()

@router.post("/{approval_id}/resolve", response_model=ApprovalRead)
async def resolve_approval(
    approval_id: int,
    req: ApprovalResolveRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Approval).where(Approval.id == approval_id)
    res = await db.execute(stmt)
    approval = res.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")

    action = req.action.lower()
    approval.resolved_at = datetime.datetime.utcnow()
    approval.reviewer_notes = req.reviewer_notes

    # Fetch corresponding conversation
    c_stmt = select(Conversation).where(Conversation.id == approval.conversation_id)
    c_res = await db.execute(c_stmt)
    conv = c_res.scalar_one_or_none()

    if action == "approve":
        approval.status = "APPROVED"
        # Dispatch proposed message or execute action
        if conv:
            msg_content = approval.proposed_content
            ai_msg = Message(
                conversation_id=conv.id,
                sender_type="ai_representative",
                sender_name="AI Representative (Approved by Ashay)",
                content=msg_content,
                channel=conv.channel,
                status="sent"
            )
            db.add(ai_msg)

        if approval.proposed_tool:
            await ActionExecutor.execute(
                db=db,
                action_name=approval.proposed_tool,
                parameters=approval.tool_parameters or {},
                conversation_id=conv.id if conv else None
            )

    elif action == "edit":
        approval.status = "EDITED"
        approval.edited_content = req.edited_content or approval.proposed_content
        # Dispatch edited message
        if conv and req.edited_content:
            ai_msg = Message(
                conversation_id=conv.id,
                sender_type="user_human",
                sender_name="Ashay (via Approval)",
                content=req.edited_content,
                channel=conv.channel,
                status="sent"
            )
            db.add(ai_msg)

    elif action == "reject":
        approval.status = "REJECTED"

    elif action == "takeover":
        approval.status = "TAKEN_OVER"
        if conv:
            conv.human_taken_over = True
            conv.status = "human_takeover"

    audit_entry = AuditLog(
        event_type="HUMAN_APPROVAL_RESOLVED",
        category="HUMAN_OVERRIDE",
        actor="USER_HUMAN",
        conversation_id=approval.conversation_id,
        description=f"Ashay resolved approval #{approval.id} with action '{action.upper()}'. Status is now {approval.status}.",
        details={
            "approval_id": approval.id,
            "action": action,
            "edited_content": req.edited_content,
            "notes": req.reviewer_notes
        }
    )
    db.add(audit_entry)

    await db.commit()
    await db.refresh(approval)

    # Broadcast update
    await manager.broadcast({
        "type": "approval_resolved",
        "approval_id": approval.id,
        "status": approval.status
    })

    return approval
