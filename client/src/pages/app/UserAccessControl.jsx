import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '../../components/navigation/AppPageHeader';
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
} from 'lucide-react';
import { api } from '../../services/api';
import {
  FEATURE_MODULES,
  ROLE_PRESETS,
  getUserFeatureAccess,
  saveUserFeatureAccess,
} from '../../utils/accessControl';

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

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.email === 'admin@company.com';

  // State
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'CUSTOM' | 'ADMIN' | 'STANDARD'

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

  // Select User and compute their active feature map
  const selectUser = (emp) => {
    setSelectedUserId(emp.id);
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

  // Save changes to persistent storage
  const handleSave = () => {
    if (!selectedEmployee) return;

    setSubmitting(true);
    const success = saveUserFeatureAccess(
      selectedEmployee.id,
      userPermissions,
      activePreset,
      currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'System Administrator'
    );

    if (success) {
      setIsCustom(true);
      showToast(`Feature access permissions saved for ${selectedEmployee.firstName} ${selectedEmployee.lastName}!`);
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
    setSubmitting(false);
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
              The User Feature Access & Clearance Control Center is restricted to root system administrators. You are currently authenticated as an HR or Staff member.
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
        title="System Admin User Access Control & Feature Clearance"
        subtitle="Configure granular feature permissions per employee, delegate administrative privileges, and assign departmental presets."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC SYSTEM ADMIN ACCESS CONTROL HERO BANNER (INDIGO-VIOLET LIGHT THEME) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-blue-50/60 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Telemetry Header */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold border border-indigo-600/20 dark:border-indigo-500/30">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Super Administrator Clearance Active</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-600/20 dark:border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Granular RBAC & Feature Overrides</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              User Feature Access & Authorization Manager
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
              Assign specific module features to individual employees without changing their core role. Enable payroll calculation for accountants, candidate pipeline for recruiters, or leave approval for supervisors.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Users className="w-3.5 h-3.5" />
                <span>{employees.length} Registered Accounts</span>
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold bg-purple-100/60 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800/60">
                <Sliders className="w-3.5 h-3.5" />
                <span>{customCount} Users with Custom Overrides</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
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
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving Policy...' : 'Save Permissions'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Workforce</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {employees.length} <span className="text-base font-bold text-slate-400">Staff</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">100% Policy Mapped</span>
              <span className="text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-purple-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Custom Overrides</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {customCount} <span className="text-base font-bold text-slate-400">Users</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-purple-600 dark:text-purple-400 font-bold">Granular Grants</span>
              <span className="text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Master Admins</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {adminCount} <span className="text-base font-bold text-slate-400">Admins</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Root Clearance</span>
              <span className="text-slate-400">Superuser</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Module Policies</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              7 <span className="text-base font-bold text-slate-400">Modules</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">32 Distinct Features</span>
              <span className="text-slate-400">Governed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SPLIT-SCREEN MASTER-DETAIL WORKFORCE ACCESS INSPECTOR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: User Roster & Filter List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Employee Roster</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{filteredEmployees.length} Matches</span>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or EMP code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Department Filter & Preset Filter */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Clearances</option>
              <option value="CUSTOM">Custom Overrides Only</option>
              <option value="ADMIN">Master Admins</option>
              <option value="STANDARD">Standard Roles</option>
            </select>
          </div>

          {/* Employee List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === selectedUserId;
              const access = getUserFeatureAccess(emp.id, emp.role);
              const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();

              return (
                <div
                  key={emp.id}
                  onClick={() => selectUser(emp)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-600/60 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {emp.firstName} {emp.lastName}
                        </span>
                        {emp.role === 'ADMIN' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[9px] font-black uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {emp.profile?.designation?.title || emp.role} • {emp.profile?.department?.name || 'General'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {access.isCustom ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-black border border-purple-200 dark:border-purple-800">
                        Custom
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                        {emp.role}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-300'}`} />
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
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6">
              {/* Selected User Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-600/20">
                    {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </h3>
                      <span className="font-mono text-[10px] text-slate-400 font-bold bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {selectedEmployee.employeeCode || 'EMP-CODE'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {selectedEmployee.email} • {selectedEmployee.profile?.designation?.title || 'Staff Specialist'}
                    </div>
                  </div>
                </div>

                {/* Role Preset Quick Dropdown */}
                <div className="space-y-1 sm:text-right">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Permission Preset
                  </label>
                  <select
                    value={activePreset}
                    onChange={(e) => handleApplyPreset(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer shadow-xs"
                  >
                    <option value="SUPER_ADMIN">👑 Super Administrator</option>
                    <option value="HR_MANAGER">👔 HR Manager</option>
                    <option value="PAYROLL_SPECIALIST">💰 Payroll Specialist</option>
                    <option value="RECRUITER">🎯 Talent Recruiter</option>
                    <option value="TEAM_LEAD">👥 Team Supervisor</option>
                    <option value="STANDARD_EMPLOYEE">👤 Standard Employee</option>
                    <option value="CUSTOM">⚙️ Custom User Access</option>
                  </select>
                </div>
              </div>

              {/* Quick Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGrantAll}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Grant All Features
                  </button>
                  <button
                    onClick={handleRevokeAll}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Revoke Elevated Rights
                  </button>
                  <button
                    onClick={handleResetDefault}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Role Default</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('permissions')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'permissions'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Features Matrix
                  </button>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'audit'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
                        className="rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
                      >
                        {/* Module Header */}
                        <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs border border-slate-200/50 dark:border-slate-600">
                              {renderModuleIcon(module.icon)}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                {module.name}
                              </h4>
                              <p className="text-[11px] text-slate-400">{module.description}</p>
                            </div>
                          </div>

                          {/* Module Quick Toggle */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400">
                              {enabledCount} / {module.features.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleModule(module.id, !allEnabled)}
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                allEnabled
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              }`}
                            >
                              {allEnabled ? 'Disable All' : 'Enable All'}
                            </button>
                          </div>
                        </div>

                        {/* Individual Features Grid */}
                        <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
                          {module.features.map((feat) => {
                            const isAllowed = !!userPermissions[feat.key];

                            return (
                              <div
                                key={feat.key}
                                className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                              >
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {feat.label}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                    {feat.description}
                                  </div>
                                </div>

                                {/* Modern Switch Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeature(feat.key)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isAllowed ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
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
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Recent Authorization Modifications
                    </h4>
                    <span className="text-[11px] text-slate-400 font-semibold">{auditLogs.length} Events Logged</span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{log.action}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Authorized by: <span className="font-semibold text-slate-700 dark:text-slate-300">{log.performedBy}</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    {auditLogs.length === 0 && (
                      <div className="text-center py-10 text-xs text-slate-400">
                        No authorization changes recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Sticky Save CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400 font-medium">
                  {isCustom ? (
                    <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
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
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving Policy...' : 'Save & Enforce Policy'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-12 text-center shadow-soft border border-slate-100 dark:border-slate-800 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Select an Employee to Inspect Feature Access
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Choose any employee from the roster on the left to configure their custom feature access, module permissions, and role presets.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccessControl;
