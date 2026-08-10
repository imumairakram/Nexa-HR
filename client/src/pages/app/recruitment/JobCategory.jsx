import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Tag, Plus, Search, CheckCircle2, X, Trash2, Layers, Briefcase, Building, Sparkles } from 'lucide-react';

const INITIAL = [
  { id: 1, name: 'Software Engineering & Cloud Architecture', code: 'ENG', count: 8, lead: 'Alex Mercer', status: 'ACTIVE' },
  { id: 2, name: 'Product Management & UI/UX Design', code: 'PROD', count: 4, lead: 'Emily Zhang', status: 'ACTIVE' },
  { id: 3, name: 'People Operations & Talent Acquisition', code: 'HR', count: 2, lead: 'Chloe Bennett', status: 'ACTIVE' },
  { id: 4, name: 'Enterprise Marketing & Growth', code: 'MKT', count: 2, lead: 'Sarah Jenkins', status: 'ACTIVE' },
  { id: 5, name: 'Corporate Finance & Global Payroll', code: 'FIN', count: 1, lead: 'David Miller', status: 'ACTIVE' },
];

const JobCategory = () => {
  const [categories, setCategories] = useState(INITIAL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', code: '', lead: 'Alex Mercer' });
  const [toastMsg, setToastMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    setCategories([...categories, { id: Date.now(), name: newCat.name, code: newCat.code.toUpperCase() || 'CAT', count: 0, lead: newCat.lead, status: 'ACTIVE' }]);
    setIsAddOpen(false);
    setNewCat({ name: '', code: '', lead: 'Alex Mercer' });
    setToastMsg('Job Category created successfully!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Job Categories Master Table & Requisition Taxonomy"
        subtitle="Organize job requisitions, career portal departments, and hiring pipelines into structured functional categories."
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
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Categories</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{categories.length} Categories</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Open Requisitions</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {categories.reduce((acc, c) => acc + c.count, 0)} Active
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Core Divisions</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">5 Divisions</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Status</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">All Active</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
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
              placeholder="Search category by name or code..."
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
            <span>Add Category</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Department Lead</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Active Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="py-4 px-4 font-mono text-xs text-blue-600 font-bold">{c.code}</td>
                  <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{c.lead}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">{c.count} Roles</td>
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
              <h3 className="text-base font-black text-slate-900 dark:text-white">Add Job Category</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Code *</label>
                <input
                  type="text"
                  placeholder="e.g. AIML"
                  value={newCat.code}
                  onChange={(e) => setNewCat({ ...newCat, code: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCategory;
