# minio — optional; local disk is the fallback

import io
from datetime import timedelta

from minio import Minio

from app.core.config import settings

_client: Minio | None = None


def get_minio() -> Minio | None:
    global _client
    if _client is None:
        try:
            _client = Minio(
                settings.minio_endpoint,
                access_key=settings.minio_access_key,
                secret_key=settings.minio_secret_key,
                secure=settings.minio_secure,
            )
        except Exception:
            return None
    return _client


def ensure_bucket() -> bool:
    client = get_minio()
    if client is None:
        return False
    try:
        if not client.bucket_exists(settings.minio_bucket):
            client.make_bucket(settings.minio_bucket)
        return True
    except Exception:
        return False


def put_object(key: str, data: bytes, content_type: str | None = None) -> bool:
    client = get_minio()
    if client is None:
        return False
    try:
        client.put_object(
            settings.minio_bucket,
            key,
            io.BytesIO(data),
            length=len(data),
            content_type=content_type or "application/octet-stream",
        )
        return True
    except Exception:
        return False


def presigned_url(key: str, expires: int = 3600) -> str | None:
    client = get_minio()
    if client is None:
        return None
    try:
        return client.presigned_get_object(settings.minio_bucket, key, expires=timedelta(seconds=expires))
    except Exception:
        return None
