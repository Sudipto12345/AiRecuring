#!/usr/bin/env bash
# Install AI Recruit nginx vhosts for app + admin on twautomate.top
set -euo pipefail

SRC="/home/sudipto/AiRecuring/deploy/nginx/twautomate-app.conf"
DEST="/etc/nginx/sites-available/twautomate-app.conf"

sudo cp "$SRC" "$DEST"
sudo ln -sf "$DEST" /etc/nginx/sites-enabled/twautomate-app.conf
sudo nginx -t
sudo systemctl reload nginx
echo "nginx reloaded — app.twautomate.top + admin.twautomate.top should proxy to :3000 / :8000"
