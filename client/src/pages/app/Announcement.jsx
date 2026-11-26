import React, { useState, useEffect, useMemo, useRef } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import ModernSearchBarSection from '../../components/common/ModernSearchBarSection';
import { AnnouncementSkeleton } from '../../components/common/Skeleton';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Star,
  Tag,
  Share2,
  Trash2,
  CheckCircle2,
  X,
  Eye,
  AlertCircle,
  Building,
  Bell,
  RefreshCw,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  FileText,
  Building2,
  Pin,
} from 'lucide-react';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';
import { api } from '../../services/api';

const getCategoryLabel = (cat) => {
  switch (cat) {
    case 'EVENTS':
      return 'Social & Events';
    case 'POLICIES':
      return 'HR Policies';
    case 'BENEFITS':
      return 'Benefits & Perks';
    case 'MEETINGS':
      return 'Meetings & Townhalls';
    case 'MAINTENANCE':
    case 'OPERATIONS':
      return 'Operations & IT';
    case 'CORPORATE':
      return 'Corporate Circular';
    default:
      return cat || 'General Notice';
  }
};

const Announcement = () => {
  const { formatDate } = useRegionalSettings();
  const [announcements, setAnnouncements] = useState(() => api.getCached('/announcements')?.data?.announcements || []);
  const [departments, setDepartments] = useState(() => api.getCached('/departments')?.data?.departments || []);
  const [loading, setLoading] = useState(() => !api.hasCached('/announcements'));
  const [submitting, setSubmitting] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeDateRange, setActiveDateRange] = useState('ALL');

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Post form state
  const [form, setForm] = useState({
    title: '',
    category: 'EVENTS',
    priority: 'HIGH',
    department: 'Company-Wide (All Offices)',
    summary: '',
    content: '',
    pinned: false,
  });

  const loadAnnouncements = async () => {
    if (!api.hasCached('/announcements')) {
      setLoading(true);
    }
    try {
      const [annRes, deptRes] = await Promise.allSettled([
        api.getAnnouncements(),
        api.getDepartments(),
      ]);
      if (annRes.status === 'fulfilled' && annRes.value?.success && annRes.value.data?.announcements) {
        setAnnouncements(annRes.value.data.announcements);
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
        setDepartments(deptRes.value.data.departments);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.createAnnouncement({
        title: form.title.trim(),
        category: form.category,
        priority: form.priority,
        department: form.department,
        summary: form.summary.trim() || form.content.slice(0, 140) + '...',
        content: form.content.trim(),
        pinned: form.pinned,
      });

      await loadAnnouncements();
      setIsPostModalOpen(false);
      setForm({
        title: '',
        category: 'EVENTS',
        priority: 'HIGH',
        department: 'Company-Wide (All Offices)',
        summary: '',
        content: '',
        pinned: false,
      });

      // Notify notification header to refresh immediately
      window.dispatchEvent(new Event('nexahr_notification_updated'));

      setToastMsg('Announcement published! Notifications and emails broadcasted to all employees.');
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      console.error('Error posting announcement:', err);
      setToastMsg(err.message || 'Failed to post announcement.');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePin = async (id, currentPinned) => {
    try {
      await api.updateAnnouncement(id, { pinned: !currentPinned });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, pinned: !currentPinned } : a))
      );
      setToastMsg(!currentPinned ? 'Announcement pinned to top.' : 'Announcement unpinned.');
      setTimeout(() => setToastMsg(''), 2000);
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setToastMsg('Announcement removed.');
      setTimeout(() => setToastMsg(''), 2500);
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  // Sort Options
  const sortOptions = [
    { key: 'date', label: 'Date' },
    { key: 'priority', label: 'Priority' },
    { key: 'title', label: 'Title' },
  ];

  const dateRangeOptions = [
    { key: 'ALL', label: 'All Time' },
    { key: 'THIS_MONTH', label: 'This Month' },
    { key: 'LAST_30_DAYS', label: 'Last 30 Days' },
  ];

  const dateRangeLabels = {
    ALL: 'All Time',
    THIS_MONTH: 'This Month',
    LAST_30_DAYS: 'Last 30 Days',
  };

  const filtered = useMemo(() => {
    let list = announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.department || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'PINNED' ? a.pinned : a.category === categoryFilter);

      let matchesDate = true;
      if (activeDateRange === 'THIS_MONTH') {
        const itemDate = new Date(a.date || a.createdAt || Date.now());
        const now = new Date();
        matchesDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (activeDateRange === 'LAST_30_DAYS') {
        const itemDate = new Date(a.date || a.createdAt || Date.now()).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        matchesDate = itemDate >= thirtyDaysAgo;
      }

      return matchesSearch && matchesCat && matchesDate;
    });

    list.sort((a, b) => {
      let valA, valB;
      if (activeSort === 'date') {
        valA = new Date(a.date || a.createdAt || 0).getTime();
        valB = new Date(b.date || b.createdAt || 0).getTime();
      } else if (activeSort === 'priority') {
        const pMap = { URGENT: 3, HIGH: 2, NORMAL: 1, LOW: 0 };
        valA = pMap[a.priority] || 0;
        valB = pMap[b.priority] || 0;
      } else if (activeSort === 'title') {
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [announcements, searchQuery, categoryFilter, activeDateRange, activeSort, sortOrder]);

  const stats = useMemo(() => ({
    total: announcements.length,
    pinned: announcements.filter((a) => a.pinned).length,
    events: announcements.filter((a) => a.category === 'EVENTS').length,
    benefits: announcements.filter((a) => a.category === 'BENEFITS').length,
  }), [announcements]);

  const categoryCounts = useMemo(() => ({
    ALL: announcements.length,
    PINNED: announcements.filter((a) => a.pinned).length,
    EVENTS: announcements.filter((a) => a.category === 'EVENTS').length,
    BENEFITS: announcements.filter((a) => a.category === 'BENEFITS').length,
    MEETINGS: announcements.filter((a) => a.category === 'MEETINGS').length,
  }), [announcements]);

  const bulletinsSparkData = useMemo(() => {
    const total = announcements.length;
    return [
      { value: Math.max(0, total - 4), label: 'Mon' },
      { value: Math.max(0, total - 3), label: 'Tue' },
      { value: Math.max(0, total - 2), label: 'Wed' },
      { value: Math.max(0, total - 2), label: 'Thu' },
      { value: Math.max(0, total - 1), label: 'Fri' },
      { value: Math.max(0, total), label: 'Sat' },
      { value: total, label: 'Today' },
    ];
  }, [announcements.length]);

  const pinnedSparkData = useMemo(() => {
    const count = stats.pinned;
    return [
      { value: Math.max(0, count - 1), label: 'Q1' },
      { value: Math.max(0, count - 1), label: 'Q2' },
      { value: count, label: 'Q3' },
      { value: count, label: 'Q4' },
      { value: count, label: 'Active' },
    ];
  }, [stats.pinned]);

  const eventsSparkData = useMemo(() => {
    const count = stats.events;
    return [
      { value: Math.max(0, count - 2), label: 'Jan' },
      { value: Math.max(0, count - 1), label: 'Mar' },
      { value: Math.max(0, count - 1), label: 'Jun' },
      { value: count, label: 'Sep' },
      { value: count, label: 'Dec' },
    ];
  }, [stats.events]);

  const benefitsSparkData = useMemo(() => {
    const count = stats.benefits;
    return [
      { value: Math.max(0, count - 1), label: 'Standard' },
      { value: Math.max(0, count - 1), label: 'Medical' },
      { value: count, label: 'Executive' },
      { value: count, label: 'Active' },
    ];
  }, [stats.benefits]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Company Announcements Board"
        subtitle="Publish official company circulars, policy changes, retreat notices, and executive broadcasts."
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC ANNOUNCEMENT HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-6 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Broadcast Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
              Company Announcements & Notice Board
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-lg font-medium">
              Publish official company circulars, organizational policy updates, team retreats, and executive broadcasts in real-time.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{stats.total} Circulars Published</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{stats.pinned} High-Priority Pinned</span>
              </span>
              {stats.events > 0 && (
                <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                  <span>{stats.events} Company Events</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Broadcast Bulletin</div>
              <div className="text-[11px] text-white/80 mt-0.5">Post to employee portal</div>
            </div>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="w-full px-5 py-2.5 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] dark:text-white font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Announcement</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC SPARKLINES TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="light"
          title="Total Bulletins"
          value={stats.total}
          unit={stats.total === 1 ? 'Notice' : 'Notices'}
          badgeText="Published"
          badgeType="positive"
          badgeIcon="up"
          subtext="Lifetime Broadcasts"
          chartColor="purple"
          dataPoints={bulletinsSparkData}
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Pinned Notices"
          value={stats.pinned}
          unit="Pinned"
          badgeText="Top Priority"
          badgeType="positive"
          badgeIcon="up"
          subtext="Feed Priority"
          chartColor="amber"
          dataPoints={pinnedSparkData}
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Events & Retreats"
          value={stats.events}
          unit="Events"
          badgeText="Gatherings"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Company Calendar"
          chartColor="emerald"
          dataPoints={eventsSparkData}
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Benefits & Policy"
          value={stats.benefits}
          unit="Policies"
          badgeText="HR Directives"
          badgeType="positive"
          badgeIcon="up"
          subtext="Handbook Updates"
          chartColor="rose"
          dataPoints={benefitsSparkData}
          loading={loading}
        />
      </div>

      {/* Modern Dynamic Search & Filtering Toolbar */}
      <ModernSearchBarSection
        statusTabs={[
          { key: 'ALL', label: 'All', count: categoryCounts.ALL },
          { key: 'PINNED', label: 'Pinned', count: categoryCounts.PINNED },
          { key: 'EVENTS', label: 'Events', count: categoryCounts.EVENTS },
          { key: 'BENEFITS', label: 'Benefits', count: categoryCounts.BENEFITS },
          { key: 'MEETINGS', label: 'Meetings', count: categoryCounts.MEETINGS },
        ]}
        activeStatus={categoryFilter}
        onStatusChange={setCategoryFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search circulars by title, keyword, or department..."
        searchHint="category:events"
        filterTags={
          categoryFilter !== 'ALL'
            ? [{ key: 'category', label: `category: ${categoryFilter.toLowerCase()}` }]
            : []
        }
        onRemoveTag={(tag) => {
          if (tag.key === 'category') setCategoryFilter('ALL');
        }}
        dateRangeLabel={dateRangeLabels[activeDateRange] || 'All Time'}
        dateRangeOptions={dateRangeOptions}
        activeDateRange={activeDateRange}
        onDateRangeChange={setActiveDateRange}
        sortOptions={sortOptions}
        activeSort={activeSort}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setActiveSort(key);
          setSortOrder(order);
        }}
        filterCount={categoryFilter !== 'ALL' ? 1 : 0}
        filterContent={
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Category Filter
              </span>
              {categoryFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ALL')}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1">
              {[
                { key: 'ALL', label: 'All Circulars', count: categoryCounts.ALL },
                { key: 'PINNED', label: 'Pinned Announcements', count: categoryCounts.PINNED },
                { key: 'EVENTS', label: 'Events & Functions', count: categoryCounts.EVENTS },
                { key: 'BENEFITS', label: 'HR Directives & Benefits', count: categoryCounts.BENEFITS },
                { key: 'MEETINGS', label: 'Meetings & Syncs', count: categoryCounts.MEETINGS },
              ].map(({ key, label, count }) => {
                const isSelected = categoryFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategoryFilter(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        }
        actionButton={
          <button
            type="button"
            onClick={() => setIsPostModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Circular</span>
          </button>
        }
      />

      {/* ANNOUNCEMENTS LIST */}
      {loading ? (
        <AnnouncementSkeleton count={3} />
      ) : (
        <div className="space-y-4">
          {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 border border-slate-200/90 dark:border-slate-800 hover:shadow-lg hover:shadow-sky-500/5 ${
                item.pinned
                  ? 'bg-gradient-to-br from-sky-50/40 via-white to-slate-50/30 dark:from-sky-950/20 dark:via-[#1E293B] dark:to-[#1E293B] shadow-xs'
                  : 'bg-white dark:bg-[#1E293B] shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Notice Icon Thumbnail */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    item.pinned
                      ? 'bg-gradient-to-tr from-sky-500 via-sky-500 to-cyan-500 text-white shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/60'
                      : 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60'
                  }`}
                >
                  <Megaphone className="w-5 h-5 stroke-[2.2]" />
                </div>

                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-[12px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-900 dark:border-white shadow-xs tracking-wider uppercase">
                        <Pin className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>PINNED</span>
                      </span>
                    )}

                    <span className="inline-flex items-center text-[10px] font-extrabold px-3 py-0.5 rounded-[12px] bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 uppercase tracking-wider">
                      {getCategoryLabel(item.category)}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                    <span className="text-xs text-slate-400 font-medium">• By <strong className="font-bold text-slate-900 dark:text-white">{item.author}</strong></span>
                  </div>

                  <h3
                    onClick={() => setSelectedNotice(item)}
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors leading-snug tracking-tight"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl font-normal">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => setSelectedNotice(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-xs font-bold border border-sky-200/80 dark:border-sky-800/80 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>Read Full Notice</span>
                    </button>
                    <span className="text-xs text-slate-400 font-medium">Broadcasted to employee portal</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePin(item.id, item.pinned)}
                    className={`p-2.5 rounded-[12px] transition-all cursor-pointer border ${
                      item.pinned
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/70 text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    title={item.pinned ? 'Unpin Notice' : 'Pin to Top'}
                  >
                    <Pin className={`w-4 h-4 ${item.pinned ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 sm:p-16 text-center space-y-5 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="relative inline-flex">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500/10 via-sky-500/15 to-sky-500/20 dark:from-sky-500/20 dark:via-sky-500/20 dark:to-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/70 dark:border-sky-700/50 shadow-xl shadow-sky-500/10">
                <Megaphone className="w-10 h-10 stroke-[1.6]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {searchQuery || categoryFilter !== 'ALL' || activeDateRange !== 'ALL'
                  ? 'No Matching Circulars Found'
                  : 'No Announcements Published Yet'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {searchQuery || categoryFilter !== 'ALL' || activeDateRange !== 'ALL'
                  ? 'No company announcements match your active search terms or category filter. Try clearing keywords or resetting filters.'
                  : 'There are currently no active company notices or circulars posted. Broadcast official updates, policy revisions, event announcements, and corporate townhall invitations to your workforce.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsPostModalOpen(true)}
                className="px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-600/25 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Post New Circular</span>
              </button>

              {(searchQuery || categoryFilter !== 'ALL' || activeDateRange !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('ALL');
                    setActiveDateRange('ALL');
                  }}
                  className="px-4 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Company-Wide Broadcast Routing</span>
              </span>
              <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Mandatory Read Receipts</span>
              </span>
              <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Priority Pinned Noticeboards</span>
              </span>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BROADCAST ANNOUNCEMENT (NEW TICKET CARD UI DESIGN) */}
      {/* ========================================================================= */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                  <Megaphone className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Broadcast Announcement
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Publish company circulars, executive updates, and operational memos to all employees.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-6">
              {/* Row 1: Title & Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-sky-500" />
                      Announcement Title <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      {form.title.length}/100 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Annual Company Retreat 2026 Announcement & Itinerary"
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-sky-500" />
                      Target Audience Scope
                    </label>
                  </div>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="Company-Wide (All Offices)">Company-Wide (All Offices)</option>
                    {departments.length > 0 ? (
                      departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Engineering & Product">Engineering & Product</option>
                        <option value="People & Operations">People & Operations</option>
                        <option value="Sales & Marketing">Sales & Marketing</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 2: Urgency Priority Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Urgency Priority
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'INFO', label: 'Info', hint: 'Bulletin' },
                    { id: 'MEDIUM', label: 'Medium', hint: 'Standard' },
                    { id: 'HIGH', label: 'High', hint: 'Urgent Alert' },
                  ].map((p) => {
                    const isSelected = form.priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, priority: p.id }))}
                        className={`py-2.5 px-3 rounded-[12px] border text-center transition-all cursor-pointer font-bold text-xs ${
                          isSelected
                            ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/25 ring-2 ring-sky-400/30'
                            : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                        }`}
                      >
                        <div className="font-extrabold">{p.label}</div>
                        <div className={`text-[10px] font-normal opacity-85 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                          {p.hint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Category Classification Interactive Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Category Classification <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-medium text-slate-400">
                    Select circular scope
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { id: 'EVENTS', label: 'Events & Social', icon: Calendar, hint: 'Townhalls, outings' },
                    { id: 'POLICIES', label: 'HR Policies', icon: ShieldCheck, hint: 'Rules, compliance' },
                    { id: 'BENEFITS', label: 'Benefits & Perks', icon: Tag, hint: 'Health, wellness' },
                    { id: 'OPERATIONS', label: 'Operations & IT', icon: Building2, hint: 'Systems, office' },
                    { id: 'CORPORATE', label: 'Corporate Circular', icon: FileText, hint: 'Executive memo' },
                  ].map((cat) => {
                    const isSelected = form.category === cat.id;
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
                        className={`relative p-3.5 rounded-[12px] border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                          isSelected
                            ? 'bg-sky-50/60 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/20 shadow-sm'
                            : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200 dark:ring-sky-900" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold leading-tight ${
                              isSelected
                                ? 'text-sky-700 dark:text-sky-300'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {cat.label}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {cat.hint}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Two-column Description & Live Preview Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      Detailed Circular Body <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Full announcement text, schedule of events, guidelines, links..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none shadow-inner"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-sky-500" />
                      Live Preview & Distribution Card
                    </label>
                    <span className="text-xs font-medium text-slate-400">
                      Real-time summary
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-sky-50/40 dark:from-slate-900/80 dark:via-slate-800/80 dark:to-sky-950/20 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3.5 min-h-[110px]">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {form.title || 'Untitled Announcement'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {getCategoryLabel(form.category)}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 truncate">
                          {form.department}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase ${
                            form.priority === 'HIGH'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : form.priority === 'MEDIUM'
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {form.priority} PRIORITY
                        </span>
                        {form.pinned && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-900 text-white dark:bg-white dark:text-slate-900 tracking-wide uppercase flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" />
                            PINNED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pin Switch Toggle Card */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Pin to Top of Notice Board</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Ensures all employees see this notice immediately upon portal login.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, pinned: !form.pinned })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    form.pinned ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 shadow-xs ${
                      form.pinned ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Guaranteed real-time broadcast & notification dispatch</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                        <span>Publish & Broadcast</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (NEW TICKET CARD STYLING) */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <main className="relative z-10 w-full max-w-2xl sm:max-w-3xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <header className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6" data-purpose="modal-header">
              <div className="flex items-center gap-4">
                {/* Glowing Icon Badge */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/25 flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
                    <Megaphone className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-[12px] bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 uppercase tracking-wider">
                      {selectedNotice.category || 'GENERAL'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedNotice.date}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug truncate">
                    {selectedNotice.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-normal truncate">
                    Issued by <strong className="font-semibold text-slate-700 dark:text-slate-200">{selectedNotice.author || 'System Administrator'}</strong> • {selectedNotice.department || 'Company-Wide (All Offices)'}
                  </p>
                </div>
              </div>

              {/* Close Action */}
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setSelectedNotice(null)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Modal Body */}
            <div className="space-y-6">
              {/* Notice Content Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                    Official Notice Memorandum
                  </label>
                  <span className="text-[11px] font-sans tabular-nums font-medium text-slate-400">
                    Broadcast ID #{selectedNotice.id}
                  </span>
                </div>
                <div className="w-full p-4 sm:p-5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line font-medium shadow-xs min-h-[90px]">
                  {selectedNotice.content}
                </div>
              </div>

              {/* Scope & Routing Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                    <Eye className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                    Broadcast Scope & Distribution Card
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Audience Scope</span>
                </div>

                <div className="h-24 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-800/80 dark:to-slate-850/80 p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                      <Building2 className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        Target Audience
                      </h4>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-medium truncate mt-0.5">
                        {selectedNotice.department || 'Company-Wide (All Offices)'}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[12px] text-[11px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      <span>{selectedNotice.priority || 'NORMAL'} Priority</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6" data-purpose="modal-footer">
              <div className="flex items-center text-xs text-slate-400 dark:text-slate-400 order-2 sm:order-1">
                <ShieldCheck className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                <span>Enterprise compliance broadcast & acknowledgement audit trail logged</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-[12px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow-md active:scale-[0.99] transition-all cursor-pointer"
                >
                  Close Notice
                </button>
              </div>
            </footer>
          </main>
        </div>
      )}
    </div>
  );
};

export default Announcement;
