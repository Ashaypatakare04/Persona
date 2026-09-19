import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    message_id = Column(Integer, nullable=True)
    risk_level = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    risk_category = Column(String(50), nullable=False) # financial, legal, credential, medical, irreversible, permission, general
    score = Column(Float, default=0.0)
    factors = Column(JSON, nullable=True) # list of identified risk flags
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="risk_assessments")

class PriorityAssessment(Base):
    __tablename__ = "priority_assessments"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    message_id = Column(Integer, nullable=True)
    priority_level = Column(String(20), nullable=False) # HIGH, MEDIUM, LOW, IGNORE_SPAM
    urgency_score = Column(Float, default=0.0)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="priority_assessments")
