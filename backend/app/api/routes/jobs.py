from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import company_user, require_module
from app.core.plans import MODULE_CV_RANKING
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.user import User
from app.schemas.candidates import MatchOut
from app.schemas.jobs import JobCreate, JobOut, JobStats, JobUpdate
from app.services.embeddings import index_job, search_candidates
from app.services.serializers import job_out

router = APIRouter(
    prefix="/jobs",
    tags=["jobs"],
    dependencies=[Depends(require_module(MODULE_CV_RANKING))],
)


from pydantic import BaseModel

from app.services.nlp.job_parser import parse_job_description

class ParseDescriptionRequest(BaseModel):
    description: str


@router.post("/parse-description")
async def parse_description_endpoint(payload: ParseDescriptionRequest):
    return parse_job_description(payload.description)


@router.get("/stats", response_model=JobStats)
async def stats(user: User = Depends(company_user)):
    rows = await Job.find(Job.company_id == user.company_id).to_list()
    return JobStats(
        total=len(rows),
        active=sum(1 for j in rows if j.status == "active"),
        on_hold=sum(1 for j in rows if j.status == "on_hold"),
        closed=sum(1 for j in rows if j.status == "closed"),
    )


@router.get("", response_model=list[JobOut])
async def list_jobs(
    user: User = Depends(company_user),
    search: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    department: str | None = None,
):
    query = Job.find(Job.company_id == user.company_id)
    jobs = await query.sort("-created_at").to_list()
    if search:
        s = search.lower()
        jobs = [j for j in jobs if s in j.title.lower() or s in (j.department or "").lower()]
    if status_filter:
        jobs = [j for j in jobs if j.status == status_filter]
    if department:
        jobs = [j for j in jobs if j.department == department]
    return [await job_out(j) for j in jobs]


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
async def create_job(payload: JobCreate, user: User = Depends(company_user)):
    job = Job(company_id=user.company_id, created_by=str(user.id), **payload.model_dump())
    await job.insert()
    await index_job(job, f"{job.title}. {job.description or ''} Skills: {', '.join(job.skills)}")
    return await job_out(job)


async def _owned_job(job_id: str, user: User) -> Job:
    job = await Job.get(job_id)
    if job is None or job.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")
    return job


@router.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: str, user: User = Depends(company_user)):
    return await job_out(await _owned_job(job_id, user))


@router.get("/{job_id}/matches", response_model=list[MatchOut])
async def job_matches(job_id: str, user: User = Depends(company_user)):
    job = await _owned_job(job_id, user)
    seed = f"{job.title}. {job.description or ''} Skills: {', '.join(job.skills)}"
    hits = await search_candidates(seed, user.company_id, limit=10)
    return [MatchOut(**h) for h in hits if h.get("candidate_id")]


@router.patch("/{job_id}", response_model=JobOut)
async def update_job(job_id: str, payload: JobUpdate, user: User = Depends(company_user)):
    job = await _owned_job(job_id, user)
    changes = payload.model_dump(exclude_unset=True)
    for k, v in changes.items():
        setattr(job, k, v)
    job.last_activity = datetime.now(timezone.utc)
    await job.save()
    return await job_out(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: str, user: User = Depends(company_user)):
    job = await _owned_job(job_id, user)
    await Candidate.find(Candidate.job_id == str(job.id)).delete()
    await job.delete()
