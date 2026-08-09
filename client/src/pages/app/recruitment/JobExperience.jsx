import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Clock, Plus, CheckCircle2 } from 'lucide-react';

const INITIAL = [
  { id: 1, label: 'Entry Level (0 - 2 Years)', code: 'ENTRY', count: 2 },
  { id: 2, label: 'Mid-Level (2 - 5 Years)', code: 'MID', count: 6 },
  { id: 3, label: 'Senior Specialist (5 - 8 Years)', code: 'SENIOR', count: 6 },
  { id: 4, label: 'Staff / Principal / Director (8+ Years)', code: 'LEAD', count: 2 },
];

const JobExperience = () => {
  const [items, setItems] = useState(INITIAL);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 max-w-4xl mx-auto">
      <AppPageHeader title="Experience Bands & Seniority Tiers" subtitle="Configure candidate years-of-experience criteria." />

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Experience Tracks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Experience Tier</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4 text-right">Active Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{i.label}</td>
                  <td className="py-4 px-4 font-mono text-blue-600 font-bold">{i.code}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-700 dark:text-slate-300">{i.count} Roles</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobExperience;
