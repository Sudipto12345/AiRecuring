import time
from fastapi import Request
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as redis

# A basic sliding window or fixed window rate limiter using Redis
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_url="redis://localhost:6379"):
        super().__init__(app)
        self.redis = redis.from_url(redis_url, decode_responses=True)

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path == "/api/health":
            return await call_next(request)
        
        ip = request.client.host if request.client else "unknown"
        
        # Determine limits
        if path.startswith("/api/auth"):
            limit = 10
        else:
            limit = 100
            
        key = f"rate_limit:{ip}:{path}" if path.startswith("/api/auth") else f"rate_limit:{ip}:global"
        
        current_time = int(time.time())
        window_start = current_time - 60
        
        async with self.redis.pipeline() as pipe:
            try:
                pipe.zremrangebyscore(key, 0, window_start)
                pipe.zcard(key)
                request_id = f"{current_time}:{id(request)}"
                pipe.zadd(key, {request_id: current_time})
                pipe.expire(key, 60)
                results = await pipe.execute()
                request_count = results[1]
                
                if request_count >= limit:
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too Many Requests"},
                        headers={"Retry-After": "60"}
                    )
            except Exception as e:
                # If redis fails, fail open or log it
                pass
                
        return await call_next(request)
