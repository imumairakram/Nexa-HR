import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { SecurityRosterSkeleton } from '../../components/common/Skeleton';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  CreditCard,
  CalendarDays,
  Landmark,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Save,
  RotateCcw,
  Check,
  X,
  Lock,
  Unlock,
  Sliders,
  UserCheck,
  Building,
  RefreshCw,
  Eye,
  FileText,
  UserX,
  List,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  FEATURE_MODULES,
  ROLE_PRESETS,
  getUserFeatureAccess,
  saveUserFeatureAccess,
} from '../../utils/accessControl';

const DEFAULT_BLANK_AVATAR = '/blank-profile-picture.png';

const getAvatarUrl = (emp) => {
  if (!emp) return null;
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
  return null;
};

const UserAccessControl = () => {
  const navigate = useNavigate();

  // Current logged in user info
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  });

  const isAdmin = currentUser.role === 'ADMIN';

  // State
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'CUSTOM' | 'ADMIN' | 'STANDARD'
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected User for permission editing
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [activePreset, setActivePreset] = useState('CUSTOM');
  const [isCustom, setIsCustom] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState('permissions'); // 'permissions' | 'audit'
  const [auditLogs, setAuditLogs] = useState([]);

  // Toast Helper
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Load live employees and departments
  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.allSettled([
        api.getEmployees(),
        api.getDepartments(),
      ]);

      let loadedEmps = [];
      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        loadedEmps = empRes.value.data.employees;
        setEmployees(loadedEmps);
        if (loadedEmps.length > 0 && !selectedUserId) {
          // Select first employee by default
          selectUser(loadedEmps[0]);
        }
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
        setDepartments(deptRes.value.data.departments);
      }

      // Load audit logs
      try {
        const rawLogs = localStorage.getItem('nexahr_security_audit_logs');
        if (rawLogs) setAuditLogs(JSON.parse(rawLogs));
      } catch (e) {
        console.warn(e);
      }
    } catch (err) {
      console.error('Failed to load access control data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [userRole, setUserRole] = useState('EMPLOYEE');
  const [userActive, setUserActive] = useState(true);

  // Select User and compute their active feature map
  const selectUser = (emp) => {
    setSelectedUserId(emp.id);
    setUserRole(emp.role || 'EMPLOYEE');
    setUserActive(emp.isActive !== false);
    const access = getUserFeatureAccess(emp.id, emp.role);
    setUserPermissions(access.permissions);
    setActivePreset(access.presetKey);
    setIsCustom(access.isCustom);
  };

  const selectedEmployee = employees.find((e) => e.id === selectedUserId);

  // Toggle individual feature switch
  const handleToggleFeature = (featureKey) => {
    setUserPermissions((prev) => {
      const updated = { ...prev, [featureKey]: !prev[featureKey] };
      setActivePreset('CUSTOM');
      setIsCustom(true);
      return updated;
    });
  };

  // Toggle entire module
  const handleToggleModule = (moduleId, enable) => {
    const mod = FEATURE_MODULES.find((m) => m.id === moduleId);
    if (!mod) return;

    setUserPermissions((prev) => {
      const updated = { ...prev };
      mod.features.forEach((f) => {
        updated[f.key] = enable;
      });
      setActivePreset('CUSTOM');
      setIsCustom(true);
      return updated;
    });
  };

  // Apply Role Preset
  const handleApplyPreset = (presetKey) => {
    const preset = ROLE_PRESETS[presetKey];
    if (!preset) return;

    setUserPermissions({ ...preset.permissions });
    setActivePreset(presetKey);
    setIsCustom(presetKey !== 'CUSTOM');
    showToast(`Applied preset: ${preset.label}`);
  };

  // Grant All Features
  const handleGrantAll = () => {
    const all = {};
    FEATURE_MODULES.forEach((mod) => {
      mod.features.forEach((f) => {
        all[f.key] = true;
      });
    });
    setUserPermissions(all);
    setActivePreset('SUPER_ADMIN');
    setIsCustom(true);
    showToast('Granted full system administrative access to all features.');
  };

  // Revoke All Non-Directory Features
  const handleRevokeAll = () => {
    const restricted = {};
    FEATURE_MODULES.forEach((mod) => {
      mod.features.forEach((f) => {
        restricted[f.key] = f.key === 'view_directory';
      });
    });
    setUserPermissions(restricted);
    setActivePreset('STANDARD_EMPLOYEE');
    setIsCustom(true);
    showToast('Revoked all administrative and managerial feature privileges.');
  };

  // Reset to Role Default
  const handleResetDefault = () => {
    if (!selectedEmployee) return;
    try {
      const raw = localStorage.getItem('nexahr_user_feature_access');
      if (raw) {
        const allUserAccess = JSON.parse(raw);
        delete allUserAccess[selectedEmployee.id];
        localStorage.setItem('nexahr_user_feature_access', JSON.stringify(allUserAccess));
      }
    } catch (e) {
      console.warn(e);
    }
    const access = getUserFeatureAccess(selectedEmployee.id, selectedEmployee.role);
    setUserPermissions(access.permissions);
    setActivePreset(access.presetKey);
    setIsCustom(false);
    showToast(`Reset permissions to ${selectedEmployee.role} system default.`);
  };

  // Save changes to persistent storage and database
  const handleSave = async () => {
    if (!selectedEmployee) return;

    setSubmitting(true);
    try {
      // 1. Update Database Role & Active Status if changed
      if (userRole !== selectedEmployee.role || userActive !== selectedEmployee.isActive) {
        await api.updateEmployee(selectedEmployee.id, {
          role: userRole,
          isActive: userActive,
        });
        setEmployees((prev) =>
          prev.map((e) => (e.id === selectedEmployee.id ? { ...e, role: userRole, isActive: userActive } : e))
        );
      }

      // 2. Save feature permissions
      const success = saveUserFeatureAccess(
        selectedEmployee.id,
        userPermissions,
        activePreset,
        currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'System Administrator'
      );

      if (success) {
        setIsCustom(true);
        showToast(`Access permissions & system role saved for ${selectedEmployee.firstName} ${selectedEmployee.lastName}!`);
        // Reload logs
        try {
          const rawLogs = localStorage.getItem('nexahr_security_audit_logs');
          if (rawLogs) setAuditLogs(JSON.parse(rawLogs));
        } catch (e) {
          console.warn(e);
        }
      } else {
        showToast('Could not save user feature access.', 'error');
      }
    } catch (err) {
      if (err.name === 'DemoModeError' || err.code === 'DEMO_MODE') return;
      showToast(err.message || 'Failed to update user role in database.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.employeeCode && emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || emp.profile?.department?.name === selectedDept || emp.profile?.departmentId === selectedDept;

    const access = getUserFeatureAccess(emp.id, emp.role);
    let matchesFilter = true;
    if (filterType === 'CUSTOM') matchesFilter = access.isCustom;
    else if (filterType === 'ADMIN') matchesFilter = emp.role === 'ADMIN' || access.presetKey === 'SUPER_ADMIN';
    else if (filterType === 'STANDARD') matchesFilter = emp.role === 'EMPLOYEE' && !access.isCustom;

    return matchesSearch && matchesDept && matchesFilter;
  });

  // Calculate Metrics
  const customCount = employees.filter((e) => getUserFeatureAccess(e.id, e.role).isCustom).length;
  const adminCount = employees.filter((e) => e.role === 'ADMIN').length;

  const deptCounts = useMemo(() => {
    const counts = { ALL: employees.length };
    departments.forEach((d) => {
      counts[d.name] = employees.filter(
        (e) => e.profile?.department?.name === d.name || e.profile?.departmentId === d.id
      ).length;
    });
    return counts;
  }, [employees, departments]);

  const clearanceCounts = useMemo(() => ({
    ALL: employees.length,
    ADMIN: employees.filter((e) => e.role === 'ADMIN' || getUserFeatureAccess(e.id, e.role).presetKey === 'SUPER_ADMIN').length,
    CUSTOM: employees.filter((e) => getUserFeatureAccess(e.id, e.role).isCustom).length,
    STANDARD: employees.filter((e) => e.role === 'EMPLOYEE' && !getUserFeatureAccess(e.id, e.role).isCustom).length,
  }), [employees]);

  // Dynamic Sparkline Data for Access Control
  const workforceSparkData = useMemo(() => {
    const total = employees.length;
    return [
      { value: Math.max(0, total - 5), label: 'Mon' },
      { value: Math.max(0, total - 4), label: 'Tue' },
      { value: Math.max(0, total - 3), label: 'Wed' },
      { value: Math.max(0, total - 2), label: 'Thu' },
      { value: Math.max(0, total - 1), label: 'Fri' },
      { value: Math.max(0, total), label: 'Sat' },
      { value: total, label: 'Today' },
    ];
  }, [employees.length]);

  const customSparkData = useMemo(() => {
    return [
      { value: Math.max(0, customCount - 2), label: 'Q1' },
      { value: Math.max(0, customCount - 1), label: 'Q2' },
      { value: Math.max(0, customCount - 1), label: 'Q3' },
      { value: customCount, label: 'Q4' },
      { value: customCount, label: 'Active' },
    ];
  }, [customCount]);

  const adminSparkData = useMemo(() => {
    return [
      { value: Math.max(1, adminCount - 1), label: 'Tier 1' },
      { value: Math.max(1, adminCount - 1), label: 'Tier 2' },
      { value: adminCount, label: 'Tier 3' },
      { value: adminCount, label: 'Active' },
    ];
  }, [adminCount]);

  const totalFeaturesCount = useMemo(() => {
    return FEATURE_MODULES.reduce((sum, m) => sum + (m.features ? m.features.length : 0), 0);
  }, []);

  const modulesSparkData = useMemo(() => {
    return FEATURE_MODULES.map((m, idx) => ({
      value: m.features ? m.features.length : 4,
      label: (m.name || m.title || '').slice(0, 3) || `M${idx + 1}`,
      tooltip: `${m.name || m.title}: ${m.features ? m.features.length : 0} Features`,
    }));
  }, []);

  // Render Module Icon Helper
  const renderModuleIcon = (iconName) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Clock':
        return <Clock className="w-5 h-5" />;
      case 'CalendarDays':
        return <CalendarDays className="w-5 h-5" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  // Guard: If not admin, show restricted screen
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#1E293B] rounded-[32px] p-8 text-center shadow-xl border border-rose-100 dark:border-rose-900/40 space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] border border-rose-200 dark:border-rose-900">
              Clearance Level Restricted
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              System Administrator Access Only
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The User Feature Access & Clearance Control Center is restricted strictly to root System Administrators. HR Managers and staff members do not have permission to modify system security clearance or role access.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-md cursor-pointer transition-all hover:scale-105"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="User Access Control & Security"
        subtitle="Configure granular feature permissions per employee, delegate administrative privileges, and assign departmental presets."
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
      {/* 1. DYNAMIC SYSTEM ADMIN ACCESS CONTROL HERO BANNER (INDIGO-VIOLET LIGHT THEME) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Telemetry Header */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              User Feature Access & Authorization Manager
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
              Assign specific module features to individual employees without changing their core role. Enable payroll calculation for accountants, candidate pipeline for recruiters, or leave approval for supervisors.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{employees.length} Registered Accounts</span>
              </span>
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{customCount} Users with Custom Overrides</span>
              </span>
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{FEATURE_MODULES.length} Security Feature Modules</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Active Inspector</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Select an employee'}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={submitting || !selectedEmployee}
              className="w-full px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving Policy...' : 'Save Permissions'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC SPARKLINES TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="dark"
          title="Total Workforce"
          value={employees.length}
          unit={employees.length === 1 ? 'Staff' : 'Staff'}
          badgeText="100% Policy Mapped"
          badgeType="positive"
          badgeIcon="up"
          subtext="Workforce Clearance"
          chartColor="purple"
          dataPoints={workforceSparkData}
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Custom Overrides"
          value={customCount}
          unit={customCount === 1 ? 'User' : 'Users'}
          badgeText="Granular Grants"
          badgeType="positive"
          badgeIcon="up"
          subtext="Delegated Permissions"
          chartColor="emerald"
          dataPoints={customSparkData}
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Master Admins"
          value={adminCount}
          unit={adminCount === 1 ? 'Admin' : 'Admins'}
          badgeText="Root Clearance"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Superuser Privileges"
          chartColor="amber"
          dataPoints={adminSparkData}
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Governed Modules"
          value={FEATURE_MODULES.length}
          unit="Modules"
          badgeText={`${totalFeaturesCount} Features`}
          badgeType="positive"
          badgeIcon="up"
          subtext="Security Governance"
          chartColor="rose"
          dataPoints={modulesSparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. SPLIT-SCREEN MASTER-DETAIL WORKFORCE ACCESS INSPECTOR */}
      {/* ========================================================================= */}
      {loading ? (
        <SecurityRosterSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: User Roster & Filter List (5 cols) */}
        <div className="lg:col-span-5 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl border border-sky-100/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Employee Roster
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Directory & access clearance
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 shadow-2xs">
              {filteredEmployees.length} Matches
            </span>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-[#5B727B] dark:text-[#8FA8B1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, email, EMP code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-[12px] bg-[#F5F8F9] dark:bg-[#0D1B21] border border-[#DCE6EA] dark:border-[#223840] text-xs sm:text-[13.5px] font-medium text-[#0E2A33] dark:text-[#E6F2F5] placeholder-[#5B727B]/70 focus:outline-none focus:border-[#0A8FB5] dark:focus:border-[#3CC1E6] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B727B] hover:text-[#0E2A33] dark:text-[#8FA8B1] dark:hover:text-white p-0.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all cursor-pointer"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Button with Dropdown Menu */}
              <div className="relative shrink-0" ref={filterDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowFilterMenu((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[12px] text-xs sm:text-[13.5px] font-medium border transition-all cursor-pointer shadow-2xs shrink-0 ${
                    selectedDept !== 'ALL' || filterType !== 'ALL'
                      ? 'bg-[#E1F4FA] dark:bg-[#12333D] border-[#0A8FB5] dark:border-[#3CC1E6] text-[#07617D] dark:text-[#3CC1E6]'
                      : 'bg-white dark:bg-[#112229] border-[#DCE6EA] dark:border-[#223840] text-[#0E2A33] dark:text-[#E6F2F5] hover:border-[#0A8FB5]'
                  }`}
                  title="Filter by Department or Clearance"
                >
                  <Filter className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="text-xs">
                    {selectedDept !== 'ALL' && filterType !== 'ALL'
                      ? '2 Filters'
                      : selectedDept !== 'ALL'
                      ? selectedDept
                      : filterType !== 'ALL'
                      ? filterType === 'CUSTOM'
                        ? 'Custom'
                        : filterType === 'ADMIN'
                        ? 'Admins'
                        : 'Standard'
                      : 'Filter'}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      showFilterMenu ? 'rotate-180' : ''
                    }`}
                  />
                  {(selectedDept !== 'ALL' || filterType !== 'ALL') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-sky-100/90 dark:border-slate-700 shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
                    {/* Clearance Section */}
                    <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Clearance Level
                      </div>
                    </div>
                    <div className="p-1 space-y-0.5">
                      {[
                        { key: 'ALL', label: 'All Clearances', count: clearanceCounts.ALL },
                        { key: 'ADMIN', label: 'Master Admins', count: clearanceCounts.ADMIN },
                        { key: 'CUSTOM', label: 'Custom Overrides', count: clearanceCounts.CUSTOM },
                        { key: 'STANDARD', label: 'Standard Roles', count: clearanceCounts.STANDARD },
                      ].map(({ key, label, count }) => {
                        const isSelected = filterType === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFilterType(key)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected
                                    ? 'bg-sky-500 ring-2 ring-sky-300 dark:ring-sky-700'
                                    : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                              />
                              <span>{label}</span>
                            </div>
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

                    {/* Department Section */}
                    <div className="px-3.5 py-1.5 mt-1 border-t border-b border-slate-100 dark:border-slate-700/60">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Department
                      </div>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDept('ALL')}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selectedDept === 'ALL'
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              selectedDept === 'ALL'
                                ? 'bg-sky-500 ring-2 ring-sky-300 dark:ring-sky-700'
                                : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          />
                          <span>All Departments</span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                            selectedDept === 'ALL'
                              ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {deptCounts.ALL}
                        </span>
                      </button>

                      {departments.map((d) => {
                        const isSelected = selectedDept === d.name;
                        const count = deptCounts[d.name] || 0;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSelectedDept(d.name)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isSelected
                                    ? 'bg-sky-500 ring-2 ring-sky-300 dark:ring-sky-700'
                                    : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                              />
                              <span className="truncate">{d.name}</span>
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
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

                    {(selectedDept !== 'ALL' || filterType !== 'ALL') && (
                      <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-700/60 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDept('ALL');
                            setFilterType('ALL');
                            setShowFilterMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset All Filters</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Badges */}
            {(selectedDept !== 'ALL' || filterType !== 'ALL' || searchQuery) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                {selectedDept !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold">
                    Dept: {selectedDept}
                    <button
                      type="button"
                      onClick={() => setSelectedDept('ALL')}
                      className="hover:text-sky-900 dark:hover:text-sky-100 cursor-pointer p-0.5"
                      title="Clear Dept Filter"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {filterType !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold">
                    Clearance: {filterType === 'CUSTOM' ? 'Custom' : filterType === 'ADMIN' ? 'Admin' : 'Standard'}
                    <button
                      type="button"
                      onClick={() => setFilterType('ALL')}
                      className="hover:text-sky-900 dark:hover:text-sky-100 cursor-pointer p-0.5"
                      title="Clear Clearance Filter"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                    "{searchQuery}"
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="hover:text-slate-900 dark:hover:text-white cursor-pointer p-0.5"
                      title="Clear Search"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDept('ALL');
                    setFilterType('ALL');
                    setSearchQuery('');
                  }}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 ml-auto cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Employee List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === selectedUserId;
              const access = getUserFeatureAccess(emp.id, emp.role);
              const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
              const avatarUrl = getAvatarUrl(emp);

              return (
                <div
                  key={emp.id}
                  onClick={() => selectUser(emp)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-50/90 via-sky-50/40 to-white dark:from-sky-950/60 dark:via-sky-900/20 dark:to-slate-800/60 border-sky-400 dark:border-sky-600 ring-2 ring-sky-500/20 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 hover:border-sky-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={emp.firstName}
                        className="w-10 h-10 rounded-2xl object-cover ring-2 ring-sky-200/70 dark:ring-sky-900 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20 ring-2 ring-sky-200/70 dark:ring-sky-900">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {emp.firstName} {emp.lastName}
                        </span>
                        {emp.role === 'ADMIN' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase border border-rose-200/80 dark:border-rose-900/60">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {emp.profile?.designation?.title || emp.role} • {emp.profile?.department?.name || 'General'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {access.isCustom ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold border border-sky-200/80 dark:border-sky-800/80">
                        Custom
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700/60">
                        {emp.role}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-sky-600 dark:text-sky-400 translate-x-1' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}

            {filteredEmployees.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-500">No staff members found</div>
                <div className="text-[11px] text-slate-400">Try adjusting your search or department filter</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Granular Feature Permission Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedEmployee ? (
            <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-xl border border-sky-100/80 dark:border-slate-800 space-y-6">
              {/* Selected User Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-sky-50/40 dark:from-sky-950/40 dark:via-slate-800/80 dark:to-sky-900/20 border border-sky-200/70 dark:border-sky-900/50 shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  {getAvatarUrl(selectedEmployee) ? (
                    <img
                      src={getAvatarUrl(selectedEmployee)}
                      alt={selectedEmployee.firstName}
                      className="w-13 h-13 rounded-2xl object-cover ring-4 ring-sky-100 dark:ring-sky-950/60 shadow-md shadow-sky-500/20 shrink-0"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                      {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </h3>
                      <span className="font-mono text-[11px] text-sky-700 dark:text-sky-300 font-bold bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-sky-200/80 dark:border-sky-800/80 shadow-2xs">
                        {selectedEmployee.employeeCode || 'EMP-CODE'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      {selectedEmployee.email} • {selectedEmployee.profile?.designation?.title || 'Staff Specialist'}
                    </div>
                  </div>
                </div>

                {/* Role Preset Quick Dropdown */}
                <div className="space-y-1 sm:text-right shrink-0">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Permission Preset
                  </label>
                  <select
                    value={activePreset}
                    onChange={(e) => handleApplyPreset(e.target.value)}
                    className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-sky-800/80 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer shadow-2xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="SUPER_ADMIN">Super Administrator</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="PAYROLL_SPECIALIST">Payroll Specialist</option>
                    <option value="RECRUITER">Talent Recruiter</option>
                    <option value="TEAM_LEAD">Team Supervisor</option>
                    <option value="STANDARD_EMPLOYEE">Standard Employee</option>
                    <option value="CUSTOM">Custom User Access</option>
                  </select>
                </div>
              </div>

              {/* Quick Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGrantAll}
                    className="px-3.5 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    Grant All Features
                  </button>
                  <button
                    onClick={handleRevokeAll}
                    className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    Revoke Elevated Rights
                  </button>
                  <button
                    onClick={handleResetDefault}
                    className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Role Default</span>
                  </button>
                </div>

                {/* Tabs Switcher Pill */}
                <div className="flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/90 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                  <button
                    onClick={() => setActiveTab('permissions')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'permissions'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Features Matrix
                  </button>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'audit'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Audit Trail
                  </button>
                </div>
              </div>

              {/* TAB 1: GRANULAR FEATURE PERMISSION MODULES */}
              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  {FEATURE_MODULES.map((module) => {
                    const allEnabled = module.features.every((f) => !!userPermissions[f.key]);
                    const enabledCount = module.features.filter((f) => !!userPermissions[f.key]).length;

                    return (
                      <div
                        key={module.id}
                        className="rounded-3xl bg-white dark:bg-slate-900/60 border border-sky-100/90 dark:border-slate-800 shadow-xs overflow-hidden"
                      >
                        {/* Module Header */}
                        <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50/50 via-white to-transparent dark:from-sky-950/30 dark:via-slate-800/40 dark:to-transparent border-b border-sky-100/70 dark:border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs border border-sky-200/70 dark:border-sky-800/60 ring-2 ring-sky-100/60 dark:ring-sky-950/40">
                              {renderModuleIcon(module.icon)}
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                                {module.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{module.description}</p>
                            </div>
                          </div>

                          {/* Module Quick Toggle */}
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
                              {enabledCount} / {module.features.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleModule(module.id, !allEnabled)}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                allEnabled
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-700'
                                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'
                              }`}
                            >
                              {allEnabled ? 'Disable All' : 'Enable All'}
                            </button>
                          </div>
                        </div>

                        {/* Individual Features Grid */}
                        <div className="p-4 sm:p-5 divide-y divide-slate-100/80 dark:divide-slate-800/80">
                          {module.features.map((feat) => {
                            const isAllowed = !!userPermissions[feat.key];

                            return (
                              <div
                                key={feat.key}
                                className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                              >
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {feat.label}
                                  </div>
                                  <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium leading-relaxed">
                                    {feat.description}
                                  </div>
                                </div>

                                {/* Modern Switch Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeature(feat.key)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isAllowed ? 'bg-sky-500 shadow-sm shadow-sky-500/25' : 'bg-slate-200 dark:bg-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                      isAllowed ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: SECURITY AUDIT TRAIL LOG */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Recent Authorization Modifications
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
                      {auditLogs.length} Events Logged
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs hover:border-sky-200 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                            <span>{log.action}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Authorized by: <span className="font-semibold text-slate-700 dark:text-slate-300">{log.performedBy}</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200/70 dark:border-slate-800">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    {auditLogs.length === 0 && (
                      <div className="text-center py-10 text-xs text-slate-400 font-medium">
                        No authorization changes recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Sticky Save CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isCustom ? (
                    <span className="text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Custom user policy override active</span>
                    </span>
                  ) : (
                    <span>Using default {selectedEmployee.role} profile</span>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving Policy...' : 'Save & Enforce Policy'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl p-12 text-center shadow-xl border border-sky-100/80 dark:border-slate-800 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50">
                <Users className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Select an Employee to Inspect Feature Access
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                Choose any employee from the roster on the left to configure their custom feature access, module permissions, and role presets.
              </p>
            </div>
          )}
        </div>
      </div>
    )}
    </div>
  );
};

export default UserAccessControl;
