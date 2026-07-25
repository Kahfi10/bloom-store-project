import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY ?? 'bloom_admin_2025';

export async function POST(req: NextRequest) {
  try {
    const { credential, password } = await req.json();

    if (!credential?.trim()) return err400('Email atau username wajib diisi.');
    if (!password?.trim())   return err400('Password wajib diisi.');

    const identifier = credential.trim().toLowerCase();

    // Find user by email OR username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email:    identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email/username atau password salah.' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Email/username atau password salah.' },
        { status: 401 }
      );
    }

    const safeUser = {
      id:       user.id,
      name:     user.name,
      username: user.username,
      email:    user.email,
      role:     user.role,
    };

    const res = NextResponse.json({
      success: true,
      data:    safeUser,
      message: `Selamat datang, ${user.name}!`,
    });

    // ── If admin, ALSO set admin session cookie ────────────────────────────
    // So navigating to /admin works immediately without a second login
    if (user.role === 'admin') {
      res.cookies.set('admin_session', ADMIN_SECRET_KEY, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge:   60 * 60 * 8,
        path:     '/',
      });
    }

    return res;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ success: false, message: 'Gagal login.' }, { status: 500 });
  }
}

function err400(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}
