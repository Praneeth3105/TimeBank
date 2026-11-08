from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    location: str = Field(default="", max_length=160)
    phone: str = Field(default="", max_length=30)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    bio: str
    location: str
    phone: str = ""
    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    bio: Optional[str] = Field(default=None, max_length=2000)
    location: Optional[str] = Field(default=None, max_length=160)
    phone: Optional[str] = Field(default=None, max_length=30)

class SkillIn(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    description: str = Field(default="", max_length=3000)
    category: str = Field(default="General", max_length=80)
    mode: str = Field(default="Either", pattern="^(Online|In-person|Either)$")
    duration_hours: int = Field(default=1, ge=1, le=24)

class RequestIn(BaseModel):
    skill_id: int
    message: str = Field(default="", max_length=2000)
    preferred_date: str = Field(default="", max_length=40)

class ReviewIn(BaseModel):
    exchange_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=1500)


class ChatMessageIn(BaseModel):
    body: str = Field(min_length=1, max_length=2000)

class ExchangeScheduleIn(BaseModel):
    scheduled_at: str = Field(default="", max_length=40)
    meeting_mode: str = Field(default="Online", pattern="^(Online|In-person)$")
    meeting_link: str = Field(default="", max_length=1000)
    meeting_location: str = Field(default="", max_length=255)
    schedule_notes: str = Field(default="", max_length=2000)
