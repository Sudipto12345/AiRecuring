import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import super_admin
from app.core.config import settings
from app.core.plans import PLAN_CATALOG
from app.core.security import create_access_token, hash_password
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.interview import Interview
from app.models.job import Job
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.admin import (
    AuditRow,
    ChangePlanRequest,
    CompanyDetail,
    CompanyRow,
    CreateCompanyRequest,
    ImpersonateOut,
    PlanInfo,
    ResetPasswordOut,
    UserRow,
)
from app.schemas.credits import GrantRequest
from app.services import audit, plans as plans_service
from app.services.credits import get_account, grant
from app.api.routes.auth import _unique_slug

router = APIRouter(prefix="/admin", tags=["super-admin"], dependencies=[Depends(super_admin)])


def _client_ip(request: Request) -> str | None:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else None


async def _row(company: Company) -> CompanyRow:
    sub = await Subscription.find_one(Subscription.company_id == str(company.id))
    seats = await User.find(User.company_id == str(company.id)).count()
    account = await get_account(str(company.id))
    return CompanyRow(
        id=str(company.id),
        name=company.name,
        slug=company.slug,
        industry=company.industry,
        status=company.status,
        plan=sub.plan if sub else "free",
        modules=sub.modules if sub else [],
        seats=seats,
        credits=account.balance,
        created_at=company.created_at,
    )


def _user_row(u: User, company_name: str | None = None) -> UserRow:
    return UserRow(
        id=str(u.id),
        name=u.name,
        email=u.email,
        role=u.role,
        company_id=u.company_id,
        company_name=company_name,
        title=u.title,
        created_at=u.created_at,
    )


@router.get("/plans", response_model=list[PlanInfo])
async def list_plans():
    db_plans = await plans_service.list_plans()
    if db_plans:
        return [PlanInfo(key=p.key, label=p.label, modules=p.modules, limits=p.limits) for p in db_plans]
    return [
        PlanInfo(key=key, label=spec["label"], modules=spec["modules"], limits=spec["limits"])
        for key, spec in PLAN_CATALOG.items()
    ]


@router.get("/companies", response_model=list[CompanyRow])
async def list_companies():
    companies = await Company.find_all().sort("-created_at").to_list()
    return [await _row(c) for c in companies]


@router.post("/companies", response_model=CompanyRow, status_code=status.HTTP_201_CREATED)
async def create_company(payload: CreateCompanyRequest, request: Request, admin_user: User = Depends(super_admin)):
    plan = await plans_service.get_plan(payload.plan)
    if plan is None and payload.plan not in PLAN_CATALOG:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown plan")
    if await User.find_one(User.email == payload.admin_email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Admin email already registered")

    company = Company(name=payload.company_name, slug=await _unique_slug(payload.company_name), industry=payload.industry)
    await company.insert()

    if plan is not None:
        sub = Subscription(company_id=str(company.id), plan=plan.key, modules=list(plan.modules), limits=dict(plan.limits))
    else:
        sub = Subscription.from_plan(str(company.id), payload.plan)
    await sub.insert()

    admin = User(
        email=payload.admin_email,
        name=payload.admin_name,
        password_hash=hash_password(payload.admin_password),
        role="company_admin",
        company_id=str(company.id),
        title="Administrator",
    )
    await admin.insert()

    if settings.new_company_credits > 0:
        await grant(str(company.id), settings.new_company_credits, "Welcome credits")

    await audit.record(admin_user, "company.create", target_type="company", target_id=str(company.id),
                       company_id=str(company.id), ip=_client_ip(request), meta={"name": company.name, "plan": payload.plan})
    return await _row(company)


@router.get("/companies/{company_id}", response_model=CompanyDetail)
async def company_detail(company_id: str):
    company = await Company.get(company_id)
    if company is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Company not found")
    sub = await Subscription.find_one(Subscription.company_id == company_id)
    account = await get_account(company_id)
    users = await User.find(User.company_id == company_id).to_list()
    counts = {
        "users": len(users),
        "jobs": await Job.find(Job.company_id == company_id).count(),
        "candidates": await Candidate.find(Candidate.company_id == company_id).count(),
        "interviews": await Interview.find(Interview.company_id == company_id).count(),
    }
    activity = await audit.recent(company_id=company_id, limit=25)
    return CompanyDetail(
        id=str(company.id),
        name=company.name,
        slug=company.slug,
        industry=company.industry,
        status=company.status,
        plan=sub.plan if sub else "free",
        modules=sub.modules if sub else [],
        limits=sub.limits if sub else {},
        credits=account.balance,
        created_at=company.created_at,
        counts=counts,
        users=[_user_row(u) for u in users],
        recent_activity=[
            AuditRow(id=str(a.id), actor_email=a.actor_email, actor_role=a.actor_role, action=a.action,
                     target_type=a.target_type, target_id=a.target_id, company_id=a.company_id, ip=a.ip,
                     meta=a.meta, created_at=a.created_at)
            for a in activity
        ],
    )


@router.patch("/companies/{company_id}/plan", response_model=CompanyRow)
async def change_plan(company_id: str, payload: ChangePlanRequest, request: Request, admin_user: User = Depends(super_admin)):
    plan = await plans_service.get_plan(payload.plan)
    if plan is None and payload.plan not in PLAN_CATALOG:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown plan")
    company = await Company.get(company_id)
    if company is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Company not found")
    sub = await Subscription.find_one(Subscription.company_id == company_id)
    if sub is None:
        sub = Subscription.from_plan(company_id, payload.plan)
        await sub.insert()
    if plan is not None:
        await plans_service.apply_to_subscription(sub, plan)
    else:
        sub.apply_plan(payload.plan)
        await sub.save()
    await audit.record(admin_user, "company.change_plan", target_type="company", target_id=company_id,
                       company_id=company_id, ip=_client_ip(request), meta={"plan": payload.plan})
    return await _row(company)


@router.post("/companies/{company_id}/credits", response_model=CompanyRow)
async def add_credits(company_id: str, payload: GrantRequest, request: Request, admin_user: User = Depends(super_admin)):
    company = await Company.get(company_id)
    if company is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Company not found")
    await grant(company_id, payload.credits, payload.reason or "Super-admin top-up")
    await audit.record(admin_user, "company.add_credits", target_type="company", target_id=company_id,
                       company_id=company_id, ip=_client_ip(request), meta={"credits": payload.credits})
    return await _row(company)


@router.patch("/companies/{company_id}/status", response_model=CompanyRow)
async def toggle_status(company_id: str, request: Request, admin_user: User = Depends(super_admin)):
    company = await Company.get(company_id)
    if company is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Company not found")
    company.status = "suspended" if company.status == "active" else "active"
    await company.save()
    await audit.record(admin_user, f"company.{company.status}", target_type="company", target_id=company_id,
                       company_id=company_id, ip=_client_ip(request))
    return await _row(company)


@router.post("/companies/{company_id}/reset-password", response_model=ResetPasswordOut)
async def reset_company_admin_password(company_id: str, request: Request, admin_user: User = Depends(super_admin)):
    target = await User.find_one(User.company_id == company_id, User.role == "company_admin")
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No company admin found")
    temp = secrets.token_urlsafe(9)
    target.password_hash = hash_password(temp)
    await target.save()
    await audit.record(admin_user, "company.reset_password", target_type="user", target_id=str(target.id),
                       company_id=company_id, ip=_client_ip(request), meta={"email": target.email})
    return ResetPasswordOut(temp_password=temp)


@router.post("/companies/{company_id}/impersonate", response_model=ImpersonateOut)
async def impersonate(company_id: str, request: Request, admin_user: User = Depends(super_admin)):
    company = await Company.get(company_id)
    if company is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Company not found")
    target = await User.find_one(User.company_id == company_id, User.role == "company_admin")
    if target is None:
        target = await User.find_one(User.company_id == company_id)
    if target is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Company has no users to impersonate")
    token = create_access_token(
        str(target.id),
        {"role": target.role, "cid": target.company_id, "imp_by": str(admin_user.id), "imp": True},
    )
    await audit.record(admin_user, "company.impersonate", target_type="user", target_id=str(target.id),
                       company_id=company_id, ip=_client_ip(request),
                       meta={"company": company.name, "as_email": target.email})
    return ImpersonateOut(access_token=token, company_id=company_id, company_name=company.name, user_email=target.email)


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(company_id: str, request: Request, admin_user: User = Depends(super_admin)):
    company = await Company.get(company_id)
    if company is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Company not found")
    name = company.name
    await User.find(User.company_id == company_id).delete()
    await Subscription.find(Subscription.company_id == company_id).delete()
    await Job.find(Job.company_id == company_id).delete()
    await Candidate.find(Candidate.company_id == company_id).delete()
    await Interview.find(Interview.company_id == company_id).delete()
    await company.delete()
    await audit.record(admin_user, "company.delete", target_type="company", target_id=company_id,
                       ip=_client_ip(request), meta={"name": name})
    return None
