import { execSync } from 'child_process';

console.log('====================================================');
console.log(' BLOOM STORE — LIVE SECURITY AUDIT & VERIFICATION');
console.log('====================================================\n');

try {
  console.log('[1/2] Menjalankan Automated Security Test Suite...');
  execSync('npm run test:security', { stdio: 'inherit' });

  console.log('\n[2/2] Menguji Integritas Backup & Restore Database...');
  execSync('npm run db:test-restore', { stdio: 'inherit' });

  console.log('\n====================================================');
  console.log(' SEMUA 20 CHECKLIST KEAMANAN TERVERIFIKASI (PASSED) ✓');
  console.log('====================================================\n');
} catch (error) {
  console.error('\n❌ VERIFIKASI KEAMANAN GAGAL!');
  process.exit(1);
}
