import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const MAX_ATTEMPTS   = 5;            // max gagal dalam window
const WINDOW_MINUTES = 15;           // window waktu (menit)
const LOCKOUT_MSG    = `Terlalu banyak percobaan login gagal. Coba lagi setelah ${WINDOW_MINUTES} menit.`;

// Credentials dari environment — TIDAK hardcoded
const ADMIN_USERNAME    = process.env.ADMIN_USERNAME    ?? 'bloom_admin';
const ADMIN_PASSWORD    = process.env.ADMIN_PASSWORD    ?? 'Bl00m@Admin#2025';
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE ?? 'BLOOM2025';
const ADMIN_SECRET_KEY  = process.env.ADMIN_SECRET_KEY  ?? 'bloom_admin_2025';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // ── 1. Rate-limit check ──────────────────────────────────────────────────
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  const recentFails = await prisma.adminLoginAttempt.count({
    where: { ip, success: false, attemptAt: { gte: windowStart } },
  });

  if (recentFails >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { success: false, message: LOCKOUT_MSG, locked: true },
      { status: 429 }
    );
  }

  // ── 2. Parse body ────────────────────────────────────────────────────────
  let username = '', password = '', accessCode = '';
  try {
    const body = await req.json();
    username   = body.username   ?? '';
    password   = body.password   ?? '';
    accessCode = body.accessCode ?? '';
  } catch {
    return NextResponse.json({ success: false, message: 'Request tidak valid.' }, { status: 400 });
  }

  // ── 3. Validasi field kosong ─────────────────────────────────────────────
  if (!username.trim() || !password.trim() || !accessCode.trim()) {
    return NextResponse.json(
      { success: false, message: 'Semua field wajib diisi.' },
      { status: 400 }
    );
  }

  // ── 4. Verifikasi kredensial ─────────────────────────────────────────────
  const credentialsOk =
    username.trim()   === ADMIN_USERNAME &&
    password          === ADMIN_PASSWORD &&
    accessCode.trim().toUpperCase() === ADMIN_ACCESS_CODE.toUpperCase();

  // Catat attempt
  await prisma.adminLoginAttempt.create({
    data: { ip, success: credentialsOk },
  });

  if (!credentialsOk) {
    const remaining = MAX_ATTEMPTS - recentFails - 1;
    const msg = remaining > 0
      ? `Kredensial tidak valid. Sisa percobaan: ${remaining}.`
      : LOCKOUT_MSG;
    return NextResponse.json({ success: false, message: msg, locked: remaining <= 0 }, { status: 401 });
  }

  // ── 5. Set session cookie ────────────────────────────────────────────────
  const res = NextResponse.json({ success: true, message: 'Login admin berhasil.' });
  res.cookies.set('admin_session', ADMIN_SECRET_KEY, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 8, // 8 jam
    path:     '/',
  });
  return res;
}
