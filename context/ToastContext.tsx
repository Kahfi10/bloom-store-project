'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { ToastMessage, ToastType } from '@/types';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

      // Start exit animation after 2.2s, remove after 2.5s
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
        );
      }, 2200);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2500);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container — fixed bottom-right */}
      <div
        className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 min-w-[260px] max-w-[360px] px-5 py-3.5
              rounded-xl shadow-lg pointer-events-auto
              ${toast.exiting ? 'toast-exit' : 'toast-enter'}
              ${
                toast.type === 'success'
                  ? 'bg-bloom-text text-white'
                  : toast.type === 'error'
                  ? 'bg-bloom-danger text-white'
                  : 'bg-bloom-surface text-bloom-text border border-bloom-border'
              }
            `}
          >
            {/* Icon */}
            <span className="flex-shrink-0 text-base leading-none">
              {toast.type === 'success' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.4" />
                  <path
                    d="M4.5 8L6.8 10.3L11.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.4" />
                  <path
                    d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>

            {/* Message */}
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
