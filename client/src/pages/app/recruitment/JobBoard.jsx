import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';

const INITIAL_COLUMNS = {
  APPLIED: [
    { id: 'C-01', name: 'Maya Lin', role: 'Staff Systems Engineer', rating: 4.8, exp: '7 yrs', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80' },
    { id: 'C-02', name: 'James Wilson', role: 'Product Designer', rating: 4.5, exp: '4 yrs', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
  ],
  SCREENING: [
    { id: 'C-03', name: 'Elena Rostova', role: 'DevOps & Security Lead', rating: 5.0, exp: '8 yrs', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
  ],
  INTERVIEWING: [
    { id: 'C-04', name: 'Devon Vance', role: 'Firmware Specialist', rating: 4.9, exp: '6 yrs', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
    { id: 'C-05', name: 'Aaliyah Patel', role: 'Growth Marketing Lead', rating: 4.7, exp: '5 yrs', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
  ],
  OFFER: [
    { id: 'C-06', name: 'Lucas Scott', role: 'Full-Stack Developer', rating: 5.0, exp: '5 yrs', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
  ],
  HIRED: [
    { id: 'C-07', name: 'Jordan Hayes', role: 'Senior Frontend Engineer', rating: 5.0, exp: '6 yrs', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
  ],
};

const STAGES = [
  { key: 'APPLIED', label: '1. Sourced & Applied', color: 'border-blue-500' },
  { key: 'SCREENING', label: '2. Screening Call', color: 'border-amber-500' },
  { key: 'INTERVIEWING', label: '3. Technical Interview', color: 'border-purple-500' },
  { key: 'OFFER', label: '4. Offer Extended', color: 'border-indigo-500' },
  { key: 'HIRED', label: '5. Signed & Hired', color: 'border-emerald-500' },
];

const JobBoard = () => {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [toastMsg, setToastMsg] = useState('');

  const moveCandidate = (candidate, fromCol, toCol) => {
    setColumns({
      ...columns,
      [fromCol]: columns[fromCol].filter((c) => c.id !== candidate.id),
      [toCol]: [...columns[toCol], candidate],
    });
    setToastMsg(`Moved ${candidate.name} to ${toCol.replace('_', ' ')}!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

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

      {/* Kanban Board Container */}
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
                        <span>{c.exp} Experience</span>
                      </div>

                      {/* Move buttons */}
                      <div className="flex items-center justify-between pt-1">
                        {sIdx > 0 && (
                          <button
                            onClick={() => moveCandidate(c, stage.key, STAGES[sIdx - 1].key)}
                            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-900 cursor-pointer"
                            title="Move back"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-[9px] font-mono text-slate-400">{c.id}</span>
                        {sIdx < STAGES.length - 1 && (
                          <button
                            onClick={() => moveCandidate(c, stage.key, STAGES[sIdx + 1].key)}
                            className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 cursor-pointer ml-auto"
                            title="Advance candidate"
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
    </div>
  );
};

export default JobBoard;
