from datetime import datetime

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(min_length=2)
    department: str | None = None
    location: str | None = None
    work_mode: str = "On-site"
    job_type: str = "Full-time"
    experience_min: int = 0
    experience_max: int = 0
    salary_min: int | None = None
    salary_max: int | None = None
    currency: str = "BDT"
    skills: list[str] = Field(default_factory=list)
    description: str | None = None
    status: str = "active"
    featured: bool = False
    deadline: datetime | None = None


class JobUpdate(BaseModel):
    title: str | None = None
    department: str | None = None
    location: str | None = None
    work_mode: str | None = None
    job_type: str | None = None
    experience_min: int | None = None
    experience_max: int | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    skills: list[str] | None = None
    description: str | None = None
    status: str | None = None
    featured: bool | None = None
    deadline: datetime | None = None


class JobOut(BaseModel):
    id: str
    title: str
    department: str | None
    location: str | None
    work_mode: str
    job_type: str
    experience_min: int
    experience_max: int
    salary_min: int | None
    salary_max: int | None
    currency: str
    skills: list[str]
    description: str | None
    status: str
    featured: bool
    deadline: datetime | None
    created_at: datetime
    last_activity: datetime
    applications: int = 0
    shortlisted: int = 0
    interviews: int = 0
    hired: int = 0


class JobStats(BaseModel):
    total: int
    active: int
    on_hold: int
    closed: int
