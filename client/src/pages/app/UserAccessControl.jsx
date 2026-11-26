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
  AlertTriangle,
  Trash2,
  BadgeCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  FEATURE_MODULES,
  ROLE_PRESETS,
  getUserFeatureAccess,
  saveUserFeatureAccess,
  resetUserFeatureAccess,
  getUserPermissionCoverage,
  getEnabledFeaturesCount,
  getTotalFeaturesCount,
  getSecurityAuditLogs,
  addSecurityAuditLog,
  clearSecurityAuditLogs,
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
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  });

  const isAdmin = currentUser.role === 'ADMIN';

  // Data State
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter Toolbar State
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

  // Selected User State for Inspector
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userRole, setUserRole] = useState('EMPLOYEE');
  const [userActive, setUserActive] = useState(true);
  const [userPermissions, setUserPermissions] = useState({});
  const [activePreset, setActivePreset] = useState('CUSTOM');
  const [isCustom, setIsCustom] = useState(false);
  const [savedBaseline, setSavedBaseline] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('permissions'); // 'permissions' | 'audit'
  const [auditLogs, setAuditLogs] = useState([]);

  // Toast Helper
  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg({ text: '', type: 'success' }), 4000);
  };

  // Selected Employee computed entity
  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedUserId) || null;
  }, [employees, selectedUserId]);

  // Count active Admins to enforce root security guardrails
  const activeAdminCount = useMemo(() => {
    return employees.filter((e) => e.role === 'ADMIN' && e.isActive !== false).length;
  }, [employees]);

  // Track if current form has unsaved modifications
  const hasChanges = useMemo(() => {
    if (!savedBaseline) return false;
    if (userRole !== savedBaseline.role) return true;
    if (userActive !== savedBaseline.isActive) return true;
    if (activePreset !== savedBaseline.presetKey) return true;
    if (JSON.stringify(userPermissions) !== JSON.stringify(savedBaseline.permissions)) return true;
    return false;
  }, [savedBaseline, userRole, userActive, activePreset, userPermissions]);

  // Select User and compute their active feature map & baseline
  const selectUser = (emp) => {
    setSelectedUserId(emp.id);
    const empRole = emp.role || 'EMPLOYEE';
    const empActive = emp.isActive !== false;
    setUserRole(empRole);
    setUserActive(empActive);

    const access = getUserFeatureAccess(emp.id, empRole);
    setUserPermissions(access.permissions);
    setActivePreset(access.presetKey);
    setIsCustom(access.isCustom);

    setSavedBaseline({
      role: empRole,
      isActive: empActive,
      presetKey: access.presetKey,
      permissions: { ...access.permissions },
    });
  };

  // Load live employees and departments
  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.allSettled([
        api.getEmployees({ limit: 200 }),
        api.getDepartments(),
      ]);

      let loadedEmps = [];
      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        loadedEmps = empRes.value.data.employees;
        setEmployees(loadedEmps);
        if (loadedEmps.length > 0) {
          // Keep currently selected user if present, or select first
          const currentMatch = selectedUserId ? loadedEmps.find((e) => e.id === selectedUserId) : null;
          selectUser(currentMatch || loadedEmps[0]);
        }
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
        setDepartments(deptRes.value.data.departments);
      }

      // Load audit logs
      setAuditLogs(getSecurityAuditLogs());
    } catch (err) {
      console.error('Failed to load access control data:', err);
      showToast('Could not load workforce roster.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to live authorization updates across application
    const handleSync = () => {
      setAuditLogs(getSecurityAuditLogs());
    };
    window.addEventListener('nexahr_access_control_updated', handleSync);
    window.addEventListener('nexahr_user_access_updated', handleSync);
    return () => {
      window.removeEventListener('nexahr_access_control_updated', handleSync);
      window.removeEventListener('nexahr_user_access_updated', handleSync);
    };
  }, []);

  // Handle System Role selection with safety guardrails
  const handleRoleChange = (newRole) => {
    if (!selectedEmployee) return;

    if (selectedEmployee.id === currentUser.id) {
      showToast('You cannot modify your own system role for security compliance.', 'error');
      return;
    }

    if (selectedEmployee.role === 'ADMIN' && activeAdminCount <= 1 && newRole !== 'ADMIN') {
      showToast('Safety Guard: The last active Administrator cannot be demoted.', 'error');
      return;
    }

    setUserRole(newRole);

    // If promoting to ADMIN and standard employee preset, suggest SUPER_ADMIN
    if (newRole === 'ADMIN' && activePreset === 'STANDARD_EMPLOYEE') {
      handleApplyPreset('SUPER_ADMIN');
    } else if (newRole === 'HR_MANAGER' && activePreset === 'STANDARD_EMPLOYEE') {
      handleApplyPreset('HR_MANAGER');
    }
  };

  // Handle Account Status toggle with safety guardrails
  const handleToggleActiveStatus = () => {
    if (!selectedEmployee) return;

    if (selectedEmployee.id === currentUser.id) {
      showToast('You cannot deactivate your own account.', 'error');
      return;
    }

    if (selectedEmployee.role === 'ADMIN' && activeAdminCount <= 1 && userActive) {
      showToast('Safety Guard: The last active Administrator cannot be deactivated.', 'error');
      return;
    }

    setUserActive((prev) => !prev);
  };

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

  // Apply Role Preset Template
  const handleApplyPreset = (presetKey) => {
    const preset = ROLE_PRESETS[presetKey];
    if (!preset) return;

    setUserPermissions({ ...preset.permissions });
    setActivePreset(presetKey);
    setIsCustom(presetKey !== 'SUPER_ADMIN' && presetKey !== 'STANDARD_EMPLOYEE' && presetKey !== 'CUSTOM');
    showToast(`Applied template: ${preset.label}`);
  };

  // Grant All Features across every module
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
    showToast('Granted unrestricted access across all 31 system features.');
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
    showToast('Revoked all elevated rights. Standard self-service directory remains.');
  };

  // Reset to Role Default
  const handleResetDefault = () => {
    if (!selectedEmployee) return;
    const callerName = currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Root Administrator';
    const fresh = resetUserFeatureAccess(selectedEmployee.id, userRole, callerName);
    setUserPermissions(fresh.permissions);
    setActivePreset(fresh.presetKey);
    setIsCustom(false);
    showToast(`Reset permissions to ${userRole} system default.`);
  };

  // Discard Unsaved Changes
  const handleDiscardChanges = () => {
    if (!savedBaseline) return;
    setUserRole(savedBaseline.role);
    setUserActive(savedBaseline.isActive);
    setUserPermissions({ ...savedBaseline.permissions });
    setActivePreset(savedBaseline.presetKey);
    showToast('Discarded unsaved policy changes.');
  };

  // Clear Audit Trail
  const handleClearAuditHistory = () => {
    clearSecurityAuditLogs();
    setAuditLogs([]);
    showToast('Security audit trail history cleared.');
  };

  // Save changes to persistent storage and database
  const handleSave = async () => {
    if (!selectedEmployee) return;

    setSubmitting(true);
    try {
      const callerName = currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Root Administrator';
      let roleOrStatusChanged = false;

      // 1. Update Database Role & Active Status if changed
      if (userRole !== selectedEmployee.role || userActive !== selectedEmployee.isActive) {
        await api.updateEmployee(selectedEmployee.id, {
          role: userRole,
          isActive: userActive,
        });

        // Add audit logs for role and status change
        if (userRole !== selectedEmployee.role) {
          addSecurityAuditLog({
            userId: selectedEmployee.id,
            targetName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
            action: `Role modified from ${selectedEmployee.role} to ${userRole}`,
            performedBy: callerName,
          });
        }
        if (userActive !== selectedEmployee.isActive) {
          addSecurityAuditLog({
            userId: selectedEmployee.id,
            targetName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
            action: `Account status updated to ${userActive ? 'Active' : 'Suspended'}`,
            performedBy: callerName,
          });
        }

        // Update local state list
        setEmployees((prev) =>
          prev.map((e) => (e.id === selectedEmployee.id ? { ...e, role: userRole, isActive: userActive } : e))
        );
        roleOrStatusChanged = true;
      }

      // 2. Save feature permissions & preset
      const success = saveUserFeatureAccess(
        selectedEmployee.id,
        userPermissions,
        activePreset,
        callerName
      );

      if (success) {
        setIsCustom(activePreset !== 'SUPER_ADMIN' && activePreset !== 'STANDARD_EMPLOYEE');
        setSavedBaseline({
          role: userRole,
          isActive: userActive,
          presetKey: activePreset,
          permissions: { ...userPermissions },
        });

        // Refresh audit logs
        setAuditLogs(getSecurityAuditLogs());

        showToast(
          `Security clearance & permissions enforced for ${selectedEmployee.firstName} ${selectedEmployee.lastName}!`,
          'success'
        );
      } else {
        showToast('Could not save user feature access.', 'error');
      }
    } catch (err) {
      if (err.name === 'DemoModeError' || err.code === 'DEMO_MODE') {
        showToast('Demo Mode: Live policy simulation retained in session.', 'success');
        return;
      }
      showToast(err.message || 'Failed to update employee clearance in database.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery.toLowerCase()) ||
        (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.employeeCode && emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        selectedDept === 'ALL' ||
        emp.profile?.department?.name === selectedDept ||
        emp.profile?.departmentId === selectedDept;

      const access = getUserFeatureAccess(emp.id, emp.role);
      let matchesFilter = true;
      if (filterType === 'CUSTOM') matchesFilter = access.isCustom;
      else if (filterType === 'ADMIN') matchesFilter = emp.role === 'ADMIN' || access.presetKey === 'SUPER_ADMIN';
      else if (filterType === 'STANDARD') matchesFilter = emp.role === 'EMPLOYEE' && !access.isCustom;

      return matchesSearch && matchesDept && matchesFilter;
    });
  }, [employees, searchQuery, selectedDept, filterType]);

  // Calculate Real-Time Dynamic Metrics
  const customCount = useMemo(() => {
    return employees.filter((e) => getUserFeatureAccess(e.id, e.role).isCustom).length;
  }, [employees]);

  const adminCount = useMemo(() => {
    return employees.filter((e) => e.role === 'ADMIN').length;
  }, [employees]);

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
    CUSTOM: customCount,
    STANDARD: employees.filter((e) => e.role === 'EMPLOYEE' && !getUserFeatureAccess(e.id, e.role).isCustom).length,
  }), [employees, customCount]);

  // Dynamic Sparkline Data for Access Control
  const workforceSparkData = useMemo(() => {
    const total = employees.length;
    return [
      { value: Math.max(0, total - 4), label: 'Mon' },
      { value: Math.max(0, total - 3), label: 'Tue' },
      { value: Math.max(0, total - 2), label: 'Wed' },
      { value: Math.max(0, total - 2), label: 'Thu' },
      { value: Math.max(0, total - 1), label: 'Fri' },
      { value: total, label: 'Today' },
    ];
  }, [employees.length]);

  const customSparkData = useMemo(() => {
    return [
      { value: Math.max(0, customCount - 2), label: 'Q1' },
      { value: Math.max(0, customCount - 1), label: 'Q2' },
      { value: Math.max(0, customCount - 1), label: 'Q3' },
      { value: customCount, label: 'Current' },
    ];
  }, [customCount]);

  const adminSparkData = useMemo(() => {
    return [
      { value: Math.max(1, adminCount - 1), label: 'Primary' },
      { value: Math.max(1, adminCount - 1), label: 'Secondary' },
      { value: adminCount, label: 'Active' },
    ];
  }, [adminCount]);

  const totalFeaturesCount = useMemo(() => getTotalFeaturesCount(), []);

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
            <span className="px-3 py-1 rounded-[12px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] border border-rose-200 dark:border-rose-900">
              Clearance Level Restricted
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              System Administrator Access Only
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The User Feature Access & Clearance Control Center is restricted strictly to root System Administrators. Standard users and staff members do not have permission to modify system security clearance or role access.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="w-full py-3 rounded-[12px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-md cursor-pointer transition-all hover:scale-105"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 pb-10">
      <AppPageHeader
        title="User Access Control & Security"
        subtitle="Configure granular feature permissions per employee, delegate administrative privileges, and assign departmental presets."
      />

      {/* Floating Toast Notification */}
      {toastMsg.text && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.15)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              toastMsg.type === 'error'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
            }`}
          >
            {toastMsg.type === 'error' ? (
              <AlertCircle className="w-4.5 h-4.5 stroke-[2.2]" />
            ) : (
              <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
            )}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg.text}
          </p>
          <button
            onClick={() => setToastMsg({ text: '', type: 'success' })}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC SYSTEM ADMIN ACCESS CONTROL HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-6 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Telemetry Header */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
              <span>Live Policy Engine Active</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
              User Feature Access & Authorization Manager
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-2xl font-medium">
              Assign specific module capabilities to individual staff without changing their core role. Enable payroll calculation for accountants, candidate pipeline for recruiters, or attendance overrides for department supervisors.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{employees.length} Registered Accounts</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{customCount} Users with Custom Overrides</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{FEATURE_MODULES.length} Security Modules ({totalFeaturesCount} Features)</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Active Inspector</div>
              <div className="text-[11px] text-white/90 font-medium mt-0.5 truncate max-w-[190px]">
                {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Select an employee'}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={submitting || !selectedEmployee}
              className="w-full px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 disabled:opacity-50 text-slate-900 font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Enforcing Policy...' : 'Save & Enforce Policy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC SPARKLINES TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <SparkMetricCard
          variant="light"
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
                    Directory & clearance management
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-[12px] text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 shadow-2xs">
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

                {/* Filter Dropdown Menu */}
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
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-sky-100/90 dark:border-slate-700 shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto no-scrollbar">
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
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
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
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
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
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
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
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[12px] text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all cursor-pointer"
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
            <div className="space-y-2 max-h-[640px] overflow-y-auto no-scrollbar">
              {filteredEmployees.map((emp) => {
                const isSelected = emp.id === selectedUserId;
                const coverage = getUserPermissionCoverage(emp.id, emp.role);
                const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
                const avatarUrl = getAvatarUrl(emp);
                const isUserActive = emp.isActive !== false;

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
                      <div className="relative shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={emp.firstName}
                            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-sky-200/70 dark:ring-sky-900 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-sky-500/20 ring-2 ring-sky-200/70 dark:ring-sky-900">
                            {initials}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            isUserActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          title={isUserActive ? 'Active Staff Account' : 'Suspended Account'}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {emp.firstName} {emp.lastName}
                          </span>
                          {emp.role === 'ADMIN' && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase border border-rose-200/80 dark:border-rose-900/60">
                              Admin
                            </span>
                          )}
                          {emp.role === 'HR_MANAGER' && (
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase border border-indigo-200/80 dark:border-indigo-900/60">
                              HR Mgr
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                          {emp.profile?.designation?.title || emp.role} • {emp.profile?.department?.name || 'General'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5">
                        {coverage.isCustom ? (
                          <span className="px-2 py-0.5 rounded-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[9.5px] font-bold border border-sky-200/80 dark:border-sky-800/80">
                            Custom
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9.5px] font-semibold border border-slate-200/60 dark:border-slate-700/60">
                            {emp.role}
                          </span>
                        )}
                        <span className="text-[10px] font-sans tabular-nums font-bold text-slate-400">
                          {coverage.enabled}/{coverage.total}
                        </span>
                      </div>
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
                {/* 1. Selected User Header Card & Identification */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-sky-50/40 dark:from-sky-950/40 dark:via-slate-800/80 dark:to-sky-900/20 border border-sky-200/70 dark:border-sky-900/50 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        {getAvatarUrl(selectedEmployee) ? (
                          <img
                            src={getAvatarUrl(selectedEmployee)}
                            alt={selectedEmployee.firstName}
                            className="w-14 h-14 rounded-2xl object-cover ring-4 ring-sky-100 dark:ring-sky-950/60 shadow-md shadow-sky-500/20"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50">
                            {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            userActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                            {selectedEmployee.firstName} {selectedEmployee.lastName}
                          </h3>
                          <span className="font-sans tabular-nums text-[11px] text-sky-700 dark:text-sky-300 font-bold bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-[12px] border border-sky-200/80 dark:border-sky-800/80 shadow-2xs">
                            {selectedEmployee.employeeCode || 'EMP-CODE'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                          {selectedEmployee.email} • {selectedEmployee.profile?.designation?.title || 'Staff Specialist'}
                        </div>
                      </div>
                    </div>

                    {/* Permission Preset Quick Dropdown */}
                    <div className="space-y-1 sm:text-right shrink-0">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Permission Preset
                      </label>
                      <select
                        value={activePreset}
                        onChange={(e) => handleApplyPreset(e.target.value)}
                        className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-sky-800/80 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer shadow-2xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      >
                        <option value="SUPER_ADMIN">Super Administrator (Full)</option>
                        <option value="HR_MANAGER">HR Lead / Manager</option>
                        <option value="PAYROLL_SPECIALIST">Payroll Specialist</option>
                        <option value="RECRUITER">Talent Recruiter (ATS)</option>
                        <option value="TEAM_LEAD">Team Supervisor / Lead</option>
                        <option value="STANDARD_EMPLOYEE">Standard Staff Member</option>
                        <option value="CUSTOM">Custom User Access</option>
                      </select>
                    </div>
                  </div>

                  {/* 2. DYNAMIC SYSTEM ROLE & ACCOUNT STATUS CONTROLS */}
                  <div className="pt-3 border-t border-sky-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* System Role Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        System Clearance Role:
                      </span>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-sky-100 dark:border-slate-800 shadow-2xs">
                        {[
                          { roleKey: 'ADMIN', label: 'Admin', color: 'text-rose-600 dark:text-rose-400' },
                          { roleKey: 'HR_MANAGER', label: 'HR Manager', color: 'text-indigo-600 dark:text-indigo-400' },
                          { roleKey: 'EMPLOYEE', label: 'Employee', color: 'text-slate-700 dark:text-slate-300' },
                        ].map(({ roleKey, label, color }) => {
                          const isActive = userRole === roleKey;
                          const isSelf = selectedEmployee.id === currentUser.id && roleKey !== selectedEmployee.role;
                          const isDemotingLastAdmin =
                            selectedEmployee.role === 'ADMIN' &&
                            activeAdminCount <= 1 &&
                            roleKey !== 'ADMIN';

                          const disabled = isSelf || isDemotingLastAdmin;

                          return (
                            <button
                              key={roleKey}
                              type="button"
                              disabled={disabled}
                              onClick={() => handleRoleChange(roleKey)}
                              title={
                                isSelf
                                  ? 'You cannot modify your own role'
                                  : isDemotingLastAdmin
                                  ? 'Protected root administrator'
                                  : `Set system role to ${label}`
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                isActive
                                  ? 'bg-sky-500 text-white shadow-2xs'
                                  : `${color} hover:bg-slate-100 dark:hover:bg-slate-800`
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Account Status Switch */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Account Status:
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleActiveStatus}
                        disabled={
                          selectedEmployee.id === currentUser.id ||
                          (selectedEmployee.role === 'ADMIN' && activeAdminCount <= 1 && userActive)
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-[11px] border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          userActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {userActive ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Active Account</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 stroke-[2.5]" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Unsaved Changes Banner */}
                {hasChanges && (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-semibold animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        Unsaved modifications pending for {selectedEmployee.firstName} {selectedEmployee.lastName}.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDiscardChanges}
                        className="text-xs text-amber-700 dark:text-amber-300 hover:underline font-bold px-2 py-1 cursor-pointer"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={submitting}
                        className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                      >
                        {submitting ? 'Saving...' : 'Save Now'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleGrantAll}
                      className="px-3.5 py-2 rounded-[12px] bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      Grant All Features
                    </button>
                    <button
                      onClick={handleRevokeAll}
                      className="px-3.5 py-2 rounded-[12px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      Revoke Elevated Rights
                    </button>
                    <button
                      onClick={handleResetDefault}
                      className="px-3.5 py-2 rounded-[12px] bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Role Default</span>
                    </button>
                  </div>

                  {/* Tabs Switcher Pill */}
                  <div className="flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/90 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                    <button
                      onClick={() => setActiveTab('permissions')}
                      className={`px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'permissions'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Features Matrix ({getEnabledFeaturesCount(userPermissions)}/{totalFeaturesCount})
                    </button>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className={`px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'audit'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Audit Trail ({auditLogs.length})
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
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  {module.description}
                                </p>
                              </div>
                            </div>

                            {/* Module Quick Toggle */}
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-[12px] text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
                                {enabledCount} / {module.features.length}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleModule(module.id, !allEnabled)}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-[12px] transition-all cursor-pointer ${
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

                                  {/* Interactive Switch Toggle */}
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
                        Recent Authorization & Clearance Modifications
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-[12px] text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
                          {auditLogs.length} Events Logged
                        </span>
                        {auditLogs.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAuditHistory}
                            className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 no-scrollbar">
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
                              Target:{' '}
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {log.targetName || log.userId}
                              </span>{' '}
                              • Authorized by:{' '}
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {log.performedBy}
                              </span>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans tabular-nums bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200/70 dark:border-slate-800">
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
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    {hasChanges ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Unsaved policy changes pending enforcement</span>
                      </span>
                    ) : isCustom ? (
                      <span className="text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Custom user policy override active ({getEnabledFeaturesCount(userPermissions)}/{totalFeaturesCount} features)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Using default {userRole} role policy</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {hasChanges && (
                      <button
                        type="button"
                        onClick={handleDiscardChanges}
                        className="px-4 py-2.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        Discard
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{submitting ? 'Enforcing Policy...' : 'Save & Enforce Policy'}</span>
                    </button>
                  </div>
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
                  Choose any staff member from the roster on the left to configure their custom feature access, module permissions, core role, and presets.
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
