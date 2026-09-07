import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/security/token';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;
const PUBLIC_PATHS = ['/admin/login', '/api/admin/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths (e.g. login pages)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Guard /admin routes (frontend pages)
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session')?.value;
    if (!verifyAdminToken(session, ADMIN_SECRET)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Guard /api/admin routes (backend APIs)
  if (pathname.startsWith('/api/admin')) {
    const session = request.cookies.get('admin_session')?.value;
    if (!verifyAdminToken(session, ADMIN_SECRET)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Akses ditolak. Sesi admin tidak valid.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
