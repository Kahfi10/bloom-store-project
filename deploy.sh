#!/bin/bash
# deploy.sh — Bloom Store deployment script
# Jalankan di Oracle VM: bash deploy.sh

set -e

APP_DIR="/var/www/bloom-store"
REPO_URL="https://github.com/Kahfi10/bloom-store-project.git"
BRANCH="main"
NODE_VERSION="18"
PORT=3001

echo "======================================"
echo " BLOOM STORE — DEPLOYMENT SCRIPT"
echo "======================================"

# ── 1. Cek Node.js ─────────────────────────────────────────────────────────
echo ""
echo "[1/8] Cek Node.js..."
if ! command -v node &> /dev/null; then
  echo "Node.js tidak ditemukan. Install..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "Node: $(node -v) | NPM: $(npm -v)"

# ── 2. Cek PM2 ──────────────────────────────────────────────────────────────
echo ""
echo "[2/8] Cek PM2..."
if ! command -v pm2 &> /dev/null; then
  echo "PM2 tidak ditemukan. Install..."
  sudo npm install -g pm2
fi
echo "PM2: $(pm2 -v)"

# ── 3. Clone atau update repo ────────────────────────────────────────────────
echo ""
echo "[3/8] Clone / Update repository..."
if [ -d "$APP_DIR" ]; then
  echo "Direktori sudah ada. Pull latest..."
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/$BRANCH
else
  echo "Clone repository..."
  sudo mkdir -p "$APP_DIR"
  sudo chown $USER:$USER "$APP_DIR"
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 4. Buat folder log ───────────────────────────────────────────────────────
echo ""
echo "[4/8] Setup direktori..."
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
mkdir -p "$APP_DIR/prisma"

# ── 5. Setup .env.production ─────────────────────────────────────────────────
echo ""
echo "[5/8] Cek environment file..."
if [ ! -f "$APP_DIR/.env.production" ]; then
  echo ""
  echo "⚠  FILE .env.production BELUM ADA!"
  echo "   Buat file $APP_DIR/.env.production dengan isi:"
  echo "   DATABASE_URL=file:/var/www/bloom-store/prisma/prod.db"
  echo "   ADMIN_USERNAME=bloom_admin"
  echo "   ADMIN_PASSWORD=PasswordKamu"
  echo "   ADMIN_SECRET_KEY=SecretKey"
  echo "   ADMIN_ACCESS_CODE=KodeAkses"
  echo ""
  echo "   Jalankan ulang script setelah file dibuat."
  exit 1
fi
echo ".env.production ditemukan ✓"

# ── 6. Install dependencies & Build ─────────────────────────────────────────
echo ""
echo "[6/8] Install dependencies..."
npm ci --omit=dev

echo ""
echo "Build Next.js (production)..."
NODE_ENV=production npm run build

# ── 7. Database ───────────────────────────────────────────────────────────────
echo ""
echo "[7/8] Setup database..."
export DATABASE_URL="file:/var/www/bloom-store/prisma/prod.db"
npx prisma migrate deploy
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
echo "Database ready ✓"

# ── 8. Start/Restart PM2 ─────────────────────────────────────────────────────
echo ""
echo "[8/8] Start aplikasi dengan PM2..."
cd "$APP_DIR"
pm2 delete bloom-store 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

echo ""
echo "======================================"
echo " DEPLOYMENT SELESAI! ✓"
echo "======================================"
echo " App berjalan di: http://localhost:$PORT"
echo " PM2 status: pm2 list"
echo " PM2 logs:   pm2 logs bloom-store"
echo "======================================"
