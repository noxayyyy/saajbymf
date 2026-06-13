#!/usr/bin/env python3
import os
import sys

import paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(
    os.environ["DEPLOY_HOST"],
    username=os.environ.get("DEPLOY_USER", "root"),
    password=os.environ["DEPLOY_PASSWORD"],
    timeout=30,
)

cmds = [
    "pm2 status",
    'curl -sS -o /dev/null -w "local:%{http_code}" http://127.0.0.1:2600/api/settings/public',
    'curl -sS -o /dev/null -w " nginx:%{http_code}" http://127.0.0.1/api/settings/public',
    'curl -sS -o /dev/null -w " https:%{http_code}" https://saajbymf.mtai.live/api/settings/public',
    "nginx -t 2>&1",
    "test -f /var/www/saajbymf/.env && echo env:ok || echo env:missing",
    "tail -n 20 /var/log/pm2/saajbymf-error.log 2>/dev/null || true",
]

for cmd in cmds:
    print(f"\n$ {cmd}")
    _, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    if out:
        print(out)
    if err:
        print(err)

ssh.close()
