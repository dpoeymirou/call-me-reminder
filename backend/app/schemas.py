from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
from typing import Optional
import re
import pytz

class LoginRequest(BaseModel):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ReminderBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    phone_number: str
    timezone: str
    scheduled_time: datetime

    @field_validator('phone_number')
    def validate_phone(cls, v):
        if not re.match(r'^\+[1-9]\d{1,14}$', v):
            raise ValueError(
                'Phone number must be in E.164 format (e.g., +14155552671)'
            )
        return v


class ReminderCreate(ReminderBase):
    @field_validator('scheduled_time')
    @classmethod
    def validate_future_time(cls, v, info):
        tz_str = info.data.get('timezone', 'UTC')

        try:
            tz = pytz.timezone(tz_str)
        except Exception:
            tz = pytz.UTC

        # Get current time in the target timezone
        now = datetime.now(tz)

        # Make input 'v' timezone-aware if it isn't already
        if v.tzinfo is None:
            v = tz.localize(v)

        if v <= now:
            raise ValueError('Scheduled time must be in the future')

        return v.astimezone(pytz.UTC)


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    phone_number: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    timezone: Optional[str] = None


class ReminderResponse(ReminderBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True