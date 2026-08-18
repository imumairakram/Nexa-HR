import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Annual Company Leadership Summit & Innovation Retreat 2026',
    category: 'EVENTS',
    categoryLabel: 'Social & Events',
    priority: 'HIGH',
    urgencyLevel: 'CRITICAL',
    isHero: true,
    pinned: true,
    author: 'Sarah Jenkins',
    authorRole: 'VP of People & Culture',
    department: 'Executive Office',
    date: 'Aug 14, 2026',
    timeAgo: '2 days ago',
    readTime: '3 min read',
    summary:
      'All employees and engineering leads are cordially invited to the NexaHR 2026 Annual Leadership & Innovation Summit at the Serena Hills Resort. Please confirm attendance and dietary preferences before August 25.',
    content: `We are thrilled to announce the NexaHR Annual Company Leadership & Innovation Retreat 2026!

### Event Overview
- **Dates**: September 18 – September 21, 2026
- **Venue**: Serena Mountain Lodge & Conference Center
- **Theme**: *Scaling Autonomous Workflows & Human-Centric AI*

### Travel & Accommodations
All travel arrangements, flights, accommodation, and curated meals will be covered by the company. Transportation shuttles will depart from Islamabad HQ and Karachi Regional Hub on Friday morning.

### Key Highlights
1. Keynote by Executive Leadership on FY27 Roadmap.
2. Engineering Hackathon with live deployment showcase.
3. Team-building outdoor excursions and annual gala banquet.

Please review the attached itinerary and submit your RSVP by clicking the attendance toggle below.`,
    attachments: [
      { name: 'Retreat_Itinerary_2026.pdf', size: '2.4 MB', type: 'PDF' },
      { name: 'Rooming_And_Flight_Schedule.xlsx', size: '840 KB', type: 'XLSX' },
    ],
    acknowledged: false,
    acknowledgedCount: 142,
    totalTargetCount: 160,
  },
  {
    id: 'ann-2',
    title: 'Policy Update: Biometric Station Synchronization & Grace Minutes',
    category: 'POLICIES',
    categoryLabel: 'HR Policies',
    priority: 'HIGH',
    urgencyLevel: 'IMPORTANT',
    isHero: true,
    pinned: true,
    author: 'Tariq Mehmood',
    authorRole: 'Head of People Operations',
    department: 'Human Resources',
    date: 'Aug 12, 2026',
    timeAgo: '4 days ago',
    readTime: '2 min read',
    summary:
      'Effective September 1st, morning biometric attendance check-in window includes a 15-minute grace period (09:00 AM – 09:15 AM PKT). Employees clocking in beyond grace period will trigger automated late arrival flags.',
    content: `Dear Team,

In accordance with our updated enterprise attendance guidelines, the management has revised the biometric clock-in parameters across all turnstiles and facial recognition gates.

### Summary of Adjustments
- **Standard Working Shift**: 09:00 AM – 05:30 PM (8.5 Hours)
- **Morning Grace Window**: 09:00 AM – 09:15 AM
- **Automated Late Threshold**: Check-ins between 09:16 AM and 10:00 AM will be categorized as Late Presence.
- **Half-Day Threshold**: Clock-ins after 10:30 AM will automatically count as a Half-Day presence unless backed by an approved time-off request.

Please acknowledge this memo to verify that you have read and understood the shift parameters.`,
    attachments: [
      { name: 'Attendance_Shift_Policy_v3.2.pdf', size: '1.1 MB', type: 'PDF' },
    ],
    acknowledged: true,
    acknowledgedCount: 158,
    totalTargetCount: 160,
  },
  {
    id: 'ann-3',
    title: 'Annual Corporate Health & Group Life Insurance Renewal (2026–2027)',
    category: 'BENEFITS',
    categoryLabel: 'Benefits & Perks',
    priority: 'MEDIUM',
    urgencyLevel: 'NORMAL',
    isHero: false,
    pinned: false,
    author: 'Ayesha Siddiqui',
    authorRole: 'Senior Benefits Specialist',
    department: 'Compensation & Benefits',
    date: 'Aug 08, 2026',
    timeAgo: '1 week ago',
    readTime: '4 min read',
    summary:
      'Open enrollment window for corporate health cards, OPD allowance tier upgrades, and dependent additions is now active. Submit family updates on the self-service portal by August 30.',
    content: `Dear Colleagues,

Our annual health insurance coverage with Jubilee Life & Allianz Care is up for policy renewal for the 2026-2027 financial term.

### Enhanced Coverage Highlights
- **In-Patient Hospitalization**: Limit enhanced to PKR 1,500,000 per family member.
- **Maternity Benefit**: Increased to PKR 350,000.
- **OPD Annual Ceiling**: Enhanced across all employment grades by 18%.
- **Dental & Optical Rider**: Available for enrollment during this window.

Please submit any spouse or newborn dependent CNIC/B-Form documents to HR operations before the cut-off date.`,
    attachments: [
      { name: 'Insurance_Benefit_Summary_2026.pdf', size: '3.8 MB', type: 'PDF' },
      { name: 'Hospital_Panel_List_Pakistan.pdf', size: '4.2 MB', type: 'PDF' },
    ],
    acknowledged: false,
    acknowledgedCount: 98,
    totalTargetCount: 160,
  },
  {
    id: 'ann-4',
    title: 'Scheduled Cloud ERP & Biometric Turnstile Infrastructure Maintenance',
    category: 'MAINTENANCE',
    categoryLabel: 'IT & Infrastructure',
    priority: 'MEDIUM',
    urgencyLevel: 'NOTICE',
    isHero: false,
    pinned: false,
    author: 'Zainab Qureshi',
    authorRole: 'DevOps & SecOps Lead',
    department: 'Engineering & IT',
    date: 'Aug 04, 2026',
    timeAgo: '12 days ago',
    readTime: '1 min read',
    summary:
      'Routine security patch upgrade on primary database clusters and hardware turnstiles will take place on Saturday, Aug 22 from 11:00 PM to 03:00 AM PKT. Offline punch logging will remain active.',
    content: `IT Infrastructure Notice:

A scheduled maintenance window will be carried out this Saturday night to upgrade our PostgreSQL database clusters, SSL certificates, and biometric hardware gateway endpoints.

### Expected Impact
- Self-service portal will be in maintenance mode for approximately 40 minutes.
- Biometric turnstiles will operate in offline caching mode. All physical badge punches will auto-sync once server connections resume.

No action is required from employees.`,
    attachments: [],
    acknowledged: true,
    acknowledgedCount: 155,
    totalTargetCount: 160,
  },
  {
    id: 'ann-5',
    title: 'Townhall Notice: Q3 Strategy Roadmap & AI Tooling Rollout',
    category: 'MEETINGS',
    categoryLabel: 'Meetings & All-Hands',
    priority: 'HIGH',
    urgencyLevel: 'IMPORTANT',
    isHero: true,
    pinned: false,
    author: 'Executive Leadership Team',
    authorRole: 'C-Suite Broadcast',
    department: 'Corporate Communications',
    date: 'Aug 01, 2026',
    timeAgo: '2 weeks ago',
    readTime: '2 min read',
    summary:
      'Join the global team for our live Q3 Townhall on August 28th at 04:00 PM PKT. Agenda covers product milestone demos, regional expansions, and open floor employee Q&A.',
    content: `All personnel are invited to the Q3 Global Townhall.

### Agenda
- **04:00 PM**: Welcome & CEO Strategic Keynote
- **04:20 PM**: Product Demo: NexaHR v3 AI Autonomous Engine
- **04:45 PM**: Employee Recognition & Long Service Awards
- **05:00 PM**: Live Open Mic Q&A with Senior Management

Submit your anonymous questions via the Helpdesk portal prior to Thursday noon.`,
    attachments: [
      { name: 'Townhall_Q3_Agenda.pdf', size: '650 KB', type: 'PDF' },
    ],
    acknowledged: false,
    acknowledgedCount: 130,
    totalTargetCount: 160,
  },
];

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Circulars' },
  { id: 'PINNED', label: 'Pinned & Urgent' },
  { id: 'EVENTS', label: 'Social & Events' },
  { id: 'POLICIES', label: 'HR Policies' },
  { id: 'BENEFITS', label: 'Benefits & Perks' },
  { id: 'MEETINGS', label: 'Meetings & Townhalls' },
  { id: 'MAINTENANCE', label: 'IT & Infrastructure' },
];

const EmployeeAnnouncements = () => {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('nexahr_notices_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn(e);
      }
    }
    return DEFAULT_ANNOUNCEMENTS;
  });
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Sync live announcements from backend if available
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.getAnnouncements();
      if (res?.success && Array.isArray(res.data?.announcements) && res.data.announcements.length > 0) {
        const merged = res.data.announcements.map((backendItem, idx) => ({
          ...DEFAULT_ANNOUNCEMENTS[idx % DEFAULT_ANNOUNCEMENTS.length],
          ...backendItem,
          id: backendItem.id || `ann-server-${idx}`,
        }));
        setAnnouncements(merged);
        localStorage.setItem('nexahr_notices_data', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Live notices fetch notice:', err.message);
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

  // Filtered notices for main list
  const filteredNotices = useMemo(() => {
    return announcements.filter((item) => {
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
        return matchTitle || matchAuthor || matchSummary || matchDept;
      }

      return true;
    });
  }, [announcements, filter, searchQuery]);

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
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. FULLY DYNAMIC HERO SPOTLIGHT BANNER WITH LIVE CONTROLS */}
      {/* ========================================================================= */}
      {heroNotice && (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1b1536] via-[#16122d] to-[#0f172a] text-white p-6 sm:p-8 shadow-2xl border border-indigo-500/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

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

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
                {heroNotice.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg font-medium">
                {heroNotice.summary}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-semibold pt-1">
                <span className="flex items-center gap-1.5 text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-800/60">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{heroNotice.department}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{heroNotice.readTime}</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{heroNotice.acknowledgedCount} / {heroNotice.totalTargetCount} Acknowledged</span>
                </span>
              </div>
            </div>

            {/* Right Column: Hero Interactive Actions Card */}
            <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-700/60 shadow-2xl flex flex-col items-center text-center min-w-[240px] sm:min-w-[270px] shrink-0 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white">Full Official Memo</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Read complete itinerary & attachments</div>
              </div>

              <div className="w-full space-y-2 pt-1">
                <button
                  onClick={() => setSelectedItem(heroNotice)}
                  className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <span>Read Full Notice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => toggleAcknowledge(heroNotice.id)}
                  className={`w-full px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    heroNotice.acknowledged
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${heroNotice.acknowledged ? 'text-emerald-400' : 'text-slate-300'}`} />
                  <span>{heroNotice.acknowledged ? 'Acknowledged' : 'Acknowledge Notice'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SEARCH & CATEGORY FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars by keyword, department, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Showing <strong className="text-slate-900 dark:text-white">{filteredNotices.length}</strong> of {announcements.length} notices</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setFilter(cat.id);
                // Also jump hero index to first matching item in that category
                const matchIdx = heroCandidates.findIndex((a) => cat.id === 'ALL' || a.category === cat.id);
                if (matchIdx !== -1) setHeroIndex(matchIdx);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filter === cat.id
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xs scale-102'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              {cat.id === 'ALL' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {announcements.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CLEAN FULL-WIDTH NOTICES LIST */}
      {/* ========================================================================= */}
      <div className="w-full space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-6 sm:p-7 shadow-soft border transition-all duration-300 hover:shadow-md ${
                item.pinned
                  ? 'bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-white dark:to-[#1E293B] border-amber-200/80 dark:border-amber-900/50'
                  : 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Header Row: Category Badge + Date + Author Info */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60">
                        <Pin className="w-2.5 h-2.5" />
                        <span>PINNED</span>
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        item.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60'
                          : item.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60'
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
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug"
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
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700/60"
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
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read Full Notice</span>
                      </button>

                      <button
                        onClick={() => toggleAcknowledge(item.id)}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          item.acknowledged
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${item.acknowledged ? 'text-emerald-600' : 'text-slate-400'}`} />
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
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching circulars found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms or switch category filters to view other company announcements.
            </p>
            <button
              onClick={() => {
                setFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. FULL NOTICE READ MODAL (ENTERPRISE LETTERHEAD LAYOUT) */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                    {selectedItem.categoryLabel || selectedItem.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{selectedItem.date}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedItem.title}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Issued by <strong>{selectedItem.author}</strong> • {selectedItem.authorRole} ({selectedItem.department})
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-3 font-medium">
              {selectedItem.content || selectedItem.summary}
            </div>

            {/* Attachments Section */}
            {selectedItem.attachments && selectedItem.attachments.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Attached Documents & Forms:</div>
                <div className="space-y-1.5">
                  {selectedItem.attachments.map((att, aIdx) => (
                    <div
                      key={aIdx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{att.name}</span>
                      <button
                        onClick={() => handleDownloadAttachment(att)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                Official NexaHR Enterprise Broadcast
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleAcknowledge(selectedItem.id);
                    setSelectedItem((prev) => ({ ...prev, acknowledged: !prev.acknowledged }));
                  }}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    selectedItem.acknowledged
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedItem.acknowledged ? 'Acknowledged' : 'Mark as Acknowledged'}</span>
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
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
