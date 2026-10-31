import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Clock, Plus, CheckCircle2, Search, X, Users, Award, ShieldCheck, Briefcase, RefreshCw } from 'lucide-react';
import { api } from '../../../services/api';

const JobExperience = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', code: '', salaryRange: '' });
  const [toastMsg, setToastMsg] = useState('');

  const loadExperiences = async () => {
    setLoading(true);
    try {
      const res = await api.getRecruitmentTaxonomies('EXPERIENCE');
      if (res?.success && res.data?.items) {
        setItems(res.data.items);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.label.trim()) return;

    try {
      const payload = {
        type: 'EXPERIENCE',
        name: newItem.label.trim(),
        label: newItem.label.trim(),
        code: newItem.code.toUpperCase().trim() || 'EXP',
        minYears: 1,
        maxYears: 3,
        salaryRange: newItem.salaryRange,
        count: 0,
      };

      const res = await api.createRecruitmentTaxonomy(payload);
      if (res?.success && res.data?.item) {
        const item = res.data.item;
        const updated = [item, ...items];
        setItems(updated);
        try {
          localStorage.setItem('nexahr_job_experiences', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        setToastMsg(`Experience seniority track "${newItem.label}" saved to database!`);
      } else {
        throw new Error(res?.message || 'Failed to save experience tier');
      }
    } catch (err) {
      console.error('Error saving experience tier:', err);
      setToastMsg(`Error: ${err.message || 'Failed to save experience tier to database'}`);
    } finally {
      setIsAddOpen(false);
      setNewItem({ label: '', code: '', salaryRange: '' });
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Experience Bands & Seniority Tiers Master Table"
        subtitle="Configure candidate years-of-experience criteria, career progression levels, and benchmark compensation."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC JOB EXPERIENCE HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Experience Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Experience Bands & Seniority Tiers Master Table
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Configure candidate years-of-experience criteria, career progression levels, and benchmark compensation salary bands.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold bg-sky-100/60 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800/60">
                <Award className="w-3.5 h-3.5" />
                <span>{items.length} Seniority Tiers</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{items.reduce((acc, i) => acc + i.count, 0)} Active Job Roles</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Add Seniority Band</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Define experience bracket</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Seniority Tier</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Seniority Tiers</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {items.length} <span className="text-base font-bold text-slate-400">Bands</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Standard Progression</span>
              <span className="text-slate-400">Track</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Active Openings</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {items.reduce((acc, i) => acc + i.count, 0)} <span className="text-base font-bold text-slate-400">Roles</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Allocated Openings</span>
              <span className="text-slate-400">All Depts</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-sky-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Mid-Senior Ratio</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-sky-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              75% <span className="text-base font-bold text-slate-400">Core</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Experienced Hires</span>
              <span className="text-slate-400">Weighted</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Top Compensation</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              $220k <span className="text-base font-bold text-slate-400">Max</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Senior Cap</span>
              <span className="text-slate-400">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search experience tiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience Tier</span>
          </button>
        </div>

        {/* Mobile Responsive Grid View (Hidden on Desktop) */}
        <div className="block md:hidden p-3.5 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filtered.map((i) => (
              <div
                key={i.id}
                className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">{i.label}</div>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg shrink-0">
                    {i.code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{i.salaryRange}</span>
                  <span className="font-black text-slate-900 dark:text-white">{i.count} Roles</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Experience Tier & Seniority</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Benchmark Compensation</th>
                <th className="py-3.5 px-4 text-right">Active Openings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{i.label}</td>
                  <td className="py-4 px-4 font-mono text-xs text-blue-600 font-bold">{i.code}</td>
                  <td className="py-4 px-4 font-medium text-emerald-600 dark:text-emerald-400">{i.salaryRange}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">{i.count} Roles</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD SENIORITY TIER (STITCH LUXURY DESIGN) */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-lg w-full shadow-2xl border border-sky-200/60 dark:border-indigo-800/60 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-100/80 dark:border-sky-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/60 dark:via-sky-900/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 ring-4 ring-sky-500/15">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Add Seniority Tier
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Configure career seniority brackets, required years of experience, and baseline compensation bands.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAdd} className="overflow-y-auto flex-1 p-6 sm:p-7 space-y-4 custom-scrollbar text-xs relative z-10">
              {/* Tier Name */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Tier Title & Experience Band <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal Architect (10+ Years)"
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Code & Salary Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Tier Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRIN"
                    value={newItem.code}
                    onChange={(e) => setNewItem({ ...newItem, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none uppercase transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Salary Range Bracket
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $180k - $240k"
                    value={newItem.salaryRange}
                    onChange={(e) => setNewItem({ ...newItem, salaryRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-indigo-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-mono font-black text-xs shadow-sm">
                    {newItem.code.trim() || 'EXP'}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {newItem.label.trim() || 'Seniority Tier Preview'}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                      Compensation: {newItem.salaryRange || '$100k+'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {newItem.code || 'Tier'}
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Save Seniority Tier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobExperience;
