import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class ContactRule(Base):
    __tablename__ = "contact_rules"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), unique=True, nullable=False)
    
    # Granular Permissions for this Contact
    auto_reply_allowed = Column(Boolean, default=True)
    calendar_access = Column(Boolean, default=False)
    notes_access = Column(Boolean, default=False)
    financial_actions_allowed = Column(Boolean, default=False)
    
    # Behavioral & Stylistic Overrides
    message_style = Column(String(50), default="neutral") # casual, formal, professional, friendly, neutral
    max_autonomy_level = Column(Integer, default=3) # 0 to 4
    require_approval_always = Column(Boolean, default=False)
    custom_instructions = Column(Text, nullable=True) # e.g. "Always address as Professor"
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    contact = relationship("Contact", back_populates="rule")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False) # JSON encoded or string
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class PermissionPolicy(Base):
    """Global resource permission matrix"""
    __tablename__ = "permission_policies"

    id = Column(Integer, primary_key=True, index=True)
    resource_name = Column(String(50), unique=True, nullable=False) # calendar, notes, tasks, finances, location
    access_level = Column(String(20), default="DENY") # ALLOW, DENY, REQUIRE_APPROVAL
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
