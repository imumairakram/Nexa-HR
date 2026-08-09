import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Users,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  MoreVertical,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Layers,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';

const INITIAL_DEPARTMENTS = [
  {
    id: 1,
    name: 'Engineering & DevOps',
    code: 'ENG',
    lead: 'Alex Mercer',
    leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    headcount: 64,
    budget: '$1,850,000',
    openJobs: 6,
    description: 'Core software engineering, cloud architecture, security, and hardware biometric systems.',
  },
  {
    id: 2,
    name: 'Product & Design',
    code: 'DES',
    lead: 'Emily Zhang',
    leadAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    headcount: 28,
    budget: '$920,000',
    openJobs: 3,
    description: 'Product strategy, UX research, enterprise UI design systems, and design tokens.',
  },
  {
    id: 3,
    name: 'People Operations & HR',
    code: 'HR',
    lead: 'Chloe Bennett',
    leadAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    headcount: 14,
    budget: '$480,000',
    openJobs: 2,
    description: 'Talent acquisition, employee welfare, workplace culture, and compliance.',
  },
  {
    id: 4,
    name: 'Marketing & Growth',
    code: 'MKT',
    lead: 'Sarah Jenkins',
    leadAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    headcount: 22,
    budget: '$750,000',
    openJobs: 4,
    description: 'Brand strategy, developer advocacy, content marketing, and customer acquisition.',
  },
  {
    id: 5,
    name: 'Finance & Global Payroll',
    code: 'FIN',
    lead: 'David Miller',
    leadAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    headcount: 12,
    budget: '$420,000',
    openJobs: 1,
    description: 'Corporate accounting, multi-currency payroll disbursements, and tax auditing.',
  },
];

const Departments = () => {
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Department Form
  const [form, setForm] = useState({
    name: '',
    code: '',
    lead: 'Alex Mercer',
    budget: '$500,000',
    description: '',
  });

  const handleCreateDept = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    const newDept = {
      id: Date.now(),
      name: form.name,
      code: form.code.toUpperCase(),
      lead: form.lead,
      leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      headcount: 1,
      budget: form.budget,
      openJobs: 0,
      description: form.description || 'Department business unit.',
    };

    setDepartments([...departments, newDept]);
    setIsAddOpen(false);
    setForm({
      name: '',
      code: '',
      lead: 'Alex Mercer',
      budget: '$500,000',
      description: '',
    });
    setToastMsg(`Department "${form.name}" created successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.lead.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalDepts: departments.length,
    totalStaff: departments.reduce((acc, d) => acc + d.headcount, 0),
    openRequisitions: departments.reduce((acc, d) => acc + d.openJobs, 0),
    totalBudget: '$4,420,000',
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Department Management & Org Units"
        subtitle="Manage organizational structures, departmental leadership, headcount allocations, and annual budgets."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STATS METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Units</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalDepts} Departments</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Staff Allocated</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalStaff} Members</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Open Requisitions</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.openRequisitions} Openings</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total Org Budget</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalBudget}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & ADD TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments by name, code, or department lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Department</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. DEPARTMENT CARDS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
                  {d.code}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                  {d.headcount} Members
                </span>
              </div>

              <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {d.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {d.description}
              </p>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Budget</span>
                  <span className="font-bold text-slate-900 dark:text-white">{d.budget}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Open Jobs</span>
                  <span className="font-bold text-emerald-600">{d.openJobs} Active Roles</span>
                </div>
              </div>
            </div>

            {/* Footer: Lead Avatar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={d.leadAvatar}
                  alt={d.lead}
                  className="w-7 h-7 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold leading-none">DIRECTOR / LEAD</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{d.lead}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: CREATE DEPARTMENT */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Department Unit</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data & Analytics"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DTA"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Appointed Lead</label>
                  <select
                    value={form.lead}
                    onChange={(e) => setForm({ ...form, lead: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Alex Mercer">Alex Mercer</option>
                    <option value="Emily Zhang">Emily Zhang</option>
                    <option value="Chloe Bennett">Chloe Bennett</option>
                    <option value="David Miller">David Miller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Budget Allocation</label>
                  <input
                    type="text"
                    placeholder="e.g. $600,000"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize mission and scope..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
