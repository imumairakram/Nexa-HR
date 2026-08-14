import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Users,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  MoreVertical,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Layers,
  RefreshCw,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Department Form
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      if (res && res.success && res.data?.departments) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      showToast('Department name and code are required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createDepartment({
        name: form.name.trim(),
        code: form.code.toUpperCase().trim(),
        description: form.description.trim() || undefined,
      });

      await fetchDepartments();
      setIsAddOpen(false);
      setForm({ name: '', code: '', description: '' });
      showToast(`Department "${form.name}" created successfully!`);
    } catch (err) {
      console.error('Failed to create department:', err);
      showToast(err.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = departments.filter((d) => {
    const name = (d.name || '').toLowerCase();
    const code = (d.code || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || code.includes(query);
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Department & Business Unit Architecture"
        subtitle="Organize company divisional hierarchy, manage department codes, and structure organizational reporting lines."
        onRefresh={fetchDepartments}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments by name or unit code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer shrink-0 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </button>
      </div>

      {/* Grid of Departments */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((dept) => (
            <div
              key={dept.id}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm">
                    {dept.code || 'DEP'}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500">
                    {dept.code}
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {dept.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  {dept.description || 'Core organizational business unit.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400">
                  {dept._count?.profiles !== undefined ? `${dept._count.profiles} Staff Members` : 'Active Unit'}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  Verified Unit
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-base font-black text-slate-900 dark:text-white">No Departments Created Yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Create your company's departments (e.g. Engineering, Sales, Human Resources) to organize your workforce.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer transition-all"
          >
            + Create First Department
          </button>
        </div>
      )}

      {/* MODAL: ADD DEPARTMENT */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Create New Department</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering & DevOps"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ENG or DEV"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Scope, divisional purpose, and operational responsibilities..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
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
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Department</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
