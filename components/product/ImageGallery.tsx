'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const switchImage = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setActiveIndex(index);
    },
    [activeIndex]
  );

  const goPrev = () => switchImage((activeIndex - 1 + images.length) % images.length);
  const goNext = () => switchImage((activeIndex + 1) % images.length);

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-24">

      {/* ── Main Image — all images stacked, active = opacity-100 ── */}
      <div className="relative aspect-square rounded-card overflow-hidden bg-bloom-surface group">

        {/* Render every image; CSS opacity crossfade handles the transition */}
        {images.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`${name} — foto ${i + 1}`}
            fill
            className="object-cover absolute inset-0"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: i === activeIndex ? 'scale(1)' : 'scale(1.03)',
            }}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={i === 0}
          />
        ))}

        {/* Image counter badge */}
        <span className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium rounded-full pointer-events-none">
          {activeIndex + 1} / {images.length}
        </span>

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Foto sebelumnya"
              className="
                absolute left-3 top-1/2 -translate-y-1/2 z-10
                w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm
                flex items-center justify-center shadow-md
                opacity-0 group-hover:opacity-100
                transition-all duration-200 hover:bg-white hover:scale-110
              "
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
            </button>
            <button
              onClick={goNext}
              aria-label="Foto berikutnya"
              className="
                absolute right-3 top-1/2 -translate-y-1/2 z-10
                w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm
                flex items-center justify-center shadow-md
                opacity-0 group-hover:opacity-100
                transition-all duration-200 hover:bg-white hover:scale-110
              "
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => switchImage(i)}
                aria-label={`Foto ${i + 1}`}
                className="transition-all duration-300"
                style={{
                  width:   i === activeIndex ? '20px' : '6px',
                  height:  '6px',
                  borderRadius: '9999px',
                  background: i === activeIndex ? 'white' : 'rgba(255,255,255,0.45)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 pt-1" style={{ scrollbarWidth: 'none' }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => switchImage(i)}
              aria-label={`Lihat foto ${i + 1}`}
              className="relative flex-shrink-0 focus:outline-none"
              style={{
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                opacity:   i === activeIndex ? 1 : 0.45,
                transform: i === activeIndex ? 'scale(1)' : 'scale(0.95)',
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden bg-bloom-surface"
                style={{
                  boxShadow: i === activeIndex
                    ? '0 0 0 2.5px #1D1D1F'
                    : '0 0 0 1px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                <Image
                  src={src}
                  alt={`${name} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
