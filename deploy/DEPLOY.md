# Go live: airecurring.com (app + admin subdomains)

Server IP: `139.180.223.225` (already running: backend on `:8000`, frontend on `:3000`).
Domain `airecurring.com` is on Cloudflare. `airecruiting.com` points to a DIFFERENT host (AWS) — do not use it.

There are 3 steps. Steps 1 and 3 require actions only you can do (DNS + sudo).

## Step 1 — DNS (Cloudflare) — REQUIRED, do this first

Add these A records in the Cloudflare dashboard for `airecurring.com`:

| Type | Name    | Content           | Proxy            |
|------|---------|-------------------|------------------|
| A    | `app`   | `139.180.223.225` | Proxied (orange) |
| A    | `admin` | `139.180.223.225` | Proxied (orange) |

(Optional: point `@`/root and `www` here too if you want the bare domain to serve the app.)

SSL/TLS mode in Cloudflare:
- Easiest: set SSL mode to **Flexible** — Cloudflare serves HTTPS to browsers and talks HTTP to this server's nginx on :80. No certbot needed. Skip Step 3's certbot.
- More secure: set **Full (strict)** and install a Cloudflare Origin Certificate (or use certbot, Step 3).

If you instead set the records to **DNS only (grey cloud)** so they resolve straight to `139.180.223.225`, then use certbot for HTTPS (Step 3).

Verify after a few minutes:
```
dig +short app.airecurring.com
dig +short admin.airecurring.com
```

## Step 2 — Frontend API base (same-origin)

So the browser calls the API over the same HTTPS origin (no mixed-content), set in `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=/api
```
Then restart the frontend. NOTE: with a relative `/api`, the app must be reached **through nginx / the domain** (or `http://139.180.223.225/`), NOT via `:3000` directly.

Restart frontend (dev):
```
cd /home/sudipto/AiRecuring/frontend && pkill -f "next dev"; nohup npm run dev > /tmp/airecruit_frontend.log 2>&1 &
```
For production instead: `npm run build && npm run start` (next start serves :3000).

Backend public origin (used for emailed exam/meeting links) in `backend/.env`:
```
frontend_origin=https://app.airecurring.com
```
Restart backend:
```
cd /home/sudipto/AiRecuring/backend && pkill -f "uvicorn app.main"; PYTHONPATH=. nohup .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/airecruit_backend.log 2>&1 &
```

## Step 3 — nginx reverse proxy (needs sudo/root)

Install the proxy config and reload nginx:
```
sudo cp /home/sudipto/AiRecuring/deploy/nginx/airecurring.conf /etc/nginx/sites-available/airecurring.conf
sudo ln -sf /etc/nginx/sites-available/airecurring.conf /etc/nginx/sites-enabled/airecurring.conf
sudo nginx -t && sudo systemctl reload nginx
```

(Optional) To also serve the app on the bare IP `http://139.180.223.225/`, replace the body of
`/etc/nginx/sites-enabled/default` with the same `location /api/`, `location /media/`, `location /`
proxy blocks shown in `airecurring.conf` (keep `listen 80 default_server;` and `server_name _;`).

HTTPS via certbot (only if NOT using Cloudflare Flexible/Full):
```
sudo certbot --nginx -d app.airecurring.com -d admin.airecurring.com -d airecurring.com -d www.airecurring.com
```

## Verify

```
# through nginx (Host header), before DNS propagates:
curl -s -H 'Host: app.airecurring.com'   http://127.0.0.1/api/system/health
curl -s -H 'Host: admin.airecurring.com' -o /dev/null -w '%{http_code}\n' http://127.0.0.1/

# after DNS + TLS:
curl -s https://app.airecurring.com/api/system/health
```

Then open `https://app.airecurring.com` (tenant app) and `https://admin.airecurring.com` (super-admin).
