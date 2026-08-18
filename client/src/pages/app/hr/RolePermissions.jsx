import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  Shield,
  Sliders,
  CheckCircle2,
  Lock,
  Users,
  Save,
  Check,
  Plus,
  Key,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

const MODULES = [
  { id: 'pim', name: 'Personnel & Employees (PIM)', desc: 'Employee dossier, onboarding, and directory' },
  { id: 'attendance', name: 'Attendance & Biometrics', desc: 'Biometric logs, clock-in overrides, and shifts' },
  { id: 'leaves', name: 'Leave Management', desc: 'Time-off requests, approvals, and quotas' },
  { id: 'payroll', name: 'Payroll & Compensation', desc: 'Salary batch calculation, payslips, and tax' },
  { id: 'recruitment', name: 'Recruitment & ATS', desc: 'Job requisitions, applicant pipelines, and interviews' },
  { id: 'reports', name: 'Executive Intelligence', desc: 'Audit exports, liability reports, and metrics' },
  { id: 'settings', name: 'System Administration', desc: 'Global settings, theme, and API security keys' },
];

const DEFAULT_PERMISSIONS = {
  SUPER_ADMIN: {
    pim: { view: true, create: true, edit: true, delete: true },
    attendance: { view: true, create: true, edit: true, delete: true },
    leaves: { view: true, create: true, edit: true, delete: true },
    payroll: { view: true, create: true, edit: true, delete: true },
    recruitment: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
  },
  HR_MANAGER: {
    pim: { view: true, create: true, edit: true, delete: false },
    attendance: { view: true, create: true, edit: true, delete: true },
    leaves: { view: true, create: true, edit: true, delete: true },
    payroll: { view: true, create: true, edit: true, delete: false },
    recruitment: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  DEPARTMENT_HEAD: {
    pim: { view: true, create: false, edit: false, delete: false },
    attendance: { view: true, create: true, edit: true, delete: false },
    leaves: { view: true, create: true, edit: true, delete: false },
    payroll: { view: false, create: false, edit: false, delete: false },
    recruitment: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  STAFF_EMPLOYEE: {
    pim: { view: true, create: false, edit: false, delete: false },
    attendance: { view: true, create: true, edit: false, delete: false },
    leaves: { view: true, create: true, edit: false, delete: false },
    payroll: { view: true, create: false, edit: false, delete: false },
    recruitment: { view: false, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
};

const RolePermissions = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('HR_MANAGER');
  const [toastMsg, setToastMsg] = useState('');

  const [permissions, setPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_role_permissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PERMISSIONS;
  });

  const togglePerm = (moduleId, action) => {
    const rolePerms = permissions[selectedRole] || {};
    const modPerms = rolePerms[moduleId] || { view: false, create: false, edit: false, delete: false };

    const updated = {
      ...permissions,
      [selectedRole]: {
        ...rolePerms,
        [moduleId]: {
          ...modPerms,
          [action]: !modPerms[action],
        },
      },
    };
    setPermissions(updated);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('nexahr_role_permissions', JSON.stringify(permissions));
    } catch (e) {
      console.error(e);
    }
    setToastMsg(`Security ACL permissions saved for role "${selectedRole}"!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Role-Based Access Control (RBAC) & Permissions Matrix"
        subtitle="Configure granular module authorizations, administrative capabilities, and data privacy ACLs."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC ROLE PERMISSIONS HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Security Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Role-Based Access Control & Permissions Matrix
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Configure granular module authorizations, administrative CRUD capabilities, PII data visibility policies, and audit access control lists.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Shield className="w-3.5 h-3.5" />
                <span>5 Predefined System Roles</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Lock className="w-3.5 h-3.5" />
                <span>7 Core Subsystems Protected</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Save className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Save Permissions</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Apply updates globally</div>
            </div>
            <button
              onClick={handleSave}
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Permissions</span>
            </button>
            <button
              onClick={() => navigate('/app/access-control')}
              className="w-full px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-indigo-200 dark:border-indigo-800"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Configure Per-User Access</span>
              <ArrowRight className="w-3 h-3" />
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
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total System Roles</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              5 <span className="text-base font-bold text-slate-400">Roles</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Standard Hierarchical</span>
              <span className="text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Protected Modules</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {MODULES.length} <span className="text-base font-bold text-slate-400">Units</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Full CRUD Coverage</span>
              <span className="text-slate-400">Secure</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Selected Target</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight truncate">
              {selectedRole.replace('_', ' ')}
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Scoped Profile</span>
              <span className="text-slate-400">RBAC</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">ACL Policy State</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              Enforced
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Zero-Trust Architecture</span>
              <span className="text-slate-400">Real-Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Picker Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Configuring Role:</span>
          {['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_LEAD', 'RECRUITER', 'EMPLOYEE'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRole === role
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Permissions</span>
        </button>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">System Module</th>
                <th className="py-4 px-4 text-center">View / Read</th>
                <th className="py-4 px-4 text-center">Create / Add</th>
                <th className="py-4 px-4 text-center">Edit / Update</th>
                <th className="py-4 px-6 text-center">Delete / Purge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MODULES.map((mod) => {
                const currentPerm = permissions[selectedRole]?.[mod.id] || {
                  view: selectedRole === 'SUPER_ADMIN',
                  create: selectedRole === 'SUPER_ADMIN',
                  edit: selectedRole === 'SUPER_ADMIN',
                  delete: selectedRole === 'SUPER_ADMIN',
                };

                return (
                  <tr key={mod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-slate-900 dark:text-white">{mod.name}</div>
                      <div className="text-[11px] text-slate-400">{mod.desc}</div>
                    </td>

                    {['view', 'create', 'edit', 'delete'].map((action) => (
                      <td key={action} className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={currentPerm[action] || false}
                          disabled={selectedRole === 'SUPER_ADMIN'}
                          onChange={() => togglePerm(mod.id, action)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
