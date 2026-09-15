#!/bin/bash
# scripts/restore-db.sh — Bloom Store Database Restore Script
# Penggunaan: bash scripts/restore-db.sh /path/to/backup.db.gz

set -e

BACKUP_SOURCE="$1"
DB_TARGET="/var/www/bloom-store/prisma/prod.db"

if [ -z "$BACKUP_SOURCE" ]; then
  echo "Penggunaan: bash scripts/restore-db.sh <file_backup.db[.gz]>"
  exit 1
fi

if [ ! -f "$BACKUP_SOURCE" ]; then
  echo "Error: File backup '$BACKUP_SOURCE' tidak ditemukan."
  exit 1
fi

echo "[1/4] Menghentikan PM2 untuk menghindari database lock saat restore..."
pm2 stop bloom-store || true

TEMP_DB="/tmp/restore_temp_$$.db"

echo "[2/4] Mengekstrak dan memverifikasi backup..."
if [[ "$BACKUP_SOURCE" == *.gz ]]; then
  gunzip -c "$BACKUP_SOURCE" > "$TEMP_DB"
else
  cp "$BACKUP_SOURCE" "$TEMP_DB"
fi

if command -v sqlite3 &> /dev/null; then
  CHECK=$(sqlite3 "$TEMP_DB" "PRAGMA integrity_check;")
  if [ "$CHECK" != "ok" ]; then
    echo "Error: File backup rusak (integrity check: $CHECK)."
    rm -f "$TEMP_DB"
    pm2 start bloom-store || true
    exit 1
  fi
  echo "Verifikasi integritas backup lulus ✓"
fi

echo "[3/4] Mengganti database aktif..."
# Simpan database saat ini sebagai safety backup sebelum ditimpa
if [ -f "$DB_TARGET" ]; then
  cp "$DB_TARGET" "${DB_TARGET}.before_restore_$(date +%s)"
fi

cp "$TEMP_DB" "$DB_TARGET"
rm -f "$TEMP_DB"

echo "[4/4] Menjalankan kembali aplikasi..."
pm2 start bloom-store
echo "Database berhasil di-restore dan aplikasi aktif kembali ✓"
