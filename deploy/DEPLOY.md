# AIRecruit Platform - AWS EC2 Production Deployment Guide

This document provides a comprehensive guide for deploying the **AIRecruit Platform** to an Amazon Web Services (AWS) EC2 instance using Docker Compose, Nginx reverse proxy, and SSL/TLS automation.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & EC2 Sizing Recommendations](#2-prerequisites--ec2-sizing-recommendations)
3. [AWS Security Group Configuration](#3-aws-security-group-configuration)
4. [One-Command Automated Deployment](#4-one-command-automated-deployment)
5. [SSL & Custom Domain Configuration](#5-ssl--custom-domain-configuration)
6. [Environment Variable Management](#6-environment-variable-management)
7. [Database Persistence & Backup Strategies](#7-database-persistence--backup-strategies)
8. [Monitoring, Logs & Maintenance](#8-monitoring-logs--maintenance)
9. [Troubleshooting Guide](#9-troubleshooting-guide)

---

## 1. Architecture Overview

AIRecruit uses a containerized multi-tier architecture deployed on a single AWS EC2 instance (or scaled across multiple instances behind a load balancer):

```
                       ┌─────────────────────────┐
                       │   Client / Web Browser  │
                       └────────────┬────────────┘
                                    │ HTTPS (443) / HTTP (80)
                                    ▼
                       ┌─────────────────────────┐
                       │   Nginx Reverse Proxy   │
                       └─────┬──────────────┬────┘
                             │              │
        http://127.0.0.1:3000│              │http://127.0.0.1:8000/api
                             ▼              ▼
                     ┌──────────────┐  ┌──────────────┐
                     │ Next.js 14   │  │ FastAPI      │
                     │ Frontend     │  │ Backend      │
                     └──────────────┘  └──────┬───────┘
                                              │
         ┌──────────────────┬─────────────────┼──────────────────┐
         │                  │                 │                  │
         ▼                  ▼                 ▼                  ▼
  ┌──────────────┐   ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
  │ MongoDB 7    │   │ Redis 7      │  │ MinIO        │   │ Qdrant Vector│
  │ (Data Store) │   │ (Cache/Queue)│  │ (Media/Docs) │   │ (Embeddings) │
  └──────────────┘   └──────────────┘  └──────────────┘   └──────────────┘
```

- **Nginx Reverse Proxy**: Receives external HTTP/HTTPS traffic on ports 80/443. Routes `/api/*` and `/media/*` to the FastAPI backend (`:8000`) and all other routes to the Next.js frontend (`:3000`).
- **Next.js 14 Frontend**: Multi-tenant client interface running inside Node.js production runtime container.
- **FastAPI Backend**: Async Python microservice delivering REST API, authentication, candidate evaluation pipelines, and AI copilot services.
- **Backing Infrastructure**:
  - **MongoDB 7**: Primary persistent document storage.
  - **Redis 7**: In-memory caching and session state.
  - **MinIO**: S3-compatible object storage for resumes, candidate attachments, and media files.
  - **Qdrant**: High-performance vector database for semantic resume matching and RAG features.

---

## 2. Prerequisites & EC2 Sizing Recommendations

### AWS EC2 Sizing Guidelines

| Deployment Tier | EC2 Instance Type | vCPU | Memory | Storage | Recommended For |
|---|---|---|---|---|---|
| **Staging / Small** | `t3.medium` | 2 | 4 GiB | 30 GB GP3 EBS | Development, testing, light production |
| **Production (Standard)** | `t3.large` | 2 | 8 GiB | 50 GB GP3 EBS | Standard multi-tenant production workload |
| **Production (High Load)**| `c6i.xlarge` | 4 | 8 GiB | 100 GB GP3 EBS| High-concurrency resume processing & AI pipelines |

### Operating System
- **Recommended OS**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (x86_64).

---

## 3. AWS Security Group Configuration

Configure your EC2 Instance Security Group with the following inbound and outbound rules:

### Inbound Rules

| Protocol | Port Range | Source | Description |
|---|---|---|---|
| **TCP** | `22` | `Your-Admin-IP/32` (or `0.0.0.0/0`) | SSH Remote Management |
| **TCP** | `80` | `0.0.0.0/0` | HTTP Web Traffic (Nginx) |
| **TCP** | `443` | `0.0.0.0/0` | HTTPS Web Traffic (Nginx + SSL) |

### Outbound Rules

| Protocol | Port Range | Destination | Description |
|---|---|---|---|
| **ALL Traffic** | `ALL` | `0.0.0.0/0` | Outbound access for package updates, AI APIs |

> **Security Note**: Never expose internal database ports (`27017`, `6379`, `9000`, `6333`) to `0.0.0.0/0`. Keep them bound to internal Docker bridge networks or `127.0.0.1`.

---

## 4. One-Command Automated Deployment

Connect to your EC2 instance via SSH and execute the automated setup script:

```bash
# 1. Clone project repository
git clone https://github.com/your-org/air.git
cd air

# 2. Grant execution permissions
chmod +x deploy/aws-deploy.sh

# 3. Run automated deployment
sudo ./deploy/aws-deploy.sh --domain app.airecurring.com --admin-domain admin.airecurring.com
```

### Script Execution Flags

```text
Usage: sudo ./deploy/aws-deploy.sh [OPTIONS]

Options:
  --domain <domain>         Primary application domain (default: app.airecurring.com)
  --admin-domain <domain>   Admin portal domain (default: admin.airecurring.com)
  --email <email>           Email for Certbot SSL (default: admin@airecurring.com)
  --ssl-mode <mode>         SSL mode: cloudflare | certbot | none (default: cloudflare)
  --skip-sys-update         Skip apt package updates
  --skip-git-pull           Skip git pull repository step
  --dry-run                 Validate configuration without making system changes
  -h, --help                Display help message
```

---

## 5. SSL & Custom Domain Configuration

### Option A: Cloudflare Integration (Recommended)

1. **DNS Setup**: In Cloudflare DNS management for your domain (`airecurring.com`):
   - Add **A Record**: `app` -> `YOUR_EC2_PUBLIC_IP` (Proxy status: Proxied - Orange Cloud)
   - Add **A Record**: `admin` -> `YOUR_EC2_PUBLIC_IP` (Proxy status: Proxied - Orange Cloud)
2. **SSL/TLS Mode**: In Cloudflare SSL/TLS tab:
   - Set encryption mode to **Flexible** (Cloudflare handles HTTPS on edge, connects via HTTP port 80 to EC2) or **Full** (with self-signed / origin cert).
3. Run deployment script:
   ```bash
   sudo ./deploy/aws-deploy.sh --ssl-mode cloudflare
   ```

### Option B: Let's Encrypt Automated Certbot SSL

1. Point DNS A records (`app` and `admin`) directly to your EC2 Public IP (DNS only / Grey Cloud).
2. Execute deployment with Certbot mode:
   ```bash
   sudo ./deploy/aws-deploy.sh --ssl-mode certbot --email admin@airecurring.com
   ```
3. Certbot will obtain free TLS certificates and configure Nginx automatically.
4. Auto-renewal verification:
   ```bash
   sudo certbot renew --dry-run
   ```

---

## 6. Environment Variable Management

Production settings are loaded from `.env` in the project root:

```ini
# --- General ---
NODE_ENV=production
DEV_MODE=false
PORT=3000

# --- Databases ---
MONGO_URI=mongodb://airecruit:airecruit_prod_password@mongodb:27017/?authSource=admin
MONGO_DB=airecruit
REDIS_URL=redis://redis:6379/0

# --- Object Storage & Vector Search ---
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=airecruit
MINIO_SECRET_KEY=airecruit123
MINIO_BUCKET=airecruit
MINIO_SECURE=false
QDRANT_URL=http://qdrant:6333

# --- Security ---
JWT_SECRET=generate_strong_random_secret_string_here
JWT_ALG=HS256
ACCESS_TOKEN_TTL_MIN=43200

# --- Superadmin Defaults ---
SUPERADMIN_EMAIL=owner@airecruit.io
SUPERADMIN_PASSWORD=owner12345
SUPERADMIN_NAME=Platform Owner

# --- Domains ---
FRONTEND_ORIGIN=https://app.airecurring.com
NEXT_PUBLIC_API_URL=/api
```

---

## 7. Database Persistence & Backup Strategies

All data services use persistent named Docker volumes:

- `mongo_prod_data`: Persistent MongoDB data directory (`/data/db`).
- `redis_prod_data`: Persistent Redis data (`/data`).
- `minio_prod_data`: Persistent MinIO object storage files (`/data`).
- `qdrant_prod_data`: Persistent Qdrant vector database storage (`/qdrant/storage`).
- `backend_prod_storage`: Local file upload storage directory (`/app/storage`).

### Automated Daily MongoDB Backup Script

Create `/usr/local/bin/backup-mongodb.sh`:

```bash
#!/usr/bin/env bash
BACKUP_DIR="/var/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

docker exec airecruit-mongodb-prod mongodump --username airecruit --password airecruit_prod_password --authenticationDatabase admin --archive | gzip > "$BACKUP_DIR/mongo_backup_$TIMESTAMP.gz"

# Retain backups for 14 days
find "$BACKUP_DIR" -type f -name "*.gz" -mtime +14 -delete
```

Add to root crontab (`crontab -e`):
```cron
0 2 * * * /usr/local/bin/backup-mongodb.sh >/dev/null 2>&1
```

---

## 8. Monitoring, Logs & Maintenance

### Container Health & Resource Usage

```bash
# View active container status
docker compose -f docker-compose.prod.yml ps

# Monitor real-time CPU & memory utilization
docker stats

# Run system health check script
./deploy/test-domain.sh
```

### Viewing Logs

```bash
# Follow all container logs
docker compose -f docker-compose.prod.yml logs -f

# View backend logs only
docker compose -f docker-compose.prod.yml logs -f backend

# View Nginx access & error logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 9. Troubleshooting Guide

### 1. Nginx 502 Bad Gateway
- **Cause**: Backend or Frontend container is failing or not yet initialized.
- **Fix**: Check container logs:
  ```bash
  docker compose -f docker-compose.prod.yml logs backend
  docker compose -f docker-compose.prod.yml logs frontend
  ```

### 2. Port 80 / 443 Conflict
- **Cause**: Apache or default Nginx site is occupying port 80.
- **Fix**:
  ```bash
  sudo systemctl stop apache2 || true
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo systemctl restart nginx
  ```

### 3. Out of Memory (OOM) Errors / Container Crashes
- **Cause**: Instance RAM exhausted during heavy builds or indexing.
- **Fix**: Enable Linux swap space (2-4GB):
  ```bash
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```

### 4. Certbot SSL Certificate Failure
- **Cause**: Security Group port 80 blocked or DNS A record not pointing to EC2 IP.
- **Fix**: Verify security group allows HTTP (80) inbound and run `dig +short app.yourdomain.com` to confirm DNS propagation.
