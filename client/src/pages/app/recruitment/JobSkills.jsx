import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Plus, CheckCircle2, X, Search, Code, Check, ShieldCheck, Layers } from 'lucide-react';

const INITIAL_SKILLS = [
  { id: 1, name: 'React.js & TypeScript', category: 'Frontend', assessmentsCount: 42, proficiency: 'Advanced', weight: 'Mandatory' },
  { id: 2, name: 'Node.js & Microservices', category: 'Backend', assessmentsCount: 38, proficiency: 'Advanced', weight: 'Mandatory' },
  { id: 3, name: 'PostgreSQL & Prisma ORM', category: 'Databases', assessmentsCount: 29, proficiency: 'Intermediate', weight: 'Preferred' },
  { id: 4, name: 'Kubernetes & CI/CD Pipelines', category: 'DevOps', assessmentsCount: 19, proficiency: 'Expert', weight: 'Mandatory' },
  { id: 5, name: 'Figma Token Systems', category: 'Design', assessmentsCount: 31, proficiency: 'Advanced', weight: 'Preferred' },
  { id: 6, name: 'Biometric API Protocols', category: 'IoT & Hardware', assessmentsCount: 14, proficiency: 'Intermediate', weight: 'Mandatory' },
];

const JobSkills = () => {
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: 'Engineering',
    proficiency: 'Advanced',
    weight: 'Mandatory',
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newSkill = {
      id: Date.now(),
      name: form.name.trim(),
      category: form.category,
      assessmentsCount: 0,
      proficiency: form.proficiency,
      weight: form.weight,
    };

    setSkills([newSkill, ...skills]);
    setIsAddOpen(false);
    setForm({ name: '', category: 'Engineering', proficiency: 'Advanced', weight: 'Mandatory' });
    setToastMsg(`Skill "${newSkill.name}" added to candidate evaluation matrix.`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleDelete = (id) => {
    setSkills(skills.filter((s) => s.id !== id));
    setToastMsg('Skill removed.');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = skills.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Candidate Skill Taxonomy & Assessments"
        subtitle="Manage required technical competencies, automated grading rubrics, and talent stack tags."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Skill Taxonomies</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{skills.length} Tags</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Screened Tests</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {skills.reduce((acc, s) => acc + s.assessmentsCount, 0)} Completed
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Code className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Core Tracks</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">6 Domains</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Proficiency Level</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">L4 to L6</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search competencies by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill Competency</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Skill / Competency Tag</th>
                <th className="py-3.5 px-4">Category Domain</th>
                <th className="py-3.5 px-4">Evaluated Candidates</th>
                <th className="py-3.5 px-4 text-right">Proficiency Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{s.category}</td>
                  <td className="py-4 px-4 font-medium text-slate-500">{s.assessmentsCount} Assessments</td>
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
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Register Competency Tag</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Competency Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GraphQL & Apollo Federation"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="Backend Architecture"
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Proficiency Tier</label>
                  <input
                    type="text"
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSkills;
