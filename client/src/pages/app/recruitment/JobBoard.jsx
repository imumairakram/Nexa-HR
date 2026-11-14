import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  Users,
  Search,
  Filter,
  Star,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  CheckCircle2,
  UserPlus,
  Plus,
  X,
  RefreshCw,
} from 'lucide-react';

import { api } from '../../../services/api';

const STAGES = [
  { key: 'APPLIED', label: '1. Sourced & Applied', color: 'border-blue-500' },
  { key: 'SCREENING', label: '2. Screening Call', color: 'border-amber-500' },
  { key: 'INTERVIEWING', label: '3. Technical Interview', color: 'border-purple-500' },
  { key: 'OFFER', label: '4. Offer Extended', color: 'border-sky-500' },
  { key: 'HIRED', label: '5. Signed & Hired', color: 'border-emerald-500' },
];

const INITIAL_PIPELINE = {
  APPLIED: [],
  SCREENING: [],
  INTERVIEWING: [],
  OFFER: [],
  HIRED: [],
};

const JobBoard = () => {
  const [columns, setColumns] = useState(INITIAL_PIPELINE);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    role: '',
    stage: 'APPLIED',
    rating: '5.0',
    exp: '',
  });

  const loadPipeline = async () => {
    setLoading(true);
    try {
      const res = await api.getJobApplications();
      if (res?.success && res.data?.applications) {
        const apps = res.data.applications;
        const pipeline = {
          APPLIED: apps.filter((a) => a.stage === 'APPLIED'),
          SCREENING: apps.filter((a) => a.stage === 'SCREENING'),
          INTERVIEWING: apps.filter((a) => a.stage === 'INTERVIEWING' || a.stage === 'INTERVIEW'),
          OFFER: apps.filter((a) => a.stage === 'OFFER'),
          HIRED: apps.filter((a) => a.stage === 'HIRED'),
        };
        setColumns(pipeline);
      } else {
        setColumns(INITIAL_PIPELINE);
      }
    } catch (err) {
      console.warn('Failed to load applications from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const moveCandidate = async (candidate, fromCol, toCol) => {
    const backendStage = toCol === 'INTERVIEWING' ? 'INTERVIEW' : toCol;
    try {
      await api.updateJobApplicationStage(candidate.id, backendStage);
    } catch (e) {
      console.warn('API error updating candidate stage:', e);
    }

    const updated = {
      ...columns,
      [fromCol]: (columns[fromCol] || []).filter((c) => c.id !== candidate.id),
      [toCol]: [...(columns[toCol] || []), { ...candidate, stage: toCol }],
    };
    setColumns(updated);
    try {
      localStorage.setItem('nexahr_recruitment_kanban', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setToastMsg(`Advanced ${candidate.name} to "${toCol.replace('_', ' ')}"!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCandidate.name.trim()) return;

    try {
      const targetStage = newCandidate.stage;
      const backendStage = targetStage === 'INTERVIEWING' ? 'INTERVIEW' : targetStage;
      const payload = {
        name: newCandidate.name.trim(),
        role: newCandidate.role,
        department: 'Engineering & DevOps',
        email: `${newCandidate.name.toLowerCase().replace(/\s+/g, '.')}@talent.org`,
        stage: backendStage,
        experience: newCandidate.exp,
        rating: parseFloat(newCandidate.rating) || 4.7,
      };

      const res = await api.createJobApplication(payload);
      if (res?.success && res.data?.application) {
        const cand = res.data.application;
        const updated = {
          ...columns,
          [targetStage]: [cand, ...(columns[targetStage] || [])],
        };
        setColumns(updated);
        try {
          localStorage.setItem('nexahr_recruitment_kanban', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        setToastMsg(`Candidate "${cand.name}" saved to database in ${targetStage} board!`);
      } else {
        throw new Error(res?.message || 'Failed to save candidate to database');
      }
    } catch (err) {
      console.error('Error saving candidate:', err);
      setToastMsg(`Error: ${err.message || 'Failed to save candidate'}`);
    } finally {
      setIsAddOpen(false);
      setNewCandidate({
        name: '',
        role: '',
        stage: 'APPLIED',
        rating: '5.0',
        exp: '',
      });
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  const totalCandidates = Object.values(columns).reduce((acc, list) => acc + (list ? list.length : 0), 0);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Candidate Hiring Pipeline"
        subtitle="Track candidates across hiring stages from initial resume application to final employment offer."
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
      {/* 1. DYNAMIC KANBAN PIPELINE HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Pipeline Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Candidate Hiring Pipeline & Kanban Board
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Seamlessly drag and advance candidates from sourced applications, technical screenings, and panel loops to offer negotiation.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{totalCandidates} Candidates Active</span>
              </span>
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{columns.INTERVIEW?.length || 0} In Interview Loop</span>
              </span>
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{columns.HIRED?.length || 0} Finalist Hires</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Active Stages</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Click arrows to advance stage</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Candidate</span>
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
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total in Pipeline</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalCandidates} <span className="text-base font-bold text-slate-400">Candidates</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Active Funnel</span>
              <span className="text-slate-400">All Tracks</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">In Screening</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 shadow-xs">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              {(columns.APPLIED?.length || 0) + (columns.SCREENING?.length || 0)} <span className="text-base font-bold text-slate-400">Candidates</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Resume & Screen</span>
              <span className="text-slate-400">Stage 1-2</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-purple-500/40 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">In Interview</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/50 shadow-xs">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {columns.INTERVIEWING?.length || 0} <span className="text-base font-bold text-slate-400">Candidates</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-purple-600 dark:text-purple-400 font-bold">Technical Loop</span>
              <span className="text-slate-400">Stage 3</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Offer / Hired</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {(columns.OFFER?.length || 0) + (columns.HIRED?.length || 0)} <span className="text-base font-bold text-slate-400">Candidates</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Closing Phase</span>
              <span className="text-slate-400">Stage 4-5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. KANBAN BOARD STAGES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage, sIdx) => {
          const list = columns[stage.key] || [];

          return (
            <div
              key={stage.key}
              className="bg-slate-100/70 dark:bg-[#1E293B] rounded-3xl p-4 flex flex-col justify-between border border-slate-200/60 dark:border-slate-800 min-w-[240px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {stage.label}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {list.length}
                  </span>
                </div>

                {/* Candidate cards */}
                <div className="space-y-3">
                  {list.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 shadow-soft border border-slate-100 dark:border-slate-700/60 space-y-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{c.role}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/40">
                        <span className="text-amber-500 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-current" /> {c.rating}
                        </span>
                        <span>{c.exp}</span>
                      </div>

                      {/* Move buttons */}
                      <div className="flex items-center justify-between pt-1">
                        {sIdx > 0 && (
                          <button
                            onClick={() => moveCandidate(c, stage.key, STAGES[sIdx - 1].key)}
                            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-900 cursor-pointer"
                            title={`Move back to ${STAGES[sIdx - 1].label}`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-[9px] font-mono text-slate-400">{c.id}</span>
                        {sIdx < STAGES.length - 1 && (
                          <button
                            onClick={() => moveCandidate(c, stage.key, STAGES[sIdx + 1].key)}
                            className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 cursor-pointer ml-auto"
                            title={`Advance to ${STAGES[sIdx + 1].label}`}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {list.length === 0 && (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                      No candidates in this stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD CANDIDATE */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-md w-full shadow-2xl border border-sky-200/60 dark:border-indigo-800/60 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-sky-100/80 dark:border-sky-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/60 dark:via-sky-900/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 ring-4 ring-sky-500/15">
                  <UserPlus className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">Add Candidate to Pipeline</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">Register candidate card into initial evaluation stage.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs relative z-10">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Applied Position</label>
                <input
                  type="text"
                  value={newCandidate.role}
                  onChange={(e) => setNewCandidate({ ...newCandidate, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Initial Stage</label>
                  <select
                    value={newCandidate.stage}
                    onChange={(e) => setNewCandidate({ ...newCandidate, stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Experience</label>
                  <input
                    type="text"
                    value={newCandidate.exp}
                    onChange={(e) => setNewCandidate({ ...newCandidate, exp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold shadow-md shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
