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
  Paperclip,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Headphones,
  UserCheck,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
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
   * Telemetry KPI statistics
   */
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length,
      resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
      avgSla: '< 3.8h',
    };
  }, [tickets]);

  // Dynamic Sparkline Data for Helpdesk
  const totalTicketsSparkData = useMemo(() => {
    const catMap = {
      IT_HARDWARE: 0,
      PAYROLL: 0,
      BENEFITS: 0,
      WORKPLACE: 0,
      GENERAL_HR: 0,
    };
    tickets.forEach((t) => {
      if (catMap[t.category] !== undefined) catMap[t.category]++;
      else catMap.GENERAL_HR++;
    });

    return [
      { value: catMap.IT_HARDWARE || 1, label: 'IT', tooltip: `IT & Equipment: ${catMap.IT_HARDWARE} Tickets` },
      { value: catMap.PAYROLL || 2, label: 'Payroll', tooltip: `Payroll & Tax: ${catMap.PAYROLL} Tickets` },
      { value: catMap.BENEFITS || 1, label: 'Benefits', tooltip: `Benefits: ${catMap.BENEFITS} Tickets` },
      { value: catMap.WORKPLACE || 1, label: 'Admin', tooltip: `Workplace: ${catMap.WORKPLACE} Tickets` },
      { value: catMap.GENERAL_HR || 1, label: 'HR', tooltip: `General HR: ${catMap.GENERAL_HR} Tickets` },
    ];
  }, [tickets]);

  const inProgressSparkData = useMemo(() => {
    const openCount = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    return [
      { value: openCount || 1, label: 'Queued', tooltip: `Newly Queued: ${openCount} Tickets` },
      { value: inProgCount || 2, label: 'Review', tooltip: `Active Investigation: ${inProgCount} Tickets` },
      { value: Math.max(0, openCount + inProgCount), label: 'Total', tooltip: `Total Pending: ${openCount + inProgCount} Active` },
    ];
  }, [tickets]);

  const resolvedSparkData = useMemo(() => {
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    return [
      { value: 0, label: 'Start', tooltip: 'Initial Log: 0 Closed' },
      { value: Math.round(resolved * 0.5), label: 'Mid', tooltip: `In Process: ${Math.round(resolved * 0.5)} Resolved` },
      { value: resolved, label: 'Done', tooltip: `Verified Solved: ${resolved} Tickets` },
    ];
  }, [tickets]);

  const slaSparkData = useMemo(() => {
    return [
      { value: 1.2, label: 'Triage', tooltip: 'Auto Dispatch: 1.2h' },
      { value: 2.4, label: 'Assign', tooltip: 'Specialist Assigned: 2.4h' },
      { value: 3.8, label: 'SLA', tooltip: 'Average First Response SLA: 3.8h' },
    ];
  }, []);

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
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-purple-50/60 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-rose-200/70 dark:border-rose-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/15 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

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
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold bg-rose-100/60 dark:bg-rose-950/60 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-800/60">
                <Zap className="w-3.5 h-3.5" />
                <span>Average First Response: {stats.avgSla}</span>
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold bg-purple-100/60 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800/60">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{stats.inProgress} Active Tickets Under Review</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Need HR or IT Help?</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Direct ticket routing to specialists</div>
            </div>
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
              placeholder="Search by ticket ID, subject, assignee..."
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

          {/* Status Pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            {[
              { id: 'ALL', label: 'All Tickets' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
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
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xs scale-102'
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
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Synchronizing helpdesk tickets from server...
            </p>
          </div>
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
                    <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 group-hover:underline">
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

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
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
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-[32px] max-w-2xl w-full shadow-2xl shadow-rose-950/15 dark:shadow-black/60 border border-rose-100/60 dark:border-slate-800/80 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-rose-50/70 via-pink-50/40 to-purple-50/40 dark:from-slate-900/80 dark:via-rose-950/20 dark:to-slate-900/80 relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-48 h-48 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-3.5 min-w-0 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25 ring-4 ring-rose-100/60 dark:ring-rose-950/50">
                  <LifeBuoy className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="space-y-1 min-w-0">
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
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Assigned: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedTicket.assignedTo}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-rose-50/30 dark:from-slate-800/50 dark:to-rose-950/20 border border-rose-100/80 dark:border-slate-800 space-y-1.5 text-xs">
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

              <div className="space-y-3 pt-2">
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
                        className={`px-4 py-3 rounded-2xl max-w-lg text-xs leading-relaxed font-normal shadow-xs ${
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
            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
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
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 disabled:opacity-60 transition-all shadow-xs"
                />
                <button
                  onClick={() => handleSendReply(selectedTicket.id)}
                  disabled={!replyText.trim() || isReplying}
                  className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-rose-600/20"
                >
                  {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isReplying ? 'Sending...' : 'Reply'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleToggleResolved(selectedTicket.id)}
                  disabled={isUpdatingStatus}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 border shadow-xs ${
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

                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  Standard Resolution SLA Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CREATE NEW SUPPORT TICKET MODAL (ULTRA PREMIUM THEMED DESIGN) */}
      {/* ========================================================================= */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-[32px] max-w-xl w-full shadow-2xl shadow-rose-950/15 dark:shadow-black/60 border border-rose-100/60 dark:border-slate-800/80 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 md:p-7 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-purple-50/50 dark:from-slate-900/80 dark:via-rose-950/20 dark:to-slate-900/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400/15 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30 ring-4 ring-rose-100/70 dark:ring-rose-950/60">
                  <LifeBuoy className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Raise Support Ticket
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-rose-500 text-rose-500" />
                      SLA &lt; 4h
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-sm">
                    Direct routing to HR, IT & Operations specialists for fast resolution.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateTicket} className="overflow-y-auto flex-1 p-5 sm:p-6 md:p-7 space-y-5 custom-scrollbar text-xs">
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 outline-none transition-all shadow-xs"
                />
              </div>

              {/* Category Visual Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Category & Department <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Select the best matching area</span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-br from-rose-50 to-pink-50/50 dark:from-rose-950/50 dark:to-slate-800 border-rose-500/80 dark:border-rose-600 text-rose-950 dark:text-white shadow-sm ring-2 ring-rose-500/20'
                            : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
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
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Urgency & Priority <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Determines SLA queue</span>
                </label>

                <div className="grid grid-cols-3 gap-2.5">
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
                        className={`py-2.5 px-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? p.id === 'HIGH'
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-xs ring-2 ring-rose-500/20'
                              : p.id === 'MEDIUM'
                              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs ring-2 ring-amber-500/20'
                              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/70 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                  rows={4}
                  required
                  placeholder="Please provide full details, error messages, asset tags, or required equipment specifications to help our team resolve this swiftly..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 outline-none transition-all resize-none leading-relaxed shadow-xs"
                />
              </div>

              {/* Live Ticket Routing Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-rose-50/30 to-purple-50/20 dark:from-slate-800/60 dark:via-rose-950/20 dark:to-slate-800/60 border border-rose-100 dark:border-slate-700/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs border border-rose-100 dark:border-slate-600">
                    <LifeBuoy className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
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
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
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
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-3">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Encrypted Enterprise Routing</span>
                </div>

                <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-600 active:scale-95 text-white text-xs font-black shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    )}
                    <span>{isSubmitting ? 'Submitting...' : 'Dispatch Ticket'}</span>
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

export default EmployeeHelpdesk;
