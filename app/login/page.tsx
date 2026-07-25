'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isLoggedIn, isAdmin, user } = useAuth();
  const { showToast } = useToast();

  const [tab,     setTab]     = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false); // show post-login state

  // Login form
  const [loginForm,   setLoginForm]   = useState({ credential: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<{ credential?: string; password?: string; form?: string }>({});
  const [showPw,      setShowPw]      = useState(false);

  // Register form
  const [regForm,   setRegForm]   = useState({ name: '', username: '', email: '', password: '', confirm: '' });
  const [regErrors, setRegErrors] = useState<Record<string, string | undefined>>({});
  const [showRegPw, setShowRegPw] = useState(false);

  // Redirect if already logged in (and not in "done" state)
  useEffect(() => {
    if (isLoggedIn && !done) router.replace('/');
  }, [isLoggedIn, done, router]);

  if (isLoggedIn && !done) return null;

  // ── Post-login screen (admin) ──────────────────────────────────────────────
  if (done && isLoggedIn) {
    return (
      <div className="min-h-screen bg-bloom-surface flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm text-center space-y-6 animate-fade-up">
          {/* Welcome */}
          <div>
            <div className="w-16 h-16 rounded-full bg-bloom-text flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-bloom-text">
              Selamat datang, {user?.name}!
            </h1>
            <p className="text-sm text-bloom-secondary mt-1">
              {isAdmin ? 'Anda login sebagai Administrator' : 'Login berhasil'}
            </p>
          </div>

          {/* Admin Panel CTA — only for admin */}
          {isAdmin && (
            <div className="p-5 bg-bloom-text rounded-2xl text-white space-y-3">
              <div className="flex items-center gap-2 justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                <p className="text-sm font-semibold">Akses Panel Admin</p>
              </div>
              <p className="text-xs text-white/60">
                Kelola produk, pesanan, dan pengguna dari dashboard admin.
              </p>
              <Link href="/admin"
                className="block w-full h-10 bg-white text-bloom-text text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all btn-press">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                </svg>
                Buka Panel Admin
              </Link>
            </div>
          )}

          {/* Go to store */}
          <Link href="/"
            className="block w-full h-11 bg-bloom-text text-white text-sm font-semibold rounded-pill flex items-center justify-center gap-2 btn-press hover:bg-black/80 transition-all">
            {isAdmin ? 'Ke Toko' : 'Mulai Belanja'}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5"/>
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // ── Login submit ─────────────────────────────────────────────────────────
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginErrors({});
    const errs: typeof loginErrors = {};
    if (!loginForm.credential.trim()) errs.credential = 'Email atau username wajib diisi.';
    if (!loginForm.password.trim())   errs.password   = 'Password wajib diisi.';
    if (Object.keys(errs).length)     { setLoginErrors(errs); return; }

    setLoading(true);
    const result = await login(loginForm.credential.trim(), loginForm.password);
    setLoading(false);

    if (result.success) {
      setDone(true);
    } else {
      setLoginErrors({ form: result.message });
    }
  }

  // ── Register submit ───────────────────────────────────────────────────────
  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setRegErrors({});
    const errs: Record<string, string | undefined> = {};
    if (!regForm.name.trim())     errs.name     = 'Nama wajib diisi.';
    if (!regForm.username.trim()) errs.username = 'Username wajib diisi.';
    if (!regForm.email.trim())    errs.email    = 'Email wajib diisi.';
    if (!regForm.password)        errs.password = 'Password wajib diisi.';
    if (regForm.password.length > 0 && regForm.password.length < 6)
      errs.password = 'Password minimal 6 karakter.';
    if (regForm.password !== regForm.confirm)
      errs.confirm = 'Konfirmasi password tidak cocok.';
    if (Object.keys(errs).length) { setRegErrors(errs); return; }

    setLoading(true);
    const result = await register(regForm.name, regForm.username, regForm.email, regForm.password);
    setLoading(false);

    if (result.success) {
      showToast(result.message, 'success');
      setDone(true);
    } else {
      setRegErrors({ form: result.message });
    }
  }

  return (
    <div className="min-h-screen bg-bloom-surface flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-[420px] animate-fade-up">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <svg width="28" height="28" viewBox="0 0 22 22" fill="none" className="text-bloom-text">
              <ellipse cx="11" cy="7"   rx="3.5" ry="5.5" fill="currentColor" fillOpacity="0.85"/>
              <ellipse cx="15.5" cy="13" rx="3.5" ry="5.5" transform="rotate(60 15.5 13)"  fill="currentColor" fillOpacity="0.55"/>
              <ellipse cx="6.5"  cy="13" rx="3.5" ry="5.5" transform="rotate(-60 6.5 13)" fill="currentColor" fillOpacity="0.35"/>
              <circle cx="11" cy="11" r="2" fill="currentColor"/>
            </svg>
            <span className="text-xl font-bold text-bloom-text group-hover:opacity-70 transition-opacity">Bloom Store</span>
          </Link>
          <h1 className="text-2xl font-bold text-bloom-text">
            {tab === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}
          </h1>
          <p className="text-sm text-bloom-secondary mt-1">
            {tab === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
            {' '}
            <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setLoginErrors({}); setRegErrors({}); }}
              className="text-bloom-text font-semibold hover:opacity-70 transition-opacity">
              {tab === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}
            </button>
          </p>
        </div>

        {/* Demo credentials hint */}
        {tab === 'login' && (
          <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm space-y-1.5">
            <p className="font-semibold text-blue-800 text-xs uppercase tracking-wide mb-2">Akun Demo</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-blue-700 text-xs">
              <span className="font-medium">Customer:</span><span>user / user123</span>
              <span className="font-medium">Admin:</span><span>admin / admin123</span>
            </div>
          </div>
        )}

        {/* ── LOGIN FORM ──────────────────────────────────────────── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} noValidate
            className="bg-white border border-bloom-border rounded-2xl p-7 shadow-card space-y-5">
            {loginErrors.form && <ErrorBanner msg={loginErrors.form} />}

            <Field label="Email atau Username" error={loginErrors.credential}>
              <input type="text" autoComplete="username" value={loginForm.credential}
                onChange={e => { setLoginForm(f => ({ ...f, credential: e.target.value })); setLoginErrors(p => ({ ...p, credential: undefined })); }}
                placeholder="contoh@email.com atau username"
                className={inputCls(!!loginErrors.credential)} />
            </Field>

            <Field label="Password" error={loginErrors.password}>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} autoComplete="current-password" value={loginForm.password}
                  onChange={e => { setLoginForm(f => ({ ...f, password: e.target.value })); setLoginErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="Masukkan password" className={inputCls(!!loginErrors.password) + ' pr-11'} />
                <EyeBtn show={showPw} toggle={() => setShowPw(v => !v)} />
              </div>
            </Field>

            <SubmitBtn loading={loading} label="Masuk" loadingLabel="Memverifikasi..." />
          </form>
        )}

        {/* ── REGISTER FORM ───────────────────────────────────────── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} noValidate
            className="bg-white border border-bloom-border rounded-2xl p-7 shadow-card space-y-4">
            {regErrors.form && <ErrorBanner msg={regErrors.form} />}

            <Field label="Nama Lengkap" error={regErrors.name}>
              <input type="text" autoComplete="name" value={regForm.name}
                onChange={e => { setRegForm(f => ({ ...f, name: e.target.value })); setRegErrors(p => ({ ...p, name: undefined })); }}
                placeholder="Nama lengkap kamu" className={inputCls(!!regErrors.name)} />
            </Field>

            <Field label="Username" error={regErrors.username}>
              <input type="text" autoComplete="username" value={regForm.username}
                onChange={e => { setRegForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })); setRegErrors(p => ({ ...p, username: undefined })); }}
                placeholder="username_kamu" className={inputCls(!!regErrors.username)} />
            </Field>

            <Field label="Email" error={regErrors.email}>
              <input type="email" autoComplete="email" value={regForm.email}
                onChange={e => { setRegForm(f => ({ ...f, email: e.target.value })); setRegErrors(p => ({ ...p, email: undefined })); }}
                placeholder="email@contoh.com" className={inputCls(!!regErrors.email)} />
            </Field>

            <Field label="Password" error={regErrors.password}>
              <div className="relative">
                <input type={showRegPw ? 'text' : 'password'} autoComplete="new-password" value={regForm.password}
                  onChange={e => { setRegForm(f => ({ ...f, password: e.target.value })); setRegErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="Minimal 6 karakter" className={inputCls(!!regErrors.password) + ' pr-11'} />
                <EyeBtn show={showRegPw} toggle={() => setShowRegPw(v => !v)} />
              </div>
            </Field>

            <Field label="Konfirmasi Password" error={regErrors.confirm}>
              <input type="password" autoComplete="new-password" value={regForm.confirm}
                onChange={e => { setRegForm(f => ({ ...f, confirm: e.target.value })); setRegErrors(p => ({ ...p, confirm: undefined })); }}
                placeholder="Ulangi password" className={inputCls(!!regErrors.confirm)} />
            </Field>

            <SubmitBtn loading={loading} label="Buat Akun" loadingLabel="Membuat akun..." />
          </form>
        )}

        <p className="mt-6 text-center text-sm text-bloom-secondary">
          <Link href="/" className="hover:text-bloom-text transition-colors">&larr; Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-bloom-secondary uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-bloom-danger">{error}</p>}
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-bloom-danger">
      <svg width="15" height="15" viewBox="0 0 14 14" fill="currentColor" className="flex-shrink-0">
        <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 9a.875.875 0 110-1.75A.875.875 0 017 10zm.583-2.917H6.417V4.5h1.166v3.583z"/>
      </svg>
      {msg}
    </div>
  );
}

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-bloom-secondary hover:text-bloom-text transition-colors p-1">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        {show
          ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        }
      </svg>
    </button>
  );
}

function SubmitBtn({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full h-12 rounded-pill bg-bloom-text text-white font-semibold text-[15px] btn-press hover:bg-black/80 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200">
      {loading
        ? <><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg>{loadingLabel}</>
        : label
      }
    </button>
  );
}

function inputCls(hasError: boolean) {
  return `w-full h-11 px-4 rounded-xl border text-sm text-bloom-text placeholder-bloom-secondary/60 bg-bloom-surface outline-none transition-all duration-150 ${
    hasError
      ? 'border-bloom-danger ring-2 ring-bloom-danger/20'
      : 'border-bloom-border focus:border-bloom-text focus:ring-2 focus:ring-bloom-text/10'
  }`;
}
