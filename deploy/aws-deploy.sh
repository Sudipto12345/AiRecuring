#!/usr/bin/env bash
# ==============================================================================
# AIRecruit Platform - AWS EC2 Automated Deployment Script
# ==============================================================================
# Automates host system updates, Docker & Docker Compose setup, Nginx reverse proxy
# configuration, Certbot / Cloudflare SSL configuration, environment file setup,
# containerized service deployment, and health validation.
#
# Usage:
#   sudo ./deploy/aws-deploy.sh [OPTIONS]
#
# Options:
#   --domain <domain>         Primary application domain (default: app.airecurring.com)
#   --admin-domain <domain>   Admin portal domain (default: admin.airecurring.com)
#   --email <email>           Email for SSL cert registration (default: admin@airecurring.com)
#   --ssl-mode <mode>         SSL mode: cloudflare | certbot | none (default: cloudflare)
#   --skip-sys-update         Skip apt package updates and upgrades
#   --skip-git-pull           Skip git pull repository update
#   --dry-run                 Syntax check and configuration validation without applying changes
#   -h, --help                Display this help message
# ==============================================================================

set -euo pipefail

# --- Color Formatting Helper ---
RED='\031[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# --- Default Parameters ---
DOMAIN="${DOMAIN:-app.airecurring.com}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.airecurring.com}"
EMAIL="${EMAIL:-admin@airecurring.com}"
SSL_MODE="${SSL_MODE:-cloudflare}"
SKIP_SYS_UPDATE=false
SKIP_GIT_PULL=false
DRY_RUN=false

# --- Parse Arguments ---
while [[ $# -gt 0 ]]; do
    case "$1" in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --admin-domain)
            ADMIN_DOMAIN="$2"
            shift 2
            ;;
        --email)
            EMAIL="$2"
            shift 2
            ;;
        --ssl-mode)
            SSL_MODE="$2"
            shift 2
            ;;
        --skip-sys-update)
            SKIP_SYS_UPDATE=true
            shift
            ;;
        --skip-git-pull)
            SKIP_GIT_PULL=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            echo "Usage: sudo $0 [OPTIONS]"
            echo "Options:"
            echo "  --domain <domain>         Primary domain (default: app.airecurring.com)"
            echo "  --admin-domain <domain>   Admin domain (default: admin.airecurring.com)"
            echo "  --email <email>           Email for SSL cert (default: admin@airecurring.com)"
            echo "  --ssl-mode <mode>         SSL mode: cloudflare | certbot | none (default: cloudflare)"
            echo "  --skip-sys-update         Skip OS system packages update"
            echo "  --skip-git-pull           Skip git pull"
            echo "  --dry-run                 Perform dry-run without system modification"
            exit 0
            ;;
        *)
            error "Unknown argument: $1"
            echo "Use --help for usage details."
            exit 1
            ;;
    esac
done

# --- Determine Working Directories ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

info "Starting AIRecruit AWS EC2 Deployment Setup..."
info "Project Root: $PROJECT_ROOT"
info "Domain: $DOMAIN | Admin Domain: $ADMIN_DOMAIN"
info "SSL Mode: $SSL_MODE"

if [[ "$DRY_RUN" == true ]]; then
    warn "DRY RUN MODE ENABLED — no system changes will be performed."
fi

# --- 1. System Compatibility & Root Check ---
check_prerequisites() {
    info "Step 1/6: Checking prerequisites and host system..."
    
    if [[ "$DRY_RUN" == false && $EUID -ne 0 ]]; then
        warn "This script is not running as root. Root privileges may be required for package installation and systemd operations."
        warn "If a step fails due to permissions, re-run with: sudo $0"
    fi

    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        info "Host OS: $NAME $VERSION_ID"
    else
        warn "Could not identify OS distribution via /etc/os-release."
    fi
}

# --- 2. System Update & Dependencies ---
install_dependencies() {
    info "Step 2/6: Installing OS packages and Docker engine..."

    if [[ "$DRY_RUN" == true ]]; then
        info "[Dry Run] Would run apt-get update & install docker, nginx, certbot, curl, jq, ufw."
        return 0
    fi

    if command -v apt-get >/dev/null 2>&1; then
        export DEBIAN_FRONTEND=noninteractive
        if [[ "$SKIP_SYS_UPDATE" == false ]]; then
            info "Updating apt package repository..."
            apt-get update -y && apt-get upgrade -y -o Dpkg::Options::="--force-confold"
        fi

        info "Installing core system packages (curl, git, jq, ca-certificates, gnupg, ufw)..."
        apt-get install -y curl git jq ca-certificates gnupg lsb-release ufw

        # Install Docker if missing
        if ! command -v docker >/dev/null 2>&1; then
            info "Installing Docker Engine..."
            install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes || true
            chmod a+r /etc/apt/keyrings/docker.gpg || true

            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            apt-get update -y
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        fi

        # Enable Docker systemd service
        if command -v systemctl >/dev/null 2>&1; then
            systemctl enable --now docker || true
        fi

        # Install Nginx if missing
        if ! command -v nginx >/dev/null 2>&1; then
            info "Installing Nginx..."
            apt-get install -y nginx
            systemctl enable --now nginx || true
        fi

        # Install Certbot if requested and missing
        if [[ "$SSL_MODE" == "certbot" ]] && ! command -v certbot >/dev/null 2>&1; then
            info "Installing Certbot and Nginx plugin..."
            apt-get install -y certbot python3-certbot-nginx
        fi

    else
        warn "Package manager apt-get not found. Skipping automated apt installation. Ensure Docker and Nginx are manually installed."
    fi

    # Verify Docker Compose
    if docker compose version >/dev/null 2>&1; then
        success "Docker Compose plugin is available: $(docker compose version)"
    elif command -v docker-compose >/dev/null 2>&1; then
        success "Legacy docker-compose is available: $(docker-compose --version)"
    else
        error "Neither 'docker compose' nor 'docker-compose' command was found."
        exit 1
    fi
}

# --- 3. Repository & Environment File Setup ---
setup_environment() {
    info "Step 3/6: Setting up project repository and production .env file..."

    cd "$PROJECT_ROOT"

    if [[ "$SKIP_GIT_PULL" == false && -d "$PROJECT_ROOT/.git" ]]; then
        info "Pulling latest code from git repository..."
        if [[ "$DRY_RUN" == true ]]; then
            info "[Dry Run] Would execute git pull origin main/master"
        else
            git pull || warn "git pull failed or branch diverged. Continuing with local codebase."
        fi
    fi

    ENV_FILE="$PROJECT_ROOT/.env"
    if [[ ! -f "$ENV_FILE" ]]; then
        info "Creating production .env file at $ENV_FILE..."
        if [[ "$DRY_RUN" == true ]]; then
            info "[Dry Run] Would create .env with default production settings."
        else
            cat <<EOF > "$ENV_FILE"
# AIRecruit Production Environment Variables
NODE_ENV=production
DEV_MODE=false
PORT=3000

# Database Connections
MONGO_URI=mongodb://airecruit:airecruit_prod_password@mongodb:27017/?authSource=admin
MONGO_DB=airecruit
REDIS_URL=redis://redis:6379/0

# Storage & Vector DB
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=airecruit
MINIO_SECRET_KEY=airecruit123
MINIO_BUCKET=airecruit
MINIO_SECURE=false
QDRANT_URL=http://qdrant:6333

# Security & Authentication
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "prod-jwt-secret-airecruit-key-$(date +%s)")
JWT_ALG=HS256
ACCESS_TOKEN_TTL_MIN=43200

# Platform Superadmin Credentials
SUPERADMIN_EMAIL=owner@airecruit.io
SUPERADMIN_PASSWORD=owner12345
SUPERADMIN_NAME=Platform Owner

# Domain & URLs
FRONTEND_ORIGIN=https://${DOMAIN}
NEXT_PUBLIC_API_URL=/api
EOF
            chmod 600 "$ENV_FILE"
            success "Created production .env file successfully."
        fi
    else
        success "Existing .env file detected at $ENV_FILE. Preserving configuration."
    fi
}

# --- 4. Nginx Reverse Proxy Setup ---
setup_nginx() {
    info "Step 4/6: Configuring Nginx reverse proxy..."

    NGINX_TEMPLATE="$PROJECT_ROOT/deploy/nginx/airecruit.conf"
    NGINX_CONF_DEST="/etc/nginx/sites-available/airecruit.conf"
    NGINX_CONF_LINK="/etc/nginx/sites-enabled/airecruit.conf"

    if [[ "$DRY_RUN" == true ]]; then
        info "[Dry Run] Would install Nginx config to $NGINX_CONF_DEST and test with nginx -t."
        return 0
    fi

    if [[ ! -f "$NGINX_TEMPLATE" ]]; then
        error "Nginx template configuration file not found at $NGINX_TEMPLATE."
        exit 1
    fi

    if [[ -d /etc/nginx/sites-available ]]; then
        info "Installing Nginx configuration..."
        cp "$NGINX_TEMPLATE" "$NGINX_CONF_DEST"

        # Enable site in sites-enabled
        mkdir -p /etc/nginx/sites-enabled
        ln -sf "$NGINX_CONF_DEST" "$NGINX_CONF_LINK"

        # Disable default site if present to prevent port 80 conflicts
        if [[ -f /etc/nginx/sites-enabled/default ]]; then
            info "Disabling Nginx default site configuration..."
            rm -f /etc/nginx/sites-enabled/default
        fi

        # Validate Nginx syntax
        if command -v nginx >/dev/null 2>&1; then
            info "Testing Nginx configuration syntax..."
            nginx -t
            systemctl reload nginx || systemctl restart nginx
            success "Nginx reverse proxy configured and reloaded successfully."
        fi
    else
        warn "/etc/nginx/sites-available does not exist. Please copy $NGINX_TEMPLATE to your Nginx configuration directory."
    fi
}

# --- 5. SSL Automated Setup ---
setup_ssl() {
    info "Step 5/6: Configuring SSL ($SSL_MODE)..."

    if [[ "$DRY_RUN" == true ]]; then
        info "[Dry Run] Would setup SSL mode: $SSL_MODE"
        return 0
    fi

    case "$SSL_MODE" in
        certbot)
            if command -v certbot >/dev/null 2>&1; then
                info "Obtaining Let's Encrypt SSL certificate via Certbot for $DOMAIN & $ADMIN_DOMAIN..."
                certbot --nginx --non-interactive --agree-tos --email "$EMAIL" \
                    -d "$DOMAIN" -d "$ADMIN_DOMAIN" --redirect || warn "Certbot certificate request failed. Ensure DNS A records point to this EC2 server IP."
            else
                warn "Certbot is not installed. Skipping automated SSL issuance."
            fi
            ;;
        cloudflare)
            info "Cloudflare SSL integration mode selected."
            info "Ensure Cloudflare DNS A records for '$DOMAIN' and '$ADMIN_DOMAIN' are set to Proxied (Orange Cloud)."
            info "Set Cloudflare SSL/TLS encryption mode to 'Flexible' or 'Full'."
            ;;
        none)
            info "SSL setup skipped as requested (--ssl-mode none)."
            ;;
        *)
            warn "Unrecognized SSL mode: $SSL_MODE. Skipping SSL configuration."
            ;;
    esac
}

# --- 6. Container Deployment & Health Validation ---
deploy_and_validate() {
    info "Step 6/6: Building, launching Docker containers, and validating health..."

    cd "$PROJECT_ROOT"

    COMPOSE_CMD=""
    if docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    fi

    if [[ "$DRY_RUN" == true ]]; then
        info "[Dry Run] Would execute: $COMPOSE_CMD -f docker-compose.prod.yml up -d --build"
        info "[Dry Run] Would execute health checks on backend (:8000), frontend (:3000), and Nginx (:80)."
        return 0
    fi

    info "Building and starting production containers using docker-compose.prod.yml..."
    $COMPOSE_CMD -f docker-compose.prod.yml up -d --build

    info "Waiting 15 seconds for containers to initialize and complete health startup..."
    sleep 15

    # --- Healthcheck Validation ---
    info "Executing health checks..."

    PASS_COUNT=0
    FAIL_COUNT=0

    check_endpoint() {
        local name="$1"
        local url="$2"
        local headers="${3:-}"
        local expected_code="${4:-200}"

        local http_code
        if [[ -n "$headers" ]]; then
            http_code=$(curl -s -o /dev/null -w "%{http_code}" -H "$headers" --connect-timeout 5 --max-time 10 "$url" || echo "000")
        else
            http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$url" || echo "000")
        fi

        if [[ "$http_code" == "$expected_code" ]]; then
            success "Health Check [$name]: HTTP $http_code (PASSED)"
            PASS_COUNT=$((PASS_COUNT + 1))
        else
            error "Health Check [$name]: HTTP $http_code (Expected $expected_code) (FAILED)"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi
    }

    check_endpoint "Backend Direct Health (/api/system/health)" "http://127.0.0.1:8000/api/system/health" "" "200"
    check_endpoint "Backend Main Health (/api/health)" "http://127.0.0.1:8000/api/health" "" "200"
    check_endpoint "Frontend Direct Root (:3000)" "http://127.0.0.1:3000/" "" "200"
    check_endpoint "Nginx Reverse Proxy API Routing" "http://127.0.0.1/api/system/health" "Host: $DOMAIN" "200"
    check_endpoint "Nginx Reverse Proxy Frontend Routing" "http://127.0.0.1/" "Host: $DOMAIN" "200"

    echo ""
    info "=========================================================================="
    info "                     DEPLOYMENT SUMMARY & HEALTH CHECK                     "
    info "=========================================================================="
    info " Passed Checks: $PASS_COUNT"
    info " Failed Checks: $FAIL_COUNT"
    info " Services Status:"
    $COMPOSE_CMD -f docker-compose.prod.yml ps || true
    info "=========================================================================="

    if [[ $FAIL_COUNT -eq 0 ]]; then
        success "AWS EC2 Deployment completed successfully! All health checks PASSED."
    else
        warn "Deployment completed with $FAIL_COUNT failed health checks. Please check logs: $COMPOSE_CMD -f docker-compose.prod.yml logs"
    fi
}

# --- Main Execution Flow ---
main() {
    check_prerequisites
    install_dependencies
    setup_environment
    setup_nginx
    setup_ssl
    deploy_and_validate
}

main
