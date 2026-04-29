// ========== CONFIGURE HERE ==========
const APP_NAME = "pesona-kebaikan";
const PORT = 3000;
const PORT_STAGING = 3001;
const MAX_MEMORY = "512M";
// =====================================

module.exports = {
  apps: [
    {
      name: APP_NAME,
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${PORT}`,
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: MAX_MEMORY,
      env: {
        NODE_ENV: "production",
        PORT,
      },
      env_staging: {
        NODE_ENV: "production",
        PORT: PORT_STAGING,
      },
      env_development: {
        NODE_ENV: "development",
        PORT,
      },
    },
  ],
};
