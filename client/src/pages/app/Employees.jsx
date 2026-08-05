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
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Onboarding Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'password123',
    employeeCode: '',
    phone: '',
    role: 'EMPLOYEE',
    departmentId: '',
    designationId: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, desigRes] = await Promise.all([
        api.getEmployees({ search: searchTerm, departmentId: selectedDept }),
        api.getDepartments(),
        api.getDesignations(),
      ]);

      if (empRes.success && empRes.data?.employees) {
        setEmployees(empRes.data.employees);
      }
      if (deptRes.success && deptRes.data?.departments) {
        setDepartments(deptRes.data.departments);
      }
      if (desigRes.success && desigRes.data?.designations) {
        setDesignations(desigRes.data.designations);
      }
    } catch (err) {
      console.warn('Backend offline or error, using mock employee data fallback.', err);
      // Fallback data if backend is starting up
      setEmployees([
        {
          id: '1',
          employeeCode: 'EMP-101',
          firstName: 'Sarah',
          lastName: 'Connor',
          email: 'sarah.connor@acme.com',
          phone: '+1 (555) 987-6543',
          role: 'ADMIN',
          isActive: true,
          profile: {
            department: { name: 'Engineering', code: 'ENG' },
            designation: { title: 'VP of Software Engineering' },
            joiningDate: '2023-01-15',
          },
        },
        {
          id: '2',
          employeeCode: 'EMP-102',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@acme.com',
          phone: '+1 (555) 800-5550',
          role: 'HR_MANAGER',
          isActive: true,
          profile: {
            department: { name: 'Human Resources', code: 'HR' },
            designation: { title: 'HR Lead Manager' },
            joiningDate: '2023-03-01',
          },
        },
        {
          id: '3',
          employeeCode: 'EMP-103',
          firstName: 'Alex',
          lastName: 'Mercer',
          email: 'alex.mercer@acme.com',
          phone: '+1 (555) 415-8882',
          role: 'EMPLOYEE',
          isActive: true,
          profile: {
            department: { name: 'Engineering', code: 'ENG' },
            designation: { title: 'Senior Full-Stack Engineer' },
            joiningDate: '2023-06-10',
          },
        },
        {
          id: '4',
          employeeCode: 'EMP-104',
          firstName: 'Emily',
          lastName: 'Watson',
          email: 'emily.w@acme.com',
          phone: '+1 (555) 212-9994',
          role: 'EMPLOYEE',
          isActive: true,
          profile: {
            department: { name: 'Product & Design', code: 'PRD' },
            designation: { title: 'Lead UI/UX Designer' },
            joiningDate: '2024-02-14',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedDept]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      const res = await api.onboardEmployee(formData);
      if (res.success) {
        setFormSuccess('Employee onboarded successfully into system!');
        setTimeout(() => {
          setIsOnboardOpen(false);
          setFormSuccess('');
          loadData();
        }, 1200);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to onboard employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick stats calculations
  const totalEmployees = employees.length;
  const activeStaff = employees.filter((e) => e.isActive).length;
  const adminRolesCount = employees.filter((e) => e.role === 'ADMIN' || e.role === 'HR_MANAGER').length;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Header matching exact reference screenshot */}
      <AppPageHeader
        title="Employee Directory"
        onSearch={(val) => setSearchTerm(val)}
        onRefresh={() => loadData()}
        loading={loading}
      />

      {/* 4 Stat Summary Cards (Dashboard Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Total Workforce</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{totalEmployees}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Active</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Active Staff</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{activeStaff}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">100% Sync</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Management & HR</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{adminRolesCount}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Admin Privileges</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Departments</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{departments.length || 5}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">Configured</span>
          </div>
        </div>
      </div>

      {/* Filter & View Switcher Bar with Onboard Button */}
      <div className="bg-white p-3.5 rounded-3xl shadow-soft border border-slate-100/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: 'password123',
                employeeCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
                phone: '',
                role: 'EMPLOYEE',
                departmentId: departments[0]?.id || '',
                designationId: designations[0]?.id || '',
                joiningDate: new Date().toISOString().split('T')[0],
              });
              setIsOnboardOpen(true);
            }}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Onboard Employee</span>
          </button>

          {/* Grid / Table Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee List View (Grid or Table) */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-soft border border-slate-100">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading active employee records from database...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.map((emp) => {
            const fullName = `${emp.firstName} ${emp.lastName}`;
            const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`;
            const deptName = emp.profile?.department?.name || 'General Staff';
            const desigTitle = emp.profile?.designation?.title || emp.role;

            return (
              <div
                key={emp.id}
                className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between hover:shadow-soft-hover transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white font-black flex items-center justify-center text-sm shadow-sm ring-2 ring-purple-500/10">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight group-hover:text-purple-600 transition-colors">
                          {fullName}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block mt-0.5">
                          {emp.employeeCode}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        emp.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : emp.role === 'HR_MANAGER'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {emp.role}
                    </span>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-700 text-[11px] font-semibold">
                      {desigTitle}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{deptName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>

                    {emp.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Status
                  </span>

                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="text-xs font-bold text-slate-900 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    View Profile →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100 uppercase">
                <th className="pb-3 px-3">Employee</th>
                <th className="pb-3 px-3">Code</th>
                <th className="pb-3 px-3">Department</th>
                <th className="pb-3 px-3">Designation</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                        {emp.firstName?.[0]}
                        {emp.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[10px] text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700">{emp.employeeCode}</td>
                  <td className="py-3 px-3 text-slate-600">{emp.profile?.department?.name || 'N/A'}</td>
                  <td className="py-3 px-3 text-slate-600">{emp.profile?.designation?.title || 'Staff'}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="text-xs font-bold text-slate-900 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Onboard New Employee Modal */}
      {isOnboardOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Onboard New Employee</h3>
                <p className="text-xs text-slate-500">Create new staff account in PostgreSQL database</p>
              </div>
              <button
                onClick={() => setIsOnboardOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sarah"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Connor"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="sarah.c@company.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    name="employeeCode"
                    required
                    value={formData.employeeCode}
                    onChange={handleInputChange}
                    placeholder="EMP-107"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role Permission</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="HR_MANAGER">HR_MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 555 123 4567"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                  <select
                    name="designationId"
                    value={formData.designationId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <option value="">Select Designation</option>
                    {designations.map((des) => (
                      <option key={des.id} value={des.id}>
                        {des.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Confirm Onboarding</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Profile Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center text-lg shadow-md">
                  {selectedEmployee.firstName?.[0]}
                  {selectedEmployee.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-xs font-bold text-purple-600">{selectedEmployee.employeeCode}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Role</span>
                  <span className="font-extrabold text-slate-900">{selectedEmployee.role}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Status</span>
                  <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Staff
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-800">{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{selectedEmployee.phone || 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Department: <strong>{selectedEmployee.profile?.department?.name || 'General'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>Designation: <strong>{selectedEmployee.profile?.designation?.title || 'Team Member'}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
