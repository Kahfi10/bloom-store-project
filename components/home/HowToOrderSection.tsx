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
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="20" />
        <path d="M24 14v10M24 24c0 0-6-3-6-8a6 6 0 0112 0c0 5-6 8-6 8z" />
        <path d="M24 24c0 0 6 3 6 8" />
        <path d="M24 24c0 0-6 3-6 8" />
        <path d="M24 34v4" />
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
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12l16-8 16 8v24l-16 8-16-8V12z" />
        <path d="M24 4v40M8 12l16 8 16-8" />
        <path d="M8 28l16 8 16-8" />
      </svg>
    ),
    color: 'from-amber-50 to-white',
    accent: '#d97706',
  },
];

export default function HowToOrderSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track   = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      // Heading fade-in before the pin starts
      gsap.from(headingRef.current, {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });

      // Step cards fade in horizontally with stagger INSIDE the scroll
      const cards = track.querySelectorAll('.how-card');
      gsap.from(cards, {
        opacity: 0, scale: 0.92,
        duration: 0.6, ease: 'power2.out',
        stagger: 0.18,
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      });

      // Pinned horizontal scroll
      const scrollDistance = track.scrollWidth - window.innerWidth + 96; // 96px = padding

      gsap.to(track, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-white"
    >
      {/* Viewport-height container — pinned by GSAP, content top-aligned */}
      <div className="h-screen flex flex-col overflow-hidden">

        {/* Heading — sits at top, no vertical centering gap */}
        <div ref={headingRef} className="flex-shrink-0 px-10 pt-16 pb-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-bloom-secondary mb-2">
            Cara Pesan
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-bloom-text tracking-tight">
            Mudah dalam 4 Langkah
          </h2>
        </div>

        {/* Horizontal scrolling track — fills remaining height */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-6 px-10 pb-10 flex-shrink-0"
            style={{ width: 'max-content' }}
          >
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`how-card flex-shrink-0 w-[min(380px,85vw)] rounded-3xl bg-gradient-to-br ${step.color} border border-bloom-border/60 p-9 flex flex-col gap-6 shadow-card`}
              >
                {/* Step number */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-5xl font-black tracking-tight"
                    style={{ color: step.accent, opacity: 0.18 }}
                  >
                    {step.number}
                  </span>
                  <span style={{ color: step.accent }}>{step.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-bloom-text tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-bloom-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step indicator dots */}
                <div className="flex gap-2 mt-auto">
                  {STEPS.map((_, j) => (
                    <span
                      key={j}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: j === i ? '24px' : '6px',
                        background: j === i ? step.accent : '#D2D2D7',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Trailing spacer */}
            <div className="w-10 flex-shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
