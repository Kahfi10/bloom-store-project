'use client';

import { useRef } from 'react';
import { useEffect } from 'react';
import { gsap } from '@/lib/gsap';

// ─── Content ────────────────────────────────────────────────────────────────
const ITEMS = [
  'Anggrek Bulan',
  'Mawar Merah',
  'Lavender',
  'Lili Putih',
  'Krisan',
  'Buket Campuran',
  'Bunga Matahari',
  'Tulip',
  'Peony',
  'Baby Breath',
];

const SEP = '✦';

// Duplicate for seamless infinite loop (2 copies = move by 50%)
const ROW = [...ITEMS, ...ITEMS];

export default function MarqueeStrip() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Row 1 → moves left
      gsap.to(row1Ref.current, {
        xPercent: -50,
        ease: 'none',
        duration: 28,
        repeat: -1,
      });

      // Row 2 → moves right (start at -50, end at 0)
      gsap.fromTo(
        row2Ref.current,
        { xPercent: -50 },
        { xPercent: 0, ease: 'none', duration: 22, repeat: -1 }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="overflow-hidden bg-bloom-text text-white select-none py-5"
      aria-hidden="true"
    >
      {/* Row 1 — moves left */}
      <div className="flex whitespace-nowrap mb-3">
        <div ref={row1Ref} className="flex whitespace-nowrap">
          {ROW.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-5 text-sm font-semibold tracking-[0.14em] uppercase mx-5"
            >
              {name}
              <span className="text-white/30 text-xs">{SEP}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 — moves right */}
      <div className="flex whitespace-nowrap overflow-hidden">
        <div ref={row2Ref} className="flex whitespace-nowrap">
          {ROW.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-5 text-[11px] font-light tracking-[0.22em] uppercase mx-5 text-white/45"
            >
              {name}
              <span className="text-white/15">{SEP}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
