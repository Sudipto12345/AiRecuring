import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import super_admin
from app.core.security import hash_password
from app.models.company import Company
from app.models.user import User
from app.schemas.admin import AuditRow, ResetPasswordOut, UserRow
from app.services import audit

router = APIRouter(prefix="/admin", tags=["super-admin-users"], dependencies=[Depends(super_admin)])

ROLES = {"super_admin", "company_admin", "hr", "interviewer"}


async def _company_names() -> dict[str, str]:
    return {str(c.id): c.name for c in await Company.find_all().to_list()}


def _client_ip(request: Request) -> str | None:
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else None)


@router.get("/users", response_model=list[UserRow])
async def list_users(role: str | None = None, company_id: str | None = None):
    query: dict = {}
    if role:
        query["role"] = role
    if company_id:
        query["company_id"] = company_id
    users = await (User.find(query) if query else User.find_all()).sort("-created_at").to_list()
    names = await _company_names()
    return [
        UserRow(id=str(u.id), name=u.name, email=u.email, role=u.role, company_id=u.company_id,
                company_name=names.get(u.company_id or ""), title=u.title, created_at=u.created_at)
        for u in users
    ]


@router.get("/users/super-admins", response_model=list[UserRow])
async def list_super_admins():
    users = await User.find(User.role == "super_admin").sort("-created_at").to_list()
    return [
        UserRow(id=str(u.id), name=u.name, email=u.email, role=u.role, company_id=u.company_id,
                company_name=None, title=u.title, created_at=u.created_at)
        for u in users
    ]


@router.get("/users/activity", response_model=list[AuditRow])
async def user_activity():
    logs = await audit.recent(limit=200)
    return [
        AuditRow(id=str(a.id), actor_email=a.actor_email, actor_role=a.actor_role, action=a.action,
                 target_type=a.target_type, target_id=a.target_id, company_id=a.company_id, ip=a.ip,
                 meta=a.meta, created_at=a.created_at)
        for a in logs
    ]


@router.post("/users/{user_id}/reset-password", response_model=ResetPasswordOut)
async def reset_user_password(user_id: str, request: Request, admin_user: User = Depends(super_admin)):
    target = await User.get(user_id)
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    temp = secrets.token_urlsafe(9)
    target.password_hash = hash_password(temp)
    await target.save()
    await audit.record(admin_user, "user.reset_password", target_type="user", target_id=user_id,
                       company_id=target.company_id, ip=_client_ip(request), meta={"email": target.email})
    return ResetPasswordOut(temp_password=temp)


@router.patch("/users/{user_id}/role", response_model=UserRow)
async def change_role(user_id: str, role: str, request: Request, admin_user: User = Depends(super_admin)):
    if role not in ROLES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown role")
    target = await User.get(user_id)
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    target.role = role
    await target.save()
    await audit.record(admin_user, "user.change_role", target_type="user", target_id=user_id,
                       company_id=target.company_id, ip=_client_ip(request), meta={"role": role})
    names = await _company_names()
    return UserRow(id=str(target.id), name=target.name, email=target.email, role=target.role,
                   company_id=target.company_id, company_name=names.get(target.company_id or ""),
                   title=target.title, created_at=target.created_at)
