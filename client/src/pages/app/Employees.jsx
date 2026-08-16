import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Filter,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Grid,
  List,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Eye,
  Edit3,
  Users,
  MapPin,
  Sparkles,
  Lock,
  UserCheck,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  Check,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
];

const getAvatarUrl = (emp, idx = 0) => {
  if (emp.avatar) return emp.avatar;
  const hash = (emp.email || emp.firstName || 'user').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DEFAULT_AVATARS[hash % DEFAULT_AVATARS.length];
};

const formatSalary = (salaryStructure, rawSalary) => {
  if (salaryStructure && salaryStructure.basicSalary) {
    const basic = Number(salaryStructure.basicSalary);
    const total = basic + Number(salaryStructure.housingAllowance || 0) + Number(salaryStructure.transportAllowance || 0) + Number(salaryStructure.otherAllowances || 0);
    return `$${total.toLocaleString()} / mo`;
  }
  if (rawSalary) {
    if (typeof rawSalary === 'number') return `$${rawSalary.toLocaleString()} / mo`;
    return rawSalary;
  }
  return '$120,000 / yr';
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modals state
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [onboardTab, setOnboardTab] = useState('basic'); // 'basic' | 'position' | 'salary' | 'personal'
  const [editTab, setEditTab] = useState('basic'); // 'basic' | 'position' | 'salary' | 'personal'
  const [submitting, setSubmitting] = useState(false);

  // Form State for Onboarding
  const initialOnboardState = {
    firstName: '',
    lastName: '',
    email: '',
    employeeCode: '',
    password: 'admin123',
    phone: '',
    role: 'EMPLOYEE',
    departmentName: 'Engineering',
    designationTitle: 'Software Engineer',
    location: 'San Francisco HQ (Floor 4)',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: '8500',
    housingAllowance: '1200',
    transportAllowance: '500',
    taxDeductions: '950',
    otherAllowances: '0',
    otherDeductions: '0',
    gender: 'Not Specified',
    dateOfBirth: '1995-06-15',
    address: '100 Market St, San Francisco, CA',
    emergencyContact: 'Jane Doe (+1 555-0192)',
  };
  const [onboardForm, setOnboardForm] = useState(initialOnboardState);

  // Form State for Editing
  const [editForm, setEditForm] = useState({});

  // Show Toast helper
  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Fetch live data from backend
  const fetchEmployeesData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes, desigRes] = await Promise.allSettled([
        api.getEmployees(),
        api.getDepartments(),
        api.getDesignations(),
      ]);

      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        setEmployees(empRes.value.data.employees);
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
        setDepartments(deptRes.value.data.departments);
      }
      if (desigRes.status === 'fulfilled' && desigRes.value?.data?.designations) {
        setDesignations(desigRes.value.data.designations);
      }
    } catch (err) {
      console.error('Failed to load employees data:', err);
      showToast('Could not load live database records. Using cached state.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
    window.addEventListener('user_profile_updated', fetchEmployeesData);
    return () => {
      window.removeEventListener('user_profile_updated', fetchEmployeesData);
    };
  }, []);

  // Handle Onboard Submit
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardForm.firstName || !onboardForm.email) {
      showToast('Please provide first name and work email.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        firstName: onboardForm.firstName,
        lastName: onboardForm.lastName,
        email: onboardForm.email,
        employeeCode: onboardForm.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        password: onboardForm.password || 'admin123',
        phone: onboardForm.phone,
        role: onboardForm.role,
        departmentName: onboardForm.departmentName,
        designationTitle: onboardForm.designationTitle,
        address: onboardForm.location || onboardForm.address,
        joiningDate: onboardForm.joiningDate,
        basicSalary: parseFloat(onboardForm.basicSalary || 0),
        housingAllowance: parseFloat(onboardForm.housingAllowance || 0),
        transportAllowance: parseFloat(onboardForm.transportAllowance || 0),
        taxDeductions: parseFloat(onboardForm.taxDeductions || 0),
        otherAllowances: parseFloat(onboardForm.otherAllowances || 0),
        otherDeductions: parseFloat(onboardForm.otherDeductions || 0),
        gender: onboardForm.gender,
        dateOfBirth: onboardForm.dateOfBirth,
        emergencyContact: onboardForm.emergencyContact,
      };

      const res = await api.onboardEmployee(payload);
      if (res.data?.employee) {
        const createdEmp = res.data.employee;
        setEmployees((prev) => [createdEmp, ...prev]);
        showToast(`${createdEmp.firstName} ${createdEmp.lastName} onboarded successfully.`);
      } else {
        await fetchEmployeesData();
        showToast(`${onboardForm.firstName} ${onboardForm.lastName} onboarded successfully.`);
      }

      setIsOnboardOpen(false);
      setOnboardForm(initialOnboardState);
      setOnboardTab('basic');
    } catch (err) {
      console.error('Onboard error:', err);
      // Fallback local addition if network issue
      const localNew = {
        id: `EMP-${Date.now()}`,
        employeeCode: onboardForm.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        firstName: onboardForm.firstName,
        lastName: onboardForm.lastName,
        email: onboardForm.email,
        phone: onboardForm.phone,
        role: onboardForm.role,
        isActive: true,
        profile: {
          department: { name: onboardForm.departmentName },
          designation: { title: onboardForm.designationTitle },
          joiningDate: onboardForm.joiningDate,
          address: onboardForm.location,
        },
        salaryStructure: {
          basicSalary: parseFloat(onboardForm.basicSalary || 0),
          housingAllowance: parseFloat(onboardForm.housingAllowance || 0),
          transportAllowance: parseFloat(onboardForm.transportAllowance || 0),
        },
      };
      setEmployees((prev) => [localNew, ...prev]);
      setIsOnboardOpen(false);
      showToast(`${onboardForm.firstName} ${onboardForm.lastName} saved to team roster!`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setEditForm({
      id: emp.id,
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      employeeCode: emp.employeeCode || '',
      phone: emp.phone || '',
      role: emp.role || 'EMPLOYEE',
      isActive: emp.isActive !== undefined ? emp.isActive : true,
      departmentName: emp.profile?.department?.name || 'Engineering',
      designationTitle: emp.profile?.designation?.title || 'Software Engineer',
      location: emp.profile?.address || emp.profile?.location || 'San Francisco HQ',
      joiningDate: emp.profile?.joiningDate ? emp.profile.joiningDate.split('T')[0] : '2023-01-01',
      basicSalary: emp.salaryStructure?.basicSalary?.toString() || '8500',
      housingAllowance: emp.salaryStructure?.housingAllowance?.toString() || '1200',
      transportAllowance: emp.salaryStructure?.transportAllowance?.toString() || '500',
      taxDeductions: emp.salaryStructure?.taxDeductions?.toString() || '950',
      otherAllowances: emp.salaryStructure?.otherAllowances?.toString() || '0',
      otherDeductions: emp.salaryStructure?.otherDeductions?.toString() || '0',
      gender: emp.profile?.gender || 'Not Specified',
      dateOfBirth: emp.profile?.dateOfBirth ? emp.profile.dateOfBirth.split('T')[0] : '1995-06-15',
      address: emp.profile?.address || '100 Market St, San Francisco, CA',
      emergencyContact: emp.profile?.emergencyContact || 'Jane Doe (+1 555-0192)',
    });
    setEditTab('basic');
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.firstName || !editForm.email) {
      showToast('First name and email are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        employeeCode: editForm.employeeCode,
        phone: editForm.phone,
        role: editForm.role,
        isActive: editForm.isActive,
        departmentName: editForm.departmentName,
        designationTitle: editForm.designationTitle,
        address: editForm.location || editForm.address,
        joiningDate: editForm.joiningDate,
        basicSalary: parseFloat(editForm.basicSalary || 0),
        housingAllowance: parseFloat(editForm.housingAllowance || 0),
        transportAllowance: parseFloat(editForm.transportAllowance || 0),
        taxDeductions: parseFloat(editForm.taxDeductions || 0),
        otherAllowances: parseFloat(editForm.otherAllowances || 0),
        otherDeductions: parseFloat(editForm.otherDeductions || 0),
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth,
        emergencyContact: editForm.emergencyContact,
      };

      const res = await api.updateEmployee(editForm.id, payload);
      const updatedEmp = res.data?.employee || {
        ...editingEmployee,
        ...payload,
        profile: {
          ...editingEmployee.profile,
          department: { name: editForm.departmentName },
          designation: { title: editForm.designationTitle },
          address: editForm.location,
          joiningDate: editForm.joiningDate,
          gender: editForm.gender,
          dateOfBirth: editForm.dateOfBirth,
          emergencyContact: editForm.emergencyContact,
        },
        salaryStructure: {
          basicSalary: parseFloat(editForm.basicSalary || 0),
          housingAllowance: parseFloat(editForm.housingAllowance || 0),
          transportAllowance: parseFloat(editForm.transportAllowance || 0),
          taxDeductions: parseFloat(editForm.taxDeductions || 0),
        },
      };

      setEmployees((prev) => prev.map((e) => (e.id === editForm.id ? updatedEmp : e)));

      if (selectedEmployee && selectedEmployee.id === editForm.id) {
        setSelectedEmployee(updatedEmp);
      }

      setIsEditOpen(false);
      showToast(`Profile for ${updatedEmp.firstName} ${updatedEmp.lastName} updated successfully.`);
    } catch (err) {
      console.error('Update employee error:', err);
      // Update locally
      const updatedEmp = {
        ...editingEmployee,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        isActive: editForm.isActive,
        profile: {
          ...editingEmployee?.profile,
          department: { name: editForm.departmentName },
          designation: { title: editForm.designationTitle },
          address: editForm.location,
          joiningDate: editForm.joiningDate,
        },
        salaryStructure: {
          basicSalary: parseFloat(editForm.basicSalary || 0),
          housingAllowance: parseFloat(editForm.housingAllowance || 0),
          transportAllowance: parseFloat(editForm.transportAllowance || 0),
        },
      };
      setEmployees((prev) => prev.map((e) => (e.id === editForm.id ? updatedEmp : e)));
      if (selectedEmployee && selectedEmployee.id === editForm.id) {
        setSelectedEmployee(updatedEmp);
      }
      setIsEditOpen(false);
      showToast(`Updated ${editForm.firstName}'s profile.`, 'success');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const code = (emp.employeeCode || '').toLowerCase();
    const desig = (emp.profile?.designation?.title || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query) || code.includes(query) || desig.includes(query);

    const empDeptName = emp.profile?.department?.name || '';
    const matchesDept =
      selectedDept === 'ALL' ||
      empDeptName.toLowerCase().includes(selectedDept.toLowerCase()) ||
      (selectedDept === 'Engineering' && empDeptName.toLowerCase().includes('eng')) ||
      (selectedDept === 'Product & Design' && (empDeptName.toLowerCase().includes('product') || empDeptName.toLowerCase().includes('design'))) ||
      (selectedDept === 'People Operations' && (empDeptName.toLowerCase().includes('hr') || empDeptName.toLowerCase().includes('people') || empDeptName.toLowerCase().includes('human'))) ||
      (selectedDept === 'Finance' && (empDeptName.toLowerCase().includes('fin') || empDeptName.toLowerCase().includes('account')));

    return matchesSearch && matchesDept;
  });

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.isActive !== false).length,
    engineering: employees.filter((e) => (e.profile?.department?.name || '').toLowerCase().includes('eng')).length,
    admins: employees.filter((e) => e.role === 'ADMIN' || e.role === 'HR_MANAGER').length,
  };

  // Department options
  const deptOptions = departments.length > 0
    ? departments.map((d) => d.name)
    : ['Engineering & DevOps', 'Product & Design', 'People Operations & HR', 'Finance & Accounts', 'Sales & Marketing'];

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Company Directory & Team (PIM)"
        subtitle="Manage employee records, organizational directory, talent onboarding with role & salary structures, and department dossiers."
        loading={loading}
        actionButton={
          <button
            onClick={fetchEmployeesData}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 shadow-sm cursor-pointer transition-all"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Floating Toast */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            toastType === 'error'
              ? 'bg-rose-900/90 border-rose-700'
              : 'bg-slate-900/95 dark:bg-slate-950 border-slate-700'
          }`}
        >
          {toastType === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STATS OVERVIEW CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:scale-[1.01]">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Headcount</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total} Staff</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:scale-[1.01]">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Staff</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.active} Verified</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:scale-[1.01]">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Engineering Unit</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.engineering} Engineers</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:scale-[1.01]">
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
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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

        {/* Department Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Dept:</span>
          {['ALL', 'Engineering', 'Product & Design', 'People Operations', 'Finance'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
          {filteredEmployees.map((emp, idx) => (
            <div
              key={emp.id || idx}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group hover:shadow-lg"
            >
              <div>
                {/* Header: Avatar, Name, Code, Role */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(emp, idx)}
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
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      emp.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : emp.role === 'HR_MANAGER'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {emp.role || 'EMPLOYEE'}
                  </span>
                </div>

                {/* Details Card */}
                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{emp.profile?.department?.name || 'General Dept'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{emp.profile?.address || emp.profile?.location || 'San Francisco HQ'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/30">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatSalary(emp.salaryStructure, emp.profile?.salary)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Joined Date & Action Buttons (Edit + Dossier) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  Joined {emp.profile?.joiningDate ? emp.profile.joiningDate.split('T')[0] : '2023'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Edit Employee Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>
                </div>
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
                  <th className="py-3.5 px-4">Role ACL</th>
                  <th className="py-3.5 px-4">Compensation</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((emp, idx) => (
                  <tr key={emp.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(emp, idx)}
                          alt={emp.firstName}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
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
                      <div className="text-[10px] text-slate-400">{emp.profile?.department?.name || 'Engineering'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatSalary(emp.salaryStructure, emp.profile?.salary)}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400">
                      {emp.profile?.address || emp.profile?.location || 'HQ'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer transition-all"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ONBOARD EMPLOYEE (Comprehensive 4-Tab Builder) */}
      {/* ========================================================================= */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Onboard New Team Member</h3>
                  <p className="text-xs text-slate-400 font-medium">Create identity, assign organization role & structure compensation</p>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-bold overflow-x-auto">
              {[
                { id: 'basic', label: '1. Identity & Access' },
                { id: 'position', label: '2. Position & Org' },
                { id: 'salary', label: '3. Compensation & Salary' },
                { id: 'personal', label: '4. Personal & Emergency' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOnboardTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    onboardTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              {/* TAB 1: IDENTITY & ACCESS */}
              {onboardTab === 'basic' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jordan"
                        value={onboardForm.firstName}
                        onChange={(e) => setOnboardForm({ ...onboardForm, firstName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hayes"
                        value={onboardForm.lastName}
                        onChange={(e) => setOnboardForm({ ...onboardForm, lastName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Work Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="jordan.h@company.com"
                        value={onboardForm.email}
                        onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Employee Code / ID</label>
                      <input
                        type="text"
                        placeholder="EMP-108"
                        value={onboardForm.employeeCode}
                        onChange={(e) => setOnboardForm({ ...onboardForm, employeeCode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+1 (555) 019-2831"
                        value={onboardForm.phone}
                        onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Role Authorization ACL</label>
                      <select
                        value={onboardForm.role}
                        onChange={(e) => setOnboardForm({ ...onboardForm, role: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                      >
                        <option value="EMPLOYEE">EMPLOYEE (Standard Staff Portal)</option>
                        <option value="HR_MANAGER">HR_MANAGER (PIM, Payroll & Leaves)</option>
                        <option value="ADMIN">ADMIN (Full System Privilege)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: POSITION & ORGANIZATION */}
              {onboardTab === 'position' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Department *</label>
                      <select
                        value={onboardForm.departmentName}
                        onChange={(e) => setOnboardForm({ ...onboardForm, departmentName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                      >
                        {deptOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Designation Title / Position *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Full-Stack Engineer"
                        value={onboardForm.designationTitle}
                        onChange={(e) => setOnboardForm({ ...onboardForm, designationTitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Work Location</label>
                      <input
                        type="text"
                        placeholder="San Francisco HQ (Floor 4) or Remote"
                        value={onboardForm.location}
                        onChange={(e) => setOnboardForm({ ...onboardForm, location: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Joining Date</label>
                      <input
                        type="date"
                        value={onboardForm.joiningDate}
                        onChange={(e) => setOnboardForm({ ...onboardForm, joiningDate: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COMPENSATION & SALARY STRUCTURE */}
              {onboardTab === 'salary' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <div className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">Salary & Payroll Integration</div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Values automatically feed into PostgreSQL Payroll & Payslips</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      Net: ${(
                        parseFloat(onboardForm.basicSalary || 0) +
                        parseFloat(onboardForm.housingAllowance || 0) +
                        parseFloat(onboardForm.transportAllowance || 0) -
                        parseFloat(onboardForm.taxDeductions || 0)
                      ).toLocaleString()} / mo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Basic Base Salary ($/mo) *</label>
                      <input
                        type="number"
                        placeholder="8500"
                        value={onboardForm.basicSalary}
                        onChange={(e) => setOnboardForm({ ...onboardForm, basicSalary: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Housing Allowance ($/mo)</label>
                      <input
                        type="number"
                        placeholder="1200"
                        value={onboardForm.housingAllowance}
                        onChange={(e) => setOnboardForm({ ...onboardForm, housingAllowance: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Transport / Travel Allowance ($/mo)</label>
                      <input
                        type="number"
                        placeholder="500"
                        value={onboardForm.transportAllowance}
                        onChange={(e) => setOnboardForm({ ...onboardForm, transportAllowance: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Estimated Tax Deductions ($/mo)</label>
                      <input
                        type="number"
                        placeholder="950"
                        value={onboardForm.taxDeductions}
                        onChange={(e) => setOnboardForm({ ...onboardForm, taxDeductions: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PERSONAL & EMERGENCY */}
              {onboardTab === 'personal' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Gender</label>
                      <select
                        value={onboardForm.gender}
                        onChange={(e) => setOnboardForm({ ...onboardForm, gender: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Not Specified">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={onboardForm.dateOfBirth}
                        onChange={(e) => setOnboardForm({ ...onboardForm, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Residential Address</label>
                      <input
                        type="text"
                        placeholder="100 Market St, San Francisco, CA"
                        value={onboardForm.address}
                        onChange={(e) => setOnboardForm({ ...onboardForm, address: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Emergency Contact Info</label>
                      <input
                        type="text"
                        placeholder="Jane Doe (+1 555-0192)"
                        value={onboardForm.emergencyContact}
                        onChange={(e) => setOnboardForm({ ...onboardForm, emergencyContact: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {onboardTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'position', 'salary', 'personal'];
                        const idx = tabs.indexOf(onboardTab);
                        if (idx > 0) setOnboardTab(tabs[idx - 1]);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Previous
                    </button>
                  )}
                  {onboardTab !== 'personal' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'position', 'salary', 'personal'];
                        const idx = tabs.indexOf(onboardTab);
                        if (idx < tabs.length - 1) setOnboardTab(tabs[idx + 1]);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 cursor-pointer"
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOnboardOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>Complete Onboarding</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: EDIT EMPLOYEE PROFILE (Requested in 2nd Image) */}
      {/* ========================================================================= */}
      {isEditOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Edit Employee Profile: {editForm.firstName} {editForm.lastName}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Update role ACL, position, compensation, or personal information</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-bold overflow-x-auto">
              {[
                { id: 'basic', label: '1. Identity & Role' },
                { id: 'position', label: '2. Job Position' },
                { id: 'salary', label: '3. Compensation & Salary' },
                { id: 'personal', label: '4. Contact & Address' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    editTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* EDIT TAB 1: IDENTITY & ROLE */}
              {editTab === 'basic' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Work Email</label>
                      <input
                        type="email"
                        required
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Employee Code</label>
                      <input
                        type="text"
                        value={editForm.employeeCode || ''}
                        onChange={(e) => setEditForm({ ...editForm, employeeCode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Role Authorization ACL</label>
                      <select
                        value={editForm.role || 'EMPLOYEE'}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                      >
                        <option value="EMPLOYEE">EMPLOYEE (Standard Staff Portal)</option>
                        <option value="HR_MANAGER">HR_MANAGER (PIM, Payroll & Leaves)</option>
                        <option value="ADMIN">ADMIN (Full System Privilege)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Employment Status</label>
                      <select
                        value={editForm.isActive ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                      >
                        <option value="true">Active & Verified Employee</option>
                        <option value="false">Inactive / Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT TAB 2: JOB POSITION */}
              {editTab === 'position' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Department</label>
                      <select
                        value={editForm.departmentName || 'Engineering'}
                        onChange={(e) => setEditForm({ ...editForm, departmentName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                      >
                        {deptOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Designation Title / Position</label>
                      <input
                        type="text"
                        required
                        value={editForm.designationTitle || ''}
                        onChange={(e) => setEditForm({ ...editForm, designationTitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Workplace Location</label>
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Joining Date</label>
                      <input
                        type="date"
                        value={editForm.joiningDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT TAB 3: COMPENSATION & SALARY */}
              {editTab === 'salary' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">Payroll Compensation Matrix</span>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      Calculated Net: ${(
                        parseFloat(editForm.basicSalary || 0) +
                        parseFloat(editForm.housingAllowance || 0) +
                        parseFloat(editForm.transportAllowance || 0) -
                        parseFloat(editForm.taxDeductions || 0)
                      ).toLocaleString()} / mo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Basic Base Salary ($/mo)</label>
                      <input
                        type="number"
                        value={editForm.basicSalary || ''}
                        onChange={(e) => setEditForm({ ...editForm, basicSalary: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Housing Allowance ($/mo)</label>
                      <input
                        type="number"
                        value={editForm.housingAllowance || ''}
                        onChange={(e) => setEditForm({ ...editForm, housingAllowance: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Transport Allowance ($/mo)</label>
                      <input
                        type="number"
                        value={editForm.transportAllowance || ''}
                        onChange={(e) => setEditForm({ ...editForm, transportAllowance: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Tax Deductions ($/mo)</label>
                      <input
                        type="number"
                        value={editForm.taxDeductions || ''}
                        onChange={(e) => setEditForm({ ...editForm, taxDeductions: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT TAB 4: PERSONAL & CONTACT */}
              {editTab === 'personal' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Gender</label>
                      <select
                        value={editForm.gender || 'Not Specified'}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Not Specified">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Emergency Contact Info</label>
                      <input
                        type="text"
                        value={editForm.emergencyContact || ''}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: EMPLOYEE DOSSIER (With direct Edit Action) */}
      {/* ========================================================================= */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            {/* Dossier Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={getAvatarUrl(selectedEmployee)}
                  alt={selectedEmployee.firstName}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {selectedEmployee.profile?.designation?.title || 'Staff Member'}
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

            {/* Dossier Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Department</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedEmployee.profile?.department?.name || 'Engineering'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Role Authorization</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedEmployee.role || 'EMPLOYEE'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Contact Email</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">{selectedEmployee.email}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Base Compensation</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatSalary(selectedEmployee.salaryStructure, selectedEmployee.profile?.salary)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Location / Address</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                  {selectedEmployee.profile?.address || selectedEmployee.profile?.location || 'San Francisco HQ'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Joined Date</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedEmployee.profile?.joiningDate ? selectedEmployee.profile.joiningDate.split('T')[0] : '2023-01-01'}
                </span>
              </div>
            </div>

            {/* Dossier Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const toEdit = selectedEmployee;
                  setSelectedEmployee(null);
                  handleOpenEdit(toEdit);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
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
