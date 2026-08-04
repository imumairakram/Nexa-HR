import React, { useState } from 'react';
import { Bell, Search, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

const Header = () => {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState(null);

  const toggleClock = () => {
    if (!clockedIn) {
      setClockedIn(true);
      setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setClockedIn(false);
      setClockTime(null);
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white rounded-3xl p-4 md:px-6 shadow-soft border border-slate-100">
      {/* Search Input & System Status */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-pastelGreen-light text-pastelGreen-dark text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Internal Portal</span>
        </div>

        <div className="relative flex-1 md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, departments..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-full text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      {/* Action Controls: Web Clock + Notifications + User Badge */}
      <div className="flex items-center justify-between md:justify-end gap-3">
        {/* Quick Web Clock Widget */}
        <button
          onClick={toggleClock}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm ${
            clockedIn
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-pastelOrange-DEFAULT text-slate-900 hover:bg-orange-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>
            {clockedIn ? `Clocked In (${clockTime})` : 'Web Clock-In'}
          </span>
          {clockedIn && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </button>

        {/* Notifications Icon */}
        <button className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Admin User</p>
            <p className="text-[10px] text-slate-500">System Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
