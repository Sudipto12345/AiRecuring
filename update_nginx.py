import os
import re

files_to_update = [
    "deploy/nginx/airecruit.conf",
    "deploy/nginx/airecurring.conf"
]

upstream_blocks = """
upstream backend_api {
    least_conn;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}

upstream backend_ws {
    ip_hash;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}
"""

for filepath in files_to_update:
    if not os.path.exists(filepath):
        continue
    with open(filepath, "r") as f:
        content = f.read()

    # If already updated, skip
    if "upstream backend_api" in content:
        continue

    # Insert upstream blocks at the beginning of the file, after comments
    # Let's just put it at the very top, before the first server block
    content = content.replace("server {\n", upstream_blocks + "\nserver {\n", 1)

    # Now replace proxy_pass http://127.0.0.1:8000;
    # But wait, we need to handle /api/ and /media/ differently from websockets
    # Actually, we can add a specific location block for websockets
    ws_location = """
    location /api/notifications/ws/ {
        proxy_pass http://backend_ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
"""

    # We need to insert ws_location inside every server block before location /api/
    # And replace proxy_pass http://127.0.0.1:8000; with proxy_pass http://backend_api; inside /api/ and /media/
    content = re.sub(r'(location /api/ \{)', ws_location + r'\1', content)
    content = content.replace("proxy_pass http://127.0.0.1:8000;", "proxy_pass http://backend_api;")

    with open(filepath, "w") as f:
        f.write(content)

