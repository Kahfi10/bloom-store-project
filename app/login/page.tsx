'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const [credential, setCredential] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [errors,     setErrors]     = useState<{ credential?: string; password?: string; form?: string }>({});
  const [loading,    setLoading]    = useState(false);

  // Redirect if already logged in — must be in useEffect, NOT during render
  useEffect(() => {
    if (isLoggedIn) router.replace('/');
  }, [isLoggedIn, router]);

  if (isLoggedIn) return null;

  function validate(): boolean {
    const e: typeof errors = {};
    if (!credential.trim()) e.credential = 'Email atau username wajib diisi.';
    if (!password.trim())   e.password   = 'Password wajib diisi.';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    // Simulate slight network delay for realism
    await new Promise((r) => setTimeout(r, 600));

    const result = login(credential.trim(), password);
    setLoading(false);

    if (result.success) {
      showToast(result.message, 'success');
      router.push('/');
    } else {
      setErrors({ form: result.message });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bloom-surface px-6 py-20">
      <div className="w-full max-w-[400px] animate-fade-up">

        {/* ── Header ──────────────────────────────────── */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <svg width="28" height="28" viewBox="0 0 22 22" fill="none" className="text-bloom-text">
              <ellipse cx="11" cy="7"   rx="3.5" ry="5.5" fill="currentColor" fillOpacity="0.85"/>
              <ellipse cx="15.5" cy="13" rx="3.5" ry="5.5" transform="rotate(60 15.5 13)"  fill="currentColor" fillOpacity="0.55"/>
              <ellipse cx="6.5"  cy="13" rx="3.5" ry="5.5" transform="rotate(-60 6.5 13)" fill="currentColor" fillOpacity="0.35"/>
              <circle cx="11" cy="11" r="2" fill="currentColor"/>
            </svg>
            <span className="text-xl font-bold text-bloom-text group-hover:opacity-70 transition-opacity">
              Bloom Store
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-bloom-text">Masuk ke Akun Anda</h1>
          <p className="text-sm text-bloom-secondary mt-2">
            Belum punya akun?{' '}
            <span className="text-bloom-text font-medium">
              Gunakan akun demo di bawah.
            </span>
          </p>
        </div>

        {/* ── Demo Credentials Card ────────────────────── */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm space-y-1.5">
          <p className="font-semibold text-blue-800 text-xs uppercase tracking-wide mb-2">Akun Demo</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-blue-700">
            <span className="font-medium">Username:</span><span>user</span>
            <span className="font-medium">Password:</span><span>user123</span>
            <span className="font-medium">Email:</span><span>user@bloom.com</span>
          </div>
        </div>

        {/* ── Form ────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate
          className="bg-white border border-bloom-border rounded-2xl p-7 shadow-card space-y-5">

          {/* Global error */}
          {errors.form && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-bloom-danger">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10a.875.875 0 110-1.75A.875.875 0 018 11zm.583-2.917H7.417V4.5h1.166v3.583z"/>
              </svg>
              {errors.form}
            </div>
          )}

          {/* Credential field */}
          <div className="space-y-1.5">
            <label htmlFor="credential" className="block text-xs font-semibold text-bloom-secondary uppercase tracking-wider">
              Email atau Username
            </label>
            <input
              id="credential"
              type="text"
              autoComplete="username"
              value={credential}
              onChange={(e) => { setCredential(e.target.value); setErrors((p) => ({ ...p, credential: undefined })); }}
              placeholder="contoh@email.com atau username"
              className={`w-full h-11 px-4 rounded-xl border text-sm text-bloom-text placeholder-bloom-secondary/60 bg-bloom-surface outline-none transition-all duration-150
                ${errors.credential
                  ? 'border-bloom-danger ring-2 ring-bloom-danger/20'
                  : 'border-bloom-border focus:border-bloom-text focus:ring-2 focus:ring-bloom-text/10'}`}
            />
            {errors.credential && (
              <p className="text-xs text-bloom-danger mt-1">{errors.credential}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-bloom-secondary uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="Masukkan password"
                className={`w-full h-11 px-4 pr-11 rounded-xl border text-sm text-bloom-text placeholder-bloom-secondary/60 bg-bloom-surface outline-none transition-all duration-150
                  ${errors.password
                    ? 'border-bloom-danger ring-2 ring-bloom-danger/20'
                    : 'border-bloom-border focus:border-bloom-text focus:ring-2 focus:ring-bloom-text/10'}`}
              />
              <button type="button" onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bloom-secondary hover:text-bloom-text transition-colors p-1">
                {showPass
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-bloom-danger mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-pill bg-bloom-text text-white font-semibold text-[15px] btn-press hover:bg-black/80 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200">
            {loading
              ? <><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg> Memverifikasi...</>
              : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-bloom-secondary">
          <Link href="/" className="hover:text-bloom-text transition-colors">&larr; Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  );
}
