# Deploying SAAJ by MF to VPS

## Domain
`https://saajbymf.mtai.live`

## Stack
- **Node.js 20** — app runtime
- **PM2** — process manager (auto-restart, startup on reboot)
- **PostgreSQL** — local database
- **Nginx** — reverse proxy + static files
- **Let's Encrypt / Certbot** — free SSL

---

## One-Time VPS Setup

### Prerequisites
- Ubuntu 22.04 or 24.04 VPS
- DNS A record for `saajbymf.mtai.live` pointing to your VPS IP
- SSH access as root (or sudo user)
- Your GitHub repo URL

### Step 1 — Edit the setup script
Open `setup-vps.sh` and update line 14:
```bash
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"
```
If your repo is private, use an SSH URL and ensure the VPS has a deploy key.

### Step 2 — Upload and run
```bash
# From your local machine:
scp setup-vps.sh ssl-setup.sh root@YOUR_VPS_IP:~

# On the VPS:
chmod +x setup-vps.sh ssl-setup.sh
sudo ./setup-vps.sh
```

The script will:
1. Install Node 20, PostgreSQL, Nginx, PM2, Certbot
2. Create DB `saajbymf` and user `saaj_user` with a random password
3. Clone your repo to `/var/www/saajbymf`
4. Generate a `.env` file with all secrets
5. Build the app and run `db:push` + `db:seed`
6. Start the app on port **2600** via PM2
7. Configure Nginx for HTTP on port 80

### Step 3 — Confirm HTTP works
Open `http://saajbymf.mtai.live` in a browser. The site should load.

### Step 4 — Enable SSL
```bash
sudo ./ssl-setup.sh
```
This runs Certbot, installs the cert, and switches Nginx to the HTTPS config.  
The site will then be live at `https://saajbymf.mtai.live`.

---

## CI/CD — Automatic Deploys on Push

Every push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`).

### GitHub Secrets Required

Go to **Settings → Secrets and variables → Actions** in your GitHub repo and add:

| Secret | Value |
|---|---|
| `VPS_HOST` | Your VPS IP address |
| `VPS_USER` | SSH username (e.g. `root`) |
| `VPS_SSH_KEY` | Private SSH key (contents of `~/.ssh/id_rsa`) |
| `VPS_PORT` | SSH port (usually `22`) |

### Generating an SSH key pair for CI
```bash
# On your local machine:
ssh-keygen -t ed25519 -C "github-actions-saaj" -f ~/.ssh/saaj_deploy

# Copy public key to VPS:
ssh-copy-id -i ~/.ssh/saaj_deploy.pub root@YOUR_VPS_IP

# Paste the PRIVATE key (saaj_deploy) into GitHub secret VPS_SSH_KEY
cat ~/.ssh/saaj_deploy
```

### What the workflow does on each push:
1. Checks out code and runs `npm run check` (TypeScript)
2. Builds the app
3. SSHs into the VPS and:
   - Pulls the latest code
   - Runs `db:push` (safe, idempotent schema migrations)
   - Rebuilds the app
   - Reloads PM2 (zero-downtime reload)
   - Health-checks `http://127.0.0.1:2600/api/settings/public`

---

## Useful PM2 Commands (on the VPS)

```bash
pm2 status                    # Show all processes
pm2 logs saajbymf             # Live logs
pm2 logs saajbymf --lines 100 # Last 100 lines
pm2 restart saajbymf          # Hard restart
pm2 reload saajbymf           # Zero-downtime reload
pm2 monit                     # CPU/memory dashboard
```

## Nginx Commands

```bash
nginx -t                      # Test config
systemctl reload nginx        # Apply config changes
tail -f /var/log/nginx/saajbymf_error.log   # Error log
tail -f /var/log/nginx/saajbymf_access.log  # Access log
```

## PostgreSQL

```bash
sudo -u postgres psql -d saajbymf    # Open DB shell
# The .env file at /var/www/saajbymf/.env holds credentials
```

## App Config

The `.env` file lives at `/var/www/saajbymf/.env` on the VPS.  
It is **not** committed to git (listed in `.gitignore`).  
To update settings (SMTP, etc.) edit it directly and reload PM2.

```bash
nano /var/www/saajbymf/.env
pm2 reload saajbymf --update-env
```
