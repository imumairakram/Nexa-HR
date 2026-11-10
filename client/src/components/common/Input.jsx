import React from 'react';

/**
 * Canonical NexaHR Input Primitive
 * Strict 8px control radius, warm neutral surface, teal focus ring.
 */
export const Input = ({
  icon: Icon = null,
  error = null,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className="w-full relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          <Icon className="w-4 h-4 stroke-[1.75]" />
        </div>
      )}
      <input
        disabled={disabled}
        className={`w-full bg-[#ECEAE4]/60 dark:bg-[#111A18] border ${
          error
            ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
            : 'border-[#E2E1DC] dark:border-[#273834] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 dark:focus:ring-sky-400/20 dark:focus:border-sky-400'
        } rounded-[8px] ${
          Icon ? 'pl-9.5' : 'pl-3.5'
        } pr-3.5 py-2 text-xs font-medium text-slate-900 dark:text-[#F1F5F4] placeholder-slate-400 outline-none transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

