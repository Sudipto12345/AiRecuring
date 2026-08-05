import hashlib
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

def get_device_fingerprint(request: Request) -> str:
    user_agent = request.headers.get("user-agent", "")
    accept_language = request.headers.get("accept-language", "")
    ip_address = request.client.host if request.client else ""
    
    # Simple fingerprint based on user agent, language and IP
    raw = f"{user_agent}|{accept_language}|{ip_address}"
    return hashlib.sha256(raw.encode()).hexdigest()

class DeviceFingerprintMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We attach the fingerprint to the request state so it can be used during token generation
        request.state.fingerprint = get_device_fingerprint(request)
        return await call_next(request)
