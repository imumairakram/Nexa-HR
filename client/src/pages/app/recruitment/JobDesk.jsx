import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  Briefcase,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';

const JobDesk = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Recruiter Command Desk & Talent Intelligence"
        subtitle="Real-time hiring velocity, candidate conversion funnels, open requisition metrics, and interview loads."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Positions</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">16 Roles</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Pipeline</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">184 Candidates</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Avg Time-to-Hire</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">18 Days</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Offer Acceptance</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">94%</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/app/recruitment/jobs')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-blue-400 transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 w-fit">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
            Manage Job Openings
          </h3>
          <p className="text-xs text-slate-400">Review all 16 active job requisitions and salary bands</p>
          <div className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
            <span>Explore Openings</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => navigate('/app/recruitment/board')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-emerald-400 transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 w-fit">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
            Candidate Kanban Pipeline
          </h3>
          <p className="text-xs text-slate-400">Advance applicants across 5 hiring stages</p>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-2">
            <span>Open Kanban Board</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => navigate('/app/recruitment/interviews')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-indigo-400 transition-all cursor-pointer space-y-3 group"
        >
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 w-fit">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
            Interview Schedules
          </h3>
          <p className="text-xs text-slate-400">18 active panel interviews scheduled this week</p>
          <div className="text-xs font-bold text-indigo-600 flex items-center gap-1 pt-2">
            <span>View Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDesk;
