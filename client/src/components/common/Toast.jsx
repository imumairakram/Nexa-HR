import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * client/src/components/common/Toast.jsx
 *
 * Modern Glassmorphic Enterprise Toast for NexaHR
 * Matches the platform's clean aesthetic with soft glows, accessible contrast,
 * squircle icon badge, and responsive dismissal.
 */
export default function Toast({ message, type, onClose }) {
  if (!message) return null;

  const msgLower = typeof message === 'string' ? message.toLowerCase() : '';
  const isError =
    type === 'error' ||
    msgLower.includes('fail') ||
    msgLower.includes('error') ||
    msgLower.includes('invalid') ||
    msgLower.includes('required');
  const isInfo = type === 'info';

  const badgeStyles = isError
    ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/25'
    : isInfo
    ? 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/25'
    : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';

  const Icon = isError ? AlertCircle : isInfo ? Info : CheckCircle2;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto"
    >
      <div className={`w-8 h-8 rounded-xl ${badgeStyles} border flex items-center justify-center shrink-0 shadow-xs`}>
        <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
      </div>
      <div className="flex-1 pr-1 select-none">
        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
          {message}
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto -mr-1 cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

