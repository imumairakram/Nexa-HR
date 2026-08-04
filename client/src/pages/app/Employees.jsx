import React, { useState } from 'react';
import { Search, UserPlus, Filter, Mail, Phone, Building2, MoreVertical } from 'lucide-react';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sampleEmployees = [
    {
      id: '1',
      name: 'Sarah Connor',
      role: 'COMPANY_ADMIN',
      email: 'sarah.connor@acme.com',
      phone: '+1 987 654 3210',
      department: 'Engineering',
      designation: 'VP of Software',
      employeeCode: 'EMP-001',
      status: 'ACTIVE',
      avatarBg: 'bg-emerald-500',
    },
    {
      id: '2',
      name: 'John Doe',
      role: 'HR_MANAGER',
      email: 'john.doe@acme.com',
      phone: '+1 800 555 0199',
      department: 'Human Resources',
      designation: 'HR Lead Manager',
      employeeCode: 'EMP-002',
      status: 'ACTIVE',
      avatarBg: 'bg-indigo-500',
    },
    {
      id: '3',
      name: 'Alex Mercer',
      role: 'EMPLOYEE',
      email: 'alex.mercer@acme.com',
      phone: '+1 415 888 2341',
      department: 'Engineering',
      designation: 'Senior Full-Stack Engineer',
      employeeCode: 'EMP-003',
      status: 'ACTIVE',
      avatarBg: 'bg-orange-500',
    },
    {
      id: '4',
      name: 'Emily Watson',
      role: 'EMPLOYEE',
      email: 'emily.w@acme.com',
      phone: '+1 212 999 4321',
      department: 'Product & Design',
      designation: 'Lead UI/UX Designer',
      employeeCode: 'EMP-004',
      status: 'ACTIVE',
      avatarBg: 'bg-purple-500',
    },
  ];

  const filtered = sampleEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Onboard Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory (PIM)</h2>
          <p className="text-xs text-slate-500">Manage multi-tenant company profiles, roles, and designations</p>
        </div>

        <button className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Employee</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-3xl shadow-soft border border-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, employee code, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter Department</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((emp) => (
          <div key={emp.id} className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 flex flex-col justify-between hover:shadow-soft-hover transition-all">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${emp.avatarBg} text-white font-bold flex items-center justify-center text-base shadow-sm`}>
                    {emp.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{emp.name}</h3>
                    <span className="text-[10px] font-semibold text-slate-500">{emp.employeeCode}</span>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-6">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                  {emp.designation}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.department}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pastelGreen-light text-pastelGreen-dark">
                {emp.role}
              </span>

              <button className="text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                View Profile →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employees;
