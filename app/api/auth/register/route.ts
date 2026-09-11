import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { applyRateLimit, RATE_LIMITS } from '@/lib/security/rateLimit';
import { validateRegisterInput } from '@/lib/validations/schemas';
import { serializeSafeUser } from '@/lib/security/serializers';

export async function POST(req: NextRequest) {
  // Rate limit protection
  const rateLimitRes = applyRateLimit(req, 'auth_register', RATE_LIMITS.AUTH_REGISTER);
  if (rateLimitRes) return rateLimitRes;

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return err400('Format JSON request tidak valid.');
    }

    const validation = validateRegisterInput(body);
    if (!validation.success || !validation.data) {
      return err400(validation.error || 'Data registrasi tidak valid.');
    }

    const { name, username, email, password } = validation.data;

    // Check uniqueness
    const [existingUsername, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { username: username.trim().toLowerCase() } }),
      prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } }),
    ]);
    if (existingUsername) return err400('Username sudah digunakan.');
    if (existingEmail)    return err400('Email sudah terdaftar.');

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name:     name.trim(),
        username: username.trim().toLowerCase(),
        email:    email.trim().toLowerCase(),
        password: hashed,
        role:     'customer',
      },
      select: { id: true, name: true, username: true, email: true, role: true },
    });

    return NextResponse.json(
      { success: true, data: serializeSafeUser(user), message: `Akun berhasil dibuat! Selamat datang, ${user.name}.` },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json({ success: false, message: 'Gagal membuat akun.' }, { status: 500 });
  }
}

function err400(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}
