import secrets
from fastapi import Request
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class CSRFMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exempt_routes=None):
        super().__init__(app)
        self.exempt_routes = exempt_routes or [
            "/api/auth/login",
            "/api/auth/register",
            "/api/health",
            "/api/billing/webhook"
        ]

    def _is_exempt(self, path: str) -> bool:
        for route in self.exempt_routes:
            if path == route or (route.endswith("/*") and path.startswith(route[:-2])):
                return True
            if path.startswith("/api/exam/"):
                return True
        return False

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        if self._is_exempt(path):
            return await call_next(request)

        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            cookie_csrf = request.cookies.get("csrf_token")
            header_csrf = request.headers.get("X-CSRF-Token")
            
            if not cookie_csrf or not header_csrf or cookie_csrf != header_csrf:
                return JSONResponse(status_code=403, content={"detail": "CSRF token missing or invalid"})

        response = await call_next(request)

        if request.method == "GET" and not request.cookies.get("csrf_token"):
            token = secrets.token_urlsafe(32)
            response.set_cookie(
                key="csrf_token",
                value=token,
                httponly=False,  # Needs to be readable by JS to set header
                samesite="lax",
                secure=True
            )
            
        return response
