from fastapi import APIRouter, Depends

from app.api.deps import company_user, require_module
from app.core.plans import MODULE_INTERVIEW_FACE
from app.models.interview import FaceAnalysis, Interview
from app.models.user import User
from app.schemas.interviews import MonitoringSummary

router = APIRouter(
    prefix="/monitoring",
    tags=["monitoring"],
    dependencies=[Depends(require_module(MODULE_INTERVIEW_FACE))],
)


@router.get("/summary", response_model=MonitoringSummary)
async def summary(user: User = Depends(company_user)):
    interviews = await Interview.find(Interview.company_id == user.company_id).to_list()
    analyses = await FaceAnalysis.find(FaceAnalysis.company_id == user.company_id).to_list()

    focus = [a.focus_score for a in analyses]
    integrity = [a.integrity_score for a in analyses]
    return MonitoringSummary(
        live_sessions=sum(1 for i in interviews if i.status == "In Progress"),
        high_risk=sum(1 for a in analyses if a.risk_level == "high"),
        focus_avg=round(sum(focus) / len(focus), 1) if focus else 0.0,
        integrity_avg=round(sum(integrity) / len(integrity), 1) if integrity else 0.0,
        reports=sum(1 for i in interviews if i.status == "Completed"),
    )
