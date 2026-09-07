import crypto from 'crypto';

function generateRandomHex(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

function generateReadablePassword(length: number = 20): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+';
  let password = '';
  const randomValues = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

console.log('====================================================');
console.log(' BLOOM STORE — SECURE CREDENTIALS & SECRETS GENERATOR');
console.log('====================================================\n');

const adminSecretKey = generateRandomHex(32);
const adminPassword = generateReadablePassword(22);
const adminAccessCode = `BLOOM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const webhookSecret = generateRandomHex(32);

console.log('Salin nilai berikut ke file .env.production di server Oracle:');
console.log('----------------------------------------------------');
console.log(`ADMIN_USERNAME="bloom_admin"`);
console.log(`ADMIN_PASSWORD="${adminPassword}"`);
console.log(`ADMIN_SECRET_KEY="${adminSecretKey}"`);
console.log(`ADMIN_ACCESS_CODE="${adminAccessCode}"`);
console.log(`WEBHOOK_SECRET="${webhookSecret}"`);
console.log('----------------------------------------------------\n');
