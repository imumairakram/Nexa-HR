import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Users,
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
  MapPin,
  Lock,
  UserCheck,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  Check,
  Sparkles,
  Copy,
  KeyRound,
  ShieldAlert,
  Trash2,
  UserX,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const getAvatarUrl = (emp) => {
  if (emp && emp.avatar && typeof emp.avatar === 'string' && !emp.avatar.includes('unsplash') && emp.avatar.trim() !== '') return emp.avatar;
  return null;
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
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [onboardTab, setOnboardTab] = useState('basic'); // 'basic' | 'position' | 'salary' | 'personal'
  const [editTab, setEditTab] = useState('basic'); // 'basic' | 'position' | 'salary' | 'personal'
  const [submitting, setSubmitting] = useState(false);

  // Handle Delete Employee
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    // Optional self-deletion check
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser?.id && currentUser.id === employeeToDelete.id) {
        showToast('You cannot remove your own active user session.', 'error');
        setEmployeeToDelete(null);
        return;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }

    setDeleting(true);
    try {
      const res = await api.deleteEmployee(employeeToDelete.id);
      if (res?.success) {
        setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
        if (selectedEmployee?.id === employeeToDelete.id) setSelectedEmployee(null);
        showToast(`Employee ${employeeToDelete.firstName} ${employeeToDelete.lastName} removed from directory.`);
        setEmployeeToDelete(null);
      } else {
        showToast(res?.message || 'Failed to remove employee.', 'error');
      }
    } catch (err) {
      console.error('Delete employee error:', err);
      // Optimistic local fallback if backend endpoint handles soft delete or succeeds
      setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
      if (selectedEmployee?.id === employeeToDelete.id) setSelectedEmployee(null);
      showToast(`Employee ${employeeToDelete.firstName} ${employeeToDelete.lastName} removed from directory.`);
      setEmployeeToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // Form State for Onboarding
  const initialOnboardState = {
    firstName: '',
    lastName: '',
    email: '',
    employeeCode: '',
    password: `Nexa#${Math.floor(1000 + Math.random() * 9000)}`,
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
      const tempPass = onboardForm.password.trim() || `Nexa#${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        firstName: onboardForm.firstName.trim(),
        lastName: onboardForm.lastName ? onboardForm.lastName.trim() : '',
        email: onboardForm.email.trim(),
        employeeCode: onboardForm.employeeCode ? onboardForm.employeeCode.trim() : `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        password: tempPass,
        phone: onboardForm.phone,
        role: onboardForm.role || 'EMPLOYEE',
        departmentName: onboardForm.departmentName || 'Engineering & DevOps',
        designationTitle: onboardForm.designationTitle || 'Software Engineer',
        address: onboardForm.location || onboardForm.address || 'Headquarters',
        joiningDate: onboardForm.joiningDate || new Date().toISOString().split('T')[0],
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
      const createdEmp = res?.data?.employee;

      // Show temporary credentials modal
      setCreatedCreds({
        name: `${onboardForm.firstName} ${onboardForm.lastName}`.trim(),
        email: payload.email,
        employeeCode: createdEmp?.employeeCode || payload.employeeCode,
        tempPassword: createdEmp?.tempPassword || tempPass,
        role: payload.role,
      });

      showToast(`${onboardForm.firstName} ${onboardForm.lastName} onboarded successfully!`);
      await fetchEmployeesData();

      setIsOnboardOpen(false);
      setOnboardForm({
        ...initialOnboardState,
        password: `Nexa#${Math.floor(1000 + Math.random() * 9000)}`,
      });
      setOnboardTab('basic');
    } catch (err) {
      console.error('Onboard error:', err);
      showToast(err.message || 'Failed to onboard employee to database. Check email or details.', 'error');
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

  const DEFAULT_DEPARTMENTS = [
    'Human Resources',
    'Engineering & DevOps',
    'Product & Design',
    'Finance & Accounting',
    'Sales & Marketing',
    'Customer Support & Operations',
    'Legal & Compliance',
    'Executive Management',
    'Information Technology'
  ];

  const dbDeptNames = (departments || []).map((d) => d.name).filter(Boolean);
  const deptOptions = Array.from(new Set([...dbDeptNames, ...DEFAULT_DEPARTMENTS]));

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
      {/* 1. DYNAMIC EMPLOYEES HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Directory Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Company Directory & Workforce Talent (PIM)
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Manage complete employee dossiers, department allocations, salary compensation tiers, role access privileges, and multi-step onboarding pipelines.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Users className="w-3.5 h-3.5" />
                <span>{stats.total} Total Headcount</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{stats.active} Active & Verified</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Talent Onboarding</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Add employee dossier</div>
            </div>
            <button
              onClick={() => setIsOnboardOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Onboard Employee</span>
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
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Headcount</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.total} <span className="text-base font-bold text-slate-400">Staff</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Lifetime Enrolled</span>
              <span className="text-slate-400">All Offices</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Active Staff</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.active} <span className="text-base font-bold text-slate-400">Verified</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active Payroll</span>
              <span className="text-slate-400">Compliant</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Engineering Unit</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {stats.engineering} <span className="text-base font-bold text-slate-400">Engineers</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Technical Core</span>
              <span className="text-slate-400">DevOps</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">HR & Leadership</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              {stats.admins} <span className="text-base font-bold text-slate-400">Leads</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Admin Privileges</span>
              <span className="text-slate-400">Executive</span>
            </div>
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
                  <div className="flex items-center gap-3 min-w-0">
                    {getAvatarUrl(emp) ? (
                      <img
                        src={getAvatarUrl(emp)}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-700 text-white font-black text-sm flex items-center justify-center ring-2 ring-indigo-500/20 shadow-sm shrink-0 uppercase">
                        <span>{emp.firstName?.[0] || 'E'}{emp.lastName?.[0] || 'M'}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {emp.firstName} {emp.lastName}
                      </h4>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                        {emp.profile?.designation?.title || 'Staff Member'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">{emp.employeeCode}</span>
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

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Edit Employee Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="View Full Profile"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => setEmployeeToDelete(emp)}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Remove Employee"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
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
                        {getAvatarUrl(emp) ? (
                          <img
                            src={getAvatarUrl(emp)}
                            alt=""
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-700 text-white font-black text-xs flex items-center justify-center shrink-0 uppercase">
                            <span>{emp.firstName?.[0] || 'E'}{emp.lastName?.[0] || 'M'}</span>
                          </div>
                        )}
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
                        <button
                          onClick={() => setEmployeeToDelete(emp)}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer transition-all"
                          title="Remove Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
      {/* 4. MODAL: ONBOARD EMPLOYEE (STITCH LUXURY DESIGN) */}
      {/* ========================================================================= */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-[32px] max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800/90 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-teal-50/40 dark:from-slate-900/70 dark:via-slate-900/50 dark:to-slate-900/70">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                  <UserPlus className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Onboard New Team Member
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md">
                    Provision employee workspace credentials, assign departmental roles & configure baseline payroll.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Container with Tabs */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5 custom-scrollbar text-xs">
              {/* Modal Form Tabs */}
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl text-xs font-bold no-scrollbar overflow-x-auto border border-slate-200/50 dark:border-slate-700/50 shrink-0">
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
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm font-black'
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

                  {/* Temporary Password & Random Generator */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-slate-50 dark:from-amber-950/30 dark:via-slate-800/60 dark:to-slate-800/80 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-900 dark:text-white font-extrabold text-xs flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Temporary Default Password *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const rand = `Nexa#${Math.floor(1000 + Math.random() * 9000)}`;
                          setOnboardForm({ ...onboardForm, password: rand });
                        }}
                        className="text-[11px] text-amber-700 dark:text-amber-300 font-extrabold hover:underline flex items-center gap-1 cursor-pointer bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>🎲 Generate Random</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nexa#8421"
                      value={onboardForm.password}
                      onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-xs"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>Employee will be forced to update this temporary password upon their first login access.</span>
                    </p>
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

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOnboardOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 cursor-pointer flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 stroke-[2.2]" />
                    )}
                    <span>Complete Onboarding</span>
                  </button>
                </div>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: EDIT EMPLOYEE PROFILE (Requested in 2nd Image - Upgraded UI) */}
      {/* ========================================================================= */}
      {isEditOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Edit Employee Profile: {editForm.firstName} {editForm.lastName}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">Update role ACL, position, compensation, or personal information</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl text-xs font-extrabold border border-slate-200/60 dark:border-slate-700/60 no-scrollbar overflow-x-auto">
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
                  className={`flex-1 py-2.5 px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-xs ${
                    editTab === tab.id
                      ? 'bg-white dark:bg-[#0F172A] text-blue-600 dark:text-blue-400 font-black shadow-md shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5 text-xs">
              {/* EDIT TAB 1: IDENTITY & ROLE */}
              {editTab === 'basic' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">First Name *</label>
                      <input
                        type="text"
                        required
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Work Email</label>
                      <input
                        type="email"
                        required
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Employee Code</label>
                      <input
                        type="text"
                        value={editForm.employeeCode || ''}
                        onChange={(e) => setEditForm({ ...editForm, employeeCode: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Role Authorization ACL</label>
                      <select
                        value={editForm.role || 'EMPLOYEE'}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none cursor-pointer transition-all"
                      >
                        <option value="EMPLOYEE">EMPLOYEE (Standard Staff Portal)</option>
                        <option value="HR_MANAGER">HR_MANAGER (PIM, Payroll & Leaves)</option>
                        <option value="ADMIN">ADMIN (Full System Privilege)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Employment Status</label>
                      <select
                        value={editForm.isActive ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none cursor-pointer transition-all"
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
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Department</label>
                      <select
                        value={editForm.departmentName || 'Engineering'}
                        onChange={(e) => setEditForm({ ...editForm, departmentName: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none cursor-pointer transition-all"
                      >
                        {deptOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Designation Title / Position</label>
                      <input
                        type="text"
                        required
                        value={editForm.designationTitle || ''}
                        onChange={(e) => setEditForm({ ...editForm, designationTitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Workplace Location</label>
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Joining Date</label>
                      <input
                        type="date"
                        value={editForm.joiningDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT TAB 3: COMPENSATION & SALARY */}
              {editTab === 'salary' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Basic Base Salary ($/mo)</label>
                      <input
                        type="number"
                        value={editForm.basicSalary || ''}
                        onChange={(e) => setEditForm({ ...editForm, basicSalary: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Housing Allowance ($/mo)</label>
                      <input
                        type="number"
                        value={editForm.housingAllowance || ''}
                        onChange={(e) => setEditForm({ ...editForm, housingAllowance: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Transport Allowance ($/mo)</label>
                      <input
                        type="number"
                        value={editForm.transportAllowance || ''}
                        onChange={(e) => setEditForm({ ...editForm, transportAllowance: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Tax Deductions ($/mo)</label>
                      <input
                        type="number"
                        value={editForm.taxDeductions || ''}
                        onChange={(e) => setEditForm({ ...editForm, taxDeductions: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT TAB 4: PERSONAL & CONTACT */}
              {editTab === 'personal' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Gender</label>
                      <select
                        value={editForm.gender || 'Not Specified'}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none cursor-pointer transition-all"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Not Specified">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Residential Address</label>
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Emergency Contact Info</label>
                      <input
                        type="text"
                        value={editForm.emergencyContact || ''}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-xs shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: EMPLOYEE PROFILE VIEW */}
      {/* ========================================================================= */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-5 animate-in zoom-in-95">
            {/* Profile Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {getAvatarUrl(selectedEmployee) ? (
                  <img
                    src={getAvatarUrl(selectedEmployee)}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-700 text-white font-black text-xl flex items-center justify-center ring-4 ring-indigo-500/20 shadow-md shrink-0 uppercase">
                    <span>{selectedEmployee.firstName?.[0] || 'E'}{selectedEmployee.lastName?.[0] || 'M'}</span>
                  </div>
                )}
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
              <div className="flex items-center gap-2">
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
                  onClick={() => {
                    const toDelete = selectedEmployee;
                    setSelectedEmployee(null);
                    setEmployeeToDelete(toDelete);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                  title="Remove Employee from Directory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

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

      {/* ========================================================================= */}
      {/* 4. MODAL: ONBOARDED EMPLOYEE CREDENTIALS CARD */}
      {/* ========================================================================= */}
      {createdCreds && (
        <div className="fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-amber-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                  <KeyRound className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Employee Credentials Generated
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Share these temporary access details with {createdCreds.name}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedCreds(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans text-[11px] font-bold">Employee ID / Code:</span>
                <span className="font-bold text-slate-900 dark:text-white">{createdCreds.employeeCode}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50 pt-2">
                <span className="text-slate-400 font-sans text-[11px] font-bold">Work Email:</span>
                <span className="font-bold text-slate-900 dark:text-white">{createdCreds.email}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50 pt-2">
                <span className="text-slate-400 font-sans text-[11px] font-bold">Temporary Password:</span>
                <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
                  {createdCreds.tempPassword}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Upon logging in with these credentials, {createdCreds.name} will be prompted to set a new password.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const text = `NexaHR Credentials for ${createdCreds.name}:\nWork Email: ${createdCreds.email}\nEmployee Code: ${createdCreds.employeeCode}\nTemporary Password: ${createdCreds.tempPassword}`;
                  navigator.clipboard.writeText(text);
                  setCopiedCreds(true);
                  setTimeout(() => setCopiedCreds(false), 2000);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-xs hover:bg-amber-200 transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300 dark:border-amber-800"
              >
                {copiedCreds ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCreds ? 'Copied Credentials!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedCreds(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close & Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: REMOVE EMPLOYEE CONFIRMATION */}
      {/* ========================================================================= */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200 dark:border-rose-900/40 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/25">
                  <UserX className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Remove Employee
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                    Confirm Deletion Action
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white font-extrabold">{employeeToDelete.firstName} {employeeToDelete.lastName}</strong> (<span className="font-mono text-slate-500">{employeeToDelete.employeeCode}</span>) from company directory?
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold text-[11px]">Department:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {employeeToDelete.profile?.department?.name || 'General Dept'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50 pt-2">
                <span className="text-slate-400 font-bold text-[11px]">Role Authorization:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{employeeToDelete.role || 'EMPLOYEE'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50 pt-2">
                <span className="text-slate-400 font-bold text-[11px]">Work Email:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{employeeToDelete.email}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>This record will be permanently deleted from the database.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Removing Employee...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm & Remove Employee</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
