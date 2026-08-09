import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  DollarSign,
  CheckCircle2,
  X,
  Edit2,
  Shield,
  Layers,
} from 'lucide-react';

const INITIAL_DESIGNATIONS = [
  { id: 1, title: 'Senior Full-Stack Engineer', department: 'Engineering & DevOps', level: 'Senior (L5)', salaryBand: '$130k - $160k', activeStaff: 18 },
  { id: 2, title: 'Staff Backend Architect', department: 'Engineering & DevOps', level: 'Staff (L6)', salaryBand: '$150k - $185k', activeStaff: 8 },
  { id: 3, title: 'Senior DevOps & Security Lead', department: 'Engineering & DevOps', level: 'Senior (L5)', salaryBand: '$135k - $165k', activeStaff: 6 },
  { id: 4, title: 'Lead Product Designer', department: 'Product & Design', level: 'Lead (L5)', salaryBand: '$125k - $155k', activeStaff: 5 },
  { id: 5, title: 'VP of Product Management', department: 'Product & Design', level: 'Executive (L7)', salaryBand: '$165k - $210k', activeStaff: 2 },
  { id: 6, title: 'Senior People Operations Partner', department: 'People Operations & HR', level: 'Senior (L5)', salaryBand: '$105k - $130k', activeStaff: 4 },
];

const Designation = () => {
  const [designations, setDesignations] = useState(INITIAL_DESIGNATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    department: 'Engineering & DevOps',
    level: 'Senior (L5)',
    salaryBand: '$120k - $150k',
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const newDesig = {
      id: Date.now(),
      title: form.title,
      department: form.department,
      level: form.level,
      salaryBand: form.salaryBand,
      activeStaff: 0,
    };

    setDesignations([...designations, newDesig]);
    setIsAddOpen(false);
    setForm({
      title: '',
      department: 'Engineering & DevOps',
      level: 'Senior (L5)',
      salaryBand: '$120k - $150k',
    });
    setToastMsg(`Designation "${form.title}" created successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = designations.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Job Designations & Level Hierarchy"
        subtitle="Manage job titles, seniority career tracks, departmental attachments, and compensation salary bands."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search designations by title or department..."
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
          <span>Add Designation</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Designation Title</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Seniority Band</th>
                <th className="py-3.5 px-4">Target Compensation</th>
                <th className="py-3.5 px-6 text-right">Active Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                    {d.title}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {d.department}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">
                      {d.level}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                    {d.salaryBand}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-slate-900 dark:text-white">
                    {d.activeStaff} Staff
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Designation */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Designation</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Designation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead QA Automation Engineer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Department *</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Engineering & DevOps">Engineering & DevOps</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="People Operations & HR">People Operations & HR</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Seniority Level *</label>
                  <input
                    type="text"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Salary Band *</label>
                  <input
                    type="text"
                    value={form.salaryBand}
                    onChange={(e) => setForm({ ...form, salaryBand: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Save Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designation;
