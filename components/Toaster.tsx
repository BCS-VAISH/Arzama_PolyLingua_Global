'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

type ToastItem = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'loading';
};

// Module-level handlers for cross-component communication
const handlers: Array<(t: ToastItem) => void> = [];
const dismissHandlers: Array<(id: string) => void> = [];

export const toast = {
  success: (message: string) => emit(message, 'success'),
  error: (message: string) => emit(message, 'error'),
  info: (message: string) => emit(message, 'info'),
  loading: (message: string) => {
    const id = emit(message, 'loading');
    return id;
  },
  dismiss: (id: string) => {
    dismissHandlers.forEach(h => h(id));
  },
};

function emit(message: string, type: ToastItem['type']): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  handlers.forEach(h => h({ id, message, type }));
  return id;
}

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (t: ToastItem) => {
      setToasts(prev => [...prev, t]);
      if (t.type !== 'loading') {
        setTimeout(() => {
          setToasts(prev => prev.filter(x => x.id !== t.id));
        }, 3500);
      }
    };

    const dismissHandler = (id: string) => {
      setToasts(prev => prev.filter(x => x.id !== id));
    };

    handlers.push(handler);
    dismissHandlers.push(dismissHandler);

    return () => {
      const hIdx = handlers.indexOf(handler);
      if (hIdx > -1) handlers.splice(hIdx, 1);
      const dIdx = dismissHandlers.indexOf(dismissHandler);
      if (dIdx > -1) dismissHandlers.splice(dIdx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium pointer-events-auto transition-all duration-300 ${
            t.type === 'success'
              ? 'bg-green-600'
              : t.type === 'error'
              ? 'bg-red-600'
              : t.type === 'loading'
              ? 'bg-blue-700'
              : 'bg-gray-800'
          }`}
          style={{ animation: 'toastSlideIn 0.3s ease forwards' }}
        >
          <span className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {t.type === 'info' && <Info className="w-5 h-5" />}
            {t.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
