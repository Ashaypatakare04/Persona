import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, default="Ashay")
    email = Column(String(150), unique=True, index=True, nullable=False, default="ashay@example.com")
    phone = Column(String(50), nullable=True, default="+91 98765 43210")
    role = Column(String(100), default="Student & Software Developer")
    bio = Column(Text, default="Software developer working on personal AI and distributed systems.")
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
