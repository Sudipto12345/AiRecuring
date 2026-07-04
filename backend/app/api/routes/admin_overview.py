from fastapi import APIRouter, Depends

from app.api.deps import super_admin
from app.services.platform_metrics import platform_overview

router = APIRouter(prefix="/admin", tags=["super-admin-overview"], dependencies=[Depends(super_admin)])


@router.get("/overview")
async def overview():
    return await platform_overview()
