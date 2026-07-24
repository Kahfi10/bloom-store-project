'use client';

import { useRef, useEffect } from 'react';
import { gsap, SplitText } from '@/lib/gsap';

export default function QuoteBannerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const quoteRef   = useRef<HTMLQuoteElement>(null);
  const authorRef  = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {

      // 1. Background parallax — moves slower than scroll (depth effect)
      gsap.to(bgRef.current, {
        yPercent: 28,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // 2. Quote text — SplitText word-by-word reveal
      if (quoteRef.current) {
        const split = new SplitText(quoteRef.current, { type: 'words' });
        gsap.from(split.words, {
          opacity: 0,
          y: 30,
          rotateX: 20,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.045,
          transformOrigin: '50% 100%',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none none',
          },
          onComplete: () => split.revert(),
        });
      }

      // 3. Divider line draws in
      if (dividerRef.current) {
        const len = 80;
        gsap.fromTo(
          dividerRef.current,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.0,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 4. Author fades in after quote
      gsap.from(authorRef.current, {
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: 'power2.out',
        delay: 0.6,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden flex items-center justify-center"
      style={{ minHeight: '520px' }}
    >
      {/* ── Parallax Background ─────────────────────── */}
      <div
        ref={bgRef}
        className="absolute inset-0 -top-[15%] -bottom-[15%]"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(20, 60, 30, 0.95) 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at 80% 60%, rgba(40, 10, 20, 0.9) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 50% 80%, rgba(10, 20, 40, 0.85) 0%, transparent 70%),
            linear-gradient(135deg, #0a1a0e 0%, #1a0d14 40%, #0d1220 70%, #0a1a0e 100%)
          `,
        }}
      >
        {/* Subtle noise grain texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        {/* Decorative blurred circles (suggest flower bokeh) */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #a8d5a2 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #f0a0b0 0%, transparent 70%)', filter: 'blur(35px)' }} />
        <div className="absolute top-1/2 right-1/4 w-56 h-56 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #c0a8f0 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* ── Quote Content ───────────────────────────── */}
      <div className="relative z-10 max-w-[820px] mx-auto px-8 py-24 text-center text-white">

        {/* Opening mark */}
        <span
          className="block text-[6rem] leading-none font-serif text-white/12 -mb-6 select-none"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        {/* Quote text — SplitText target */}
        <blockquote
          ref={quoteRef}
          className="text-[clamp(1.5rem,4vw,2.4rem)] font-semibold leading-[1.3] tracking-tight mb-8 [perspective:600px]"
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.4)' }}
        >
          Setiap bunga menceritakan sebuah perasaan yang tak terucapkan oleh kata-kata.
        </blockquote>

        {/* Animated divider */}
        <div className="flex items-center justify-center mb-6">
          <svg width="80" height="4" viewBox="0 0 80 4" className="overflow-visible">
            <line
              ref={dividerRef}
              x1="0" y1="2" x2="80" y2="2"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ strokeDasharray: 80, strokeDashoffset: 80 }}
            />
          </svg>
        </div>

        {/* Author */}
        <p
          ref={authorRef}
          className="text-sm font-medium tracking-[0.2em] uppercase text-white/50"
        >
          Bloom Store &mdash; Toko Bunga Premium
        </p>
      </div>
    </section>
  );
}
