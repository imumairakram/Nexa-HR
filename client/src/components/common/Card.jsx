import React from 'react';

/**
 * Canonical NexaHR Card Primitive
 * Strict 14px card radius, warm slate borders, subtle elevation.
 */
export const Card = ({
  children,
  padding = 'normal', // 'dense' | 'normal' | 'loose' | 'none'
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  const padStyles = {
    none: '',
    dense: 'p-3 sm:p-4',
    normal: 'p-4 sm:p-5',
    loose: 'p-6 sm:p-7',
  }[padding] || 'p-4 sm:p-5';

  return (
    <div
      onClick={onClick}
      className={`rounded-[14px] bg-white dark:bg-[#16211E] border border-[#E2E1DC] dark:border-[#273834] shadow-subtle text-slate-800 dark:text-[#F1F5F4] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        interactive
          ? 'cursor-pointer hover:border-[#C7C5BB] dark:hover:border-[#384E48] hover:shadow-elevated'
          : ''
      } ${padStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

