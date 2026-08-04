import React from 'react';
import { Bell, Search, Cpu } from 'lucide-react';

const TopHeader = () => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white rounded-3xl p-4 md:px-6 shadow-soft border border-slate-100">
      {/* Search Input & Hardware Status */}
      <div className="flex items-center gap-3">
        {/* Biometric Device Active Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pastelGreen-light text-pastelGreen-dark text-xs font-semibold shadow-sm">
          <Cpu className="w-4 h-4 stroke-[1.75]" />
          <span>Biometric Sync Active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Minimalist Search Bar */}
        <div className="relative flex-1 md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search employees, attendance, logs..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-full text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
          />
        </div>
      </div>

      {/* Action Controls: Notifications + Admin Profile */}
      <div className="flex items-center justify-between md:justify-end gap-3">
        {/* Notifications Icon */}
        <button className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center relative transition-colors">
          <Bell className="w-4 h-4 stroke-[1.75]" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar & Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            AD
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">Admin User</p>
            <p className="text-[10px] font-semibold text-slate-500">System Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
