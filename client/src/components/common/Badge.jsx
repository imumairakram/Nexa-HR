import React from 'react';

/**
 * Canonical NexaHR Badge Primitive
 * Strict 8px control radius, semantic accessible text variants.
 */
export const Badge = ({
  children,
  variant = 'sky', // 'sky' | 'teal' | 'amber' | 'neutral' | 'success' | 'danger' | 'info'
  icon: Icon = null,
  className = '',
  ...props
}) => {
  const variantStyles = {
    sky: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200/70 dark:border-sky-800/60',
    teal: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200/70 dark:border-sky-800/60',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/70 dark:border-amber-800/60',
    neutral: 'bg-[#ECEAE4] dark:bg-[#273834] text-[#1C2321] dark:text-[#F1F5F4] border border-[#E2E0D8] dark:border-[#384E48]',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-800/60',
    danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200/70 dark:border-rose-800/60',
    info: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200/70 dark:border-sky-800/60',
  }[variant] || 'bg-sky-50 text-sky-800';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[12px] text-[11px] font-semibold tracking-tight transition-colors shrink-0 ${variantStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0 stroke-[1.75]" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

