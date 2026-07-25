'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface User {
  id:       number;
  name:     string;
  username: string;
  email:    string;
  role:     string; // 'admin' | 'customer'
}

interface AuthContextType {
  user:       User | null;
  isLoggedIn: boolean;
  isAdmin:    boolean;
  login:      (credential: string, password: string) => Promise<{ success: boolean; message: string }>;
  register:   (name: string, username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout:     () => void;
}

const AuthContext    = createContext<AuthContextType | null>(null);
const SESSION_KEY    = 'bloom_store_user';
const SESSION_ID_KEY = 'bloom_session_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  // ── Login via API ──────────────────────────────────────────────────────────
  const login = useCallback(
    async (credential: string, password: string): Promise<{ success: boolean; message: string }> => {
      if (!credential.trim()) return { success: false, message: 'Email atau username wajib diisi.' };
      if (!password.trim())   return { success: false, message: 'Password wajib diisi.' };

      try {
        const res  = await fetch('/api/auth/login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ credential, password }),
        });
        const data = await res.json();

        if (!data.success) return { success: false, message: data.message };

        const safeUser: User = data.data;
        setUser(safeUser);
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser)); } catch { /* ignore */ }

        // Track session in DB (fire-and-forget)
        fetch('/api/sessions', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ userId: safeUser.id, userName: safeUser.name, userEmail: safeUser.email }),
        })
          .then(r => r.json())
          .then(d => {
            if (d.success && d.data?.id) {
              try { localStorage.setItem(SESSION_ID_KEY, d.data.id); } catch { /* ignore */ }
            }
          })
          .catch(() => { /* non-critical */ });

        return { success: true, message: data.message };
      } catch {
        return { success: false, message: 'Koneksi gagal. Coba lagi.' };
      }
    },
    []
  );

  // ── Register via API ────────────────────────────────────────────────────────
  const register = useCallback(
    async (name: string, username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
      try {
        const res  = await fetch('/api/auth/register', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name, username, email, password }),
        });
        const data = await res.json();

        if (!data.success) return { success: false, message: data.message };

        // Auto-login after register
        return login(username, password);
      } catch {
        return { success: false, message: 'Koneksi gagal. Coba lagi.' };
      }
    },
    [login]
  );

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    try {
      const sessionId = localStorage.getItem(SESSION_ID_KEY);
      if (sessionId) {
        fetch('/api/sessions', {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ sessionId }),
        }).catch(() => { /* non-critical */ });
        localStorage.removeItem(SESSION_ID_KEY);
      }
      localStorage.removeItem(SESSION_KEY);
    } catch { /* ignore */ }

    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
