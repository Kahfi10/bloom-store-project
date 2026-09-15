import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/security/token';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;
const PUBLIC_PATHS = ['/admin/login', '/api/admin/login'];

// Allowed origins for CORS
const ALLOWED_ORIGIN_ENV = process.env.NEXT_PUBLIC_BASE_URL;

function isAllowedOrigin(origin: string | null, host: string): boolean {
  if (!origin) return true; // Same-origin or non-browser request (e.g. curl, test runners)
  try {
    const originUrl = new URL(origin);
    if (originUrl.host === host) return true;
    if (ALLOWED_ORIGIN_ENV && origin === ALLOWED_ORIGIN_ENV) return true;
    if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') return true;
  } catch {
    return false;
  }
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') || request.nextUrl.host;
  const method = request.method.toUpperCase();

  // ── 1. CORS Preflight (OPTIONS) ──────────────────────────────────────────
  if (method === 'OPTIONS') {
    if (origin && !isAllowedOrigin(origin, host)) {
      return new NextResponse(null, { status: 403 });
    }

    const response = new NextResponse(null, { status: 204 });
    if (origin && isAllowedOrigin(origin, host)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400');
    }
    return response;
  }

  // ── 2. CSRF & Cross-Site Origin Protection ───────────────────────────────
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const isApiRoute = pathname.startsWith('/api/');
  const isWebhook = pathname.startsWith('/api/webhooks/');

  if (isMutation && isApiRoute && !isWebhook) {
    const secFetchSite = request.headers.get('sec-fetch-site');
    if (secFetchSite === 'cross-site') {
      return NextResponse.json(
        { success: false, error: 'Forbidden', message: 'CSRF attack detected: cross-site request rejected.' },
        { status: 403 }
      );
    }

    if (origin && !isAllowedOrigin(origin, host)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden', message: 'CSRF attack detected: origin does not match.' },
        { status: 403 }
      );
    }
  }

  // ── 3. Public admin paths bypass ─────────────────────────────────────────
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ── 4. Admin Frontend Route Guard ────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session')?.value;
    if (!verifyAdminToken(session, ADMIN_SECRET)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 5. Admin API Route Guard ─────────────────────────────────────────────
  if (pathname.startsWith('/api/admin')) {
    const session = request.cookies.get('admin_session')?.value;
    if (!verifyAdminToken(session, ADMIN_SECRET)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Akses ditolak. Sesi admin tidak valid.' },
        { status: 401 }
      );
    }
  }

  // ── 6. Response with Security Headers & CORS ─────────────────────────────
  const response = NextResponse.next();
  if (origin && isAllowedOrigin(origin, host)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

// Export both for Next.js compatibility
export const middleware = proxy;

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
