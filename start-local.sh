#!/usr/bin/env bash
# Start the full AIRecruit stack locally (Docker + backend + frontend)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOME_VENV="$ROOT/backend/venv"
LOG_DIR="$ROOT/.logs"
PID_DIR="$ROOT/.pids"

mkdir -p "$LOG_DIR" "$PID_DIR"

info()  { echo "→ $*"; }
ok()    { echo "✓ $*"; }
fail()  { echo "✗ $*" >&2; exit 1; }

stop_port() {
  local port="$1"
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" >/dev/null 2>&1 || true
  fi
  pkill -f "uvicorn app.main:app.*--port ${port}" >/dev/null 2>&1 || true
  pkill -f "next dev -p ${port}" >/dev/null 2>&1 || true
}

wait_for_url() {
  local name="$1" url="$2" tries="${3:-30}"
  for ((i = 1; i <= tries; i++)); do
    if curl -sf "$url" >/dev/null 2>&1; then
      ok "$name ready"
      return 0
    fi
    sleep 2
  done
  fail "$name did not start ($url)"
}

info "Stopping conflicting prod containers (if any)..."
docker compose -f "$ROOT/docker-compose.prod.yml" down >/dev/null 2>&1 || true

info "Starting Docker services..."
cd "$ROOT"
docker compose up -d || {
  warn_containers=$(docker ps --format '{{.Names}}' | grep -E 'airecruit-(mongo|redis|minio|qdrant)' || true)
  if [[ -n "$warn_containers" ]]; then
    ok "Docker services already running"
  else
    fail "Docker compose failed"
  fi
}
ok "Docker services up (MongoDB, Redis, MinIO, Qdrant, Mongo Express)"

info "Setting up backend..."
if [[ ! -f "$ROOT/backend/.env" ]]; then
  cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
  ok "Created backend/.env from .env.example"
fi

if [[ ! -x "$HOME_VENV/bin/python" ]]; then
  python3 -m venv "$HOME_VENV"
fi
# shellcheck disable=SC1091
source "$HOME_VENV/bin/activate"
pip install -q -r "$ROOT/backend/requirements.txt"

stop_port 8000
info "Starting backend on :8000..."
cd "$ROOT/backend"
nohup env PYTHONUNBUFFERED=1 uvicorn app.main:app --reload --reload-dir . --reload-delay 1 --host 0.0.0.0 --port 8000 \
  >"$LOG_DIR/backend.log" 2>&1 & disown
echo $! >"$PID_DIR/backend.pid"

info "Setting up frontend..."
cd "$ROOT/frontend"
if [[ ! -d "node_modules" ]]; then
  npm install --silent
fi

if [[ ! -f ".env.local" ]]; then
  echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" >".env.local"
  ok "Created frontend .env.local"
fi

stop_port 3000
info "Starting frontend on :3000..."
nohup npx next dev --webpack -H 0.0.0.0 -p 3000 >"$LOG_DIR/frontend.log" 2>&1 & disown
echo $! >"$PID_DIR/frontend.pid"

wait_for_url "Backend"  "http://localhost:8000/api/health"
wait_for_url "Frontend" "http://localhost:3000/" 60

if [[ "${GITHUB_WATCH:-0}" == "1" ]]; then
    info "Starting real-time GitHub push watcher..."
    chmod +x "$ROOT/github-push.sh" "$ROOT/github-watch-push.sh"
    nohup "$ROOT/github-watch-push.sh" >>"$LOG_DIR/github-watch.log" 2>&1 &
    ok "GitHub auto-push enabled (logs: $LOG_DIR/github-watch.log)"
  else
    echo "  GitHub watch skipped — run: export GITHUB_REPO=git@github.com:Sudipto12345/AiRecuring.git"
  fi

echo ""
echo "AIRecruit is running locally"
echo "  Frontend : http://localhost:3000"
echo "  Backend  : http://localhost:8000"
echo "  API docs : http://localhost:8000/docs"
echo "  Mongo UI : http://localhost:8081"
echo "  Login    : owner@airecruit.io / owner12345"
echo ""
echo "Logs : $LOG_DIR"
echo "Stop : ./stop-local.sh"
