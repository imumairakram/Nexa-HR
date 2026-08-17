import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  Globe,
  Sliders,
  Check,
  Grid,
  List,
  PartyPopper,
  Info,
  CalendarRange,
} from 'lucide-react';
import { useRegionalSettings } from '../../../context/RegionalSettingsContext';
import {
  getYearHolidays,
  getAvailableYears,
  addCustomHoliday,
  deleteCustomHoliday,
  getCustomHolidays,
} from '../../../utils/holidayEngine';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PublicHoliday = () => {
  const { timezone, dateFormat, timeFormat, formatTime, formatDate } = useRegionalSettings();

  const currentYearNow = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL'); // 'ALL' or 1..12

  // Custom Holiday Form State
  const [form, setForm] = useState({
    name: '',
    date: `${selectedYear}-08-25`,
    type: 'Gazetted National',
    isLongWeekend: true,
    recurringYearly: false,
    description: '',
  });

  // Re-sync form date when year changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      date: `${selectedYear}-08-14`,
    }));
  }, [selectedYear]);

  // Load enriched holidays dynamically for the chosen year and timezone
  const [holidaysRefreshKey, setHolidaysRefreshKey] = useState(0);

  useEffect(() => {
    const handleHolidaysUpdate = () => {
      setHolidaysRefreshKey((k) => k + 1);
    };

    window.addEventListener('nexahr_holidays_updated', handleHolidaysUpdate);
    window.addEventListener('nexahr_regional_settings_updated', handleHolidaysUpdate);
    return () => {
      window.removeEventListener('nexahr_holidays_updated', handleHolidaysUpdate);
      window.removeEventListener('nexahr_regional_settings_updated', handleHolidaysUpdate);
    };
  }, []);

  const allHolidays = useMemo(() => {
    return getYearHolidays(selectedYear, timezone, dateFormat);
  }, [selectedYear, timezone, dateFormat, holidaysRefreshKey]);

  // Filter holidays by search, category, and month
  const filteredHolidays = useMemo(() => {
    return allHolidays.filter((h) => {
      // Category filter
      if (categoryFilter === 'NATIONAL' && !h.type.includes('National')) return false;
      if (categoryFilter === 'RELIGIOUS' && !h.type.includes('Religious')) return false;
      if (categoryFilter === 'CUSTOM' && !h.isCustom) return false;

      // Month filter
      if (selectedMonth !== 'ALL' && h.month !== Number(selectedMonth)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = h.name.toLowerCase().includes(query);
        const matchType = h.type.toLowerCase().includes(query);
        const matchDay = h.day.toLowerCase().includes(query);
        const matchDate = h.displayDate.toLowerCase().includes(query);
        if (!matchName && !matchType && !matchDay && !matchDate) return false;
      }

      return true;
    });
  }, [allHolidays, categoryFilter, selectedMonth, searchQuery]);

  const availableYears = useMemo(() => getAvailableYears(), []);

  const stats = useMemo(() => {
    const total = allHolidays.length;
    const upcoming = allHolidays.filter((h) => h.status === 'UPCOMING' || h.status === 'ACTIVE_TODAY').length;
    const gazettedCount = allHolidays.filter((h) => !h.isCustom).length;
    const activeToday = allHolidays.find((h) => h.status === 'ACTIVE_TODAY');
    return { total, upcoming, gazettedCount, activeToday };
  }, [allHolidays]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;

    addCustomHoliday({
      name: form.name.trim(),
      date: form.date,
      type: form.type,
      isLongWeekend: form.isLongWeekend,
      recurringYearly: form.recurringYearly,
      description: form.description.trim() || 'Company Recognized Holiday',
    });

    setIsAddOpen(false);
    setToastMsg(`Holiday "${form.name}" successfully added to ${selectedYear} calendar!`);
    setForm({
      name: '',
      date: `${selectedYear}-08-14`,
      type: 'Gazetted National',
      isLongWeekend: true,
      recurringYearly: false,
      description: '',
    });
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleDelete = (id) => {
    deleteCustomHoliday(id);
    setToastMsg('Custom holiday removed from calendar.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Official Gazetted Public Holidays & Calendar"
        subtitle="Dynamic multi-year holiday schedule synchronized in real-time with regional timezone and organizational policies."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. REGIONAL TIMEZONE SYNCHRONIZATION BANNER */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900 text-white border border-blue-700/40 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Live Timezone Connected</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-white">
              {timezone} • Format: <span className="font-mono">{dateFormat}</span>
            </h4>
            <p className="text-[11px] text-slate-300 font-medium">
              Holiday dates and active status dynamically adjust when timezone changes in Settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <Link
            to="/app/settings"
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 hover:scale-105"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Settings</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC YEAR SELECTOR & CONTROLS TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Year Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedYear === yr
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {yr} {yr === currentYearNow ? '• Now' : ''}
            </button>
          ))}
        </div>

        {/* Right: View Mode + Add Custom Holiday Button */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              onClick={() => setViewMode('list')}
              title="Table List View"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              title="12-Month Calendar Grid View"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Holiday</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. YEAR SUMMARY METRICS CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {selectedYear} Total Holidays
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total} Days</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Remaining in {selectedYear}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.upcoming} Days</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Official Gazetted
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.gazettedCount} Days</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Status Today
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate max-w-[130px]">
              {stats.activeToday ? stats.activeToday.name : 'Standard Working Day'}
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs ${
              stats.activeToday
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {stats.activeToday ? 'OFF' : 'WORK'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SEARCH & CATEGORY FILTER PILLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${selectedYear} holidays by title, day, or type...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex-wrap w-full md:w-auto">
            {[
              { id: 'ALL', label: 'All Holidays' },
              { id: 'NATIONAL', label: 'National' },
              { id: 'RELIGIOUS', label: 'Religious' },
              { id: 'CUSTOM', label: 'Custom Company' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Month Quick Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedMonth('ALL')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
              selectedMonth === 'ALL'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            All Months (12)
          </button>
          {MONTH_NAMES.map((mName, idx) => {
            const mNum = idx + 1;
            const countInMonth = allHolidays.filter((h) => h.month === mNum).length;
            return (
              <button
                key={mNum}
                onClick={() => setSelectedMonth(String(mNum))}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  selectedMonth === String(mNum)
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{mName.substring(0, 3)}</span>
                {countInMonth > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      selectedMonth === String(mNum) ? 'bg-white text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {countInMonth}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. VIEW MODE: TABULAR LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Official Gazetted & Corporate Calendar — Year {selectedYear}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Showing {filteredHolidays.length} observances calculated for timezone {timezone}
              </p>
            </div>
          </div>

          {filteredHolidays.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">No holidays match the selected filter or search query for {selectedYear}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Holiday Title</th>
                    <th className="py-3.5 px-4">Date ({dateFormat})</th>
                    <th className="py-3.5 px-4">Day of Week</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Live Status</th>
                    <th className="py-3.5 px-4">Countdown</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHolidays.map((h) => (
                    <tr
                      key={h.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        h.status === 'ACTIVE_TODAY' ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{h.name}</span>
                          {h.isCustom && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                              Custom
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {h.displayDate}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">{h.day}</td>
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
                      <td className="py-4 px-4">
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            h.status === 'ACTIVE_TODAY'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : h.status === 'UPCOMING'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {h.countdown}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {h.isCustom ? (
                          <button
                            onClick={() => handleDelete(h.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove Custom Holiday"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Gazetted</span>
                        )}
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
      {/* 6. VIEW MODE: 12-MONTH INTERACTIVE CALENDAR GRID */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MONTH_NAMES.map((monthName, mIdx) => {
              const monthNum = mIdx + 1;
              const daysInMonth = new Date(selectedYear, monthNum, 0).getDate();
              const firstDayOfWeek = new Date(selectedYear, mIdx, 1).getDay(); // 0 = Sun, 1 = Mon...
              const monthHolidays = allHolidays.filter((h) => h.month === monthNum);

              return (
                <div
                  key={monthName}
                  className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    {/* Month Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{monthName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
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
                      {/* Empty cells before month start */}
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-7" />
                      ))}

                      {/* Day cells */}
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
                                ? 'bg-emerald-500 text-white shadow-xs font-black'
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
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ADD CUSTOM HOLIDAY MODAL */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Custom Holiday</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Holiday Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Company Foundation Day"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Holiday Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Category Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Gazetted National">Gazetted National</option>
                    <option value="Gazetted Religious">Gazetted Religious</option>
                    <option value="Company Recognized">Company Recognized Holiday</option>
                    <option value="Bank Holiday">Bank Holiday</option>
                    <option value="Optional Holiday">Optional / Festive Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Notes / Description</label>
                <input
                  type="text"
                  placeholder="Optional details or employee instructions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={form.recurringYearly}
                    onChange={(e) => setForm({ ...form, recurringYearly: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Recur annually on this date every year</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
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
