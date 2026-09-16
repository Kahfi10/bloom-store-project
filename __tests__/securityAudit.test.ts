/**
 * __tests__/securityAudit.test.ts
 *
 * Automated Live Security Testing Suite (Poin 20: Tes security live).
 * Verifies all security hardening mechanisms implemented for Bloom Store:
 *   1. Rate Limiting (sliding window & IP tracking)
 *   2. Cryptographic HMAC admin tokens (issuance, validity, expiration)
 *   3. Timing-safe string comparison (mitigating timing attacks)
 *   4. SSRF Guard (blocking internal networks & Oracle Cloud Metadata IP 169.254.169.254)
 *   5. Path Traversal & XSS sanitization
 *   6. API Input validation (order bounds, schema validation)
 *   7. Webhook HMAC-SHA256 signature verification & replay protection
 *   8. Sensitive log data redaction
 */

import { checkRateLimit } from '@/lib/security/rateLimit';
import { createAdminToken, verifyAdminToken, timingSafeEqualStrings } from '@/lib/security/token';
import { validateUrlForSSRF } from '@/lib/security/ssrfGuard';
import { sanitizeFilePath, sanitizeHtml, isValidSlug } from '@/lib/security/sanitize';
import { validateOrderInput, validateRegisterInput } from '@/lib/validations/schemas';
import { verifyWebhookSignature } from '@/app/api/webhooks/payment/route';
import { redactSensitiveData } from '@/lib/security/logger';

describe('Live Security Audit Test Suite', () => {

  // ── 1. Rate Limiting Tests (Poin 1) ────────────────────────────────────────
  describe('1. Rate Limiting (Poin 1: Rate limit API)', () => {
    it('allows requests within limit and decrements remaining count', () => {
      const key = `test_rate_${Date.now()}`;
      const res1 = checkRateLimit(key, 3, 10000);
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = checkRateLimit(key, 3, 10000);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = checkRateLimit(key, 3, 10000);
      expect(res3.allowed).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it('blocks requests exceeding limit with 0 remaining', () => {
      const key = `test_rate_block_${Date.now()}`;
      checkRateLimit(key, 2, 10000);
      checkRateLimit(key, 2, 10000);

      const blocked = checkRateLimit(key, 2, 10000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetMs).toBeGreaterThan(0);
    });
  });

  // ── 2. HMAC Admin Token Tests (Poin 8: Admin route aman) ───────────────────
  describe('2. HMAC Admin Token Verification (Poin 8: Admin route aman)', () => {
    const SECRET = 'test_secret_key_1234567890';

    it('generates and verifies a valid HMAC token', () => {
      const token = createAdminToken(SECRET);
      expect(typeof token).toBe('string');
      expect(token).toContain('.');

      const isValid = verifyAdminToken(token, SECRET);
      expect(isValid).toBe(true);
    });

    it('rejects a tampered or forged token', () => {
      const token = createAdminToken(SECRET);
      const forged = token + 'tampered';
      expect(verifyAdminToken(forged, SECRET)).toBe(false);
    });

    it('rejects token when verified against wrong secret', () => {
      const token = createAdminToken(SECRET);
      expect(verifyAdminToken(token, 'wrong_secret_key')).toBe(false);
    });

    it('rejects expired token', () => {
      // 9 hours in the past
      const oldTime = (Date.now() - 9 * 60 * 60 * 1000).toString();
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', SECRET).update(oldTime).digest('hex');
      const expiredToken = `${oldTime}.${hmac}`;

      expect(verifyAdminToken(expiredToken, SECRET)).toBe(false);
    });
  });

  // ── 3. Timing-Safe String Comparison (Poin 9: Ganti default pass / Timing Safe) ──
  describe('3. Timing-Safe String Comparison', () => {
    it('returns true for identical strings', () => {
      expect(timingSafeEqualStrings('super_secret_admin_pass', 'super_secret_admin_pass')).toBe(true);
    });

    it('returns false for different strings of same length', () => {
      expect(timingSafeEqualStrings('super_secret_admin_pass', 'super_secret_admin_fail')).toBe(false);
    });

    it('returns false for strings of different lengths without throwing', () => {
      expect(timingSafeEqualStrings('short', 'much_longer_string')).toBe(false);
    });
  });

  // ── 4. SSRF Guard Tests (Poin 4: Cegah SSRF & OCI IMDS) ─────────────────────
  describe('4. SSRF Guard (Poin 4: Cegah SSRF)', () => {
    it('allows valid public HTTPS URLs', () => {
      const res = validateUrlForSSRF('https://api.midtrans.com/v2/charge');
      expect(res.allowed).toBe(true);
    });

    it('blocks Oracle Cloud Metadata IP 169.254.169.254', () => {
      const res = validateUrlForSSRF('http://169.254.169.254/opc/v1/instance/');
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('diblokir');
    });

    it('blocks localhost and loopback addresses', () => {
      expect(validateUrlForSSRF('http://127.0.0.1:3000').allowed).toBe(false);
      expect(validateUrlForSSRF('http://localhost:8080').allowed).toBe(false);
    });

    it('blocks private internal networks (10.x, 192.168.x, 172.16.x)', () => {
      expect(validateUrlForSSRF('http://10.0.0.1/admin').allowed).toBe(false);
      expect(validateUrlForSSRF('http://192.168.1.100').allowed).toBe(false);
      expect(validateUrlForSSRF('http://172.20.0.5').allowed).toBe(false);
    });

    it('blocks non-HTTP protocols like file:// and gopher://', () => {
      expect(validateUrlForSSRF('file:///etc/passwd').allowed).toBe(false);
      expect(validateUrlForSSRF('gopher://127.0.0.1:70').allowed).toBe(false);
    });
  });

  // ── 5. Path Traversal & XSS Sanitization (Poin 5: Path Traversal) ───────────
  describe('5. Path Traversal & Sanitization (Poin 5: Path traversal)', () => {
    it('allows valid asset image paths', () => {
      const res = sanitizeFilePath('/assets/images/anggrek bulan/pexels-1.jpg');
      expect(res.valid).toBe(true);
    });

    it('rejects directory traversal attempts (../ and ..\\)', () => {
      expect(sanitizeFilePath('/assets/../../etc/passwd').valid).toBe(false);
      expect(sanitizeFilePath('/assets/..\\..\\windows\\system32').valid).toBe(false);
      expect(sanitizeFilePath('/assets/%2e%2e/secret.key').valid).toBe(false);
    });

    it('rejects paths containing null bytes', () => {
      expect(sanitizeFilePath('/assets/image.jpg\0.exe').valid).toBe(false);
      expect(sanitizeFilePath('/assets/image.jpg%00.exe').valid).toBe(false);
    });

    it('strips malicious HTML and script tags to prevent XSS', () => {
      const raw = '<script>alert("XSS")</script><b>Bunga Segar</b>';
      const clean = sanitizeHtml(raw);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('</script>');
      expect(clean).toBe('Bunga Segar');
    });

    it('validates URL slugs strictly', () => {
      expect(isValidSlug('anggrek-bulan')).toBe(true);
      expect(isValidSlug('anggrek/bulan')).toBe(false);
      expect(isValidSlug('../admin')).toBe(false);
      expect(isValidSlug('anggrek bulan')).toBe(false);
    });
  });

  // ── 6. Input Validation & Anti-Tamper (Poin 6 & 13) ─────────────────────────
  describe('6. Input Validation & Anti-Tamper (Poin 6 & 13: Harga anti-tamper)', () => {
    it('validates correct order input and sanitizes text fields', () => {
      const input = {
        items: [{ productId: 1, qty: 2 }],
        recipientName: '  <b>Ahmad</b>  ',
        shippingAddress: 'Jl. Urip Sumoharjo No. 10',
        phoneNumber: '081234567890',
      };
      const res = validateOrderInput(input);
      expect(res.success).toBe(true);
      expect(res.data?.recipientName).toBe('Ahmad'); // stripped HTML
      expect(res.data?.items[0].qty).toBe(2);
    });

    it('rejects orders with negative, float, or excessive quantities', () => {
      expect(validateOrderInput({ items: [{ productId: 1, qty: -5 }], recipientName: 'Test', shippingAddress: 'Alamat', phoneNumber: '0812345678' }).success).toBe(false);
      expect(validateOrderInput({ items: [{ productId: 1, qty: 2.5 }], recipientName: 'Test', shippingAddress: 'Alamat', phoneNumber: '0812345678' }).success).toBe(false);
      expect(validateOrderInput({ items: [{ productId: 1, qty: 15 }], recipientName: 'Test', shippingAddress: 'Alamat', phoneNumber: '0812345678' }).success).toBe(false);
    });

    it('rejects duplicate product IDs in order items to prevent logic flaws', () => {
      const input = {
        items: [
          { productId: 1, qty: 1 },
          { productId: 1, qty: 2 },
        ],
        recipientName: 'Test',
        shippingAddress: 'Alamat',
        phoneNumber: '08123456789',
      };
      const res = validateOrderInput(input);
      expect(res.success).toBe(false);
      expect(res.error).toContain('duplikat');
    });

    it('validates user registration schema strictly', () => {
      const valid = validateRegisterInput({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securePassword123',
      });
      expect(valid.success).toBe(true);

      const invalidUsername = validateRegisterInput({
        name: 'John Doe',
        username: 'john-doe!',
        email: 'john@example.com',
        password: 'securePassword123',
      });
      expect(invalidUsername.success).toBe(false);
    });
  });

  // ── 7. Webhook HMAC Verification (Poin 11: Verifikasi webhook) ──────────────
  describe('7. Webhook HMAC Verification (Poin 11: Verifikasi webhook)', () => {
    const SECRET = 'webhook_secret_key_production_32b';
    const timestamp = Date.now().toString();
    const body = JSON.stringify({ orderId: 'ord_123', event: 'payment.success', amount: 150000 });

    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', SECRET)
      .update(`${timestamp}.${body}`)
      .digest('hex');

    it('verifies valid HMAC-SHA256 webhook signature successfully', () => {
      const valid = verifyWebhookSignature(body, timestamp, signature, SECRET);
      expect(valid).toBe(true);
    });

    it('rejects tampered payload in webhook request', () => {
      const tamperedBody = JSON.stringify({ orderId: 'ord_123', event: 'payment.success', amount: 1000 });
      const valid = verifyWebhookSignature(tamperedBody, timestamp, signature, SECRET);
      expect(valid).toBe(false);
    });

    it('rejects webhook with wrong secret', () => {
      const valid = verifyWebhookSignature(body, timestamp, signature, 'wrong_secret');
      expect(valid).toBe(false);
    });
  });

  // ── 8. Sensitive Log Redaction (Poin 15: Log jangan bocor) ─────────────────
  describe('8. Sensitive Data Redaction (Poin 15: Log jangan bocor)', () => {
    it('redacts sensitive fields like password, token, accessCode, phone', () => {
      const rawLog = {
        username: 'admin',
        password: 'SuperSecretPassword!',
        accessCode: 'BLOOM2025',
        phoneNumber: '081234567890',
        metadata: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token',
          status: 'OK',
        },
      };

      const redacted = redactSensitiveData(rawLog);
      expect(redacted.username).toBe('admin');
      expect(redacted.password).toBe('***REDACTED***');
      expect(redacted.accessCode).toBe('***REDACTED***');
      expect(redacted.phoneNumber).toBe('***REDACTED***');
      expect(redacted.metadata.token).toBe('***REDACTED***');
      expect(redacted.metadata.status).toBe('OK');
    });
  });
});
