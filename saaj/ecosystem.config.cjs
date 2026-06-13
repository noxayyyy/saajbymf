module.exports = {
  apps: [
    {
      name: "saajbymf",
      script: "./dist/index.cjs",
      cwd: "/var/www/saajbymf",
      instances: 1,
      exec_mode: "fork",
      node_args: "--max-old-space-size=512",
      env_production: {
        NODE_ENV: "production",
        PORT: 2600,
      },
      watch: false,
      max_memory_restart: "512M",
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: "10s",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/pm2/saajbymf-error.log",
      out_file: "/var/log/pm2/saajbymf-out.log",
      merge_logs: true,
      autorestart: true,
    },
  ],
};
