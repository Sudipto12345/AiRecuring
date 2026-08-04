from datetime import datetime

from pydantic import BaseModel


class CandidateOut(BaseModel):
    id: str
    job_id: str
    job_title: str | None
    name: str
    email: str | None
    phone: str | None
    location: str | None
    skills: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
    experience_years: float
    education: str | None
    scores: dict
    overall_score: float
    ai_summary: str | None
    strengths: list[str]
    risks: list[str]
    stage: str
    status: str
    source: str
    scored_by: str
    assessment_mode: str | None = None
    exam_status: str | None = None
    exam_score: float | None = None
    meeting_link: str | None = None
    has_reference_photo: bool = False
    photo_url: str | None = None
    resume_id: str | None = None
    resume_url: str | None = None
    added_on: datetime
    last_activity: datetime


class StageUpdate(BaseModel):
    stage: str


class MatchOut(BaseModel):
    candidate_id: str
    name: str | None = None
    overall_score: float = 0
    similarity: float = 0


class UploadResult(BaseModel):
    created: int
    candidates: list[CandidateOut]


class CandidateStats(BaseModel):
    total: int
    shortlisted: int
    under_review: int
    interview: int
    hired: int
