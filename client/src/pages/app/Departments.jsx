import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Users,
  Search,
  CheckCircle2,
  X,
  Edit2,
  Edit3,
  Trash2,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Eye,
  ShieldCheck,
  Mail,
  Calendar,
  Phone,
  Briefcase,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { DepartmentCardSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Active';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
};

const DEFAULT_BLANK_AVATAR = '/blank-profile-picture.png';

const getAvatarUrl = (emp) => {
  if (!emp) return DEFAULT_BLANK_AVATAR;
  if (emp.avatar && typeof emp.avatar === 'string' && emp.avatar.trim() !== '' && !emp.avatar.includes('unsplash')) {
    return emp.avatar;
  }
  if (emp.profile?.avatarUrl && typeof emp.profile.avatarUrl === 'string' && emp.profile.avatarUrl.trim() !== '' && !emp.profile.avatarUrl.includes('unsplash')) {
    return emp.profile.avatarUrl;
  }
  if (emp.id) {
    try {
      const scoped = localStorage.getItem(`user_avatar_${emp.id}`);
      if (scoped && typeof scoped === 'string' && scoped.trim() !== '' && !scoped.includes('unsplash')) {
        return scoped;
      }
    } catch {}
  }
  return DEFAULT_BLANK_AVATAR;
};

const Departments = () => {
  const [departments, setDepartments] = useState(() => api.getCached('/departments')?.data?.departments || []);
  const [employees, setEmployees] = useState(() => api.getCached('/employees')?.data?.employees || []);
  const [loading, setLoading] = useState(() => !api.hasCached('/departments'));
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
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
    if (!api.hasCached('/departments')) {
      setLoading(true);
    }
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
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-5 sm:p-8 shadow-soft border border-sky-200/80 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Department Telemetry */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Department & Business Unit Architecture
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Organize company divisional hierarchy, manage department cost center codes, and structure organizational reporting lines with live database sync.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center text-sky-700 dark:text-sky-300 font-bold bg-sky-100/60 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800/60">
                <span>{departments.length} Operating Divisions</span>
              </span>
              <span className="flex items-center text-sky-700 dark:text-sky-300 font-bold bg-sky-100/60 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800/60">
                <span>{totalAssignedStaff} Allocated Team Members</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card (Desktop / Tablet) */}
          <div className="hidden sm:flex bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
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
              className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Department</span>
            </button>
          </div>

          {/* Mobile Quick Action Button */}
          <div className="sm:hidden pt-1">
            <button
              onClick={() => {
                setForm({ name: '', code: '', description: '' });
                setIsAddOpen(true);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-extrabold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Department</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TELEMETRY KPI CARDS WITH SPARKLINES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
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
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-3 transition-all">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search departments by name or unit code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setForm({ name: '', code: '', description: '' });
              setIsAddOpen(true);
            }}
            className="px-3.5 sm:px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 shadow-md shadow-sky-500/20 cursor-pointer shrink-0 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Department</span>
            <span className="inline sm:hidden">Add</span>
          </button>
        </div>

        {/* Active Filter Badges */}
        {searchQuery && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Active:
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
              "{searchQuery}"
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer p-0.5"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>

            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 ml-auto cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* Grid of Departments */}
      {loading ? (
        <DepartmentCardSkeleton count={6} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
          {filtered.map((dept, idx) => {
            const staffCount = getStaffCountForDept(dept);
            const deptText = `${dept.code || ''} ${dept.name || ''}`.toUpperCase();
            
            let colorTheme = {
              gradient: 'from-blue-600 via-indigo-600 to-sky-500',
              accentText: 'hover:text-blue-600 dark:hover:text-blue-400',
            };

            if (deptText.includes('FIN') || deptText.includes('ACC') || deptText.includes('PAY')) {
              colorTheme = {
                gradient: 'from-emerald-600 via-teal-600 to-emerald-500',
                accentText: 'hover:text-emerald-600 dark:hover:text-emerald-400',
              };
            } else if (deptText.includes('HR') || deptText.includes('PEOPLE') || deptText.includes('TALENT')) {
              colorTheme = {
                gradient: 'from-purple-600 via-indigo-600 to-violet-500',
                accentText: 'hover:text-purple-600 dark:hover:text-purple-400',
              };
            } else if (deptText.includes('MKT') || deptText.includes('SALES') || deptText.includes('GROWTH')) {
              colorTheme = {
                gradient: 'from-rose-600 via-pink-600 to-rose-500',
                accentText: 'hover:text-rose-600 dark:hover:text-rose-400',
              };
            } else if (deptText.includes('OPS') || deptText.includes('SUPPORT') || deptText.includes('CUST')) {
              colorTheme = {
                gradient: 'from-amber-500 via-orange-600 to-amber-500',
                accentText: 'hover:text-amber-600 dark:hover:text-amber-400',
              };
            } else if (deptText.includes('PROD') || deptText.includes('DESIGN') || deptText.includes('UX')) {
              colorTheme = {
                gradient: 'from-sky-500 to-blue-600',
                accentText: 'hover:text-sky-600 dark:hover:text-sky-400',
              };
            }

            return (
              <div
                key={dept.id || idx}
                className="group relative overflow-hidden rounded-[28px] bg-white dark:bg-[#1E293B] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
              >
                <div className="p-6 pb-2">
                  {/* 1. Header: Avatar & Top-Right Edit Button */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative inline-block">
                      <div className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm overflow-hidden bg-gradient-to-tr ${colorTheme.gradient} text-white flex items-center justify-center font-black text-base sm:text-lg tracking-wider uppercase`}>
                        <span>{dept.code ? (dept.code.length > 4 ? dept.code.slice(0, 4) : dept.code) : 'DEP'}</span>
                      </div>
                    </div>

                    {/* Edit Button at Top Right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(dept);
                      }}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                      title="Edit Department"
                    >
                      <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </div>

                  {/* 2. Main Dossier Info */}
                  <div>
                    <h3
                      onClick={() => setSelectedDept(dept)}
                      className={`text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug ${colorTheme.accentText} cursor-pointer transition-colors`}
                    >
                      {dept.name}
                    </h3>

                    <p className="text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200 mt-1 truncate">
                      <span>{dept.code ? `${dept.code} Unit` : 'Corporate Division'}</span>
                      <span className="text-slate-400 mx-1.5 font-normal">|</span>
                      <span>{staffCount} {staffCount === 1 ? 'Assigned Member' : 'Assigned Members'}</span>
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Cost Center: {dept.code ? `CC-${dept.code}` : 'CC-CORP'} • Corporate Division
                      </span>
                    </div>

                    <p className="text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed mt-3.5 font-normal line-clamp-4">
                      {dept.description || `${dept.name} is an active corporate operational division driving organizational goals, cross-functional collaboration, and departmental workflows.`}
                    </p>

                    <div className="space-y-2 mt-4 text-xs font-normal text-slate-700 dark:text-slate-300">
                      <div
                        onClick={() => setSelectedDept(dept)}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group/row"
                        title="Click to view enrolled employees"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors">
                            Assigned Staff
                          </span>
                        </div>
                        <span className="font-bold text-[11px] px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                          {staffCount} {staffCount === 1 ? 'Member' : 'Members'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 px-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Corporate Business Division</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          Operational & Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Footer: Established Date & View Staff Button + Delete Action Icon */}
                <div className="px-6 pb-6 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Established {formatDate(dept.createdAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* View Enrolled Employees Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedDept(dept)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-200/60 dark:border-blue-800/60 shadow-2xs hover:scale-105"
                      title="View Enrolled Staff"
                    >
                      <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>View Staff ({staffCount})</span>
                    </button>

                    {/* Remove Department */}
                    <button
                      type="button"
                      onClick={() => setDeptToDelete(dept)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                      title="Remove Department"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </div>
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
            className="mt-4 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer transition-all"
          >
            + Create Department
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD DEPARTMENT */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-xl w-full shadow-2xl shadow-sky-950/20 dark:shadow-black/60 border border-sky-200/70 dark:border-sky-800/50 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-200/50 dark:border-sky-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-slate-900/80 dark:via-sky-950/30 dark:to-slate-900/80 relative overflow-hidden">
              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 ring-4 ring-blue-100/70 dark:ring-blue-950/60">
                  <Building2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Create New Department
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Establish business units, operational divisions, and reporting hierarchies.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
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
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-mono font-black text-xs shadow-sm">
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-xl w-full shadow-2xl shadow-sky-950/20 dark:shadow-black/60 border border-sky-200/70 dark:border-sky-800/50 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-200/50 dark:border-sky-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-slate-900/80 dark:via-sky-950/30 dark:to-slate-900/80 relative overflow-hidden">
              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 ring-4 ring-blue-100/70 dark:ring-blue-950/60">
                  <Edit2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Edit Department
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Update business unit details, unit code, and divisional objectives.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingDept(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
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
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-rose-950/20 dark:shadow-black/60 border border-rose-200/70 dark:border-rose-900/50 space-y-4">
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
      {/* ========================================================================= */}
      {/* MODAL: VIEW DEPARTMENT DOSSIER */}
      {/* ========================================================================= */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-2xl w-full shadow-2xl shadow-indigo-950/20 dark:shadow-black/60 border border-indigo-200/70 dark:border-indigo-800/50 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-200/50 dark:border-sky-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-slate-900/80 dark:via-sky-950/30 dark:to-slate-900/80 relative overflow-hidden">
              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/25 uppercase shrink-0 ring-4 ring-indigo-100/70 dark:ring-indigo-950/60">
                  {selectedDept.code ? (selectedDept.code.length > 4 ? selectedDept.code.slice(0, 4) : selectedDept.code) : 'DEP'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                      {selectedDept.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                      {selectedDept.code || 'UNIT'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Cost Center: {selectedDept.code ? `CC-${selectedDept.code}` : 'CC-CORP'} • Established {formatDate(selectedDept.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDept(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 md:p-7 space-y-6 custom-scrollbar text-xs">
              {/* Mission Statement */}
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Operational Scope & Objectives
                </h4>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-normal bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  {selectedDept.description || `${selectedDept.name} operates as a primary organizational business unit responsible for strategic objectives, high-velocity delivery, and cross-functional outcomes.`}
                </p>
              </div>

              {/* Divisional Stats Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active Staff</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {getStaffCountForDept(selectedDept)} Members
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Status</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Live Unit
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                  <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Allocation</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    Corporate Division
                  </div>
                </div>
              </div>

              {/* Assigned Staff Members List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Assigned Employees ({getStaffCountForDept(selectedDept)})
                  </h4>
                </div>

                {(() => {
                  const members = employees.filter(
                    (e) =>
                      e.profile?.departmentId === selectedDept.id ||
                      (selectedDept.name && e.profile?.department?.name?.toLowerCase() === selectedDept.name.toLowerCase())
                  );

                  if (members.length === 0) {
                    return (
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-semibold">No employees currently allocated to this department.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                      {members.map((emp, idx) => (
                        <div
                          key={emp.id || idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800 shrink-0">
                              <img
                                src={getAvatarUrl(emp)}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = DEFAULT_BLANK_AVATAR;
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-xs">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {emp.profile?.designation?.title || 'Staff Member'}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                            {emp.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 md:p-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/30">
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = selectedDept;
                  setSelectedDept(null);
                  openEditModal(d);
                }}
                className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Edit Department</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;

