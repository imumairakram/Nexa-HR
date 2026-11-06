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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
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
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.subject?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

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
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC HELPDESK HERO BANNER (ROSE-LAVENDER LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-green-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-emerald-200/70 dark:border-emerald-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Telemetry Info */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Enterprise Resolution & Helpdesk Hub
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Submit support tickets for hardware equipment requisitions, payroll adjustments, benefit claims, or workplace amenities.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Zap className="w-3.5 h-3.5" />
                <span>Average First Response: {stats.avgSla}</span>
              </span>
              <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800/60">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{stats.inProgress} Active Tickets Under Review</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-emerald-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Need HR or IT Help?</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Direct ticket routing to specialists</div>
            </div>
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
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
      {/* 3. SEARCH & CATEGORY FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-3 transition-all">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Button with Dropdown Menu */}
          <div className="relative shrink-0" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setShowFilterMenu((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-2xs shrink-0 ${
                categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-emerald-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700/60'
              }`}
              title="Filter Tickets"
            >
              <Filter className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="hidden sm:inline">
                {categoryFilter !== 'ALL'
                  ? CATEGORY_OPTIONS.find((c) => c.id === categoryFilter)?.label || categoryFilter
                  : statusFilter !== 'ALL'
                  ? statusFilter === 'IN_PROGRESS'
                    ? 'In Progress'
                    : 'Resolved'
                  : 'Filter'}
              </span>
              <span className="inline sm:hidden">Filter</span>
              {categoryFilter !== 'ALL' || statusFilter !== 'ALL' ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              ) : (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    showFilterMenu ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Dropdown Menu */}
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2">
                <div className="flex items-center justify-between px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>Filter Tickets</span>
                  {(categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter('ALL');
                        setStatusFilter('ALL');
                        setShowFilterMenu(false);
                      }}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Status Section */}
                <div>
                  <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Status
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'IN_PROGRESS', label: 'In Progress' },
                      { id: 'RESOLVED', label: 'Resolved' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatusFilter(st.id)}
                        className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                          statusFilter === st.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Section */}
                <div>
                  <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </div>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
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
                          onClick={() => {
                            setCategoryFilter(cat.id);
                            setShowFilterMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            categoryFilter === cat.id
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">{cat.label}</span>
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              categoryFilter === cat.id
                                ? 'bg-emerald-200/60 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200'
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
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Bar */}
        {(searchQuery || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active:
              </span>
              {categoryFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                  <span>Cat: {CATEGORY_OPTIONS.find((c) => c.id === categoryFilter)?.label || categoryFilter}</span>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('ALL')}
                    className="hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                  <span>Status: {statusFilter === 'IN_PROGRESS' ? 'In Progress' : 'Resolved'}</span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className="hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                  <span className="truncate max-w-[150px]">"{searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. ENTERPRISE TICKET LIST */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Support Inquiries & Service Log
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Click any ticket card to open the live conversation thread and view staff replies
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
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 group-hover:underline">
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

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {t.subject}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-4xl font-medium">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      t.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
                    }`}
                  >
                    {t.status === 'RESOLVED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    )}
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
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No support tickets found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'Try adjusting your filters or search query.'
                : 'You have not raised any support tickets yet. Click "New Ticket" to get started.'}
            </p>
            {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
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
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-green-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-100/70 dark:ring-emerald-950/60">
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
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedTicket.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
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
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
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
      {/* 6. CREATE NEW SUPPORT TICKET MODAL (ULTRA PREMIUM THEMED DESIGN) */}
      {/* ========================================================================= */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl shadow-rose-950/15 dark:shadow-black/70 border border-rose-200/70 dark:border-rose-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-green-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30 ring-3 ring-emerald-100/80 dark:ring-emerald-950/60">
                  <LifeBuoy className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Raise Support Ticket
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Direct routing to HR, IT & Operations specialists for fast resolution.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-rose-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-rose-200/60 dark:hover:border-slate-700 relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateTicket} className="overflow-y-hidden flex-1 px-6 sm:px-7 py-5 space-y-4 text-xs bg-gradient-to-b from-white/40 via-emerald-50/15 to-teal-50/15 dark:from-transparent dark:via-emerald-950/10 dark:to-teal-950/10">
              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    Ticket Subject <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {newTicketForm.subject.length}/100 chars
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. MacBook Pro external monitor flickering or Tax Form W-2 Inquiry"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 outline-none transition-all shadow-xs text-xs"
                />
              </div>

              {/* Category Visual Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Category & Department <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Select the best matching area</span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {[
                    { id: 'IT_HARDWARE', label: 'IT & Equipment', icon: Laptop, desc: 'Hardware, software & access' },
                    { id: 'PAYROLL', label: 'Payroll & Tax', icon: CreditCard, desc: 'Salary, tax deductions & slips' },
                    { id: 'BENEFITS', label: 'Benefits & Health', icon: HeartHandshake, desc: 'Insurance & perks' },
                    { id: 'WORKPLACE', label: 'Workplace & Admin', icon: Building, desc: 'Facilities & workstation' },
                    { id: 'GENERAL_HR', label: 'General HR', icon: HelpCircle, desc: 'Policies & general queries' },
                  ].map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = newTicketForm.category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setNewTicketForm({ ...newTicketForm, category: cat.id })}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
                          isSelected
                            ? 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-white shadow-xs ring-1 ring-rose-500/30'
                            : 'bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-rose-50/40 dark:hover:bg-slate-800 hover:border-rose-300/80'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600'
                            }`}
                          >
                            <CatIcon className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-300 dark:ring-rose-800" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-tight">
                            {cat.label}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {cat.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selector (Interactive Chips) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Urgency & Priority <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Determines SLA queue</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'LOW', label: 'Low', badge: 'Standard 24h', color: 'blue' },
                    { id: 'MEDIUM', label: 'Medium', badge: 'Target < 8h', color: 'amber' },
                    { id: 'HIGH', label: 'High Priority', badge: 'Fast < 4h', color: 'rose' },
                  ].map((p) => {
                    const isSelected = newTicketForm.priority === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setNewTicketForm({ ...newTicketForm, priority: p.id })}
                        className={`py-2 px-3.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? p.id === 'HIGH'
                              ? 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-xs ring-1 ring-rose-500/30'
                              : p.id === 'MEDIUM'
                              ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs ring-1 ring-amber-500/30'
                              : 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs ring-1 ring-blue-500/30'
                            : 'bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/70 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.id === 'HIGH'
                                ? 'bg-rose-500' + (isSelected ? ' animate-pulse' : '')
                                : p.id === 'MEDIUM'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span>{p.label}</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-medium">
                          {p.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                    Detailed Request Description <span className="text-rose-500">*</span>
                  </span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Please provide full details, error messages, asset tags, or required equipment specifications to help our team resolve this swiftly..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 outline-none transition-all resize-none leading-relaxed shadow-xs text-xs"
                />
              </div>

              {/* Live Ticket Routing Preview */}
              <div className="px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-rose-200/70 dark:border-rose-800/60 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs border border-rose-200/60 dark:border-rose-800/60">
                    <LifeBuoy className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {newTicketForm.subject.trim() || 'Untitled Support Request'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span>{CATEGORY_OPTIONS.find((c) => c.id === newTicketForm.category)?.label || newTicketForm.category}</span>
                      <span>•</span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">HR Ops Queue</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      newTicketForm.priority === 'HIGH'
                        ? 'bg-rose-100/80 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : newTicketForm.priority === 'MEDIUM'
                        ? 'bg-amber-100/80 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-blue-100/80 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {newTicketForm.priority} Priority
                  </span>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-rose-100/80 dark:border-slate-800 gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-rose-50/60 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-600 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-rose-600/25 hover:shadow-rose-600/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Dispatch Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeHelpdesk;
