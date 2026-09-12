import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { applyRateLimit, RATE_LIMITS } from '@/lib/security/rateLimit';
import { validateOrderInput } from '@/lib/validations/schemas';
import { isAdminRequest, unauthorizedResponse } from '@/lib/adminAuth';

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
  const rateLimitRes = applyRateLimit(req, 'orders_create', RATE_LIMITS.ORDERS_POST);
  if (rateLimitRes) return rateLimitRes;

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return error400('Format JSON request tidak valid.');
    }

    // Strict input validation (Poin 6)
    const validation = validateOrderInput(body);
    if (!validation.success || !validation.data) {
      return error400(validation.error || 'Data pesanan tidak valid.');
    }

    const { items, recipientName, shippingAddress, phoneNumber } = validation.data;

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

// ─── GET /api/orders (admin only — IDOR protection) ────────────────────────
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorizedResponse();

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
