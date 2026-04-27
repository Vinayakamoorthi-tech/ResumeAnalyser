from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=0)
    content = Column(Text)
    score = Column(Integer, default=0)
    feedback = Column(Text, default="")
    keywords = Column(Text, default="")
    weaknesses = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=0)
    question = Column(Text)
    answer = Column(Text)
    score = Column(Integer, default=0)
    feedback = Column(Text, default="")
    strengths = Column(Text, default="")
    improvements = Column(Text, default="")
    interview_type = Column(String, default="mixed")
    company_type = Column(String, default="general")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    resume_score = Column(Integer, default=0)
    interview_score = Column(Float, default=0.0)
    weak_areas = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())