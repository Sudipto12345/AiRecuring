from fastapi import APIRouter, Depends

from app.api.deps import super_admin
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.interview import Interview
from app.models.job import Job
from app.models.question import Question

router = APIRouter(prefix="/admin/recruitment", tags=["super-admin-recruitment"], dependencies=[Depends(super_admin)])


async def _names() -> dict[str, str]:
    return {str(c.id): c.name for c in await Company.find_all().to_list()}


@router.get("/jobs")
async def jobs():
    names = await _names()
    rows = await Job.find_all().sort("-created_at").limit(500).to_list()
    return [
        {"id": str(j.id), "title": j.title, "company": names.get(j.company_id, "—"), "company_id": j.company_id,
         "status": j.status, "applications": getattr(j, "applications", 0), "location": j.location,
         "created_at": j.created_at}
        for j in rows
    ]


@router.get("/candidates")
async def candidates():
    names = await _names()
    rows = await Candidate.find_all().sort("-added_on").limit(500).to_list()
    return [
        {"id": str(c.id), "name": c.name, "company": names.get(c.company_id, "—"), "company_id": c.company_id,
         "job_title": c.job_title, "overall_score": c.overall_score, "stage": c.stage, "added_on": c.added_on}
        for c in rows
    ]


@router.get("/interviews")
async def interviews():
    names = await _names()
    rows = await Interview.find_all().sort("-scheduled_at").limit(500).to_list()
    return [
        {"id": str(i.id), "candidate_name": i.candidate_name, "company": names.get(i.company_id, "—"),
         "company_id": i.company_id, "job_title": i.job_title, "status": i.status, "ai_score": i.ai_score,
         "scheduled_at": i.scheduled_at}
        for i in rows
    ]


@router.get("/questions")
async def questions():
    names = await _names()
    rows = await Question.find_all().sort("-created_at").limit(500).to_list()
    return [
        {"id": str(q.id), "text": q.text, "company": names.get(q.company_id, "—"), "company_id": q.company_id,
         "category": q.category, "difficulty": q.difficulty, "created_at": q.created_at}
        for q in rows
    ]
