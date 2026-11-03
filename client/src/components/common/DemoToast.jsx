import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

/**
 * client/src/components/common/DemoToast.jsx
 *
 * Clean, non-intrusive toast notification for demo mode alerts.
 * Follows DESIGN.md: solid borders, accessible typography, light/dark mode support.
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
      }, 4000);
    };

    window.addEventListener('show_demo_toast', handleToast);

    return () => {
      window.removeEventListener('show_demo_toast', handleToast);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.aside
          key="demo-toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-amber-300 dark:border-amber-700/80 shadow-2xl rounded-2xl max-w-md pointer-events-auto"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 select-none pr-1 leading-snug">
            {toast}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

