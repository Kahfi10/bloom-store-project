import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

/** Returns true if the request carries a valid admin session cookie. */
export function isAdminRequest(req: NextRequest): boolean {
  if (!ADMIN_SECRET) return false;
  const cookie = req.cookies.get('admin_session')?.value;
  return cookie === ADMIN_SECRET;
}

/** Returns a 401 JSON response for unauthorized admin requests. */
export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized', message: 'Akses ditolak. Login sebagai admin terlebih dahulu.' },
    { status: 401 }
  );
}
