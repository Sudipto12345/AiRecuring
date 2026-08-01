#!/usr/bin/env bash
# Commit and push all changes to GitHub
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BRANCH="${GITHUB_BRANCH:-main}"
REMOTE="${GITHUB_REMOTE:-origin}"
MSG="${1:-auto: sync $(date '+%Y-%m-%d %H:%M:%S')}"

if [[ ! -d .git ]]; then
  echo "→ Initializing git repository..."
  git init -b "$BRANCH"
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  if [[ -z "${GITHUB_REPO:-}" ]]; then
    echo "Set your GitHub repo first:"
    echo "  export GITHUB_REPO=https://github.com/Sudipto12345/AiRecuring"
    echo "  ./github-push.sh"
    exit 1
  fi
  git remote add "$REMOTE" "$GITHUB_REPO"
  echo "→ Added remote $REMOTE → $GITHUB_REPO"
fi

git add -A
if git diff --cached --quiet; then
  echo "✓ Nothing to commit"
else
  git commit -m "$MSG"
  echo "✓ Committed: $MSG"
fi

git push -u "$REMOTE" "$BRANCH"
echo "✓ Pushed to $REMOTE/$BRANCH"
