import React, { useState } from 'react';
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

const RolePermissions = () => {
  const [selectedRole, setSelectedRole] = useState('HR_MANAGER');
  const [toastMsg, setToastMsg] = useState('');

  const [permissions, setPermissions] = useState({
    HR_MANAGER: {
      pim: { view: true, create: true, edit: true, delete: false },
      attendance: { view: true, create: true, edit: true, delete: true },
      leaves: { view: true, create: true, edit: true, delete: true },
      payroll: { view: true, create: true, edit: true, delete: false },
      recruitment: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
    },
  });

  const togglePerm = (moduleId, action) => {
    const rolePerms = permissions[selectedRole] || {};
    const modPerms = rolePerms[moduleId] || { view: false, create: false, edit: false, delete: false };

    setPermissions({
      ...permissions,
      [selectedRole]: {
        ...rolePerms,
        [moduleId]: {
          ...modPerms,
          [action]: !modPerms[action],
        },
      },
    });
  };

  const handleSave = () => {
    setToastMsg(`Permissions updated for role ${selectedRole}!`);
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
