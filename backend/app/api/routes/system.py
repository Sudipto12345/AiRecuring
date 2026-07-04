"""Public, unauthenticated system endpoints used by the login screen.

- ``/system/health`` reports realtime connectivity to every backing service.
- ``/system/demo-accounts`` lists ready-to-use demo logins (dev mode only).
"""

import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import settings
from app.core.demo import demo_account_list
from app.db import mongo
from app.db import redis as redis_db
from app.db.minio import get_minio
from app.db.qdrant import get_qdrant

router = APIRouter(prefix="/system", tags=["system"])


def _minio_ok() -> bool:
    client = get_minio()
    if client is None:
        return False
    try:
        return bool(client.bucket_exists(settings.minio_bucket))
    except Exception:
        return False


def _qdrant_ok() -> bool:
    client = get_qdrant()
    if client is None:
        return False
    try:
        client.get_collections()
        return True
    except Exception:
        return False


@router.get("/health")
async def health():
    mongo_ok, redis_ok, minio_ok, qdrant_ok = await asyncio.gather(
        mongo.ping(),
        redis_db.ping(),
        asyncio.to_thread(_minio_ok),
        asyncio.to_thread(_qdrant_ok),
    )
    llm_configured = bool(settings.openai_api_key)
    services = [
        {"key": "api", "label": "API", "ok": True, "detail": "FastAPI"},
        {"key": "mongodb", "label": "MongoDB", "ok": mongo_ok, "detail": "primary database"},
        {"key": "redis", "label": "Redis", "ok": redis_ok, "detail": "cache / queue / rate-limit"},
        {"key": "minio", "label": "MinIO", "ok": minio_ok, "detail": "object storage"},
        {"key": "qdrant", "label": "Qdrant", "ok": qdrant_ok, "detail": "vector search"},
        {
            "key": "llm",
            "label": "AI Engine",
            "ok": True,
            "detail": f"{settings.llm_model}" if llm_configured else "heuristic fallback",
        },
    ]
    return {
        "ok": all(s["ok"] for s in services if s["key"] in {"api", "mongodb"}),
        "dev_mode": settings.dev_mode,
        "services": services,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/demo-accounts")
async def demo_accounts():
    if not settings.dev_mode:
        return {"accounts": []}
    return {"accounts": demo_account_list()}
