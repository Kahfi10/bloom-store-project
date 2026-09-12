import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdminRequest } from '@/lib/adminAuth';
import { serializeOrder } from '@/lib/security/serializers';

// ─── GET /api/orders/:id ────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id?.trim()) return error400('ID pesanan wajib disertakan.');

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order)
      return NextResponse.json(
        { success: false, error: 'Not found', message: `Pesanan dengan ID '${id}' tidak ditemukan.` },
        { status: 404 }
      );

    const isAuthorized = isAdminRequest(req);
    // Return order (authorized admin gets full raw DB data, public gets clean serialized view)
    return NextResponse.json({ success: true, data: serializeOrder(order, true), message: 'Pesanan ditemukan.' });
  } catch (err) {
    console.error('[GET /api/orders/:id]', err);
    return NextResponse.json(
      { success: false, error: 'Server error', message: 'Gagal mengambil data pesanan.' },
      { status: 500 }
    );
  }
}

function error400(message: string) {
  return NextResponse.json({ success: false, error: 'Validation error', message }, { status: 400 });
}
