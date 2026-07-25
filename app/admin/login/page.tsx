'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form,    setForm]    = useState({ username: '', password: '', accessCode: '' });
  const [error,   setError]   = useState('');
  const [locked,  setLocked]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [attempts, setAttempts] = useState(0);

  function set(field: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [field]: val }));
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (locked) return;
    setError('');

    if (!form.username.trim() || !form.password.trim() || !form.accessCode.trim()) {
      setError('Semua field wajib diisi.');
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
        setAttempts(a => a + 1);
        if (data.locked) setLocked(true);
        // Clear sensitive fields on failure
        setForm(f => ({ ...f, password: '', accessCode: '' }));
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
              <ellipse cx="11" cy="7"   rx="3.5" ry="5.5" fill="currentColor" fillOpacity="0.85"/>
              <ellipse cx="15.5" cy="13" rx="3.5" ry="5.5" transform="rotate(60 15.5 13)"  fill="currentColor" fillOpacity="0.55"/>
              <ellipse cx="6.5"  cy="13" rx="3.5" ry="5.5" transform="rotate(-60 6.5 13)" fill="currentColor" fillOpacity="0.35"/>
              <circle cx="11" cy="11" r="2" fill="currentColor"/>
            </svg>
            <span className="text-xl font-bold text-white tracking-tight">Bloom Admin</span>
          </div>
          <p className="text-sm text-gray-500">Akses terbatas â€” hanya untuk administrator</p>
        </div>

        {/* Lockout notice */}
        {locked && (
          <div className="mb-4 p-4 bg-red-950 border border-red-800 rounded-2xl text-center">
            <div className="text-2xl mb-2">ðŸ”’</div>
            <p className="text-sm font-semibold text-red-300">Akses Terkunci</p>
            <p className="text-xs text-red-500 mt-1">
              Terlalu banyak percobaan gagal. Coba lagi setelah 15 menit.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-7 space-y-4">

          {/* Security badge */}
          <div className="flex items-center gap-2 p-2.5 bg-gray-800/60 rounded-xl border border-gray-700/60">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-emerald-400 flex-shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <p className="text-xs text-gray-500">
              Koneksi aman Â· 3 faktor verifikasi diperlukan
            </p>
          </div>

          {/* Error */}
          {error && !locked && (
            <div className="flex items-center gap-2 p-3 bg-red-950 border border-red-800 rounded-xl text-sm text-red-400">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="flex-shrink-0">
                <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 9a.875.875 0 110-1.75A.875.875 0 017 10zm.583-2.917H6.417V4.5h1.166v3.583z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Attempt counter */}
          {attempts > 0 && !locked && (
            <p className="text-xs text-center text-amber-600">
              Percobaan gagal: {attempts} / 5
            </p>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text" value={form.username} disabled={locked} autoComplete="username"
              onChange={e => set('username', e.target.value)}
              placeholder="Administrator username"
              className="w-full h-11 px-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-600 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all disabled:opacity-40"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={form.password} disabled={locked}
                autoComplete="current-password"
                onChange={e => set('password', e.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className="w-full h-11 px-4 pr-11 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-600 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all disabled:opacity-40"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  {showPw
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Access Code */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Kode Akses
              <span className="ml-2 text-gray-600 font-normal normal-case tracking-normal">
                (diberikan oleh sistem administrator)
              </span>
            </label>
            <input
              type="text" value={form.accessCode} disabled={locked}
              onChange={e => set('accessCode', e.target.value.toUpperCase())}
              placeholder="XXXX0000"
              maxLength={20}
              className="w-full h-11 px-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-600 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all disabled:opacity-40 font-mono tracking-widest"
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || locked}
            className="w-full h-11 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2">
            {loading
              ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg>Memverifikasi...</>
              : locked
              ? 'ðŸ”’ Akses Terkunci'
              : 'Masuk ke Panel Admin'
            }
          </button>
        </form>

        <p className="text-center text-xs text-gray-700 mt-6">
          Bloom Store Admin Â· Sistem terproteksi
        </p>
      </div>
    </div>
  );
}
