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
  Trash2,
} from 'lucide-react';

const PAKISTAN_HOLIDAYS_ADMIN = [
  { id: 1, name: 'Kashmir Solidarity Day', date: 'Feb 05, 2026', day: 'Thursday', type: 'Gazetted National', isLongWeekend: false, status: 'PASSED' },
  { id: 2, name: 'Pakistan Day (Youm-e-Pakistan)', date: 'Mar 23, 2026', day: 'Monday', type: 'Gazetted National', isLongWeekend: true, status: 'PASSED' },
  { id: 3, name: 'Eid-ul-Fitr (Shawwal 1-3)', date: 'Mar 21 - 23, 2026', day: 'Sat - Mon', type: 'Gazetted Religious', isLongWeekend: true, status: 'PASSED' },
  { id: 4, name: 'Labour Day (May Day)', date: 'May 01, 2026', day: 'Friday', type: 'Gazetted National', isLongWeekend: true, status: 'PASSED' },
  { id: 5, name: 'Eid-ul-Adha (Zil-Hajj 10-12)', date: 'May 27 - 29, 2026', day: 'Wed - Fri', type: 'Gazetted Religious', isLongWeekend: true, status: 'PASSED' },
  { id: 6, name: 'Ashura (9th & 10th Muharram)', date: 'Jul 24 - 25, 2026', day: 'Fri - Sat', type: 'Gazetted Religious', isLongWeekend: true, status: 'PASSED' },
  { id: 7, name: 'Independence Day (Youm-e-Azadi)', date: 'Aug 14, 2026', day: 'Friday', type: 'Gazetted National', isLongWeekend: true, status: 'ACTIVE_TODAY' },
  { id: 8, name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: 'Aug 25, 2026', day: 'Tuesday', type: 'Gazetted Religious', isLongWeekend: false, status: 'UPCOMING' },
  { id: 9, name: 'Iqbal Day (Allama Iqbal Memorial)', date: 'Nov 09, 2026', day: 'Monday', type: 'Gazetted National', isLongWeekend: true, status: 'UPCOMING' },
  { id: 10, name: 'Quaid-e-Azam Day / Christmas', date: 'Dec 25, 2026', day: 'Friday', type: 'Gazetted National', isLongWeekend: true, status: 'UPCOMING' },
  { id: 11, name: 'Kashmir Solidarity Day 2027', date: 'Feb 05, 2027', day: 'Friday', type: 'Gazetted National', isLongWeekend: true, status: 'UPCOMING' },
  { id: 12, name: 'Pakistan Day 2027', date: 'Mar 23, 2027', day: 'Tuesday', type: 'Gazetted National', isLongWeekend: false, status: 'UPCOMING' },
];

const PublicHoliday = () => {
  const [holidays, setHolidays] = useState(PAKISTAN_HOLIDAYS_ADMIN);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    date: '2026-08-25',
    day: 'Tuesday',
    type: 'Gazetted Religious',
    isLongWeekend: false,
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
    setToastMsg(`Gazetted Holiday "${form.name}" added to calendar!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = (id) => {
    setHolidays(holidays.filter((h) => h.id !== id));
    setToastMsg('Holiday removed.');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = holidays.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Pakistan Gazetted Public Holiday Calendar (FY2026-2027)"
        subtitle="Manage official government holidays, religious observances, long weekends, and paid office closures."
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
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Gazetted Holidays</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{holidays.length} Days</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Upcoming Left</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {holidays.filter((h) => h.status === 'UPCOMING' || h.status === 'ACTIVE_TODAY').length} Days
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Long Weekends</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {holidays.filter((h) => h.isLongWeekend).length} Occasions
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Regional Authority</div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-1">Govt. of Pakistan</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
            PK
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Pakistan gazetted holidays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer shrink-0 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Holiday</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Gazetted Holiday</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Day</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span>{h.name}</span>
                      {h.isLongWeekend && (
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Long Weekend
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">{h.date}</td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{h.day}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {h.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        h.status === 'ACTIVE_TODAY'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : h.status === 'UPCOMING'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {h.status === 'ACTIVE_TODAY' ? 'Active Today' : h.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove Holiday"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Pakistan Gazetted Holiday</h3>
              </div>
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
                  placeholder="e.g. Shab-e-Barat or Provincial Holiday"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
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
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Classification *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Gazetted National">Gazetted National Holiday</option>
                    <option value="Gazetted Religious">Gazetted Religious Holiday</option>
                    <option value="Provincial Gazetted">Provincial Holiday</option>
                    <option value="Optional Holiday">Optional Holiday</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.isLongWeekend}
                  onChange={(e) => setForm({ ...form, isLongWeekend: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-bold text-slate-700 dark:text-slate-200">Creates a 3-Day Long Weekend</span>
              </label>

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
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Add Holiday
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
