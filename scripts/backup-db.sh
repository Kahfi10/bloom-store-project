#!/bin/bash
# scripts/backup-db.sh — Bloom Store SQLite Online Backup
# Aman dijalankan saat server aktif (menggunakan SQLite online backup / safe copy)

set -e

DB_FILE="/var/www/bloom-store/prisma/prod.db"
BACKUP_DIR="/var/backups/bloom-store"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/prod_backup_${TIMESTAMP}.db"

mkdir -p "$BACKUP_DIR"

echo "[1/3] Memeriksa database..."
if [ ! -f "$DB_FILE" ]; then
  echo "Error: Database $DB_FILE tidak ditemukan."
  exit 1
fi

echo "[2/3] Melakukan snapshot database ke $BACKUP_FILE..."
if command -v sqlite3 &> /dev/null; then
  # Gunakan sqlite3 .backup untuk konsistensi snapshot tanpa locking berkepanjangan
  sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"
else
  # Fallback cp jika sqlite3 cli tidak terpasang
  cp "$DB_FILE" "$BACKUP_FILE"
fi

echo "[3/3] Memverifikasi integritas backup..."
if command -v sqlite3 &> /dev/null; then
  INTEGRITY=$(sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;")
  if [ "$INTEGRITY" != "ok" ]; then
    echo "Peringatan: Verifikasi integritas gagal: $INTEGRITY"
    exit 1
  fi
  echo "Integritas database: OK ✓"
fi

# Kompresi backup
gzip -f "$BACKUP_FILE"
echo "Backup berhasil dibuat: ${BACKUP_FILE}.gz"

# Hapus backup yang lebih lama dari 30 hari
find "$BACKUP_DIR" -type f -name "prod_backup_*.db.gz" -mtime +30 -delete
echo "Pembersihan backup lama selesai ✓"
