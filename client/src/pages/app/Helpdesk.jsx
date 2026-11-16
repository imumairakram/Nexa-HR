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
  Eye,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
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

const PRIORITY_OPTIONS = [
  { id: 'ALL', label: 'All Priorities' },
  { id: 'HIGH', label: 'High Priority', color: 'rose' },
  { id: 'MEDIUM', label: 'Medium Priority', color: 'sky' },
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
  const [activeSort, setActiveSort] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeDateRange, setActiveDateRange] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
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
  // Helpdesk Sort & Date Options
  const sortOptions = [
    { key: 'date', label: 'Sort: Date' },
    { key: 'priority', label: 'Sort: Priority' },
    { key: 'employee', label: 'Sort: Staff Name' },
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
        t.userName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === 'IN_PROGRESS') {
        matchesStatus = t.status === 'IN_PROGRESS' || t.status === 'OPEN';
      } else if (statusFilter === 'RESOLVED') {
        matchesStatus = t.status === 'RESOLVED';
      } else if (statusFilter === 'URGENT') {
        matchesStatus = t.priority === 'HIGH' && t.status !== 'RESOLVED';
      }

      const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

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

      return matchesSearch && matchesStatus && matchesCat && matchesPriority && matchesDate;
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
      } else if (activeSort === 'employee') {
        valA = (a.userName || '').toLowerCase();
        valB = (b.userName || '').toLowerCase();
      } else if (activeSort === 'id') {
        valA = (a.id || '').toLowerCase();
        valB = (b.id || '').toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [tickets, searchQuery, statusFilter, categoryFilter, priorityFilter, activeDateRange, activeSort, sortOrder]);

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
        title="Helpdesk & Support"
        subtitle="Review employee support queries, reply to active technical threads, assign specialists, and resolve HR tickets."
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC ADMIN HELPDESK HERO BANNER (ROSE-LAVENDER THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-6 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Telemetry Info */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
              Operations Support & Inquiry Resolution Command Center
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-lg font-medium">
              Manage enterprise support requests submitted by team members across IT hardware, payroll queries, leave adjustments, and workplace amenities.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{tickets.length} Total Inquiries</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{stats.inProgress} Under Review</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{stats.resolved} Resolved</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>SLA: {stats.avgSla}</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex flex-col items-center text-center min-w-[220px] sm:min-w-[260px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Employee Support Desk</div>
              <div className="text-[11px] text-white/80 mt-0.5">
                {stats.resolutionRate} Resolution Compliance
              </div>
            </div>
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="w-full px-5 py-2.5 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] dark:text-white font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
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
          chartColor="sky"
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
          chartColor="sky"
          presetWave="wave4"
          dataPoints={prioritySparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. MODERN DYNAMIC SEARCH & FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <ModernSearchBarSection
        statusTabs={[
          { key: 'ALL', label: 'All', count: tickets.length },
          { key: 'IN_PROGRESS', label: 'Under Review', count: tickets.filter((t) => t.status !== 'RESOLVED').length },
          { key: 'RESOLVED', label: 'Resolved', count: tickets.filter((t) => t.status === 'RESOLVED').length },
          { key: 'URGENT', label: 'Urgent', count: tickets.filter((t) => t.priority === 'HIGH' && t.status !== 'RESOLVED').length },
        ]}
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by ticket ID, employee, email, subject, or assignee..."
        searchHint="priority:high"
        filterTags={[
          ...(categoryFilter !== 'ALL'
            ? [{ key: 'category', label: `cat: ${CATEGORY_OPTIONS.find((c) => c.id === categoryFilter)?.label || categoryFilter}` }]
            : []),
          ...(priorityFilter !== 'ALL'
            ? [{ key: 'priority', label: `priority: ${priorityFilter.toLowerCase()}` }]
            : []),
        ]}
        onRemoveTag={(tag) => {
          if (tag.key === 'category') setCategoryFilter('ALL');
          if (tag.key === 'priority') setPriorityFilter('ALL');
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
        filterCount={
          (categoryFilter !== 'ALL' ? 1 : 0) +
          (priorityFilter !== 'ALL' ? 1 : 0)
        }
        filterContent={
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Ticket Filters
              </span>
              {(categoryFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('ALL');
                    setPriorityFilter('ALL');
                  }}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Priority Options */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriorityFilter(p.id)}
                    className={`px-2 py-1.5 rounded-[12px] text-[11px] font-bold transition-all text-center cursor-pointer ${
                      priorityFilter === p.id
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Options */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Category
              </label>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
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
                            ? 'bg-sky-100 dark:bg-sky-900/80 text-sky-700 dark:text-sky-300'
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
        }
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadData(false)}
              title="Refresh tickets"
              className="p-2 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsNewTicketOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Ticket</span>
            </button>
          </div>
        }
      />

      {/* ========================================================================= */}
      {/* 4. ENTERPRISE TICKET LIST (ADMIN VIEW WITH REAL EMPLOYEE DOSSIER) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Employee Inquiries & Operations Service Queue</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Enterprise resolution command center for workforce inquiries, IT tickets, and grievance handling
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-[12px]">
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
                    <span className="text-xs font-mono font-black text-sky-600 dark:text-sky-400 group-hover:underline">
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
                        <div className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {(t.userName || 'E').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{t.userName || 'Employee'}</span>
                      {t.userEmail && (
                        <span className="text-slate-400 font-normal">({t.userEmail})</span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                      {t.categoryLabel || t.category}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        t.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60'
                          : t.priority === 'MEDIUM'
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60'
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

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[12px] text-xs font-bold border cursor-pointer transition-all hover:scale-105 ${
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
                {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'No support tickets matched your search'
                  : 'Operations Service Queue is Empty'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'No employee support inquiries match your active search or filter criteria. Try resetting filters to view all entries.'
                  : 'All employee support inquiries and operations tickets have been attended to. New inquiries submitted across departments will appear live in this queue.'}
              </p>
            </div>
            {(!searchQuery && statusFilter === 'ALL' && categoryFilter === 'ALL' && priorityFilter === 'ALL') ? (
              <div className="pt-2">
                <button
                  onClick={() => setIsNewTicketOpen(true)}
                  className="px-6 py-3 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-700 hover:to-sky-700 text-white font-extrabold text-xs shadow-lg shadow-sky-600/25 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Open Ticket on Employee Behalf</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                    setPriorityFilter('ALL');
                  }}
                  className="px-5 py-2.5 rounded-[12px] bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Search & Filters</span>
                </button>
              </div>
            )}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Guaranteed SLA Compliance</span>
              </span>
              <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Automated Thread Dispatch</span>
              </span>
              <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Tamper-Proof Audit History</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. TICKET LIVE CONVERSATION & RESOLUTION MODAL (ENTERPRISE HIGH-FIDELITY) */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <main className="relative z-10 w-full max-w-5xl lg:max-w-6xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-9 transition-all max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <header className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-5 shrink-0" data-purpose="modal-header">
              <div className="flex items-center gap-4 min-w-0">
                {/* Glowing Icon Badge */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/25 flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
                    <LifeBuoy className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                      #{selectedTicket.id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                      {selectedTicket.categoryLabel || selectedTicket.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 border ${
                        selectedTicket.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedTicket.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                        }`}
                      />
                      <span>{selectedTicket.status === 'RESOLVED' ? 'Resolved' : 'In Progress'}</span>
                    </span>
                    {selectedTicket.priority && (
                      <span
                        className={`text-xs font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 border ${
                          selectedTicket.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : selectedTicket.priority === 'MEDIUM'
                            ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedTicket.priority === 'HIGH'
                              ? 'bg-rose-500 animate-pulse'
                              : selectedTicket.priority === 'MEDIUM'
                              ? 'bg-sky-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>{selectedTicket.priority} Priority</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug truncate">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                    <span>
                      Requester: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{selectedTicket.userName || 'Employee'}</strong> {selectedTicket.userEmail && `(${selectedTicket.userEmail})`}
                    </span>
                    <span>•</span>
                    <span>
                      Assigned: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{selectedTicket.assignedTo || 'NexaHR Support Team'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Action */}
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shrink-0 ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-2 space-y-4 custom-scrollbar text-xs">
              {/* Requester Dossier & Original Message */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-500 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                      {(selectedTicket.userName || 'E').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {selectedTicket.userName}
                      </span>
                      {selectedTicket.userEmail && (
                        <span className="text-[11px] text-slate-400 ml-1.5">({selectedTicket.userEmail})</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatTimeDisplay(selectedTicket.createdDate)}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5 text-sky-600 dark:text-sky-400">
                    <FileText className="w-3.5 h-3.5" />
                    Original Inquiry Description
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Thread of Responses */}
              <div className="space-y-3.5 pt-1">
                {selectedTicket.replies?.map((rep, idx) => {
                  const isSupportLead = rep.sender?.includes('(You)') || rep.user?.role === 'ADMIN' || rep.user?.role === 'HR_MANAGER';
                  return (
                    <div
                      key={rep.id || idx}
                      className={`flex flex-col ${isSupportLead ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium px-1">
                        <span className={isSupportLead ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-700 dark:text-slate-300 font-semibold'}>
                          {rep.sender}
                        </span>
                        <span>•</span>
                        <span>{formatTimeDisplay(rep.time)}</span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl max-w-lg text-xs sm:text-sm leading-relaxed font-normal shadow-xs ${
                          isSupportLead
                            ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-br-xs shadow-md shadow-sky-500/20'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
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
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 shrink-0">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Write official support response to ${selectedTicket.userName || 'the employee'}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply(selectedTicket.id);
                  }}
                  disabled={isReplying}
                  className="flex-1 h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSendReply(selectedTicket.id)}
                  disabled={!replyText.trim() || isReplying}
                  className="h-11 px-6 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 transition-all shadow-lg shadow-sky-600/25 shrink-0"
                >
                  {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isReplying ? 'Sending...' : 'Send Response'}</span>
                </button>
              </div>

              {/* Status Switcher, Assignee, and Priority Controls */}
              <footer className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4" data-purpose="modal-footer">
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] w-full sm:w-auto">
                  {/* Dynamic Assignee Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
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
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
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
                      type="button"
                      onClick={() => handleSaveMetaChanges(selectedTicket.id)}
                      disabled={isUpdatingMeta}
                      className="px-3.5 py-1.5 rounded-[12px] bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] cursor-pointer transition-all shadow-xs"
                    >
                      {isUpdatingMeta ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleResolved(selectedTicket.id)}
                    disabled={isUpdatingStatus}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 border ${
                      selectedTicket.status === 'RESOLVED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 shadow-xs'
                    }`}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : selectedTicket.status === 'RESOLVED' ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4 stroke-[2.5]" />
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
              </footer>
            </div>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CREATE SUPPORT TICKET MODAL (WITH DYNAMIC EMPLOYEE SELECTION) */}
      {/* ========================================================================= */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-5xl lg:max-w-6xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-9 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                  <LifeBuoy className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Log Operations Ticket
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Dispatch an operations issue or employee requisition directly to support queues.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewTicketOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-6">
              {/* Row 1: Target Employee & Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-500" />
                      Target Employee / Requester
                    </label>
                  </div>
                  <select
                    value={newTicketForm.employeeId}
                    onChange={(e) => setNewTicketForm((p) => ({ ...p, employeeId: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="">Logged by Me (HR Operations / Admin Desk)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} — {emp.firstName} {emp.lastName} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      Ticket Subject <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      {newTicketForm.subject.length}/100 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={newTicketForm.subject}
                    onChange={(e) =>
                      setNewTicketForm((p) => ({ ...p, subject: e.target.value.slice(0, 100) }))
                    }
                    placeholder="e.g. Broken Laptop Screen / Overtime Calculation Inquiry"
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Row 2: Priority & Assignee Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    Urgency Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'LOW', label: 'Low', hint: 'Routine' },
                      { id: 'MEDIUM', label: 'Medium', hint: 'Standard' },
                      { id: 'HIGH', label: 'High', hint: 'Urgent' },
                    ].map((p) => {
                      const isSelected = newTicketForm.priority === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setNewTicketForm((prev) => ({ ...prev, priority: p.id }))}
                          className={`py-2 px-3 rounded-[12px] border text-center transition-all cursor-pointer font-bold text-xs ${
                            isSelected
                              ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/25 ring-2 ring-sky-400/30'
                              : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                          }`}
                        >
                          <div>{p.label}</div>
                          <div className={`text-[10px] font-normal opacity-80 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {p.hint}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    Assign Support Specialist
                  </label>
                  <select
                    value={newTicketForm.assignedTo}
                    onChange={(e) => setNewTicketForm((p) => ({ ...p, assignedTo: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
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

              {/* Row 3: Ticket Classification Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Ticket Classification <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-medium text-slate-400">
                    Select department routing
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { id: 'IT_HARDWARE', label: 'IT & Equipment', icon: Laptop, hint: 'Hardware, bug' },
                    { id: 'PAYROLL', label: 'Payroll & Tax', icon: CreditCard, hint: 'Slip, deduction' },
                    { id: 'BENEFITS', label: 'Benefits', icon: HeartHandshake, hint: 'Health, perk' },
                    { id: 'WORKPLACE', label: 'Workplace', icon: Building, hint: 'Facility, badge' },
                    { id: 'GENERAL_HR', label: 'General HR', icon: HelpCircle, hint: 'Policy, inquiry' },
                  ].map((cat) => {
                    const isSelected = newTicketForm.category === cat.id;
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewTicketForm((p) => ({ ...p, category: cat.id }))}
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

              {/* Row 4: Two-column Description & Live Routing Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Description Column */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    Detailed Issue Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full context, error details, or employee requisition..."
                    value={newTicketForm.description}
                    onChange={(e) =>
                      setNewTicketForm((p) => ({ ...p, description: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none shadow-inner"
                  />
                </div>

                {/* Live Preview Column */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-sky-500" />
                      Live Preview & Routing Card
                    </label>
                    <span className="text-xs font-medium text-slate-400">
                      Real-time summary
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-sky-50/40 dark:from-slate-900/80 dark:via-slate-800/80 dark:to-sky-950/20 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3.5 min-h-[110px]">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {newTicketForm.subject || 'Untitled Ticket Subject'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {newTicketForm.category.replace('_', ' ')}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 truncate">
                          {newTicketForm.assignedTo}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase ${
                            newTicketForm.priority === 'HIGH'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : newTicketForm.priority === 'MEDIUM'
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {newTicketForm.priority} PRIORITY
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium truncate">
                          Target: {newTicketForm.employeeId ? (employees.find(e => e.id === newTicketForm.employeeId)?.firstName || 'Assigned Employee') : 'HR Operations Desk'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Trust text + Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Guaranteed SLA compliance & automated dispatch</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Dispatch Support Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Helpdesk;
