import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Briefcase, Plus } from 'lucide-react';

const JobType = () => {
  const [types, setTypes] = useState([
    { id: 1, name: 'Full-Time Regular', code: 'FT', count: 12 },
    { id: 2, name: 'Part-Time', code: 'PT', count: 3 },
    { id: 3, name: 'Remote Contract', code: 'CNT', count: 5 },
    { id: 4, name: 'Paid Internship', code: 'INT', count: 4 },
  ]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Employment Types" subtitle="Manage work arrangement types (Full-Time, Part-Time, Contract, Remote)" />

      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Configured Job Types</h3>
          <p className="text-xs text-slate-400">Used during job posting creation</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Add Job Type</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {types.map((t) => (
          <div key={t.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              {t.code}
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{t.name}</h4>
            <p className="text-xs text-slate-400 font-medium">{t.count} Active Postings</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobType;
