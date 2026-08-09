import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Filter,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  Briefcase,
  Grid,
  List,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Eye,
  CheckCircle2,
  Users,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const INITIAL_EMPLOYEES = [
  {
    id: 'EMP-101',
    employeeCode: 'EMP-101',
    firstName: 'Alex',
    lastName: 'Mercer',
    email: 'employee@company.com',
    phone: '+1 (555) 438-9201',
    role: 'EMPLOYEE',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    profile: {
      department: { name: 'Engineering & DevOps', code: 'ENG' },
      designation: { title: 'Senior Full-Stack Engineer' },
      joiningDate: '2022-03-15',
      location: 'San Francisco HQ (Floor 4)',
      salary: '$135,000 / yr',
    },
  },
  {
    id: 'EMP-102',
    employeeCode: 'EMP-102',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 392-1084',
    role: 'EMPLOYEE',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    profile: {
      department: { name: 'Product & Design', code: 'DES' },
      designation: { title: 'Lead Product Designer' },
      joiningDate: '2023-06-10',
      location: 'Remote (Seattle, WA)',
      salary: '$128,000 / yr',
    },
  },
  {
    id: 'EMP-103',
    employeeCode: 'EMP-103',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.m@company.com',
    phone: '+1 (555) 819-3329',
    role: 'EMPLOYEE',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    profile: {
      department: { name: 'Engineering & DevOps', code: 'ENG' },
      designation: { title: 'Staff Backend Architect' },
      joiningDate: '2021-01-05',
      location: 'San Francisco HQ (Floor 4)',
      salary: '$150,000 / yr',
    },
  },
  {
    id: 'EMP-104',
    employeeCode: 'EMP-104',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.v@company.com',
    phone: '+1 (555) 774-2918',
    role: 'EMPLOYEE',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    profile: {
      department: { name: 'Engineering & DevOps', code: 'ENG' },
      designation: { title: 'Senior DevOps & Security Lead' },
      joiningDate: '2022-11-20',
      location: 'New York Hub (Floor 2)',
      salary: '$140,000 / yr',
    },
  },
  {
    id: 'EMP-105',
    employeeCode: 'EMP-105',
    firstName: 'Emily',
    lastName: 'Zhang',
    email: 'emily.z@company.com',
    phone: '+1 (555) 629-9183',
    role: 'HR_MANAGER',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    profile: {
      department: { name: 'Product & Design', code: 'DES' },
      designation: { title: 'VP of Product Management' },
      joiningDate: '2020-02-01',
      location: 'San Francisco HQ (Floor 5)',
      salary: '$165,000 / yr',
    },
  },
  {
    id: 'EMP-106',
    employeeCode: 'EMP-106',
    firstName: 'Chloe',
    lastName: 'Bennett',
    email: 'chloe.b@company.com',
    phone: '+1 (555) 902-3481',
    role: 'HR_MANAGER',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    profile: {
      department: { name: 'People Operations & HR', code: 'HR' },
      designation: { title: 'Senior People Operations Partner' },
      joiningDate: '2023-08-15',
      location: 'San Francisco HQ (Floor 3)',
      salary: '$110,000 / yr',
    },
  },
];

const Employees = () => {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Onboarding Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeCode: '',
    phone: '',
    role: 'EMPLOYEE',
    department: 'Engineering & DevOps',
    designation: 'Software Engineer',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) return;

    const newEmp = {
      id: formData.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      employeeCode: formData.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || '+1 (555) 000-0000',
      role: formData.role,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      profile: {
        department: { name: formData.department, code: 'ENG' },
        designation: { title: formData.designation },
        joiningDate: formData.joiningDate,
        location: 'San Francisco HQ',
        salary: '$115,000 / yr',
      },
    };

    setEmployees([newEmp, ...employees]);
    setIsOnboardOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeCode: '',
      phone: '',
      role: 'EMPLOYEE',
      department: 'Engineering & DevOps',
      designation: 'Software Engineer',
      joiningDate: new Date().toISOString().split('T')[0],
    });
    setToastMsg(`Employee ${newEmp.firstName} ${newEmp.lastName} onboarded successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.profile?.designation?.title && emp.profile.designation.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || (emp.profile?.department?.name && emp.profile.department.name.includes(selectedDept));
    return matchesSearch && matchesDept;
  });

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.isActive).length,
    engineering: employees.filter((e) => e.profile?.department?.name?.includes('Engineering')).length,
    admins: employees.filter((e) => e.role === 'ADMIN' || e.role === 'HR_MANAGER').length,
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Personnel Information Management (PIM)"
        subtitle="Manage employee records, onboard new talent, review designations, and oversee organization structure."
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STATS OVERVIEW CARDS */}
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
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Staff</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.active} Verified</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Engineering Unit</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.engineering} Engineers</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">HR & Leadership</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.admins} Leads</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employees by name, code, designation, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsOnboardOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Employee</span>
            </button>
          </div>
        </div>

        {/* Department Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Dept:</span>
          {['ALL', 'Engineering', 'Product & Design', 'People Operations', 'Finance'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EMPLOYEES GRID / TABLE */}
      {/* ========================================================================= */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.firstName}
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 shadow-sm"
                    />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {emp.firstName} {emp.lastName}
                      </h4>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        {emp.profile?.designation?.title || 'Staff Member'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">{emp.employeeCode}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      emp.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : emp.role === 'HR_MANAGER'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {emp.role}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{emp.profile?.department?.name || 'General Dept'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{emp.profile?.location || 'San Francisco HQ'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{emp.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  Joined {emp.profile?.joiningDate || '2023'}
                </span>

                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Dossier</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-4">Department & Designation</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role ACL</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.firstName}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{emp.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {emp.profile?.designation?.title || 'Staff'}
                      </div>
                      <div className="text-[10px] text-slate-400">{emp.profile?.department?.name}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">
                      <div>{emp.email}</div>
                      <div className="text-[10px] text-slate-400">{emp.phone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-500">{emp.profile?.location || 'HQ'}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ONBOARD EMPLOYEE */}
      {/* ========================================================================= */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Onboard New Team Member</h3>
              </div>
              <button
                onClick={() => setIsOnboardOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hayes"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan.h@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP-108"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Engineering & DevOps">Engineering & DevOps</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="People Operations & HR">People Operations & HR</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Designation Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: EMPLOYEE DOSSIER */}
      {/* ========================================================================= */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.firstName}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500/20"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {selectedEmployee.profile?.designation?.title}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedEmployee.employeeCode}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Department</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedEmployee.profile?.department?.name}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Role Authorization</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedEmployee.role}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Contact Email</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">{selectedEmployee.email}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Base Salary</span>
                <span className="font-bold text-emerald-600">{selectedEmployee.profile?.salary || '$125,000 / yr'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
