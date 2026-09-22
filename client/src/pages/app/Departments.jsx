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
import SparkMetricCard from '../../components/common/SparkMetricCard';
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

      {/* ========================================================================= */}
      {/* 1. DYNAMIC DEPARTMENTS HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Department Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Department & Business Unit Architecture
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Organize company divisional hierarchy, manage department cost center codes, and structure organizational reporting lines.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Building2 className="w-3.5 h-3.5" />
                <span>{departments.length} Operating Divisions</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <Users className="w-3.5 h-3.5" />
                <span>Cross-Functional Teams</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Add Business Unit</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Create corporate division</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Department</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS WITH SPARKLINES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="dark"
          title="Total Divisions"
          value={departments.length}
          unit={departments.length === 1 ? 'Dept' : 'Depts'}
          badgeText="Active Units"
          badgeType="positive"
          badgeIcon="up"
          subtext="Organizational Structure"
          chartColor="purple"
          presetWave="wave1"
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Hierarchy Depth"
          value={4}
          unit="Tiers"
          badgeText="Structured"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Executive to IC"
          chartColor="amber"
          presetWave="wave2"
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Cost Centers"
          value="100%"
          badgeText="Payroll Linked"
          badgeType="positive"
          badgeIcon="up"
          subtext="GL Accounts Mapped"
          chartColor="emerald"
          presetWave="wave3"
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Staff Allocation"
          value="Balanced"
          badgeText="Capacity Model"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Optimal Distribution"
          chartColor="rose"
          presetWave="wave4"
          loading={loading}
        />
      </div>

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

      {/* ========================================================================= */}
      {/* MODAL: ADD / CREATE DEPARTMENT (STITCH LUXURY DESIGN) */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-[32px] max-w-xl w-full shadow-2xl border border-slate-100 dark:border-slate-800/90 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 md:p-7 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-teal-50/40 dark:from-slate-900/70 dark:via-slate-900/50 dark:to-slate-900/70">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                  <Building2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Create New Department
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md">
                    Establish business units, operational divisions, and reporting hierarchies across your organization.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateDept} className="overflow-y-auto flex-1 p-5 sm:p-6 md:p-7 space-y-5 custom-scrollbar text-xs">
              {/* Department Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Department Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engineering & DevOps"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Unit Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. ENG"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase transition-all placeholder:text-slate-400 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Department Description */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Operational Description & Objectives
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Divisional purpose, key performance responsibilities, and operational scope..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Preview Badge Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-blue-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-black text-xs shadow-sm">
                    {form.code.trim() || 'DEV'}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {form.name.trim() || 'Department Preview'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Ready for organizational assignment & workforce hierarchy
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Active Unit
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  )}
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
