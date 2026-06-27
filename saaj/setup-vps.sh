#!/usr/bin/env bash
# =============================================================================
# SAAJ by MF — VPS Setup Script
# Domain : saajbymf.mtai.live
# Stack  : Node 20 · PostgreSQL · Nginx · PM2
# OS     : Ubuntu 22.04 / 24.04
#
# Usage:
#   chmod +x setup-vps.sh
#   sudo ./setup-vps.sh
#
# After this script finishes the site will be live over HTTP.
# Run  ./ssl-setup.sh  once HTTP works to enable HTTPS.
# =============================================================================

set -euo pipefail

DOMAIN="saajbymf.mtai.live"
APP_DIR="/var/www/saajbymf"
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"   # <-- update this
DB_NAME="saajbymf"
DB_USER="saaj_user"
DB_PASS="$(openssl rand -hex 24)"   # auto-generated secure password
NODE_VERSION="20"
APP_PORT=2600

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
fail()    { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

# ---------------------------------------------------------------------------
# 1. System packages
# ---------------------------------------------------------------------------
info "Updating system packages..."
apt-get update -qq
apt-get install -y curl git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw

# ---------------------------------------------------------------------------
# 2. Node.js 20 via NodeSource
# ---------------------------------------------------------------------------
if ! command -v node &>/dev/null || [[ "$(node -v)" != v${NODE_VERSION}* ]]; then
  info "Installing Node.js ${NODE_VERSION}..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
node -v && npm -v
success "Node.js ready"

# ---------------------------------------------------------------------------
# 3. PM2
# ---------------------------------------------------------------------------
if ! command -v pm2 &>/dev/null; then
  info "Installing PM2 globally..."
  npm install -g pm2
fi
pm2 startup systemd -u root --hp /root | tail -1 | bash || true
success "PM2 ready"

# ---------------------------------------------------------------------------
# 4. PostgreSQL — create DB and user
# ---------------------------------------------------------------------------
info "Configuring PostgreSQL..."
systemctl enable --now postgresql

PG_SETUP=$(cat <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL
)
su -c "psql -c \"${PG_SETUP}\"" postgres 2>/dev/null || \
  su -c "psql -c \"ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';\"" postgres
success "PostgreSQL configured  DB=${DB_NAME}  USER=${DB_USER}"

# ---------------------------------------------------------------------------
# 5. Clone / update app
# ---------------------------------------------------------------------------
info "Setting up application directory at ${APP_DIR}..."
mkdir -p /var/log/pm2
if [ -d "${APP_DIR}/.git" ]; then
  warn "Repo already cloned — pulling latest..."
  cd "${APP_DIR}"
  git fetch --all
  git reset --hard origin/main
else
  git clone "${REPO_URL}" "${APP_DIR}"
  cd "${APP_DIR}"
fi

# ---------------------------------------------------------------------------
# 6. .env file
# ---------------------------------------------------------------------------
SESSION_SECRET="$(openssl rand -hex 64)"
ENV_FILE="${APP_DIR}/.env"

if [ -f "${ENV_FILE}" ]; then
  warn ".env already exists — skipping creation. Update DB password manually if needed."
else
  info "Creating .env..."
  cat > "${ENV_FILE}" <<EOF
NODE_ENV=production
PORT=${APP_PORT}

DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
PGHOST=localhost
PGPORT=5432
PGDATABASE=${DB_NAME}
PGUSER=${DB_USER}
PGPASSWORD=${DB_PASS}

SESSION_SECRET=${SESSION_SECRET}

# SMTP — fill in via Admin Panel > Settings > Email, or here:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@saajbymf.mtai.live
EOF
  chmod 600 "${ENV_FILE}"
  success ".env created"
fi

# ---------------------------------------------------------------------------
# 7. Install deps, build, seed, migrate
# ---------------------------------------------------------------------------
info "Installing Node dependencies..."
cd "${APP_DIR}"
npm ci --omit=dev --no-audit --no-fund

info "Applying database schema..."
npm run db:push

info "Seeding database (safe to re-run)..."
npm run db:seed || warn "Seed already ran or skipped."

info "Building application..."
npm run build
success "Build complete"

# ---------------------------------------------------------------------------
# 8. Start with PM2
# ---------------------------------------------------------------------------
info "Starting app with PM2..."
cd "${APP_DIR}"
pm2 delete saajbymf 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
success "PM2 process started"

# ---------------------------------------------------------------------------
# 9. Nginx — HTTP only (run ssl-setup.sh later for HTTPS)
# ---------------------------------------------------------------------------
info "Configuring Nginx (HTTP only)..."
cp "${APP_DIR}/nginx-saajbymf-http.conf" "/etc/nginx/sites-available/saajbymf"
ln -sf "/etc/nginx/sites-available/saajbymf" "/etc/nginx/sites-enabled/saajbymf"
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx
success "Nginx configured for HTTP"

# ---------------------------------------------------------------------------
# 10. UFW firewall
# ---------------------------------------------------------------------------
info "Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow "Nginx Full"
success "Firewall configured"

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "============================================================"
echo -e "${GREEN}  SAAJ by MF is live over HTTP!${NC}"
echo "  URL  : http://${DOMAIN}"
echo "  App  : port ${APP_PORT}  (PM2 process: saajbymf)"
echo "  DB   : ${DB_NAME}  user: ${DB_USER}"
echo "  Logs : pm2 logs saajbymf"
echo ""
echo "  NEXT: verify the site loads at http://${DOMAIN}"
echo "  Then run:  sudo ./ssl-setup.sh"
echo "============================================================"
