import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { UserCheck, ShieldCheck, Clock, FileCheck, Search } from 'lucide-react';

const EmploymentStatus = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Alex Mercer', code: 'EMP-101', status: 'PERMANENT', department: 'Engineering', tenure: '2 years, 4 months' },
    { id: 2, name: 'Sarah Jenkins', code: 'EMP-102', status: 'PROBATION', department: 'Marketing', tenure: '2 months' },
    { id: 3, name: 'David Miller', code: 'EMP-103', status: 'CONTRACT', department: 'Finance', tenure: '6 months' },
    { id: 4, name: 'Emily Zhang', code: 'EMP-104', status: 'INTERN', department: 'Product & Design', tenure: '1 month' },
    { id: 5, name: 'Marcus Vance', code: 'EMP-105', status: 'PERMANENT', department: 'Engineering', tenure: '1 year, 8 months' },
  ]);

  const [search, setSearch] = useState('');

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Employment Status Management" subtitle="Track permanent, probation, contract, and internship tenures" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Permanent Workforce</span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">128</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">On Probation</span>
          <h3 className="text-2xl font-black text-amber-500 mt-2">14</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Contractual Staff</span>
          <h3 className="text-2xl font-black text-indigo-500 mt-2">8</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Active Interns</span>
          <h3 className="text-2xl font-black text-purple-500 mt-2">6</h3>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Tenure</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{emp.code}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{emp.department}</td>
                  <td className="py-3.5 px-4 text-slate-500">{emp.tenure}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      emp.status === 'PERMANENT' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' :
                      emp.status === 'PROBATION' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' :
                      'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Update Status</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmploymentStatus;
