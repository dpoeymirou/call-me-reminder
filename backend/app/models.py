from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from datetime import datetime, timezone
from .database import Base

class ReminderStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    failed = "failed"

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    timezone = Column(String, nullable=False)
    status = Column(Enum(ReminderStatus), default=ReminderStatus.scheduled)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)