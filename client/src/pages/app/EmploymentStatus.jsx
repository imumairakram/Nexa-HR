import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { EmployeeCardSkeleton } from '../../components/common/Skeleton';
import {
  Users,
  Search,
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
    } catch {}
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
  } catch {}

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
    return `$${total.toLocaleString()} / mo`;
  }
  if (rawSalary) {
    if (typeof rawSalary === 'number') return `$${rawSalary.toLocaleString()} / mo`;
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

  const filtered = employees.filter((emp) => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const code = (emp.employeeCode || '').toLowerCase();
    const desig = (emp.profile?.designation?.title || emp.role || '').toLowerCase();
    const dept = (emp.profile?.department?.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query) || code.includes(query) || desig.includes(query) || dept.includes(query);
    const empType = getEffectiveType(emp);
    const matchesType = typeFilter === 'ALL' || empType === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: employees.length,
    fullTime: employees.filter((e) => getEffectiveType(e) === 'FULL_TIME').length,
    remote: employees.filter((e) => getEffectiveType(e) === 'REMOTE').length,
    probation: employees.filter((e) => getEffectiveType(e) === 'PROBATION' || getEffectiveType(e) === 'CONTRACT').length,
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Workforce Employment Status & Shifts"
        subtitle="Manage employment classifications, remote work contracts, shift timings, and probation statuses."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC EMPLOYMENT STATUS HERO BANNER (SKY BLUE LIGHT THEME) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/20 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Employment Status Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Workforce Classifications & Shift Roster
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Manage permanent full-time agreements, remote engineering contracts, shift schedules, and 90-day probationary review milestones.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold bg-sky-100/70 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800/60">
                <Users className="w-3.5 h-3.5" />
                <span>{stats.total} Total Active Personnel</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <Clock className="w-3.5 h-3.5" />
                <span>{stats.probation} Contracts / Probation</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Status Overview</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.fullTime} Permanent • {stats.remote} Remote</div>
            </div>
            <div className="w-full text-center py-2 px-3 bg-sky-50 dark:bg-sky-950/50 rounded-2xl border border-sky-200/60 dark:border-sky-800/40 text-xs font-bold text-sky-700 dark:text-sky-300">
              100% Policy Compliant
            </div>
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
      {/* 3. TOOLBAR & FILTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by employee name, role, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['ALL', 'FULL_TIME', 'REMOTE', 'CONTRACT', 'PROBATION'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === type
                  ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-700 dark:hover:text-sky-300'
              }`}
            >
              {type === 'ALL' ? 'All Personnel' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

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
          {filtered.map((emp, idx) => {
            const empType = getEffectiveType(emp);
            const classInfo = getClassificationBadge(empType);
            const employeeCode = emp.employeeCode || `EMP-${(emp.id || '').slice(0, 4)}`;

            return (
              <div
                key={emp.id || idx}
                className="group relative overflow-hidden rounded-[28px] bg-white dark:bg-[#1E293B] shadow-soft hover:shadow-xl hover:border-sky-300/80 dark:hover:border-sky-700/70 hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
              >
                {/* Ambient Sky Glow */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

                <div className="p-6 pb-2 relative z-10">
                  {/* 1. Header: Avatar with Status Dot + Classification Pill */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative inline-block">
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl ring-4 ring-sky-100/70 dark:ring-sky-950/60 shadow-sm overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <img
                          src={getAvatarUrl(emp)}
                          alt={`${emp.firstName} ${emp.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_BLANK_AVATAR;
                          }}
                        />
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1E293B] ${classInfo.dotClass} shadow-xs flex items-center justify-center`}
                        title={`Status: ${classInfo.label}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
                      </span>
                    </div>

                    {/* Classification Status Badge & Code */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shadow-xs ${classInfo.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${classInfo.dotClass}`} />
                        <span>{classInfo.short}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                        {employeeCode}
                      </span>
                    </div>
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

                    {/* 3. Shift Schedule Highlight Tile (Thematic Sky Blue Feature) */}
                    <div className="mt-4 p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-sky-800/70 dark:text-sky-400 tracking-wider block">
                            Assigned Shift
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                            {emp.profile?.shift || 'General Morning (09:00 - 17:30)'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(emp)}
                        className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60 shrink-0 transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {/* 4. Telemetry details (Office Location, Home Address, Email, Phone) */}
                    <div className="space-y-2 mt-3.5 text-xs font-normal text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2.5" title="Assigned Office Work Location">
                        <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                          {emp.profile?.workLocation || emp.workLocation || 'Islamabad HQ & Innovation Lab'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5" title="Residential Home Address">
                        <Home className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
                        <span className="truncate text-slate-500 dark:text-slate-400">
                          {emp.profile?.address || emp.address || 'Home Address Not Specified'}
                        </span>
                      </div>
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
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {emp.phone || emp.profile?.phone ? (
                          <a
                            href={`tel:${emp.phone || emp.profile?.phone}`}
                            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate"
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

                {/* 5. Footer: Joined Date & Rounded Action Icons */}
                <div className="px-6 pb-6 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-sky-500/70 shrink-0" />
                    <span>Joined {formatJoiningDate(emp.profile?.joiningDate || emp.joiningDate || emp.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Full Dossier View */}
                    <button
                      type="button"
                      onClick={() => setSelectedEmployee(emp)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60 hover:scale-105"
                      title="Full Profile Dossier"
                    >
                      <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>

                    {/* Edit Shift & Status Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(emp)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      title="Update Shift & Status"
                    >
                      <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Update</span>
                    </button>

                    {/* Remove / Archive */}
                    <button
                      type="button"
                      onClick={() => setEmployeeToDelete(emp)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60 hover:scale-105"
                      title="Remove Employee"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: UPDATE STATUS & SHIFTS */}
      {/* ========================================================================= */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-3xl sm:max-w-4xl w-full shadow-2xl border border-sky-200/60 dark:border-sky-800/60 overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-5 border-b border-sky-100/80 dark:border-sky-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/60 dark:via-sky-900/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 ring-4 ring-sky-500/15 shrink-0">
                  <Briefcase className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                    Update {selectedEmp.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    {selectedEmp.employeeCode} • Configure classification, shift timing, and work station.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleUpdateStatus} className="p-6 sm:p-7 space-y-5 text-xs relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Employment Classification *
                  </label>
                  <select
                    value={selectedEmp.employmentType}
                    onChange={(e) => setSelectedEmp({ ...selectedEmp, employmentType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer transition-all"
                  >
                    <option value="FULL_TIME">Full-Time Permanent</option>
                    <option value="REMOTE">Full-Time Remote</option>
                    <option value="CONTRACT">Fixed-Term Contract</option>
                    <option value="PROBATION">Probationary Period</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Assigned Shift Schedule *
                  </label>
                  <select
                    value={selectedEmp.shift}
                    onChange={(e) => setSelectedEmp({ ...selectedEmp, shift: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer transition-all"
                  >
                    <option value="General Morning (09:00 - 17:30)">General Shift (09:00 AM - 05:30 PM)</option>
                    <option value="Flexible Remote">Flexible Remote (Asynchronous)</option>
                    <option value="Morning Shift (07:00 - 15:30)">Morning Shift (07:00 AM - 03:30 PM)</option>
                    <option value="Night Shift / Escalations">Night Escalations (16:00 - 00:30)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                  <span>Assigned Office Work Location *</span>
                  <span className="text-[11px] text-slate-400 font-normal">Physical Campus / Hub</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={['Islamabad HQ & Innovation Lab', 'Karachi Regional Hub', 'Lahore Tech Campus', 'Remote & Distributed Worldwide'].includes(selectedEmp.location) ? selectedEmp.location : 'CUSTOM'}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setSelectedEmp({ ...selectedEmp, location: '' });
                      } else {
                        setSelectedEmp({ ...selectedEmp, location: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer transition-all text-xs"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 via-cyan-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-sky-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                    {selectedEmp.employmentType === 'FULL_TIME'
                      ? 'FT'
                      : selectedEmp.employmentType === 'REMOTE'
                      ? 'RM'
                      : selectedEmp.employmentType === 'CONTRACT'
                      ? 'CT'
                      : 'PR'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
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
                      ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : selectedEmp.employmentType === 'REMOTE'
                      ? 'bg-indigo-100/80 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      : selectedEmp.employmentType === 'CONTRACT'
                      ? 'bg-blue-100/80 text-blue-800 dark:bg-blue-300 border-blue-200 dark:border-blue-800'
                      : 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{selectedEmp.employmentType.replace('_', ' ')}</span>
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setSelectedEmp(null)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
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
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: EMPLOYEE PROFILE VIEW (DOSSIER VIEW) */}
      {/* ========================================================================= */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-3xl sm:max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-sky-200/60 dark:border-sky-800/60 space-y-4 animate-in zoom-in-95 duration-200 relative">
            {/* Profile Header */}
            <div className="flex items-start justify-between border-b border-sky-100/80 dark:border-sky-800/60 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src={getAvatarUrl(selectedEmployee)}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-sky-500/20 shadow-lg shrink-0 bg-slate-100 dark:bg-slate-800"
                  onError={(e) => {
                    e.target.src = DEFAULT_BLANK_AVATAR;
                  }}
                />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {selectedEmployee.employeeCode}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-xs font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                    {selectedEmployee.profile?.designation?.title || 'Staff Member'} • {selectedEmployee.profile?.department?.name || 'Engineering'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">Department</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {selectedEmployee.profile?.department?.name || 'Engineering'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">Role Authorization</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{selectedEmployee.role || 'EMPLOYEE'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">Base Compensation</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatSalary(selectedEmployee.salaryStructure, selectedEmployee.profile?.salary)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">Contact Email</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">{selectedEmployee.email}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-black text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1 mb-0.5">
                  <Building2 className="w-3 h-3" />
                  <span>Office Work Location</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {selectedEmployee.profile?.workLocation || selectedEmployee.workLocation || 'Islamabad HQ & Innovation Lab'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1 mb-0.5">
                  <Home className="w-3 h-3" />
                  <span>Residential Home Address</span>
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">
                  {selectedEmployee.profile?.address || selectedEmployee.address || 'Home Address Not Specified'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">Onboarding Date</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {selectedEmployee.profile?.joiningDate ? selectedEmployee.profile.joiningDate.split('T')[0] : (selectedEmployee.createdAt ? selectedEmployee.createdAt.split('T')[0] : 'Active')}
                </span>
              </div>
            </div>

            {/* Dossier Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    const toEdit = selectedEmployee;
                    setSelectedEmployee(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-extrabold hover:bg-sky-600 hover:text-white transition-all flex items-center gap-2 cursor-pointer text-xs shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    const toDelete = selectedEmployee;
                    setSelectedEmployee(null);
                    setEmployeeToDelete(toDelete);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
                  title="Remove Employee from Directory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-6 py-2.5 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-md"
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
        <div className="fixed inset-0 z-[999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-200/60 dark:border-rose-900/40 space-y-4 animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-start justify-between border-b border-rose-100/80 dark:border-rose-900/40 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25 ring-4 ring-rose-500/15">
                  <UserX className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Remove Employee
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-0.5 whitespace-nowrap">
                    Confirm Deletion Action
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white font-extrabold">{employeeToDelete.firstName} {employeeToDelete.lastName}</strong> (<span className="font-mono text-slate-500">{employeeToDelete.employeeCode}</span>) from company directory?
            </p>

            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold text-[11px]">Department:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {employeeToDelete.profile?.department?.name || 'General Dept'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50 pt-2">
                <span className="text-slate-400 font-bold text-[11px]">Role Authorization:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{employeeToDelete.role || 'EMPLOYEE'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50 pt-2">
                <span className="text-slate-400 font-bold text-[11px]">Work Email:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{employeeToDelete.email}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>This record will be permanently deleted from the database.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                disabled={deleting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
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
