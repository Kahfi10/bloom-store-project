/**
 * lib/products.ts
 * Server-side helpers — import ini HANYA di Server Components atau Route Handlers.
 * Jangan import di Client Components ('use client').
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

// ─── Fetch all products ─────────────────────────────────────────────────────
export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { id: 'asc' } });
  return rows.map(mapProduct);
}

// ─── Fetch single product by slug ──────────────────────────────────────────
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? mapProduct(row) : null;
}

// ─── Fetch single product by id ─────────────────────────────────────────────
export async function getProductById(id: number): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? mapProduct(row) : null;
}
