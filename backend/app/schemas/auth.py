from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    company_name: str = Field(min_length=2)
    industry: str | None = None
    admin_name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=6)
    plan: str = "free"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    company_id: str | None = None
    title: str | None = None
    avatar_url: str | None = None


class CompanyOut(BaseModel):
    id: str
    name: str
    slug: str
    industry: str | None = None
    status: str
    registration_number: str | None = None
    incorporation_country: str | None = None
    business_address: str | None = None
    legal_entity_name: str | None = None
    proof_document_url: str | None = None
    verification_status: str = "verified"
    verification_notes: str | None = None
    verified_at: datetime | None = None


class SubscriptionOut(BaseModel):
    plan: str
    modules: list[str]
    limits: dict
    status: str


class SessionOut(BaseModel):
    user: UserOut
    company: CompanyOut | None = None
    subscription: SubscriptionOut | None = None
    credits: int = 0
