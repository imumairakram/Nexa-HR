import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Canonical NexaHR Drawer / Side-sheet Primitive
 * Strict 20px surface radius, 250ms slide-over entrance, drawer shadow.
 */
export const Drawer = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose?.();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-250 animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer surface: 20px left-side rounding */}
        <div
          role="dialog"
          aria-modal="true"
          className={`w-screen ${maxWidth} bg-white dark:bg-[#16211E] rounded-l-[20px] shadow-drawer border-l border-[#E2E1DC] dark:border-[#273834] p-6 flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#E2E1DC] dark:border-[#273834] pb-4 mb-5 shrink-0">
            <div className="min-w-0">
              {title && (
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-[#F1F5F4] tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#5B6663] dark:text-[#8B9A96] mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-[8px] bg-[#ECEAE4]/80 dark:bg-[#273834]/80 text-[#5B6663] dark:text-[#8B9A96] hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Close drawer"
            >
              <X className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;

