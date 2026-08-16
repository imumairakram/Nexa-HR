import React, { useState, useEffect } from 'react';
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
  Sparkles,
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
    description: 'Would like to request an approved Dell UltraSharp 27" 4K monitor for home ergonomics per remote engineering equipment allowance.',
    replies: [
      {
        id: 1,
        sender: 'Alex Mercer (You)',
        time: 'Aug 07, 09:15 AM',
        message: 'Hello IT team, I submitted an equipment stipend requisition for a secondary display monitor. Please let me know if any invoice receipt is required.',
      },
      {
        id: 2,
        sender: 'Marcus Vance (IT Ops)',
        time: 'Today, 11:30 AM',
        message: 'Hi Alex! Your request has been approved by your department lead. We will dispatch the shipment via FedEx tracking tomorrow morning.',
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
    description: 'Noticed a minor change in state tax deductions in the July 2026 payslip following the new fiscal year brackets.',
    replies: [
      {
        id: 1,
        sender: 'Alex Mercer (You)',
        time: 'Aug 01, 10:00 AM',
        message: 'Hi Finance, could you please verify if the updated California state tax tax bracket adjustments were applied in July?',
      },
      {
        id: 2,
        sender: 'Lucas Morales (Finance)',
        time: 'Aug 03, 04:15 PM',
        message: 'Hi Alex, yes! The FY26 progressive state tax adjustment was applied starting with the July cycle. Your W-4 withholding remains standard. Full breakdown attached to your Payslips tab.',
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
    description: 'Looking to add my spouse to the premium dental insurance plan during the mid-year qualifying life event window.',
    replies: [
      {
        id: 1,
        sender: 'Alex Mercer (You)',
        time: 'Jul 20, 02:30 PM',
        message: 'Hi HR, please guide me on what verification documents are needed to enroll my spouse into the dental insurance tier.',
      },
      {
        id: 2,
        sender: 'Chloe Bennett (People Ops)',
        time: 'Jul 22, 02:00 PM',
        message: 'Hi Alex! Marriage certificate uploaded and spouse coverage is active immediately under BlueCross Dental Plan. Happy to help!',
      },
    ],
  },
];

const CATEGORY_OPTIONS = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'IT_HARDWARE', label: 'IT & Equipment', icon: Laptop },
  { id: 'PAYROLL', label: 'Payroll & Tax', icon: CreditCard },
  { id: 'BENEFITS', label: 'Benefits & Insurance', icon: HeartHandshake },
  { id: 'WORKPLACE', label: 'Workplace & Facilities', icon: Building },
  { id: 'GENERAL_HR', label: 'General HR Inquiry', icon: HelpCircle },
];

const EmployeeHelpdesk = () => {
  const { formatDate, formatTime } = useRegionalSettings();
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
      setToastMsg('Please enter a ticket subject and description');
      setTimeout(() => setToastMsg(''), 2500);
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
          sender: 'You',
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
    setToastMsg(`Ticket ${ticketId} created successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSendReply = (ticketId) => {
    if (!replyText.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const newReplies = [
          ...(t.replies || []),
          {
            id: Date.now(),
            sender: 'You',
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
    setToastMsg('Reply posted!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleMarkResolved = (ticketId) => {
    const updated = tickets.map((t) => (t.id === ticketId ? { ...t, status: 'RESOLVED', lastUpdated: 'Just now' } : t));
    saveTickets(updated);
    setSelectedTicket(updated.find((t) => t.id === ticketId));
    setToastMsg('Ticket marked as RESOLVED!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const stats = {
    total: tickets.length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Helpdesk & Support"
        subtitle="Submit inquiry tickets, track equipment requests, and resolve HR queries."
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
      {/* 1. METRICS OVERVIEW CARDS (CLEAN DASHBOARD STYLE - NO CHUNKY GREEN BANNER) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Total Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total} {stats.total === 1 ? 'Ticket' : 'Tickets'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">All-time raised issues</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.inProgress} {stats.inProgress === 1 ? 'Ticket' : 'Tickets'}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2">Under active review</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.resolved} Closed
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">Resolution confirmed</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Avg Resolution SLA</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              &lt; 4.2 Hours
            </span>
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-2">Fast response guaranteed</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & SEGMENTED CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status segmented pills */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All Tickets' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets by ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODERN TICKET LIST */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Support Inquiry Log
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Click any ticket to view the live conversation thread and assigned representative
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {filteredTickets.length} Tickets
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
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {t.id}
                    </span>

                    {/* Category */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t.categoryLabel}
                    </span>

                    {/* Priority badge (Subtle) */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        t.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60'
                      }`}
                    >
                      {t.priority}
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium">
                      Updated {t.lastUpdated}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {t.subject}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-3xl">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      t.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40'
                    }`}
                  >
                    {t.status === 'RESOLVED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span>{t.status === 'RESOLVED' ? 'Resolved' : 'In Progress'}</span>
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <LifeBuoy className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Tickets Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Need assistance? Click the "+ New Ticket" button above to submit your inquiry.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. NEW TICKET MODAL */}
      {/* ========================================================================= */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Raise Support Ticket</h3>
                  <p className="text-xs text-slate-400">Our HR & IT ops team will respond within 4 hours</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of your query or request..."
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Category *</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.filter((c) => c.id !== 'ALL').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Priority *</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide all relevant details, error messages, or equipment requirements..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold transition-all hover:scale-105 cursor-pointer shadow-md"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TICKET DETAILS & CONVERSATION MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedTicket.id}
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedTicket.categoryLabel}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      selectedTicket.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedTicket.subject}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Timeline */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>Initial Ticket Description</span>
                  <span>{selectedTicket.createdDate}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Replies */}
              {selectedTicket.replies?.map((rep) => (
                <div
                  key={rep.id}
                  className={`p-4 rounded-2xl space-y-1 ${
                    rep.sender.includes('You')
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 ml-6'
                      : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={rep.sender.includes('You') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}>
                      {rep.sender}
                    </span>
                    <span className="text-[10px] text-slate-400">{rep.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {rep.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Reply Input Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a follow-up reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply(selectedTicket.id);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={() => handleSendReply(selectedTicket.id)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              {selectedTicket.status !== 'RESOLVED' && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleMarkResolved(selectedTicket.id)}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Ticket as Resolved</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeHelpdesk;
