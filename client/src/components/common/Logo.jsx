import React from 'react';

const Logo = ({ collapsed = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* NexaHR Brand Icon Emblem Badge */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#00A8FF] via-[#0066FF] to-[#6C47FF] shadow-md shadow-blue-500/25 border border-white/20 dark:border-blue-400/20 flex items-center justify-center shrink-0 transition-transform duration-200">
        <svg
          className="w-5 h-5 sm:w-5.5 sm:h-5.5 drop-shadow-xs"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left vertical capsule */}
          <rect x="14" y="26" width="22" height="48" rx="11" fill="#FFFFFF" />
          {/* Diagonal ribbon bar */}
          <path
            d="M23 44 L68 18 C74 14 82 18 82 25 L82 30 C82 35 79 39 75 41 L30 67 C24 70 16 66 16 59 L16 54 C16 49 19 46 23 44 Z"
            fill="#FFFFFF"
          />
          {/* Right vertical capsule */}
          <rect x="64" y="26" width="22" height="48" rx="11" fill="#FFFFFF" />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex items-center tracking-tight">
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Nexa
          </span>
          <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            HR
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
