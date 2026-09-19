import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    sender_type = Column(String(50), nullable=False) # "contact", "ai_representative", "user_human"
    sender_name = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)
    channel = Column(String(50), default="chat")
    status = Column(String(50), default="sent") # "sent", "pending_approval", "blocked", "failed"
    metadata_info = Column(JSON, nullable=True) # contains risk, intent, style tags
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    conversation = relationship("Conversation", back_populates="messages")
