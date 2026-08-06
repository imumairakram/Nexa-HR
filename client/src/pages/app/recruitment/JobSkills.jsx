import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Code, Plus, Tag } from 'lucide-react';

const JobSkills = () => {
  const [skills, setSkills] = useState([
    { id: 1, name: 'React / Next.js', category: 'Frontend', count: 18 },
    { id: 2, name: 'Node.js & Express', category: 'Backend', count: 15 },
    { id: 3, name: 'PostgreSQL & Prisma', category: 'Database', count: 12 },
    { id: 4, name: 'Figma & UI/UX Design', category: 'Design', count: 8 },
    { id: 5, name: 'Financial Analysis & Modeling', category: 'Finance', count: 6 },
    { id: 6, name: 'HR Analytics & Compliance', category: 'HR', count: 9 },
  ]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Job Skills Taxonomy" subtitle="Manage required skills tags for applicant matching" />

      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Skills Library ({skills.length})</h3>
          <p className="text-xs text-slate-400">Tag job requisitions for candidate automated skill score</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Add Skill Tag</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3 bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        {skills.map((s) => (
          <div key={s.id} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span>{s.name}</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded-full ml-1 font-extrabold">
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobSkills;
