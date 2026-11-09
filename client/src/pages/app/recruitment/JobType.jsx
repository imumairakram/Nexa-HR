import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Briefcase, Plus, CheckCircle2, X, Search, Clock, Users, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../../services/api';

const JobType = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newType, setNewType] = useState({ name: '', code: '', hours: '', benefits: '' });
  const [toastMsg, setToastMsg] = useState('');

  const loadTypes = async () => {
    setLoading(true);
    try {
      const res = await api.getRecruitmentTaxonomies('TYPE');
      if (res?.success && res.data?.items) {
        setTypes(res.data.items);
      } else {
        setTypes([]);
      }
    } catch {
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newType.name.trim()) return;

    try {
      const payload = {
        type: 'TYPE',
        name: newType.name.trim(),
        code: newType.code.toUpperCase().trim() || 'TYPE',
        hours: newType.hours,
        benefits: newType.benefits,
        count: 0,
      };

      const res = await api.createRecruitmentTaxonomy(payload);
      if (res?.success && res.data?.item) {
        const item = res.data.item;
        const updated = [item, ...types];
        setTypes(updated);
        try {
          localStorage.setItem('nexahr_job_types', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        setToastMsg(`Employment contract "${newType.name}" saved to database!`);
      } else {
        throw new Error(res?.message || 'Failed to save job type');
      }
    } catch (err) {
      console.error('Error saving job type:', err);
      setToastMsg(`Error: ${err.message || 'Failed to save job type to database'}`);
    } finally {
      setIsAddOpen(false);
      setNewType({ name: '', code: '', hours: '', benefits: '' });
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  const filtered = types.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Employment & Contract Types Master Table"
        subtitle="Configure standard employment arrangements, working commitments, and benefit eligibility tracks."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC JOB TYPE HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Type Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Employment & Contract Types Master Table
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Configure standard employment arrangements, working commitments, flexible schedules, and benefit eligibility tracks.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center text-sky-700 dark:text-sky-300 font-bold bg-sky-100/60 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800/60">
                
<span>{types.length} Contract Models</span>
              </span>
              <span className="flex items-center text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                
<span>{types.reduce((acc, t) => acc + t.count, 0)} Active Requisitions</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Add Arrangement</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Define contract model</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Contract Type</span>
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
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Contract Types</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {types.length} <span className="text-base font-bold text-slate-400">Models</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Standard Arrangements</span>
              <span className="text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Full-Time Roles</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {types.find((t) => t.code === 'FT')?.count || 12} <span className="text-base font-bold text-slate-400">Active</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Permanent Staff</span>
              <span className="text-slate-400">Benefits Included</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-sky-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Remote Allowed</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-sky-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              100% Flexible
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Async & Hybrid</span>
              <span className="text-slate-400">Supported</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Compliance</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              W-2 / 1099
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Labor Compliant</span>
              <span className="text-slate-400">Standardized</span>
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
              placeholder="Search contract types..."
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
            <span>Add Contract Type</span>
          </button>
        </div>

        {/* Mobile Responsive Grid View (Hidden on Desktop) */}
        <div className="block md:hidden p-3.5 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t.name}</div>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg shrink-0">
                    {t.code}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 py-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Hours</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{t.hours}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Roles</span>
                    <span className="font-black text-slate-900 dark:text-white">{t.count} Roles</span>
                  </div>
                </div>
                {t.benefits && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    {t.benefits}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Contract Type</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Weekly Commitment</th>
                <th className="py-3.5 px-4">Benefits Coverage</th>
                <th className="py-3.5 px-4 text-right">Active Requisitions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{t.name}</td>
                  <td className="py-4 px-4 font-mono text-xs text-blue-600 font-bold">{t.code}</td>
                  <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">{t.hours}</td>
                  <td className="py-4 px-4 text-slate-500">{t.benefits}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">{t.count} Roles</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD EMPLOYMENT TYPE */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-lg w-full shadow-2xl border border-blue-200/60 dark:border-blue-800/60 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Ambient background blur orbs */}
            <div className="absolute top-0 right-10 w-48 h-48 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-indigo-400/20 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-blue-200/50 dark:border-blue-800/50 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/60 dark:via-indigo-950/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 ring-4 ring-blue-500/15">
                  <Briefcase className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Add Employment Type
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    Define contractual engagements, statutory work hours, and baseline compensation models.
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

            {/* Form Body */}
            <form onSubmit={handleAdd} className="p-6 sm:p-7 space-y-4 text-xs relative z-10">
              {/* Type Name */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Engagement Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Part-Time Hourly Specialist"
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Code & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Contract Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PT"
                    value={newType.code}
                    onChange={(e) => setNewType({ ...newType, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase transition-all placeholder:text-slate-400 text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Hours / Week Expectation
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. 20 - 30 hrs / week"
                      value={newType.hours}
                      onChange={(e) => setNewType({ ...newType, hours: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-blue-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-mono font-black text-xs shadow-sm">
                    {newType.code.trim() || 'TYP'}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {newType.name.trim() || 'Engagement Type Preview'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Workload: {newType.hours || 'Standard 40h'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {newType.code || 'Contract'}
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Save Engagement Type</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobType;
