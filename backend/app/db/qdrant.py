# qdrant helpers — search quietly dies if the cluster is down

import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.core.config import settings

CANDIDATES = "candidates"
JOBS = "jobs"

_client: QdrantClient | None = None


def get_qdrant() -> QdrantClient | None:
    global _client
    if _client is None:
        try:
            _client = QdrantClient(url=settings.qdrant_url, timeout=5)
        except Exception:
            return None
    return _client


def point_id(raw: str) -> str:
    """Qdrant point ids must be int or UUID; derive a stable UUID from a Mongo id."""
    return str(uuid.uuid5(uuid.NAMESPACE_URL, raw))


def ensure_collections() -> bool:
    client = get_qdrant()
    if client is None:
        return False
    try:
        existing = {c.name for c in client.get_collections().collections}
        for name in (CANDIDATES, JOBS):
            if name not in existing:
                client.create_collection(
                    name,
                    vectors_config=VectorParams(size=settings.embedding_dim, distance=Distance.COSINE),
                )
        return True
    except Exception:
        return False


def upsert(collection: str, raw_id: str, vector: list[float], payload: dict) -> bool:
    client = get_qdrant()
    if client is None:
        return False
    try:
        client.upsert(
            collection,
            points=[PointStruct(id=point_id(raw_id), vector=vector, payload=payload)],
        )
        return True
    except Exception:
        return False


def search(collection: str, vector: list[float], limit: int = 10, company_id: str | None = None):
    client = get_qdrant()
    if client is None:
        return []
    try:
        flt = None
        if company_id:
            from qdrant_client.models import FieldCondition, Filter, MatchValue

            flt = Filter(must=[FieldCondition(key="company_id", match=MatchValue(value=company_id))])
        # qdrant-client >= 1.12 uses query_points (search() was removed).
        response = client.query_points(
            collection_name=collection,
            query=vector,
            limit=limit,
            query_filter=flt,
            with_payload=True,
        )
        return response.points
    except Exception:
        return []


def delete(collection: str, raw_id: str) -> None:
    client = get_qdrant()
    if client is None:
        return
    try:
        client.delete(collection, points_selector=[point_id(raw_id)])
    except Exception:
        pass
