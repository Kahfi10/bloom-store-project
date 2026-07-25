/**
 * lib/products.ts
 * Server-side helpers — import ini HANYA di Server Components atau Route Handlers.
 * Jangan import di Client Components ('use client').
 *
 * Setiap fungsi punya fallback ke mockData.ts jika DB tidak tersedia,
 * sehingga halaman produk tetap bekerja meski DB belum di-seed.
 */
import type { Product as PrismaProduct } from '@prisma/client';
import type { Product } from '@/types';
import { prisma } from '@/lib/db';

// ─── Map Prisma row → frontend Product ─────────────────────────────────────
export function mapProduct(p: PrismaProduct): Product {
  return {
    id:          p.id,
    name:        p.name,
    slug:        p.slug,
    category:    p.category,
    price:       p.price,
    stock:       p.stock,
    description: p.description,
    heroImage:   p.heroImage,
    images:      JSON.parse(p.images) as string[],
    info: {
      origin:      p.infoOrigin,
      latinName:   p.infoLatinName,
      meaning:     p.infoMeaning,
      history:     p.infoHistory,
      funFact:     p.infoFunFact,
      bloomSeason: p.infoBloomSeason,
    },
  };
}

// ─── Fetch all products (DB first, fallback to mockData) ────────────────────
export async function getAllProducts(): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    if (rows.length > 0) return rows.map(mapProduct);
  } catch {
    // DB unavailable or not seeded — fall through to mockData
  }
  // Fallback: use static mockData (always available)
  const { products } = await import('./mockData');
  return products;
}

// ─── Fetch single product by slug (DB first, fallback to mockData) ──────────
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const row = await prisma.product.findUnique({ where: { slug } });
    if (row) return mapProduct(row);
  } catch {
    // DB unavailable — fall through to mockData
  }
  // Fallback: use static mockData
  const { products } = await import('./mockData');
  return products.find(p => p.slug === slug) ?? null;
}

// ─── Fetch single product by id (DB first, fallback to mockData) ────────────
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const row = await prisma.product.findUnique({ where: { id } });
    if (row) return mapProduct(row);
  } catch {
    // DB unavailable — fall through to mockData
  }
  const { products } = await import('./mockData');
  return products.find(p => p.id === id) ?? null;
}
