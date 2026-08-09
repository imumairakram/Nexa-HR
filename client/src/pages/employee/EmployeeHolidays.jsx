import React from 'react';
import {
  Calendar,
  Sparkles,
  Clock,
  Sun,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const OFFICIAL_HOLIDAYS = [
  { id: 1, name: 'Labor Day', date: 'Sep 07, 2026', day: 'Monday', countdown: 'In 29 Days', type: 'NATIONAL', longWeekend: true },
  { id: 2, name: "Indigenous Peoples' Day", date: 'Oct 12, 2026', day: 'Monday', countdown: 'In 64 Days', type: 'FEDERAL', longWeekend: true },
  { id: 3, name: 'Veterans Day', date: 'Nov 11, 2026', day: 'Wednesday', countdown: 'In 94 Days', type: 'FEDERAL', longWeekend: false },
  { id: 4, name: 'Thanksgiving Holiday', date: 'Nov 26, 2026', day: 'Thursday', countdown: 'In 109 Days', type: 'NATIONAL', longWeekend: true },
  { id: 5, name: 'Day After Thanksgiving', date: 'Nov 27, 2026', day: 'Friday', countdown: 'In 110 Days', type: 'COMPANY_OFF', longWeekend: true },
  { id: 6, name: 'Christmas Day', date: 'Dec 25, 2026', day: 'Friday', countdown: 'In 138 Days', type: 'NATIONAL', longWeekend: true },
  { id: 7, name: "New Year's Day 2027", date: 'Jan 01, 2027', day: 'Friday', countdown: 'In 145 Days', type: 'NATIONAL', longWeekend: true },
];

const EmployeeHolidays = () => {
  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Official Company Holidays & Calendar"
        subtitle="Yearly public holiday schedule, long weekend planner, and official time-off calendar."
      />

      {/* Next Upcoming Holiday Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold">
              <Sun className="w-3.5 h-3.5" />
              <span>Next Upcoming Holiday</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Labor Day • Sep 07, 2026</h2>
            <p className="text-xs sm:text-sm text-white/90">
              3-Day Long Weekend (Saturday, Sep 5 – Monday, Sep 7). Paid Public Holiday across all offices.
            </p>
          </div>

          <div className="px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-md text-center border border-white/20 shrink-0">
            <div className="text-2xl sm:text-3xl font-black font-mono">29</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-100">
              Days Remaining
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Table & Long Weekend Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Full Holiday List */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              2026 – 2027 Public Holiday Calendar
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Approved non-working holidays observed by NexaHR
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Holiday Occasion</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Day</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-5 text-right">Timing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {OFFICIAL_HOLIDAYS.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{h.name}</span>
                        {h.longWeekend && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            🌴 Long Weekend
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                      {h.date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{h.day}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {h.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      {h.countdown}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Long Weekend Suggestions */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Smart Vacation Tips 💡
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Maximize your days off with leave optimization
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Thanksgiving 5-Day Break
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Apply for leave on Wednesday, Nov 25 to get a 5-day continuous break (Nov 25-29) using only 1 annual leave day!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Christmas & New Year Mega-Trip
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Take 4 annual leaves between Dec 28-31 to enjoy a full 10-day holiday getaway!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
              <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                Weekly Holiday Policy
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-snug">
                Saturdays and Sundays are standard weekly off days. Remote Friday flex-hours apply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHolidays;
