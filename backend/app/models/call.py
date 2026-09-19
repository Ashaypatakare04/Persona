import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    caller_name = Column(String(100), nullable=True)
    caller_phone = Column(String(50), nullable=True)
    status = Column(String(50), default="completed") # active, completed, missed, taken_over, terminated
    duration_seconds = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    risk_level = Column(String(20), default="LOW")
    priority = Column(String(20), default="LOW")
    audio_recording_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    conversation = relationship("Conversation", back_populates="calls")
    transcript_turns = relationship("TranscriptTurn", back_populates="call", cascade="all, delete-orphan", order_by="TranscriptTurn.created_at")

class TranscriptTurn(Base):
    __tablename__ = "transcript_turns"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False, index=True)
    speaker = Column(String(50), nullable=False) # "caller", "ai_representative", "user_human"
    text = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    call = relationship("Call", back_populates="transcript_turns")
