import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarDays,
  Globe,
  Filter,
  Grid,
  List,
  PartyPopper,
  Info,
  Building,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';
import {
  getYearHolidays,
  getAvailableYears,
  MONTH_NAMES,
} from '../../utils/holidayEngine';

const EmployeeHolidays = () => {
  const { timezone, dateFormat } = useRegionalSettings();
  const currentYearNow = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYearNow);
  const [filter, setFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const availableYears = useMemo(() => getAvailableYears(), []);

  // Compute live holidays for the selected year and timezone
  const allYearHolidays = useMemo(() => {
    return getYearHolidays(selectedYear, timezone, dateFormat);
  }, [selectedYear, timezone, dateFormat]);

  // Filtered list based on active category
  const filteredHolidays = useMemo(() => {
    return allYearHolidays.filter((h) => {
      if (filter === 'ALL') return true;
      if (filter === 'NATIONAL') return h.category === 'NATIONAL';
      if (filter === 'RELIGIOUS') return h.category === 'RELIGIOUS';
      if (filter === 'OPTIONAL') return h.category === 'OPTIONAL' || h.type.includes('Bank') || h.type.includes('Optional');
      return true;
    });
  }, [allYearHolidays, filter]);

  // Upcoming spotlight holiday
  const featuredHoliday = useMemo(() => {
    const todayActive = allYearHolidays.find((h) => h.status === 'ACTIVE_TODAY');
    if (todayActive) return todayActive;
    const upcoming = allYearHolidays.find((h) => h.status === 'UPCOMING');
    if (upcoming) return upcoming;
    return allYearHolidays[0] || null;
  }, [allYearHolidays]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <EmployeePageHeader
        title="Company Holidays Calendar"
        subtitle="Dynamic calendar of gazetted public holidays, festival observances, and official non-working schedules."
      />

      {/* ========================================================================= */}
      {/* 1. DYNAMIC HERO SPOTLIGHT (LIGHT BLUE & SKY CYAN GRADIENT AESTHETIC) */}
      {/* ========================================================================= */}
      {featuredHoliday && (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0a2e54] via-[#0b4375] to-[#071f38] text-white p-6 sm:p-8 shadow-2xl border border-sky-400/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 backdrop-blur-md text-sky-200 text-xs font-bold border border-sky-300/30">
                  <PartyPopper className="w-3.5 h-3.5 text-sky-300" />
                  <span>{featuredHoliday.type} • {timezone}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Gazetted Official</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight leading-tight">
                {featuredHoliday.name}
              </h2>

              <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed max-w-lg font-medium">
                {featuredHoliday.description ||
                  'Official paid public holiday observed across all company offices and duty stations. Attendance engines resume normal operations on the next working morning.'}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-200/70 font-medium pt-1">
                <span className="flex items-center gap-1.5 text-sky-100 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-sky-300" />
                  <span>{featuredHoliday.displayDate} ({featuredHoliday.day})</span>
                </span>
                <span>•</span>
                <span className="text-sky-300 font-bold">Paid Non-Working Day</span>
                <span>•</span>
                <span className="text-sky-200/60 font-mono">Timezone: {timezone}</span>
              </div>
            </div>

            {/* Right Spotlight Countdown Badge */}
            <div className="bg-sky-950/40 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-sky-400/30 dark:border-sky-700/60 shadow-2xl flex flex-col items-center text-center min-w-[200px] shrink-0">
              <div className="text-xs font-bold text-sky-200 uppercase tracking-wider mb-1">
                {featuredHoliday.status === 'ACTIVE_TODAY' ? 'Status' : 'Countdown'}
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  featuredHoliday.status === 'ACTIVE_TODAY'
                    ? 'text-emerald-300'
                    : 'text-white'
                }`}
              >
                {featuredHoliday.status === 'ACTIVE_TODAY' ? 'TODAY' : featuredHoliday.countdown}
              </div>
              <div
                className={`text-[11px] font-semibold mt-1 px-3 py-0.5 rounded-full border ${
                  featuredHoliday.status === 'ACTIVE_TODAY'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-sky-500/25 text-sky-100 border-sky-400/40'
                }`}
              >
                {featuredHoliday.status === 'ACTIVE_TODAY' ? 'Active Holiday' : 'Upcoming Observance'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DYNAMIC YEAR SELECTOR & FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Year Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedYear === yr
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {yr} {yr === currentYearNow ? '• Current' : ''}
            </button>
          ))}
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          <span className="text-xs font-bold text-slate-400 hidden sm:inline">
            {filteredHolidays.length} Observances in {selectedYear}
          </span>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              onClick={() => setViewMode('list')}
              title="Schedule Table View"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              title="Calendar Grid View"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEGMENTED CATEGORY PILLS */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex-wrap">
          {[
            { id: 'ALL', label: 'All Gazetted Holidays' },
            { id: 'NATIONAL', label: 'National & Memorial' },
            { id: 'RELIGIOUS', label: 'Islamic & Religious' },
            { id: 'OPTIONAL', label: 'Bank & Optional' },
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
          Showing {filteredHolidays.length} holidays
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 4. UPGRADED ENTERPRISE HOLIDAYS TABLE DESIGN */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Official Gazetted Holidays Schedule ({selectedYear})
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Automatically calculated according to timezone: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{timezone}</span>
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 self-start sm:self-auto">
              {selectedYear} Annual Gazette
            </span>
          </div>

          {filteredHolidays.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">No holidays match your current filter for {selectedYear}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider bg-slate-50/60 dark:bg-slate-800/40">
                    <th className="py-4 px-6">Date & Day</th>
                    <th className="py-4 px-6">Holiday Title & Details</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Duty Status</th>
                    <th className="py-4 px-6 text-right">Observance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {filteredHolidays.map((h) => (
                    <tr
                      key={h.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group ${
                        h.status === 'ACTIVE_TODAY' ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Column 1: Date & Day Badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            <span className="text-[9px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">
                              {h.monthShort}
                            </span>
                            <span className="text-base font-black text-slate-900 dark:text-white font-mono leading-none mt-0.5">
                              {h.dayNum}
                            </span>
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs">{h.day}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{h.displayDate}</div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Holiday Title & Details */}
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {h.name}
                            </span>
                            {h.isCustom && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200/60">
                                Company Special
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-1">
                            {h.description || 'Official paid gazetted holiday across all company duty stations.'}
                          </p>
                        </div>
                      </td>

                      {/* Column 3: Category */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            h.category === 'RELIGIOUS'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60'
                              : h.category === 'NATIONAL'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{h.type}</span>
                        </span>
                      </td>

                      {/* Column 4: Duty / Pay Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid Non-Working Day</span>
                        </span>
                      </td>

                      {/* Column 5: Status & Countdown */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-extrabold border ${
                            h.status === 'ACTIVE_TODAY'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 animate-pulse'
                              : h.status === 'UPCOMING'
                              ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/80 dark:border-slate-700'
                          }`}
                        >
                          <span>{h.status === 'ACTIVE_TODAY' ? 'TODAY' : h.countdown}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW MODE: 12-MONTH CALENDAR GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MONTH_NAMES.map((monthName, mIdx) => {
            const monthNum = mIdx + 1;
            const daysInMonth = new Date(selectedYear, monthNum, 0).getDate();
            const firstDayOfWeek = new Date(selectedYear, mIdx, 1).getDay();
            const monthHolidays = allYearHolidays.filter((h) => h.month === monthNum);

            return (
              <div
                key={monthName}
                className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  {/* Month Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{monthName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                      {monthHolidays.length} Holidays
                    </span>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pt-2 pb-1">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  {/* Days Matrix */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-7" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, dIdx) => {
                      const day = dIdx + 1;
                      const dateStr = `${selectedYear}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const matchingHolidays = monthHolidays.filter((h) => h.date === dateStr);
                      const hasHoliday = matchingHolidays.length > 0;
                      const isWeekend = (firstDayOfWeek + dIdx) % 7 === 0 || (firstDayOfWeek + dIdx) % 7 === 6;

                      return (
                        <div
                          key={day}
                          title={hasHoliday ? matchingHolidays.map((h) => h.name).join(' • ') : ''}
                          className={`h-7 rounded-xl flex items-center justify-center font-bold text-[11px] transition-all cursor-default ${
                            hasHoliday
                              ? 'bg-sky-600 text-white shadow-xs font-black'
                              : isWeekend
                              ? 'text-slate-400 dark:text-slate-500 font-medium'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Holiday listing in this month */}
                {monthHolidays.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    {monthHolidays.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white truncate block">{h.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {h.dayNum} {h.monthShort} ({h.day})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeHolidays;
