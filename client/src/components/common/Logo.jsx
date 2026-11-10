import React from 'react';

const Logo = ({ collapsed = false, className = '', variant = 'sky' }) => {
  const isTeal = variant === 'teal';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* NexaHR Brand Icon Emblem Badge - Solid Light Sky Blue (matching brand theme) */}
      <div
        className={`w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-[10px] flex items-center justify-center shrink-0 shadow-xs transition-colors duration-150 ${
          isTeal
            ? 'bg-teal-700 dark:bg-teal-600 border border-teal-800/30 dark:border-teal-400/30'
            : 'bg-sky-500 dark:bg-sky-500 border border-sky-600/30 dark:border-sky-400/30 shadow-sky-500/20 shadow-xs'
        }`}
      >
        <svg
          className="w-5 h-5 drop-shadow-xs"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left vertical capsule */}
          <rect x="14" y="26" width="22" height="48" rx="6" fill="#FFFFFF" />
          {/* Diagonal ribbon bar */}
          <path
            d="M23 44 L68 18 C74 14 82 18 82 25 L82 30 C82 35 79 39 75 41 L30 67 C24 70 16 66 16 59 L16 54 C16 49 19 46 23 44 Z"
            fill="#FFFFFF"
          />
          {/* Right vertical capsule */}
          <rect x="64" y="26" width="22" height="48" rx="6" fill="#FFFFFF" />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex items-center tracking-tight font-heading">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Nexa
          </span>
          <span
            className={`text-xl sm:text-2xl font-bold ${
              isTeal
                ? 'text-teal-700 dark:text-teal-400'
                : 'text-sky-500 dark:text-sky-400'
            }`}
          >
            HR
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
