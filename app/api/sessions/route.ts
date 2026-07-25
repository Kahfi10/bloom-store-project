import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdminRequest, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// POST /api/sessions — record customer login (called client-side on login)
export async function POST(req: NextRequest) {
  try {
    const { userId, userName, userEmail } = await req.json();
    if (!userId || !userName || !userEmail)
      return NextResponse.json({ success: false, message: 'Data sesi tidak lengkap.' }, { status: 400 });

    const session = await prisma.userSession.create({
      data: { userId, userName, userEmail },
    });
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/sessions]', err);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan sesi.' }, { status: 500 });
  }
}

// PATCH /api/sessions — deactivate on logout (BUG-13: no auth needed here,
// only the sessionId owner can call this from client; sessionIds are UUIDs)
export async function PATCH(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId)
      return NextResponse.json({ success: false, message: 'Session ID wajib disertakan.' }, { status: 400 });

    // BUG-19 fix: check session exists before updating
    const existing = await prisma.userSession.findUnique({ where: { id: sessionId } });
    if (!existing)
      return NextResponse.json({ success: false, message: 'Sesi tidak ditemukan.' }, { status: 404 });

    await prisma.userSession.update({
      where: { id: sessionId },
      data:  { isActive: false, logoutAt: new Date() },
    });
    return NextResponse.json({ success: true, message: 'Sesi dinonaktifkan.' });
  } catch (err) {
    console.error('[PATCH /api/sessions]', err);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui sesi.' }, { status: 500 });
  }
}

// GET /api/sessions — admin only (BUG-03 fix)
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorizedResponse();

  try {
    const sessions = await prisma.userSession.findMany({
      orderBy: { loginAt: 'desc' },
      take:    100,
    });
    return NextResponse.json({ success: true, data: sessions });
  } catch (err) {
    console.error('[GET /api/sessions]', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil sesi.' }, { status: 500 });
  }
}
