'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

const STATS = [
  {
    value: 500,
    suffix: '+',
    label: 'Pesanan Terkirim',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12H3l9-9 9 9h-2" /><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        <path d="M10 22V12h4v10" />
      </svg>
    ),
  },
  {
    value: 7,
    suffix: '',
    label: 'Jenis Bunga',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12" />
        <path d="M12 12C12 12 7 10 7 6a5 5 0 0110 0c0 4-5 6-5 6z" />
        <path d="M12 12C12 12 17 10 17 6" />
        <path d="M12 12C12 12 7 14 7 18" />
        <path d="M12 22c0-4-5-6-5-10" />
        <path d="M12 22c0-4 5-6 5-10" />
      </svg>
    ),
  },
  {
    value: 100,
    suffix: '%',
    label: 'Segar Terjamin',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    value: 24,
    suffix: ' Jam',
    label: 'Layanan Pengiriman',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const numRefs    = useRef<(HTMLSpanElement | null)[]>([]);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs   = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Card stagger slide-in
      gsap.from(cardRefs.current.filter(Boolean), {
        y: 50, opacity: 0, duration: 0.7, ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });

      // Number count-up (each triggers independently)
      STATS.forEach((stat, i) => {
        const el = numRefs.current[i];
        if (!el) return;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: stat.value,
          duration: 2.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRefs.current[i],
            start: 'top 85%',
            once: true,
          },
          onUpdate() {
            el.textContent =
              Math.round(obj.val).toLocaleString('id-ID') + stat.suffix;
          },
        });

        // Decorative line draws from 0 → full width
        const line = lineRefs.current[i];
        if (line) {
          const len = line.getTotalLength?.() ?? 60;
          gsap.fromTo(
            line,
            { strokeDasharray: len, strokeDashoffset: len },
            {
              strokeDashoffset: 0,
              duration: 1.2,
              ease: 'power2.inOut',
              scrollTrigger: {
                trigger: cardRefs.current[i],
                start: 'top 85%',
                once: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-bloom-surface border-y border-bloom-border"
    >
      <div className="max-w-[1200px] mx-auto px-6 py-20">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-bloom-secondary mb-3">
            Mengapa Bloom Store
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-bloom-text tracking-tight">
            Dipercaya Ribuan Pelanggan
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="bg-white rounded-2xl border border-bloom-border p-7 flex flex-col gap-4 shadow-card"
            >
              {/* Icon */}
              <span className="text-bloom-secondary">{stat.icon}</span>

              {/* Number */}
              <div>
                <span
                  ref={(el) => { numRefs.current[i] = el; }}
                  className="block text-[clamp(2.2rem,5vw,3rem)] font-bold text-bloom-text leading-none tabular-nums"
                >
                  0{stat.suffix}
                </span>

                {/* Decorative animated underline */}
                <svg
                  className="mt-2 mb-1 overflow-visible"
                  width="60" height="4"
                  viewBox="0 0 60 4"
                >
                  <line
                    ref={(el) => { lineRefs.current[i] = el; }}
                    x1="0" y1="2" x2="60" y2="2"
                    stroke="#1D1D1F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ strokeDasharray: 60, strokeDashoffset: 60 }}
                  />
                </svg>

                <p className="text-sm font-medium text-bloom-secondary">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
