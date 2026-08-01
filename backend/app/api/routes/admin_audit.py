from fastapi import APIRouter, Depends

from app.api.deps import super_admin
from app.schemas.admin import AuditRow
from app.services import audit

router = APIRouter(prefix="/admin", tags=["super-admin-audit"], dependencies=[Depends(super_admin)])


@router.get("/audit", response_model=list[AuditRow])
async def audit_logs(action: str | None = None, company_id: str | None = None, limit: int = 200):
    logs = await audit.recent(action=action, company_id=company_id, limit=limit)
    return [
        AuditRow(id=str(a.id), actor_email=a.actor_email, actor_role=a.actor_role, action=a.action,
                 target_type=a.target_type, target_id=a.target_id, company_id=a.company_id, ip=a.ip,
                 meta=a.meta, created_at=a.created_at)
        for a in logs
    ]
