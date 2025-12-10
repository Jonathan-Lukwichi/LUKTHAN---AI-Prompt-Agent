from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from . import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    role = Column(String(50), default='user')
    created_at = Column(DateTime, default=datetime.utcnow)

    prompt_sessions = relationship("PromptSession", back_populates="user")


class PromptSession(Base):
    __tablename__ = 'prompt_sessions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    domain = Column(String(50))
    task_type = Column(String(100))
    raw_prompt = Column(Text)
    quality_score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="prompt_sessions")
    prompt_versions = relationship("PromptVersion", back_populates="session")


class PromptVersion(Base):
    __tablename__ = 'prompt_versions'

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('prompt_sessions.id'))
    label = Column(String(100))
    optimized_prompt = Column(Text)
    was_copied = Column(Boolean, default=False)
    rating = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("PromptSession", back_populates="prompt_versions")


class PromptTemplate(Base):
    __tablename__ = 'prompt_templates'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(Text)
    domain = Column(String(50))
    task_type = Column(String(100))
    base_prompt = Column(Text)
    tags = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
