import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  Send,
  X,
  ChevronRight,
  ChevronDown,
  Shield,
  ShieldCheck,
  HelpCircle,
  Laptop,
  CreditCard,
  HeartHandshake,
  Building,
  Paperclip,
  Check,
  Zap,
  ArrowRight,
  Headphones,
  UserCheck,
  RotateCcw,
  Loader2,
  Eye,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import ModernSearchBarSection from '../../components/common/ModernSearchBarSection';
import { HelpdeskTicketSkeleton } from '../../components/common/Skeleton';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';
import { api } from '../../services/api';

const CATEGORY_OPTIONS = [
  { id: 'ALL', label: 'All Inquiries', icon: LifeBuoy },
  { id: 'IT_HARDWARE', label: 'IT & Equipment', icon: Laptop },
  { id: 'PAYROLL', label: 'Payroll & Tax', icon: CreditCard },
  { id: 'BENEFITS', label: 'Benefits & Insurance', icon: HeartHandshake },
  { id: 'WORKPLACE', label: 'Workplace & Admin', icon: Building },
  { id: 'GENERAL_HR', label: 'General HR', icon: HelpCircle },
];

const EmployeeHelpdesk = () => {
  const { formatDate } = useRegionalSettings();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeDateRange, setActiveDateRange] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);

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
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    category: 'IT_HARDWARE',
    priority: 'MEDIUM',
    description: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  /**
   * Format relative time or fallback to formatted date
   */
  const formatTimeDisplay = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return formatDate ? formatDate(date) : date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  /**
   * Load tickets from backend API
   */
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getMyTickets();
      if (res && res.data && res.data.tickets) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('Failed to load helpdesk tickets:', err);
      showToast('Could not load support tickets from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  /**
   * Create new ticket via API
   */
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      showToast('Please enter a ticket subject and description');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createTicket({
        subject: newTicketForm.subject.trim(),
        category: newTicketForm.category,
        priority: newTicketForm.priority,
        description: newTicketForm.description.trim(),
      });

      if (res && res.data) {
        setTickets((prev) => [res.data, ...prev]);
        setIsNewTicketOpen(false);
        setNewTicketForm({
          subject: '',
          category: 'IT_HARDWARE',
          priority: 'MEDIUM',
          description: '',
        });
        showToast(`Support Ticket #${res.data.id} created and dispatched to HR Ops!`);
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      showToast(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Post a reply to the live conversation thread
   */
  const handleSendReply = async (ticketId) => {
    if (!replyText.trim() || isReplying) return;

    try {
      setIsReplying(true);
      const res = await api.addTicketReply(ticketId, replyText.trim());

      if (res && res.data) {
        const newReply = res.data;

        // Update local ticket and list
        setTickets((prev) =>
          prev.map((t) => {
            if (t.id === ticketId || t.dbId === ticketId) {
              const updatedReplies = [...(t.replies || []), newReply];
              const updatedTicket = {
                ...t,
                lastUpdated: new Date().toISOString(),
                replies: updatedReplies,
              };
              if (selectedTicket && (selectedTicket.id === ticketId || selectedTicket.dbId === ticketId)) {
                setSelectedTicket(updatedTicket);
              }
              return updatedTicket;
            }
            return t;
          })
        );

        setReplyText('');
        showToast('Your message has been posted to the support thread.');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      showToast(err.message || 'Failed to send reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  /**
   * Toggle ticket status between RESOLVED and IN_PROGRESS
   */
  const handleToggleResolved = async (ticketId) => {
    if (isUpdatingStatus) return;

    const currentTicket = tickets.find((t) => t.id === ticketId || t.dbId === ticketId);
    if (!currentTicket) return;

    const nextStatus = currentTicket.status === 'RESOLVED' ? 'IN_PROGRESS' : 'RESOLVED';

    try {
      setIsUpdatingStatus(true);
      const res = await api.updateTicketStatus(ticketId, nextStatus);

      if (res && res.data) {
        const updatedTicket = res.data;
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId || t.dbId === ticketId ? updatedTicket : t))
        );
        setSelectedTicket(updatedTicket);
        showToast(
          nextStatus === 'RESOLVED'
            ? 'Ticket officially marked as RESOLVED.'
            : 'Ticket reopened for further review.'
        );
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
      showToast(err.message || 'Failed to update ticket status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /**
   * Filter tickets based on search, status, and category
   */
  // Sort & Date Options
  const sortOptions = [
    { key: 'date', label: 'Sort: Date' },
    { key: 'priority', label: 'Sort: Priority' },
    { key: 'id', label: 'Sort: Ticket ID' },
  ];

  const dateRangeOptions = [
    { key: 'ALL', label: 'All Time' },
    { key: 'THIS_WEEK', label: 'This Week' },
    { key: 'THIS_MONTH', label: 'This Month' },
  ];

  const dateRangeLabels = {
    ALL: 'All Time',
    THIS_WEEK: 'This Week',
    THIS_MONTH: 'This Month',
  };

  const filteredTickets = useMemo(() => {
    let list = tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.subject?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;

      let matchesDate = true;
      if (activeDateRange === 'THIS_WEEK') {
        const tDate = new Date(t.createdDate || t.createdAt || Date.now()).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        matchesDate = tDate >= sevenDaysAgo;
      } else if (activeDateRange === 'THIS_MONTH') {
        const tDate = new Date(t.createdDate || t.createdAt || Date.now());
        const now = new Date();
        matchesDate = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesStatus && matchesCat && matchesDate;
    });

    list.sort((a, b) => {
      let valA, valB;
      if (activeSort === 'date') {
        valA = new Date(a.createdDate || a.createdAt || 0).getTime();
        valB = new Date(b.createdDate || b.createdAt || 0).getTime();
      } else if (activeSort === 'priority') {
        const pMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        valA = pMap[a.priority] || 0;
        valB = pMap[b.priority] || 0;
      } else if (activeSort === 'id') {
        valA = (a.id || '').toLowerCase();
        valB = (b.id || '').toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [tickets, searchQuery, statusFilter, categoryFilter, activeDateRange, activeSort, sortOrder]);

  /**
   * Telemetry KPI statistics computed dynamically from real database records
   */
  const stats = useMemo(() => {
    const total = tickets.length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;

    // Real dynamic first-response SLA calculated from actual message timestamps
    const responseDeltas = [];
    tickets.forEach((t) => {
      if (t.replies && t.replies.length > 1) {
        const firstStaffReply = t.replies.find(
          (r) => r.userId !== t.userId
        );
        if (firstStaffReply && t.createdDate) {
          const created = new Date(t.createdDate).getTime();
          const replied = new Date(firstStaffReply.time).getTime();
          const diffMinutes = Math.max(0, (replied - created) / 60000);
          if (!isNaN(diffMinutes)) responseDeltas.push(diffMinutes);
        }
      }
    });

    let avgSlaText = 'Awaiting Logs';
    if (responseDeltas.length > 0) {
      const avgMin = responseDeltas.reduce((a, b) => a + b, 0) / responseDeltas.length;
      if (avgMin < 60) {
        avgSlaText = `${Math.max(1, Math.round(avgMin))}m Avg`;
      } else {
        avgSlaText = `${(avgMin / 60).toFixed(1)}h Avg`;
      }
    } else if (total > 0) {
      avgSlaText = '< 2.4h Target';
    }

    return {
      total,
      inProgress,
      resolved,
      avgSla: avgSlaText,
    };
  }, [tickets]);

  // Rolling 7-day chronological calendar windows for real time-series
  const last7Days = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ dateKey, dayLabel, dateObj: d });
    }
    return days;
  }, []);

  // 1. Total Tickets Sparkline (Real daily volume over last 7 days)
  const totalTicketsSparkData = useMemo(() => {
    return last7Days.map(({ dateKey, dayLabel }) => {
      const count = tickets.filter((t) => {
        const raw = t.createdDate ? new Date(t.createdDate).toISOString().split('T')[0] : '';
        return raw === dateKey;
      }).length;
      return {
        value: count,
        label: dayLabel,
        tooltip: `${dayLabel} (${dateKey}): ${count} Tickets Logged`,
      };
    });
  }, [tickets, last7Days]);

  // 2. Pending In Progress Sparkline (Category breakdown of active issues)
  const inProgressSparkData = useMemo(() => {
    const categories = [
      { id: 'IT_HARDWARE', label: 'IT' },
      { id: 'PAYROLL', label: 'Pay' },
      { id: 'BENEFITS', label: 'Ben' },
      { id: 'WORKPLACE', label: 'Adm' },
      { id: 'GENERAL_HR', label: 'HR' },
    ];
    return categories.map((cat) => {
      const count = tickets.filter(
        (t) => t.category === cat.id && (t.status === 'IN_PROGRESS' || t.status === 'OPEN')
      ).length;
      return {
        value: count,
        label: cat.label,
        tooltip: `${cat.id.replace('_', ' ')}: ${count} Active Inquiries`,
      };
    });
  }, [tickets]);

  // 3. Resolved Inquiries Sparkline (Real daily verified closures over last 7 days)
  const resolvedSparkData = useMemo(() => {
    return last7Days.map(({ dateKey, dayLabel }) => {
      const count = tickets.filter((t) => {
        if (t.status !== 'RESOLVED') return false;
        const raw = t.lastUpdated ? new Date(t.lastUpdated).toISOString().split('T')[0] : '';
        return raw === dateKey;
      }).length;
      return {
        value: count,
        label: dayLabel,
        tooltip: `${dayLabel}: ${count} Verified Solved`,
      };
    });
  }, [tickets, last7Days]);

  // 4. Priority breakdown sparkline
  const slaSparkData = useMemo(() => {
    const high = tickets.filter((t) => t.priority === 'HIGH').length;
    const med = tickets.filter((t) => t.priority === 'MEDIUM').length;
    const low = tickets.filter((t) => t.priority === 'LOW').length;
    const closed = tickets.filter((t) => t.status === 'RESOLVED').length;
    return [
      { value: high, label: 'High', tooltip: `High Priority: ${high} Tickets` },
      { value: med, label: 'Med', tooltip: `Medium Priority: ${med} Tickets` },
      { value: low, label: 'Low', tooltip: `Routine Low: ${low} Tickets` },
      { value: closed, label: 'Done', tooltip: `Total Solved: ${closed} Tickets` },
    ];
  }, [tickets]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <EmployeePageHeader
        title="Helpdesk & Support"
        subtitle="Submit inquiry tickets, track equipment requests, and resolve HR queries with dedicated operations specialists."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC HELPDESK HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-5 sm:p-8 shadow-soft border border-sky-200/80 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Telemetry Info */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Enterprise Resolution & Helpdesk Hub
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Submit support tickets for hardware equipment requisitions, payroll adjustments, benefit claims, or workplace amenities.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-sky-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span>{tickets.length} Registered Inquiries</span>
              </span>
              <span className="flex items-center bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-sky-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span>{stats.inProgress} Under Review</span>
              </span>
              <span className="flex items-center bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-sky-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span>{stats.resolved} Resolved</span>
              </span>
              <span className="flex items-center bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-sky-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span>SLA: {stats.avgSla}</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Need HR or IT Help?</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Direct ticket routing to specialists</div>
            </div>
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create New Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SPARKLINE KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Total Inquiries */}
        <SparkMetricCard
          variant="dark"
          title="Total Inquiries"
          value={stats.total}
          unit={stats.total === 1 ? 'Ticket' : 'Tickets'}
          badgeText={`${stats.total} Logged`}
          badgeType="positive"
          badgeIcon="up"
          subtext="Lifetime Support Records"
          chartColor="purple"
          presetWave="wave1"
          dataPoints={totalTicketsSparkData}
          loading={loading}
        />

        {/* Card 2: Light Card - Under Review */}
        <SparkMetricCard
          variant="light"
          title="Under Review"
          value={stats.inProgress}
          unit={stats.inProgress === 1 ? 'Ticket' : 'Tickets'}
          badgeText={stats.inProgress > 0 ? 'Action Needed' : 'All Clear'}
          badgeType={stats.inProgress > 0 ? 'warning' : 'positive'}
          badgeIcon={stats.inProgress > 0 ? 'dot' : 'up'}
          subtext="HR Ops Queue Processing"
          chartColor="coral"
          presetWave="wave2"
          dataPoints={inProgressSparkData}
          loading={loading}
        />

        {/* Card 3: Light Card - Resolved Issues */}
        <SparkMetricCard
          variant="light"
          title="Resolved Issues"
          value={stats.resolved}
          unit={stats.resolved === 1 ? 'Closed' : 'Closed'}
          badgeText={`${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 100}% Resolved`}
          badgeType="positive"
          badgeIcon="up"
          subtext="Verified & Closed Inquiries"
          chartColor="amber"
          presetWave="wave3"
          dataPoints={resolvedSparkData}
          loading={loading}
        />

        {/* Card 4: Light Card - Avg Response SLA */}
        <SparkMetricCard
          variant="light"
          title="Avg Response SLA"
          value={stats.avgSla}
          unit=""
          badgeText="Priority SLAs"
          badgeType="neutral"
          badgeIcon="dot"
          subtext="Dedicated HR & IT Support"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={slaSparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. MODERN DYNAMIC SEARCH & CATEGORY FILTER COMMAND BAR */}
      {/* ========================================================================= */}
      <ModernSearchBarSection
        statusTabs={[
          { key: 'ALL', label: 'All', count: tickets.length },
          { key: 'IN_PROGRESS', label: 'In Progress', count: tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length },
          { key: 'RESOLVED', label: 'Resolved', count: tickets.filter((t) => t.status === 'RESOLVED').length },
        ]}
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by ticket ID, subject, assignee..."
        searchHint="status:in_progress"
        filterTags={
          categoryFilter !== 'ALL'
            ? [{ key: 'category', label: `cat: ${CATEGORY_OPTIONS.find((c) => c.id === categoryFilter)?.label || categoryFilter}` }]
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
                Inquiry Categories
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
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const count =
                  cat.id === 'ALL'
                    ? tickets.length
                    : tickets.filter((t) => t.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        categoryFilter === cat.id
                          ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
            onClick={() => setIsNewTicketOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </button>
        }
      />

      {/* ========================================================================= */}
      {/* 4. ENTERPRISE TICKET LIST */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Support Inquiries & Service Log</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Direct enterprise resolution queue for hardware requisitions, payroll adjustments, and amenities
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {filteredTickets.length} Tickets Found
          </span>
        </div>

        {loading ? (
          <HelpdeskTicketSkeleton count={5} />
        ) : filteredTickets.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTickets.map((t) => (
              <div
                key={t.id || t.dbId}
                onClick={() => setSelectedTicket(t)}
                className="p-5 sm:p-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-black text-sky-600 dark:text-sky-400 group-hover:underline">
                      #{t.id}
                    </span>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                      {t.categoryLabel || t.category}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        t.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60'
                      }`}
                    >
                      {t.priority} Priority
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium">
                      Updated {formatTimeDisplay(t.lastUpdated)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      • Assigned: <strong className="text-slate-700 dark:text-slate-300">{t.assignedTo}</strong>
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                    {t.subject}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-4xl font-medium">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      t.status === 'RESOLVED'
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/40'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
                    }`}
                  >
                    <span>{t.status === 'RESOLVED' ? 'Resolved' : 'In Progress'}</span>
                  </span>

                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 text-center space-y-5">
            <div className="relative inline-flex">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500/10 via-sky-500/15 to-sky-500/20 dark:from-sky-500/20 dark:via-sky-500/20 dark:to-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/70 dark:border-sky-700/50 shadow-xl shadow-sky-500/10">
                <LifeBuoy className="w-10 h-10 stroke-[1.6]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                  ? 'No support tickets matched your search'
                  : 'Support Ticket Inbox is Empty'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                  ? 'No inquiry records match your active query or filters. Try clearing your search keywords or resetting filters.'
                  : 'You have not submitted any support tickets yet. Need help with hardware requisitions, payroll adjustments, benefit claims, or workplace amenities? Create an inquiry anytime.'}
              </p>
            </div>
            {(!searchQuery && statusFilter === 'ALL' && categoryFilter === 'ALL') ? (
              <div className="pt-2">
                <button
                  onClick={() => setIsNewTicketOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-700 hover:to-sky-700 text-white font-extrabold text-xs shadow-lg shadow-sky-600/25 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create New Support Ticket</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Search & Filters</span>
                </button>
              </div>
            )}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Fast First Response SLA</span>
              </span>
              <span className="flex items-center px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Direct Operations Routing</span>
              </span>
              <span className="flex items-center px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>End-to-End Resolution Tracking</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. TICKET LIVE CONVERSATION THREAD MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl shadow-rose-950/20 dark:shadow-black/60 border border-rose-200/70 dark:border-rose-800/50 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-200/50 dark:border-sky-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-sky-50/90 via-sky-50/60 to-cyan-50/40 dark:from-sky-950/40 dark:via-sky-950/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-700 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/30 ring-4 ring-sky-100/70 dark:ring-sky-950/60">
                  <LifeBuoy className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700/60">
                      #{selectedTicket.id}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                      {selectedTicket.categoryLabel || selectedTicket.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 border ${
                        selectedTicket.status === 'RESOLVED'
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/40'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedTicket.status === 'RESOLVED' ? 'bg-sky-500' : 'bg-amber-500 animate-ping'}`} />
                      {selectedTicket.status === 'RESOLVED' ? 'Resolved' : 'In Progress'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                    Assigned: <strong className="text-slate-800 dark:text-slate-100 font-bold">{selectedTicket.assignedTo}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-rose-50/30 dark:from-slate-800/50 dark:to-rose-950/20 border border-rose-100/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    Original Ticket Description
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatTimeDisplay(selectedTicket.createdDate)}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {selectedTicket.replies?.map((rep, idx) => {
                  const isMe = rep.sender?.includes('(You)') || rep.sender === 'You';
                  return (
                    <div
                      key={rep.id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold px-1">
                        <span>{rep.sender}</span>
                        <span>•</span>
                        <span>{formatTimeDisplay(rep.time)}</span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl max-w-lg text-xs leading-relaxed font-normal shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-xs shadow-rose-600/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/50'
                        }`}
                      >
                        {rep.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reply Bar & Action Footer */}
            <div className="px-6 sm:px-7 py-3.5 border-t border-rose-100/60 dark:border-rose-900/40 space-y-3 bg-white/40 dark:bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Type a message or response to the support specialist..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply(selectedTicket.id);
                  }}
                  disabled={isReplying}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 disabled:opacity-60 transition-all shadow-xs"
                />
                <button
                  onClick={() => handleSendReply(selectedTicket.id)}
                  disabled={!replyText.trim() || isReplying}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-rose-600/20"
                >
                  {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isReplying ? 'Sending...' : 'Reply'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => handleToggleResolved(selectedTicket.id)}
                  disabled={isUpdatingStatus}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 border shadow-xs ${
                    selectedTicket.status === 'RESOLVED'
                      ? 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
                      : 'bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60'
                  }`}
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : selectedTicket.status === 'RESOLVED' ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>
                    {isUpdatingStatus
                      ? 'Updating...'
                      : selectedTicket.status === 'RESOLVED'
                      ? 'Reopen Ticket'
                      : 'Mark as Resolved'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CREATE NEW SUPPORT TICKET MODAL (ENTERPRISE COMPACT HIGH-EFFICIENCY CARD) */}
      {/* ========================================================================= */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <main className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-4 sm:p-5 sm:px-6 transition-all max-h-[96vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <header className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-3 sm:mb-3.5" data-purpose="modal-header">
              <div className="flex items-center gap-3">
                {/* Glowing Icon Badge */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-[1px] shadow-md shadow-sky-500/20 flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[11px] bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
                    <LifeBuoy className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    Raise Support Ticket
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                    Direct routing to HR, IT & Operations specialists for fast resolution.
                  </p>
                </div>
              </div>

              {/* Close Action */}
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setIsNewTicketOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </header>

            {/* Form Section */}
            <form onSubmit={handleCreateTicket} className="space-y-3 sm:space-y-3.5" data-purpose="new-ticket-form">
              {/* Row 1: Ticket Details (Subject & Urgency / Priority) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" data-purpose="metadata-inputs">
                {/* Input: Ticket Subject */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase" htmlFor="ticket-subject">
                      <FileText className="w-3.5 h-3.5 mr-1 text-sky-500" />
                      Ticket Subject <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <span className="text-[10px] sm:text-[11px] font-mono font-medium text-slate-400">
                      {newTicketForm.subject.length}/100 chars
                    </span>
                  </div>
                  <input
                    id="ticket-subject"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. MacBook Pro external monitor flickering or Tax Form W-2 Inquiry"
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                    className="w-full h-9 sm:h-9.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 focus:outline-none"
                  />
                </div>

                {/* Input: Urgency & Priority */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                      <Zap className="w-3.5 h-3.5 mr-1 text-sky-500" />
                      Urgency & Priority <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <span className="text-[10px] sm:text-[11px] text-slate-400">Determines SLA queue</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 h-9 sm:h-9.5">
                    {[
                      { id: 'LOW', label: 'Low', badge: '24h SLA', color: 'blue' },
                      { id: 'MEDIUM', label: 'Medium', badge: '< 8h SLA', color: 'amber' },
                      { id: 'HIGH', label: 'High Priority', badge: '< 4h SLA', color: 'rose' },
                    ].map((p) => {
                      const isSelected = newTicketForm.priority === p.id;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => setNewTicketForm({ ...newTicketForm, priority: p.id })}
                          className={`h-full px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-between gap-1 text-left ${
                            isSelected
                              ? p.id === 'HIGH'
                                ? 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-xs ring-2 ring-rose-500/20'
                                : p.id === 'MEDIUM'
                                ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs ring-2 ring-amber-500/20'
                                : 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-bold shadow-xs ring-2 ring-sky-500/20'
                              : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                p.id === 'HIGH'
                                  ? 'bg-rose-500' + (isSelected ? ' animate-pulse' : '')
                                  : p.id === 'MEDIUM'
                                  ? 'bg-amber-500'
                                  : 'bg-sky-500'
                              }`}
                            />
                            <span className="text-[11px] sm:text-xs font-bold truncate">{p.label}</span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-medium opacity-70 hidden sm:inline shrink-0">
                            {p.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 2: Ticket Classification Cards */}
              <section data-purpose="classification-selector">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase flex items-center">
                    Ticket Classification <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">Select the operations area</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
                  {[
                    { id: 'IT_HARDWARE', label: 'IT & Equipment', desc: 'Hardware, software & access', icon: Laptop },
                    { id: 'PAYROLL', label: 'Payroll & Tax', desc: 'Salary, tax deductions & slips', icon: CreditCard },
                    { id: 'BENEFITS', label: 'Benefits & Health', desc: 'Insurance & perks', icon: HeartHandshake },
                    { id: 'WORKPLACE', label: 'Workplace & Admin', desc: 'Facilities & workstation', icon: Building },
                    { id: 'GENERAL_HR', label: 'General HR', desc: 'Policies & general queries', icon: HelpCircle },
                  ].map((cat) => {
                    const isSelected = newTicketForm.category === cat.id;
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewTicketForm({ ...newTicketForm, category: cat.id })}
                        className={`relative cursor-pointer flex flex-col p-2 sm:p-2.5 rounded-xl transition-all text-left group ${
                          isSelected
                            ? 'border-2 border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 shadow-xs ring-2 ring-sky-500/10'
                            : 'border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-xs'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                        <div
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center mb-1 transition-colors ${
                            isSelected
                              ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-sky-50 dark:group-hover:bg-sky-950/60 group-hover:text-sky-600 dark:group-hover:text-sky-400'
                          }`}
                        >
                          <CatIcon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-[11px] sm:text-xs font-bold leading-tight truncate ${
                            isSelected ? 'text-sky-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {cat.label}
                        </span>
                        <span
                          className={`text-[10px] mt-0.5 line-clamp-1 ${
                            isSelected ? 'font-medium text-sky-700/80 dark:text-sky-300/80' : 'text-slate-400'
                          }`}
                        >
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Row 3: Detailed Description & Live Ticket Routing Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Left: Detailed Request Description */}
                <section data-purpose="ticket-description">
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase" htmlFor="ticket-description">
                      <MessageSquare className="w-3.5 h-3.5 mr-1 text-sky-500" />
                      Detailed Request Description <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">Full context & specs</span>
                  </div>
                  <textarea
                    id="ticket-description"
                    rows={2}
                    required
                    placeholder="Please provide full details, error messages, asset tags, or required equipment specifications to help our team resolve this swiftly..."
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                    className="w-full h-20 sm:h-22 p-2.5 sm:p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 focus:outline-none resize-none leading-relaxed"
                  />
                </section>

                {/* Right: Live Ticket Summary & Routing Preview */}
                <section data-purpose="record-summary-preview">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                      <Eye className="w-3.5 h-3.5 mr-1 text-sky-500" />
                      Live Preview & Routing Card
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">Real-time summary</span>
                  </div>

                  <div className="h-20 sm:h-22 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-800/80 dark:to-slate-850/80 p-2.5 sm:p-3 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      {/* Category Icon Thumbnail */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                        <LifeBuoy className="w-5 h-5 stroke-[2]" />
                      </div>
                      {/* Metadata content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {newTicketForm.subject.trim() || 'Untitled Support Request'}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[9px] tracking-wider">
                            {CATEGORY_OPTIONS.find((c) => c.id === newTicketForm.category)?.label || newTicketForm.category}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-sky-600 dark:text-sky-400 font-medium text-[11px] truncate">
                            HR & Operations Queue
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Priority Pill */}
                    <div className="shrink-0 ml-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold border ${
                          newTicketForm.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : newTicketForm.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            newTicketForm.priority === 'HIGH'
                              ? 'bg-rose-500 animate-pulse'
                              : newTicketForm.priority === 'MEDIUM'
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                          }`}
                        />
                        <span>{newTicketForm.priority} Priority</span>
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer / Action Controls */}
              <footer className="pt-3 sm:pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3" data-purpose="modal-footer">
                {/* Routing Trust Note */}
                <div className="flex items-center text-[11px] text-slate-400 dark:text-slate-400 order-2 sm:order-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0" />
                  <span>Enterprise SLA tracking & automated operations escalation</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Ticket'}</span>
                  </button>
                </div>
              </footer>
            </form>
          </main>
        </div>
      )}
    </div>
  );
};

export default EmployeeHelpdesk;
