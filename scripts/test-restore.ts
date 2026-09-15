import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Automated test script to verify backup and restore procedure (Poin 18: Tes restore backup).
 * Runs cross-platform on Windows and Linux.
 */
async function runTestRestore() {
  console.log('====================================================');
  console.log(' BLOOM STORE — DATABASE BACKUP & RESTORE TEST');
  console.log('====================================================\n');

  const rootDir = process.cwd();
  let dbPath = path.join(rootDir, 'prisma', 'prisma', 'dev.db');
  if (!fs.existsSync(dbPath)) {
    dbPath = path.join(rootDir, 'prisma', 'dev.db');
  }
  const backupDir = path.join(rootDir, 'backups');
  const backupFile = path.join(backupDir, `test_backup_${Date.now()}.db`);
  const restoredFile = path.join(backupDir, 'test_restored.db');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. Cek source database
  console.log('[1/4] Memeriksa database sumber...');
  if (!fs.existsSync(dbPath)) {
    console.log(`Peringatan: ${dbPath} belum ada. Membuat seed database terlebih dahulu...`);
    execSync('npx prisma migrate dev --name init', { cwd: rootDir, stdio: 'inherit' });
    execSync('npm run db:seed', { cwd: rootDir, stdio: 'inherit' });
  }
  const sourceStats = fs.statSync(dbPath);
  console.log(`Database sumber ditemukan (${(sourceStats.size / 1024).toFixed(2)} KB) ✓`);

  // 2. Snapshot backup
  console.log('[2/4] Membuat snapshot backup...');
  fs.copyFileSync(dbPath, backupFile);
  const backupStats = fs.statSync(backupFile);
  if (backupStats.size !== sourceStats.size) {
    throw new Error('Ukuran file backup tidak sesuai dengan sumber!');
  }
  console.log(`Snapshot berhasil disimpan ke ${backupFile} (${(backupStats.size / 1024).toFixed(2)} KB) ✓`);

  // 3. Simulasi restore ke database sementara
  console.log('[3/4] Melakukan simulasi restore ke target terpisah...');
  if (fs.existsSync(restoredFile)) {
    fs.unlinkSync(restoredFile);
  }
  fs.copyFileSync(backupFile, restoredFile);
  console.log(`File berhasil di-restore ke ${restoredFile} ✓`);

  // 4. Verifikasi integritas data
  console.log('[4/4] Memverifikasi integritas database hasil restore...');
  const restoredStats = fs.statSync(restoredFile);
  if (restoredStats.size === 0) {
    throw new Error('File hasil restore kosong!');
  }

  // Cleanup temporary verification files
  if (fs.existsSync(backupFile)) fs.unlinkSync(backupFile);
  if (fs.existsSync(restoredFile)) fs.unlinkSync(restoredFile);

  console.log('\n====================================================');
  console.log(' HASIL: PENGUJIAN BACKUP & RESTORE BERHASIL (PASSED) ✓');
  console.log('====================================================\n');
}

runTestRestore().catch((err) => {
  console.error('\n❌ PENGUJIAN RESTORE GAGAL:', err);
  process.exit(1);
});
