import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { FolderKanban, Plus, Clock, Users, CheckCircle2 } from 'lucide-react';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([
    { id: 1, name: 'NexaHR Mobile App V2', client: 'Internal Enterprise', progress: 75, lead: 'Alex Mercer', members: 6, status: 'IN_PROGRESS' },
    { id: 2, name: 'Biometric Gateway API', client: 'Hardware Division', progress: 100, lead: 'Marcus Vance', members: 4, status: 'COMPLETED' },
    { id: 3, name: 'Payroll Auto-Tax Engine', client: 'Finance Dept', progress: 40, lead: 'David Miller', members: 5, status: 'IN_PROGRESS' },
    { id: 4, name: 'Careers Portal Builder', client: 'Recruitment Dept', progress: 15, lead: 'Emily Zhang', members: 3, status: 'ON_HOLD' },
  ]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Project Portfolio" subtitle="Track company initiatives, sprint progress, and lead assignments" />

      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Projects ({projects.length})</h3>
          <p className="text-xs text-slate-400">Manage cross-functional department projects</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' :
                  p.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' :
                  'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                }`}>
                  {p.status.replace('_', ' ')}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">{p.name}</h4>
                <p className="text-xs text-slate-400 font-medium">{p.client}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Completion</span>
                <span className="text-slate-900 dark:text-white">{p.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${p.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Lead: {p.lead}</span>
              <span>{p.members} Members</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManagement;
