'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

const STEPS = [
  {
    number: '01',
    title: 'Pilih Bunga',
    description:
      'Jelajahi koleksi bunga segar kami — dari mawar merah yang romantis hingga lavender yang menenangkan. Setiap bunga dipilih dengan cermat dari kebun terbaik.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        <path d="M24 14v10M24 24c0 0-6-3-6-8a6 6 0 0112 0c0 5-6 8-6 8z" />
        <path d="M24 24c0 0 6 3 6 8M24 24c0 0-6 3-6 8M24 34v4" />
      </svg>
    ),
    color: 'from-rose-50 to-white',
    accent: '#f43f5e',
  },
  {
    number: '02',
    title: 'Tambah ke Keranjang',
    description:
      'Pilih jumlah yang kamu inginkan dan tambahkan ke keranjang. Kamu bisa memesan hingga 10 tangkai per produk dengan stok yang selalu terjamin segar.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4L6 12v28a4 4 0 004 4h28a4 4 0 004-4V12l-6-8z" />
        <line x1="6" y1="12" x2="42" y2="12" />
        <path d="M32 20a8 8 0 01-16 0" />
      </svg>
    ),
    color: 'from-violet-50 to-white',
    accent: '#7c3aed',
  },
  {
    number: '03',
    title: 'Isi Data Pengiriman',
    description:
      'Masukkan nama penerima, alamat lengkap, dan nomor telepon. Kami memastikan setiap pesanan sampai dalam kondisi sempurna ke tangan Anda.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 44s16-8 16-20a16 16 0 00-32 0c0 12 16 20 16 20z" />
        <circle cx="24" cy="24" r="5" />
      </svg>
    ),
    color: 'from-emerald-50 to-white',
    accent: '#059669',
  },
  {
    number: '04',
    title: 'Terima di Rumah',
    description:
      'Pesananmu akan tiba dalam 24 jam dengan kemasan premium yang menjaga kesegaran bunga. Siap untuk memberikan kebahagiaan kepada orang-orang terkasih.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12l16-8 16 8v24l-16 8-16-8V12z" />
        <path d="M24 4v40M8 12l16 8 16-8M8 28l16 8 16-8" />
      </svg>
    ),
    color: 'from-amber-50 to-white',
    accent: '#d97706',
  },
];

export default function HowToOrderSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading slide in
      gsap.from(headingRef.current, {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });

      // Cards stagger in from right
      gsap.from(cardRefs.current.filter(Boolean), {
        x: 60,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-20"
    >
      {/* Section header */}
      <div ref={headingRef} className="max-w-[1200px] mx-auto px-6 mb-10">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-bloom-secondary mb-3">
          Cara Pesan
        </p>
        <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-bloom-text tracking-tight">
          Mudah dalam 4 Langkah
        </h2>
      </div>

      {/* Cards — CSS horizontal scroll on mobile, grid on desktop */}
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Mobile: horizontal scroll; Desktop: 4-col grid */}
        <div className="
          flex gap-5 overflow-x-auto pb-3
          md:grid md:grid-cols-2 md:overflow-visible
          lg:grid-cols-4
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        ">
          {STEPS.map((step, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`
                flex-shrink-0 w-[min(300px,78vw)]
                md:w-auto
                rounded-3xl bg-gradient-to-br ${step.color}
                border border-bloom-border/60 p-8
                flex flex-col gap-5 shadow-card
              `}
            >
              {/* Number + icon */}
              <div className="flex items-start justify-between">
                <span
                  className="text-4xl font-black tracking-tight leading-none"
                  style={{ color: step.accent, opacity: 0.2 }}
                >
                  {step.number}
                </span>
                <span style={{ color: step.accent }}>{step.icon}</span>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-bold text-bloom-text tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-bloom-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2 pt-1">
                {STEPS.map((_, j) => (
                  <span
                    key={j}
                    className="h-1.5 rounded-full"
                    style={{
                      width:      j === i ? '20px' : '6px',
                      background: j === i ? step.accent : '#D2D2D7',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
