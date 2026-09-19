import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ContactGroup(Base):
    __tablename__ = "contact_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False) # e.g. "Friends", "Clients", "Academics", "Family"
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    contacts = relationship("Contact", back_populates="group")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    phone = Column(String(50), index=True, nullable=True)
    email = Column(String(150), index=True, nullable=True)
    relationship_type = Column(String(50), default="unknown") # friend, professor, client, family, colleague, unknown
    company = Column(String(100), nullable=True)
    group_id = Column(Integer, ForeignKey("contact_groups.id"), nullable=True)
    notes = Column(Text, nullable=True)
    is_vip = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    group = relationship("ContactGroup", back_populates="contacts")
    rule = relationship("ContactRule", back_populates="contact", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    conversations = relationship("Conversation", back_populates="contact")
