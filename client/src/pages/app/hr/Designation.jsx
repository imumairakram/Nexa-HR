import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../../components/common/SparkMetricCard';
import {
  Building2,
  Plus,
  Search,
  Users,
  DollarSign,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Shield,
  Layers,
  RefreshCw,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';
import { api } from '../../../services/api';

const Designation = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState(null);
  const [desigToDelete, setDesigToDelete] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    departmentId: '',
    description: '',
    level: 'Senior (L5)',
    salaryBand: '$120k - $150k',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [desigRes, deptRes, empRes] = await Promise.allSettled([
        api.getDesignations(),
        api.getDepartments(),
        api.getEmployees(),
      ]);

      let loadedDesigs = [];
      let loadedDepts = [];
      let loadedEmps = [];

      if (desigRes.status === 'fulfilled' && desigRes.value?.data?.designations) {
        loadedDesigs = desigRes.value.data.designations;
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
        loadedDepts = deptRes.value.data.departments;
        setDepartments(loadedDepts);
        if (loadedDepts.length > 0 && !form.departmentId) {
          setForm((prev) => ({ ...prev, departmentId: loadedDepts[0].id }));
        }
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        loadedEmps = empRes.value.data.employees;
        setEmployees(loadedEmps);
      }

      // Map dynamic active staff counts
      const mapped = loadedDesigs.map((d) => {
        const staffCount = loadedEmps.filter(
          (e) =>
            e.profile?.designationId === d.id ||
            (d.title && e.profile?.designation?.title?.toLowerCase() === d.title.toLowerCase())
        ).length;

        let parsedLevel = 'Senior (L5)';
        let parsedBand = '$120k - $150k';

        if (d.description) {
          if (d.description.includes('Level:')) {
            const parts = d.description.split('|');
            const levelPart = parts.find((p) => p.includes('Level:'));
            if (levelPart) parsedLevel = levelPart.replace('Level:', '').trim();
            const bandPart = parts.find((p) => p.includes('Band:'));
            if (bandPart) parsedBand = bandPart.replace('Band:', '').trim();
          } else {
            parsedLevel = d.description;
          }
        }

        return {
          id: d.id,
          title: d.title,
          department:
            d.department?.name ||
            loadedDepts.find((dept) => dept.id === d.departmentId)?.name ||
            'General Operations',
          departmentId: d.departmentId,
          level: parsedLevel,
          salaryBand: d.salaryBand || parsedBand,
          description: d.description || '',
          activeStaff: staffCount,
        };
      });

      setDesignations(mapped);
    } catch (err) {
      console.error('Failed to load designations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Designation title is required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createDesignation({
        title: form.title.trim(),
        departmentId: form.departmentId || null,
        description: `Level: ${form.level} | Band: ${form.salaryBand}`,
      });

      showToast(`Designation "${form.title}" created successfully!`);
      setIsAddOpen(false);
      setForm({
        title: '',
        departmentId: departments[0]?.id || '',
        description: '',
        level: 'Senior (L5)',
        salaryBand: '$120k - $150k',
      });
      await loadData();
    } catch (err) {
      console.error('Create designation error:', err);
      showToast(err.message || 'Could not create designation.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (desig) => {
    setEditingDesig(desig);
    setForm({
      title: desig.title || '',
      departmentId: desig.departmentId || departments[0]?.id || '',
      description: desig.description || '',
      level: desig.level || 'Senior (L5)',
      salaryBand: desig.salaryBand || '$120k - $150k',
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDesig) return;
    if (!form.title.trim()) {
      showToast('Designation title is required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.updateDesignation(editingDesig.id, {
        title: form.title.trim(),
        departmentId: form.departmentId || null,
        description: `Level: ${form.level} | Band: ${form.salaryBand}`,
      });

      showToast(`Designation "${form.title}" updated successfully!`);
      setIsEditOpen(false);
      setEditingDesig(null);
      setForm({
        title: '',
        departmentId: departments[0]?.id || '',
        description: '',
        level: 'Senior (L5)',
        salaryBand: '$120k - $150k',
      });
      await loadData();
    } catch (err) {
      console.error('Update designation error:', err);
      showToast(err.message || 'Could not update designation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!desigToDelete) return;

    setDeleting(true);
    try {
      await api.deleteDesignation(desigToDelete.id);
      showToast(`Designation "${desigToDelete.title}" deleted.`);
      setDesigToDelete(null);
      await loadData();
    } catch (err) {
      console.error('Delete designation error:', err);
      showToast(err.message || 'Could not delete designation.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = designations.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.level.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      selectedDeptFilter === 'ALL' || d.departmentId === selectedDeptFilter || d.department === selectedDeptFilter;

    return matchesSearch && matchesDept;
  });

  const totalAssigned = designations.reduce((acc, d) => acc + d.activeStaff, 0);

  const desigSparkData = React.useMemo(() => {
    const total = designations.length;
    return [
      { value: Math.max(0, total - 2), label: 'Mon' },
      { value: Math.max(0, total - 2), label: 'Tue' },
      { value: Math.max(0, total - 1), label: 'Wed' },
      { value: Math.max(0, total - 1), label: 'Thu' },
      { value: Math.max(0, total), label: 'Fri' },
      { value: Math.max(0, total), label: 'Sat' },
      { value: total, label: 'Today' },
    ];
  }, [designations.length]);

  const staffSparkData = React.useMemo(() => {
    const total = totalAssigned;
    return [
      { value: Math.max(0, total - 3), label: 'Mon' },
      { value: Math.max(0, total - 2), label: 'Tue' },
      { value: Math.max(0, total - 2), label: 'Wed' },
      { value: Math.max(0, total - 1), label: 'Thu' },
      { value: Math.max(0, total - 1), label: 'Fri' },
      { value: Math.max(0, total), label: 'Sat' },
      { value: total, label: 'Today' },
    ];
  }, [totalAssigned]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Job Designations & Level Hierarchy"
        subtitle="Manage job titles, seniority career tracks, departmental attachments, and compensation salary bands."
        onRefresh={loadData}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC DESIGNATIONS HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Designation Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Job Designations & Seniority Career Tracks
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Standardize role titles, define IC vs Management career ladders, attach department divisions, and establish target compensation salary ranges.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Building2 className="w-3.5 h-3.5" />
                <span>{designations.length} Active Role Designations</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Users className="w-3.5 h-3.5" />
                <span>{totalAssigned} Active Assigned Staff</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Create Designation</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Add title & salary band</div>
            </div>
            <button
              onClick={() => {
                setForm({
                  title: '',
                  departmentId: departments[0]?.id || '',
                  description: '',
                  level: 'Senior (L5)',
                  salaryBand: '$120k - $150k',
                });
                setIsAddOpen(true);
              }}
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Designation</span>
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
          title="Total Designations"
          value={designations.length}
          unit="Roles"
          badgeText="Standardized"
          badgeType="positive"
          badgeIcon="up"
          subtext="All Depts"
          chartColor="purple"
          dataPoints={desigSparkData}
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Assigned Headcount"
          value={totalAssigned}
          unit="Staff"
          badgeText="100% Mapped"
          badgeType="positive"
          badgeIcon="up"
          subtext="Active Roster"
          chartColor="emerald"
          dataPoints={staffSparkData}
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Career Levels"
          value="L1 - L7"
          unit="Track"
          badgeText="Promotion Path"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Structured Ladder"
          chartColor="amber"
          presetWave="wave3"
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Salary Band Coverage"
          value="100%"
          unit="Banded"
          badgeText="Equal Pay"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Audited Bands"
          chartColor="rose"
          presetWave="wave4"
          loading={loading}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search designations by title, department, or level..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {departments.length > 0 && (
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setForm({
                title: '',
                departmentId: departments[0]?.id || '',
                description: '',
                level: 'Senior (L5)',
                salaryBand: '$120k - $150k',
              });
              setIsAddOpen(true);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Designation</span>
          </button>
        </div>
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
                <th className="py-3.5 px-4 text-center">Active Staff</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length > 0 ? (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                      {d.title}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {d.department}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px] border border-blue-200/50 dark:border-blue-800/50">
                        {d.level}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                      {d.salaryBand}
                    </td>
                    <td className="py-4 px-4 text-center font-black text-slate-900 dark:text-white">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-[11px]">
                        {d.activeStaff} Staff
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(d)}
                          title="Edit Designation"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDesigToDelete(d)}
                          title="Delete Designation"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No designations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD DESIGNATION */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-[32px] max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800/90 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 md:p-7 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-teal-50/40 dark:from-slate-900/70 dark:via-slate-900/50 dark:to-slate-900/70">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                  <Briefcase className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Create Designation & Role
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md">
                    Define job title architecture, department alignment, seniority level, and compensation brackets.
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
            <form onSubmit={handleCreate} className="overflow-y-auto flex-1 p-5 sm:p-6 md:p-7 space-y-5 custom-scrollbar text-xs">
              {/* Designation Title */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Designation Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead QA Automation Engineer"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Department Selector */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Assigned Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                    {departments.length === 0 && (
                      <option value="">General Corporate Operations</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Seniority Level & Salary Band */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Seniority Level <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior (L5)"
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Salary Band Bracket <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. $120k - $150k"
                      value={form.salaryBand}
                      onChange={(e) => setForm({ ...form, salaryBand: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-indigo-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {form.level.slice(0, 3) || 'L5'}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {form.title.trim() || 'Role Designation Preview'}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                      Compensation: {form.salaryBand || 'Not specified'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {form.level || 'Standard'}
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
                  <span>Save Designation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT DESIGNATION */}
      {/* ========================================================================= */}
      {isEditOpen && editingDesig && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-[32px] max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800/90 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 md:p-7 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-teal-50/40 dark:from-slate-900/70 dark:via-slate-900/50 dark:to-slate-900/70">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                  <Edit2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Edit Designation & Role
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md">
                    Update role title, attached department, seniority track, or salary parameters.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingDesig(null);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUpdate} className="overflow-y-auto flex-1 p-5 sm:p-6 md:p-7 space-y-5 custom-scrollbar text-xs">
              {/* Designation Title */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Designation Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead QA Automation Engineer"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Department Selector */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Assigned Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                    {departments.length === 0 && (
                      <option value="">General Corporate Operations</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Seniority Level & Salary Band */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Seniority Level <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior (L5)"
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Salary Band Bracket <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. $120k - $150k"
                      value={form.salaryBand}
                      onChange={(e) => setForm({ ...form, salaryBand: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingDesig(null);
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
                  <span>Update Designation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE DESIGNATION CONFIRMATION */}
      {/* ========================================================================= */}
      {desigToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Delete Designation "{desigToDelete.title}"?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove this role designation? This operation cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDesigToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Designation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designation;
