from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.api.deps import company_user, require_module
from app.core.plans import MODULE_CV_RANKING
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.schemas.candidates import (
    CandidateOut,
    CandidateStats,
    MatchOut,
    StageUpdate,
    UploadResult,
)
from app.api.routes.notifications import notify_company
from app.services.cv_scorer import score_candidate
from app.services.credits import ensure_balance
from app.services.embeddings import index_candidate, search_candidates
from app.services.face_recognition import embed_image
from app.services.llm import llm_available, llm_parse, llm_score
from app.services.resume_parser import extract_text, looks_like_cv, parse_resume
from app.services.serializers import candidate_out
from app.services.storage import save_upload

router = APIRouter(
    prefix="/candidates",
    tags=["candidates"],
    dependencies=[Depends(require_module(MODULE_CV_RANKING))],
)

STAGES = ["Applied", "AI Screened", "AI Shortlisted", "Interview", "Offer", "Hired", "Rejected"]


def _stage_for(score: float) -> str:
    if score >= 85:
        return "AI Shortlisted"
    if score >= 70:
        return "AI Screened"
    return "Applied"


@router.get("/stats", response_model=CandidateStats)
async def stats(user: User = Depends(company_user)):
    rows = await Candidate.find(Candidate.company_id == user.company_id).to_list()
    return CandidateStats(
        total=len(rows),
        shortlisted=sum(1 for c in rows if c.stage in ("AI Shortlisted", "Shortlisted")),
        under_review=sum(1 for c in rows if c.stage in ("Applied", "AI Screened")),
        interview=sum(1 for c in rows if c.stage in ("Interview", "Interview Scheduled")),
        hired=sum(1 for c in rows if c.stage == "Hired"),
    )


@router.get("", response_model=list[CandidateOut])
async def list_candidates(
    user: User = Depends(company_user),
    job_id: str | None = None,
    stage: str | None = None,
    search: str | None = None,
    sort: str = Query("score", pattern="^(score|recent)$"),
):
    rows = await Candidate.find(Candidate.company_id == user.company_id).to_list()
    if job_id:
        rows = [c for c in rows if c.job_id == job_id]
    if stage:
        rows = [c for c in rows if c.stage == stage]
    if search:
        s = search.lower()
        rows = [c for c in rows if s in c.name.lower() or s in (c.email or "").lower()]
    if sort == "score":
        rows.sort(key=lambda c: c.overall_score, reverse=True)
    else:
        rows.sort(key=lambda c: c.added_on, reverse=True)
    return [candidate_out(c) for c in rows]


@router.post("/upload", response_model=UploadResult, status_code=status.HTTP_201_CREATED)
async def upload_cvs(
    user: User = Depends(company_user),
    job_id: str = Form(...),
    files: list[UploadFile] = File(...),
):
    job = await Job.get(job_id)
    if job is None or job.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")

    # Paid AI parsing/scoring requires a positive credit balance.
    if llm_available():
        await ensure_balance(user.company_id)

    created: list[Candidate] = []
    for upload in files:
        data = await upload.read()
        if not data:
            continue

        filename = upload.filename or "resume"
        path = save_upload(user.company_id, f"resumes/{job_id}", filename, data)
        text = extract_text(path, upload.content_type)
        if not text.strip() or not looks_like_cv(text, filename):
            continue

        parsed = parse_resume(text, filename)

        # When an LLM key is configured, refine the extracted fields with the model;
        # otherwise the heuristic extraction is used as-is. No values are fabricated.
        llm_fields = await llm_parse(text, user.company_id)
        if llm_fields:
            for key in ("name", "email", "phone", "location", "education", "experience_years", "skills", "soft_skills"):
                if llm_fields.get(key):
                    parsed[key] = llm_fields[key]

        if parsed.get("experience_years") is None:
            parsed["experience_years"] = 0.0

        result = await llm_score(text, job, user.company_id) or score_candidate(parsed, job)

        candidate = Candidate(
            company_id=user.company_id,
            job_id=str(job.id),
            job_title=job.title,
            name=parsed["name"],
            email=parsed["email"],
            phone=parsed["phone"],
            location=parsed.get("location"),
            skills=parsed["skills"],
            matched_skills=result["matched_skills"],
            missing_skills=result["missing_skills"],
            experience_years=parsed["experience_years"],
            education=parsed["education"],
            scores=result["scores"],
            overall_score=result["overall_score"],
            ai_summary=result["ai_summary"],
            strengths=result["strengths"],
            risks=result["risks"],
            scored_by=result["scored_by"],
            stage=_stage_for(result["overall_score"]),
            source="CV Upload",
        )
        await candidate.insert()

        resume = Resume(
            company_id=user.company_id,
            job_id=str(job.id),
            candidate_id=str(candidate.id),
            filename=upload.filename or "resume",
            stored_path=path,
            content_type=upload.content_type,
            text=text[:20000],
        )
        await resume.insert()
        candidate.resume_id = str(resume.id)
        await candidate.save()
        await index_candidate(candidate, text)
        created.append(candidate)

    job.last_activity = datetime.now(timezone.utc)
    await job.save()

    created.sort(key=lambda c: c.overall_score, reverse=True)
    if created:
        await notify_company(user.company_id, "candidate.updated", {"count": len(created), "job_id": job_id})
    return UploadResult(created=len(created), candidates=[candidate_out(c) for c in created])


async def _owned(candidate_id: str, user: User) -> Candidate:
    c = await Candidate.get(candidate_id)
    if c is None or c.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidate not found")
    return c


@router.get("/{candidate_id}", response_model=CandidateOut)
async def get_candidate(candidate_id: str, user: User = Depends(company_user)):
    return candidate_out(await _owned(candidate_id, user))


@router.get("/{candidate_id}/similar", response_model=list[MatchOut])
async def similar_candidates(candidate_id: str, user: User = Depends(company_user)):
    candidate = await _owned(candidate_id, user)
    resume = await Resume.get(candidate.resume_id) if candidate.resume_id else None
    seed = (resume.text if resume else None) or " ".join(candidate.skills) or candidate.name
    hits = await search_candidates(seed, user.company_id, limit=11)
    return [MatchOut(**h) for h in hits if h.get("candidate_id") and h["candidate_id"] != candidate_id][:10]


@router.post("/{candidate_id}/photo", response_model=CandidateOut)
async def upload_reference_photo(
    candidate_id: str,
    user: User = Depends(company_user),
    file: UploadFile = File(...),
):
    candidate = await _owned(candidate_id, user)
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty file")
    embedding = embed_image(data)
    if embedding is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "No face detected in the photo")
    path = save_upload(user.company_id, f"candidates/{candidate_id}", file.filename or "photo.jpg", data)
    candidate.reference_photo_path = path
    candidate.reference_embedding = embedding
    candidate.last_activity = datetime.now(timezone.utc)
    await candidate.save()
    return candidate_out(candidate)


from pathlib import Path
from starlette.responses import FileResponse

@router.get("/{candidate_id}/resume")
async def download_resume(candidate_id: str, user: User = Depends(company_user)):
    c = await _owned(candidate_id, user)
    if not c.resume_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No resume attached")
    resume = await Resume.get(c.resume_id)
    if not resume or not getattr(resume, "stored_path", None):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resume file not found")
    path = Path(resume.stored_path)
    if not path.exists():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File does not exist on disk")
    return FileResponse(path, filename=resume.filename, media_type=getattr(resume, "content_type", None) or "application/octet-stream")


@router.patch("/{candidate_id}/stage", response_model=CandidateOut)
async def update_stage(candidate_id: str, payload: StageUpdate, user: User = Depends(company_user)):
    if payload.stage not in STAGES + ["Interview Scheduled", "Shortlisted", "Assessment Sent"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown stage")
    c = await _owned(candidate_id, user)
    c.stage = payload.stage
    c.last_activity = datetime.now(timezone.utc)
    await c.save()
    await notify_company(user.company_id, "candidate.updated", {"candidate_id": candidate_id, "stage": payload.stage})
    return candidate_out(c)

