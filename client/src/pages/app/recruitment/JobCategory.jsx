import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Tag, Plus, Search, CheckCircle2, X, Trash2, Layers, Briefcase, Building, RefreshCw } from 'lucide-react';
import { api } from '../../../services/api';

const JobCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCat, setNewCat] = useState({ name: '', code: '', lead: '' });
  const [toastMsg, setToastMsg] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getRecruitmentTaxonomies('CATEGORY');
      if (res?.success && res.data?.items) {
        setCategories(res.data.items);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    try {
      const payload = {
        type: 'CATEGORY',
        name: newCat.name.trim(),
        code: newCat.code.toUpperCase().trim() || 'CAT',
        lead: newCat.lead || 'Department Head',
        status: 'ACTIVE',
      };

      const res = await api.createRecruitmentTaxonomy(payload);
      if (res?.success && res.data?.item) {
        const item = res.data.item;
        const updated = [item, ...categories];
        setCategories(updated);
        try {
          localStorage.setItem('nexahr_job_categories', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        setToastMsg(`Job Category "${newCat.name}" saved to database!`);
      } else {
        throw new Error(res?.message || 'Failed to save category');
      }
    } catch (err) {
      console.error('Error saving job category:', err);
      setToastMsg(`Error: ${err.message || 'Failed to save category to database'}`);
    } finally {
      setIsAddOpen(false);
      setNewCat({ name: '', code: '', lead: '' });
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Job Categories & Taxonomy"
        subtitle="Organize job requisitions, career portal departments, and hiring pipelines into structured functional categories."
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC JOB CATEGORY HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-6 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Category Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
              Job Categories Master Table & Requisition Taxonomy
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-lg font-medium">
              Organize job requisitions, career portal departments, and hiring pipelines into structured functional categories.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{categories.length} Functional Clusters</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{categories.reduce((acc, c) => acc + c.count, 0)} Active Job Openings</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Add Category</div>
              <div className="text-[11px] text-white/80 mt-0.5">Define functional branch</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] dark:text-white font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Category</span>
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
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Categories</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {categories.length} <span className="text-base font-bold text-slate-400">Clusters</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Standard Taxonomy</span>
              <span className="text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Open Requisitions</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {categories.reduce((acc, c) => acc + c.count, 0)} <span className="text-base font-bold text-slate-400">Openings</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Talent Sourced</span>
              <span className="text-slate-400">Across Teams</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-sky-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Core Divisions</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-sky-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              5 <span className="text-base font-bold text-slate-400">Divisions</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Cross-Functional</span>
              <span className="text-slate-400">Mapped</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Status</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              All Active
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">100% Operational</span>
              <span className="text-slate-400">Live</span>
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
              placeholder="Search category by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-[12px] flex items-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Mobile Responsive Grid View (Hidden on Desktop) */}
        <div className="block md:hidden p-3.5 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">{c.name}</div>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-[12px] shrink-0">
                    {c.code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{c.lead}</span>
                  <span className="px-2 py-0.5 rounded-[12px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                    {c.status}
                  </span>
                </div>
                <div className="text-right font-black text-slate-900 dark:text-white text-xs pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  {c.count} Roles
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
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Department Lead</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Active Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="py-4 px-4 font-mono text-xs text-blue-600 font-bold">{c.code}</td>
                  <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{c.lead}</td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">{c.count} Roles</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD JOB CATEGORY (STITCH LUXURY DESIGN) */}
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
                  <Layers className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Add Job Category
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Create functional talent classification disciplines and recruitment sourcing channels.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAdd} className="overflow-y-auto flex-1 p-6 sm:p-7 space-y-4 custom-scrollbar text-xs relative z-10">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artificial Intelligence & Machine Learning"
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Code & Lead */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Category Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. AIML"
                      value={newCat.code}
                      onChange={(e) => setNewCat({ ...newCat, code: e.target.value.toUpperCase() })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none uppercase transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Supervising Lead
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Department Lead / VP"
                    value={newCat.lead}
                    onChange={(e) => setNewCat({ ...newCat, lead: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-indigo-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-mono font-black text-xs shadow-sm">
                    {newCat.code.trim() || 'CAT'}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {newCat.name.trim() || 'Category Discipline Preview'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {newCat.lead || 'Supervised by Department Lead'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-[12px] bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCategory;
