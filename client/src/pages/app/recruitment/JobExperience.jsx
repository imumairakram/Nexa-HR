import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { GraduationCap, Plus } from 'lucide-react';

const JobExperience = () => {
  const [brackets, setBrackets] = useState([
    { id: 1, title: 'Entry Level', range: '0 - 1 Years', description: 'Fresh graduates or junior specialists' },
    { id: 2, title: 'Mid-Level', range: '2 - 4 Years', description: 'Experienced professionals with core competencies' },
    { id: 3, title: 'Senior Level', range: '5 - 8 Years', description: 'Domain experts and team leaders' },
    { id: 4, title: 'Executive / Director', range: '8+ Years', description: 'Department leads, VP, and C-level executives' },
  ]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Work Experience Levels" subtitle="Experience brackets used for applicant filtering" />

      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Experience Brackets</h3>
          <p className="text-xs text-slate-400">Classify requisition requirements</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Add Bracket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {brackets.map((b) => (
          <div key={b.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              {b.range}
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{b.title}</h4>
            <p className="text-xs text-slate-400 font-medium">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobExperience;
