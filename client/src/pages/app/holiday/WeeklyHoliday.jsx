import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Save,
  Check,
  Building2,
  ShieldCheck,
  Calendar,
  Zap,
} from 'lucide-react';
import { useRegionalSettings } from '../../../context/RegionalSettingsContext';

const DEFAULT_DAYS = [
  { id: 'mon', name: 'Monday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'tue', name: 'Tuesday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'wed', name: 'Wednesday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'thu', name: 'Thursday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'fri', name: 'Friday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'sat', name: 'Saturday', isWeekend: true, standardHours: '0.0 Hours', shiftName: 'Mandatory Weekend Off' },
  { id: 'sun', name: 'Sunday', isWeekend: true, standardHours: '0.0 Hours', shiftName: 'Mandatory Weekend Off' },
];

const WeeklyHoliday = () => {
  const { companySettings, updateCompanySettings } = useRegionalSettings();

  const [schedule, setSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_weekly_holiday_schedule');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_DAYS;
  });

  const [toastMsg, setToastMsg] = useState('');

  const toggleDay = (id) => {
    setSchedule((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isWeekend: !d.isWeekend } : d))
    );
  };

  const handleSave = () => {
    try {
      localStorage.setItem('nexahr_weekly_holiday_schedule', JSON.stringify(schedule));
      const workDays = schedule.filter((d) => !d.isWeekend).map((d) => d.name);
      const workWeekStr = `${workDays[0] || 'Monday'} - ${workDays[workDays.length - 1] || 'Friday'}`;
      updateCompanySettings({
        workWeek: `${workWeekStr} (${schedule.filter((d) => d.isWeekend).map((d) => d.name.substring(0, 3)).join('/')} Off)`,
      });
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
    setToastMsg('Weekly holiday schedule & working shift policy updated successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const workDaysCount = schedule.filter((d) => !d.isWeekend).length;
  const weekendDaysCount = schedule.filter((d) => d.isWeekend).length;

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Weekly Holiday & Rest-Day Shift Policy"
        subtitle="Establish company standard non-working weekend days, mandatory rest cycles, and department shift schedules."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC WEEKLY HOLIDAY HERO BANNER (SKY-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-blue-50/80 to-indigo-50/60 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Rest Cycle Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-600/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-extrabold border border-sky-600/20 dark:border-sky-500/30">
                <CalendarDays className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Standard Workweek Policy</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-600/20 dark:border-blue-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Attendance Engine Linked</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Weekly Rest Days & Shift Schedule Matrix
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Define standard non-working weekend rest days, standard working hours, and operational shift rules for automated attendance calculations.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold bg-sky-100/60 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800/60">
                <Building2 className="w-3.5 h-3.5" />
                <span>{workDaysCount} Standard Work Days / Week</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <Clock className="w-3.5 h-3.5" />
                <span>{workDaysCount * 8.0} Total Scheduled Hours</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Save className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Save Schedule</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Apply policy globally</div>
            </div>
            <button
              onClick={handleSave}
              className="w-full px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Sync Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Work Days / Wk</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {workDaysCount} <span className="text-base font-bold text-slate-400">Days</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Standard Workweek</span>
              <span className="text-slate-400">Mon - Fri</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Weekend Rest Days</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {weekendDaysCount} <span className="text-base font-bold text-slate-400">Days</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Mandatory Off</span>
              <span className="text-slate-400">Sat / Sun</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Standard Weekly Cap</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {workDaysCount * 8.0} <span className="text-base font-bold text-slate-400">Hours</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">40h Statutory Max</span>
              <span className="text-slate-400">Standard</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-sky-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-sky-500/10 blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Attendance Sync</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/60 dark:border-sky-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 tracking-tight">
              100% <span className="text-base font-bold text-slate-400">Aligned</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Biometric Rule Active</span>
              <span className="text-slate-400">PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Schedule Selector Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              7-Day Weekly Shift & Rest Schedule Selector
            </h3>
            <p className="text-xs text-slate-400">
              Click on any day card below to toggle between standard working day and off-duty weekend rest day.
            </p>
          </div>

          <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            Interactive Toggle Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {schedule.map((day) => (
            <div
              key={day.id}
              onClick={() => toggleDay(day.id)}
              className={`p-5 rounded-3xl border text-center transition-all cursor-pointer flex flex-col justify-between space-y-3 hover:scale-[1.02] ${
                day.isWeekend
                  ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">SCHEDULE</span>
                <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">{day.name}</h4>
                <div className="text-[11px] text-slate-400 font-medium mt-1">{day.standardHours}</div>
              </div>

              <div
                className={`py-1.5 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                  day.isWeekend
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {day.isWeekend ? 'Weekend' : 'Work Day'}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>
            Active organizational policy configures a standard <strong>{workDaysCount}-Day Working Week ({workDaysCount * 8} hours total)</strong>. Biometric turnstiles and attendance auto-clock engines are configured based on this shift policy.
          </span>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSave}
            className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Save Weekly Shift Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHoliday;
