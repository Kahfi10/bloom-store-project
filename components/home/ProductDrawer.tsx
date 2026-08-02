'use client';

import { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { formatRupiah } from '@/lib/mockData';
import AddToCartWidget from '@/components/product/AddToCartWidget';

interface ProductDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

// â”€â”€â”€ Fact card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FactCard({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-bloom-border/60 shadow-sm">
      <span className="text-bloom-secondary">{icon}</span>
      <p className="text-xs font-semibold tracking-widest uppercase text-bloom-secondary">
        {label}
      </p>
      <p className="text-sm font-semibold text-bloom-text leading-snug">{value}</p>
    </div>
  );
}

// â”€â”€â”€ Section label â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-[0.25em] uppercase text-bloom-secondary mb-4">
      {children}
    </p>
  );
}

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ProductDrawer({ product, isOpen, onClose }: ProductDrawerProps) {
  const drawerRef     = useRef<HTMLDivElement>(null);
  const backdropRef   = useRef<HTMLDivElement>(null);
  const bodyRef       = useRef<HTMLDivElement>(null);   // scrollable body
  const heroImgRef    = useRef<HTMLDivElement>(null);   // parallax target

  // â”€â”€ Open / close animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const drawer   = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    if (isOpen) {
      gsap.set(drawer, { display: 'flex' });
      gsap.set(backdrop, { display: 'block' });
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(drawer,   { x: '100%' }, { x: '0%', duration: 0.45, ease: 'power3.out' });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(backdrop, { opacity: 0, duration: 0.25, ease: 'power2.in' });
      gsap.to(drawer, {
        x: '100%', duration: 0.36, ease: 'power3.in',
        onComplete: () => {
          gsap.set(drawer,   { display: 'none' });
          gsap.set(backdrop, { display: 'none' });
        },
      });
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // â”€â”€ GSAP scroll effects inside drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!isOpen || !product || !bodyRef.current) return;

    // Small delay so React finishes rendering drawer content
    const timer = setTimeout(() => {
      const body = bodyRef.current!;
      const ctx  = gsap.context(() => {

        // 1. Hero image parallax (moves up as user scrolls down)
        if (heroImgRef.current) {
          gsap.to(heroImgRef.current, {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: {
              trigger: heroImgRef.current,
              scroller: body,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }

        // 2. Generic scroll-reveal: every element with data-reveal
        const reveals = body.querySelectorAll('[data-reveal]');
        reveals.forEach((el) => {
          gsap.from(el, {
            y: 36, opacity: 0, duration: 0.65, ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              scroller: body,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          });
        });

        // 3. Fact cards stagger
        const facts = body.querySelectorAll('[data-fact]');
        if (facts.length) {
          gsap.from(facts, {
            y: 28, opacity: 0, scale: 0.96,
            duration: 0.55, ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: facts[0],
              scroller: body,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          });
        }

        ScrollTrigger.refresh();
      }, body);

      return () => ctx.revert();
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen, product]);

  // â”€â”€ ESC key â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Cleanup on unmount
  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  // Scroll body to top when product changes
  useEffect(() => {
    if (isOpen && bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [product, isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[3px]"
        style={{ display: 'none', opacity: 0 }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={product ? `Mengenal ${product.name}` : 'Detail produk'}
        className="fixed top-0 right-0 z-[70] h-full w-full max-w-[520px] bg-white shadow-2xl flex-col"
        style={{ display: 'none', transform: 'translateX(100%)' }}
      >
        {/* â”€â”€ Sticky header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-bloom-border z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold tracking-widest uppercase text-bloom-secondary bg-bloom-surface px-2.5 py-1 rounded-full border border-bloom-border">
              {product?.category}
            </span>
          </div>
          <button onClick={onClose} aria-label="Tutup"
            className="w-9 h-9 rounded-full flex items-center justify-center text-bloom-secondary hover:text-bloom-text hover:bg-bloom-surface transition-all btn-press">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 2l11 11M13 2L2 13" />
            </svg>
          </button>
        </div>

        {/* â”€â”€ Scrollable body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {product && (
          <div ref={bodyRef} className="flex-1 overflow-y-auto">

            {/* â”€â”€ 1. Hero image â€” parallax â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="relative h-[320px] overflow-hidden bg-bloom-surface">
              <div ref={heroImgRef} className="absolute inset-0 scale-110">
                <Image
                  src={product.heroImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="520px"
                  priority
                />
              </div>
              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-6 text-white">
                <h2 className="text-3xl font-bold tracking-tight leading-none">
                  {product.name}
                </h2>
                <p className="text-sm text-white/70 mt-1 italic">
                  {product.info.latinName}
                </p>
              </div>
            </div>

            {/* â”€â”€ 2. Intro â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="px-6 py-7 border-b border-bloom-border" data-reveal>
              <SectionLabel>Tentang Bunga Ini</SectionLabel>
              <p className="text-[15px] text-bloom-text leading-relaxed">
                {product.description}
              </p>
              <div className="mt-4 flex items-start gap-2 p-3.5 bg-bloom-surface rounded-xl border border-bloom-border/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="text-bloom-secondary flex-shrink-0 mt-0.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                <p className="text-xs text-bloom-secondary leading-relaxed">
                  <span className="font-semibold text-bloom-text">Makna: </span>
                  {product.info.meaning}
                </p>
              </div>
            </div>

            {/* â”€â”€ 3. Sejarah â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="px-6 py-7 bg-bloom-surface border-b border-bloom-border" data-reveal>
              <SectionLabel>Sejarah & Asal-usul</SectionLabel>
              <p className="text-[14px] text-bloom-text leading-[1.75] whitespace-pre-line">
                {product.info.history}
              </p>
            </div>

            {/* â”€â”€ 4. Fakta Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="px-6 py-7 border-b border-bloom-border">
              <SectionLabel>Fakta & Identitas</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <div data-fact>
                  <FactCard
                    label="Asal"
                    value={product.info.origin}
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                      </svg>
                    }
                  />
                </div>
                <div data-fact>
                  <FactCard
                    label="Nama Latin"
                    value={product.info.latinName}
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20" /><path d="M12 2a15.3 15.3 0 010 20" />
                      </svg>
                    }
                  />
                </div>
                <div data-fact>
                  <FactCard
                    label="Musim Mekar"
                    value={product.info.bloomSeason}
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    }
                  />
                </div>
                <div data-fact className="col-span-2">
                  <div className="flex gap-3 p-4 bg-bloom-text text-white rounded-xl">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="flex-shrink-0 mt-0.5 opacity-70">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                    </svg>
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase opacity-60 mb-1">Fakta Menarik</p>
                      <p className="text-sm leading-snug">{product.info.funFact}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* â”€â”€ 5. Gallery hint â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="px-6 py-7 border-b border-bloom-border" data-reveal>
              <SectionLabel>Galeri Foto ({product.images.length} foto)</SectionLabel>
              <div className="flex gap-2.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                {product.images.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-bloom-surface img-zoom-container"
                  >
                    <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="96px" />
                  </div>
                ))}
              </div>
            </div>

            {/* â”€â”€ 6. Purchase section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="px-6 py-7" data-reveal>
              <SectionLabel>Dapatkan Sekarang</SectionLabel>
              <AddToCartWidget product={product} />
            </div>

            {/* â”€â”€ 7. Full detail link â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="px-6 pb-10">
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-between group w-full py-4 px-5 rounded-2xl border border-bloom-border hover:border-bloom-text hover:bg-bloom-surface transition-all duration-200"
              >
                <div>
                  <p className="text-sm font-semibold text-bloom-text">Lihat halaman detail lengkap</p>
                  <p className="text-xs text-bloom-secondary mt-0.5">Galeri interaktif & informasi lengkap</p>
                </div>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                  className="text-bloom-secondary group-hover:translate-x-1 group-hover:text-bloom-text transition-all duration-200">
                  <path d="M3 9h12M9 3l6 6-6 6" />
                </svg>
              </Link>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
