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

const STAGES = [
  { key: 'APPLIED', label: '1. Sourced & Applied', color: 'border-blue-500' },
  { key: 'SCREENING', label: '2. Screening Call', color: 'border-amber-500' },
  { key: 'INTERVIEWING', label: '3. Technical Interview', color: 'border-purple-500' },
  { key: 'OFFER', label: '4. Offer Extended', color: 'border-indigo-500' },
  { key: 'HIRED', label: '5. Signed & Hired', color: 'border-emerald-500' },
];

const INITIAL_PIPELINE = {
  APPLIED: [
    {
      id: 'APP-9904',
      name: 'Fatima Noor',
      role: 'Senior Talent Acquisition Specialist',
      rating: 4.6,
      exp: '4.5 Years',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  ],
  SCREENING: [
    {
      id: 'APP-9903',
      name: 'Michael Zhang',
      role: 'DevOps & Kubernetes Architect',
      rating: 4.7,
      exp: '8.0 Years',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  ],
  INTERVIEWING: [
    {
      id: 'APP-9901',
      name: 'David K. Vance',
      role: 'Senior React & Node Engineer',
      rating: 4.9,
      exp: '6.5 Years',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  ],
  OFFER: [
    {
      id: 'APP-9902',
      name: 'Ayesha Tariq',
      role: 'Lead Product Designer (Figma)',
      rating: 4.8,
      exp: '5.0 Years',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  ],
  HIRED: [
    {
      id: 'APP-9905',
      name: 'Zainab Qureshi',
      role: 'Financial Operations Analyst',
      rating: 4.9,
      exp: '3.5 Years',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  ],
};

const JobBoard = () => {
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_recruitment_kanban');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasItems = Object.values(parsed).some((list) => list && list.length > 0);
        if (hasItems) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_PIPELINE;
  });

  const [toastMsg, setToastMsg] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    role: 'Senior Software Engineer',
    stage: 'APPLIED',
    rating: '4.8',
    exp: '4 Years',
  });

  const moveCandidate = (candidate, fromCol, toCol) => {
    const updated = {
      ...columns,
      [fromCol]: (columns[fromCol] || []).filter((c) => c.id !== candidate.id),
      [toCol]: [...(columns[toCol] || []), candidate],
    };
    setColumns(updated);
    try {
      localStorage.setItem('nexahr_recruitment_kanban', JSON.stringify(updated));

      // Synchronize back to applications
      const apps = JSON.parse(localStorage.getItem('nexahr_recruitment_applications') || '[]');
      const updatedApps = apps.map((a) => {
        if (a.id === candidate.id) {
          return { ...a, stage: toCol };
        }
        return a;
      });
      localStorage.setItem('nexahr_recruitment_applications', JSON.stringify(updatedApps));
    } catch (e) {
      console.error(e);
    }
    setToastMsg(`Advanced ${candidate.name} to "${toCol.replace('_', ' ')}"!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCandidate.name.trim()) return;

    const cand = {
      id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCandidate.name.trim(),
      role: newCandidate.role,
      rating: parseFloat(newCandidate.rating) || 4.7,
      exp: newCandidate.exp,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    const targetStage = newCandidate.stage;
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

    setIsAddOpen(false);
    setNewCandidate({
      name: '',
      role: 'Senior Software Engineer',
      stage: 'APPLIED',
      rating: '4.8',
      exp: '4 Years',
    });
    setToastMsg(`Candidate "${cand.name}" added to ${targetStage} board!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const totalCandidates = Object.values(columns).reduce((acc, list) => acc + (list ? list.length : 0), 0);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Candidate Hiring Pipeline Kanban Board"
        subtitle="Track candidates across hiring stages from initial resume application to final employment offer."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC KANBAN PIPELINE HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
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

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Users className="w-3.5 h-3.5" />
                <span>{totalCandidates} Candidates Active</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{columns.HIRED?.length || 0} Hired This Month</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Active Stages</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Click arrows to advance stage</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Add Candidate to Kanban</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Applied Position</label>
                <input
                  type="text"
                  value={newCandidate.role}
                  onChange={(e) => setNewCandidate({ ...newCandidate, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Initial Stage</label>
                  <select
                    value={newCandidate.stage}
                    onChange={(e) => setNewCandidate({ ...newCandidate, stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Experience</label>
                  <input
                    type="text"
                    value={newCandidate.exp}
                    onChange={(e) => setNewCandidate({ ...newCandidate, exp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
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
