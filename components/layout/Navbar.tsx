'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname                    = usePathname();
  const isHome                      = pathname === '/';
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const { totalItems }              = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const menuRef                     = useRef<HTMLDivElement>(null);

  // On non-home pages the navbar is always "frosted" (no hero behind it)
  const frosted = scrolled || !isHome;

  useEffect(() => {
    // rAF-throttled: at most one setState per animation frame (~16 ms)
    // prevents constant re-renders from invalidating the video composite layer
    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const textColor = frosted ? 'text-bloom-text' : 'text-white';
  const hoverOpacity = 'hover:opacity-60 transition-opacity';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        frosted ? 'nav-frosted' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">

        {/* ── Logo ──────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className={`transition-colors duration-300 ${textColor}`}>
            <ellipse cx="11" cy="7"   rx="3.5" ry="5.5" fill="currentColor" fillOpacity="0.85" />
            <ellipse cx="15.5" cy="13" rx="3.5" ry="5.5" transform="rotate(60 15.5 13)"  fill="currentColor" fillOpacity="0.55" />
            <ellipse cx="6.5"  cy="13" rx="3.5" ry="5.5" transform="rotate(-60 6.5 13)" fill="currentColor" fillOpacity="0.35" />
            <circle cx="11" cy="11" r="2" fill="currentColor" />
          </svg>
          <span className={`text-[17px] font-semibold tracking-tight transition-colors duration-300 group-hover:opacity-70 ${textColor}`}>
            Bloom Store
          </span>
        </Link>

        {/* ── Nav Links ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Home',   href: '/' },
            { label: 'Produk', href: '/#produk' },
          ].map(({ label, href }) => (
            <Link key={label} href={href}
              className={`text-sm font-medium ${textColor} ${hoverOpacity}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* ── Right Actions ─────────────────────────────── */}
        <div className="flex items-center gap-3">

          {/* Cart */}
          <Link href="/cart"
            className="relative p-2 -m-2 rounded-full hover:bg-black/5 transition-colors duration-200"
            aria-label={`Keranjang (${totalItems} item)`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              strokeWidth="1.7" stroke="currentColor"
              className={`transition-colors duration-300 ${textColor}`}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-bloom-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Auth — logged out */}
          {!isLoggedIn && (
            <Link href="/login"
              className={`
                hidden sm:inline-flex items-center h-9 px-5 rounded-full text-sm font-medium btn-press
                ${frosted
                  ? 'bg-bloom-text text-white hover:bg-black/80'
                  : 'bg-white/20 text-white border border-white/40 hover:bg-white/30'}
              `}>
              Masuk
            </Link>
          )}

          {/* Auth — logged in: avatar dropdown */}
          {isLoggedIn && user && (
            <div className="relative hidden sm:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className={`flex items-center gap-2 h-9 px-3 rounded-full text-sm font-medium btn-press
                  ${frosted
                    ? 'bg-bloom-surface border border-bloom-border text-bloom-text hover:bg-bloom-border/50'
                    : 'bg-white/20 border border-white/40 text-white hover:bg-white/30'}
                `}>
                {/* Avatar initial */}
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${frosted ? 'bg-bloom-text text-white' : 'bg-white/30 text-white'}`}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden md:block max-w-[100px] truncate">{user.name}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-bloom-border rounded-xl shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-bloom-border">
                    <p className="text-xs text-bloom-secondary">Masuk sebagai</p>
                    <p className="text-sm font-semibold text-bloom-text truncate">{user.name}</p>
                  </div>
                  <Link href="/orders" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-bloom-text hover:bg-bloom-surface transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                      <path d="M9 12h6M9 16h4" />
                    </svg>
                    Pesanan Saya
                  </Link>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-bloom-danger hover:bg-red-50 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
