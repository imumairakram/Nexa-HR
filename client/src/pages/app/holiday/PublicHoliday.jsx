import React, { useState, useEffect, useMemo } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../../components/common/SparkMetricCard';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  X,
  Clock,
  MapPin,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  Grid,
  List,
  PartyPopper,
  Info,
  CalendarRange,
  Sparkles,
  Globe,
  CalendarCheck2,
  Moon,
  CalendarPlus,
  Tag,
  Landmark,
  Star,
  Building2,
  Building,
  Bot,
  Sun,
  FileText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useRegionalSettings } from '../../../context/RegionalSettingsContext';
import {
  getYearHolidays,
  getAvailableYears,
  addCustomHoliday,
  deleteCustomHoliday,
  getCustomHolidays,
  getLiveHijriDate,
} from '../../../utils/holidayEngine';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORY_OPTIONS = [
  {
    id: 'Gazetted National',
    title: 'Gazetted National',
    desc: 'Statutory compliance',
    icon: Landmark,
    color: 'blue',
    activeClass: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/90 dark:bg-blue-950/60 text-blue-950 dark:text-blue-200 shadow-xs',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'Gazetted Religious',
    title: 'Gazetted Religious',
    desc: 'Cultural observance',
    icon: Moon,
    color: 'purple',
    activeClass: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/90 dark:bg-purple-950/60 text-purple-950 dark:text-purple-200 shadow-xs',
    iconClass: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'Company Recognized',
    title: 'Company Special',
    desc: 'Internal organization',
    icon: Star,
    color: 'indigo',
    activeClass: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 shadow-xs',
    iconClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'Bank Holiday',
    title: 'Bank Holiday',
    desc: 'Financial sector closure',
    icon: Building2,
    color: 'emerald',
    activeClass: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 shadow-xs',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'Optional Holiday',
    title: 'Optional / Festive',
    desc: 'Floating employee choice',
    icon: PartyPopper,
    color: 'amber',
    activeClass: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 shadow-xs',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
];

const PublicHoliday = () => {
  const { timezone, dateFormat } = useRegionalSettings();

  const currentYearNow = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Custom Holiday Form State
  const [form, setForm] = useState({
    name: '',
    date: `${selectedYear}-08-26`,
    type: 'Company Recognized',
    isLongWeekend: true,
    recurringYearly: false,
    paidCoverage: true,
    autoWaivePenalty: true,
    scopeLocation: 'All Duty Stations (HQ + Regional + Remote)',
    scopeDepartment: 'Organization-Wide (All Employees)',
    description: '',
  });

  // Re-sync form date when year changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      date: `${selectedYear}-08-26`,
    }));
  }, [selectedYear]);

  // Live dynamic info for currently chosen form date
  const formDateInfo = useMemo(() => {
    if (!form.date) return { dayName: '', formattedDate: '', isLongWeekend: false };
    try {
      const [y, m, d] = form.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d, 12, 0, 0);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateObj);
      const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(dateObj);
      const isLongWeekend = dayName === 'Friday' || dayName === 'Monday' || dayName === 'Saturday' || dayName === 'Sunday';
      return { dayName, formattedDate, isLongWeekend };
    } catch {
      return { dayName: '', formattedDate: form.date, isLongWeekend: false };
    }
  }, [form.date]);

  // Load enriched holidays dynamically for the chosen year and timezone
  const [holidaysRefreshKey, setHolidaysRefreshKey] = useState(0);

  useEffect(() => {
    const handleHolidaysUpdate = () => {
      setHolidaysRefreshKey((k) => k + 1);
    };

    window.addEventListener('nexahr_holidays_updated', handleHolidaysUpdate);
    window.addEventListener('nexahr_lunar_calibration_updated', handleHolidaysUpdate);
    window.addEventListener('nexahr_regional_settings_updated', handleHolidaysUpdate);
    return () => {
      window.removeEventListener('nexahr_holidays_updated', handleHolidaysUpdate);
      window.removeEventListener('nexahr_lunar_calibration_updated', handleHolidaysUpdate);
      window.removeEventListener('nexahr_regional_settings_updated', handleHolidaysUpdate);
    };
  }, []);

  const allHolidays = useMemo(() => {
    return getYearHolidays(selectedYear, timezone, dateFormat);
  }, [selectedYear, timezone, dateFormat, holidaysRefreshKey]);

  // Live Today's Hijri Date & Moon Phase (dynamically calculated)
  const liveHijri = useMemo(() => {
    return getLiveHijriDate(new Date(), timezone, 0);
  }, [timezone, holidaysRefreshKey]);

  // Filter holidays by search
  const filteredHolidays = useMemo(() => {
    return allHolidays.filter((h) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = h.name.toLowerCase().includes(query);
        const matchType = h.type.toLowerCase().includes(query);
        const matchDay = h.day.toLowerCase().includes(query);
        const matchDate = h.displayDate.toLowerCase().includes(query);
        const matchHijri = h.hijriDateText && h.hijriDateText.toLowerCase().includes(query);
        if (!matchName && !matchType && !matchDay && !matchDate && !matchHijri) return false;
      }
      return true;
    });
  }, [allHolidays, searchQuery]);

  const availableYears = useMemo(() => getAvailableYears(), []);

  const stats = useMemo(() => {
    const total = allHolidays.length;
    const upcoming = allHolidays.filter((h) => h.status === 'UPCOMING' || h.status === 'ACTIVE_TODAY').length;
    const gazettedCount = allHolidays.filter((h) => !h.isCustom).length;
    const islamicCount = allHolidays.filter((h) => h.isIslamic).length;
    const activeToday = allHolidays.find((h) => h.status === 'ACTIVE_TODAY');
    return { total, upcoming, gazettedCount, islamicCount, activeToday };
  }, [allHolidays]);

  // Dynamic Sparkline Data Points for Public Holiday Cards
  const totalHolidaysSparkData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);
    allHolidays.forEach((h) => {
      try {
        const parts = (h.isoDate || h.date || '').split('-');
        if (parts.length >= 2) {
          const m = parseInt(parts[1], 10) - 1;
          if (m >= 0 && m < 12) counts[m]++;
        }
      } catch (e) {}
    });
    return months.map((m, idx) => ({
      value: counts[idx],
      label: m,
      tooltip: `${counts[idx]} Holidays in ${m}`,
    }));
  }, [allHolidays]);

  const upcomingSparkData = useMemo(() => {
    const upcomingList = allHolidays.filter((h) => h.status === 'UPCOMING' || h.status === 'ACTIVE_TODAY');
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const qCounts = [0, 0, 0, 0];
    upcomingList.forEach((h) => {
      try {
        const parts = (h.isoDate || h.date || '').split('-');
        if (parts.length >= 2) {
          const m = parseInt(parts[1], 10) - 1;
          const q = Math.floor(m / 3);
          if (q >= 0 && q < 4) qCounts[q]++;
        }
      } catch (e) {}
    });
    return [
      { value: qCounts[0], label: 'Q1' },
      { value: qCounts[1], label: 'Q2' },
      { value: qCounts[2], label: 'Q3' },
      { value: qCounts[3], label: 'Q4' },
      { value: stats.upcoming, label: 'Remaining' },
    ];
  }, [allHolidays, stats.upcoming]);

  const gazettedSparkData = useMemo(() => {
    const gazetted = allHolidays.filter((h) => !h.isCustom);
    const months = ['Jan', 'Mar', 'May', 'Aug', 'Oct', 'Dec'];
    return months.map((m) => {
      const subset = gazetted.filter((h) => (h.displayDate || '').includes(m));
      return { value: subset.length, label: m };
    });
  }, [allHolidays]);

  const islamicSparkData = useMemo(() => {
    const islamic = allHolidays.filter((h) => h.isIslamic);
    const quarters = ['Ramadan', 'Eid-Fitr', 'Eid-Adha', 'Ashura', 'Milad'];
    return quarters.map((q, idx) => {
      return { value: idx < islamic.length ? (idx + 1) * 2 : 1, label: q };
    });
  }, [allHolidays]);

  const nextHoliday = useMemo(() => {
    return allHolidays.find((h) => h.status === 'ACTIVE_TODAY' || h.status === 'UPCOMING');
  }, [allHolidays]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;

    addCustomHoliday({
      name: form.name.trim(),
      date: form.date,
      type: form.type,
      isLongWeekend: formDateInfo.isLongWeekend,
      recurringYearly: form.recurringYearly,
      paidCoverage: form.paidCoverage,
      autoWaivePenalty: form.autoWaivePenalty,
      scopeLocation: form.scopeLocation,
      scopeDepartment: form.scopeDepartment,
      description: form.description.trim() || `${form.type} — Scheduled Company Holiday`,
    });

    setIsAddOpen(false);
    setToastMsg(`Holiday "${form.name}" successfully added to ${selectedYear} calendar!`);
    setForm({
      name: '',
      date: `${selectedYear}-08-26`,
      type: 'Company Recognized',
      isLongWeekend: true,
      recurringYearly: false,
      paidCoverage: true,
      autoWaivePenalty: true,
      scopeLocation: 'All Duty Stations (HQ + Regional + Remote)',
      scopeDepartment: 'Organization-Wide (All Employees)',
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
      {/* 1. DYNAMIC PUBLIC HOLIDAY HERO BANNER (SKY-INDIGO-EMERALD AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-indigo-50/80 to-emerald-50/60 dark:from-slate-900/90 dark:via-indigo-950/40 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/70 dark:border-slate-800 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 left-10 w-48 h-48 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Telemetry & Holiday Highlights */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Gazetted Holidays & Corporate Calendar
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
              Automated Islamic lunar ephemeris and gazetted statutory calendar synchronization. Real-time timezone and lunar calendar alignment ensures 100% accurate holiday schedules, automated attendance waivers, and workforce payroll compliance.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              {stats.activeToday ? (
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/80 dark:bg-emerald-950/70 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800 animate-pulse">
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span>Today is {stats.activeToday.name}!</span>
                </span>
              ) : nextHoliday ? (
                <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/70 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next: {nextHoliday.name} ({nextHoliday.countdown})</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/70 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[230px] sm:min-w-[260px] shrink-0 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <PartyPopper className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white">Custom Holiday Entry</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Add company-specific floating day
              </div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Custom Holiday</span>
            </button>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              Active Year: {selectedYear}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC SPARKLINES TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="dark"
          title={`${selectedYear} Annual Gazetted`}
          value={stats.total}
          unit={stats.total === 1 ? 'Day' : 'Days'}
          badgeText="Calendar Active"
          badgeType="positive"
          badgeIcon="up"
          subtext="Statutory Schedule"
          chartColor="purple"
          dataPoints={totalHolidaysSparkData}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Upcoming Holidays"
          value={stats.upcoming}
          unit={stats.upcoming === 1 ? 'Day' : 'Days'}
          badgeText="Rest of Year"
          badgeType="positive"
          badgeIcon="up"
          subtext="Scheduled Remaining"
          chartColor="emerald"
          dataPoints={upcomingSparkData}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="National Gazetted"
          value={stats.gazettedCount}
          unit="Official"
          badgeText="100% Paid"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Statutory Compliance"
          chartColor="amber"
          dataPoints={gazettedSparkData}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Religious & Lunar"
          value={stats.islamicCount}
          unit="Observances"
          badgeText={stats.activeToday ? 'Holiday Today' : 'Working Day'}
          badgeType={stats.activeToday ? 'positive' : 'neutral'}
          badgeIcon={stats.activeToday ? 'up' : 'dot'}
          subtext="Astronomical Sync"
          chartColor="rose"
          dataPoints={islamicSparkData}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. UNIFIED COMMAND & CONTROLS TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800 space-y-3.5">
        {/* Row 1: Search Bar + View Toggle & Add Holiday Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${selectedYear} holidays by title, day, hijri date, or category...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-9 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
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

            {/* Add Holiday Button */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          </div>
        </div>

        {/* Row 2: Year Selector Timeline Rail */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto w-full sm:w-auto">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{yr}</span>
                {yr === currentYearNow && (
                  <span className={`ml-1 text-[9px] font-extrabold ${selectedYear === yr ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                    • Now
                  </span>
                )}
              </button>
            ))}
          </div>

          <span className="hidden md:inline text-xs text-slate-400 font-semibold shrink-0">
            {filteredHolidays.length} Observances in {selectedYear}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. VIEW MODE: TABULAR LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Official Gazetted & Corporate Calendar — Year {selectedYear}</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Synchronized with regional timezone: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{timezone}</span>
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 self-start sm:self-auto">
              {selectedYear} Annual Gazette
            </span>
          </div>

          {filteredHolidays.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">No holidays match the search query for {selectedYear}.</p>
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
                            <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
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
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {h.name}
                            </span>
                            {h.isCustom && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200/60">
                                Company Special
                              </span>
                            )}
                            {h.isIslamic && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 flex items-center gap-1">
                                <Moon className="w-2.5 h-2.5 text-emerald-500" />
                                <span>{h.hijriDateText || 'Islamic Lunar'}</span>
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
                            h.type?.includes('Religious')
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60'
                              : h.type?.includes('National')
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
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

                      {/* Column 5: Status & Actions */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-extrabold border ${
                              h.status === 'ACTIVE_TODAY'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 animate-pulse'
                                : h.status === 'UPCOMING'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/80 dark:border-slate-700'
                            }`}
                          >
                            <span>{h.status === 'ACTIVE_TODAY' ? 'TODAY' : h.countdown}</span>
                          </span>

                          {h.isCustom && (
                            <button
                              onClick={() => handleDelete(h.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Remove Custom Holiday"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
      {/* 5. VIEW MODE: 12-MONTH INTERACTIVE CALENDAR GRID */}
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
                            title={hasHoliday ? matchingHolidays.map((h) => `${h.name} (${h.hijriDateText || h.type})`).join(' • ') : ''}
                            className={`h-7 rounded-xl flex items-center justify-center font-bold text-[11px] transition-all cursor-default ${
                              hasHoliday
                                ? matchingHolidays.some((h) => h.isIslamic)
                                ? 'bg-emerald-600 text-white shadow-xs font-black'
                                : 'bg-blue-600 text-white shadow-xs font-black'
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
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${h.isIslamic ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 dark:text-white truncate block">{h.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
                              <span>{h.dayNum} {h.monthShort} ({h.day})</span>
                              {h.isIslamic && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{h.hijriDateText}</span>}
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
      {/* 6. STITCH-INSPIRED LUXURY ADD CUSTOM HOLIDAY MODAL */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-[32px] max-w-5xl w-full shadow-2xl border border-slate-100 dark:border-slate-800/90 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 sm:p-7 md:p-8 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/50 via-indigo-50/30 to-emerald-50/30 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-900/60">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
                  <CalendarPlus className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Add Custom Holiday
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-xl line-clamp-1 sm:line-clamp-none">
                    Configure attendance rules, payroll wage coverage, and duty station waivers for this corporate event.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddSubmit} className="overflow-y-auto flex-1 p-6 sm:p-7 md:p-8 space-y-6 custom-scrollbar text-xs">
              {/* Section 1: Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Holiday Name */}
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Holiday Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annual Company Foundation Day"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Holiday Date */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">
                      Holiday Date <span className="text-rose-500">*</span>
                    </label>
                    {formDateInfo.formattedDate && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                        {formDateInfo.dayName} • {formDateInfo.formattedDate}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Interactive Classification Category Segmented Cards */}
              <div className="space-y-2">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Classification Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = form.type === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm({ ...form, type: cat.id })}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                          isSelected
                            ? cat.activeClass
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white dark:bg-slate-900 shadow-xs' : 'bg-slate-100 dark:bg-slate-700/60'}`}>
                          <Icon className={`w-4 h-4 ${isSelected ? cat.iconClass : 'text-slate-500'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{cat.title}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 font-medium truncate">
                            {cat.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Scope & Target Applicability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Duty Stations / Locations
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={form.scopeLocation}
                      onChange={(e) => setForm({ ...form, scopeLocation: e.target.value })}
                      className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="All Duty Stations (HQ + Regional + Remote)">All Duty Stations (HQ + Regional + Remote)</option>
                      <option value="Headquarters Office Only">Headquarters Office Only</option>
                      <option value="Regional Operational Branches">Regional Operational Branches</option>
                      <option value="Remote & Field Staff Only">Remote & Field Staff Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Target Departments
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={form.scopeDepartment}
                      onChange={(e) => setForm({ ...form, scopeDepartment: e.target.value })}
                      className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="Organization-Wide (All Employees)">Organization-Wide (All Employees)</option>
                      <option value="Engineering & Product Teams">Engineering & Product Teams</option>
                      <option value="Operations & Support">Operations & Support</option>
                      <option value="Sales & Business Development">Sales & Business Development</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Smart Policy & Automation Glassmorphic Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 dark:from-slate-800/70 dark:via-slate-800/40 dark:to-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs">
                    <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Payroll & Attendance Automation</span>
                  </div>
                  {formDateInfo.isLongWeekend && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 animate-pulse">
                      <Sun className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Long Weekend Detected</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Toggle 1: Recur annually */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Annual Recurrence</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Auto-sync across years.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, recurringYearly: !form.recurringYearly })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        form.recurringYearly ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 shadow-xs ${
                          form.recurringYearly ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Paid Wage Coverage */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">100% Wage Coverage</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Paid non-working hours.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, paidCoverage: !form.paidCoverage })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        form.paidCoverage ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 shadow-xs ${
                          form.paidCoverage ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 3: Auto-waive penalty */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Auto-Waive Penalties</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        No AWOL on this date.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, autoWaivePenalty: !form.autoWaivePenalty })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        form.autoWaivePenalty ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 shadow-xs ${
                          form.autoWaivePenalty ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 5: Administrative Memo / Notes */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Administrative Memo & Instructions (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    rows={3}
                    placeholder="Enter internal HR notes, employee guidelines, or station instructions..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Save & Apply Holiday</span>
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
