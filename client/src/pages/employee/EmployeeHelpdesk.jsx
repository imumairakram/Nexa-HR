import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const DEFAULT_TICKETS = [
  {
    id: 'TICK-8021',
    subject: 'Request for Secondary 4K Monitor for Home Office Setup',
    category: 'IT_HARDWARE',
    categoryLabel: 'IT & Equipment',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdDate: '2026-08-07',
    lastUpdated: 'Today, 11:30 AM',
    assignedTo: 'Marcus Vance (IT Ops)',
    description:
      'Would like to request an approved Dell UltraSharp 27" 4K monitor for home ergonomics per remote engineering equipment allowance.',
    replies: [
      {
        id: 1,
        sender: 'Alex Mercer (You)',
        time: 'Aug 07, 09:15 AM',
        message:
          'Hello IT team, I submitted an equipment stipend requisition for a secondary display monitor. Please let me know if any invoice receipt is required.',
      },
      {
        id: 2,
        sender: 'Marcus Vance (IT Ops)',
        time: 'Today, 11:30 AM',
        message:
          'Hi Alex! Your request has been approved by your department lead. We will dispatch the shipment via courier tracking tomorrow morning.',
      },
    ],
  },
  {
    id: 'TICK-7984',
    subject: 'Clarification on YTD State Tax Withholding Adjustment',
    category: 'PAYROLL',
    categoryLabel: 'Payroll & Tax',
    priority: 'HIGH',
    status: 'RESOLVED',
    createdDate: '2026-08-01',
    lastUpdated: 'Aug 03, 04:15 PM',
    assignedTo: 'Lucas Morales (Finance)',
    description:
      'Noticed a minor change in state tax deductions in the July 2026 payslip following the new fiscal year brackets.',
    replies: [
      {
        id: 1,
        sender: 'Alex Mercer (You)',
        time: 'Aug 01, 10:00 AM',
        message:
          'Hi Finance, could you please verify if the updated progressive tax bracket adjustments were applied in July?',
      },
      {
        id: 2,
        sender: 'Lucas Morales (Finance)',
        time: 'Aug 03, 04:15 PM',
        message:
          'Hi Alex, yes! The FY26 progressive tax adjustment was applied starting with the July cycle. Your withholding remains standard. Full breakdown is available in your Payslips tab.',
      },
    ],
  },
  {
    id: 'TICK-7850',
    subject: 'Health Insurance Dental Dependent Enrollment Query',
    category: 'BENEFITS',
    categoryLabel: 'Benefits & Insurance',
    priority: 'LOW',
    status: 'RESOLVED',
    createdDate: '2026-07-20',
    lastUpdated: 'Jul 22, 02:00 PM',
    assignedTo: 'Chloe Bennett (People Ops)',
    description:
      'Looking to add my spouse to the premium dental insurance plan during the mid-year qualifying life event window.',
    replies: [
      {
        id: 1,
        sender: 'Alex Mercer (You)',
        time: 'Jul 20, 02:30 PM',
        message:
          'Hi HR, please guide me on what verification documents are needed to enroll my spouse into the dental insurance tier.',
      },
      {
        id: 2,
        sender: 'Chloe Bennett (People Ops)',
        time: 'Jul 22, 02:00 PM',
        message:
          'Hi Alex! Marriage certificate uploaded and spouse coverage is active immediately under the corporate Dental Plan. Happy to help!',
      },
    ],
  },
];

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
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_helpdesk_tickets');
      return saved ? JSON.parse(saved) : DEFAULT_TICKETS;
    } catch {
      return DEFAULT_TICKETS;
    }
  });

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
    setTimeout(() => setToastMsg(''), 3500);
  };

  const saveTickets = (updated) => {
    setTickets(updated);
    try {
      localStorage.setItem('nexahr_helpdesk_tickets', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      showToast('Please enter a ticket subject and description');
      return;
    }

    const catObj = CATEGORY_OPTIONS.find((c) => c.id === newTicketForm.category) || CATEGORY_OPTIONS[1];
    const ticketId = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket = {
      id: ticketId,
      subject: newTicketForm.subject.trim(),
      category: newTicketForm.category,
      categoryLabel: catObj.label,
      priority: newTicketForm.priority,
      status: 'IN_PROGRESS',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: 'Just now',
      assignedTo: 'NexaHR Support Team',
      description: newTicketForm.description.trim(),
      replies: [
        {
          id: 1,
          sender: 'Alex Mercer (You)',
          time: 'Just now',
          message: newTicketForm.description.trim(),
        },
      ],
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);
    setIsNewTicketOpen(false);
    setNewTicketForm({
      subject: '',
      category: 'IT_HARDWARE',
      priority: 'MEDIUM',
      description: '',
    });
    showToast(`Support Ticket #${ticketId} created and dispatched to HR Ops!`);
  };

  const handleSendReply = (ticketId) => {
    if (!replyText.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const newReplies = [
          ...(t.replies || []),
          {
            id: Date.now(),
            sender: 'Alex Mercer (You)',
            time: 'Just now',
            message: replyText.trim(),
          },
        ];
        return {
          ...t,
          lastUpdated: 'Just now',
          replies: newReplies,
        };
      }
      return t;
    });

    saveTickets(updated);
    setSelectedTicket(updated.find((t) => t.id === ticketId));
    setReplyText('');
    showToast('Your message has been posted to the support thread.');
  };

  const handleToggleResolved = (ticketId) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const nextStatus = t.status === 'RESOLVED' ? 'IN_PROGRESS' : 'RESOLVED';
        return {
          ...t,
          status: nextStatus,
          lastUpdated: 'Just now',
        };
      }
      return t;
    });
    saveTickets(updated);
    const target = updated.find((t) => t.id === ticketId);
    setSelectedTicket(target);
    showToast(target?.status === 'RESOLVED' ? 'Ticket officially marked as RESOLVED.' : 'Ticket reopened for further review.');
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.subject.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assignedTo.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length,
      resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
      avgSla: '< 3.8h',
    };
  }, [tickets]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <EmployeePageHeader
        title="Helpdesk & Support"
        subtitle="Submit inquiry tickets, track equipment requests, and resolve HR queries with dedicated operations specialists."
        action={
          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold rounded-full flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Ticket</span>
          </button>
        }
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
      {/* 2. STITCH-INSPIRED KPI TELEMETRY CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Inquiries */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Total Inquiries
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.total} <span className="text-base font-bold text-slate-400">{stats.total === 1 ? 'Ticket' : 'Tickets'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Lifetime Logged</span>
              <span className="text-slate-400">Self-Service</span>
            </div>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Under Review
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              {stats.inProgress} <span className="text-base font-bold text-slate-400">{stats.inProgress === 1 ? 'Ticket' : 'Tickets'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Active Investigation</span>
              <span className="text-slate-400">In Progress</span>
            </div>
          </div>
        </div>

        {/* Card 3: Resolved Closed */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Resolved Issues
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.resolved} <span className="text-base font-bold text-slate-400">Closed</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Satisfaction</span>
              <span className="text-slate-400">Verified</span>
            </div>
          </div>
        </div>

        {/* Card 4: Avg Resolution SLA */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-rose-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-rose-500/10 blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Avg Resolution SLA
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              {stats.avgSla}
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-rose-600 dark:text-rose-400 font-bold">Fast Lane Active</span>
              <span className="text-slate-400">Enterprise Grade</span>
            </div>
          </div>
        </div>
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
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${categoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
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

        {filteredTickets.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="p-5 sm:p-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 group-hover:underline">
                      #{t.id}
                    </span>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                      {t.categoryLabel}
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
                      Updated {t.lastUpdated}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">• Assigned: <strong className="text-slate-700 dark:text-slate-300">{t.assignedTo}</strong></span>
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
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No support tickets match your search</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your query or create a new support ticket using the button above.
            </p>
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
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. TICKET LIVE CONVERSATION THREAD DRAWER / MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 max-h-[90vh] flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                    #{selectedTicket.id}
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedTicket.categoryLabel}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      selectedTicket.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                  {selectedTicket.subject}
                </h3>
                <div className="text-xs text-slate-400 font-medium">
                  Assigned Specialist: <strong className="text-slate-700 dark:text-slate-200">{selectedTicket.assignedTo}</strong>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-1 text-xs">
                <span className="font-extrabold text-slate-800 dark:text-white block">Initial Ticket Description:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {selectedTicket.replies?.map((rep) => {
                  const isMe = rep.sender.includes('You');
                  return (
                    <div
                      key={rep.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold px-1">
                        <span>{rep.sender}</span>
                        <span>•</span>
                        <span>{rep.time}</span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed font-medium shadow-xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
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
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your response to support..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply(selectedTicket.id);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSendReply(selectedTicket.id)}
                  disabled={!replyText.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleToggleResolved(selectedTicket.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedTicket.status === 'RESOLVED'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {selectedTicket.status === 'RESOLVED' ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{selectedTicket.status === 'RESOLVED' ? 'Reopen Ticket' : 'Mark Ticket Resolved'}</span>
                </button>

                <span className="text-[11px] text-slate-400 font-medium">
                  Resolution Protocol: NexaHR Standard SLA
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CREATE NEW SUPPORT TICKET MODAL (STITCH LUXURY DESIGN) */}
      {/* ========================================================================= */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-[32px] max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800/90 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 md:p-7 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-rose-50/60 via-indigo-50/40 to-slate-50/40 dark:from-slate-900/70 dark:via-slate-900/50 dark:to-slate-900/70">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25">
                  <LifeBuoy className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Raise Support Ticket
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md">
                    Direct routing to internal workplace operations, IT equipment, and HR administrators.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateTicket} className="overflow-y-auto flex-1 p-5 sm:p-6 md:p-7 space-y-5 custom-scrollbar text-xs">
              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Subject / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic chair replacement or VPN configuration inquiry"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Category Scope <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="IT_HARDWARE">IT & Hardware Gear</option>
                    <option value="PAYROLL">Payroll & Compensation</option>
                    <option value="BENEFITS">Benefits & Health Insurance</option>
                    <option value="WORKPLACE">Workplace & Office Admin</option>
                    <option value="GENERAL_HR">General HR Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Urgency Priority <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="LOW">Low (Standard Inquiry)</option>
                    <option value="MEDIUM">Medium (Normal Operational Need)</option>
                    <option value="HIGH">High (Critical Blocker)</option>
                  </select>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide explicit context, model specifications, error logs, or relevant ticket attachments..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-rose-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {newTicketForm.subject.trim() || 'Support Requisition Preview'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Category: {newTicketForm.category} • Priority: {newTicketForm.priority}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                  newTicketForm.priority === 'HIGH'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                }`}>
                  {newTicketForm.priority}
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-indigo-600 to-amber-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Submit Ticket</span>
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
