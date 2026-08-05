# redis wrapper — returns None instead of crashing when the box is offline

import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

_client: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis | None:
    global _client
    if _client is None:
        try:
            if settings.redis_url.startswith("sentinel://"):
                from redis.asyncio.sentinel import Sentinel
                import urllib.parse
                parsed = urllib.parse.urlparse(settings.redis_url)
                host = parsed.hostname
                port = parsed.port or 26379
                path_parts = parsed.path.strip("/").split("/")
                master_name = path_parts[0] if path_parts else "mymaster"
                db = int(path_parts[1]) if len(path_parts) > 1 else 0
                sentinel = Sentinel([(host, port)], decode_responses=True)
                _client = sentinel.master_for(master_name, encoding="utf-8", db=db)
            else:
                _client = aioredis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
        except Exception:
            return None
    return _client


async def ping() -> bool:
    r = get_redis()
    if r is None:
        return False
    try:
        return bool(await r.ping())
    except Exception:
        return False


async def cache_get_json(key: str) -> Any | None:
    r = get_redis()
    if r is None:
        return None
    try:
        raw = await r.get(key)
        return json.loads(raw) if raw else None
    except Exception:
        return None


async def cache_set_json(key: str, value: Any, ttl: int = 60) -> None:
    r = get_redis()
    if r is None:
        return
    try:
        await r.set(key, json.dumps(value, default=str), ex=ttl)
    except Exception:
        pass


async def cache_delete(*keys: str) -> None:
    r = get_redis()
    if r is None or not keys:
        return
    try:
        await r.delete(*keys)
    except Exception:
        pass


async def rate_limit_hit(key: str, ttl: int) -> int:
    # sliding window counter; 0 when redis isn't there
    r = get_redis()
    if r is None:
        return 0
    try:
        count = await r.incr(key)
        if count == 1:
            await r.expire(key, ttl)
        return int(count)
    except Exception:
        return 0
