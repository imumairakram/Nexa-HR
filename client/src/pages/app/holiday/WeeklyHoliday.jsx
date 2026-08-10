import React, { useState } from 'react';
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
  Sparkles,
  Zap,
} from 'lucide-react';

const DAYS = [
  { id: 'mon', name: 'Monday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'tue', name: 'Tuesday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'wed', name: 'Wednesday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'thu', name: 'Thursday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'fri', name: 'Friday', isWeekend: false, standardHours: '8.0 Hours', shiftName: 'General Morning Shift' },
  { id: 'sat', name: 'Saturday', isWeekend: true, standardHours: '0.0 Hours', shiftName: 'Mandatory Weekend Off' },
  { id: 'sun', name: 'Sunday', isWeekend: true, standardHours: '0.0 Hours', shiftName: 'Mandatory Weekend Off' },
];

const WeeklyHoliday = () => {
  const [schedule, setSchedule] = useState(DAYS);
  const [toastMsg, setToastMsg] = useState('');

  const toggleDay = (id) => {
    setSchedule(
      schedule.map((d) => (d.id === id ? { ...d, isWeekend: !d.isWeekend } : d))
    );
  };

  const handleSave = () => {
    setToastMsg('Weekly holiday schedule policy updated successfully!');
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Work Days / Wk</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{workDaysCount} Days</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Weekend Rest Days</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{weekendDaysCount} Days</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Weekly Commitment</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{workDaysCount * 8} Hours</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Shift Policy</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">Standard 5/2</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
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
                {day.isWeekend ? '🏖️ WEEKEND' : '💼 WORK DAY'}
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
