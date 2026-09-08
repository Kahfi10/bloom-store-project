import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting by key (e.g. IP + endpoint)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;       // Maximum requests allowed in the window
  windowMs: number;    // Time window in milliseconds
  message?: string;    // Custom error message
}

/**
 * Extracts client IP from request headers (standard proxy / OCI / Nginx support).
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0].trim();
    if (ip) return ip;
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Checks rate limit for a specific key (e.g. IP + endpoint prefix).
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (record.count >= limit) {
    const resetMs = Math.max(0, record.resetTime - now);
    return { allowed: false, remaining: 0, resetMs };
  }

  record.count += 1;
  const resetMs = Math.max(0, record.resetTime - now);
  return { allowed: true, remaining: limit - record.count, resetMs };
}

/**
 * Helper middleware guard for route handlers.
 * Returns a 429 response if rate limit exceeded, or null if allowed.
 */
export function applyRateLimit(
  req: NextRequest,
  prefix: string,
  options: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const result = checkRateLimit(key, options.limit, options.windowMs);

  if (!result.allowed) {
    const retryAfterSec = Math.ceil(result.resetMs / 1000);
    return NextResponse.json(
      {
        success: false,
        error: 'Too Many Requests',
        message: options.message || `Terlalu banyak permintaan. Coba lagi setelah ${retryAfterSec} detik.`,
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfterSec.toString(),
          'X-RateLimit-Limit': options.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + result.resetMs).toString(),
        },
      }
    );
  }

  return null;
}

/** Preconfigured limits for sensitive endpoints */
export const RATE_LIMITS = {
  AUTH_LOGIN:    { limit: 5,  windowMs: 15 * 60 * 1000, message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
  AUTH_REGISTER: { limit: 3,  windowMs: 60 * 60 * 1000, message: 'Batas pendaftaran akun tercapai dari IP ini. Coba lagi dalam 1 jam.' },
  ORDERS_POST:   { limit: 10, windowMs: 60 * 1000,      message: 'Terlalu banyak pesanan dibuat. Harap tunggu sebentar.' },
  GENERAL_API:   { limit: 60, windowMs: 60 * 1000,      message: 'Batas kuota request API tercapai.' },
};
