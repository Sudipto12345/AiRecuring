from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.models.audit_log import AuditLog
import asyncio
from datetime import datetime, timezone

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            # Need to capture details
            path = request.url.path
            method = request.method
            status_code = response.status_code
            ip = request.client.host if request.client else "unknown"
            user_agent = request.headers.get("user-agent")
            
            # Extract user_id and company_id if available (requires setting in request.state during auth)
            user_id = getattr(request.state, "user_id", None)
            company_id = getattr(request.state, "company_id", None)
            
            resource = path.split("/")[2] if len(path.split("/")) > 2 else "unknown"
            action = f"{resource}.{method.lower()}"
            
            async def save_audit_log():
                try:
                    log = AuditLog(
                        user_id=user_id,
                        company_id=company_id,
                        action=action,
                        resource=resource,
                        method=method,
                        path=path,
                        status_code=status_code,
                        ip=ip,
                        user_agent=user_agent,
                        timestamp=datetime.now(timezone.utc)
                    )
                    await log.insert()
                except Exception as e:
                    print(f"Error saving audit log: {e}")
            
            asyncio.create_task(save_audit_log())
            
        return response
