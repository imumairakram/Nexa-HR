import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Briefcase, Plus, CheckCircle2 } from 'lucide-react';

const INITIAL = [
  { id: 1, name: 'Full-Time Permanent', code: 'FT', hours: '40 hrs/wk', count: 12 },
  { id: 2, name: 'Contract / Project-Based', code: 'CON', hours: 'Flexible', count: 2 },
  { id: 3, name: 'Internship / Co-op', code: 'INT', hours: '20-40 hrs/wk', count: 2 },
];

const JobType = () => {
  const [types, setTypes] = useState(INITIAL);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 max-w-4xl mx-auto">
      <AppPageHeader title="Employment & Contract Types" subtitle="Configure employment arrangements and work commitments." />

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Supported Contract Types</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Contract Type</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Weekly Commitment</th>
                <th className="py-3.5 px-4 text-right">Active Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{t.name}</td>
                  <td className="py-4 px-4 font-mono text-blue-600 font-bold">{t.code}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">{t.hours}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-700 dark:text-slate-300">{t.count} Roles</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobType;
