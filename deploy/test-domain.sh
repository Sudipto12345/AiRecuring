#!/usr/bin/env bash
# Smoke test: app.twautomate.top + admin.twautomate.top
set -euo pipefail

ORIGIN_IP="${ORIGIN_IP:-139.180.223.225}"
DOMAINS=(app.twautomate.top admin.twautomate.top twautomate.top)

pass=0
fail=0
warn=0
ok()   { echo "  OK   $*"; pass=$((pass+1)); }
bad()  { echo "  FAIL $*"; fail=$((fail+1)); }
note() { echo "  WARN $*"; warn=$((warn+1)); }

echo "=== DNS (Cloudflare proxy OK; origin should be $ORIGIN_IP) ==="
for d in "${DOMAINS[@]}"; do
  ips=$(dig +short "$d" A 2>/dev/null | tr '\n' ' ' | sed 's/ $//')
  [ -n "$ips" ] && ok "$d -> $ips" || note "$d has no A record"
done

echo
echo "=== Local stack ==="
curl -sf -m 5 http://127.0.0.1:8000/api/system/health >/dev/null && ok "backend :8000" || bad "backend down"
[ "$(curl -s -m 5 -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/login)" = "200" ] && ok "frontend :3000" || bad "frontend down"

if [ -f /etc/nginx/sites-enabled/twautomate-app.conf ]; then
  ok "nginx twautomate-app.conf enabled"
else
  note "nginx twautomate-app.conf not installed — run deploy/install-twautomate-nginx.sh"
fi

echo
echo "=== nginx proxy (local Host header) ==="
for host in app.twautomate.top admin.twautomate.top; do
  app_code=$(curl -s -m 5 -H "Host: $host" -o /dev/null -w '%{http_code}' http://127.0.0.1/login 2>/dev/null || echo 000)
  api_code=$(curl -s -m 5 -H "Host: $host" -o /dev/null -w '%{http_code}' http://127.0.0.1/api/system/health 2>/dev/null || echo 000)
  if [ "$app_code" = "200" ] && [ "$api_code" = "200" ]; then
    ok "$host nginx -> login $app_code, /api $api_code"
  else
    note "$host nginx -> login HTTP $app_code, /api HTTP $api_code"
  fi
done

echo
echo "=== Public HTTPS (via Cloudflare) ==="
for url in "https://app.twautomate.top/login" "https://admin.twautomate.top/admin" "https://app.twautomate.top/api/system/health"; do
  code=$(curl -s -m 15 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo 000)
  if [ "$code" = "200" ] || [ "$code" = "302" ] || [ "$code" = "307" ]; then
    ok "$url -> HTTP $code"
  else
    note "$url -> HTTP $code"
  fi
done

echo
echo "=== Summary: $pass passed, $fail failed, $warn warnings ==="
[ "$fail" -eq 0 ] || exit 1
