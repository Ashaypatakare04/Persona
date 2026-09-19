import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    channel = Column(String(50), default="chat") # chat, call, sms, email, whatsapp
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    external_identifier = Column(String(100), nullable=True, index=True) # phone number, email, or session id
    status = Column(String(50), default="active") # active, escalated, closed, human_takeover
    title = Column(String(200), nullable=True)
    summary = Column(Text, nullable=True)
    priority = Column(String(20), default="LOW") # HIGH, MEDIUM, LOW, IGNORE_SPAM
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    human_taken_over = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    contact = relationship("Contact", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")
    calls = relationship("Call", back_populates="conversation", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="conversation", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="conversation", cascade="all, delete-orphan")
    priority_assessments = relationship("PriorityAssessment", back_populates="conversation", cascade="all, delete-orphan")
