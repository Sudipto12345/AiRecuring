import asyncio
import platform
import sys

from fastapi import APIRouter, Depends

from app.api.deps import super_admin
from app.core.config import settings
from app.db import mongo
from app.db import redis as redis_db
from app.db.minio import get_minio
from app.db.qdrant import get_qdrant

router = APIRouter(prefix="/admin/system", tags=["super-admin-system"], dependencies=[Depends(super_admin)])


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


@router.get("/services")
async def services():
    mongo_ok, redis_ok, minio_ok, qdrant_ok = await asyncio.gather(
        mongo.ping(), redis_db.ping(), asyncio.to_thread(_minio_ok), asyncio.to_thread(_qdrant_ok)
    )
    return {
        "services": [
            {"key": "mongodb", "label": "MongoDB", "ok": mongo_ok, "kind": "Primary database", "real": True},
            {"key": "redis", "label": "Redis", "ok": redis_ok, "kind": "Cache / queue", "real": True},
            {"key": "minio", "label": "MinIO", "ok": minio_ok, "kind": "Object storage", "real": True},
            {"key": "qdrant", "label": "Qdrant", "ok": qdrant_ok, "kind": "Vector search", "real": True},
            {"key": "api", "label": "FastAPI", "ok": True, "kind": "Application server", "real": True},
            {"key": "ollama", "label": "Ollama", "ok": False, "kind": "Local LLM", "real": False},
            {"key": "nats", "label": "NATS / Kafka", "ok": False, "kind": "Event bus", "real": False},
            {"key": "celery", "label": "Celery workers", "ok": False, "kind": "Background jobs", "real": False},
        ]
    }


@router.get("/info")
async def info():
    return {
        "version": "0.1.0",
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "env": {
            "mongo_db": settings.mongo_db,
            "llm_provider": settings.llm_provider,
            "llm_model": settings.llm_model,
            "embedding_model": settings.embedding_model,
            "qdrant_url": settings.qdrant_url,
            "minio_endpoint": settings.minio_endpoint,
            "dev_mode": settings.dev_mode,
            "frontend_origin": settings.frontend_origin,
            "openai_configured": bool(settings.openai_api_key),
            "smtp_configured": bool(settings.smtp_host),
        },
    }


@router.get("/redis")
async def redis_stats():
    client = redis_db.get_redis()
    if client is None:
        return {"available": False}
    try:
        i = await client.info()
        return {
            "available": True,
            "version": i.get("redis_version"),
            "uptime_days": i.get("uptime_in_days"),
            "connected_clients": i.get("connected_clients"),
            "used_memory_human": i.get("used_memory_human"),
            "total_commands": i.get("total_commands_processed"),
            "keyspace_hits": i.get("keyspace_hits"),
            "keyspace_misses": i.get("keyspace_misses"),
        }
    except Exception:
        return {"available": False}


@router.get("/mongodb")
async def mongo_stats():
    client = mongo._client
    if client is None:
        return {"available": False}
    try:
        db = client[settings.mongo_db]
        stats = await db.command("dbStats")
        cols = await db.list_collection_names()
        return {
            "available": True,
            "db": settings.mongo_db,
            "collections": len(cols),
            "objects": stats.get("objects"),
            "data_size": stats.get("dataSize"),
            "storage_size": stats.get("storageSize"),
            "indexes": stats.get("indexes"),
            "collection_names": sorted(cols),
        }
    except Exception:
        return {"available": False}
