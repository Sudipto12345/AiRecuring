import random
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import active_subscription, company_user
from app.core.config import settings
from app.core.plans import MODULE_EXAM_PORTAL
from app.models.candidate import Candidate
from app.models.exam import ExamInvite
from app.models.question import Question
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.exams import DispatchRequest, DispatchResult
from app.services.email import send_email

router = APIRouter(prefix="/candidates", tags=["dispatch"])


@router.post("/{candidate_id}/dispatch", response_model=DispatchResult)
async def dispatch(
    candidate_id: str,
    payload: DispatchRequest,
    user: User = Depends(company_user),
    sub: Subscription = Depends(active_subscription),
):
    candidate = await Candidate.get(candidate_id)
    if candidate is None or candidate.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidate not found")

    now = datetime.now(timezone.utc)

    if payload.mode == "exam":
        if MODULE_EXAM_PORTAL not in sub.modules:
            raise HTTPException(
                status.HTTP_402_PAYMENT_REQUIRED,
                "Your plan does not include the exam portal. Send a meeting link instead.",
            )
        if not candidate.email:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Candidate has no email on file")

        pool = await Question.find(Question.company_id == user.company_id).to_list()
        if not pool:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Add questions to the Question Bank first")
        chosen = random.sample(pool, min(payload.question_count, len(pool)))

        token = secrets.token_urlsafe(16)
        invite = ExamInvite(
            company_id=user.company_id,
            candidate_id=str(candidate.id),
            job_id=candidate.job_id,
            token=token,
            sent_to=candidate.email,
            question_ids=[str(q.id) for q in chosen],
            total=len(chosen),
        )
        await invite.insert()

        link = f"{settings.frontend_origin}/exam/{token}"
        emailed = send_email(
            candidate.email,
            f"Assessment invitation — {candidate.job_title}",
            f"Hi {candidate.name},\n\nYou have been invited to complete an online assessment for "
            f"the {candidate.job_title} role.\n\nStart here: {link}\n\nGood luck!",
        )

        candidate.assessment_mode = "exam"
        candidate.exam_token = token
        candidate.exam_status = "sent"
        candidate.stage = "Assessment Sent"
        candidate.dispatched_at = now
        candidate.last_activity = now
        await candidate.save()

        return DispatchResult(
            mode="exam", candidate_id=str(candidate.id), stage=candidate.stage,
            link=link, sent_to=candidate.email, emailed=emailed,
        )

    if payload.mode == "meeting":
        if not payload.meeting_link:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "meeting_link is required")
        emailed = False
        if candidate.email:
            emailed = send_email(
                candidate.email,
                f"Interview invitation — {candidate.job_title}",
                f"Hi {candidate.name},\n\nYou are invited to an interview for the {candidate.job_title} role.\n\n"
                f"Join here: {payload.meeting_link}\n\nLooking forward to speaking with you.",
            )
        candidate.assessment_mode = "meeting"
        candidate.meeting_link = payload.meeting_link
        candidate.stage = "Interview Scheduled"
        candidate.dispatched_at = now
        candidate.last_activity = now
        await candidate.save()

        return DispatchResult(
            mode="meeting", candidate_id=str(candidate.id), stage=candidate.stage,
            link=payload.meeting_link, sent_to=candidate.email, emailed=emailed,
        )

    raise HTTPException(status.HTTP_400_BAD_REQUEST, "mode must be 'exam' or 'meeting'")
