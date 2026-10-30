import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Shield,
  HelpCircle,
  Laptop,
  CreditCard,
  HeartHandshake,
  Building,
  Check,
  Zap,
  ArrowRight,
  UserCheck,
  RotateCcw,
  Loader2,
  User,
  Mail,
  UserCog,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
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

const PRIORITY_OPTIONS = [
  { id: 'ALL', label: 'All Priorities' },
  { id: 'HIGH', label: 'High Priority', color: 'rose' },
  { id: 'MEDIUM', label: 'Medium Priority', color: 'amber' },
  { id: 'LOW', label: 'Low Priority', color: 'slate' },
];

const Helpdesk = () => {
  const { formatDate } = useRegionalSettings();

  const [tickets, setTickets] = useState(() => api.getCached('/tickets')?.data?.tickets || []);
  const [employees, setEmployees] = useState(() => api.getCached('/employees')?.data?.employees || []);
  const [loading, setLoading] = useState(() => !api.hasCached('/tickets'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Editable fields in live modal
  const [editAssignee, setEditAssignee] = useState('');
  const [editPriority, setEditPriority] = useState('');

  // New ticket state for HR Ops
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    category: 'GENERAL_HR',
    priority: 'MEDIUM',
    description: '',
    employeeId: '',
    assignedTo: 'NexaHR Support Team',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
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
   * Fetch all tickets and employees from backend API
   */
  const loadData = useCallback(async (showSkeleton = true) => {
    try {
      if (showSkeleton && !api.hasCached('/tickets')) {
        setLoading(true);
      }
      const [ticketsRes, empRes] = await Promise.allSettled([
        api.getAllTickets(),
        api.getEmployees({ limit: 150 }),
      ]);

      if (ticketsRes.status === 'fulfilled' && ticketsRes.value?.data?.tickets) {
        setTickets(ticketsRes.value.data.tickets);
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        setEmployees(empRes.value.data.employees);
      }
    } catch (err) {
      console.error('Failed to load tickets/employees in admin helpdesk:', err);
      showToast('Could not refresh support tickets from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize modal selection when ticket updates in state
  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(
        (t) => t.id === selectedTicket.id || t.dbId === selectedTicket.dbId
      );
      if (updated) {
        setSelectedTicket(updated);
        setEditAssignee(updated.assignedTo || 'NexaHR Support Team');
        setEditPriority(updated.priority || 'MEDIUM');
      }
    }
  }, [tickets]);

  /**
   * Open modal and set active ticket
   */
  const handleOpenTicketDetails = (t) => {
    setSelectedTicket(t);
    setEditAssignee(t.assignedTo || 'NexaHR Support Team');
    setEditPriority(t.priority || 'MEDIUM');
    setReplyText('');
  };

  /**
   * Create new ticket via API (HR creation on behalf of employee/company)
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
        employeeId: newTicketForm.employeeId || undefined,
        assignedTo: newTicketForm.assignedTo.trim() || 'NexaHR Support Team',
      });

      if (res && res.data) {
        setTickets((prev) => [res.data, ...prev]);
        setIsNewTicketOpen(false);
        setNewTicketForm({
          subject: '',
          category: 'GENERAL_HR',
          priority: 'MEDIUM',
          description: '',
          employeeId: '',
          assignedTo: 'NexaHR Support Team',
        });
        showToast(`Support Ticket #${res.data.id} created and dispatched to operations queue!`);
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      showToast(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Post official reply to the conversation thread
   */
  const handleSendReply = async (ticketId) => {
    if (!replyText.trim() || isReplying) return;

    try {
      setIsReplying(true);
      const res = await api.addTicketReply(ticketId, replyText.trim());

      if (res && res.data) {
        const newReply = res.data;

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
        showToast('Official response sent to employee and logged in thread.');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      showToast(err.message || 'Failed to send reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  /**
   * Toggle or update ticket status (RESOLVED vs IN_PROGRESS)
   */
  const handleToggleResolved = async (ticketId, overrideStatus = null) => {
    if (isUpdatingStatus) return;

    const currentTicket = tickets.find((t) => t.id === ticketId || t.dbId === ticketId);
    if (!currentTicket) return;

    const nextStatus =
      overrideStatus || (currentTicket.status === 'RESOLVED' ? 'IN_PROGRESS' : 'RESOLVED');

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
            ? `Ticket #${updatedTicket.id} officially resolved. Notification dispatched to employee.`
            : `Ticket #${updatedTicket.id} reopened for active operations review.`
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
   * Save Assignee & Priority changes to backend database
   */
  const handleSaveMetaChanges = async (ticketId) => {
    if (!selectedTicket || isUpdatingMeta) return;

    try {
      setIsUpdatingMeta(true);
      const res = await api.updateTicketStatus(ticketId, selectedTicket.status, {
        assignedTo: editAssignee,
        priority: editPriority,
      });

      if (res && res.data) {
        const updatedTicket = res.data;
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId || t.dbId === ticketId ? updatedTicket : t))
        );
        setSelectedTicket(updatedTicket);
        showToast(`Ticket #${updatedTicket.id} assignment and priority updated!`);
      }
    } catch (err) {
      console.error('Error updating ticket settings:', err);
      showToast(err.message || 'Failed to save ticket settings.');
    } finally {
      setIsUpdatingMeta(false);
    }
  };

  /**
   * Filter tickets based on search, status, category, and priority
   */
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.subject?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.userName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesCat && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  /**
   * Telemetry KPI statistics computed dynamically from real database records
   */
  const stats = useMemo(() => {
    const total = tickets.length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    const highPriority = tickets.filter((t) => t.priority === 'HIGH' && t.status !== 'RESOLVED').length;
    const resolutionRate = total > 0 ? `${Math.round((resolved / total) * 100)}%` : '100%';

    // Real dynamic first-response SLA calculated from actual timestamps
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
      highPriority,
      resolutionRate,
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

  // 1. Total Tickets Sparkline (Real daily ticket volume over the last 7 days)
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

  // 2. Pending In Progress Sparkline (Real pending volume per category distribution)
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
  const prioritySparkData = useMemo(() => {
    const high = tickets.filter((t) => t.priority === 'HIGH').length;
    const med = tickets.filter((t) => t.priority === 'MEDIUM').length;
    const low = tickets.filter((t) => t.priority === 'LOW').length;
    const closed = tickets.filter((t) => t.status === 'RESOLVED').length;
    return [
      { value: high, label: 'High', tooltip: `Urgent Escalations: ${high} Tickets` },
      { value: med, label: 'Med', tooltip: `Medium Priority: ${med} Tickets` },
      { value: low, label: 'Low', tooltip: `Routine Low Priority: ${low} Tickets` },
      { value: closed, label: 'Done', tooltip: `Total Solved: ${closed} Tickets` },
    ];
  }, [tickets]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Helpdesk & Employee Support Desk"
        subtitle="Review employee support queries, reply to active technical threads, assign specialists, and resolve HR tickets."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC ADMIN HELPDESK HERO BANNER (ROSE-LAVENDER THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-purple-50/60 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-rose-200/70 dark:border-rose-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/15 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Telemetry Info */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Operations Support & Inquiry Resolution Command Center
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Manage enterprise support requests submitted by team members across IT hardware, payroll queries, leave adjustments, and workplace amenities.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold bg-rose-100/60 dark:bg-rose-950/60 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-800/60">
                <Zap className="w-3.5 h-3.5" />
                <span>Response SLA: {stats.avgSla}</span>
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold bg-purple-100/60 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800/60">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{stats.inProgress} Active Tickets Under Review</span>
              </span>
              {stats.highPriority > 0 && (
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold bg-amber-100/60 dark:bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800/60 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{stats.highPriority} Urgent Priority</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[260px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Employee Support Desk</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.resolutionRate} Resolution Compliance
              </div>
            </div>
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Operations Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SPARKLINE KPI METRIC CARDS (REAL DATABASE TIME-SERIES) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Total Inquiries */}
        <SparkMetricCard
          variant="dark"
          title="Total Employee Tickets"
          value={stats.total}
          unit={stats.total === 1 ? 'Ticket' : 'Tickets'}
          badgeText={`${stats.total} Logged`}
          badgeType="positive"
          badgeIcon="up"
          subtext="Lifetime Employee Submissions"
          chartColor="purple"
          presetWave="wave1"
          dataPoints={totalTicketsSparkData}
          loading={loading}
        />

        {/* Card 2: Light Card - Pending & Under Review */}
        <SparkMetricCard
          variant="light"
          title="Needs Resolution"
          value={stats.inProgress}
          unit={stats.inProgress === 1 ? 'Ticket' : 'Tickets'}
          badgeText={stats.inProgress > 0 ? 'Requires Action' : 'Queue Cleared'}
          badgeType={stats.inProgress > 0 ? 'warning' : 'positive'}
          badgeIcon={stats.inProgress > 0 ? 'dot' : 'up'}
          subtext="Active Inquiries Under Triage"
          chartColor="coral"
          presetWave="wave2"
          dataPoints={inProgressSparkData}
          loading={loading}
        />

        {/* Card 3: Light Card - Resolved Issues */}
        <SparkMetricCard
          variant="light"
          title="Resolved Inquiries"
          value={stats.resolved}
          unit={stats.resolved === 1 ? 'Closed' : 'Closed'}
          badgeText={`${stats.resolutionRate} Solved`}
          badgeType="positive"
          badgeIcon="up"
          subtext="Verified Solved by Support"
          chartColor="amber"
          presetWave="wave3"
          dataPoints={resolvedSparkData}
          loading={loading}
        />

        {/* Card 4: Light Card - Priority Distribution */}
        <SparkMetricCard
          variant="light"
          title="Priority Triage"
          value={stats.highPriority}
          unit={stats.highPriority === 1 ? 'Urgent' : 'Urgent'}
          badgeText={stats.avgSla}
          badgeType="neutral"
          badgeIcon="dot"
          subtext="Response SLA Benchmark"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={prioritySparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & CATEGORY FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket ID, employee, email, subject, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
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

          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-bold">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriorityFilter(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    priorityFilter === p.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Status Pills */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              {[
                { id: 'ALL', label: 'All Tickets' },
                { id: 'IN_PROGRESS', label: 'Under Review' },
                { id: 'RESOLVED', label: 'Resolved' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Reload Data Button */}
            <button
              onClick={() => loadData(false)}
              title="Refresh tickets from live database"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          {CATEGORY_OPTIONS.map((cat) => {
            const Icon = cat.icon;
            const count =
              cat.id === 'ALL'
                ? tickets.length
                : tickets.filter((t) => t.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  categoryFilter === cat.id
                    ? 'bg-sky-500 text-white dark:bg-sky-500 dark:text-white shadow-xs scale-102'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    categoryFilter === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ENTERPRISE TICKET LIST (ADMIN VIEW WITH REAL EMPLOYEE DOSSIER) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Employee Inquiries & Operations Service Queue
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Click any ticket card to open the conversation thread, reply to employee, and update resolution status
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
                onClick={() => handleOpenTicketDetails(t)}
                className="p-5 sm:p-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-black text-rose-600 dark:text-rose-400 group-hover:underline">
                      #{t.id}
                    </span>

                    {/* Employee Profile Tag */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                      {t.userAvatar ? (
                        <img
                          src={t.userAvatar}
                          alt={t.userName}
                          className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {(t.userName || 'E').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{t.userName || 'Employee'}</span>
                      {t.userEmail && (
                        <span className="text-slate-400 font-normal">({t.userEmail})</span>
                      )}
                    </div>

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
                      • Assigned: <strong className="text-slate-700 dark:text-slate-300">{t.assignedTo || 'NexaHR Support Team'}</strong>
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
                    {t.subject}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-4xl font-medium">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
                  {/* Status Toggle Shortcut */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleResolved(t.id);
                    }}
                    title="Click to toggle status"
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all hover:scale-105 ${
                      t.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100'
                    }`}
                  >
                    {t.status === 'RESOLVED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    )}
                    <span>{t.status === 'RESOLVED' ? 'Resolved' : 'In Progress'}</span>
                  </button>

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
              {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try adjusting your filters or search query.'
                : 'No employee support inquiries are currently registered in the database.'}
            </p>
            {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setPriorityFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold cursor-pointer transition-all shadow-sm shadow-sky-500/20"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. TICKET LIVE CONVERSATION & RESOLUTION MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl shadow-rose-950/20 dark:shadow-black/60 border border-rose-200/70 dark:border-rose-800/50 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-rose-200/50 dark:border-rose-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-purple-50/60 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30 ring-4 ring-rose-100/70 dark:ring-rose-950/60">
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
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <span>
                      Requester: <strong className="text-slate-800 dark:text-slate-100 font-bold">{selectedTicket.userName || 'Employee'}</strong> {selectedTicket.userEmail && `(${selectedTicket.userEmail})`}
                    </span>
                    <span>•</span>
                    <span>
                      Assigned: <strong className="text-slate-800 dark:text-slate-100 font-bold">{selectedTicket.assignedTo || 'NexaHR Support Team'}</strong>
                    </span>
                  </div>
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
              {/* Requester Dossier & Original Message */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-rose-50/30 dark:from-slate-800/50 dark:to-rose-950/20 border border-rose-100/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-rose-100/60 dark:border-slate-700/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {(selectedTicket.userName || 'E').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                      {selectedTicket.userName}
                    </span>
                    {selectedTicket.userEmail && (
                      <span className="text-[10px] text-slate-400">({selectedTicket.userEmail})</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatTimeDisplay(selectedTicket.createdDate)}
                  </span>
                </div>
                <div className="pt-0.5">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5 mb-1 text-rose-600 dark:text-rose-400">
                    <FileText className="w-3.5 h-3.5" />
                    Original Inquiry Description
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Thread of Responses */}
              <div className="space-y-3 pt-1">
                {selectedTicket.replies?.map((rep, idx) => {
                  const isSupportLead = rep.sender?.includes('(You)') || rep.user?.role === 'ADMIN' || rep.user?.role === 'HR_MANAGER';
                  return (
                    <div
                      key={rep.id || idx}
                      className={`flex flex-col ${isSupportLead ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold px-1">
                        <span className={isSupportLead ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {rep.sender}
                        </span>
                        <span>•</span>
                        <span>{formatTimeDisplay(rep.time)}</span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl max-w-lg text-xs leading-relaxed font-normal shadow-xs ${
                          isSupportLead
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

            {/* Official Response Composer Bar & Action Footer */}
            <div className="px-6 sm:px-7 py-3.5 border-t border-rose-100/60 dark:border-rose-900/40 space-y-3 bg-white/40 dark:bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  placeholder={`Write official support response to ${selectedTicket.userName || 'the employee'}...`}
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
                  <span>{isReplying ? 'Sending...' : 'Send Response'}</span>
                </button>
              </div>

              {/* Status Switcher, Assignee, and Priority Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-rose-100/40 dark:border-slate-800/60">
                <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
                  {/* Dynamic Assignee Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                    <span className="text-slate-500 font-medium">Assignee:</span>
                    <select
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer text-xs"
                    >
                      <option value="NexaHR Support Team">NexaHR Support Team</option>
                      <option value="IT Operations Desk">IT Operations Desk</option>
                      <option value="Payroll & Benefits Team">Payroll & Benefits Team</option>
                      <option value="Facilities & Workplace Admin">Facilities & Workplace Admin</option>
                      <option value="People Operations & HR Lead">People Operations & HR Lead</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                    <span className="text-slate-500 font-medium">Priority:</span>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer text-xs"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High (Urgent)</option>
                    </select>
                  </div>

                  {(editAssignee !== selectedTicket.assignedTo || editPriority !== selectedTicket.priority) && (
                    <button
                      onClick={() => handleSaveMetaChanges(selectedTicket.id)}
                      disabled={isUpdatingMeta}
                      className="px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] cursor-pointer transition-all shadow-xs"
                    >
                      {isUpdatingMeta ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
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
                        : 'Mark as Solved & Resolved'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CREATE SUPPORT TICKET MODAL (WITH DYNAMIC EMPLOYEE SELECTION) */}
      {/* ========================================================================= */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-4xl sm:max-w-5xl w-full shadow-2xl shadow-rose-950/15 dark:shadow-black/70 border border-rose-200/70 dark:border-rose-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-rose-200/70 dark:border-rose-800/50 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-purple-50/60 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 ring-3 ring-rose-100/80 dark:ring-rose-950/60">
                  <LifeBuoy className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Log Operations Ticket
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Dispatch an operations issue or employee requisition directly to support queues.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-rose-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-rose-200/60 dark:border-slate-700 relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateTicket} className="overflow-y-auto flex-1 px-6 sm:px-7 py-5 space-y-4 text-xs bg-gradient-to-b from-white/40 via-rose-50/15 to-purple-50/15 dark:from-transparent dark:via-rose-950/10 dark:to-purple-950/10">
              {/* Dynamic Employee Selector & Subject in 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dynamic Employee Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-500" />
                    Target Employee / Requester
                  </label>
                  <select
                    value={newTicketForm.employeeId}
                    onChange={(e) => setNewTicketForm((p) => ({ ...p, employeeId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer shadow-xs"
                  >
                    <option value="">Logged by Me (HR Operations / Admin Desk)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} — {emp.firstName} {emp.lastName} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

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
                    placeholder="e.g. Broken Laptop Screen / Overtime Calculation Inquiry"
                    value={newTicketForm.subject}
                    onChange={(e) =>
                      setNewTicketForm((p) => ({ ...p, subject: e.target.value.slice(0, 100) }))
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Inquiry Category
                  </label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer shadow-xs"
                  >
                    <option value="IT_HARDWARE">IT & Equipment</option>
                    <option value="PAYROLL">Payroll & Tax</option>
                    <option value="BENEFITS">Benefits & Insurance</option>
                    <option value="WORKPLACE">Workplace & Admin</option>
                    <option value="GENERAL_HR">General HR</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Urgency Priority
                  </label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm((p) => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer shadow-xs"
                  >
                    <option value="LOW">Low (Routine)</option>
                    <option value="MEDIUM">Medium (Standard)</option>
                    <option value="HIGH">High (Urgent Escalation)</option>
                  </select>
                </div>

                {/* Assignee */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assign Support Specialist
                  </label>
                  <select
                    value={newTicketForm.assignedTo}
                    onChange={(e) => setNewTicketForm((p) => ({ ...p, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer shadow-xs"
                  >
                    <option value="NexaHR Support Team">NexaHR Support Team</option>
                    <option value="IT Operations Desk">IT Operations Desk</option>
                    <option value="Payroll & Benefits Team">Payroll & Benefits Team</option>
                    <option value="Facilities & Workplace Admin">Facilities & Workplace Admin</option>
                    <option value="People Operations & HR Lead">People Operations & HR Lead</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Detailed Issue Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the operational issue or employee requisition in full detail..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm((p) => ({ ...p, description: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none shadow-xs"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-100/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Support Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Helpdesk;
