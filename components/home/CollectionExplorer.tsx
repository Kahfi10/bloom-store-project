'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import { Product } from '@/types';
import ProductDrawer from './ProductDrawer';

interface CollectionExplorerProps {
  products: Product[];
}

export default function CollectionExplorer({ products }: CollectionExplorerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef    = useRef<HTMLUListElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── GSAP entrance animations ────────────────────────────────────────
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 88%' },
      });
      const items = listRef.current!.querySelectorAll('li');
      gsap.from(items, {
        x: -40, opacity: 0, duration: 0.6, ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: { trigger: listRef.current, start: 'top 85%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // ── Open / close drawer ─────────────────────────────────────────────
  const openDrawer = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <>
      <section ref={sectionRef} className="max-w-[1200px] mx-auto px-6 py-20">

        {/* Section header */}
        <div ref={headingRef} className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-bloom-secondary mb-3">
            Jelajahi Koleksi
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-bloom-text tracking-tight">
            Temukan Bunga Impian Anda
          </h2>
          <p className="mt-3 text-sm text-bloom-secondary">
            Klik nama bunga untuk melihat detail & tambahkan ke keranjang.
          </p>
        </div>

        {/* Product list */}
        <ul ref={listRef} className="divide-y divide-bloom-border/60">
          {products.map((product, i) => (
            <li key={product.id}>
              <button
                onClick={() => openDrawer(product)}
                className="group w-full flex items-center justify-between py-5 sm:py-6 text-left"
                aria-label={`Buka detail ${product.name}`}
              >
                {/* Index + name */}
                <div className="flex items-baseline gap-5">
                  <span className="text-[11px] font-medium text-bloom-secondary/50 tabular-nums w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[clamp(1.3rem,3vw,2rem)] font-semibold text-bloom-text group-hover:opacity-60 transition-opacity duration-300 tracking-tight">
                    {product.name}
                  </span>
                </div>

                {/* Tag + arrow */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="hidden sm:block text-xs font-medium text-bloom-secondary px-3 py-1.5 border border-bloom-border rounded-full group-hover:border-bloom-text group-hover:text-bloom-text transition-colors duration-200">
                    {product.category}
                  </span>

                  {/* "Quick view" hint on hover */}
                  <span className="hidden md:flex items-center gap-1 text-xs text-bloom-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Lihat
                  </span>

                  <svg
                    width="20" height="20" viewBox="0 0 20 20" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    className="text-bloom-secondary group-hover:translate-x-1.5 group-hover:text-bloom-text transition-all duration-300"
                  >
                    <path d="M4 10h12M10 4l6 6-6 6" />
                  </svg>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Side drawer — rendered at root level for correct stacking */}
      <ProductDrawer
        product={selectedProduct}
        isOpen={drawerOpen}
        onClose={closeDrawer}
      />
    </>
  );
}
