import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Megaphone,
  Calendar,
  User,
  Star,
  Download,
  Eye,
  CheckCircle2,
  Tag,
  Share2,
  X,
  Bell,
  Sparkles,
  Pin,
  Bookmark,
  Search,
  Filter,
  Users,
  Clock,
  FileText,
  AlertTriangle,
  Flame,
  Volume2,
  ArrowRight,
  ShieldCheck,
  Building2,
  HelpCircle,
  Paperclip,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { AnnouncementSkeleton } from '../../components/common/Skeleton';
import ModernSearchBarSection from '../../components/common/ModernSearchBarSection';
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

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Circulars' },
  { id: 'PINNED', label: 'Pinned & Urgent' },
  { id: 'EVENTS', label: 'Social & Events' },
  { id: 'POLICIES', label: 'HR Policies' },
  { id: 'BENEFITS', label: 'Benefits & Perks' },
  { id: 'MEETINGS', label: 'Meetings & Townhalls' },
  { id: 'OPERATIONS', label: 'Operations & IT' },
];

const EmployeeAnnouncements = () => {
  const [filter, setFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeDateRange, setActiveDateRange] = useState('ALL');
  const [heroIndex, setHeroIndex] = useState(0);

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
  const [announcements, setAnnouncements] = useState(() => {
    const cached = api.getCached('/announcements')?.data?.announcements;
    if (Array.isArray(cached)) {
      return cached.map((item) => ({
        ...item,
        categoryLabel: getCategoryLabel(item.category),
        readTime: `${Math.max(1, Math.ceil((item.content?.length || 100) / 400))} min read`,
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recent',
        summary: item.summary || item.content?.slice(0, 140) + '...',
        author: item.author || 'People Operations & HR',
        department: item.department || 'Company-Wide (All Offices)',
      }));
    }
    return [];
  });
  const [loading, setLoading] = useState(() => !api.hasCached('/announcements'));
  const [selectedItem, setSelectedItem] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Sync live announcements from backend API
  const loadAnnouncements = async () => {
    if (!api.hasCached('/announcements')) {
      setLoading(true);
    }
    try {
      localStorage.removeItem('nexahr_notices_data');
      const res = await api.getAnnouncements();
      if (res?.success && Array.isArray(res.data?.announcements)) {
        const formatted = res.data.announcements.map((item) => ({
          ...item,
          categoryLabel: getCategoryLabel(item.category),
          readTime: `${Math.max(1, Math.ceil((item.content?.length || 100) / 400))} min read`,
          date: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Recent',
          summary: item.summary || item.content?.slice(0, 140) + '...',
          author: item.author || 'People Operations & HR',
          department: item.department || 'Company-Wide (All Offices)',
        }));
        setAnnouncements(formatted);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.warn('Live notices fetch notice:', err.message);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    window.addEventListener('nexahr_notification_updated', loadAnnouncements);
    return () => window.removeEventListener('nexahr_notification_updated', loadAnnouncements);
  }, []);

  const saveNoticesLocally = (newList) => {
    setAnnouncements(newList);
    localStorage.setItem('nexahr_notices_data', JSON.stringify(newList));
  };

  const togglePin = (id) => {
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, pinned: !a.pinned } : a
    );
    saveNoticesLocally(updated);
    const target = updated.find((a) => a.id === id);
    showToast(target?.pinned ? 'Notice pinned to top of board' : 'Notice unpinned');
  };

  const toggleAcknowledge = (id) => {
    const updated = announcements.map((a) => {
      if (a.id === id) {
        const nextState = !a.acknowledged;
        return {
          ...a,
          acknowledged: nextState,
          acknowledgedCount: nextState ? (a.acknowledgedCount || 0) + 1 : Math.max(0, (a.acknowledgedCount || 1) - 1),
        };
      }
      return a;
    });
    saveNoticesLocally(updated);
    const target = updated.find((a) => a.id === id);
    if (target?.acknowledged) {
      showToast('Circular officially acknowledged and verified in HR records.');
    } else {
      showToast('Acknowledgment status revoked.');
    }
  };

  const handleDownloadAttachment = (att) => {
    showToast(`Downloading attachment: ${att.name} (${att.size})...`);
  };

  // Dynamic Featured Hero Notices pool
  const heroCandidates = useMemo(() => {
    const pinnedOrHero = announcements.filter((a) => a.pinned || a.priority === 'HIGH');
    return pinnedOrHero.length > 0 ? pinnedOrHero : announcements;
  }, [announcements]);

  // Current active dynamic hero notice
  const heroNotice = useMemo(() => {
    if (!heroCandidates || heroCandidates.length === 0) return null;
    const safeIndex = ((heroIndex % heroCandidates.length) + heroCandidates.length) % heroCandidates.length;
    return heroCandidates[safeIndex];
  }, [heroCandidates, heroIndex]);

  const handleNextHero = () => {
    setHeroIndex((prev) => (prev + 1) % heroCandidates.length);
  };

  const handlePrevHero = () => {
    setHeroIndex((prev) => (prev - 1 + heroCandidates.length) % heroCandidates.length);
  };

  // Sort & Date options
  const sortOptions = [
    { key: 'date', label: 'Sort: Date' },
    { key: 'priority', label: 'Sort: Priority' },
    { key: 'title', label: 'Sort: Title' },
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

  // Filtered & sorted notices for main list
  const filteredNotices = useMemo(() => {
    let list = announcements.filter((item) => {
      // Category filter
      if (filter === 'PINNED') {
        if (!item.pinned && item.priority !== 'HIGH') return false;
      } else if (filter !== 'ALL') {
        if (item.category !== filter) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchAuthor = item.author?.toLowerCase().includes(q);
        const matchSummary = item.summary?.toLowerCase().includes(q);
        const matchDept = item.department?.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchSummary && !matchDept) return false;
      }

      let matchesDate = true;
      if (activeDateRange === 'THIS_MONTH') {
        const itemDate = new Date(item.date || item.createdAt || Date.now());
        const now = new Date();
        matchesDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (activeDateRange === 'LAST_30_DAYS') {
        const itemDate = new Date(item.date || item.createdAt || Date.now()).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        matchesDate = itemDate >= thirtyDaysAgo;
      }

      return matchesDate;
    });

    list.sort((a, b) => {
      let valA, valB;
      if (activeSort === 'date') {
        valA = new Date(a.date || a.createdAt || 0).getTime();
        valB = new Date(b.date || b.createdAt || 0).getTime();
      } else if (activeSort === 'priority') {
        const pMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
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
  }, [announcements, filter, searchQuery, activeDateRange, activeSort, sortOrder]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORY_TABS.forEach((cat) => {
      if (cat.id === 'ALL') {
        counts[cat.id] = announcements.length;
      } else if (cat.id === 'PINNED') {
        counts[cat.id] = announcements.filter((a) => a.pinned || a.priority === 'HIGH').length;
      } else {
        counts[cat.id] = announcements.filter((a) => a.category === cat.id).length;
      }
    });
    return counts;
  }, [announcements]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <EmployeePageHeader
        title="Company Notice Board"
        subtitle="Official executive circulars, policy amendments, benefits alerts, and corporate memos."
        onRefresh={loadAnnouncements}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. FULLY DYNAMIC HERO SPOTLIGHT BANNER WITH LIVE CONTROLS */}
      {/* ========================================================================= */}
      {heroNotice && (
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-5 sm:p-8 shadow-soft border border-sky-200/80 dark:border-sky-800/50 text-slate-900 dark:text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Column: Spotlight details */}
            <div className="space-y-3.5 flex-1 min-w-0">
              {heroCandidates.length > 1 && (
                <div className="flex items-center gap-1 w-fit bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 mb-2">
                  <button
                    onClick={handlePrevHero}
                    title="Previous Notice"
                    className="p-1 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold px-1 text-slate-300">
                    {(((heroIndex % heroCandidates.length) + heroCandidates.length) % heroCandidates.length) + 1} / {heroCandidates.length}
                  </span>
                  <button
                    onClick={handleNextHero}
                    title="Next Notice"
                    className="p-1 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {heroNotice.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
                {heroNotice.summary}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
                <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span>{heroNotice.department}</span>
                </span>
                <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span>{heroNotice.readTime}</span>
                </span>
                {heroNotice.totalTargetCount ? (
                  <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span>{heroNotice.acknowledgedCount || 0} / {heroNotice.totalTargetCount} Acknowledged</span>
                  </span>
                ) : heroNotice.acknowledged ? (
                  <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span>Acknowledged</span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Right Column: Hero Interactive Actions Card */}
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[240px] sm:min-w-[270px] shrink-0 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/50 dark:border-sky-800/40">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">Full Official Memo</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Read complete itinerary & attachments</div>
              </div>

              <div className="w-full space-y-2 pt-1">
                <button
                  onClick={() => setSelectedItem(heroNotice)}
                  className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <span>Read Full Notice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => toggleAcknowledge(heroNotice.id)}
                  className={`w-full px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    heroNotice.acknowledged
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/50 font-bold'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${heroNotice.acknowledged ? 'text-sky-400' : 'text-slate-300'}`} />
                  <span>{heroNotice.acknowledged ? 'Acknowledged' : 'Acknowledge Notice'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODERN DYNAMIC SEARCH & CATEGORY FILTER COMMAND BAR */}
      {/* ========================================================================= */}
      <ModernSearchBarSection
        statusTabs={CATEGORY_TABS.map((cat) => ({
          key: cat.id,
          label: cat.label.replace(' All', ''),
          count: categoryCounts[cat.id] ?? 0,
        }))}
        activeStatus={filter}
        onStatusChange={(newFilter) => {
          setFilter(newFilter);
          const matchIdx = heroCandidates.findIndex(
            (a) => newFilter === 'ALL' || a.category === newFilter
          );
          if (matchIdx !== -1) setHeroIndex(matchIdx);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search circulars by keyword, department, author..."
        searchHint="category:events"
        filterTags={
          filter !== 'ALL' && !['PINNED', 'EVENTS', 'BENEFITS'].includes(filter)
            ? [{ key: 'category', label: `cat: ${filter.toLowerCase()}` }]
            : []
        }
        onRemoveTag={(tag) => {
          if (tag.key === 'category') setFilter('ALL');
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
        filterCount={filter !== 'ALL' ? 1 : 0}
        filterContent={
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Filter by Category
              </span>
              {filter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setFilter('ALL')}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {CATEGORY_TABS.map((cat) => {
                const isSelected = filter === cat.id;
                const count = categoryCounts[cat.id] ?? 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setFilter(cat.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isSelected
                          ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
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
      />

      {/* ========================================================================= */}
      {/* 3. CLEAN FULL-WIDTH NOTICES LIST */}
      {/* ========================================================================= */}
      <div className="w-full space-y-4">
        {loading ? (
          <AnnouncementSkeleton count={4} />
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-6 sm:p-7 shadow-soft border transition-all duration-300 hover:shadow-md ${
                item.pinned
                  ? 'bg-gradient-to-r from-amber-500/5 via-sky-500/5 to-white dark:to-[#1E293B] border-amber-200/80 dark:border-amber-900/50'
                  : 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Header Row: Category Badge + Date + Author Info */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned && (
                      <span className="inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60">
                        <span>PINNED</span>
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        item.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60'
                          : item.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60'
                          : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60'
                      }`}
                    >
                      {item.categoryLabel || item.category}
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                    <span className="text-[11px] text-slate-400 font-medium">• By <strong className="text-slate-700 dark:text-slate-300">{item.author}</strong> ({item.department})</span>
                  </div>

                  {/* Notice Title */}
                  <h3
                    onClick={() => setSelectedItem(item)}
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors leading-snug"
                  >
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-5xl">
                    {item.summary}
                  </p>

                  {/* Attachments Chips if present */}
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {item.attachments.map((att, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleDownloadAttachment(att)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700/60"
                        >
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span>{att.name}</span>
                          <span className="text-[9px] text-slate-400">({att.size})</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bottom Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read Full Notice</span>
                      </button>

                      <button
                        onClick={() => toggleAcknowledge(item.id)}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          item.acknowledged
                            ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200'
                            : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-500'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${item.acknowledged ? 'text-sky-600' : 'text-slate-400'}`} />
                        <span>{item.acknowledged ? 'Acknowledged' : 'Acknowledge Notice'}</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.acknowledgedCount || 0} of {item.totalTargetCount || 160} employees acknowledged
                    </span>
                  </div>
                </div>

                {/* Pin / Star Action Button */}
                <button
                  onClick={() => togglePin(item.id)}
                  title={item.pinned ? 'Unpin Notice' : 'Pin Notice to Top'}
                  className={`p-2.5 rounded-2xl transition-all cursor-pointer shrink-0 ${
                    item.pinned
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 scale-110 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500'
                  }`}
                >
                  <Star className={`w-4 h-4 ${item.pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
              <Megaphone className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {announcements.length === 0 ? 'No Announcements Published Yet' : 'No matching circulars found'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {announcements.length === 0
                ? 'There are currently no official company notices or circulars posted by HR.'
                : 'Try adjusting your search terms or switch category filters to view other company announcements.'}
            </p>
            {announcements.length > 0 && (
              <button
                onClick={() => {
                  setFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-sky-600 text-white text-xs font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. FULL NOTICE READ MODAL (ENTERPRISE LETTERHEAD LAYOUT) */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl shadow-sky-950/20 dark:shadow-black/60 border border-sky-200/70 dark:border-sky-800/50 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-200/50 dark:border-sky-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-sky-50/90 via-sky-50/70 to-slate-50/60 dark:from-sky-950/80 dark:via-slate-900/70 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-600 to-sky-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-600/30 ring-4 ring-sky-100/70 dark:ring-sky-950/60">
                  <Megaphone className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-100/80 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60">
                      {selectedItem.categoryLabel || selectedItem.category}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{selectedItem.date}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
                    {selectedItem.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                    Issued by <strong className="text-slate-800 dark:text-slate-100 font-bold">{selectedItem.author}</strong> • {selectedItem.authorRole} ({selectedItem.department})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                {selectedItem.content || selectedItem.summary}
              </div>

              {/* Attachments Section */}
              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-sky-500" />
                    <span>Attached Documents & Forms:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedItem.attachments.map((att, aIdx) => (
                      <div
                        key={aIdx}
                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs shadow-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">{att.name}</span>
                        <button
                          onClick={() => handleDownloadAttachment(att)}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 sm:px-7 py-3.5 border-t border-sky-100/60 dark:border-sky-900/40 flex items-center justify-between gap-3 bg-white/40 dark:bg-slate-900/40 shrink-0">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Official NexaHR Enterprise Broadcast
              </span>
              <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    toggleAcknowledge(selectedItem.id);
                    setSelectedItem((prev) => ({ ...prev, acknowledged: !prev.acknowledged }));
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                    selectedItem.acknowledged
                      ? 'bg-sky-600 text-white shadow-sky-600/20'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedItem.acknowledged ? 'Acknowledged' : 'Mark as Acknowledged'}</span>
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAnnouncements;
