import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Briefcase, Users, UserCheck, Clock, ArrowUpRight } from 'lucide-react';

const JobDesk = () => {
  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Recruiter Command Desk" subtitle="Recruitment metrics, candidate pipeline overview, and hiring velocity" />

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Open Requisitions</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">12 Jobs</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Total Applicants</span>
          <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">103 Candidates</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Interviews Conducted</span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">24 This Month</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Avg Time to Hire</span>
          <h3 className="text-2xl font-black text-amber-500 mt-1">18 Days</h3>
        </div>
      </div>

      {/* Recruitment Pipeline Breakdown */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Recruitment Funnel</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-bold">Applied</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">103</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 space-y-1">
            <span className="text-xs text-indigo-500 font-bold">Screened</span>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">48</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/40 space-y-1">
            <span className="text-xs text-amber-500 font-bold">Interviewing</span>
            <p className="text-xl font-black text-amber-600">24</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/40 space-y-1">
            <span className="text-xs text-purple-500 font-bold">Offered</span>
            <p className="text-xl font-black text-purple-600">6</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 space-y-1">
            <span className="text-xs text-emerald-500 font-bold">Hired</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">4</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDesk;
