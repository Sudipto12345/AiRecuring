from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import super_admin
from app.models.plan import Plan
from app.models.user import User
from app.schemas.admin import PlanOut, PlanUpsert
from app.services import audit

router = APIRouter(prefix="/admin/plan-catalog", tags=["super-admin-plans"], dependencies=[Depends(super_admin)])


def _client_ip(request: Request) -> str | None:
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else None)


def _out(p: Plan) -> PlanOut:
    return PlanOut(id=str(p.id), key=p.key, label=p.label, modules=p.modules, limits=p.limits,
                   price_monthly=p.price_monthly, is_custom=p.is_custom, order=p.order)


@router.get("", response_model=list[PlanOut])
async def list_plans():
    plans = await Plan.find_all().sort("order").to_list()
    return [_out(p) for p in plans]


@router.post("", response_model=PlanOut)
async def upsert_plan(payload: PlanUpsert, request: Request, admin_user: User = Depends(super_admin)):
    if payload.price_monthly < 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Plan price cannot be negative")
    
    for k, v in payload.limits.items():
        if isinstance(v, (int, float)) and v < -1:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Limit {k} cannot be negative unless -1 (unlimited)")

    existing = await Plan.find_one(Plan.key == payload.key)
    if existing:
        existing.label = payload.label
        existing.modules = payload.modules
        existing.limits = payload.limits
        existing.price_monthly = payload.price_monthly
        existing.is_custom = payload.is_custom
        existing.order = payload.order
        existing.updated_at = datetime.now(timezone.utc)
        await existing.save()
        await audit.record(admin_user, "plan.update", target_type="plan", target_id=payload.key,
                           ip=_client_ip(request), meta={"label": payload.label})
        return _out(existing)
    plan = Plan(key=payload.key, label=payload.label, modules=payload.modules, limits=payload.limits,
                price_monthly=payload.price_monthly, is_custom=payload.is_custom, order=payload.order)
    await plan.insert()
    await audit.record(admin_user, "plan.create", target_type="plan", target_id=payload.key,
                       ip=_client_ip(request), meta={"label": payload.label})
    return _out(plan)


@router.delete("/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(key: str, request: Request, admin_user: User = Depends(super_admin)):
    plan = await Plan.find_one(Plan.key == key)
    if plan is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Plan not found")
    await plan.delete()
    await audit.record(admin_user, "plan.delete", target_type="plan", target_id=key, ip=_client_ip(request))
    return None
