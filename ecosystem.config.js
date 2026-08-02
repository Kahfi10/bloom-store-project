// ecosystem.config.js — PM2 configuration for Bloom Store
module.exports = {
  apps: [
    {
      name: 'bloom-store',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/bloom-store',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        DATABASE_URL: 'file:/var/www/bloom-store/prisma/prod.db',
        // Admin credentials — langsung di PM2 env agar pasti terbaca
        ADMIN_USERNAME:    'bloom_admin',
        ADMIN_PASSWORD:    'BloomAdmin2025!',
        ADMIN_SECRET_KEY:  'bloom_secret_2025_kahfi',
        ADMIN_ACCESS_CODE: 'BLOOM2025',
      },
      error_file: '/var/log/pm2/bloom-store-error.log',
      out_file: '/var/log/pm2/bloom-store-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
      max_memory_restart: '400M',
      restart_delay: 3000,
    },
  ],
};
