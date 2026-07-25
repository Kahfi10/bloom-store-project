'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Koneksi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <svg width="28" height="28" viewBox="0 0 22 22" fill="none" className="text-white">
              <ellipse cx="11" cy="7" rx="3.5" ry="5.5" fill="currentColor" fillOpacity="0.85"/>
              <ellipse cx="15.5" cy="13" rx="3.5" ry="5.5" transform="rotate(60 15.5 13)" fill="currentColor" fillOpacity="0.55"/>
              <ellipse cx="6.5" cy="13" rx="3.5" ry="5.5" transform="rotate(-60 6.5 13)" fill="currentColor" fillOpacity="0.35"/>
              <circle cx="11" cy="11" r="2" fill="currentColor"/>
            </svg>
            <span className="text-xl font-bold text-white tracking-tight">Bloom Admin</span>
          </div>
          <p className="text-sm text-gray-500">Panel administrasi Bloom Store</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-7 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950 border border-red-800 rounded-xl text-sm text-red-400">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 9a.875.875 0 110-1.75A.875.875 0 017 10zm.583-2.917H6.417V4.5h1.166v3.583z"/>
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</label>
            <input
              type="text" value={form.username} autoComplete="username"
              onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="admin"
              className="w-full h-11 px-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-600 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={form.password} autoComplete="current-password"
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-11 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-600 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  {showPw
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2">
            {loading
              ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg>Memverifikasi...</>
              : 'Masuk ke Panel Admin'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Bloom Store © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
