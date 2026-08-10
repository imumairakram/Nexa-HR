import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Clock, Plus, CheckCircle2, Search, X, Users, Award, ShieldCheck, Briefcase } from 'lucide-react';

const INITIAL = [
  { id: 1, label: 'Entry Level (0 - 2 Years)', code: 'ENTRY', minYears: 0, maxYears: 2, salaryRange: '$85k - $110k', count: 2 },
  { id: 2, label: 'Mid-Level Professional (2 - 5 Years)', code: 'MID', minYears: 2, maxYears: 5, salaryRange: '$110k - $140k', count: 6 },
  { id: 3, label: 'Senior Specialist (5 - 8 Years)', code: 'SENIOR', minYears: 5, maxYears: 8, salaryRange: '$140k - $175k', count: 6 },
  { id: 4, label: 'Staff / Principal / Director (8+ Years)', code: 'LEAD', minYears: 8, maxYears: 15, salaryRange: '$175k - $220k', count: 2 },
];

const JobExperience = () => {
  const [items, setItems] = useState(INITIAL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', code: '', salaryRange: '$100k - $130k' });
  const [toastMsg, setToastMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.label) return;
    setItems([...items, { id: Date.now(), label: newItem.label, code: newItem.code.toUpperCase() || 'EXP', minYears: 1, maxYears: 3, salaryRange: newItem.salaryRange, count: 0 }]);
    setIsAddOpen(false);
    setNewItem({ label: '', code: '', salaryRange: '$100k - $130k' });
    setToastMsg('Experience seniority track added successfully!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Experience Bands & Seniority Tiers Master Table"
        subtitle="Configure candidate years-of-experience criteria, career progression levels, and benchmark compensation."
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
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Seniority Tiers</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{items.length} Bands</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Openings</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {items.reduce((acc, i) => acc + i.count, 0)} Roles
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Mid-Senior Ratio</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">75% Core</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Top Compensation</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">$220k Max</div>
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
              placeholder="Search experience tiers..."
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
            <span>Add Experience Tier</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Experience Tier & Seniority</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Benchmark Compensation</th>
                <th className="py-3.5 px-4 text-right">Active Openings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{i.label}</td>
                  <td className="py-4 px-4 font-mono text-xs text-blue-600 font-bold">{i.code}</td>
                  <td className="py-4 px-4 font-medium text-emerald-600 dark:text-emerald-400">{i.salaryRange}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">{i.count} Roles</td>
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
              <h3 className="text-base font-black text-slate-900 dark:text-white">Add Seniority Tier</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Tier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Principal Architect (10+ Years)"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Code *</label>
                  <input
                    type="text"
                    placeholder="PRIN"
                    value={newItem.code}
                    onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newItem.salaryRange}
                    onChange={(e) => setNewItem({ ...newItem, salaryRange: e.target.value })}
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

export default JobExperience;
