import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Briefcase, Plus, CheckCircle2, X, Search, Clock, Users, ShieldCheck } from 'lucide-react';

const INITIAL = [
  { id: 1, name: 'Full-Time Permanent', code: 'FT', hours: '40 hrs / week', benefits: 'Full Health & 401(k)', count: 12 },
  { id: 2, name: 'Fixed-Term Contract', code: 'CON', hours: 'Flexible (Project Scope)', benefits: 'Standard Stipend', count: 2 },
  { id: 3, name: 'Full-Time Remote', code: 'REM', hours: '40 hrs / week (Flexible)', benefits: 'Full Remote Stipend', count: 4 },
  { id: 4, name: 'Internship / Co-op', code: 'INT', hours: '20 - 40 hrs / week', benefits: 'Mentorship & Perks', count: 2 },
];

const JobType = () => {
  const [types, setTypes] = useState(INITIAL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newType, setNewType] = useState({ name: '', code: '', hours: '40 hrs / week', benefits: 'Standard Perks' });
  const [toastMsg, setToastMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newType.name) return;
    setTypes([...types, { id: Date.now(), name: newType.name, code: newType.code.toUpperCase() || 'TYPE', hours: newType.hours, benefits: newType.benefits, count: 0 }]);
    setIsAddOpen(false);
    setNewType({ name: '', code: '', hours: '40 hrs / week', benefits: 'Standard Perks' });
    setToastMsg('Employment type created successfully!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = types.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Employment & Contract Types Master Table"
        subtitle="Configure standard employment arrangements, working commitments, and benefit eligibility tracks."
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
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contract Types</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{types.length} Models</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Full-Time Roles</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">12 Active</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Remote Allowed</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">100% Flexible</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Compliance</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">US Labor W-2/1099</div>
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
              placeholder="Search contract types..."
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
            <span>Add Contract Type</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Contract Type</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Weekly Commitment</th>
                <th className="py-3.5 px-4">Benefits Coverage</th>
                <th className="py-3.5 px-4 text-right">Active Requisitions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{t.name}</td>
                  <td className="py-4 px-4 font-mono text-xs text-blue-600 font-bold">{t.code}</td>
                  <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">{t.hours}</td>
                  <td className="py-4 px-4 text-slate-500">{t.benefits}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">{t.count} Roles</td>
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
              <h3 className="text-base font-black text-slate-900 dark:text-white">Add Employment Type</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Type Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Part-Time Hourly"
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. PT"
                    value={newType.code}
                    onChange={(e) => setNewType({ ...newType, code: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Hours / Wk</label>
                  <input
                    type="text"
                    value={newType.hours}
                    onChange={(e) => setNewType({ ...newType, hours: e.target.value })}
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

export default JobType;
