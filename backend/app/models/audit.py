import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    event_type = Column(String(50), nullable=False) # e.g. "MESSAGE_RECEIVED", "INTENT_DETECTED", "RISK_EVALUATED", "PERMISSION_CHECK", "AUTONOMY_EVALUATED", "RESPONSE_GENERATED", "HUMAN_OVERRIDE", "ACTION_EXECUTED"
    category = Column(String(50), default="ORCHESTRATOR") # SECURITY, RISK, PERMISSIONS, AUTONOMY, ACTION, COMMUNICATION
    actor = Column(String(50), default="AI_REPRESENTATIVE") # AI_REPRESENTATIVE, USER_HUMAN, CALLER, SYSTEM
    conversation_id = Column(Integer, nullable=True, index=True)
    contact_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    details = Column(JSON, nullable=True) # Full structured snapshot of inputs, scores, and decisions
