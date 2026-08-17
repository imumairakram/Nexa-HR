import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  X,
  FileText,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const DEPARTMENT_SPEND_DATA = [
  { name: 'Engineering', spend: 145000, color: '#3B82F6' },
  { name: 'Product & Design', spend: 68000, color: '#10B981' },
  { name: 'Marketing & Sales', spend: 52000, color: '#8B5CF6' },
  { name: 'People Ops & HR', spend: 34000, color: '#F59E0B' },
  { name: 'Finance & Legal', spend: 28000, color: '#EC4899' },
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-9021',
    title: 'July 2026 Monthly Payroll Batch Disbursement',
    category: 'PAYROLL',
    amount: 198500,
    type: 'EXPENSE',
    department: 'Company-Wide',
    date: 'Jul 31, 2026',
    status: 'COMPLETED',
    ref: 'ACH-DIRECT-PAY-2026-07',
  },
  {
    id: 'TXN-9018',
    title: 'Comprehensive Health Insurance Premium Q3',
    category: 'BENEFITS',
    amount: 24500,
    type: 'EXPENSE',
    department: 'People Operations',
    date: 'Jul 25, 2026',
    status: 'COMPLETED',
    ref: 'BLUCROSS-CORP-948',
  },
  {
    id: 'TXN-9015',
    title: 'Biometric Gateway Firmware & IoT Hardware Stipends',
    category: 'HARDWARE',
    amount: 12400,
    type: 'EXPENSE',
    department: 'Engineering',
    date: 'Jul 18, 2026',
    status: 'COMPLETED',
    ref: 'DELL-CORP-INVOICE-84',
  },
  {
    id: 'TXN-9010',
    title: 'HQ Office Lease & Facilities Utilities (SF & NY)',
    category: 'FACILITIES',
    amount: 38000,
    type: 'EXPENSE',
    department: 'Operations',
    date: 'Jul 01, 2026',
    status: 'COMPLETED',
    ref: 'WEWORK-ENTERPRISE-JUL',
  },
  {
    id: 'TXN-9005',
    title: 'Q2 Engineering Milestone Completion Grant',
    category: 'INCOME',
    amount: 85000,
    type: 'INCOME',
    department: 'Engineering',
    date: 'Jun 30, 2026',
    status: 'COMPLETED',
    ref: 'CORP-GRANT-WIRE-01',
  },
];

const Accounts = () => {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Record Form State
  const [form, setForm] = useState({
    title: '',
    category: 'OPERATIONS',
    amount: '',
    type: 'EXPENSE',
    department: 'Engineering & DevOps',
    ref: '',
  });

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      title: form.title,
      category: form.category,
      amount: parseFloat(form.amount) || 0,
      type: form.type,
      department: form.department,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'COMPLETED',
      ref: form.ref || 'INTERNAL-VOUCHER',
    };

    setTransactions([newTxn, ...transactions]);
    setIsRecordOpen(false);
    setForm({
      title: '',
      category: 'OPERATIONS',
      amount: '',
      type: 'EXPENSE',
      department: 'Engineering & DevOps',
      ref: '',
    });
    setToastMsg(`Transaction ${newTxn.id} recorded successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Accounts, Ledgers & Operating Expenses"
        subtitle="Track department expenditure, payroll disbursements, benefits costs, and cash flow ledger."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC ACCOUNTS HERO BANNER (EMERALD-TEAL LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-cyan-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-emerald-200/70 dark:border-emerald-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-300/20 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Ledger Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold border border-emerald-600/20 dark:border-emerald-500/30">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Financial Ledger Active</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-600/20 dark:border-teal-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Audited Double-Entry Bookkeeping</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Accounts, Ledgers & Operating Expenses
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Track real-time department expenditure, payroll disbursements, SaaS tooling allocations, employee perks, and general ledger accounts.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>$273,400 Total Monthly Spend</span>
              </span>
              <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800/60">
                <Building className="w-3.5 h-3.5" />
                <span>$1,450,000 Operating Reserve</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-emerald-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Record Transaction</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Post new expense or grant</div>
            </div>
            <button
              onClick={() => setIsRecordOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Voucher</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Monthly Spend</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              $273,400
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">All Categories</span>
              <span className="text-slate-400">MTD Spend</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Payroll Outflow</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              $198,500
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">72.6% of Budget</span>
              <span className="text-slate-400">Salaries</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Benefits & Perks</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              $24,500
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Healthcare & Gym</span>
              <span className="text-slate-400">Wellness</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Operating Reserve</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              $1,450,000
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">5.3 Months Runway</span>
              <span className="text-slate-400">Liquid</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VISUAL CHARTS SECTION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Expenditure Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Departmental Budget & Spend Breakdown
              </h3>
              <p className="text-xs text-slate-400">Monthly compensation and operational disbursements</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_SPEND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Monthly Spend']}
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="spend" radius={[12, 12, 0, 0]}>
                  {DEPARTMENT_SPEND_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Allocation Doughnut (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Spend Allocation</h3>
            <p className="text-xs text-slate-400">Budget percentage by functional unit</p>
          </div>

          <div className="space-y-2.5">
            {DEPARTMENT_SPEND_DATA.map((dept) => {
              const total = DEPARTMENT_SPEND_DATA.reduce((acc, d) => acc + d.spend, 0);
              const pct = Math.round((dept.spend / total) * 100);
              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                      <span className="text-slate-700 dark:text-slate-200">{dept.name}</span>
                    </div>
                    <span className="text-slate-900 dark:text-white">${(dept.spend / 1000).toFixed(0)}k ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: dept.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-center">
            <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300">
              Total Budget Tracked: $327,000 / mo
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TOOLBAR & TRANSACTIONS TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ledger by reference ID, title, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['ALL', 'PAYROLL', 'BENEFITS', 'HARDWARE', 'FACILITIES'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat}
              </button>
            ))}

            <button
              onClick={() => setIsRecordOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record Voucher</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Transaction / Reference</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          t.type === 'INCOME'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                        }`}
                      >
                        {t.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">{t.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {t.id} • Ref: {t.ref}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {t.department}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-500">{t.date}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.status}</span>
                    </span>
                  </td>
                  <td
                    className={`py-4 px-4 text-right font-black text-sm ${
                      t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: RECORD VOUCHER */}
      {/* ========================================================================= */}
      {isRecordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Record Ledger Voucher</h3>
              </div>
              <button
                onClick={() => setIsRecordOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Transaction Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Infrastructure Billing July..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="PAYROLL">Payroll Disbursement</option>
                    <option value="BENEFITS">Benefits & Health Insurance</option>
                    <option value="HARDWARE">Hardware & IT Equipment</option>
                    <option value="FACILITIES">Facilities & Office Rent</option>
                    <option value="OPERATIONS">Operations & Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Amount ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Department *
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Engineering & DevOps">Engineering & DevOps</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="People Operations & HR">People Operations & HR</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                    <option value="Company-Wide">Company-Wide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    External Ref / Invoice #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-88"
                    value={form.ref}
                    onChange={(e) => setForm({ ...form, ref: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
