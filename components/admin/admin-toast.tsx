'use client';

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface AdminToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  durationMs?: number;
}

export function AdminToast({ toast, onDismiss, durationMs = 3500 }: AdminToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [toast, onDismiss, durationMs]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-xs border border-slate-300 shadow-lg p-3.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
          {!isSuccess && !isError && <Info className="w-4 h-4 text-brand-navy" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 leading-snug">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-mono">
              {toast.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="ปิดการแจ้งเตือน"
          className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-navy"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
