# AIRecruit — Intelligent Hiring Platform

A multi-tenant SaaS recruiting platform with AI-assisted CV ranking, subscription-gated
assessment dispatch, and local facial-analysis proctoring for interviews.

- **Backend** — Python / FastAPI, MongoDB (Motor + Beanie ODM), JWT auth
- **Frontend** — Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI** — heuristic CV scorer with an optional cloud LLM (OpenAI) for richer parsing; local
  OpenCV facial detection for interview proctoring

## Architecture

Each company is a tenant. Every record is scoped by `company_id`, and roles
(`super_admin`, `company_admin`, `hr`, `interviewer`) gate access. A `Subscription` document
holds the company's plan, its `modules`, and `limits`. Routes are protected by a
`require_module(...)` dependency and the UI hides whatever a plan hasn't unlocked.

| Plan | Modules |
| --- | --- |
| Free | `cvRanking` |
| Pro | `cvRanking`, `examPortal` |
| Enterprise | `cvRanking`, `examPortal`, `interviewFace` |

### Modules

1. **CV Ranking** — create jobs, bulk-upload CVs (PDF/DOCX/TXT), auto-parse candidate
   profiles, and score them on skill / experience / education / culture fit.
2. **Assessment Dispatch** — if the plan includes `examPortal`, generate a unique exam link
   and email it to the candidate; otherwise HR sends a meeting link manually. A public,
   no-auth exam portal auto-grades submissions.
3. **AI Interviews** — schedule interviews, upload recordings, and run local OpenCV facial
   analysis (focus / integrity / risk) plus AI evaluation scores. Includes AI Monitoring and
   Reports & Analytics dashboards.

## Prerequisites

- Python 3.12+ (tested on 3.14)
- Node.js 18+
- Docker (for MongoDB) — or a local MongoDB instance

## Getting started

### 1. Database

```bash
docker compose up -d        # starts MongoDB (27017) and Mongo Express (8081)
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then edit secrets as needed
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000` (docs at `/docs`). A super-admin is seeded on startup
from the `SUPERADMIN_*` values in `.env`.

Optional environment variables:

- `OPENAI_API_KEY` — when set, CV scoring uses the cloud LLM (`LLM_MODEL`, default
  `gpt-4o-mini`); otherwise the offline heuristic scorer is used.
- `SMTP_*` — when set, assessment/meeting emails are sent over SMTP; otherwise they are
  logged to the server console.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # sets NEXT_PUBLIC_API_URL
npm run dev
```

App runs at `http://localhost:3000`.

## Repository layout

```
backend/
  app/
    api/routes/     auth, companies, jobs, candidates, dispatch, questions,
                    exam, interviews, monitoring, analytics
    core/           config, security, plans
    models/         Beanie documents
    schemas/        Pydantic request/response models
    services/       resume parsing, CV scoring, LLM, email, face analysis, storage
  scripts/          integration test scripts for the three modules
frontend/
  src/app/          App Router pages (auth, app shell, admin, public exam portal)
  src/components/   UI primitives, charts, layout, feature components
  src/lib/          API client, auth context, types, navigation
```
