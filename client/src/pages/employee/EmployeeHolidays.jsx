import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Clock,
  Sun,
  Compass,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Flag,
  Moon,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

// Official Gazetted Public Holidays of Pakistan (Government Standards)
const PAKISTAN_OFFICIAL_HOLIDAYS = [
  { id: 1, name: 'Independence Day (Youm-e-Azadi)', date: 'Aug 14, 2026', day: 'Friday', countdown: 'Today • Active', type: 'Gazetted National', longWeekend: true, active: true },
  { id: 2, name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: 'Aug 25, 2026', day: 'Tuesday', countdown: 'In 11 Days', type: 'Gazetted Religious', longWeekend: false },
  { id: 3, name: 'Iqbal Day (Allama Iqbal Memorial)', date: 'Nov 09, 2026', day: 'Monday', countdown: 'In 87 Days', type: 'Gazetted National', longWeekend: true },
  { id: 4, name: 'Quaid-e-Azam Day / Christmas', date: 'Dec 25, 2026', day: 'Friday', countdown: 'In 133 Days', type: 'Gazetted National', longWeekend: true },
  { id: 5, name: 'Kashmir Solidarity Day', date: 'Feb 05, 2027', day: 'Friday', countdown: 'In 175 Days', type: 'Gazetted National', longWeekend: true },
  { id: 6, name: 'Pakistan Day (Resolution Day)', date: 'Mar 23, 2027', day: 'Tuesday', countdown: 'In 221 Days', type: 'Gazetted National', longWeekend: false },
  { id: 7, name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', date: 'Apr 10, 2027', day: 'Saturday', countdown: 'In 239 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 8, name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', date: 'Apr 11, 2027', day: 'Sunday', countdown: 'In 240 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 9, name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', date: 'Apr 12, 2027', day: 'Monday', countdown: 'In 241 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 10, name: 'Labour Day (May Day)', date: 'May 01, 2027', day: 'Saturday', countdown: 'In 260 Days', type: 'Gazetted National', longWeekend: true },
  { id: 11, name: 'Eid-ul-Adha (Feast of Sacrifice - Day 1)', date: 'Jun 16, 2027', day: 'Wednesday', countdown: 'In 306 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 12, name: 'Eid-ul-Adha (Day 2)', date: 'Jun 17, 2027', day: 'Thursday', countdown: 'In 307 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 13, name: 'Eid-ul-Adha (Day 3)', date: 'Jun 18, 2027', day: 'Friday', countdown: 'In 308 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 14, name: 'Ashura (9th Muharram)', date: 'Jul 14, 2027', day: 'Wednesday', countdown: 'In 334 Days', type: 'Gazetted Religious', longWeekend: true },
  { id: 15, name: 'Ashura (10th Muharram)', date: 'Jul 15, 2027', day: 'Thursday', countdown: 'In 335 Days', type: 'Gazetted Religious', longWeekend: true },
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

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Official Pakistan Public Holidays"
        subtitle="Government gazetted public holiday calendar and official non-working observance days."
      />

      {/* Featured Holiday Hero Banner (Pakistan Standards) */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gazetted National Public Holiday • Pakistan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              🇵🇰 Pakistan Independence Day • Aug 14, 2026
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              79th Youm-e-Azadi. Official paid public holiday across all Pakistan offices (Karachi, Lahore, Islamabad) with 3-Day Long Weekend (Friday – Sunday).
            </p>
          </div>

          <div className="px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-md text-center border border-white/20 shrink-0">
            <div className="text-2xl sm:text-3xl font-black font-mono">TODAY</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-100">
              National Holiday
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'All Gazetted Holidays' },
          { id: 'NATIONAL', label: '🇵🇰 National & Memorial' },
          { id: 'RELIGIOUS', label: '🌙 Islamic & Religious' },
          { id: 'LONG_WEEKEND', label: '🌴 Long Weekends' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Holiday Table Full Width */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Pakistan Gazetted Holidays Schedule (2026 – 2027)
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Ministry of Interior gazette notification compliant corporate calendar
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
            {filteredHolidays.length} Holidays Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Holiday Occasion</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Day</th>
                <th className="py-3.5 px-4">Gazette Classification</th>
                <th className="py-3.5 px-5 text-right">Timing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredHolidays.map((h) => (
                <tr
                  key={h.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    h.active ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-bold' : ''
                  }`}
                >
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
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        h.type.includes('National')
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {h.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span
                      className={`font-mono font-bold ${
                        h.active
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full text-[11px]'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {h.countdown}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHolidays;
