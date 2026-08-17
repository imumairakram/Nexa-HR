import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  CalendarDays,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  FileText,
} from 'lucide-react';

const INITIAL_POLICIES = [
  {
    id: 1,
    name: 'Annual Paid Vacation Leave',
    code: 'ANNUAL',
    days: 14,
    type: 'PAID',
    accrual: '1.16 Days / Month',
    carryover: 'Max 5 Days Carryover',
    color: 'from-emerald-500 to-teal-600',
    description: 'Mandatory standard paid time off for rest, holidays, and family vacations. Accrues monthly from start date.',
  },
  {
    id: 2,
    name: 'Casual / Personal Leave',
    code: 'CASUAL',
    days: 6,
    type: 'PAID',
    accrual: 'Annual Lump Sum (Jan 1)',
    carryover: 'No Carryover (Expires Dec 31)',
    color: 'from-blue-500 to-indigo-600',
    description: 'Short-notice time off for urgent personal appointments, family events, or emergency errands.',
  },
  {
    id: 3,
    name: 'Sick & Medical Emergency Leave',
    code: 'SICK',
    days: 8,
    type: 'PAID',
    accrual: 'Annual Lump Sum',
    carryover: 'Max 3 Days Carryover',
    color: 'from-amber-500 to-orange-600',
    description: 'Covers temporary illness, medical consultations, dental procedures, and doctor appointments.',
  },
  {
    id: 4,
    name: 'Maternity & Paternity Parental Leave',
    code: 'PARENTAL',
    days: 30,
    type: 'PAID',
    accrual: 'Event-Based (Qualifying Event)',
    carryover: 'Used within 12 Months',
    color: 'from-purple-500 to-pink-600',
    description: 'Full-salary parental bonding leave for new parents, childbirth, and legal adoption placement.',
  },
  {
    id: 5,
    name: 'Compassionate & Bereavement Leave',
    code: 'BEREAVEMENT',
    days: 5,
    type: 'PAID',
    accrual: 'Event-Based',
    carryover: 'No Carryover',
    color: 'from-slate-600 to-slate-800',
    description: 'Paid compassionate leave provided upon the loss of an immediate family member.',
  },
  {
    id: 6,
    name: 'Unpaid Sabbatical / Extended Leave',
    code: 'UNPAID',
    days: 60,
    type: 'UNPAID',
    accrual: 'Requires Board Approval',
    carryover: 'No Accrual',
    color: 'from-rose-500 to-red-600',
    description: 'Extended leave without compensation for academic pursuits, career breaks, or personal sabbaticals.',
  },
];

const LeavePolicy = () => {
  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Policy Form State
  const [form, setForm] = useState({
    name: '',
    code: '',
    days: 10,
    type: 'PAID',
    accrual: 'Monthly Accrual',
    carryover: 'Max 3 Days',
    description: '',
  });

  const handleCreatePolicy = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    const newPolicy = {
      id: Date.now(),
      name: form.name,
      code: form.code.toUpperCase(),
      days: parseInt(form.days) || 10,
      type: form.type,
      accrual: form.accrual,
      carryover: form.carryover,
      color: 'from-blue-500 to-indigo-600',
      description: form.description || 'Custom company leave policy guideline.',
    };

    setPolicies([...policies, newPolicy]);
    setIsAddOpen(false);
    setForm({
      name: '',
      code: '',
      days: 10,
      type: 'PAID',
      accrual: 'Monthly Accrual',
      carryover: 'Max 3 Days',
      description: '',
    });
    setToastMsg(`Leave policy "${form.name}" created successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Leave Policy Configuration & Quota Rules"
        subtitle="Establish company-wide paid time-off limits, parental allowances, accrual cycles, and carryover rules."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC LEAVE POLICY HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-blue-200/70 dark:border-blue-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Policy Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-extrabold border border-blue-600/20 dark:border-blue-500/30">
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Statutory Labor Entitlements Active</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-600/20 dark:border-indigo-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>FY26 Rules Synchronized</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Corporate Leave Policies & Accrual Matrix
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Configure organizational annual paid leave quotas, medical allowances, maternity entitlements, and rollover carryover ceilings.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{policies.length} Active Policy Tiers</span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Clock className="w-3.5 h-3.5" />
                <span>Automatic Monthly Accrual</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-blue-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Configure Leave Tier</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Add custom leave allowance</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create New Policy</span>
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
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Leave Categories</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {policies.length} <span className="text-base font-bold text-slate-400">Policies</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Standard & Special</span>
              <span className="text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Paid Vacation</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              14 <span className="text-base font-bold text-slate-400">Days / Yr</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Salary Paid</span>
              <span className="text-slate-400">Statutory</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-purple-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Parental Leave</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              30 <span className="text-base font-bold text-slate-400">Days Paid</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-purple-600 dark:text-purple-400 font-bold">Childbirth & Adoption</span>
              <span className="text-slate-400">Protected</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Medical Allowance</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              8 <span className="text-base font-bold text-slate-400">Days / Yr</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Emergency Coverage</span>
              <span className="text-slate-400">Lump Sum</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Policy Matrices</h3>
          <p className="text-xs text-slate-400">Rules applied to employee leave quota meters</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Leave Policy</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. POLICY CARDS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {policies.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                    p.type === 'PAID'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {p.type} LEAVE
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">{p.code}</span>
              </div>

              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{p.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {p.description}
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Allowed Quota:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black text-sm">{p.days} Days</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Accrual Cycle:</span>
                  <span>{p.accrual}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Carryover Limit:</span>
                  <span>{p.carryover}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: ADD POLICY */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Leave Policy</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Policy Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Study / Exam Leave"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Policy Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STUDY"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Days Allowed (Per Year) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.days}
                    onChange={(e) => setForm({ ...form, days: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Compensation Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="PAID">Fully Paid Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Policy Summary Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details on eligibility and proof required..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
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
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePolicy;
