import React from 'react';

/**
 * Canonical NexaHR Button Primitive
 * Strict 8px control radius, solid brand tones, eased 150ms transitions.
 */
export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs font-semibold gap-2',
    lg: 'px-4.5 py-2.5 text-sm font-semibold gap-2',
  }[size] || 'px-3.5 py-2 text-xs font-semibold gap-2';

  const variantStyles = {
    primary:
      'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white shadow-xs border border-sky-600/30 dark:border-sky-400/30',
    secondary:
      'bg-white dark:bg-[#16211E] text-slate-800 dark:text-[#F1F5F4] border border-[#E2E1DC] dark:border-[#273834] hover:bg-[#ECEAE4]/60 dark:hover:bg-[#1D2C28] shadow-subtle',
    accent:
      'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-[#1C2321] font-bold border border-amber-600/30 shadow-xs',
    ghost:
      'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-[#ECEAE4]/60 dark:hover:bg-[#1D2C28] border border-transparent',
    danger:
      'bg-rose-50 text-rose-800 border border-rose-200/80 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-900/60',
  }[variant] || 'bg-sky-500 text-white';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-[12px] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
      ) : null}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
      ) : null}
    </button>
  );
};

export default Button;

