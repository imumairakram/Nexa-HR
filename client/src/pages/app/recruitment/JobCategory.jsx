import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Tag, Plus, Search, CheckCircle2, X, Trash2 } from 'lucide-react';

const INITIAL = [
  { id: 1, name: 'Software Engineering & Cloud', code: 'ENG', count: 8 },
  { id: 2, name: 'Product Management & UI/UX', code: 'PROD', count: 4 },
  { id: 3, name: 'People Operations & Talent HR', code: 'HR', count: 2 },
  { id: 4, name: 'Enterprise Marketing & Growth', code: 'MKT', count: 2 },
];

const JobCategory = () => {
  const [categories, setCategories] = useState(INITIAL);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', code: '' });
  const [toastMsg, setToastMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    setCategories([...categories, { id: Date.now(), name: newCat.name, code: newCat.code.toUpperCase() || 'CAT', count: 0 }]);
    setIsAddOpen(false);
    setNewCat({ name: '', code: '' });
    setToastMsg('Category created!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 max-w-4xl mx-auto">
      <AppPageHeader title="Job Categories Master Table" subtitle="Organize job requisitions into functional talent categories." />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Taxonomy Categories</h3>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer"
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
                <th className="py-3.5 px-4 text-right">Active Jobs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="py-4 px-4 font-mono text-[10px] text-blue-600 font-bold">{c.code}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-700 dark:text-slate-300">{c.count} Roles</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Add Job Category</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Category Name"
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Code (e.g. ENG)"
                value={newCat.code}
                onChange={(e) => setNewCat({ ...newCat, code: e.target.value })}
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

export default JobCategory;
