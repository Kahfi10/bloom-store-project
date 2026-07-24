'use client';

import { useRef, useEffect } from 'react';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface ProductsSectionProps {
  products: Product[];
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      // Section header slides in
      gsap.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });

      // Product cards stagger in
      const cards = gridRef.current!.querySelectorAll('article');
      gsap.from(cards, {
        y: 70,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        stagger: { amount: 0.55, from: 'start' },
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="produk"
      ref={sectionRef}
      className="max-w-[1200px] mx-auto px-6 py-20"
    >
      {/* Section header */}
      <div ref={titleRef} className="text-center mb-14">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-bloom-secondary mb-3">
          Koleksi Kami
        </p>
        <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-bloom-text tracking-tight leading-tight mb-4">
          Bunga Pilihan Terbaik
        </h2>
        <p className="text-[15px] text-bloom-secondary max-w-[480px] mx-auto leading-relaxed">
          Setiap bunga dipilih dengan teliti untuk memastikan kesegaran dan keindahan yang sempurna.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-bloom-border" />
          <div className="w-1.5 h-1.5 rounded-full bg-bloom-secondary/50" />
          <div className="h-px w-16 bg-bloom-border" />
        </div>
      </div>

      {/* Product grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-24 text-bloom-secondary">
          <p className="text-lg font-medium">Belum ada produk tersedia.</p>
        </div>
      )}
    </section>
  );
}
