import json
from fastapi import Request
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class NoSQLInjectionMiddleware(BaseHTTPMiddleware):
    def _contains_invalid_operators(self, data):
        if isinstance(data, dict):
            for k, v in data.items():
                if isinstance(k, str) and k.startswith("$"):
                    return True
                if self._contains_invalid_operators(v):
                    return True
        elif isinstance(data, list):
            for item in data:
                if self._contains_invalid_operators(item):
                    return True
        return False

    async def dispatch(self, request: Request, call_next):
        # Check query parameters
        for k, v in request.query_params.items():
            if k.startswith("$") or (isinstance(v, str) and v.startswith("$")):
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Invalid query parameters"}
                )
                
        # We cannot easily check the body here without consuming it.
        # But for an extra layer, we could read it and put it back.
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body_bytes = await request.body()
                if body_bytes:
                    body_json = json.loads(body_bytes)
                    if self._contains_invalid_operators(body_json):
                        return JSONResponse(
                            status_code=400,
                            content={"detail": "Invalid request payload"}
                        )
            except Exception:
                pass # Not JSON or empty

            # Restore body for the next middleware/handler
            async def receive():
                return {"type": "http.request", "body": body_bytes}
            request._receive = receive

        return await call_next(request)
