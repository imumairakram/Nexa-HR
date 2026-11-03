import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

/**
 * client/src/components/common/DemoToast.jsx
 *
 * Clean, non-intrusive toast notification for demo mode alerts.
 * Follows DESIGN.md: no gradients, no neon glow, crisp solid borders and accessible typography.
 */
export default function DemoToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer = null;

    const handleToast = (e) => {
      const msg = e?.detail?.message || 'Demo mode: view only. Changes are disabled.';
      setToast(msg);

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setToast(null);
      }, 3500);
    };

    window.addEventListener('show_demo_toast', handleToast);

    return () => {
      window.removeEventListener('show_demo_toast', handleToast);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 bg-white text-slate-800 border border-slate-200 shadow-lg rounded-xl transition-all duration-200 ease-out"
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
        <Info className="w-4 h-4" />
      </div>
      <p className="text-sm font-medium text-slate-700 select-none pr-1">
        {toast}
      </p>
      <button
        type="button"
        onClick={() => setToast(null)}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
        aria-label="Dismiss alert"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
}

