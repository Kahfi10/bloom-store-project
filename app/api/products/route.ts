import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdminRequest, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// ─── Helper: parse images JSON string → array ───────────────────────────────
function parseProduct(p: {
  images: string;
  [key: string]: unknown;
}) {
  return { ...p, images: JSON.parse(p.images) as string[] };
}

// ─── GET /api/products ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug     = searchParams.get('slug');
    const category = searchParams.get('category');
    const search   = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (slug)     where.slug     = slug;
    if (category) where.category = category;
    if (search)   where.name     = { contains: search };

    const products = await prisma.product.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data:    products.map(parseProduct),
      total:   products.length,
      message: 'Produk berhasil diambil.',
    });
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json(
      { success: false, error: 'Server error', message: 'Gagal mengambil data produk.' },
      { status: 500 }
    );
  }
}

// ─── POST /api/products — admin only ───────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  try {
    const body = await req.json();
    const { name, slug, category, price, stock, description, heroImage, images, infoOrigin, infoLatinName, infoMeaning, infoHistory, infoFunFact, infoBloomSeason } = body;

    // Validation
    if (!name?.trim())        return error400('Nama produk wajib diisi.');
    if (!slug?.trim())        return error400('Slug produk wajib diisi.');
    if (!category?.trim())    return error400('Kategori produk wajib diisi.');
    if (typeof price !== 'number' || price <= 0)
      return error400('Harga produk harus berupa angka lebih dari 0.');
    if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock))
      return error400('Stok produk harus berupa bilangan bulat tidak negatif.');
    if (!description?.trim()) return error400('Deskripsi produk wajib diisi.');
    if (!heroImage?.trim())   return error400('Hero image produk wajib diisi.');
    if (!Array.isArray(images) || images.length === 0)
      return error400('Minimal 1 gambar produk wajib disertakan.');

    // Slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) return error400(`Slug '${slug}' sudah digunakan produk lain.`);

    const product = await prisma.product.create({
      data: {
        name, slug, category, price, stock, description, heroImage,
        images: JSON.stringify(images),
        infoOrigin:      infoOrigin      ?? '',
        infoLatinName:   infoLatinName   ?? '',
        infoMeaning:     infoMeaning     ?? '',
        infoHistory:     infoHistory     ?? '',
        infoFunFact:     infoFunFact     ?? '',
        infoBloomSeason: infoBloomSeason ?? '',
      },
    });

    return NextResponse.json(
      { success: true, data: parseProduct(product), message: 'Produk berhasil ditambahkan.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/products]', err);
    return NextResponse.json(
      { success: false, error: 'Server error', message: 'Gagal menambahkan produk.' },
      { status: 500 }
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function error400(message: string) {
  return NextResponse.json({ success: false, error: 'Validation error', message }, { status: 400 });
}
