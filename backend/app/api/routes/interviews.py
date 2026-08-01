import hashlib
from datetime import datetime, timezone
from pathlib import Path

import cv2

from app.core.config import settings
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import company_user, require_module
from app.core.plans import MODULE_INTERVIEW_FACE
from app.models.candidate import Candidate
from app.models.interview import FaceAnalysis, Interview
from app.models.user import User
from app.schemas.interviews import FaceOut, InterviewCreate, InterviewOut, InterviewStats
from app.services.face_recognition import analyze_video
from app.services.storage import save_upload

router = APIRouter(
    prefix="/interviews",
    tags=["interviews"],
    dependencies=[Depends(require_module(MODULE_INTERVIEW_FACE))],
)


def _sub_scores(seed: str, base: float) -> dict:
    keys = ["communication", "technical", "problem_solving", "coding"]
    out = {}
    for i, k in enumerate(keys):
        h = int(hashlib.sha256(f"{seed}{k}".encode()).hexdigest()[:6], 16) % 12
        out[k] = round(max(40.0, min(99.0, base - 6 + h)), 1)
    return out


async def _face_for(interview_id: str) -> FaceAnalysis | None:
    return await FaceAnalysis.find_one(FaceAnalysis.interview_id == interview_id)


def _video_url(itv: Interview) -> str | None:
    if not itv.video_path:
        return None
    try:
        rel = Path(itv.video_path).resolve().relative_to(settings.storage_path.resolve())
        return f"/media/{rel.as_posix()}"
    except ValueError:
        return None


async def _out(itv: Interview) -> InterviewOut:
    face = await _face_for(str(itv.id))
    return InterviewOut(
        id=str(itv.id),
        candidate_id=itv.candidate_id,
        candidate_name=itv.candidate_name,
        job_title=itv.job_title,
        interview_code=itv.interview_code,
        interview_type=itv.interview_type,
        mode=itv.mode,
        scheduled_at=itv.scheduled_at,
        duration_sec=itv.duration_sec,
        status=itv.status,
        ai_score=itv.ai_score,
        scores=itv.scores,
        device=itv.device,
        location=itv.location,
        proctoring_status=itv.proctoring_status,
        has_video=bool(itv.video_path),
        video_url=_video_url(itv),
        face=FaceOut(
            face_detected=face.face_detected,
            focus_score=face.focus_score,
            integrity_score=face.integrity_score,
            risk_level=face.risk_level,
            frames_total=face.frames_total,
            identity_verified=face.identity_verified,
            identity_match_score=face.identity_match_score,
            identity_consistency=face.identity_consistency,
            distinct_identities=face.distinct_identities,
            events=face.events,
            timeline=face.timeline,
        ) if face else None,
    )


@router.get("/stats", response_model=InterviewStats)
async def stats(user: User = Depends(company_user)):
    rows = await Interview.find(Interview.company_id == user.company_id).to_list()
    scored = [i.ai_score for i in rows if i.ai_score is not None]
    return InterviewStats(
        total=len(rows),
        completed=sum(1 for i in rows if i.status == "Completed"),
        in_progress=sum(1 for i in rows if i.status == "In Progress"),
        no_show=sum(1 for i in rows if i.status == "No Show"),
        avg_score=round(sum(scored) / len(scored), 1) if scored else 0.0,
    )


@router.get("", response_model=list[InterviewOut])
async def list_interviews(user: User = Depends(company_user), status_filter: str | None = None):
    rows = await Interview.find(Interview.company_id == user.company_id).sort("-scheduled_at").to_list()
    if status_filter:
        rows = [i for i in rows if i.status == status_filter]
    return [await _out(i) for i in rows]


@router.post("", response_model=InterviewOut, status_code=status.HTTP_201_CREATED)
async def schedule(payload: InterviewCreate, user: User = Depends(company_user)):
    candidate = await Candidate.get(payload.candidate_id)
    if candidate is None or candidate.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidate not found")

    count = await Interview.find(Interview.company_id == user.company_id).count()
    code = f"INT-{datetime.now().year}-{count + 1:03d}"

    itv = Interview(
        company_id=user.company_id,
        candidate_id=str(candidate.id),
        job_id=candidate.job_id,
        candidate_name=candidate.name,
        job_title=candidate.job_title,
        interview_code=code,
        interview_type=payload.interview_type,
        mode=payload.mode,
        scheduled_at=payload.scheduled_at or datetime.now(timezone.utc),
        status="Scheduled",
    )
    await itv.insert()
    return await _out(itv)


async def _owned(interview_id: str, user: User) -> Interview:
    itv = await Interview.get(interview_id)
    if itv is None or itv.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Interview not found")
    return itv


@router.get("/{interview_id}", response_model=InterviewOut)
async def get_interview(interview_id: str, user: User = Depends(company_user)):
    return await _out(await _owned(interview_id, user))


@router.post("/{interview_id}/video", response_model=InterviewOut)
async def upload_video(interview_id: str, user: User = Depends(company_user), file: UploadFile = File(...)):
    itv = await _owned(interview_id, user)
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty file")
    path = save_upload(user.company_id, f"interviews/{interview_id}", file.filename or "interview.mp4", data)

    candidate = await Candidate.get(itv.candidate_id)
    reference = candidate.reference_embedding if candidate else None
    analysis = analyze_video(path, reference_embedding=reference)

    if settings.face_analysis_credits > 0:
        from app.services.credits import charge_flat

        await charge_flat(user.company_id, settings.face_analysis_credits, "Interview face analysis", {"interview": interview_id})

    duration = 0
    cap = cv2.VideoCapture(path)
    if cap.isOpened():
        fps = cap.get(cv2.CAP_PROP_FPS) or 0
        frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
        if fps > 0:
            duration = int(frames / fps)
    cap.release()

    existing = await _face_for(str(itv.id))
    if existing:
        await existing.delete()
    face = FaceAnalysis(company_id=user.company_id, interview_id=str(itv.id), **analysis)
    await face.insert()

    base = candidate.overall_score if candidate else 80.0
    scores = _sub_scores(str(itv.id), base)
    blended = round(sum(scores.values()) / len(scores) * 0.7 + analysis["focus_score"] * 0.3, 1)

    itv.video_path = path
    itv.duration_sec = duration
    itv.status = "Completed"
    itv.scores = scores
    itv.ai_score = blended
    itv.device = "Web · Chrome"
    itv.location = candidate.location if candidate else None
    itv.proctoring_status = "No Issues Detected" if analysis["risk_level"] == "low" else "Flags Detected"
    await itv.save()

    return await _out(itv)
