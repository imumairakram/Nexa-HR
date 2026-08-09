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
  X,
  FileText,
  Sparkles,
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
      {/* 1. STATS METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leave Categories</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{policies.length} Policies</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Paid Vacation</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">14 Days / Yr</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Parental Leave</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">30 Days Paid</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Accrual Frequency</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">Monthly Auto</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOOLBAR & CREATE CTA */}
      {/* ========================================================================= */}
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
