'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';

// ─── Config ─────────────────────────────────────────────────────────────────
const VIDEOS = [
  '/assets/videos/video1.mp4',
  '/assets/videos/video2.mp4',
  '/assets/videos/video3.mp4',
];
const PLAYBACK_RATE    = 2.0;
const CROSSFADE_MS     = 1400;
const TRIGGER_BEFORE_S = 2.8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── CSS transition applied inline ONLY for the duration value ──────────────
// Everything else (GPU compositing, will-change, object-fit…) lives in .hero-video
const FADE_TRANSITION: React.CSSProperties = {
  transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function HeroSection() {
  const vaRef            = useRef<HTMLVideoElement>(null);
  const vbRef            = useRef<HTMLVideoElement>(null);
  const transitioningRef = useRef(false);
  const playlistRef      = useRef<string[]>([]);
  const nextIdxRef       = useRef(2);

  useEffect(() => {
    playlistRef.current = shuffle(VIDEOS);

    const va = vaRef.current;
    const vb = vbRef.current;
    if (!va || !vb) return;

    // ── Set initial opacity via direct DOM — no React state touched ──────
    va.style.opacity = '1';
    vb.style.opacity = '0';

    va.src         = playlistRef.current[0];
    va.playbackRate = PLAYBACK_RATE;
    va.play().catch(() => {});

    vb.src         = playlistRef.current[1 % VIDEOS.length];
    vb.playbackRate = PLAYBACK_RATE;
    vb.load();

    // ── Crossfade — pure imperative, zero React state ────────────────────
    function doTransition(fromIsA: boolean) {
      if (transitioningRef.current) return;
      transitioningRef.current = true;

      const incoming = fromIsA ? vb : va;
      const outgoing = fromIsA ? va : vb;
      if (!incoming || !outgoing) { transitioningRef.current = false; return; }

      incoming.play().catch(() => {});

      // Direct style mutation → CSS transition handles the fade
      incoming.style.opacity = '1';
      outgoing.style.opacity = '0';

      setTimeout(() => {
        outgoing.pause();
        outgoing.currentTime = 0;

        const ni = nextIdxRef.current;
        outgoing.src         = playlistRef.current[ni];
        outgoing.playbackRate = PLAYBACK_RATE;
        outgoing.load();
        nextIdxRef.current   = (ni + 1) % playlistRef.current.length;

        transitioningRef.current = false;
      }, CROSSFADE_MS + 150);
    }

    function onATime() {
      if (transitioningRef.current) return;
      const { duration, currentTime } = va!;
      if (isNaN(duration) || currentTime < 1) return;
      if (duration - currentTime <= TRIGGER_BEFORE_S) doTransition(true);
    }
    function onBTime() {
      if (transitioningRef.current) return;
      const { duration, currentTime } = vb!;
      if (isNaN(duration) || currentTime < 1) return;
      if (duration - currentTime <= TRIGGER_BEFORE_S) doTransition(false);
    }
    function onAEnd() { if (!transitioningRef.current) doTransition(true);  }
    function onBEnd() { if (!transitioningRef.current) doTransition(false); }

    va.addEventListener('timeupdate', onATime);
    vb.addEventListener('timeupdate', onBTime);
    va.addEventListener('ended',      onAEnd);
    vb.addEventListener('ended',      onBEnd);

    return () => {
      va.removeEventListener('timeupdate', onATime);
      vb.removeEventListener('timeupdate', onBTime);
      va.removeEventListener('ended',      onAEnd);
      vb.removeEventListener('ended',      onBEnd);
      va.pause();
      vb.pause();
    };
  }, []); // runs once — never re-runs during scroll

  return (
    <section
      className="relative h-screen min-h-[600px] max-h-[900px] w-full overflow-hidden flex items-center justify-center"
      style={{ isolation: 'isolate' }}
    >
      {/* ── Video A — opacity controlled via ref, not React state ─── */}
      <video ref={vaRef} muted playsInline aria-hidden="true"
        className="hero-video" style={FADE_TRANSITION} />

      {/* ── Video B ────────────────────────────────────────────────── */}
      <video ref={vbRef} muted playsInline aria-hidden="true"
        className="hero-video" style={FADE_TRANSITION} />

      {/* ── Gradient Overlay ───────────────────────────────────────── */}
      <div className="absolute inset-0 hero-overlay" style={{ transform: 'translate3d(0,0,0)' }} />

      {/* ── Hero Content ───────────────────────────────────────────── */}
      <div className="relative z-10 text-center text-white px-6 max-w-[680px] mx-auto animate-fade-up">
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-white/75 mb-5">
          Bloom Store &mdash; Toko Bunga Premium
        </p>

        <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.1] tracking-tight mb-6">
          Keindahan yang Mekar
          <br />
          <span className="text-white/85">untuk Anda</span>
        </h1>

        <p className="text-[clamp(1rem,2vw,1.2rem)] text-white/70 leading-relaxed mb-10 max-w-[460px] mx-auto">
          Temukan rangkaian bunga segar pilihan terbaik, dikirim langsung ke pintu Anda dengan penuh kasih.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#produk"
            className="btn-press inline-flex items-center gap-2 h-12 px-8 bg-white text-bloom-text font-semibold text-[15px] rounded-pill hover:bg-white/90 shadow-lg transition-all duration-200"
          >
            Belanja Sekarang
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" />
            </svg>
          </Link>
          <Link
            href="#produk"
            className="btn-press inline-flex items-center h-12 px-8 bg-white/15 border border-white/40 text-white font-medium text-[15px] rounded-pill hover:bg-white/25 backdrop-blur-sm transition-all duration-200"
          >
            Lihat Koleksi
          </Link>
        </div>
      </div>

      {/* ── Scroll indicator ───────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50">
        <span className="text-[11px] uppercase tracking-widest">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>
    </section>
  );
}
