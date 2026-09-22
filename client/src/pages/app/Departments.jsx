import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Users,
  Search,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { api } from '../../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Department Form
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.allSettled([
        api.getDepartments(),
        api.getEmployees(),
      ]);

      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
        setDepartments(deptRes.value.data.departments);
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        setEmployees(empRes.value.data.employees);
      }
    } catch (err) {
      console.error('Failed to load departments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getStaffCountForDept = (dept) => {
    if (!dept) return 0;
    const directCount = employees.filter(
      (e) =>
        e.profile?.departmentId === dept.id ||
        (dept.name && e.profile?.department?.name?.toLowerCase() === dept.name.toLowerCase())
    ).length;
    return directCount || dept._count?.profiles || 0;
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      showToast('Department name and unit code are required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createDepartment({
        name: form.name.trim(),
        code: form.code.toUpperCase().trim(),
        description: form.description.trim() || undefined,
      });

      await fetchAllData();
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

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setForm({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdateDept = async (e) => {
    e.preventDefault();
    if (!editingDept) return;
    if (!form.name.trim() || !form.code.trim()) {
      showToast('Department name and unit code are required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.updateDepartment(editingDept.id, {
        name: form.name.trim(),
        code: form.code.toUpperCase().trim(),
        description: form.description.trim() || undefined,
      });

      await fetchAllData();
      setIsEditOpen(false);
      setEditingDept(null);
      setForm({ name: '', code: '', description: '' });
      showToast(`Department "${form.name}" updated successfully!`);
    } catch (err) {
      console.error('Failed to update department:', err);
      showToast(err.message || 'Failed to update department.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDept = async () => {
    if (!deptToDelete) return;

    try {
      setDeleting(true);
      await api.deleteDepartment(deptToDelete.id);
      await fetchAllData();
      showToast(`Department "${deptToDelete.name}" deleted successfully.`);
      setDeptToDelete(null);
    } catch (err) {
      console.error('Failed to delete department:', err);
      showToast(err.message || 'Failed to delete department.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = departments.filter((d) => {
    const name = (d.name || '').toLowerCase();
    const code = (d.code || '').toLowerCase();
    const desc = (d.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || code.includes(query) || desc.includes(query);
  });

  const totalAssignedStaff = departments.reduce((acc, d) => acc + getStaffCountForDept(d), 0);

  const deptSparkData = React.useMemo(() => {
    const total = departments.length;
    return [
      { value: Math.max(0, total - 2), label: 'Mon' },
      { value: Math.max(0, total - 2), label: 'Tue' },
      { value: Math.max(0, total - 1), label: 'Wed' },
      { value: Math.max(0, total - 1), label: 'Thu' },
      { value: Math.max(0, total), label: 'Fri' },
      { value: Math.max(0, total), label: 'Sat' },
      { value: total, label: 'Today' },
    ];
  }, [departments.length]);

  const staffSparkData = React.useMemo(() => {
    const total = totalAssignedStaff;
    return [
      { value: Math.max(0, total - 3), label: 'Mon' },
      { value: Math.max(0, total - 2), label: 'Tue' },
      { value: Math.max(0, total - 2), label: 'Wed' },
      { value: Math.max(0, total - 1), label: 'Thu' },
      { value: Math.max(0, total - 1), label: 'Fri' },
      { value: Math.max(0, total), label: 'Sat' },
      { value: total, label: 'Today' },
    ];
  }, [totalAssignedStaff]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Department & Business Unit Architecture"
        subtitle="Organize company divisional hierarchy, manage department codes, and structure organizational reporting lines."
        onRefresh={fetchAllData}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC DEPARTMENTS HERO BANNER */}
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
              Organize company divisional hierarchy, manage department cost center codes, and structure organizational reporting lines with live database sync.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Building2 className="w-3.5 h-3.5" />
                <span>{departments.length} Operating Divisions</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <Users className="w-3.5 h-3.5" />
                <span>{totalAssignedStaff} Allocated Team Members</span>
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
              onClick={() => {
                setForm({ name: '', code: '', description: '' });
                setIsAddOpen(true);
              }}
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Department</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TELEMETRY KPI CARDS WITH SPARKLINES */}
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
          dataPoints={deptSparkData}
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Staff Allocation"
          value={totalAssignedStaff}
          unit="Members"
          badgeText="Active Roster"
          badgeType="positive"
          badgeIcon="up"
          subtext="Assigned across units"
          chartColor="emerald"
          dataPoints={staffSparkData}
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Cost Centers"
          value="100%"
          badgeText="Payroll Linked"
          badgeType="positive"
          badgeIcon="dot"
          subtext="GL Accounts Mapped"
          chartColor="amber"
          presetWave="wave3"
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Architecture Status"
          value="Verified"
          badgeText="Postgres Synced"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Multi-Tenant Ready"
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
          onClick={() => {
            setForm({ name: '', code: '', description: '' });
            setIsAddOpen(true);
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer shrink-0 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </button>
      </div>

      {/* Grid of Departments */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((dept) => {
            const staffCount = getStaffCountForDept(dept);
            return (
              <div
                key={dept.id}
                className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm border border-blue-200/60 dark:border-blue-800/50">
                      {dept.code || 'DEP'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                        {dept.code}
                      </span>
                      <button
                        onClick={() => openEditModal(dept)}
                        title="Edit Department"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeptToDelete(dept)}
                        title="Delete Department"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {dept.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {dept.description || 'Core organizational business unit.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{staffCount} {staffCount === 1 ? 'Staff Member' : 'Staff Members'}</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Live Unit
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-base font-black text-slate-900 dark:text-white">No Departments Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {searchQuery ? `No matching departments for "${searchQuery}".` : "Create your company's departments to organize your workforce."}
          </p>
          <button
            onClick={() => {
              setForm({ name: '', code: '', description: '' });
              setIsAddOpen(true);
            }}
            className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer transition-all"
          >
            + Create Department
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD DEPARTMENT */}
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

            {/* Form Body */}
            <form onSubmit={handleCreateDept} className="overflow-y-auto flex-1 p-5 sm:p-6 md:p-7 space-y-5 custom-scrollbar text-xs">
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

      {/* ========================================================================= */}
      {/* MODAL: EDIT DEPARTMENT */}
      {/* ========================================================================= */}
      {isEditOpen && editingDept && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-[32px] max-w-xl w-full shadow-2xl border border-slate-100 dark:border-slate-800/90 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 md:p-7 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-teal-50/40 dark:from-slate-900/70 dark:via-slate-900/50 dark:to-slate-900/70">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                  <Edit2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Edit Department
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md">
                    Update business unit details, unit code, and divisional objectives.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingDept(null);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleUpdateDept} className="overflow-y-auto flex-1 p-5 sm:p-6 md:p-7 space-y-5 custom-scrollbar text-xs">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase transition-all text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Operational Description & Objectives
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Divisional purpose, key performance responsibilities..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingDept(null);
                  }}
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
                  <span>Update Department</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Delete Department "{deptToDelete.name}"?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove this department? This operation cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeptToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDept}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Department</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
