import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.core.database import Base

class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False) # calendar, availability, note, task, personal_fact
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    sensitivity = Column(String(50), default="AUTHORIZED_CONTACTS") # PUBLIC, AUTHORIZED_CONTACTS, STRICT_PRIVATE
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
