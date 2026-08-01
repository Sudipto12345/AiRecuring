from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.db.redis import rate_limit_hit
from app.models.candidate import Candidate
from app.models.exam import ExamInvite
from app.models.question import Question
from app.schemas.exams import ExamResult, ExamSubmission, PublicExam, PublicQuestion

router = APIRouter(prefix="/exam", tags=["public-exam"])


async def _invite(token: str) -> ExamInvite:
    invite = await ExamInvite.find_one(ExamInvite.token == token)
    if invite is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invalid or expired link")
    return invite


@router.get("/{token}", response_model=PublicExam)
async def load_exam(token: str):
    invite = await _invite(token)
    candidate = await Candidate.get(invite.candidate_id)
    questions = []
    for qid in invite.question_ids:
        q = await Question.get(qid)
        if q:
            questions.append(PublicQuestion(id=str(q.id), text=q.text, options=q.options))
    return PublicExam(
        token=token,
        candidate_name=candidate.name if candidate else "Candidate",
        job_title=candidate.job_title if candidate else None,
        status=invite.status,
        questions=questions,
    )


@router.post("/{token}/submit", response_model=ExamResult)
async def submit_exam(token: str, submission: ExamSubmission):
    # Basic abuse protection on the public endpoint (no-op if Redis is down).
    if await rate_limit_hit(f"exam:submit:{token}", ttl=60) > 10:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many attempts. Please wait a moment.")

    invite = await _invite(token)
    if invite.status == "completed":
        raise HTTPException(status.HTTP_409_CONFLICT, "This assessment was already submitted")

    correct = 0
    for qid in invite.question_ids:
        q = await Question.get(qid)
        if q and submission.answers.get(qid) == q.correct_index:
            correct += 1

    total = len(invite.question_ids)
    score = round((correct / total) * 100, 1) if total else 0.0
    now = datetime.now(timezone.utc)

    invite.answers = {k: v for k, v in submission.answers.items()}
    invite.correct = correct
    invite.total = total
    invite.score = score
    invite.status = "completed"
    invite.completed_at = now
    await invite.save()

    candidate = await Candidate.get(invite.candidate_id)
    if candidate:
        candidate.exam_status = "completed"
        candidate.exam_score = score
        candidate.stage = "AI Shortlisted" if score >= 60 else "Rejected"
        candidate.last_activity = now
        await candidate.save()

    return ExamResult(score=score, correct=correct, total=total, status="completed")
