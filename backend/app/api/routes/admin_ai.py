from fastapi import APIRouter, Depends

from app.api.deps import super_admin
from app.core.config import settings
from app.core.pricing import PRICING
from app.db.qdrant import CANDIDATES, JOBS, get_qdrant
from app.services.platform_metrics import ai_usage_breakdown

router = APIRouter(prefix="/admin/ai", tags=["super-admin-ai"], dependencies=[Depends(super_admin)])


@router.get("/usage")
async def usage():
    return await ai_usage_breakdown()


@router.get("/providers")
async def providers():
    openai_on = bool(settings.openai_api_key)
    return {
        "active_provider": settings.llm_provider,
        "active_model": settings.llm_model,
        "providers": [
            {"key": "openai", "label": "OpenAI", "configured": openai_on, "status": "online" if openai_on else "not configured", "real": True},
            {"key": "ollama", "label": "Ollama (local)", "configured": False, "status": "idle", "real": False},
            {"key": "gemini", "label": "Google Gemini", "configured": False, "status": "idle", "real": False},
            {"key": "claude", "label": "Anthropic Claude", "configured": False, "status": "idle", "real": False},
            {"key": "deepseek", "label": "DeepSeek", "configured": False, "status": "idle", "real": False},
            {"key": "azure", "label": "Azure OpenAI", "configured": False, "status": "idle", "real": False},
        ],
        "models": [{"model": m, "input_per_1k": p[0], "output_per_1k": p[1]} for m, p in PRICING.items()],
        "embedding_model": settings.embedding_model,
        "embedding_dim": settings.embedding_dim,
    }


@router.get("/vector")
async def vector():
    client = get_qdrant()
    collections = []
    available = client is not None
    if client is not None:
        try:
            for name in (CANDIDATES, JOBS):
                info = client.get_collection(name)
                collections.append({"name": name, "points": info.points_count or 0, "vectors": info.points_count or 0})
        except Exception:
            available = False
    return {"available": available, "url": settings.qdrant_url, "collections": collections, "dim": settings.embedding_dim}
