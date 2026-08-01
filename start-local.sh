#!/usr/bin/env bash
# Start the full AIRecruit stack locally (Docker + backend + frontend)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOME_VENV="$HOME/airecruit-local-venv"
HOME_FRONTEND="$HOME/airecruit-local-run/frontend"
LOG_DIR="$HOME/.airecruit/logs"
PID_DIR="$HOME/.airecruit/pids"

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
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 \
  >"$LOG_DIR/backend.log" 2>&1 &
echo $! >"$PID_DIR/backend.pid"

info "Setting up frontend..."
mkdir -p "$(dirname "$HOME_FRONTEND")"
if [[ ! -f "$HOME_FRONTEND/package.json" ]]; then
  rsync -a --delete --exclude node_modules --exclude .next \
    "$ROOT/frontend/" "$HOME_FRONTEND/"
fi
if [[ "$ROOT/frontend/package.json" -nt "$HOME_FRONTEND/package.json" ]] || \
   [[ ! -d "$HOME_FRONTEND/node_modules" ]]; then
  rsync -a --exclude node_modules --exclude .next "$ROOT/frontend/" "$HOME_FRONTEND/"
  cd "$HOME_FRONTEND"
  npm install --silent
else
  cd "$HOME_FRONTEND"
fi

if [[ ! -f "$HOME_FRONTEND/.env.local" ]]; then
  if [[ -f "$ROOT/frontend/.env.local" ]]; then
    cp "$ROOT/frontend/.env.local" "$HOME_FRONTEND/.env.local"
  else
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" >"$HOME_FRONTEND/.env.local"
  fi
  ok "Created frontend .env.local"
fi

stop_port 3000
info "Starting frontend on :3000..."
nohup npx next dev -p 3000 --webpack >"$LOG_DIR/frontend.log" 2>&1 &
echo $! >"$PID_DIR/frontend.pid"

wait_for_url "Backend"  "http://localhost:8000/api/health"
wait_for_url "Frontend" "http://localhost:3000/"

if [[ "${GITHUB_WATCH:-1}" != "0" ]]; then
  if [[ -n "${GITHUB_REPO:-}" ]] || (cd "$ROOT" && git remote get-url origin >/dev/null 2>&1); then
    info "Starting real-time GitHub push watcher..."
    chmod +x "$ROOT/github-push.sh" "$ROOT/github-watch-push.sh"
    nohup "$ROOT/github-watch-push.sh" >>"$LOG_DIR/github-watch.log" 2>&1 &
    ok "GitHub auto-push enabled (logs: $LOG_DIR/github-watch.log)"
  else
    echo "  GitHub watch skipped — run: export GITHUB_REPO=git@github.com:Sudipto12345/AiRecuring.git"
  fi
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
