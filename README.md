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

### One command (recommended)

```bash
chmod +x start-local.sh stop-local.sh
./start-local.sh
```

This starts Docker (MongoDB, Redis, MinIO, Qdrant), the FastAPI backend, and the Next.js
frontend. Open http://localhost:3000 — login with `owner@airecruit.io` / `owner12345`.

Stop app processes (Docker keeps running):

```bash
./stop-local.sh
```

### Real-time GitHub push

Auto-commit and push code changes while you develop:

```bash
# One-time setup
export GITHUB_REPO=https://github.com/YOUR_USER/air.git
chmod +x github-push.sh github-watch-push.sh

# Manual push
./github-push.sh "your commit message"

# Real-time auto-push (starts automatically with ./start-local.sh)
./github-watch-push.sh
```

`start-local.sh` starts the GitHub watcher in the background when `GITHUB_REPO` is set
(or a git remote already exists). Disable with `GITHUB_WATCH=0 ./start-local.sh`.

Watch logs: `~/.airecruit/logs/github-watch.log`

### Manual setup

#### 1. Database

```bash
docker compose up -d        # starts MongoDB (27017) and Mongo Express (8081)
```

#### 2. Backend

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

#### 3. Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
npm run dev
```

App runs at `http://localhost:3000`.

> **Note:** If the repo is on an external drive (NTFS/exFAT), run the frontend from a local
> copy — `start-local.sh` handles this automatically.

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
