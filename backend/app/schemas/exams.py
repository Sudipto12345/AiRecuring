from datetime import datetime

from pydantic import BaseModel, Field


class QuestionCreate(BaseModel):
    text: str = Field(min_length=4)
    options: list[str] = Field(min_length=2)
    correct_index: int = 0
    category: str | None = None
    difficulty: str = "medium"


class QuestionOut(BaseModel):
    id: str
    text: str
    options: list[str]
    correct_index: int
    category: str | None
    difficulty: str
    created_at: datetime


class ExamCreate(BaseModel):
    title: str = Field(min_length=2)
    category: str = "General"
    description: str | None = None
    num_questions: int = Field(default=5, ge=1, le=100)
    duration_min: int = Field(default=30, ge=5, le=240)
    pass_score: float = Field(default=60.0, ge=0, le=100)
    question_ids: list[str] = Field(default_factory=list)


class ExamOut(BaseModel):
    id: str
    job_id: str
    title: str
    category: str
    description: str | None
    num_questions: int
    duration_min: int
    pass_score: float
    status: str
    sent_count: int
    available_questions: int = 0
    created_at: datetime


class BulkDispatchRequest(BaseModel):
    min_score: float = Field(default=0, ge=0, le=100)
    max_score: float = Field(default=100, ge=0, le=100)
    candidate_ids: list[str] = Field(default_factory=list)


class BulkDispatchItem(BaseModel):
    candidate_id: str
    name: str
    sent_to: str | None = None
    emailed: bool = False
    skipped: str | None = None


class BulkDispatchResult(BaseModel):
    sent: int
    skipped: int
    items: list[BulkDispatchItem]


class DispatchRequest(BaseModel):
    mode: str  # exam | meeting
    meeting_link: str | None = None
    question_count: int = 5


class DispatchResult(BaseModel):
    mode: str
    candidate_id: str
    stage: str
    link: str | None = None
    sent_to: str | None = None
    emailed: bool = False


# Public exam portal
class PublicQuestion(BaseModel):
    id: str
    text: str
    options: list[str]


class PublicExam(BaseModel):
    token: str
    candidate_name: str
    job_title: str | None
    status: str
    questions: list[PublicQuestion]


class ExamSubmission(BaseModel):
    answers: dict[str, int]


class ExamResult(BaseModel):
    score: float
    correct: int
    total: int
    status: str
