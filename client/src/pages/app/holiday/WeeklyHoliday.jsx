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
} from 'lucide-react';

const DAYS = [
  { id: 'mon', name: 'Monday', isWeekend: false },
  { id: 'tue', name: 'Tuesday', isWeekend: false },
  { id: 'wed', name: 'Wednesday', isWeekend: false },
  { id: 'thu', name: 'Thursday', isWeekend: false },
  { id: 'fri', name: 'Friday', isWeekend: false },
  { id: 'sat', name: 'Saturday', isWeekend: true },
  { id: 'sun', name: 'Sunday', isWeekend: true },
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

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 max-w-4xl mx-auto">
      <AppPageHeader
        title="Weekly Holiday & Rest-Day Shift Policy"
        subtitle="Establish company standard non-working weekend days and department shift rest schedules."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Standard Company Work-Week Schedule
          </h3>
          <p className="text-xs text-slate-400">
            Select days designated as off-duty weekends (unpaid rest periods for standard office shifts)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
          {schedule.map((day) => (
            <div
              key={day.id}
              onClick={() => toggleDay(day.id)}
              className={`p-5 rounded-3xl border text-center transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                day.isWeekend
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">DAY</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">{day.name}</h4>
              </div>

              <div
                className={`py-1 px-2 rounded-xl text-[10px] font-extrabold uppercase ${
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
            Current policy defines a <strong>5-Day Working Week (40 standard hours)</strong> with Saturday and Sunday designated as mandatory paid rest days.
          </span>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSave}
            className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Save Shift Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHoliday;
