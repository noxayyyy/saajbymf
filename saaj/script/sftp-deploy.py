#!/usr/bin/env python3
"""SFTP deploy helper for SAAJ by MF."""
import os
import posixpath
import stat
import sys
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parents[1]
REMOTE_DIR = "/var/www/saajbymf"
EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    ".local",
    ".agents",
    "debug.log",
}
EXCLUDE_FILES = {".env"}
INCLUDE_TOP_LEVEL = {
    "dist",
    "public",
    "shared",
    "server",
    "attached_assets",
    "package.json",
    "package-lock.json",
    "ecosystem.config.cjs",
    "drizzle.config.ts",
    "nginx-saajbymf.conf",
    "nginx-saajbymf-http.conf",
    "ssl-setup.sh",
    "setup-vps.sh",
}


def should_upload(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    parts = rel.parts
    if not parts:
        return False
    if parts[0] in EXCLUDE_DIRS:
        return False
    if path.name in EXCLUDE_FILES:
        return False
    if len(parts) == 1:
        return path.name in INCLUDE_TOP_LEVEL or path.is_dir() and path.name in INCLUDE_TOP_LEVEL
    return False


def collect_files() -> list[Path]:
    files: list[Path] = []
    for name in INCLUDE_TOP_LEVEL:
        p = ROOT / name
        if not p.exists():
            continue
        if p.is_file():
            files.append(p)
        else:
            for child in p.rglob("*"):
                if child.is_file():
                    rel = child.relative_to(ROOT)
                    if any(part in EXCLUDE_DIRS for part in rel.parts):
                        continue
                    files.append(child)
    return files


def ensure_remote_dir(sftp: paramiko.SFTPClient, remote_path: str) -> None:
    parts = remote_path.strip("/").split("/")
    current = ""
    for part in parts:
        current = f"{current}/{part}" if current else f"/{part}"
        try:
            sftp.stat(current)
        except FileNotFoundError:
            sftp.mkdir(current)


def upload_tree(sftp: paramiko.SFTPClient, files: list[Path]) -> None:
    ensure_remote_dir(sftp, REMOTE_DIR)
    for local in files:
        rel = local.relative_to(ROOT).as_posix()
        remote = posixpath.join(REMOTE_DIR, rel)
        ensure_remote_dir(sftp, posixpath.dirname(remote))
        print(f"upload {rel}")
        sftp.put(str(local), remote)


def run_remote(ssh: paramiko.SSHClient, command: str) -> None:
    print(f"\n$ {command}")
    _, stdout, stderr = ssh.exec_command(command)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    if out.strip():
        sys.stdout.buffer.write((out.rstrip() + "\n").encode("utf-8", errors="replace"))
    if err.strip():
        sys.stderr.buffer.write((err.rstrip() + "\n").encode("utf-8", errors="replace"))
    if exit_code != 0:
        raise RuntimeError(f"Remote command failed ({exit_code}): {command}")


def main() -> None:
    host = os.environ["DEPLOY_HOST"]
    user = os.environ.get("DEPLOY_USER", "root")
    password = os.environ["DEPLOY_PASSWORD"]

    files = collect_files()
    print(f"Uploading {len(files)} files to {host}:{REMOTE_DIR}")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=user, password=password, timeout=30)
    sftp = ssh.open_sftp()
    try:
        upload_tree(sftp, files)
    finally:
        sftp.close()

    remote_script = r"""
set -euo pipefail
APP_DIR=/var/www/saajbymf
DOMAIN=saajbymf.mtai.live
APP_PORT=2600
DB_NAME=saajbymf
DB_USER=saaj_user

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y curl git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw >/dev/null 2>&1 || true

if ! command -v node >/dev/null || [[ "$(node -v)" != v20* && "$(node -v)" != v22* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm install -g pm2

systemctl enable --now postgresql
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  DB_PASS=$(openssl rand -hex 24)
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
elif ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
fi

mkdir -p ${APP_DIR}/public/uploads /var/log/pm2
if [ ! -f ${APP_DIR}/.env ]; then
  DB_PASS=$(openssl rand -hex 24)
  if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
    sudo -u postgres psql -c "ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  else
    sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  fi
  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
  fi
  SESSION_SECRET=$(openssl rand -hex 32)
  cat > ${APP_DIR}/.env <<EOF
NODE_ENV=production
PORT=${APP_PORT}
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}
SESSION_SECRET=${SESSION_SECRET}
EOF
  chmod 600 ${APP_DIR}/.env
fi

cd ${APP_DIR}
npm ci --no-audit --no-fund
npm run db:push
COUNT=$(sudo -u postgres psql -d ${DB_NAME} -tAc "SELECT count(*) FROM saaj_products" 2>/dev/null || echo 0)
if [ "${COUNT}" = "0" ]; then npm run db:seed || true; fi

if pm2 describe saajbymf >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --env production --update-env
else
  pm2 start ecosystem.config.cjs --env production
fi
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

cp ${APP_DIR}/nginx-saajbymf.conf /etc/nginx/sites-available/saajbymf 2>/dev/null || true
if [ ! -f /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ]; then
  cp ${APP_DIR}/nginx-saajbymf-http.conf /etc/nginx/sites-available/saajbymf 2>/dev/null || true
fi
ln -sf /etc/nginx/sites-available/saajbymf /etc/nginx/sites-enabled/saajbymf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

if [ ! -f /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ]; then
  certbot --nginx --non-interactive --agree-tos -m admin@${DOMAIN} -d ${DOMAIN} --redirect || true
  cp ${APP_DIR}/nginx-saajbymf.conf /etc/nginx/sites-available/saajbymf
  nginx -t && systemctl reload nginx
fi

if ! ufw status | grep -q "Status: active"; then
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable || true
fi

curl -fsS http://127.0.0.1:${APP_PORT}/api/settings/public >/dev/null
pm2 status
"""

    run_remote(ssh, remote_script)
    ssh.close()
    print("\nDeploy complete.")


if __name__ == "__main__":
    main()
