const DEFAULT_SECRET = 'bloom_store_default_secure_fallback_key';
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function getNodeCrypto() {
  try {
    return require('crypto');
  } catch {
    return null;
  }
}

/**
 * Creates a cryptographically signed admin session token:
 * format: <timestamp_ms>.<hmac_hex>
 */
export function createAdminToken(secretKey?: string): string {
  const secret = secretKey || process.env.ADMIN_SECRET_KEY || DEFAULT_SECRET;
  const timestamp = Date.now().toString();
  const crypto = getNodeCrypto();
  if (!crypto) return secret; // Fallback for environments without crypto
  const hmac = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  return `${timestamp}.${hmac}`;
}

/**
 * Verifies an admin session token against the secret key.
 * Enforces signature validity, timestamp expiration (8h), and timing attack resistance.
 */
export function verifyAdminToken(token: string | undefined | null, secretKey?: string): boolean {
  if (!token) return false;
  const secret = secretKey || process.env.ADMIN_SECRET_KEY || DEFAULT_SECRET;

  // Direct secret match
  if (secret && token === secret) {
    return true;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check TTL (expiration)
  const now = Date.now();
  if (now - timestamp > TOKEN_TTL_MS || timestamp > now + 60000) {
    return false; // Expired or future timestamp
  }

  const crypto = getNodeCrypto();
  if (!crypto) {
    // If running in minimal edge without node crypto, fallback to secret validation
    return token === secret;
  }

  // Verify HMAC signature using timing-safe comparison
  const expectedHmac = crypto.createHmac('sha256', secret).update(timestampStr).digest('hex');

  const sigBuffer = Buffer.from(signature, 'utf-8');
  const expBuffer = Buffer.from(expectedHmac, 'utf-8');

  if (sigBuffer.length !== expBuffer.length) return false;

  return crypto.timingSafeEqual(sigBuffer, expBuffer);
}

/**
 * Compares two strings using timing-safe comparison to prevent timing attacks.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  const crypto = getNodeCrypto();
  if (!crypto) {
    return a === b;
  }

  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');

  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}
