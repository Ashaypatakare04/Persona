import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    message_id = Column(Integer, nullable=True)
    action_type = Column(String(50), default="SEND_MESSAGE") # SEND_MESSAGE, SCHEDULE_MEETING, SHARE_INFO, TAKE_MESSAGE, ESCALATE
    proposed_content = Column(Text, nullable=False)
    proposed_tool = Column(String(50), nullable=True)
    tool_parameters = Column(JSON, nullable=True)
    context_summary = Column(Text, nullable=True)
    risk_level = Column(String(20), default="LOW")
    priority = Column(String(20), default="MEDIUM")
    status = Column(String(50), default="PENDING") # PENDING, APPROVED, EDITED, REJECTED, TAKEN_OVER
    edited_content = Column(Text, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)

    conversation = relationship("Conversation", back_populates="approvals")

class ActionExecution(Base):
    __tablename__ = "action_executions"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=True)
    approval_id = Column(Integer, ForeignKey("approvals.id"), nullable=True)
    action_name = Column(String(100), nullable=False) # e.g. "calendar.book", "notes.take_message"
    parameters = Column(JSON, nullable=True)
    result = Column(JSON, nullable=True)
    status = Column(String(50), default="SUCCESS") # SUCCESS, FAILED, BLOCKED
    error_message = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
