import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { ShieldCheck, Lock, Check, Plus, Edit2, Trash2 } from 'lucide-react';

const RolePermissions = () => {
  const [roles, setRoles] = useState([
    { id: 1, name: 'System Administrator', usersCount: 3, description: 'Full access to system controls, security, and global configuration' },
    { id: 2, name: 'HR Manager', usersCount: 8, description: 'Manage employee records, payroll, leave requests, and recruitment' },
    { id: 3, name: 'Department Head', usersCount: 14, description: 'Approve team leaves, view department analytics, manage shifts' },
    { id: 4, name: 'Staff Employee', usersCount: 142, description: 'View personal dashboard, attendance punch, submit leave requests' },
  ]);

  const [permissions, setPermissions] = useState({
    'Employees Management': { ADMIN: true, HR_MANAGER: true, DEPT_HEAD: false, STAFF: false },
    'Payroll & Payslips': { ADMIN: true, HR_MANAGER: true, DEPT_HEAD: false, STAFF: false },
    'Attendance Logs': { ADMIN: true, HR_MANAGER: true, DEPT_HEAD: true, STAFF: false },
    'Approve Leaves': { ADMIN: true, HR_MANAGER: true, DEPT_HEAD: true, STAFF: false },
    'Recruitment & ATS': { ADMIN: true, HR_MANAGER: true, DEPT_HEAD: false, STAFF: false },
    'System Settings': { ADMIN: true, HR_MANAGER: false, DEPT_HEAD: false, STAFF: false },
  });

  const togglePermission = (module, roleKey) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [roleKey]: !prev[module][roleKey],
      },
    }));
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Role & Permissions" subtitle="Manage access control matrix and user privileges" />

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => (
          <div key={r.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                  {r.usersCount} Users
                </span>
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{r.name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{r.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Configured</span>
              <button className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Edit Role</button>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Module Access Matrix</h3>
            <p className="text-xs text-slate-400">Toggle capabilities for each system role</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Create New Role</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-3 px-4">System Module</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">HR Manager</th>
                <th className="py-3 px-4 text-center">Dept Head</th>
                <th className="py-3 px-4 text-center">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200">
              {Object.keys(permissions).map((module) => (
                <tr key={module} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{module}</td>
                  {['ADMIN', 'HR_MANAGER', 'DEPT_HEAD', 'STAFF'].map((roleKey) => {
                    const isChecked = permissions[module][roleKey];
                    return (
                      <td key={roleKey} className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(module, roleKey)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
