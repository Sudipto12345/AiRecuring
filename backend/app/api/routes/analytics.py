from collections import Counter

from fastapi import APIRouter, Depends

from app.api.deps import company_user
from app.db.redis import cache_get_json, cache_set_json
from app.models.candidate import Candidate
from app.models.interview import Interview
from app.models.job import Job
from app.models.user import User
from app.schemas.interviews import AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def summary(user: User = Depends(company_user)):
    cache_key = f"analytics:summary:{user.company_id}"
    cached = await cache_get_json(cache_key)
    if cached:
        return AnalyticsSummary(**cached)

    candidates = await Candidate.find(Candidate.company_id == user.company_id).to_list()
    jobs = await Job.find(Job.company_id == user.company_id).to_list()
    interviews = await Interview.find(Interview.company_id == user.company_id).to_list()

    total = len(candidates)
    screened = sum(1 for c in candidates if c.stage not in ("Applied",))
    shortlisted = sum(1 for c in candidates if c.stage in ("AI Shortlisted", "Shortlisted"))
    interviewed = sum(1 for i in interviews if i.status == "Completed")
    hired = sum(1 for c in candidates if c.stage == "Hired")

    def pct(n: int) -> float:
        return round(n / total * 100, 1) if total else 0.0

    pipeline = [
        {"label": "Applied", "count": total, "pct": 100.0 if total else 0.0},
        {"label": "AI Screened", "count": screened, "pct": pct(screened)},
        {"label": "AI Shortlisted", "count": shortlisted, "pct": pct(shortlisted)},
        {"label": "Interviewed", "count": interviewed, "pct": pct(interviewed)},
        {"label": "Hired", "count": hired, "pct": pct(hired)},
    ]

    high = sum(1 for c in candidates if c.overall_score >= 80)
    mid = sum(1 for c in candidates if 60 <= c.overall_score < 80)
    low = sum(1 for c in candidates if c.overall_score < 60)
    score_distribution = [
        {"label": "80-100 (High)", "count": high, "color": "#22c55e"},
        {"label": "60-80 (Medium)", "count": mid, "color": "#f59e0b"},
        {"label": "0-60 (Low)", "count": low, "color": "#ef4444"},
    ]

    skill_counter: Counter[str] = Counter()
    for c in candidates:
        skill_counter.update(c.skills)
    top_skills = [{"skill": s, "count": n} for s, n in skill_counter.most_common(6)]

    result = AnalyticsSummary(
        pipeline=pipeline,
        score_distribution=score_distribution,
        top_skills=top_skills,
        totals={
            "candidates": total,
            "shortlisted": shortlisted,
            "interviews": interviewed,
            "hired": hired,
            "jobs": len(jobs),
        },
    )
    await cache_set_json(cache_key, result.model_dump(), ttl=60)
    return result
