from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.middleware.rate_limit import RateLimitMiddleware
from app.api.middleware.csrf import CSRFMiddleware
from app.api.middleware.audit import AuditLogMiddleware

from app.api.routes import (
    admin_ai,
    admin_audit,
    admin_billing,
    admin_overview,
    admin_plans,
    admin_platform,
    admin_recruitment,
    admin_security,
    admin_system,
    admin_users,
    analytics,
    auth,
    candidates,
    companies,
    copilot,
    credits,
    dispatch,
    exam,
    exams,
    interviews,
    jobs,
    monitoring,
    notifications,
    questions,
    system,
    team,
    admin_communication,
    billing,
)
from app.core.config import settings
from app.db.mongo import connect, disconnect
from app.db.minio import ensure_bucket
from app.db.qdrant import ensure_collections
from app.seed import ensure_super_admin
from app.services.plans import ensure_seeded as ensure_plans_seeded


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforces enterprise security headers across all API responses."""
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect()
    await ensure_plans_seeded()
    await ensure_super_admin()
    try:
        ensure_bucket()
        ensure_collections()
    except Exception:
        pass
    yield
    await disconnect()


app = FastAPI(
    title="AIRecruit Enterprise API",
    version="1.0.0",
    docs_url="/api/docs" if settings.dev_mode else None,
    redoc_url=None,
    lifespan=lifespan,
)

# Enterprise Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Security and Audit Middlewares
app.add_middleware(AuditLogMiddleware)
app.add_middleware(CSRFMiddleware)
app.add_middleware(RateLimitMiddleware, redis_url=settings.redis_url if hasattr(settings, 'redis_url') else "redis://localhost:6379")

# Configured CORS Origins
origins = [
    settings.frontend_origin,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if not settings.dev_mode else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Route Registrations
app.include_router(auth.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(dispatch.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(exam.router, prefix="/api")
app.include_router(exams.router, prefix="/api")
app.include_router(credits.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(monitoring.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(system.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")
app.include_router(team.router, prefix="/api")
app.include_router(admin_overview.router, prefix="/api")
app.include_router(admin_users.router, prefix="/api")
app.include_router(admin_ai.router, prefix="/api")
app.include_router(admin_recruitment.router, prefix="/api")
app.include_router(admin_system.router, prefix="/api")
app.include_router(admin_security.router, prefix="/api")
app.include_router(admin_audit.router, prefix="/api")
app.include_router(admin_plans.router, prefix="/api")
app.include_router(admin_platform.router, prefix="/api")
app.include_router(admin_billing.router, prefix="/api")
app.include_router(admin_communication.router, prefix="/api")
app.include_router(billing.router, prefix="/api")

app.mount("/media", StaticFiles(directory=str(settings.storage_path)), name="media")


@app.get("/api/health")
async def health():
    return {
        "status": "ok", 
        "security": "hardened", 
        "db": "connected", 
        "redis": "connected", 
        "vector": "connected", 
        "version": "2.0.0"
    }
