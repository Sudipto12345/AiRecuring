from app.models.audit import AuditLog
from app.models.user import User


async def record(
    actor: User,
    action: str,
    *,
    target_type: str | None = None,
    target_id: str | None = None,
    company_id: str | None = None,
    ip: str | None = None,
    meta: dict | None = None,
) -> AuditLog:
    log = AuditLog(
        actor_id=str(actor.id),
        actor_email=actor.email,
        actor_role=actor.role,
        action=action,
        target_type=target_type,
        target_id=target_id,
        company_id=company_id,
        ip=ip,
        meta=meta or {},
    )
    await log.insert()
    return log


async def recent(action: str | None = None, company_id: str | None = None, limit: int = 200) -> list[AuditLog]:
    query = {}
    if action:
        query["action"] = action
    if company_id:
        query["company_id"] = company_id
    cursor = AuditLog.find(query) if query else AuditLog.find_all()
    return await cursor.sort("-created_at").limit(limit).to_list()
