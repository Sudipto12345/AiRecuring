from datetime import datetime

from pydantic import BaseModel


class InterviewCreate(BaseModel):
    candidate_id: str
    interview_type: str = "AI Interview"
    mode: str = "Auto"
    scheduled_at: datetime | None = None


class FaceOut(BaseModel):
    face_detected: bool
    focus_score: float
    integrity_score: float
    risk_level: str
    frames_total: int
    identity_verified: bool | None = None
    identity_match_score: float = 0
    identity_consistency: float = 0
    distinct_identities: int = 0
    events: list[dict]
    timeline: list[str]


class InterviewOut(BaseModel):
    id: str
    candidate_id: str
    candidate_name: str
    job_title: str | None
    interview_code: str
    interview_type: str
    mode: str
    scheduled_at: datetime
    duration_sec: int
    status: str
    ai_score: float | None
    scores: dict
    device: str | None
    location: str | None
    proctoring_status: str
    has_video: bool
    video_url: str | None = None
    face: FaceOut | None = None


class InterviewStats(BaseModel):
    total: int
    completed: int
    in_progress: int
    no_show: int
    avg_score: float


class MonitoringSummary(BaseModel):
    live_sessions: int
    high_risk: int
    focus_avg: float
    integrity_avg: float
    reports: int


class AnalyticsSummary(BaseModel):
    pipeline: list[dict]
    score_distribution: list[dict]
    top_skills: list[dict]
    totals: dict
