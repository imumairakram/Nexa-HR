import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  X,
  Clock,
  MapPin,
} from 'lucide-react';

const INITIAL_HOLIDAYS = [
  { id: 1, name: "New Year's Day", date: 'Jan 01, 2026', day: 'Thursday', type: 'Mandatory Public', isLongWeekend: false, status: 'PASSED' },
  { id: 2, name: 'Martin Luther King Jr. Day', date: 'Jan 19, 2026', day: 'Monday', type: 'Federal Public', isLongWeekend: true, status: 'PASSED' },
  { id: 3, name: "Presidents' Day", date: 'Feb 16, 2026', day: 'Monday', type: 'Federal Public', isLongWeekend: true, status: 'PASSED' },
  { id: 4, name: 'Memorial Day', date: 'May 25, 2026', day: 'Monday', type: 'Federal Public', isLongWeekend: true, status: 'PASSED' },
  { id: 5, name: 'Juneteenth National Independence Day', date: 'Jun 19, 2026', day: 'Friday', type: 'Federal Public', isLongWeekend: true, status: 'PASSED' },
  { id: 6, name: 'Independence Day (Observed)', date: 'Jul 03, 2026', day: 'Friday', type: 'Federal Public', isLongWeekend: true, status: 'PASSED' },
  { id: 7, name: 'Labor Day', date: 'Sep 07, 2026', day: 'Monday', type: 'Federal Public', isLongWeekend: true, status: 'UPCOMING' },
  { id: 8, name: 'Veterans Day', date: 'Nov 11, 2026', day: 'Wednesday', type: 'Federal Public', isLongWeekend: false, status: 'UPCOMING' },
  { id: 9, name: 'Thanksgiving Day', date: 'Nov 26, 2026', day: 'Thursday', type: 'National Holiday', isLongWeekend: true, status: 'UPCOMING' },
  { id: 10, name: 'Day After Thanksgiving', date: 'Nov 27, 2026', day: 'Friday', type: 'Company Holiday', isLongWeekend: true, status: 'UPCOMING' },
  { id: 11, name: 'Christmas Day', date: 'Dec 25, 2026', day: 'Friday', type: 'National Holiday', isLongWeekend: true, status: 'UPCOMING' },
];

const PublicHoliday = () => {
  const [holidays, setHolidays] = useState(INITIAL_HOLIDAYS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    date: '2026-09-07',
    day: 'Monday',
    type: 'Company Holiday',
    isLongWeekend: true,
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newH = {
      id: Date.now(),
      name: form.name,
      date: new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      day: form.day,
      type: form.type,
      isLongWeekend: form.isLongWeekend,
      status: 'UPCOMING',
    };

    setHolidays([...holidays, newH]);
    setIsAddOpen(false);
    setToastMsg(`Holiday "${form.name}" added to calendar!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = holidays.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Public Holiday Calendar (FY2026)"
        subtitle="Manage official company holidays, federal observance dates, long weekends, and paid office closures."
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
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Holidays</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{holidays.length} Days</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Upcoming Left</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {holidays.filter((h) => h.status === 'UPCOMING').length} Days
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Long Weekends</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {holidays.filter((h) => h.isLongWeekend).length} Weekends
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Next Holiday</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">Labor Day (Sep 7)</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search holiday by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      {/* Holiday Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Holiday Name</th>
                <th className="py-3.5 px-4">Observed Date</th>
                <th className="py-3.5 px-4">Day of Week</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Long Weekend?</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                    {h.name}
                  </td>
                  <td className="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">
                    {h.date}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">{h.day}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {h.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {h.isLongWeekend ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                        🌴 3-Day Weekend
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Mid-Week Off</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        h.status === 'UPCOMING'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Holiday */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Public Holiday</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Holiday Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Founders Day Celebration"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Classification</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Company Holiday">Company Holiday</option>
                    <option value="Federal Public">Federal Public</option>
                    <option value="National Holiday">National Holiday</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="longWknd"
                  checked={form.isLongWeekend}
                  onChange={(e) => setForm({ ...form, isLongWeekend: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="longWknd" className="text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                  Creates a 3-day long weekend
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicHoliday;
