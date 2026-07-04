import random
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import company_user, require_module
from app.core.config import settings
from app.core.plans import MODULE_EXAM_PORTAL
from app.models.candidate import Candidate
from app.models.exam import ExamInvite
from app.models.exam_template import Exam
from app.models.job import Job
from app.models.question import Question
from app.models.user import User
from app.schemas.exams import (
    BulkDispatchItem,
    BulkDispatchRequest,
    BulkDispatchResult,
    ExamCreate,
    ExamOut,
)
from app.services.email import send_email

router = APIRouter(
    prefix="/jobs/{job_id}/exams",
    tags=["exams"],
    dependencies=[Depends(require_module(MODULE_EXAM_PORTAL))],
)


async def _job(job_id: str, user: User) -> Job:
    job = await Job.get(job_id)
    if job is None or job.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")
    return job


async def _question_pool_count(company_id: str) -> int:
    return await Question.find(Question.company_id == company_id).count()


def _out(exam: Exam, available: int) -> ExamOut:
    return ExamOut(
        id=str(exam.id),
        job_id=exam.job_id,
        title=exam.title,
        category=exam.category,
        description=exam.description,
        num_questions=exam.num_questions,
        duration_min=exam.duration_min,
        pass_score=exam.pass_score,
        status=exam.status,
        sent_count=exam.sent_count,
        available_questions=available,
        created_at=exam.created_at,
    )


@router.get("", response_model=list[ExamOut])
async def list_exams(job_id: str, user: User = Depends(company_user)):
    await _job(job_id, user)
    rows = await Exam.find(Exam.company_id == user.company_id, Exam.job_id == job_id).sort("-created_at").to_list()
    available = await _question_pool_count(user.company_id)
    return [_out(e, available) for e in rows]


@router.post("", response_model=ExamOut, status_code=status.HTTP_201_CREATED)
async def create_exam(job_id: str, payload: ExamCreate, user: User = Depends(company_user)):
    await _job(job_id, user)
    exam = Exam(
        company_id=user.company_id,
        job_id=job_id,
        title=payload.title,
        category=payload.category,
        description=payload.description,
        num_questions=payload.num_questions,
        duration_min=payload.duration_min,
        pass_score=payload.pass_score,
        question_ids=payload.question_ids,
    )
    await exam.insert()
    return _out(exam, await _question_pool_count(user.company_id))


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exam(job_id: str, exam_id: str, user: User = Depends(company_user)):
    exam = await Exam.get(exam_id)
    if exam is None or exam.company_id != user.company_id or exam.job_id != job_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Exam not found")
    await exam.delete()


@router.post("/{exam_id}/dispatch", response_model=BulkDispatchResult)
async def dispatch_exam(
    job_id: str,
    exam_id: str,
    payload: BulkDispatchRequest,
    user: User = Depends(company_user),
):
    await _job(job_id, user)
    exam = await Exam.get(exam_id)
    if exam is None or exam.company_id != user.company_id or exam.job_id != job_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Exam not found")

    pool = await Question.find(Question.company_id == user.company_id).to_list()
    if exam.question_ids:
        pool = [q for q in pool if str(q.id) in exam.question_ids] or pool
    if not pool:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Add questions to the Question Bank first")

    # Resolve the target candidate set: explicit ids, or all in the AI-ranking range.
    query = Candidate.find(Candidate.company_id == user.company_id, Candidate.job_id == job_id)
    candidates = await query.to_list()
    if payload.candidate_ids:
        wanted = set(payload.candidate_ids)
        candidates = [c for c in candidates if str(c.id) in wanted]
    else:
        candidates = [c for c in candidates if payload.min_score <= c.overall_score <= payload.max_score]

    now = datetime.now(timezone.utc)
    items: list[BulkDispatchItem] = []
    sent = 0
    skipped = 0

    for candidate in candidates:
        if not candidate.email:
            skipped += 1
            items.append(BulkDispatchItem(candidate_id=str(candidate.id), name=candidate.name, skipped="no email"))
            continue

        chosen = random.sample(pool, min(exam.num_questions, len(pool)))
        token = secrets.token_urlsafe(16)
        invite = ExamInvite(
            company_id=user.company_id,
            candidate_id=str(candidate.id),
            job_id=job_id,
            exam_id=exam_id,
            token=token,
            sent_to=candidate.email,
            question_ids=[str(q.id) for q in chosen],
            total=len(chosen),
            pass_score=exam.pass_score,
        )
        await invite.insert()

        link = f"{settings.frontend_origin}/exam/{token}"
        emailed = send_email(
            candidate.email,
            f"{exam.title} — {candidate.job_title or 'Assessment'}",
            f"Hi {candidate.name},\n\nYou are invited to complete the '{exam.title}' assessment "
            f"({exam.duration_min} min).\n\nStart here: {link}\n\nGood luck!",
        )

        candidate.assessment_mode = "exam"
        candidate.exam_token = token
        candidate.exam_status = "sent"
        candidate.stage = "Assessment Sent"
        candidate.dispatched_at = now
        candidate.last_activity = now
        await candidate.save()

        sent += 1
        items.append(
            BulkDispatchItem(candidate_id=str(candidate.id), name=candidate.name, sent_to=candidate.email, emailed=emailed)
        )

    if sent:
        exam.sent_count += sent
        await exam.save()

    return BulkDispatchResult(sent=sent, skipped=skipped, items=items)
