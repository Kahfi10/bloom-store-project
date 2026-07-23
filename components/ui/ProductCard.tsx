'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/lib/mockData';

interface ProductCardProps {
  product: Product;
  animationDelay?: number;
}

function StockIndicator({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-bloom-danger font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-bloom-danger inline-block" />
        Habis
      </span>
    );
  }
  if (stock <= 4) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-bloom-warning font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-bloom-warning inline-block stock-dot-low" />
        Sisa {stock}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-bloom-success font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-bloom-success inline-block" />
      Tersedia
    </span>
  );
}

export default function ProductCard({
  product,
  animationDelay = 0,
}: ProductCardProps) {
  const router  = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Navigate to product detail when clicking anywhere except the button
  function handleCardClick() {
    router.push(`/products/${product.slug}`);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation(); // don't bubble up to card → no navigation
    if (product.stock === 0) return;

    setLoading(true);
    const result = addToCart(product, 1);
    showToast(result.message, result.success ? 'success' : 'error');
    setTimeout(() => setLoading(false), 300);
  }

  const outOfStock = product.stock === 0;

  return (
    <article
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`Lihat detail ${product.name}`}
      className="bg-white rounded-card shadow-card card-hover flex flex-col overflow-hidden animate-fade-up border border-bloom-border/40 cursor-pointer"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'both' }}
    >
      {/* ── Product Image ──────────────────────────── */}
      <div className="relative aspect-square img-zoom-container bg-bloom-surface">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={animationDelay === 0}
        />

        {/* Category badge */}
        <span className="absolute top-3 left-3 z-10 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-pill text-[11px] font-semibold text-bloom-text tracking-wide shadow-sm">
          {product.category}
        </span>

        {/* Photo count badge */}
        <span className="absolute top-3 right-3 z-10 px-2 py-0.5 bg-black/35 backdrop-blur-sm rounded-full text-[10px] font-medium text-white">
          {product.images.length} foto
        </span>

        {/* Out-of-stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-2 bg-white/95 rounded-pill text-sm font-semibold text-bloom-danger shadow">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ──────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Name + stock */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-semibold text-bloom-text leading-snug">
            {product.name}
          </h3>
          <StockIndicator stock={product.stock} />
        </div>

        {/* Description */}
        <p className="text-sm text-bloom-secondary leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* ── Card Footer ──────────────────────────── */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-bloom-border/60">
          {/* Price */}
          <span className="text-[17px] font-bold text-bloom-text tracking-tight">
            {formatRupiah(product.price)}
          </span>

          {/* Add to Cart — stopPropagation prevents card navigation */}
          <button
            onClick={handleAddToCart}
            disabled={outOfStock || loading}
            aria-label={`Tambah ${product.name} ke keranjang`}
            className={`
              btn-press flex items-center gap-2 h-9 px-4 rounded-pill text-sm font-medium
              transition-all duration-200 select-none
              ${
                outOfStock
                  ? 'bg-bloom-surface text-bloom-secondary cursor-not-allowed opacity-50'
                  : 'bg-bloom-text text-white hover:bg-black/80 active:scale-95'
              }
            `}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            <span>{outOfStock ? 'Habis' : 'Tambah'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
