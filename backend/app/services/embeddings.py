# embeddings — openai when keyed, cheap hash vectors otherwise

import hashlib
import math
import re

import httpx

from app.core.config import settings
from app.db.qdrant import CANDIDATES, JOBS, search, upsert
from app.services.llm import llm_available


def _hash_embed(text: str, dim: int) -> list[float]:
    vec = [0.0] * dim
    for tok in re.findall(r"[a-z0-9]+", text.lower()):
        bucket = int(hashlib.md5(tok.encode()).hexdigest(), 16) % dim
        vec[bucket] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


async def embed_text(text: str, company_id: str | None = None) -> list[float]:
    text = (text or "").strip()
    if not text:
        return [0.0] * settings.embedding_dim
    if llm_available():
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                res = await client.post(
                    "https://api.openai.com/v1/embeddings",
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                    json={"model": settings.embedding_model, "input": text[:8000]},
                )
                res.raise_for_status()
                body = res.json()
                vec = body["data"][0]["embedding"]
                if company_id:
                    from app.services.credits import charge_tokens

                    usage = body.get("usage", {})
                    await charge_tokens(
                        company_id, settings.embedding_model, int(usage.get("prompt_tokens", 0)), 0, "Embeddings"
                    )
                return vec
        except Exception:
            pass
    return _hash_embed(text, settings.embedding_dim)


async def index_candidate(candidate, text: str) -> None:
    try:
        vec = await embed_text(text, candidate.company_id)
        upsert(
            CANDIDATES,
            str(candidate.id),
            vec,
            {
                "candidate_id": str(candidate.id),
                "company_id": candidate.company_id,
                "job_id": candidate.job_id,
                "name": candidate.name,
                "overall_score": candidate.overall_score,
            },
        )
    except Exception:
        pass


async def index_job(job, text: str) -> None:
    try:
        vec = await embed_text(text, job.company_id)
        upsert(
            JOBS,
            str(job.id),
            vec,
            {"job_id": str(job.id), "company_id": job.company_id, "title": job.title},
        )
    except Exception:
        pass


async def search_candidates(text: str, company_id: str, limit: int = 10) -> list[dict]:
    vec = await embed_text(text, None)  # querying does not charge
    hits = search(CANDIDATES, vec, limit=limit, company_id=company_id)
    out: list[dict] = []
    for h in hits:
        payload = h.payload or {}
        out.append(
            {
                "candidate_id": payload.get("candidate_id"),
                "name": payload.get("name"),
                "overall_score": payload.get("overall_score", 0),
                "similarity": round(float(h.score) * 100, 1),
            }
        )
    return out
