import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import super_admin
from app.models.company import Company
from app.models.platform import PlatformSettings
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.admin import AnnouncementCreate, FeatureFlagUpdate, MaintenanceUpdate, RoleInfo
from app.services import audit, plans as plans_service

router = APIRouter(prefix="/admin", tags=["super-admin-platform"], dependencies=[Depends(super_admin)])

DEFAULT_FLAGS = {
    "ai_cv_ranking": True,
    "exam_portal": True,
    "interview_face": True,
    "semantic_search": True,
    "self_registration": True,
    "email_dispatch": False,
}

ROLES: list[RoleInfo] = [
    RoleInfo(key="super_admin", label="Super Admin", description="Full platform control across all tenants.",
             permissions=["platform.manage", "company.manage", "billing.manage", "ai.manage", "security.manage", "impersonate"]),
    RoleInfo(key="company_admin", label="Company Admin", description="Manages a single tenant workspace.",
             permissions=["company.settings", "users.manage", "jobs.manage", "candidates.manage", "billing.view"]),
    RoleInfo(key="hr", label="HR / Recruiter", description="Day-to-day recruiting operations.",
             permissions=["jobs.manage", "candidates.manage", "exams.dispatch", "interviews.schedule"]),
    RoleInfo(key="interviewer", label="Interviewer", description="Conducts and scores interviews.",
             permissions=["interviews.conduct", "candidates.view"]),
]


async def _get_settings() -> PlatformSettings:
    ps = await PlatformSettings.find_one(PlatformSettings.singleton == "global")
    if ps is None:
        ps = PlatformSettings(singleton="global", feature_flags=dict(DEFAULT_FLAGS))
        await ps.insert()
    # backfill any missing default flags
    changed = False
    for k, v in DEFAULT_FLAGS.items():
        if k not in ps.feature_flags:
            ps.feature_flags[k] = v
            changed = True
    if changed:
        await ps.save()
    return ps


def _client_ip(request: Request) -> str | None:
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else None)


@router.get("/platform/settings")
async def platform_settings():
    ps = await _get_settings()
    return {
        "maintenance_mode": ps.maintenance_mode,
        "maintenance_message": ps.maintenance_message,
        "feature_flags": ps.feature_flags,
        "announcements": ps.announcements,
        "updated_at": ps.updated_at,
    }


@router.patch("/platform/maintenance")
async def set_maintenance(payload: MaintenanceUpdate, request: Request, admin_user: User = Depends(super_admin)):
    ps = await _get_settings()
    ps.maintenance_mode = payload.maintenance_mode
    if payload.maintenance_message is not None:
        ps.maintenance_message = payload.maintenance_message
    ps.updated_at = datetime.now(timezone.utc)
    await ps.save()
    await audit.record(admin_user, "platform.maintenance", ip=_client_ip(request),
                       meta={"on": payload.maintenance_mode})
    return {"maintenance_mode": ps.maintenance_mode, "maintenance_message": ps.maintenance_message}


@router.post("/platform/feature-flags")
async def toggle_flag(payload: FeatureFlagUpdate, request: Request, admin_user: User = Depends(super_admin)):
    ps = await _get_settings()
    ps.feature_flags[payload.name] = payload.enabled
    ps.updated_at = datetime.now(timezone.utc)
    await ps.save()
    await audit.record(admin_user, "platform.feature_flag", ip=_client_ip(request),
                       meta={"flag": payload.name, "enabled": payload.enabled})
    return {"feature_flags": ps.feature_flags}


@router.post("/platform/announcements")
async def add_announcement(payload: AnnouncementCreate, request: Request, admin_user: User = Depends(super_admin)):
    ps = await _get_settings()
    item = {
        "id": secrets.token_hex(6),
        "title": payload.title,
        "body": payload.body,
        "level": payload.level,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    ps.announcements.insert(0, item)
    ps.updated_at = datetime.now(timezone.utc)
    await ps.save()
    await audit.record(admin_user, "platform.announcement", ip=_client_ip(request), meta={"title": payload.title})
    return item


@router.delete("/platform/announcements/{ann_id}")
async def remove_announcement(ann_id: str, admin_user: User = Depends(super_admin)):
    ps = await _get_settings()
    ps.announcements = [a for a in ps.announcements if a.get("id") != ann_id]
    await ps.save()
    return {"announcements": ps.announcements}


@router.get("/roles", response_model=list[RoleInfo])
async def roles():
    return ROLES


@router.get("/subscriptions/active")
async def active_subscriptions():
    subs = await Subscription.find_all().to_list()
    companies = {str(c.id): c for c in await Company.find_all().to_list()}
    plans = {p.key: p for p in await plans_service.list_plans()}
    out = []
    for s in subs:
        c = companies.get(s.company_id)
        plan = plans.get(s.plan)
        out.append({
            "company_id": s.company_id,
            "company": c.name if c else "—",
            "plan": s.plan,
            "plan_label": plan.label if plan else s.plan,
            "price_monthly": plan.price_monthly if plan else 0.0,
            "status": s.status,
            "modules": s.modules,
            "updated_at": s.updated_at,
        })
    return out
