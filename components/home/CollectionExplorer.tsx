'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { products } from '@/lib/mockData';

const CATEGORIES = products.map((p) => ({
  id:   p.id,
  name: p.name,
  slug: p.slug,
  tag:  p.category,
}));

export default function CollectionExplorer() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef    = useRef<HTMLUListElement>(null);

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

  return (
    <section
      ref={sectionRef}
      className="max-w-[1200px] mx-auto px-6 py-20"
    >
      {/* Section header */}
      <div ref={headingRef} className="mb-12">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-bloom-secondary mb-3">
          Jelajahi Koleksi
        </p>
        <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-bloom-text tracking-tight">
          Temukan Bunga Impian Anda
        </h2>
      </div>

      {/* Category list */}
      <ul ref={listRef} className="divide-y divide-bloom-border/60">
        {CATEGORIES.map((cat, i) => (
          <li key={cat.id}>
            <Link
              href={`/products/${cat.slug}`}
              className="group flex items-center justify-between py-5 sm:py-6"
            >
              {/* Index + name */}
              <div className="flex items-baseline gap-5">
                <span className="text-[11px] font-medium text-bloom-secondary/50 tabular-nums w-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[clamp(1.3rem,3vw,2rem)] font-semibold text-bloom-text group-hover:opacity-60 transition-opacity duration-300 tracking-tight">
                  {cat.name}
                </span>
              </div>

              {/* Tag + arrow */}
              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-xs font-medium text-bloom-secondary px-3 py-1.5 border border-bloom-border rounded-full">
                  {cat.tag}
                </span>
                <svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  className="text-bloom-secondary group-hover:translate-x-1.5 group-hover:text-bloom-text transition-all duration-300"
                >
                  <path d="M4 10h12M10 4l6 6-6 6" />
                </svg>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
