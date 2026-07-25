'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  {
    label: 'Dashboard',
    href:  '/admin',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'Produk',
    href:  '/admin/products',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    label: 'Pesanan',
    href:  '/admin/orders',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    label: 'Pengguna',
    href:  '/admin/users',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }, [router]);

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-white">
              <ellipse cx="11" cy="7" rx="3.5" ry="5.5" fill="currentColor" fillOpacity="0.85"/>
              <ellipse cx="15.5" cy="13" rx="3.5" ry="5.5" transform="rotate(60 15.5 13)" fill="currentColor" fillOpacity="0.55"/>
              <ellipse cx="6.5" cy="13" rx="3.5" ry="5.5" transform="rotate(-60 6.5 13)" fill="currentColor" fillOpacity="0.35"/>
              <circle cx="11" cy="11" r="2" fill="currentColor"/>
            </svg>
            <div>
              <p className="text-sm font-bold text-white leading-none">Bloom Admin</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Panel Administrasi</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ label, href, icon }) => {
            const active = href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-white text-gray-900'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}>
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-2 border-t border-gray-800 pt-4">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Lihat Toko
          </Link>
          <button onClick={handleLogout} disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-500 hover:text-red-400 hover:bg-red-950 transition-all">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            {loggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 overflow-auto bg-gray-950">
        {children}
      </main>
    </div>
  );
}
