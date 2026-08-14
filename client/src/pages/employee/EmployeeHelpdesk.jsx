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

    const newTicket = {
      id: `TICK-${Math.floor(8100 + Math.random() * 800)}`,
      subject: newTicketForm.subject.trim(),
      category: newTicketForm.category,
      categoryLabel: catObj.label,
      priority: newTicketForm.priority,
      status: 'IN_PROGRESS',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: 'Just now',
      assignedTo: 'NexaHR Operations Team',
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
    setNewTicketForm({ subject: '', category: 'IT_HARDWARE', priority: 'MEDIUM', description: '' });
    setToastMsg(`Support Ticket #${newTicket.id} created!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSendReply = (ticketId) => {
    if (!replyText.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const newReplies = [
          ...t.replies,
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
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* STATS + ACTION BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total} Created</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">In Progress</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.inProgress} Active</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Resolved</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.resolved} Closed</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-3xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">Need Assistance?</div>
            <div className="text-sm font-black mt-0.5">Raise Support Ticket</div>
          </div>
          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold rounded-2xl shadow-md cursor-pointer transition-all hover:scale-105"
          >
            + New Ticket
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets by ID, title, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st === 'IN_PROGRESS' ? 'In Progress' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Category:</span>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* TICKETS LIST */}
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    t.status === 'RESOLVED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <LifeBuoy className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{t.id}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {t.categoryLabel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        t.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {t.priority} Priority
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {t.subject}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-2xl">
                    {t.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      t.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {t.status === 'IN_PROGRESS' ? 'IN PROGRESS' : t.status}
                  </span>
                  <div className="text-[10px] text-slate-400 font-medium mt-1">
                    Updated {t.lastUpdated}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800">
            <LifeBuoy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Tickets Found</h4>
            <p className="text-xs text-slate-400 mt-1">Need help? Click "+ New Ticket" above to raise a support inquiry.</p>
          </div>
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Support Ticket</h3>
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
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Subject / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of the issue or equipment request..."
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Category *</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
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
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide comprehensive details, steps to reproduce, or required items..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL & REPLY MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95 max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400">{selectedTicket.id}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {selectedTicket.categoryLabel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        selectedTicket.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedTicket.subject}</h3>
                </div>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Replies Scroll Area */}
              <div className="space-y-3 py-4 max-h-72 overflow-y-auto pr-2">
                {selectedTicket.replies?.map((rep) => (
                  <div
                    key={rep.id}
                    className={`p-4 rounded-2xl text-xs space-y-1 ${
                      rep.sender.includes('You')
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 ml-4'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                      <span>{rep.sender}</span>
                      <span className="text-[10px] font-normal text-slate-400">{rep.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {rep.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions & Reply Box */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {selectedTicket.status !== 'RESOLVED' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your response to the operations team..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply(selectedTicket.id)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                  <button
                    onClick={() => handleSendReply(selectedTicket.id)}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                {selectedTicket.status !== 'RESOLVED' ? (
                  <button
                    onClick={() => handleMarkResolved(selectedTicket.id)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Mark Issue as Resolved</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>This ticket has been resolved and closed.</span>
                  </span>
                )}

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer ml-auto"
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

export default EmployeeHelpdesk;
