#!/usr/bin/env bash
# Stop local AIRecruit backend and frontend
set -euo pipefail

PID_DIR="$HOME/.airecruit/pids"

stop_pid() {
  local name="$1" file="$2"
  if [[ -f "$file" ]]; then
    kill "$(cat "$file")" 2>/dev/null || true
    rm -f "$file"
    echo "Stopped $name"
  fi
}

pkill -f 'uvicorn app.main:app' >/dev/null 2>&1 || true
pkill -f 'next dev -p 3000' >/dev/null 2>&1 || true
pkill -f 'github-watch-push.sh' >/dev/null 2>&1 || true

stop_pid "backend"  "$PID_DIR/backend.pid"
stop_pid "frontend" "$PID_DIR/frontend.pid"
stop_pid "github-watch" "$PID_DIR/github-watch.pid"

echo "Local backend and frontend stopped."
echo "Docker services still running. Stop with: docker compose down"
