import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ─── Valid status transitions (PRD §Modul 5) ───────────────────────────────
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT:     ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// ─── POST /api/orders ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, recipientName, shippingAddress, phoneNumber } = body;

    // ── Validasi field pengiriman ──────────────────────────────────────
    if (!recipientName?.trim())    return error400('Nama penerima wajib diisi.');
    if (!shippingAddress?.trim())  return error400('Alamat pengiriman wajib diisi.');
    if (!phoneNumber?.trim())      return error400('Nomor telepon wajib diisi.');
    if (!/^\+?[\d\s\-()]{8,15}$/.test(phoneNumber.trim()))
      return error400('Format nomor telepon tidak valid.');

    // ── Validasi items (basic checks outside transaction) ──────────────
    if (!Array.isArray(items) || items.length === 0)
      return error400('Keranjang kosong, tidak dapat membuat pesanan.');

    for (const item of items) {
      const { qty } = item;
      if (!Number.isInteger(qty) || qty < 1)
        return error400(`Jumlah item tidak valid. Minimum 1 unit.`);
      if (qty > 10)
        return error400(`Maksimum pembelian 10 unit per produk.`);
    }

    // ── Buat order + validasi stok di dalam transaction (BUG-07 fix) ───
    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        // Re-fetch products inside transaction to get locked, current stock
        const productIds: number[] = items.map((i: { productId: number }) => i.productId);
        const dbProducts = await tx.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(dbProducts.map((p) => [p.id, p]));

        let totalPrice = 0;
        const orderItems: { productId: number; qty: number; price: number }[] = [];

        for (const item of items) {
          const { productId, qty } = item;
          const product = productMap.get(productId);
          if (!product) throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
          if (qty > product.stock)
            throw new Error(`Stok '${product.name}' tidak mencukupi. Tersedia: ${product.stock} unit.`);

          totalPrice += product.price * qty;
          orderItems.push({ productId, qty, price: product.price });
        }

        // Buat order
        const newOrder = await tx.order.create({
          data: {
            status:          'DRAFT',
            totalPrice,
            recipientName:   recipientName.trim(),
            shippingAddress: shippingAddress.trim(),
            phoneNumber:     phoneNumber.trim(),
            items:           { create: orderItems },
          },
          include: { items: { include: { product: true } } },
        });

        // Kurangi stok setiap produk
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data:  { stock: { decrement: item.qty } },
          });
        }
        return newOrder;
      });
    } catch (txErr: unknown) {
      const msg = txErr instanceof Error ? txErr.message : 'Gagal memproses pesanan.';
      return error400(msg);
    }

    return NextResponse.json(
      { success: true, data: order, message: `Pesanan ${order.id} berhasil dibuat dengan status DRAFT.` },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/orders]', err);
    return NextResponse.json(
      { success: false, error: 'Server error', message: 'Gagal membuat pesanan.' },
      { status: 500 }
    );
  }
}

// ─── GET /api/orders (list — optional) ─────────────────────────────────────
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: orders, total: orders.length, message: 'Pesanan berhasil diambil.' });
  } catch (err) {
    console.error('[GET /api/orders]', err);
    return NextResponse.json(
      { success: false, error: 'Server error', message: 'Gagal mengambil data pesanan.' },
      { status: 500 }
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function error400(message: string) {
  return NextResponse.json({ success: false, error: 'Validation error', message }, { status: 400 });
}

export { VALID_TRANSITIONS };
