import { NextRequest, NextResponse } from 'next/server';

// Must match ADMIN_SECRET_KEY in ecosystem.config.js and api/admin/login/route.ts
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY ?? 'bloom_secret_2025_kahfi';
const PUBLIC_PATHS = ['/admin/login', '/api/admin/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin/* routes
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Allow public admin paths (login page)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Check admin session cookie
  const session = request.cookies.get('admin_session')?.value;
  if (session !== ADMIN_SECRET) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
