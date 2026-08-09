import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Sparkles, Plus, CheckCircle2, X } from 'lucide-react';

const INITIAL = [
  { id: 1, name: 'React.js & TailwindCSS', category: 'Frontend', level: 'Advanced' },
  { id: 2, name: 'Node.js & PostgreSQL', category: 'Backend', level: 'Expert' },
  { id: 3, name: 'Docker, Kubernetes & AWS', category: 'DevOps', level: 'Expert' },
  { id: 4, name: 'Figma & Design Tokens', category: 'UI/UX Design', level: 'Advanced' },
  { id: 5, name: 'Biometric Face-ID SDKs', category: 'Hardware/IoT', level: 'Specialist' },
];

const JobSkills = () => {
  const [skills, setSkills] = useState(INITIAL);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Engineering', level: 'Advanced' });
  const [toastMsg, setToastMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSkill.name) return;
    setSkills([...skills, { id: Date.now(), ...newSkill }]);
    setIsAddOpen(false);
    setNewSkill({ name: '', category: 'Engineering', level: 'Advanced' });
    setToastMsg('Technical skill registered!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 max-w-4xl mx-auto">
      <AppPageHeader title="Candidate Skills & Competency Matrix" subtitle="Define required competencies and screening skill tags." />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Assessed Skills</h3>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Skill / Competency</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Proficiency Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {skills.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">{s.category}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                      {s.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Add Skill Tag</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Skill (e.g. GraphQL)"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                placeholder="Category (e.g. Backend)"
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSkills;
