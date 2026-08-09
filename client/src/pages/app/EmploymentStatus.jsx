import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  MapPin,
  Shield,
  Briefcase,
  AlertTriangle,
  X,
  Edit2,
  UserCheck,
} from 'lucide-react';

const INITIAL_STATUS_DATA = [
  { id: 'EMP-101', name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', department: 'Engineering', employmentType: 'FULL_TIME', location: 'San Francisco HQ', shift: 'General (09:00 - 17:30)', status: 'ACTIVE', joinDate: 'Mar 15, 2022' },
  { id: 'EMP-102', name: 'Sarah Jenkins', role: 'Lead Product Designer', department: 'Product & Design', employmentType: 'REMOTE', location: 'Seattle, WA', shift: 'Flexible Remote', status: 'ACTIVE', joinDate: 'Jun 10, 2023' },
  { id: 'EMP-103', name: 'David Miller', role: 'Staff Backend Architect', department: 'Engineering', employmentType: 'FULL_TIME', location: 'San Francisco HQ', shift: 'General (09:00 - 17:30)', status: 'ACTIVE', joinDate: 'Jan 05, 2021' },
  { id: 'EMP-104', name: 'Marcus Vance', role: 'Senior DevOps & Security Lead', department: 'Engineering', employmentType: 'FULL_TIME', location: 'New York Hub', shift: 'Night Shift / Escalations', status: 'ACTIVE', joinDate: 'Nov 20, 2022' },
  { id: 'EMP-105', name: 'Emily Zhang', role: 'VP of Product Management', department: 'Product & Design', employmentType: 'FULL_TIME', location: 'San Francisco HQ', shift: 'General (09:00 - 17:30)', status: 'ON_LEAVE', joinDate: 'Feb 01, 2020' },
  { id: 'EMP-106', name: 'Lucas Morales', role: 'Global Payroll Specialist', department: 'Finance', employmentType: 'CONTRACT', location: 'Austin, TX', shift: 'General (09:00 - 17:30)', status: 'ACTIVE', joinDate: 'Apr 12, 2024' },
  { id: 'EMP-107', name: 'Chloe Bennett', role: 'People Operations Partner', department: 'People Ops', employmentType: 'PROBATION', location: 'San Francisco HQ', shift: 'General (09:00 - 17:30)', status: 'PROBATION', joinDate: 'Jul 01, 2026' },
];

const EmploymentStatus = () => {
  const [employees, setEmployees] = useState(INITIAL_STATUS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setEmployees(employees.map((emp) => (emp.id === selectedEmp.id ? selectedEmp : emp)));
    setSelectedEmp(null);
    setToastMsg(`Status updated for ${selectedEmp.name}!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || emp.employmentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: employees.length,
    fullTime: employees.filter((e) => e.employmentType === 'FULL_TIME').length,
    remote: employees.filter((e) => e.employmentType === 'REMOTE').length,
    probation: employees.filter((e) => e.employmentType === 'PROBATION' || e.employmentType === 'CONTRACT').length,
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
      {/* 1. STATS METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Headcount</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total} Staff</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Full-Time Staff</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.fullTime} Permanent</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Remote Contracts</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.remote} Remote</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Contract / Probation</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.probation} In Review</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOOLBAR & TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by employee name, role, ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'FULL_TIME', 'REMOTE', 'CONTRACT', 'PROBATION'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === type
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All' : type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Employment Classification</th>
                <th className="py-3.5 px-4">Assigned Shift</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.id} • Joined {emp.joinDate}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{emp.role}</div>
                    <div className="text-[10px] text-slate-400">{emp.department}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                        emp.employmentType === 'FULL_TIME'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : emp.employmentType === 'REMOTE'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {emp.employmentType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    {emp.shift}
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">{emp.location}</td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setSelectedEmp(emp)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit Employment Status"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: UPDATE STATUS */}
      {/* ========================================================================= */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{selectedEmp.id}</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  Update {selectedEmp.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Employment Classification *
                </label>
                <select
                  value={selectedEmp.employmentType}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, employmentType: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="General (09:00 - 17:30)">General Shift (09:00 AM - 05:30 PM)</option>
                  <option value="Flexible Remote">Flexible Remote (Asynchronous)</option>
                  <option value="Morning Shift (07:00 - 15:30)">Morning Shift (07:00 AM - 03:30 PM)</option>
                  <option value="Night Shift / Escalations">Night Escalations (16:00 - 00:30)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Office Location *
                </label>
                <input
                  type="text"
                  required
                  value={selectedEmp.location}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEmp(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentStatus;
