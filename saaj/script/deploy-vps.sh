#!/usr/bin/env bash
# SAAJ by MF — one-shot VPS deploy script
# Target: Ubuntu 22.04/24.04, runs as root.
#
# Usage:
#   1) SSH into the server:           ssh root@82.25.108.80
#   2) Save this file there:          nano /root/deploy-vps.sh    (paste, save)
#   3) Make executable + run:         chmod +x /root/deploy-vps.sh && /root/deploy-vps.sh
#
# Re-running is safe — every step is idempotent.

set -euo pipefail

# ─── EDIT THESE BEFORE FIRST RUN ──────────────────────────────────────────────
DOMAIN="saajbymf.mtai.live"
REPO_URL="https://github.com/YOUR_USER/YOUR_REPO.git"   # <— change me
REPO_BRANCH="main"
APP_DIR="/var/www/saajbymf"
DB_NAME="saajbymf"
DB_USER="saaj"
DB_PASS="$(openssl rand -hex 24)"        # generated once, persisted in .env
ADMIN_EMAIL="admin@${DOMAIN}"            # used by certbot for renewal notices
# ─────────────────────────────────────────────────────────────────────────────

log() { printf '\n\033[1;36m[deploy] %s\033[0m\n' "$*"; }

log "1/8  Updating apt + installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates gnupg lsb-release git ufw nginx postgresql postgresql-contrib

log "2/8  Installing Node.js 22 (NodeSource) + pm2"
if ! command -v node >/dev/null || [[ "$(node -v)" != v22* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
npm i -g pm2

log "3/8  Configuring Postgres role + database"
systemctl enable --now postgresql
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

log "4/8  Cloning / pulling app code into ${APP_DIR}"
if [[ -d "${APP_DIR}/.git" ]]; then
  git -C "${APP_DIR}" fetch --all
  git -C "${APP_DIR}" reset --hard "origin/${REPO_BRANCH}"
else
  mkdir -p "$(dirname "${APP_DIR}")"
  git clone -b "${REPO_BRANCH}" "${REPO_URL}" "${APP_DIR}"
fi
mkdir -p "${APP_DIR}/public/uploads"

log "5/8  Writing .env (only on first run — kept on re-deploy)"
ENV_FILE="${APP_DIR}/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  SESSION_SECRET="$(openssl rand -hex 32)"
  cat > "${ENV_FILE}" <<EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}
SESSION_SECRET=${SESSION_SECRET}
EOF
  chmod 600 "${ENV_FILE}"
  echo "   wrote ${ENV_FILE} (DB password and SESSION_SECRET generated)"
else
  echo "   ${ENV_FILE} already exists — leaving it untouched"
fi

log "6/8  Installing deps + building + pushing schema + seeding"
cd "${APP_DIR}"
npm ci --no-audit --no-fund
npm run db:push
# Seed only if there are no products yet
COUNT=$(sudo -u postgres psql -d "${DB_NAME}" -tAc "SELECT count(*) FROM saaj_products" 2>/dev/null || echo 0)
if [[ "${COUNT}" == "0" ]]; then
  npm run db:seed || true
fi
npm run build

log "7/8  Starting / reloading app under pm2"
if pm2 describe saajbymf >/dev/null 2>&1; then
  pm2 reload saajbymf --update-env
else
  pm2 start "npm run start" --name saajbymf --cwd "${APP_DIR}"
fi
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null || true

log "8/8  Nginx reverse proxy + TLS for ${DOMAIN}"
NGINX_CONF="/etc/nginx/sites-available/saajbymf"
cat > "${NGINX_CONF}" <<NGINX
server {
  listen 80;
  server_name ${DOMAIN};
  client_max_body_size 25M;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 300s;
  }
}
NGINX
ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/saajbymf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Firewall (only if ufw is inactive — don't change an existing policy)
if ! ufw status | grep -q "Status: active"; then
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
fi

# TLS via Let's Encrypt
if ! command -v certbot >/dev/null; then
  apt-get install -y certbot python3-certbot-nginx
fi
certbot --nginx --non-interactive --agree-tos -m "${ADMIN_EMAIL}" -d "${DOMAIN}" --redirect || \
  echo "   certbot did not issue a cert — make sure ${DOMAIN} points to this server's IP, then re-run: certbot --nginx -d ${DOMAIN}"

log "Done. https://${DOMAIN}/ should be live."
echo "   pm2 status:"
pm2 status
echo
echo "   Useful commands:"
echo "     pm2 logs saajbymf            # tail app logs"
echo "     pm2 reload saajbymf          # zero-downtime restart"
echo "     systemctl reload nginx       # reload reverse proxy"
echo "     cd ${APP_DIR} && git pull && npm ci && npm run build && pm2 reload saajbymf   # redeploy"
