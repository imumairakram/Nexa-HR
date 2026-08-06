import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Calendar, Save, CheckCircle2 } from 'lucide-react';

const WeeklyHoliday = () => {
  const [days, setDays] = useState([
    { name: 'Monday', isOff: false },
    { name: 'Tuesday', isOff: false },
    { name: 'Wednesday', isOff: false },
    { name: 'Thursday', isOff: false },
    { name: 'Friday', isOff: false },
    { name: 'Saturday', isOff: true },
    { name: 'Sunday', isOff: true },
  ]);

  const [saved, setSaved] = useState(false);

  const toggleDay = (index) => {
    const updated = [...days];
    updated[index].isOff = !updated[index].isOff;
    setDays(updated);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Weekly Holiday Configuration" subtitle="Set standard weekly off-days for your organization" />

      {saved && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Weekly holiday rules saved successfully!</span>
        </div>
      )}

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6 max-w-2xl">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Workweek Schedule</h3>
          <p className="text-xs text-slate-400">Toggle days that are designated as non-working weekly holidays</p>
        </div>

        <div className="space-y-3">
          {days.map((d, idx) => (
            <div
              key={d.name}
              onClick={() => toggleDay(idx)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                d.isOff
                  ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className={`w-4 h-4 ${d.isOff ? 'text-rose-500' : 'text-slate-400'}`} />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">{d.name}</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                d.isOff ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
              }`}>
                {d.isOff ? 'OFF DAY' : 'WORKING DAY'}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Workweek Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHoliday;
