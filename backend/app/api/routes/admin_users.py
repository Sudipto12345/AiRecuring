import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import super_admin
from app.core.security import hash_password
from app.models.company import Company
from app.models.user import User
from app.schemas.admin import AuditRow, ResetPasswordOut, UserRow, CreateUserRequest
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

from app.models.session import LoginSession

@router.get("/users/sessions")
async def list_sessions():
    sessions = await LoginSession.find_all().sort("-created_at").limit(100).to_list()
    return sessions

@router.delete("/users/sessions/{session_id}")
async def revoke_session(session_id: str):
    session = await LoginSession.get(session_id)
    if session:
        session.status = "revoked"
        await session.save()
    return {"status": "revoked"}


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


@router.post("/users", response_model=UserRow, status_code=status.HTTP_201_CREATED)
async def create_user(payload: CreateUserRequest, request: Request, admin_user: User = Depends(super_admin)):
    if await User.find_one(User.email == payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    if payload.role not in ROLES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown role")
    
    if payload.company_id:
        company = await Company.get(payload.company_id)
        if not company:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Company not found")

    user = User(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
        role=payload.role,
        company_id=payload.company_id,
        title=payload.title or payload.role.replace("_", " ").title(),
    )
    await user.insert()
    
    await audit.record(admin_user, "user.create", target_type="user", target_id=str(user.id),
                       company_id=user.company_id, ip=_client_ip(request), meta={"email": user.email, "role": user.role})
    
    names = await _company_names()
    return UserRow(id=str(user.id), name=user.name, email=user.email, role=user.role,
                   company_id=user.company_id, company_name=names.get(user.company_id or ""),
                   title=user.title, created_at=user.created_at)


from app.models.rbac import SupportStaff

class SupportStaffCreatePayload(UserRow):
    department: str = "Support"
    assigned_permissions: list[str] = []

@router.get("/support-staff")
async def list_support_staff():
    return await SupportStaff.find_all().sort("-created_at").to_list()

@router.post("/support-staff")
async def create_support_staff(payload: dict, admin_user: User = Depends(super_admin)):
    email = payload.get("email")
    name = payload.get("name")
    dept = payload.get("department", "Support")
    perms = payload.get("assigned_permissions", [])

    existing_user = await User.find_one(User.email == email)
    if not existing_user:
        existing_user = User(
            email=email,
            name=name,
            password_hash=hash_password(payload.get("password", "support12345")),
            role="support_staff",
            title=f"Support ({dept})",
        )
        await existing_user.insert()

    staff = SupportStaff(
        user_id=str(existing_user.id),
        email=email,
        name=name,
        department=dept,
        assigned_permissions=perms,
    )
    await staff.insert()
    return staff

@router.delete("/support-staff/{id}")
async def delete_support_staff(id: str):
    staff = await SupportStaff.get(id)
    if staff:
        await staff.delete()
    return {"status": "deleted"}

