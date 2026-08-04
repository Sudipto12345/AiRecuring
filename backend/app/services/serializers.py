from pathlib import Path

from app.core.config import settings
from app.models.candidate import Candidate
from app.models.job import Job
from app.schemas.candidates import CandidateOut
from app.schemas.jobs import JobOut

SHORTLISTED = {"AI Shortlisted", "Shortlisted"}
INTERVIEW = {"Interview", "Interview Scheduled"}


async def job_out(job: Job) -> JobOut:
    rows = await Candidate.find(Candidate.job_id == str(job.id)).to_list()
    return JobOut(
        id=str(job.id),
        title=job.title,
        department=job.department,
        location=job.location,
        work_mode=job.work_mode,
        job_type=job.job_type,
        experience_min=job.experience_min,
        experience_max=job.experience_max,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        currency=job.currency,
        skills=job.skills,
        description=job.description,
        status=job.status,
        featured=job.featured,
        deadline=job.deadline,
        created_at=job.created_at,
        last_activity=job.last_activity,
        applications=len(rows),
        shortlisted=sum(1 for c in rows if c.stage in SHORTLISTED),
        interviews=sum(1 for c in rows if c.stage in INTERVIEW),
        hired=sum(1 for c in rows if c.stage == "Hired"),
    )


def _media_url(abs_path: str | None) -> str | None:
    if not abs_path:
        return None
    try:
        rel = Path(abs_path).resolve().relative_to(settings.storage_path.resolve())
        return f"/media/{rel.as_posix()}"
    except ValueError:
        return None


def candidate_out(c: Candidate) -> CandidateOut:
    return CandidateOut(
        id=str(c.id),
        job_id=c.job_id,
        job_title=c.job_title,
        name=c.name,
        email=c.email,
        phone=c.phone,
        location=c.location,
        skills=c.skills,
        matched_skills=c.matched_skills,
        missing_skills=c.missing_skills,
        experience_years=c.experience_years,
        education=c.education,
        scores=c.scores,
        overall_score=c.overall_score,
        ai_summary=c.ai_summary,
        strengths=c.strengths,
        risks=c.risks,
        stage=c.stage,
        status=c.status,
        source=c.source,
        scored_by=c.scored_by,
        assessment_mode=c.assessment_mode,
        exam_status=c.exam_status,
        exam_score=c.exam_score,
        meeting_link=c.meeting_link,
        has_reference_photo=bool(c.reference_photo_path),
        photo_url=_media_url(c.reference_photo_path),
        resume_id=c.resume_id,
        resume_url=f"/api/candidates/{c.id}/resume" if c.resume_id else None,
        added_on=c.added_on,
        last_activity=c.last_activity,
    )
