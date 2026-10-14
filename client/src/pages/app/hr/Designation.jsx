import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Briefcase,
  Building2,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  X,
  Award,
  Grid,
  List,
  Mail,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../../components/common/SparkMetricCard';
import { Skeleton } from '../../../components/common/Skeleton';
import { api } from '../../../services/api';

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

const formatDate = (dateStr) => {
  if (!dateStr) return 'Active';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
};

/**
 * Determine organizational seniority level from designation title
 */
const getSeniorityLevel = (title = '') => {
  const lower = title.toLowerCase();
  if (lower.includes('vp') || lower.includes('vice president') || lower.includes('director') || lower.includes('chief') || lower.includes('head of')) {
    return {
      label: 'Executive Level',
      tier: 'executive',
      color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50',
      badgeGradient: 'from-purple-500 to-indigo-600',
    };
  }
  if (lower.includes('manager') || lower.includes('lead') || lower.includes('supervisor') || lower.includes('principal')) {
    return {
      label: 'Management & Lead',
      tier: 'management',
      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
      badgeGradient: 'from-blue-500 to-cyan-600',
    };
  }
  if (lower.includes('senior') || lower.includes('sr.') || lower.includes('sr ') || lower.includes('architect') || lower.includes('specialist')) {
    return {
      label: 'Senior Specialist',
      tier: 'senior',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
      badgeGradient: 'from-emerald-500 to-teal-600',
    };
  }
  return {
    label: 'Professional / Associate',
    tier: 'associate',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    badgeGradient: 'from-amber-500 to-orange-600',
  };
};

/**
 * Color badge based on department
 */
const getDepartmentBadge = (dept) => {
  if (!dept) return { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' };
  const code = (dept.code || dept.name || '').toUpperCase();
  if (code.includes('ENG') || code.includes('DEV') || code.includes('TECH')) {
    return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50', dot: 'bg-cyan-500' };
  }
  if (code.includes('HR') || code.includes('PEOPLE')) {
    return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50', dot: 'bg-emerald-500' };
  }
  if (code.includes('PRD') || code.includes('DESIGN') || code.includes('UI')) {
    return { bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50', dot: 'bg-purple-500' };
  }
  if (code.includes('FIN') || code.includes('ACC')) {
    return { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50', dot: 'bg-amber-500' };
  }
  if (code.includes('MKT') || code.includes('SALES')) {
    return { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50', dot: 'bg-rose-500' };
  }
  return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50', dot: 'bg-indigo-500' };
};

const Designation = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('title_asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState(null);
  const [selectedDesigTeam, setSelectedDesigTeam] = useState(null);
  const [desigToDelete, setDesigToDelete] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    departmentId: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Fetch all related organizational data
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [desigRes, deptRes, empRes] = await Promise.allSettled([
        api.getDesignations(),
        api.getDepartments(),
        api.getEmployees(),
      ]);

      if (desigRes.status === 'fulfilled' && desigRes.value?.data?.designations) {
        setDesignations(desigRes.value.data.designations);
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
        setDepartments(deptRes.value.data.departments);
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        setEmployees(empRes.value.data.employees);
      }

      if (isManualRefresh) {
        showToast('Designations and team assignments synchronized successfully.');
      }
    } catch (err) {
      console.error('Failed to load designations data:', err);
      showToast('Could not synchronize designations from server.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map each designation to its assigned employees
  const getAssignedEmployees = useCallback(
    (desig) => {
      if (!desig) return [];
      return employees.filter((emp) => {
        // 1. Direct match by designationId in profile
        if (emp.profile?.designationId && emp.profile.designationId === desig.id) return true;
        // 2. Match by designation relation id in profile
        if (emp.profile?.designation?.id && emp.profile.designation.id === desig.id) return true;
        // 3. Fallback match by exact title
        const profileTitle = (emp.profile?.designation?.title || emp.designationTitle || emp.role || '').toLowerCase();
        const desigTitle = (desig.title || '').toLowerCase();
        return profileTitle === desigTitle;
      });
    },
    [employees]
  );

  // KPI Calculations
  const stats = useMemo(() => {
    const total = designations.length;
    const allAssigned = new Set();
    let leadershipCount = 0;
    const deptsWithDesig = new Set();

    designations.forEach((d) => {
      const assigned = getAssignedEmployees(d);
      assigned.forEach((emp) => allAssigned.add(emp.id));

      if (d.departmentId || d.department?.id) {
        deptsWithDesig.add(d.departmentId || d.department?.id);
      }

      const level = getSeniorityLevel(d.title);
      if (level.tier === 'executive' || level.tier === 'management') {
        leadershipCount += 1;
      }
    });

    return {
      total,
      totalAssignedStaff: allAssigned.size,
      mappedDepartments: deptsWithDesig.size,
      leadershipCount,
    };
  }, [designations, getAssignedEmployees]);

  // Filtering and Sorting
  const filteredDesignations = useMemo(() => {
    return designations
      .filter((desig) => {
        // Search query filter
        const query = searchQuery.trim().toLowerCase();
        const titleMatch = (desig.title || '').toLowerCase().includes(query);
        const deptNameMatch = (desig.department?.name || '').toLowerCase().includes(query);
        const deptCodeMatch = (desig.department?.code || '').toLowerCase().includes(query);
        const descMatch = (desig.description || '').toLowerCase().includes(query);
        const matchesQuery = !query || titleMatch || deptNameMatch || deptCodeMatch || descMatch;

        // Department filter
        const matchesDept =
          selectedDeptFilter === 'ALL' ||
          desig.departmentId === selectedDeptFilter ||
          desig.department?.id === selectedDeptFilter;

        // Seniority Level filter
        const level = getSeniorityLevel(desig.title);
        const matchesLevel =
          selectedLevelFilter === 'ALL' || level.tier === selectedLevelFilter;

        return matchesQuery && matchesDept && matchesLevel;
      })
      .sort((a, b) => {
        if (sortBy === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'title_desc') {
          return (b.title || '').localeCompare(a.title || '');
        }
        if (sortBy === 'staff_desc') {
          const aCount = getAssignedEmployees(a).length;
          const bCount = getAssignedEmployees(b).length;
          return bCount - aCount;
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return 0;
      });
  }, [designations, searchQuery, selectedDeptFilter, selectedLevelFilter, sortBy, getAssignedEmployees]);

  // Handlers for Add / Edit
  const handleOpenAdd = () => {
    setForm({
      title: '',
      departmentId: departments[0]?.id || '',
      description: '',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (desig) => {
    setEditingDesig(desig);
    setForm({
      title: desig.title || '',
      departmentId: desig.departmentId || desig.department?.id || '',
      description: desig.description || '',
    });
    setIsEditOpen(true);
  };

  const handleCreateDesignation = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Designation title is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createDesignation({
        title: form.title.trim(),
        departmentId: form.departmentId || undefined,
        description: form.description.trim() || undefined,
      });

      await fetchData();
      setIsAddOpen(false);
      setForm({ title: '', departmentId: '', description: '' });
      showToast(`Designation "${form.title}" created successfully!`);
    } catch (err) {
      console.error('Failed to create designation:', err);
      showToast(err.message || 'Failed to create designation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDesignation = async (e) => {
    e.preventDefault();
    if (!editingDesig) return;
    if (!form.title.trim()) {
      showToast('Designation title is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.updateDesignation(editingDesig.id, {
        title: form.title.trim(),
        departmentId: form.departmentId || null,
        description: form.description.trim() || null,
      });

      await fetchData();
      setIsEditOpen(false);
      setEditingDesig(null);
      setForm({ title: '', departmentId: '', description: '' });
      showToast(`Designation "${form.title}" updated successfully!`);
    } catch (err) {
      console.error('Failed to update designation:', err);
      showToast(err.message || 'Failed to update designation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDesignation = async () => {
    if (!desigToDelete) return;
    const assigned = getAssignedEmployees(desigToDelete);
    if (assigned.length > 0) {
      showToast(
        `Cannot delete. ${assigned.length} employee(s) are assigned to this designation.`,
        'error'
      );
      return;
    }

    try {
      setDeleting(true);
      await api.deleteDesignation(desigToDelete.id);
      await fetchData();
      showToast(`Designation "${desigToDelete.title}" deleted successfully.`);
      setDesigToDelete(null);
    } catch (err) {
      console.error('Failed to delete designation:', err);
      showToast(err.message || 'Failed to delete designation.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans text-slate-800 dark:text-slate-100 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            toastType === 'error'
              ? 'bg-rose-500/90 text-white border-rose-400/50 shadow-rose-950/20'
              : 'bg-emerald-600/90 text-white border-emerald-400/50 shadow-emerald-950/20'
          }`}
        >
          {toastType === 'error' ? (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold tracking-wide">{toastMsg}</span>
        </div>
      )}

      {/* Page Header with Actions */}
      <AppPageHeader
        title="Job Designations & Hierarchies"
        subtitle="Configure enterprise organizational designations, role levels, and reporting relationships."
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            title="Refresh designation records"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-teal-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Designation</span>
          </button>
        </div>
      </AppPageHeader>

      {/* Sparkline KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <SparkMetricCard
          title="Total Designations"
          value={stats.total}
          badgeText="+14% this quarter"
          badgeType="success"
          sparkData={[4, 6, 6, 7, 7, 8, stats.total]}
          color="emerald"
          icon={Briefcase}
        />
        <SparkMetricCard
          title="Assigned Personnel"
          value={stats.totalAssignedStaff}
          badgeText={`${employees.length > 0 ? Math.round((stats.totalAssignedStaff / employees.length) * 100) : 100}% mapped`}
          badgeType="info"
          sparkData={[12, 14, 18, 19, 21, 24, stats.totalAssignedStaff]}
          color="teal"
          icon={Users}
        />
        <SparkMetricCard
          title="Mapped Departments"
          value={stats.mappedDepartments}
          badgeText="Active Coverage"
          badgeType="neutral"
          sparkData={[2, 3, 4, 4, 5, 5, stats.mappedDepartments]}
          color="cyan"
          icon={Building2}
        />
        <SparkMetricCard
          title="Leadership Roles"
          value={stats.leadershipCount}
          badgeText="Exec & Leads"
          badgeType="purple"
          sparkData={[1, 2, 2, 3, 3, 4, stats.leadershipCount]}
          color="indigo"
          icon={Award}
        />
      </div>

      {/* Filters, Search & View Toggle Toolbar */}
      <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, department, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters and Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Department Filter */}
            <div className="relative">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-all"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* Seniority Level Filter */}
            <div className="relative">
              <select
                value={selectedLevelFilter}
                onChange={(e) => setSelectedLevelFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-all"
              >
                <option value="ALL">All Hierarchy Levels</option>
                <option value="executive">Executive Level (VP / Director)</option>
                <option value="management">Management & Lead</option>
                <option value="senior">Senior Specialist</option>
                <option value="associate">Professional / Associate</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* Sort Order Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-all"
              >
                <option value="title_asc">Title (A to Z)</option>
                <option value="title_desc">Title (Z to A)</option>
                <option value="staff_desc">Most Assigned Staff</option>
                <option value="newest">Recently Created</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#1E293B] text-teal-600 dark:text-teal-400 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#1E293B] text-teal-600 dark:text-teal-400 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Data Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Counter & Active Tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200">{filteredDesignations.length}</strong> of{' '}
              {designations.length} designations
            </span>
            {(searchQuery || selectedDeptFilter !== 'ALL' || selectedLevelFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDeptFilter('ALL');
                  setSelectedLevelFilter('ALL');
                }}
                className="text-teal-600 dark:text-teal-400 hover:underline font-semibold ml-2 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
          <span className="hidden sm:inline-block">
            NexaHR Organizational Governance Standard
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <Skeleton className="w-24 h-6 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <div className="pt-2 flex items-center justify-between">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDesignations.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center shadow-inner">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            No designations found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {searchQuery || selectedDeptFilter !== 'ALL' || selectedLevelFilter !== 'ALL'
              ? 'No job designations match your filter criteria. Try adjusting your search query or reset filters.'
              : 'There are currently no job designations configured. Click below to add your first enterprise role.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold shadow-md shadow-teal-600/30 hover:shadow-teal-600/50 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Designation</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDesignations.map((desig) => {
            const assigned = getAssignedEmployees(desig);
            const level = getSeniorityLevel(desig.title);
            const deptBadge = getDepartmentBadge(desig.department);

            return (
              <div
                key={desig.id}
                className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/40 dark:hover:border-teal-500/40 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Background Subtle Gradient Glow */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />

                <div className="space-y-4 relative z-10">
                  {/* Card Header: Level Badge & Dept */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${level.badgeGradient} text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-900/10`}
                      >
                        <Briefcase className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide uppercase ${level.color}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {level.label}
                        </span>
                      </div>
                    </div>

                    {/* Department Tag */}
                    {desig.department ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${deptBadge.bg}`}
                        title={desig.department.name}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${deptBadge.dot}`} />
                        {desig.department.code || desig.department.name}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Unassigned
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                      {desig.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[36px]">
                      {desig.description ||
                        `Responsible for ${desig.title.toLowerCase()} operational execution, team alignment, and cross-functional deliverables within NexaHR.`}
                    </p>
                  </div>

                  {/* Assigned Personnel Section */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Assigned Personnel
                      </p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        {assigned.length === 0
                          ? 'No staff assigned'
                          : `${assigned.length} Active Member${assigned.length > 1 ? 's' : ''}`}
                      </p>
                    </div>

                    {/* Avatar Stack */}
                    {assigned.length > 0 ? (
                      <div
                        onClick={() => setSelectedDesigTeam(desig)}
                        className="flex items-center -space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
                        title="Click to view assigned team"
                      >
                        {assigned.slice(0, 4).map((emp, i) => (
                          <img
                            key={emp.id || i}
                            src={getAvatarUrl(emp)}
                            alt={emp.firstName || 'Employee'}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1E293B] object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_BLANK_AVATAR;
                            }}
                          />
                        ))}
                        {assigned.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-2 border-white dark:border-[#1E293B] text-[10px] font-black flex items-center justify-center">
                            +{assigned.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Open position</span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 relative z-10">
                  <button
                    onClick={() => setSelectedDesigTeam(desig)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-slate-800/80 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Team ({assigned.length})</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(desig)}
                      title="Edit Designation"
                      className="p-2 rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDesigToDelete(desig)}
                      title="Delete Designation"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6">Designation Title</th>
                  <th className="py-4 px-6">Seniority Level</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Assigned Team</th>
                  <th className="py-4 px-6">Created On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredDesignations.map((desig) => {
                  const assigned = getAssignedEmployees(desig);
                  const level = getSeniorityLevel(desig.title);
                  const deptBadge = getDepartmentBadge(desig.department);

                  return (
                    <tr
                      key={desig.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Designation Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${level.badgeGradient} text-white flex items-center justify-center shrink-0 shadow-sm`}
                          >
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {desig.title}
                            </p>
                            {desig.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                                {desig.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide uppercase ${level.color}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {level.label}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-6">
                        {desig.department ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${deptBadge.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${deptBadge.dot}`} />
                            {desig.department.name} ({desig.department.code})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Unassigned</span>
                        )}
                      </td>

                      {/* Assigned Team */}
                      <td className="py-4 px-6">
                        {assigned.length > 0 ? (
                          <button
                            onClick={() => setSelectedDesigTeam(desig)}
                            className="flex items-center gap-2 group/btn cursor-pointer"
                          >
                            <div className="flex items-center -space-x-1.5">
                              {assigned.slice(0, 3).map((emp, i) => (
                                <img
                                  key={emp.id || i}
                                  src={getAvatarUrl(emp)}
                                  alt={emp.firstName}
                                  className="w-6 h-6 rounded-full border border-white dark:border-[#1E293B] object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = DEFAULT_BLANK_AVATAR;
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 group-hover/btn:underline">
                              {assigned.length} staff
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(desig.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDesigTeam(desig)}
                            title="View Assigned Team"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(desig)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDesigToDelete(desig)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD DESIGNATION MODAL */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/25">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create New Designation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define enterprise job title & department alignment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateDesignation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Designation Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Principal Cloud Architect"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Department Assignment
                </label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                >
                  <option value="">No Department (General / Floating)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Scope & Responsibilities
                </label>
                <textarea
                  rows="3"
                  placeholder="Briefly outline key expectations, deliverables, or team functions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Creating...' : 'Save Designation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT DESIGNATION MODAL */}
      {/* ========================================================================= */}
      {isEditOpen && editingDesig && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/25">
                  <Edit2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Designation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modify job title, department assignment or scope
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingDesig(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateDesignation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Designation Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Department Assignment
                </label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                >
                  <option value="">No Department (General / Floating)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Scope & Responsibilities
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingDesig(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Saving...' : 'Update Designation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW ASSIGNED TEAM MODAL */}
      {/* ========================================================================= */}
      {selectedDesigTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {selectedDesigTeam.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedDesigTeam.department
                      ? `${selectedDesigTeam.department.name} (${selectedDesigTeam.department.code})`
                      : 'General Organization Role'}{' '}
                    • {getAssignedEmployees(selectedDesigTeam).length} Assigned Staff
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDesigTeam(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Team Roster List */}
            <div className="p-6 overflow-y-auto space-y-3">
              {getAssignedEmployees(selectedDesigTeam).length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <UserCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    No employees currently assigned to this role.
                  </p>
                  <p className="text-xs text-slate-400">
                    You can assign employees to this designation in the Employee Directory or New Employee Wizard.
                  </p>
                </div>
              ) : (
                getAssignedEmployees(selectedDesigTeam).map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-teal-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={getAvatarUrl(emp)}
                        alt={emp.firstName}
                        className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_BLANK_AVATAR;
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {emp.firstName} {emp.lastName || ''}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{emp.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Joined
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(emp.profile?.joiningDate || emp.createdAt)}
                        </span>
                      </div>
                      <a
                        href={`mailto:${emp.email}`}
                        className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:border-teal-500/50 transition-all"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedDesigTeam(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {desigToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-inner">
                {getAssignedEmployees(desigToDelete).length > 0 ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {getAssignedEmployees(desigToDelete).length > 0
                    ? 'Cannot Delete Designation'
                    : 'Delete Job Designation'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {getAssignedEmployees(desigToDelete).length > 0 ? (
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">
                        {getAssignedEmployees(desigToDelete).length} employee(s)
                      </strong>{' '}
                      are currently assigned to "{desigToDelete.title}". To maintain relational integrity, you must reassign these employees before removing this designation.
                    </span>
                  ) : (
                    <span>
                      Are you sure you want to permanently remove "
                      <strong className="text-slate-800 dark:text-slate-200">
                        {desigToDelete.title}
                      </strong>
                      "? This action cannot be undone.
                    </span>
                  )}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDesigToDelete(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {getAssignedEmployees(desigToDelete).length > 0 ? 'Understood' : 'Cancel'}
                </button>
                {getAssignedEmployees(desigToDelete).length === 0 && (
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDeleteDesignation}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designation;