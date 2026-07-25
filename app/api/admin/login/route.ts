import { NextRequest, NextResponse } from 'next/server';

const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
const ADMIN_SECRET      = process.env.ADMIN_SECRET ?? 'bloom_admin_2025';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username?.trim() || !password?.trim())
      return NextResponse.json({ success: false, message: 'Username dan password wajib diisi.' }, { status: 400 });

    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password)
      return NextResponse.json({ success: false, message: 'Username atau password salah.' }, { status: 401 });

    const res = NextResponse.json({ success: true, message: 'Login admin berhasil.' });
    res.cookies.set('admin_session', ADMIN_SECRET, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 8, // 8 jam
      path:     '/',
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
