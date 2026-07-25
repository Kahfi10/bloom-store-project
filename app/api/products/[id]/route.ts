import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function parseProduct(p: { images: string; [key: string]: unknown }) {
  return { ...p, images: JSON.parse(p.images) as string[] };
}

// ─── GET /api/products/:id ──────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) return error400('ID produk harus berupa angka.');

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product)
      return NextResponse.json(
        { success: false, error: 'Not found', message: `Produk dengan ID ${productId} tidak ditemukan.` },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: parseProduct(product), message: 'Produk ditemukan.' });
  } catch (err) {
    console.error('[GET /api/products/:id]', err);
    return NextResponse.json(
      { success: false, error: 'Server error', message: 'Gagal mengambil data produk.' },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/products/:id ────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) return error400('ID produk harus berupa angka.');

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing)
      return NextResponse.json(
        { success: false, error: 'Not found', message: `Produk dengan ID ${productId} tidak ditemukan.` },
        { status: 404 }
      );

    const body = await req.json();
    const { price, stock, images } = body;

    // Partial validation
    if (price !== undefined && (typeof price !== 'number' || price <= 0))
      return error400('Harga produk harus berupa angka lebih dari 0.');
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)))
      return error400('Stok produk harus berupa bilangan bulat tidak negatif.');

    const updateData: Record<string, unknown> = { ...body };
    if (images !== undefined) updateData.images = JSON.stringify(images);

    const updated = await prisma.product.update({
      where: { id: productId },
      data:  updateData,
    });

    return NextResponse.json({ success: true, data: parseProduct(updated), message: 'Produk berhasil diperbarui.' });
  } catch (err) {
    console.error('[PATCH /api/products/:id]', err);
    return NextResponse.json(
      { success: false, error: 'Server error', message: 'Gagal memperbarui produk.' },
      { status: 500 }
    );
  }
}

// Alias PUT → PATCH
export { PATCH as PUT };

// ─── DELETE /api/products/:id ───────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) return error400('ID produk harus berupa angka.');

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing)
      return NextResponse.json(
        { success: false, error: 'Not found', message: `Produk dengan ID ${productId} tidak ditemukan.` },
        { status: 404 }
      );

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true, data: null, message: `Produk '${existing.name}' berhasil dihapus.` });
  } catch (err) {
    console.error('[DELETE /api/products/:id]', err);
    return NextResponse.json(
      { success: false, error: 'Server error', message: 'Gagal menghapus produk.' },
      { status: 500 }
    );
  }
}

function error400(message: string) {
  return NextResponse.json({ success: false, error: 'Validation error', message }, { status: 400 });
}
