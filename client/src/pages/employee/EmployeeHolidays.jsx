import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Sun,
  Compass,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Moon,
  CalendarDays,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

// Official Gazetted Public Holidays of Pakistan (Government Standards)
const PAKISTAN_OFFICIAL_HOLIDAYS = [
  { id: 1, name: 'Independence Day (Youm-e-Azadi)', monthShort: 'AUG', dayNum: '14', date: 'Aug 14, 2026', day: 'Friday', countdown: 'Today • Active', type: 'Gazetted National', longWeekend: true, active: true },
  { id: 2, name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', monthShort: 'AUG', dayNum: '25', date: 'Aug 25, 2026', day: 'Tuesday', countdown: 'In 9 Days', type: 'Gazetted Religious', longWeekend: false },
  { id: 3, name: 'Iqbal Day (Allama Iqbal Memorial)', monthShort: 'NOV', dayNum: '09', date: 'Nov 09, 2026', day: 'Monday', countdown: 'In 85 Days', type: 'Gazetted National', longWeekend: true },
  { id: 4, name: 'Quaid-e-Azam Day / Christmas', monthShort: 'DEC', dayNum: '25', date: 'Dec 25, 2026', day: 'Friday', countdown: 'In 131 Days', type: 'Gazetted National', longWeekend: true },
  { id: 5, name: 'Kashmir Solidarity Day', monthShort: 'FEB', dayNum: '05', date: 'Feb 05, 2027', day: 'Friday', countdown: 'In 173 Days', type: 'Gazetted National', longWeekend: true },
  { id: 6, name: 'Pakistan Day (Resolution Day)', monthShort: 'MAR', dayNum: '23', date: 'Mar 23, 2027', day: 'Tuesday', countdown: 'In 219 Days', type: 'Gazetted National', longWeekend: false },
  { id: 7, name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', monthShort: 'APR', dayNum: '10', date: 'Apr 10, 2027', day: 'Saturday', countdown: 'In 237 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 8, name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', monthShort: 'APR', dayNum: '11', date: 'Apr 11, 2027', day: 'Sunday', countdown: 'In 238 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 9, name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', monthShort: 'APR', dayNum: '12', date: 'Apr 12, 2027', day: 'Monday', countdown: 'In 239 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 10, name: 'Labour Day (May Day)', monthShort: 'MAY', dayNum: '01', date: 'May 01, 2027', day: 'Saturday', countdown: 'In 258 Days', type: 'Gazetted National', longWeekend: true },
  { id: 11, name: 'Eid-ul-Adha (Feast of Sacrifice - Day 1)', monthShort: 'JUN', dayNum: '16', date: 'Jun 16, 2027', day: 'Wednesday', countdown: 'In 304 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 12, name: 'Eid-ul-Adha (Day 2)', monthShort: 'JUN', dayNum: '17', date: 'Jun 17, 2027', day: 'Thursday', countdown: 'In 305 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 13, name: 'Eid-ul-Adha (Day 3)', monthShort: 'JUN', dayNum: '18', date: 'Jun 18, 2027', day: 'Friday', countdown: 'In 306 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 14, name: 'Ashura (9th Muharram)', monthShort: 'JUL', dayNum: '14', date: 'Jul 14, 2027', day: 'Wednesday', countdown: 'In 332 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 15, name: 'Ashura (10th Muharram)', monthShort: 'JUL', dayNum: '15', date: 'Jul 15, 2027', day: 'Thursday', countdown: 'In 333 Days', type: 'Gazetted Religious', longWeekend: true },
];

const EmployeeHolidays = () => {
  const [filter, setFilter] = useState('ALL');

  const filteredHolidays = PAKISTAN_OFFICIAL_HOLIDAYS.filter((h) => {
    if (filter === 'ALL') return true;
    if (filter === 'NATIONAL') return h.type.includes('National');
    if (filter === 'RELIGIOUS') return h.type.includes('Religious');
    if (filter === 'LONG_WEEKEND') return h.longWeekend;
    return true;
  });

  const featuredHoliday = PAKISTAN_OFFICIAL_HOLIDAYS.find((h) => h.active) || PAKISTAN_OFFICIAL_HOLIDAYS[0];

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Company Holidays Calendar"
        subtitle="Gazetted national public holidays, festival observances, and long weekend schedules."
      />

      {/* ========================================================================= */}
      {/* 1. CLEAN DASHBOARD HERO SPOTLIGHT (REPLACES UGLY SOLID GREEN BANNER) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-bold border border-white/10">
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Gazetted National Public Holiday • Pakistan</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                <span>3-Day Long Weekend</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              {featuredHoliday.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Official paid public holiday observed across all regional office stations. Turnstiles and standard shifts will resume the next business morning.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{featuredHoliday.date} ({featuredHoliday.day})</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Paid Non-Working Day</span>
            </div>
          </div>

          {/* Right Spotlight Countdown Badge */}
          <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-700/60 shadow-2xl flex flex-col items-center text-center min-w-[200px] shrink-0">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Status</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
              TODAY
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-1 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Holiday
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEGMENTED FILTER PILLS */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex-wrap">
          {[
            { id: 'ALL', label: 'All Gazetted Holidays' },
            { id: 'NATIONAL', label: 'National & Memorial' },
            { id: 'RELIGIOUS', label: 'Islamic & Religious' },
            { id: 'LONG_WEEKEND', label: 'Long Weekends' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-400">
          {filteredHolidays.length} Observances Listed
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 3. CALENDAR-STYLE HOLIDAY LIST (PURE WHITE CARDS) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Official Holidays Schedule (2026 – 2027)
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Ministry of Interior gazette notification compliant corporate calendar
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredHolidays.map((h) => (
            <div
              key={h.id}
              className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                h.active ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
              }`}
            >
              {/* Left Side: Calendar Box + Holiday Title */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Calendar Icon Badge Box */}
                <div className="w-12 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-xs">
                  <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {h.monthShort}
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono leading-none mt-0.5">
                    {h.dayNum}
                  </span>
                </div>

                {/* Name & Classification */}
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {h.name}
                    </h4>
                    {h.longWeekend && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                        Long Weekend
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>{h.date} ({h.day})</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-300 font-semibold">{h.type}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Countdown Badge */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-extrabold border ${
                    h.active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  {h.countdown}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHolidays;
