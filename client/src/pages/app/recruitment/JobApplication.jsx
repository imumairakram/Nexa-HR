import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Users, Search, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react';

const JobApplication = () => {
  const [applications, setApplications] = useState([
    { id: 'APP-101', candidate: 'Michael Scott', role: 'Senior Full Stack Engineer', appliedDate: '08/04/2026', matchScore: '94%', stage: 'INTERVIEW' },
    { id: 'APP-102', candidate: 'Jessica Alba', role: 'Lead Product Designer', appliedDate: '08/03/2026', matchScore: '88%', stage: 'SCREENING' },
    { id: 'APP-103', candidate: 'Robert Vance', role: 'HR Generalist', appliedDate: '08/02/2026', matchScore: '76%', stage: 'APPLIED' },
    { id: 'APP-104', candidate: 'Pam Beesly', role: 'Lead Product Designer', appliedDate: '08/01/2026', matchScore: '92%', stage: 'OFFERED' },
  ]);

  const [search, setSearch] = useState('');

  const filtered = applications.filter(a =>
    a.candidate.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Job Applicant Tracking System (ATS)" subtitle="Review incoming candidate resumes, AI match scores, and interview stages" />

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">Total Applicants: {filtered.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-3 px-4">Applicant ID</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Match Score</th>
                <th className="py-3 px-4">Pipeline Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{a.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{a.candidate}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{a.role}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px]">
                      {a.matchScore} Match
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      {a.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold space-x-2">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">View Resume</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobApplication;
