import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ─── Valid status transitions (PRD §Modul 5) ───────────────────────────────
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT:     ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],  // dikunci — tidak dapat diubah
  CANCELLED: [],  // dikunci — tidak dapat diaktifkan kembali
};

const ALL_STATUSES = ['DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

// ─── PATCH /api/orders/:id/status ──────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id?.trim()) return error400('ID pesanan wajib disertakan.');

    const body = await req.json();
    const { status: newStatus } = body;

    // Validasi status yang dikirim
    if (!newStatus?.trim()) return error400('Status baru wajib disertakan.');
    if (!ALL_STATUSES.includes(newStatus))
      return error400(`Status '${newStatus}' tidak valid. Status yang tersedia: ${ALL_STATUSES.join(', ')}.`);

    // Cari pesanan
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order)
      return NextResponse.json(
        { success: false, error: 'Not found', message: `Pesanan dengan ID '${id}' tidak ditemukan.` },
        { status: 404 }
      );

    const currentStatus = order.status;
    const allowedNext   = VALID_TRANSITIONS[currentStatus] ?? [];

    // Tidak perlu diubah jika sama
    if (currentStatus === newStatus)
      return error400(`Pesanan sudah berstatus ${currentStatus}.`);

    // Validasi transisi
    if (!allowedNext.includes(newStatus)) {
      let reason = `Perubahan status dari ${currentStatus} ke ${newStatus} tidak diizinkan.`;
      if (currentStatus === 'COMPLETED') reason = 'Pesanan selesai tidak dapat diubah.';
      if (currentStatus === 'CANCELLED') reason = 'Pesanan yang dibatalkan tidak dapat diaktifkan kembali.';
      return NextResponse.json(
        { success: false, error: 'Invalid transition', message: reason },
        { status: 422 }
      );
    }

    // BUG-01 fix: use transaction to restore stock when order is CANCELLED
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id },
        data:  { status: newStatus },
        include: { items: { include: { product: true } } },
      });

      // Restore stock for all items when cancelling
      if (newStatus === 'CANCELLED') {
        for (const item of result.items) {
          await tx.product.update({
            where: { id: item.productId },
            data:  { stock: { increment: item.qty } },
          });
        }
      }
      return result;
    });

    return NextResponse.json({
      success: true,
      data:    updated,
      message: `Status pesanan berhasil diperbarui: ${currentStatus} → ${newStatus}.`,
    });
  } catch (err) {
    console.error('[PATCH /api/orders/:id/status]', err);
    return NextResponse.json(
      { success: false, error: 'Server error', message: 'Gagal memperbarui status pesanan.' },
      { status: 500 }
    );
  }
}

// Alias PUT → PATCH
export { PATCH as PUT };

function error400(message: string) {
  return NextResponse.json({ success: false, error: 'Validation error', message }, { status: 400 });
}
