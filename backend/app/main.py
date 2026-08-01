from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    admin_ai,
    admin_audit,
    admin_billing,
    admin_overview,
    admin_plans,
    admin_platform,
    admin_recruitment,
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
    questions,
    system,
    team,
    admin_communication,
    admin_security,
)
from app.core.config import settings
from app.db.mongo import connect, disconnect
from app.db.minio import ensure_bucket
from app.db.qdrant import ensure_collections
from app.seed import ensure_demo_accounts, ensure_super_admin
from app.services.plans import ensure_seeded as ensure_plans_seeded


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect()
    await ensure_plans_seeded()
    await ensure_super_admin()
    # await ensure_demo_accounts()
    # minio + qdrant — skip if they're down, API should still start
    try:
        ensure_bucket()
        ensure_collections()
    except Exception:
        pass
    yield
    await disconnect()


app = FastAPI(title="AI Recruiting API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # bearer auth — no cookies, so wide-open CORS is fine for now
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(admin_security.router, prefix="/api")

app.mount("/media", StaticFiles(directory=str(settings.storage_path)), name="media")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
