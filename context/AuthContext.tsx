'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

// ─── Static user list (no backend) ─────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface StaticUser extends User {
  password: string;
}

const STATIC_USERS: StaticUser[] = [
  { id: 1, name: 'Admin Bloom', username: 'admin', email: 'admin@bloom.com', password: 'admin123' },
  { id: 2, name: 'Pengguna Demo', username: 'user', email: 'user@bloom.com', password: 'user123' },
];

const SESSION_KEY = 'bloom_store_user';

// ─── Context Type ───────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (credential: string, password: string) => { success: boolean; message: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
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

  const login = useCallback(
    (credential: string, password: string): { success: boolean; message: string } => {
      // Validate empty fields
      if (!credential.trim()) {
        return { success: false, message: 'Email atau username wajib diisi.' };
      }
      if (!password.trim()) {
        return { success: false, message: 'Password wajib diisi.' };
      }

      // Match against static users (email OR username)
      const match = STATIC_USERS.find(
        (u) =>
          (u.email === credential.trim() || u.username === credential.trim()) &&
          u.password === password
      );

      if (!match) {
        return { success: false, message: 'Email/username atau password salah.' };
      }

      const { password: _, ...safeUser } = match;
      setUser(safeUser);
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      } catch {
        // localStorage unavailable — proceed in-memory only
      }
      return { success: true, message: `Selamat datang, ${safeUser.name}!` };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
