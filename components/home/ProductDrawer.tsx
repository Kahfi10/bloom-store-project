'use client';

import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { gsap } from '@/lib/gsap';
import { formatRupiah } from '@/lib/mockData';
import ImageGallery from '@/components/product/ImageGallery';
import AddToCartWidget from '@/components/product/AddToCartWidget';

interface ProductDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-bloom-danger">
        <span className="w-1.5 h-1.5 rounded-full bg-bloom-danger" />
        Stok Habis
      </span>
    );
  if (stock <= 4)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-bloom-warning">
        <span className="w-1.5 h-1.5 rounded-full bg-bloom-warning" />
        Sisa {stock} unit
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-bloom-success">
      <span className="w-1.5 h-1.5 rounded-full bg-bloom-success" />
      Tersedia — {stock} unit
    </span>
  );
}

export default function ProductDrawer({ product, isOpen, onClose }: ProductDrawerProps) {
  const drawerRef   = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  // ── Animate open / close ─────────────────────────────────────────────
  useEffect(() => {
    const drawer   = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    if (isOpen) {
      isAnimating.current = true;
      // Make visible before animating
      gsap.set(drawer, { display: 'flex' });
      gsap.set(backdrop, { display: 'block' });

      gsap.to(backdrop, {
        opacity: 1, duration: 0.3, ease: 'power2.out',
        onComplete: () => { isAnimating.current = false; },
      });
      gsap.fromTo(drawer,
        { x: '100%' },
        { x: '0%', duration: 0.45, ease: 'power3.out' }
      );
      document.body.style.overflow = 'hidden';
    } else {
      isAnimating.current = true;
      gsap.to(backdrop, { opacity: 0, duration: 0.28, ease: 'power2.in' });
      gsap.to(drawer, {
        x: '100%',
        duration: 0.36,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(drawer, { display: 'none' });
          gsap.set(backdrop, { display: 'none' });
          isAnimating.current = false;
        },
      });
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // ── ESC key ───────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────── */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
        style={{ display: 'none', opacity: 0 }}
        aria-hidden="true"
      />

      {/* ── Drawer panel ──────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={product ? `Detail ${product.name}` : 'Detail produk'}
        className="fixed top-0 right-0 z-[70] h-full w-full max-w-[500px] bg-white shadow-2xl flex-col overflow-hidden"
        style={{ display: 'none', transform: 'translateX(100%)' }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-bloom-border">
          <div className="flex items-center gap-3">
            {product && (
              <span className="text-xs font-semibold tracking-wider uppercase text-bloom-secondary px-2.5 py-1 bg-bloom-surface rounded-full border border-bloom-border">
                {product.category}
              </span>
            )}
            <span className="text-sm font-semibold text-bloom-text">
              {product?.name ?? ''}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup panel"
            className="w-9 h-9 rounded-full flex items-center justify-center text-bloom-secondary hover:text-bloom-text hover:bg-bloom-surface transition-all btn-press"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────── */}
        {product && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">

              {/* Image gallery */}
              <ImageGallery images={product.images} name={product.name} />

              {/* Name + stock */}
              <div className="space-y-3">
                <h2 className="text-[1.6rem] font-bold text-bloom-text tracking-tight leading-tight">
                  {product.name}
                </h2>
                <StockBadge stock={product.stock} />
              </div>

              {/* Description */}
              <p className="text-[15px] text-bloom-secondary leading-relaxed">
                {product.description}
              </p>

              <div className="h-px bg-bloom-border" />

              {/* Add to cart widget */}
              <AddToCartWidget product={product} />

              <div className="h-px bg-bloom-border" />

              {/* Full detail link */}
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-between group w-full py-3 text-sm font-medium text-bloom-secondary hover:text-bloom-text transition-colors"
              >
                <span>Lihat halaman detail lengkap</span>
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform duration-200"
                >
                  <path d="M3 8h10M8 3l5 5-5 5" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
