#!/usr/bin/env bash
# =============================================================================
# SAAJ by MF — SSL Setup (run AFTER setup-vps.sh and HTTP is confirmed working)
# =============================================================================

set -euo pipefail

DOMAIN="saajbymf.mtai.live"
APP_DIR="/var/www/saajbymf"
EMAIL="admin@saajbymf.com"   # <-- change to your real email for Let's Encrypt alerts

GREEN='\033[0;32m'
NC='\033[0m'

echo "==> Obtaining Let's Encrypt certificate for ${DOMAIN}..."
certbot --nginx \
  -d "${DOMAIN}" \
  --non-interactive \
  --agree-tos \
  --email "${EMAIL}" \
  --redirect

echo "==> Switching Nginx to full HTTPS config..."
cp "${APP_DIR}/nginx-saajbymf.conf" "/etc/nginx/sites-available/saajbymf"
nginx -t && systemctl reload nginx

echo "==> Setting up automatic certificate renewal..."
systemctl enable --now certbot.timer 2>/dev/null || \
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

echo ""
echo "============================================================"
echo -e "${GREEN}  SSL is active!${NC}"
echo "  URL: https://${DOMAIN}"
echo "  Certificate renews automatically every 60 days."
echo "============================================================"
