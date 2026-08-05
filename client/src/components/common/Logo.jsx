import React from 'react';

const Logo = ({ collapsed = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* NexaHR Logo Mark matching reference design */}
      <svg
        className="w-9 h-9 shrink-0 drop-shadow-sm"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="nexaGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="45%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#6C47FF" />
          </linearGradient>
        </defs>
        {/* Left vertical capsule */}
        <rect x="14" y="26" width="22" height="48" rx="11" fill="url(#nexaGrad)" />
        {/* Diagonal ribbon bar */}
        <path
          d="M23 44 L68 18 C74 14 82 18 82 25 L82 30 C82 35 79 39 75 41 L30 67 C24 70 16 66 16 59 L16 54 C16 49 19 46 23 44 Z"
          fill="url(#nexaGrad)"
        />
        {/* Right vertical capsule */}
        <rect x="64" y="26" width="22" height="48" rx="11" fill="url(#nexaGrad)" />
      </svg>

      {!collapsed && (
        <div className="flex items-center tracking-tight">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            Nexa
          </span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
            HR
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
