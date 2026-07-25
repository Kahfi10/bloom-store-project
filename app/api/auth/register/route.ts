import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password } = await req.json();

    // Validation
    if (!name?.trim())     return err400('Nama wajib diisi.');
    if (!username?.trim()) return err400('Username wajib diisi.');
    if (!email?.trim())    return err400('Email wajib diisi.');
    if (!password)         return err400('Password wajib diisi.');
    if (password.length < 6) return err400('Password minimal 6 karakter.');
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim()))
      return err400('Username hanya boleh huruf, angka, dan underscore.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return err400('Format email tidak valid.');

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
      { success: true, data: user, message: `Akun berhasil dibuat! Selamat datang, ${user.name}.` },
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
