from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class CreateCompanyRequest(BaseModel):
    company_name: str = Field(min_length=2)
    industry: str | None = None
    admin_name: str = Field(min_length=2)
    admin_email: EmailStr
    admin_password: str = Field(min_length=6)
    plan: str = "free"


class ChangePlanRequest(BaseModel):
    plan: str


class CompanyRow(BaseModel):
    id: str
    name: str
    slug: str
    industry: str | None = None
    status: str
    plan: str
    modules: list[str]
    seats: int
    credits: int = 0
    created_at: datetime


class PlanInfo(BaseModel):
    key: str
    label: str
    modules: list[str]
    limits: dict


class PlanOut(BaseModel):
    id: str
    key: str
    label: str
    modules: list[str]
    limits: dict
    price_monthly: float
    is_custom: bool
    order: int


class PlanUpsert(BaseModel):
    key: str = Field(min_length=2)
    label: str = Field(min_length=2)
    modules: list[str] = []
    limits: dict = {}
    price_monthly: float = 0.0
    is_custom: bool = False
    order: int = 0


class CreateUserRequest(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=6)
    role: str
    company_id: str | None = None
    title: str | None = None


class UserRow(BaseModel):
    id: str
    name: str
    email: str
    role: str
    company_id: str | None = None
    company_name: str | None = None
    title: str | None = None
    created_at: datetime


class ResetPasswordOut(BaseModel):
    temp_password: str


class ImpersonateOut(BaseModel):
    access_token: str
    company_id: str
    company_name: str
    user_email: str


class AuditRow(BaseModel):
    id: str
    actor_email: str
    actor_role: str
    action: str
    target_type: str | None = None
    target_id: str | None = None
    company_id: str | None = None
    ip: str | None = None
    meta: dict = {}
    created_at: datetime


class CompanyDetail(BaseModel):
    id: str
    name: str
    slug: str
    industry: str | None = None
    status: str
    plan: str
    modules: list[str]
    limits: dict
    credits: int
    created_at: datetime
    counts: dict
    users: list[UserRow]
    recent_activity: list[AuditRow]


class RoleInfo(BaseModel):
    key: str
    label: str
    description: str
    permissions: list[str]


class FeatureFlagUpdate(BaseModel):
    name: str
    enabled: bool


class MaintenanceUpdate(BaseModel):
    maintenance_mode: bool
    maintenance_message: str | None = None


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    level: str = "info"  # info | warning | critical
