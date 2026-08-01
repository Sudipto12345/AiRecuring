#!/usr/bin/env bash
# Watch project files and auto-push to GitHub on change (real-time sync)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$HOME/.airecruit/logs"
PID_DIR="$HOME/.airecruit/pids"
DEBOUNCE="${GITHUB_PUSH_DEBOUNCE:-8}"

mkdir -p "$LOG_DIR" "$PID_DIR"
echo $$ >"$PID_DIR/github-watch.pid"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG_DIR/github-watch.log"; }

push_changes() {
  log "Changes detected — pushing to GitHub..."
  if "$ROOT/github-push.sh" "auto: realtime sync $(date '+%Y-%m-%d %H:%M:%S')" >>"$LOG_DIR/github-watch.log" 2>&1; then
    log "Push complete"
  else
    log "Push failed (check GITHUB_REPO and credentials)"
  fi
}

WATCH_DIRS=(
  "$ROOT/backend/app"
  "$ROOT/backend/scripts"
  "$ROOT/frontend/src"
  "$ROOT/deploy"
  "$ROOT"
)

EXCLUDES=(
  --exclude node_modules --exclude .venv --exclude venv
  --exclude .next --exclude storage --exclude __pycache__
  --exclude .git --exclude .airecruit --exclude '*.log'
  --exclude '*.pem' --exclude .env --exclude .env.local
)

log "Real-time GitHub push started (debounce ${DEBOUNCE}s)"
log "Logs: $LOG_DIR/github-watch.log"
log "Stop: ./stop-local.sh"

LAST_PUSH=0
schedule_push() {
  local now
  now=$(date +%s)
  if (( now - LAST_PUSH < DEBOUNCE )); then
    return
  fi
  LAST_PUSH=$now
  ( sleep "$DEBOUNCE" && push_changes ) &
}

if command -v inotifywait >/dev/null 2>&1; then
  log "Using inotifywait file watcher"
  while true; do
    inotifywait -r -e modify,create,delete,move \
      "${EXCLUDES[@]}" \
      "${WATCH_DIRS[@]}" 2>/dev/null || true
    schedule_push
  done
else
  log "inotifywait not found — using poll watcher (every ${DEBOUNCE}s)"
  LAST_HASH=""
  while true; do
    HASH=$(find "${WATCH_DIRS[@]}" -type f \
      ! -path '*/node_modules/*' ! -path '*/.venv/*' ! -path '*/venv/*' \
      ! -path '*/.next/*' ! -path '*/storage/*' ! -path '*/__pycache__/*' \
      ! -path '*/.git/*' ! -name '*.log' ! -name '*.pem' \
      -printf '%T@ %p\n' 2>/dev/null | sort | md5sum | cut -d' ' -f1)
    if [[ -n "$LAST_HASH" && "$HASH" != "$LAST_HASH" ]]; then
      push_changes
    fi
    LAST_HASH="$HASH"
    sleep "$DEBOUNCE"
  done
fi
