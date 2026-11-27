import React, { useState, useEffect, useRef, useMemo } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import ModernSearchBarSection from '../../components/common/ModernSearchBarSection';
import { EmployeeCardSkeleton } from '../../components/common/Skeleton';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Briefcase,
  AlertTriangle,
  X,
  Edit3,
  RefreshCw,
  Eye,
  Trash2,
  Mail,
  Calendar,
  Phone,
  AlertCircle,
  UserX,
  Building2,
  Home,
  ChevronDown,
  RotateCcw,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';

const DEFAULT_BLANK_AVATAR = '/blank-profile-picture.png';

const getAvatarUrl = (emp) => {
  if (!emp) return DEFAULT_BLANK_AVATAR;
  // 1. Direct avatar on user object
  if (emp.avatar && typeof emp.avatar === 'string' && emp.avatar.trim() !== '' && !emp.avatar.includes('unsplash')) {
    return emp.avatar;
  }
  // 2. Avatar on profile object
  if (emp.profile?.avatarUrl && typeof emp.profile.avatarUrl === 'string' && emp.profile.avatarUrl.trim() !== '' && !emp.profile.avatarUrl.includes('unsplash')) {
    return emp.profile.avatarUrl;
  }
  // 3. Check scoped localStorage for this employee ID
  if (emp.id) {
    try {
      const scoped = localStorage.getItem(`user_avatar_${emp.id}`);
      if (scoped && typeof scoped === 'string' && scoped.trim() !== '' && !scoped.includes('unsplash')) {
        return scoped;
      }
    } catch { }
  }
  // 4. Check active session user if matches this employee
  try {
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    if (current && (current.id === emp.id || (current.email && emp.email && current.email.toLowerCase() === emp.email.toLowerCase()))) {
      if (current.avatar && typeof current.avatar === 'string' && current.avatar.trim() !== '' && !current.avatar.includes('unsplash')) {
        return current.avatar;
      }
      if (current.profile?.avatarUrl && typeof current.profile.avatarUrl === 'string' && current.profile.avatarUrl.trim() !== '' && !current.profile.avatarUrl.includes('unsplash')) {
        return current.profile.avatarUrl;
      }
      const scopedCurrent = localStorage.getItem(`user_avatar_${current.id}`);
      if (scopedCurrent && typeof scopedCurrent === 'string' && scopedCurrent.trim() !== '' && !scopedCurrent.includes('unsplash')) {
        return scopedCurrent;
      }
    }
  } catch { }

  return DEFAULT_BLANK_AVATAR;
};

const formatDob = (dobStr) => {
  if (!dobStr) return 'Not Specified';
  try {
    const d = new Date(dobStr);
    if (isNaN(d.getTime())) return dobStr;
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dobStr;
  }
};

const formatJoiningDate = (joinStr) => {
  if (!joinStr) return 'Active';
  try {
    const d = new Date(joinStr);
    if (isNaN(d.getTime())) return joinStr;
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return joinStr;
  }
};

const getEmployeeBio = (emp) => {
  if (emp?.profile?.bio && typeof emp.profile.bio === 'string' && emp.profile.bio.trim() !== '') {
    return emp.profile.bio;
  }
  if (emp?.bio && typeof emp.bio === 'string' && emp.bio.trim() !== '') {
    return emp.bio;
  }

  const name = emp?.firstName ? `${emp.firstName}` : 'This team member';
  const desig = emp?.profile?.designation?.title || emp?.designationTitle || emp?.role || 'team member';
  const dept = emp?.profile?.department?.name || emp?.departmentName || '';

  if (desig && dept) {
    return `${name} is an active ${desig} in the ${dept} department at NexaHR, focused on driving cross-functional outcomes, scalable workflows, and team excellence.`;
  }
  if (desig) {
    return `${name} is a dedicated ${desig} at NexaHR, committed to delivering high-impact solutions, quality execution, and collaborative results.`;
  }
  return `${name} is a valued team member at NexaHR, contributing to core organizational goals, professional standards, and strategic execution.`;
};

const formatSalary = (salaryStructure, rawSalary) => {
  if (salaryStructure && salaryStructure.basicSalary) {
    const basic = Number(salaryStructure.basicSalary);
    const total = basic + Number(salaryStructure.housingAllowance || 0) + Number(salaryStructure.transportAllowance || 0) + Number(salaryStructure.otherAllowances || 0);
    return `${total.toLocaleString()} / mo`;
  }
  if (rawSalary) {
    if (typeof rawSalary === 'number') return `\ / mo`;
    return rawSalary;
  }
  return 'Not Configured';
};

const EmploymentStatus = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [activeSort, setActiveSort] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'date', label: 'Joining Date' },
    { key: 'code', label: 'Employee ID' },
  ];
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees();
      if (res?.success && res.data?.employees) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('Failed to load employee statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();

    const handleSync = () => loadEmployees();
    window.addEventListener('user_profile_updated', handleSync);
    window.addEventListener('avatar_updated', handleSync);
    window.addEventListener('user_avatar_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('user_profile_updated', handleSync);
      window.removeEventListener('avatar_updated', handleSync);
      window.removeEventListener('user_avatar_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleOpenEdit = (emp) => {
    const isProbation = emp.profile?.joiningDate && (new Date() - new Date(emp.profile.joiningDate)) < 90 * 24 * 60 * 60 * 1000;
    const defaultType = emp.profile?.employmentType || (emp.role === 'ADMIN' ? 'FULL_TIME' : (emp.isActive ? (isProbation ? 'PROBATION' : 'FULL_TIME') : 'CONTRACT'));

    setSelectedEmp({
      id: emp.id,
      employeeCode: emp.employeeCode || `EMP-${emp.id.slice(0, 4)}`,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      employmentType: defaultType,
      shift: emp.profile?.shift || 'General Morning (09:00 - 17:30)',
      location: emp.profile?.workLocation || emp.workLocation || 'Islamabad HQ & Innovation Lab',
      address: emp.profile?.address || emp.address || '',
      raw: emp,
    });
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setSaving(true);
    try {
      const payload = {
        employmentType: selectedEmp.employmentType,
        shift: selectedEmp.shift,
        workLocation: selectedEmp.location || 'Islamabad HQ & Innovation Lab',
      };
      const res = await api.updateEmployee(selectedEmp.id, payload);
      if (res?.success) {
        await loadEmployees();
        setSelectedEmp(null);
        setToastMsg(`Employment status & shift updated for ${selectedEmp.name}!`);
        setTimeout(() => setToastMsg(''), 3000);
        window.dispatchEvent(new Event('user_profile_updated'));
      } else {
        alert(res?.message || 'Failed to update employee status.');
      }
    } catch (err) {
      if (err.name === 'DemoModeError' || err.code === 'DEMO_MODE') return;
      console.error('Failed to update employee status:', err);
      alert('Error updating status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    setDeleting(true);
    try {
      const res = await api.deleteEmployee(employeeToDelete.id);
      if (res?.success) {
        await loadEmployees();
        setToastMsg(`Employee ${employeeToDelete.firstName} ${employeeToDelete.lastName} removed successfully.`);
        setTimeout(() => setToastMsg(''), 3000);
        setEmployeeToDelete(null);
        window.dispatchEvent(new Event('user_profile_updated'));
      } else {
        alert(res?.message || 'Failed to delete employee.');
      }
    } catch (err) {
      if (err.name === 'DemoModeError' || err.code === 'DEMO_MODE') {
        setEmployeeToDelete(null);
        return;
      }
      console.error('Error removing employee:', err);
      alert('Error removing employee. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getEffectiveType = (emp) => {
    const isProbation = emp.profile?.joiningDate && (new Date() - new Date(emp.profile.joiningDate)) < 90 * 24 * 60 * 60 * 1000;
    return emp.profile?.employmentType || (emp.role === 'ADMIN' ? 'FULL_TIME' : (emp.isActive ? (isProbation ? 'PROBATION' : 'FULL_TIME') : 'CONTRACT'));
  };

  const getClassificationBadge = (type) => {
    switch (type) {
      case 'FULL_TIME':
        return {
          label: 'Full-Time Permanent',
          short: 'Full Time',
          badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
          dotClass: 'bg-emerald-500',
        };
      case 'REMOTE':
        return {
          label: 'Remote Contract',
          short: 'Remote',
          badgeClass: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60',
          dotClass: 'bg-cyan-500',
        };
      case 'PROBATION':
        return {
          label: '90-Day Probation',
          short: 'Probation',
          badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
          dotClass: 'bg-amber-500',
        };
      case 'CONTRACT':
      default:
        return {
          label: 'Fixed Contract',
          short: 'Contract',
          badgeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
          dotClass: 'bg-purple-500',
        };
    }
  };

  const filtered = useMemo(() => {
    return employees
      .filter((emp) => {
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        const email = (emp.email || '').toLowerCase();
        const code = (emp.employeeCode || '').toLowerCase();
        const desig = (emp.profile?.designation?.title || emp.role || '').toLowerCase();
        const dept = (emp.profile?.department?.name || '').toLowerCase();
        const shift = (emp.profile?.shift || '').toLowerCase();
        const loc = (emp.profile?.workLocation || emp.workLocation || '').toLowerCase();
        const query = searchQuery.toLowerCase().trim();

        const matchesSearch =
          !query ||
          fullName.includes(query) ||
          email.includes(query) ||
          code.includes(query) ||
          desig.includes(query) ||
          dept.includes(query) ||
          shift.includes(query) ||
          loc.includes(query);

        const empType = getEffectiveType(emp);
        const matchesType = typeFilter === 'ALL' || empType === typeFilter;
        const matchesShift = shiftFilter === 'ALL' || shift.includes(shiftFilter.toLowerCase());

        return matchesSearch && matchesType && matchesShift;
      })
      .sort((a, b) => {
        let valA = '';
        let valB = '';
        if (activeSort === 'name') {
          valA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          valB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
        } else if (activeSort === 'code') {
          valA = (a.employeeCode || '').toLowerCase();
          valB = (b.employeeCode || '').toLowerCase();
        } else if (activeSort === 'date') {
          const dateA = new Date(a.profile?.joiningDate || a.createdAt || 0).getTime();
          const dateB = new Date(b.profile?.joiningDate || b.createdAt || 0).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [employees, searchQuery, typeFilter, shiftFilter, activeSort, sortOrder]);

  const stats = {
    total: employees.length,
    fullTime: employees.filter((e) => getEffectiveType(e) === 'FULL_TIME').length,
    remote: employees.filter((e) => getEffectiveType(e) === 'REMOTE').length,
    probation: employees.filter((e) => getEffectiveType(e) === 'PROBATION' || getEffectiveType(e) === 'CONTRACT').length,
  };

  const typeCounts = useMemo(() => ({
    ALL: employees.length,
    FULL_TIME: employees.filter((e) => getEffectiveType(e) === 'FULL_TIME').length,
    REMOTE: employees.filter((e) => getEffectiveType(e) === 'REMOTE').length,
    CONTRACT: employees.filter((e) => getEffectiveType(e) === 'CONTRACT').length,
    PROBATION: employees.filter((e) => getEffectiveType(e) === 'PROBATION').length,
  }), [employees]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Employment Status & Shifts"
        subtitle="Manage employment classifications, remote work contracts, shift timings, and probation statuses."
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS WITH SPARKLINES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="light"
          title="Total Headcount"
          value={stats.total}
          unit={stats.total === 1 ? 'Staff' : 'Staff'}
          badgeText="Active Roster"
          badgeType="positive"
          badgeIcon="up"
          subtext="Global Org"
          chartColor="sky"
          presetWave="wave1"
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Full-Time Staff"
          value={stats.fullTime}
          unit="Permanent"
          badgeText="Full Benefits"
          badgeType="positive"
          badgeIcon="up"
          subtext="Tenured Roster"
          chartColor="emerald"
          presetWave="wave2"
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Remote Contracts"
          value={stats.remote}
          unit="Remote"
          badgeText="Flexible Hours"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Distributed Hub"
          chartColor="blue"
          presetWave="wave3"
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Contract / Probation"
          value={stats.probation}
          unit="In Review"
          badgeText="90-Day Review"
          badgeType="warning"
          badgeIcon="dot"
          subtext="Milestone Evaluation"
          chartColor="rose"
          presetWave="wave4"
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. MODERN DYNAMIC SEARCH & FILTER COMMAND BAR */}
      {/* ========================================================================= */}
      <ModernSearchBarSection
        statusTabs={[
          { key: 'ALL', label: 'All', count: typeCounts.ALL },
          { key: 'FULL_TIME', label: 'Full-Time', count: typeCounts.FULL_TIME },
          { key: 'REMOTE', label: 'Remote', count: typeCounts.REMOTE },
          { key: 'CONTRACT', label: 'Contract', count: typeCounts.CONTRACT },
          { key: 'PROBATION', label: 'Probation', count: typeCounts.PROBATION },
        ]}
        activeStatus={typeFilter}
        onStatusChange={setTypeFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search personnel by name, role, ID, shift, department, or location..."
        searchShortPlaceholder="Search personnel..."
        searchHint="type:full_time"
        filterTags={[
          ...(typeFilter !== 'ALL'
            ? [{ key: 'type', label: 'type', value: typeFilter.replace('_', ' ') }]
            : []),
          ...(shiftFilter !== 'ALL'
            ? [{ key: 'shift', label: 'shift', value: shiftFilter }]
            : []),
        ]}
        onRemoveTag={(tag) => {
          if (tag.key === 'type') setTypeFilter('ALL');
          if (tag.key === 'shift') setShiftFilter('ALL');
        }}
        sortOptions={sortOptions}
        activeSort={activeSort}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setActiveSort(key);
          setSortOrder(order);
        }}
        filterCount={(typeFilter !== 'ALL' ? 1 : 0) + (shiftFilter !== 'ALL' ? 1 : 0)}
        filterContent={
          <div className="space-y-4">
            {/* Classification Filter */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-2">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Classification
                </span>
                {typeFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setTypeFilter('ALL')}
                    className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {[
                  { key: 'ALL', label: 'All Personnel', count: typeCounts.ALL },
                  { key: 'FULL_TIME', label: 'Full-Time Permanent', count: typeCounts.FULL_TIME },
                  { key: 'REMOTE', label: 'Remote Contract', count: typeCounts.REMOTE },
                  { key: 'CONTRACT', label: 'Fixed Contract', count: typeCounts.CONTRACT },
                  { key: 'PROBATION', label: 'Probationary (90 Days)', count: typeCounts.PROBATION },
                ].map(({ key, label, count }) => {
                  const isSelected = typeFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTypeFilter(key)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <span>{label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          isSelected
                            ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shift Filter */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-2">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Assigned Shift
                </span>
                {shiftFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setShiftFilter('ALL')}
                    className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {[
                  { key: 'ALL', label: 'All Shifts' },
                  { key: 'Morning', label: 'General Morning (09:00 - 17:30)' },
                  { key: 'Evening', label: 'Evening Shift (14:00 - 22:30)' },
                  { key: 'Night', label: 'Night Shift (22:00 - 06:30)' },
                  { key: 'Flexible', label: 'Flexible Remote Hours' },
                ].map(({ key, label }) => {
                  const isSelected = shiftFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setShiftFilter(key)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear all */}
            {(typeFilter !== 'ALL' || shiftFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('ALL');
                  setShiftFilter('ALL');
                }}
                className="w-full py-1.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700 rounded-[12px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        }
      />

      {/* ========================================================================= */}
      {/* 4. WORKFORCE EMPLOYMENT CARDS GRID */}
      {/* ========================================================================= */}
      {loading ? (
        <EmployeeCardSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-[32px] p-12 text-center border border-slate-100 dark:border-slate-800 shadow-soft">
          <Users className="w-12 h-12 text-sky-300 dark:text-sky-600/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No personnel found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No active employee records match your search criteria or classification filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
          {filtered.map((emp, idx) => (
            <div
              key={emp.id || idx}
              className="group relative overflow-hidden rounded-[28px] bg-white dark:bg-[#1E293B] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
            >
              <div className="p-6 pb-2">
                {/* 1. Header: Avatar & Top-Right Edit Button */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative inline-block">
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <img
                        src={getAvatarUrl(emp)}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = DEFAULT_BLANK_AVATAR;
                        }}
                      />
                    </div>
                  </div>

                  {/* Edit Button at Top Right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(emp);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                    title="Update Status & Shift"
                  >
                    <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* 2. Main Dossier Info */}
                <div>
                  <h3
                    onClick={() => setSelectedEmployee(emp)}
                    className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors"
                  >
                    {emp.firstName || ''} {emp.lastName || ''}
                  </h3>

                  <p className="text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200 mt-1 truncate">
                    <span>{emp.profile?.designation?.title || emp.designationTitle || emp.role || 'Staff Member'}</span>
                    {(emp.profile?.department?.name || emp.departmentName) && (
                      <>
                        <span className="text-slate-400 mx-1.5 font-normal">|</span>
                        <span>{emp.profile?.department?.name || emp.departmentName}</span>
                      </>
                    )}
                  </p>

                  <div className="space-y-1 mt-2 text-xs font-normal">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold truncate" title="Assigned Office Work Location">
                      <Building2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">{emp.profile?.workLocation || emp.workLocation || 'Karachi Regional Hub'}</span>
                    </div>
                    {(emp.profile?.address || emp.address) && (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] truncate" title="Residential Home Address">
                        <Home className="w-3 h-3 text-amber-500/80 shrink-0" />
                        <span className="truncate">{emp.profile?.address || emp.address}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed mt-3.5 font-normal line-clamp-4">
                    {getEmployeeBio(emp)}
                  </p>

                  <div className="space-y-2 mt-4 text-xs font-normal text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {emp.email ? (
                        <a
                          href={`mailto:${emp.email}`}
                          className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate"
                        >
                          {emp.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No email provided</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDob(emp.profile?.dateOfBirth || emp.dateOfBirth || emp.dob)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {emp.phone || emp.profile?.phone ? (
                        <a
                          href={`tel:${emp.phone || emp.profile?.phone}`}
                          className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        >
                          {emp.phone || emp.profile?.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not Provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Footer: Joined Date & Rounded Action Icons */}
              <div className="px-6 pb-6 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Joined on {formatJoiningDate(emp.profile?.joiningDate || emp.joiningDate || emp.createdAt)}
                </span>

                <div className="flex items-center gap-2">
                  {/* Full Profile View */}
                  <button
                    type="button"
                    onClick={() => setSelectedEmployee(emp)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                    title="Full Profile Dossier"
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  {/* Edit Shift & Status */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(emp)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                    title="Update Status & Shift"
                  >
                    <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  {/* Remove Employee */}
                  <button
                    type="button"
                    onClick={() => setEmployeeToDelete(emp)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                    title="Remove Employee"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: UPDATE STATUS & SHIFTS (NEW TICKET CARD UI DESIGN) */}
      {/* ========================================================================= */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                  <Briefcase className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Update {selectedEmp.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedEmp.employeeCode} • Configure classification, shift timing, and work station.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmp(null)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-6">
              {/* Quick Status Selection Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Quick Classification Selector
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'FULL_TIME', label: 'Full-Time Permanent', hint: 'Standard payroll' },
                    { id: 'REMOTE', label: 'Full-Time Remote', hint: 'Distributed hub' },
                    { id: 'CONTRACT', label: 'Fixed Contract', hint: 'Term-based' },
                    { id: 'PROBATION', label: 'Probationary Period', hint: '90-day evaluation' },
                  ].map((t) => {
                    const isSelected = selectedEmp.employmentType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedEmp((prev) => ({ ...prev, employmentType: t.id }))}
                        className={`relative p-3.5 rounded-[12px] border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
                          isSelected
                            ? 'bg-sky-50/60 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/20 shadow-sm'
                            : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-end mb-1">
                          {isSelected ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-sky-500 ring-2 ring-sky-200 dark:ring-sky-900 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-3 h-3 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-tight ${
                            isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {t.label}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{t.hint}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row: Classification & Shift Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-sky-500" />
                      Employment Classification <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <select
                    value={selectedEmp.employmentType}
                    onChange={(e) => setSelectedEmp({ ...selectedEmp, employmentType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="FULL_TIME">Full-Time Permanent</option>
                    <option value="REMOTE">Full-Time Remote</option>
                    <option value="CONTRACT">Fixed-Term Contract</option>
                    <option value="PROBATION">Probationary Period</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      Assigned Shift Schedule <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <select
                    value={selectedEmp.shift}
                    onChange={(e) => setSelectedEmp({ ...selectedEmp, shift: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="General Morning (09:00 - 17:30)">General Shift (09:00 AM - 05:30 PM)</option>
                    <option value="Flexible Remote">Flexible Remote (Asynchronous)</option>
                    <option value="Morning Shift (07:00 - 15:30)">Morning Shift (07:00 AM - 03:30 PM)</option>
                    <option value="Night Shift / Escalations">Night Escalations (16:00 - 00:30)</option>
                  </select>
                </div>
              </div>

              {/* Office Location */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-500" />
                    Assigned Office Work Location <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-medium text-slate-400">Physical Campus / Hub</span>
                </div>
                <select
                  value={['Islamabad HQ & Innovation Lab', 'Karachi Regional Hub', 'Lahore Tech Campus', 'Remote & Distributed Worldwide'].includes(selectedEmp.location) ? selectedEmp.location : 'CUSTOM'}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setSelectedEmp({ ...selectedEmp, location: '' });
                    } else {
                      setSelectedEmp({ ...selectedEmp, location: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                >
                  <option value="Islamabad HQ & Innovation Lab">Islamabad HQ & Innovation Lab (Main Campus)</option>
                  <option value="Karachi Regional Hub">Karachi Regional Hub (Commercial Office)</option>
                  <option value="Lahore Tech Campus">Lahore Tech Campus (Engineering)</option>
                  <option value="Remote & Distributed Worldwide">Remote & Distributed Worldwide</option>
                  <option value="CUSTOM">Custom Office Campus / Branch...</option>
                </select>
                {(!['Islamabad HQ & Innovation Lab', 'Karachi Regional Hub', 'Lahore Tech Campus', 'Remote & Distributed Worldwide'].includes(selectedEmp.location)) && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom office campus or branch address"
                    value={selectedEmp.location}
                    onChange={(e) => setSelectedEmp({ ...selectedEmp, location: e.target.value })}
                    className="w-full mt-2.5 px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                )}
              </div>

              {/* Live Preview & Dossier Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-sky-500" />
                    Live Preview & Dossier Card
                  </label>
                  <span className="text-xs font-medium text-slate-400">Real-time profile summary</span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-sky-50/40 dark:from-slate-900/80 dark:via-slate-800/80 dark:to-sky-950/20 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0 overflow-hidden border border-sky-200/80 dark:border-sky-800/80">
                      {getAvatarUrl(selectedEmp) && getAvatarUrl(selectedEmp) !== DEFAULT_BLANK_AVATAR ? (
                        <img
                          src={getAvatarUrl(selectedEmp)}
                          alt={selectedEmp.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {selectedEmp.name
                            ? selectedEmp.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()
                            : 'EM'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                        {selectedEmp.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                        {selectedEmp.shift} • {selectedEmp.location}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full border shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto ${
                      selectedEmp.employmentType === 'FULL_TIME'
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80'
                        : selectedEmp.employmentType === 'REMOTE'
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80'
                        : selectedEmp.employmentType === 'CONTRACT'
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80'
                        : 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    <span>{selectedEmp.employmentType.replace('_', ' ')}</span>
                  </span>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Real-time directory sync & audit trail logged</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedEmp(null)}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: EMPLOYEE PROFILE VIEW (DOSSIER VIEW) */}
      {/* ========================================================================= */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-3xl sm:max-w-4xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Profile Header */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-4 ring-sky-100 dark:ring-sky-950/50 shadow-lg shadow-sky-500/20 shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={getAvatarUrl(selectedEmployee)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_BLANK_AVATAR;
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-sans tabular-nums font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 px-2.5 py-0.5 rounded-[12px] border border-sky-200/80 dark:border-sky-800/60 inline-block">
                      {selectedEmployee.employeeCode}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                    {selectedEmployee.profile?.designation?.title || 'Staff Member'} • {selectedEmployee.profile?.department?.name || 'Engineering'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">Department</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {selectedEmployee.profile?.department?.name || 'Engineering'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">Role Authorization</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{selectedEmployee.role || 'EMPLOYEE'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">Base Compensation</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatSalary(selectedEmployee.salaryStructure, selectedEmployee.profile?.salary)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">Contact Email</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">{selectedEmployee.email}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="text-[10px] uppercase font-black text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Office Work Location</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">
                  {selectedEmployee.profile?.workLocation || selectedEmployee.workLocation || 'Islamabad HQ & Innovation Lab'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <Home className="w-3.5 h-3.5" />
                  <span>Residential Home Address</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">
                  {selectedEmployee.profile?.address || selectedEmployee.address || 'Home Address Not Specified'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-inner sm:col-span-2 md:col-span-1">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">Onboarding Date</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                  {selectedEmployee.profile?.joiningDate ? selectedEmployee.profile.joiningDate.split('T')[0] : (selectedEmployee.createdAt ? selectedEmployee.createdAt.split('T')[0] : 'Active')}
                </span>
              </div>
            </div>

            {/* Dossier Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedEmployee;
                    setSelectedEmployee(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2.5 rounded-[12px] border border-sky-200 dark:border-sky-800/80 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-extrabold hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all flex items-center gap-2 cursor-pointer text-xs shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedEmployee;
                    setSelectedEmployee(null);
                    setEmployeeToDelete(toDelete);
                  }}
                  className="px-4 py-2.5 rounded-[12px] border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
                  title="Remove Employee from Directory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-[12px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: REMOVE EMPLOYEE CONFIRMATION */}
      {/* ========================================================================= */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-[999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200 space-y-5">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-red-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 ring-4 ring-rose-100 dark:ring-rose-950/50 shrink-0">
                  <UserX className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Remove Employee
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    Confirm Deletion Action
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white font-extrabold">{employeeToDelete.firstName} {employeeToDelete.lastName}</strong> (<span className="font-sans tabular-nums text-slate-500 dark:text-slate-400">{employeeToDelete.employeeCode}</span>) from company directory?
            </p>

            {/* Employee Preview Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Department</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {employeeToDelete.profile?.department?.name || 'General Dept'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50 pt-2.5">
                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Role Authorization</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{employeeToDelete.role || 'EMPLOYEE'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50 pt-2.5">
                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Work Email</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">{employeeToDelete.email}</span>
              </div>
            </div>

            {/* Permanent Warning */}
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>This record will be permanently deleted from the database.</span>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                disabled={deleting}
                className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Removing Employee...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                    <span>Remove Employee</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentStatus;
