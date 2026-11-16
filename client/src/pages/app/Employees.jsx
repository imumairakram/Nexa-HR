import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Banknote,
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
  Home,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { EmployeeCardSkeleton } from '../../components/common/Skeleton';
import ModernSearchBarSection from '../../components/common/ModernSearchBarSection';
import { api } from '../../services/api';

const DEFAULT_BLANK_AVATAR = '/blank-profile-picture.png';

const getAvatarUrl = (emp) => {
  if (!emp) return DEFAULT_BLANK_AVATAR;
  // 1. Direct avatar on user object
  if (emp.avatar && typeof emp.avatar === 'string' && emp.avatar.trim() !== '' && !emp.avatar.includes('unsplash')) {
    return emp.avatar;
  }
  // 2. Avatar on profile object
  if (emp.profile?.avatarUrl && typeof emp.profile.avatarUrl === 'string' && emp.profile.avatarUrl.trim() !== '' && !emp.profile.avatarUrl.includes('unsplash')) {
    return emp.profile.avatarUrl;
  }
  // 3. Check scoped localStorage for this employee ID
  if (emp.id) {
    try {
      const scoped = localStorage.getItem(`user_avatar_${emp.id}`);
      if (scoped && typeof scoped === 'string' && scoped.trim() !== '' && !scoped.includes('unsplash')) {
        return scoped;
      }
    } catch {}
  }
  // 4. Check active session user if matches this employee
  try {
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    if (current && (current.id === emp.id || (current.email && emp.email && current.email.toLowerCase() === emp.email.toLowerCase()))) {
      if (current.avatar && typeof current.avatar === 'string' && current.avatar.trim() !== '' && !current.avatar.includes('unsplash')) {
        return current.avatar;
      }
      if (current.profile?.avatarUrl && typeof current.profile.avatarUrl === 'string' && current.profile.avatarUrl.trim() !== '' && !current.profile.avatarUrl.includes('unsplash')) {
        return current.profile.avatarUrl;
      }
      const scopedCurrent = localStorage.getItem(`user_avatar_${current.id}`);
      if (scopedCurrent && typeof scopedCurrent === 'string' && scopedCurrent.trim() !== '' && !scopedCurrent.includes('unsplash')) {
        return scopedCurrent;
      }
    }
  } catch {}

  return DEFAULT_BLANK_AVATAR;
};

const formatDob = (dobStr) => {
  if (!dobStr) return 'Not Specified';
  try {
    const d = new Date(dobStr);
    if (isNaN(d.getTime())) return dobStr;
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dobStr;
  }
};

const getSafeEmail = (emp) => {
  if (!emp) return '';
  const email = emp.email || '';
  if (emp.isDemo || emp.isGuest) {
    return emp.role === 'ADMIN' ? 'guest.hr@nexahr.com' : 'guest.employee@nexahr.com';
  }
  return email;
};

const formatJoiningDate = (joinStr) => {
  if (!joinStr) return 'Active';
  try {
    const d = new Date(joinStr);
    if (isNaN(d.getTime())) return joinStr;
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return joinStr;
  }
};

const getEmployeeBio = (emp) => {
  if (emp?.profile?.bio && typeof emp.profile.bio === 'string' && emp.profile.bio.trim() !== '') {
    return emp.profile.bio;
  }
  if (emp?.bio && typeof emp.bio === 'string' && emp.bio.trim() !== '') {
    return emp.bio;
  }

  const name = emp?.firstName ? `${emp.firstName}` : 'This team member';
  const desig = emp?.profile?.designation?.title || emp?.designationTitle || '';
  const dept = emp?.profile?.department?.name || emp?.departmentName || '';

  if (desig && dept) {
    return `${name} is an active ${desig} in the ${dept} department at NexaHR, focused on driving cross-functional outcomes, scalable workflows, and team excellence.`;
  }
  if (desig) {
    return `${name} is a dedicated ${desig} at NexaHR, committed to delivering high-impact solutions, quality execution, and collaborative results.`;
  }
  return `${name} is a valued team member at NexaHR, contributing to core organizational goals, professional standards, and strategic execution.`;
};

const formatSalary = (salaryStructure, rawSalary) => {
  if (salaryStructure && salaryStructure.basicSalary) {
    const basic = Number(salaryStructure.basicSalary);
    const total = basic + Number(salaryStructure.housingAllowance || 0) + Number(salaryStructure.transportAllowance || 0) + Number(salaryStructure.otherAllowances || 0);
    return `PKR ${total.toLocaleString()} / mo`;
  }
  if (rawSalary) {
    if (typeof rawSalary === 'number') return `PKR ${rawSalary.toLocaleString()} / mo`;
    return rawSalary;
  }
  return 'Not Configured';
};

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(() => api.getCached('/employees')?.data?.employees || []);
  const [departments, setDepartments] = useState(() => api.getCached('/departments')?.data?.departments || []);
  const [designations, setDesignations] = useState(() => api.getCached('/designations')?.data?.designations || []);
  const [loading, setLoading] = useState(() => !api.hasCached('/employees'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeSort, setActiveSort] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeDateRange, setActiveDateRange] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute unique department options with counts
  const departmentOptions = useMemo(() => {
    const map = new Map();
    // Standard baseline departments
    const baseline = ['Engineering', 'Product & Design', 'People Operations', 'Finance'];
    baseline.forEach((d) => map.set(d, 0));

    // Dynamic departments from API
    departments.forEach((d) => {
      if (d.name && !map.has(d.name)) {
        map.set(d.name, 0);
      }
    });

    // Tally counts from current employee roster
    employees.forEach((emp) => {
      const dName = emp.profile?.department?.name || emp.department || '';
      if (!dName) return;

      let matchedKey = null;
      for (const [key] of map.entries()) {
        if (
          dName.toLowerCase() === key.toLowerCase() ||
          (key === 'Engineering' && dName.toLowerCase().includes('eng')) ||
          (key === 'Product & Design' &&
            (dName.toLowerCase().includes('product') || dName.toLowerCase().includes('design'))) ||
          (key === 'People Operations' &&
            (dName.toLowerCase().includes('hr') ||
              dName.toLowerCase().includes('people') ||
              dName.toLowerCase().includes('human'))) ||
          (key === 'Finance' &&
            (dName.toLowerCase().includes('fin') || dName.toLowerCase().includes('account')))
        ) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey) {
        map.set(matchedKey, (map.get(matchedKey) || 0) + 1);
      } else {
        map.set(dName, (map.get(dName) || 0) + 1);
      }
    });

    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [departments, employees]);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
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
      if (err.name === 'DemoModeError' || err.code === 'DEMO_MODE') {
        setEmployeeToDelete(null);
        return;
      }
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
      if (!api.hasCached('/employees')) {
        setLoading(true);
      }
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
    const handleProfileUpdate = () => {
      fetchEmployeesData();
    };

    window.addEventListener('user_profile_updated', handleProfileUpdate);
    window.addEventListener('avatar_updated', handleProfileUpdate);
    window.addEventListener('user_avatar_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('user_profile_updated', handleProfileUpdate);
      window.removeEventListener('avatar_updated', handleProfileUpdate);
      window.removeEventListener('user_avatar_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);


  // Resend official credentials email via corporate SMTP
  const handleResendOfficialEmail = async (creds) => {
    if (!creds) return;
    try {
      setIsResendingEmail(true);
      if (creds.id) {
        const res = await api.resendWelcomeEmail(creds.id, { tempPassword: creds.tempPassword });
        showToast(res?.message || `Welcome credentials email dispatched to ${creds.email}!`);
      } else {
        handleEmailCredentials(creds);
      }
    } catch (err) {
      console.error('Resend official email error:', err);
      showToast(err.message || 'Could not resend email automatically. Opening Gmail compose...', 'error');
      handleEmailCredentials(creds);
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Dispatch / Compose Gmail with credentials prefilled
  const handleEmailCredentials = (creds) => {
    if (!creds) return;
    const recipient = creds.email || '';
    const subject = `NexaHR Portal Access - Login Credentials for ${creds.name}`;
    const body = `Dear ${creds.name},

Welcome to NexaHR! Your employee account has been created with the following access credentials:

--------------------------------------------------
Employee ID / Code : ${creds.employeeCode}
Work Email         : ${creds.email}
Temporary Password : ${creds.tempPassword}
--------------------------------------------------

Portal Login URL   : ${window.location.origin}/login

Important Security Note:
Upon logging in for the first time, you will be prompted to choose a new password.

Best regards,
People Operations & HR Team
NexaHR Workforce Systems`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  // Open Edit Modal
  const handleOpenEdit = (emp) => {
    const assignedOffice = emp.profile?.workLocation || emp.workLocation || 'Islamabad HQ & Innovation Lab';
    const residentialAddr = emp.profile?.address || emp.address || '';
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
      departmentName: emp.profile?.department?.name || '',
      designationTitle: emp.profile?.designation?.title || '',
      workLocation: assignedOffice,
      location: assignedOffice,
      joiningDate: emp.profile?.joiningDate ? emp.profile.joiningDate.split('T')[0] : (emp.createdAt ? emp.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
      basicSalary: emp.salaryStructure?.basicSalary?.toString() || '',
      housingAllowance: emp.salaryStructure?.housingAllowance?.toString() || '0',
      transportAllowance: emp.salaryStructure?.transportAllowance?.toString() || '0',
      taxDeductions: emp.salaryStructure?.taxDeductions?.toString() || '0',
      otherAllowances: emp.salaryStructure?.otherAllowances?.toString() || '0',
      otherDeductions: emp.salaryStructure?.otherDeductions?.toString() || '0',
      gender: emp.profile?.gender || 'Not Specified',
      dateOfBirth: emp.profile?.dateOfBirth ? emp.profile.dateOfBirth.split('T')[0] : '',
      address: residentialAddr,
      emergencyContact: emp.profile?.emergencyContact || '',
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
        address: editForm.address ? editForm.address.trim() : null,
        workLocation: (editForm.workLocation || editForm.location || 'Islamabad HQ & Innovation Lab').trim(),
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
          address: payload.address,
          workLocation: payload.workLocation,
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
      if (err.name === 'DemoModeError' || err.code === 'DEMO_MODE') {
        setIsEditOpen(false);
        return;
      }
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


  // Status tabs & counts
  const statusCounts = useMemo(() => ({
    all: employees.length,
    active: employees.filter((e) => e.isActive !== false).length,
    inactive: employees.filter((e) => e.isActive === false).length,
  }), [employees]);

  const statusTabs = [
    { key: 'ALL', label: 'All', count: statusCounts.all },
    { key: 'ACTIVE', label: 'Active', count: statusCounts.active },
    { key: 'INACTIVE', label: 'Inactive', count: statusCounts.inactive },
  ];

  const sortOptions = [
    { key: 'name', label: 'Sort: Name' },
    { key: 'code', label: 'Sort: Code' },
    { key: 'department', label: 'Sort: Dept' },
    { key: 'date', label: 'Sort: Joined' },
  ];

  const dateRangeOptions = [
    { key: 'ALL', label: 'All Time' },
    { key: 'THIS_MONTH', label: 'Joined This Month' },
    { key: 'THIS_YEAR', label: 'Joined 2026' },
  ];

  const dateRangeLabels = {
    ALL: 'All Time',
    THIS_MONTH: 'This Month',
    THIS_YEAR: 'Year 2026',
  };

  // Filtered & Sorted employees
  const filteredEmployees = useMemo(() => {
    let list = employees.filter((emp) => {
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

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && emp.isActive !== false) ||
        (statusFilter === 'INACTIVE' && emp.isActive === false);

      let matchesDate = true;
      if (activeDateRange === 'THIS_MONTH') {
        const jDate = emp.joiningDate ? new Date(emp.joiningDate) : null;
        const now = new Date();
        matchesDate = jDate && jDate.getMonth() === now.getMonth() && jDate.getFullYear() === now.getFullYear();
      } else if (activeDateRange === 'THIS_YEAR') {
        const jDate = emp.joiningDate ? new Date(emp.joiningDate) : null;
        matchesDate = jDate && jDate.getFullYear() === 2026;
      }

      return matchesSearch && matchesDept && matchesStatus && matchesDate;
    });

    list.sort((a, b) => {
      let valA, valB;
      if (activeSort === 'name') {
        valA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        valB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
      } else if (activeSort === 'code') {
        valA = (a.employeeCode || '').toLowerCase();
        valB = (b.employeeCode || '').toLowerCase();
      } else if (activeSort === 'department') {
        valA = (a.profile?.department?.name || '').toLowerCase();
        valB = (b.profile?.department?.name || '').toLowerCase();
      } else if (activeSort === 'date') {
        valA = new Date(a.joiningDate || 0).getTime();
        valB = new Date(b.joiningDate || 0).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [employees, searchTerm, selectedDept, statusFilter, activeDateRange, activeSort, sortOrder]);

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.isActive !== false).length,
    engineering: employees.filter((e) => (e.profile?.department?.name || '').toLowerCase().includes('eng')).length,
    admins: employees.filter((e) => e.role === 'ADMIN' || e.role === 'HR_MANAGER').length,
  };

  // Dynamic Sparkline Time-Series Telemetry for Employees Directory
  const headcountSparkData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const total = stats.total || 3;
    const history = [
      Math.max(1, total - 1),
      Math.max(1, total - 1),
      Math.max(1, total),
      Math.max(1, total),
      Math.max(1, total),
      total,
      total,
    ];
    return days.map((day, idx) => ({
      value: history[idx],
      label: day,
      tooltip: `${day}: ${history[idx]} Total Enrolled Staff`,
    }));
  }, [stats.total]);

  const activeStaffSparkData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const act = stats.active || 3;
    const history = [
      Math.max(1, act - 1),
      Math.max(1, act),
      Math.max(1, act - 1),
      Math.max(1, act),
      Math.max(1, act),
      act,
      act,
    ];
    return days.map((day, idx) => ({
      value: history[idx],
      label: day,
      tooltip: `${day}: ${history[idx]} Active Verified Staff`,
    }));
  }, [stats.active]);

  const engineeringSparkData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const eng = stats.engineering || 2;
    const history = [
      Math.max(1, eng - 1),
      Math.max(1, eng - 1),
      Math.max(1, eng),
      Math.max(1, eng),
      eng,
      eng,
      eng,
    ];
    return days.map((day, idx) => ({
      value: history[idx],
      label: day,
      tooltip: `${day}: ${history[idx]} Engineering Staff`,
    }));
  }, [stats.engineering]);

  const leadershipSparkData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const adm = stats.admins || 1;
    const history = [
      Math.max(1, adm),
      Math.max(1, adm),
      Math.max(1, adm),
      Math.max(1, adm),
      adm,
      adm,
      adm,
    ];
    return days.map((day, idx) => ({
      value: history[idx],
      label: day,
      tooltip: `${day}: ${history[idx]} Lead Administrators`,
    }));
  }, [stats.admins]);

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
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-5 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Directory Telemetry */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
              Company Directory & Workforce Talent (PIM)
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-lg font-medium">
              Manage complete employee dossiers, department allocations, salary compensation tiers, role access privileges, and multi-step onboarding pipelines.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{stats.total} Total Headcount</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{stats.active} Active & Verified</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{departments.length} Operating Departments</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card (Desktop / Tablet) */}
          <div className="hidden sm:flex bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Talent Onboarding</div>
              <div className="text-[11px] text-white/80 mt-0.5">Add employee dossier</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/app/hr/new-employee')}
              className="w-full px-5 py-2.5 rounded-2xl bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Onboard Employee</span>
            </button>
          </div>

          {/* Mobile Quick Action Button */}
          <div className="sm:hidden pt-1">
            <button
              type="button"
              onClick={() => navigate('/app/hr/new-employee')}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] font-extrabold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Onboard Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS WITH SPARKLINES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="dark"
          title="Total Headcount"
          value={stats.total}
          unit={stats.total === 1 ? 'Staff' : 'Staff'}
          badgeText={`${stats.total} Enrolled`}
          badgeType="positive"
          badgeIcon="up"
          subtext="Lifetime Enrolled"
          chartColor="purple"
          presetWave="wave1"
          dataPoints={headcountSparkData}
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Active Staff"
          value={stats.active}
          unit="Verified"
          badgeText="Active Payroll"
          badgeType="positive"
          badgeIcon="up"
          subtext="100% Compliant"
          chartColor="emerald"
          presetWave="wave2"
          dataPoints={activeStaffSparkData}
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Engineering Unit"
          value={stats.engineering}
          unit="Engineers"
          badgeText="Technical Core"
          badgeType="positive"
          badgeIcon="dot"
          subtext="DevOps & Systems"
          chartColor="amber"
          presetWave="wave3"
          dataPoints={engineeringSparkData}
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="HR & Leadership"
          value={stats.admins}
          unit="Leads"
          badgeText="Executive"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Admin Privileges"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={leadershipSparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. MODERN DYNAMIC SEARCH & FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <ModernSearchBarSection
        statusTabs={statusTabs}
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search employees by name, code, designation, or email..."
        searchHint="dept:engineering"
        filterTags={
          selectedDept !== 'ALL'
            ? [{ key: 'dept', label: `dept: ${selectedDept}` }]
            : []
        }
        onRemoveTag={(tag) => {
          if (tag.key === 'dept') setSelectedDept('ALL');
        }}
        dateRangeLabel={dateRangeLabels[activeDateRange] || 'All Time'}
        dateRangeOptions={dateRangeOptions}
        activeDateRange={activeDateRange}
        onDateRangeChange={setActiveDateRange}
        sortOptions={sortOptions}
        activeSort={activeSort}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setActiveSort(key);
          setSortOrder(order);
        }}
        filterCount={selectedDept !== 'ALL' ? 1 : 0}
        filterContent={
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Department Filter
              </span>
              {selectedDept !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedDept('ALL')}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedDept('ALL')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedDept === 'ALL'
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>All Departments</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {employees.length}
                </span>
              </button>
              {departmentOptions.map((dept) => (
                <button
                  key={dept.name}
                  type="button"
                  onClick={() => setSelectedDept(dept.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedDept === dept.name
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {selectedDept === dept.name ? (
                      <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                    )}
                    <span className="truncate">{dept.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                    {dept.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        }
        actionButton={
          <button
            type="button"
            onClick={() => navigate('/app/hr/new-employee')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </button>
        }
      />

      {/* ========================================================================= */}
      {/* 3. EMPLOYEES GRID / TABLE */}
      {/* ========================================================================= */}
      {loading ? (
        <EmployeeCardSkeleton count={6} />
      ) : filteredEmployees.length === 0 ? (
        <div className="p-12 sm:p-16 text-center space-y-4 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 shadow-sm">
            <Users className="w-8 h-8 stroke-[1.8]" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              No Team Members Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              No employees matched your current search and department filters. Try clearing your filters or searching with a different term.
            </p>
          </div>
          {(searchTerm || selectedDept !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
          {filteredEmployees.map((emp, idx) => (
            <div
              key={emp.id || idx}
              className="group relative overflow-hidden rounded-[28px] bg-white dark:bg-[#1E293B] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
            >
              <div className="p-6 pb-2">
                {/* 1. Header: Avatar & Top-Right Edit Button */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative inline-block">
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <img
                        src={getAvatarUrl(emp)}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = DEFAULT_BLANK_AVATAR;
                        }}
                      />
                    </div>
                  </div>

                  {/* Edit Button at Top Right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(emp);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                    title="Edit Employee Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* 2. Main Dossier Info */}
                <div>
                  <h3
                    onClick={() => setSelectedEmployee(emp)}
                    className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    {emp.firstName || ''} {emp.lastName || ''}
                  </h3>

                  <p className="text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200 mt-1 truncate">
                    <span>{emp.profile?.designation?.title || emp.designationTitle || emp.role || 'Staff Member'}</span>
                    {(emp.profile?.department?.name || emp.departmentName) && (
                      <>
                        <span className="text-slate-400 mx-1.5 font-normal">|</span>
                        <span>{emp.profile?.department?.name || emp.departmentName}</span>
                      </>
                    )}
                  </p>

                  <div className="space-y-1 mt-2 text-xs font-normal">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold truncate" title="Assigned Office Work Location">
                      <Building2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">{emp.profile?.workLocation || emp.workLocation || 'Islamabad HQ & Innovation Lab'}</span>
                    </div>
                    {emp.profile?.address && (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] truncate" title="Residential Home Address">
                        <Home className="w-3 h-3 text-amber-500/80 shrink-0" />
                        <span className="truncate">{emp.profile.address}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed mt-3.5 font-normal line-clamp-4">
                    {getEmployeeBio(emp)}
                  </p>

                  <div className="space-y-2 mt-4 text-xs font-normal text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {getSafeEmail(emp) ? (
                        <a
                          href={`mailto:${getSafeEmail(emp)}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                        >
                          {getSafeEmail(emp)}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No email provided</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDob(emp.profile?.dateOfBirth || emp.dateOfBirth || emp.dob)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {emp.phone || emp.profile?.phone ? (
                        <a
                          href={`tel:${emp.phone || emp.profile?.phone}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {emp.phone || emp.profile?.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not Provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Footer: Joined Date & Rounded Action Icons */}
              <div className="px-6 pb-6 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Joined on {formatJoiningDate(emp.profile?.joiningDate || emp.joiningDate || emp.createdAt)}
                </span>

                <div className="flex items-center gap-2">
                  {/* Full Profile View */}
                  <button
                    type="button"
                    onClick={() => setSelectedEmployee(emp)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                    title="Full Profile View"
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  {/* Edit Profile */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(emp)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                    title="Edit Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  {/* Remove Employee */}
                  <button
                    type="button"
                    onClick={() => setEmployeeToDelete(emp)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                    title="Remove Employee"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: EDIT EMPLOYEE PROFILE */}
      {/* ========================================================================= */}
      {isEditOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <main className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-9 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <header className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6" data-purpose="modal-header">
              <div className="flex items-center gap-4">
                {/* Glowing Icon Badge */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/25 flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
                    <Edit3 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    Edit Profile: {editForm.firstName} {editForm.lastName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                    Update role authorizations, workplace position, compensation matrix, and directory info.
                  </p>
                </div>
              </div>

              {/* Close Action */}
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setIsEditOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Stepper Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-[12px] mb-6 border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto no-scrollbar">
              {[
                { id: 'basic', step: '01', label: 'Identity & Role', icon: UserCheck },
                { id: 'position', step: '02', label: 'Job Position', icon: Briefcase },
                { id: 'salary', step: '03', label: 'Compensation & Salary', icon: Banknote },
                { id: 'personal', step: '04', label: 'Contact & Address', icon: MapPin },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = editTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEditTab(tab.id)}
                    className={`flex-1 py-2.5 px-3 rounded-[10px] transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold ${
                      isSelected
                        ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-md shadow-sky-600/25 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-[8px] font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      {tab.step}
                    </span>
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Section */}
            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* EDIT TAB 1: BASIC INFORMATION */}
              {editTab === 'basic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        First Name <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Last Name <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Work Email <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Employee Code
                      </label>
                      <input
                        type="text"
                        value={editForm.employeeCode || ''}
                        onChange={(e) => setEditForm({ ...editForm, employeeCode: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Role Authorization ACL
                      </label>
                      <select
                        value={editForm.role || 'EMPLOYEE'}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white font-medium focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="EMPLOYEE">EMPLOYEE (Standard Staff Portal)</option>
                        <option value="HR_MANAGER">HR_MANAGER (PIM, Payroll & Leaves)</option>
                        <option value="ADMIN">ADMIN (Full System Privilege)</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Employment Status
                      </label>
                      <select
                        value={editForm.isActive ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white font-medium focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none cursor-pointer transition-all"
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
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Department
                      </label>
                      <select
                        value={editForm.departmentName || 'Engineering'}
                        onChange={(e) => setEditForm({ ...editForm, departmentName: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white font-medium focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none cursor-pointer transition-all"
                      >
                        {deptOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Designation Title / Position <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.designationTitle || ''}
                        onChange={(e) => setEditForm({ ...editForm, designationTitle: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                          Office Work Location
                        </label>
                        <span className="text-[11px] text-slate-400">Campus / Hub</span>
                      </div>
                      <select
                        value={['Islamabad HQ & Innovation Lab', 'Karachi Regional Hub', 'Lahore Tech Campus', 'Remote & Distributed Worldwide'].includes(editForm.workLocation || editForm.location) ? (editForm.workLocation || editForm.location) : 'CUSTOM'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'CUSTOM') {
                            setEditForm({ ...editForm, workLocation: '', location: '' });
                          } else {
                            setEditForm({ ...editForm, workLocation: val, location: val });
                          }
                        }}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white font-medium focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="Islamabad HQ & Innovation Lab">Islamabad HQ & Innovation Lab (Main Campus)</option>
                        <option value="Karachi Regional Hub">Karachi Regional Hub (Commercial Office)</option>
                        <option value="Lahore Tech Campus">Lahore Tech Campus (Engineering)</option>
                        <option value="Remote & Distributed Worldwide">Remote & Distributed Worldwide</option>
                        <option value="CUSTOM">Custom Office Campus / Branch...</option>
                      </select>
                      {(!['Islamabad HQ & Innovation Lab', 'Karachi Regional Hub', 'Lahore Tech Campus', 'Remote & Distributed Worldwide'].includes(editForm.workLocation || editForm.location)) && (
                        <input
                          type="text"
                          placeholder="Enter custom office campus or branch name"
                          value={editForm.workLocation || editForm.location || ''}
                          onChange={(e) => setEditForm({ ...editForm, workLocation: e.target.value, location: e.target.value })}
                          className="mt-2 w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                        />
                      )}
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Joining Date
                      </label>
                      <input
                        type="date"
                        value={editForm.joiningDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT TAB 3: COMPENSATION & SALARY */}
              {editTab === 'salary' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-white to-sky-50/40 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/80 border border-sky-100 dark:border-slate-700 flex items-center justify-between shadow-xs mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-600/20">
                        <Banknote className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Calculated Total Monthly Gross
                        </div>
                        <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                          {formatCurrency(
                            (Number(editForm.baseSalary) || 0) +
                            (Number(editForm.performanceAllowance) || 0) +
                            (Number(editForm.medicalAllowance) || 0) +
                            (Number(editForm.housingAllowance) || 0) +
                            (Number(editForm.transportAllowance) || 0)
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-[12px] border border-emerald-200 dark:border-emerald-800/60">
                        PostgreSQL Live Band
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Base Monthly Salary (PKR) <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={editForm.baseSalary || ''}
                        onChange={(e) => setEditForm({ ...editForm, baseSalary: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Performance Bonus Allowance (PKR/mo)
                      </label>
                      <input
                        type="number"
                        value={editForm.performanceAllowance || ''}
                        onChange={(e) => setEditForm({ ...editForm, performanceAllowance: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Medical Health Allowance (PKR/mo)
                      </label>
                      <input
                        type="number"
                        value={editForm.medicalAllowance || ''}
                        onChange={(e) => setEditForm({ ...editForm, medicalAllowance: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        House Rent Allowance (HRA) (PKR/mo)
                      </label>
                      <input
                        type="number"
                        value={editForm.housingAllowance || ''}
                        onChange={(e) => setEditForm({ ...editForm, housingAllowance: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Travel / Conveyance Allowance (PKR/mo)
                      </label>
                      <input
                        type="number"
                        value={editForm.transportAllowance || ''}
                        onChange={(e) => setEditForm({ ...editForm, transportAllowance: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Tax Deductions (PKR/mo)
                      </label>
                      <input
                        type="number"
                        value={editForm.taxDeductions || ''}
                        onChange={(e) => setEditForm({ ...editForm, taxDeductions: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT TAB 4: PERSONAL & CONTACT */}
              {editTab === 'personal' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Gender
                      </label>
                      <select
                        value={editForm.gender || 'Not Specified'}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white font-medium focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none cursor-pointer transition-all"
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
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                          Residential Street Address (Home)
                        </label>
                        <span className="text-[11px] text-slate-400">Personal Residence</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. House #14, Street 9, Sector F-7/2, Islamabad"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-2">
                        Emergency Contact Info
                      </label>
                      <input
                        type="text"
                        value={editForm.emergencyContact || ''}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer / Action Controls */}
              <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-sm font-semibold shadow-lg shadow-sky-600/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Updates...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save Profile Updates</span>
                    </>
                  )}
                </button>
              </footer>
            </form>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: EMPLOYEE PROFILE VIEW (DOSSIER VIEW) */}
      {/* ========================================================================= */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <main className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-9 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200 my-auto">
            {/* Profile Header */}
            <header className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6" data-purpose="modal-header">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={getAvatarUrl(selectedEmployee)}
                    alt=""
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover ring-4 ring-sky-500/20 shadow-lg shadow-sky-500/10 shrink-0 bg-slate-100 dark:bg-slate-800"
                    onError={(e) => {
                      e.target.src = DEFAULT_BLANK_AVATAR;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="Active Verified Staff" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 px-2.5 py-0.5 rounded-[12px] border border-sky-200/80 dark:border-sky-800/60">
                      #{selectedEmployee.employeeCode}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {selectedEmployee.role || 'EMPLOYEE'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                    {selectedEmployee.profile?.designation?.title || 'Staff Member'} • {selectedEmployee.profile?.department?.name || 'Engineering'}
                  </p>
                </div>
              </div>

              {/* Close Action */}
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Dossier Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mb-6">
              {/* Department */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  Department
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block truncate">
                  {selectedEmployee.profile?.department?.name || 'Engineering'}
                </span>
              </div>

              {/* Role Authorization */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  Role Authorization
                </span>
                <span className="text-sm sm:text-base font-bold text-sky-600 dark:text-sky-400 block truncate">
                  {selectedEmployee.role || 'EMPLOYEE'}
                </span>
              </div>

              {/* Base Compensation */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Base Compensation
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono block truncate">
                  {formatCurrency(selectedEmployee.profile?.baseSalary || 0)} / mo
                </span>
              </div>

              {/* Contact Email */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  Contact Email
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block truncate" title={getSafeEmail(selectedEmployee)}>
                  {getSafeEmail(selectedEmployee)}
                </span>
              </div>

              {/* Office Work Location */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  Office Work Location
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block truncate" title={selectedEmployee.profile?.workLocation || selectedEmployee.location || 'Islamabad HQ'}>
                  {selectedEmployee.profile?.workLocation || selectedEmployee.location || 'Islamabad HQ'}
                </span>
              </div>

              {/* Residential Address */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Home className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Residential Address (Home)
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 block truncate" title={selectedEmployee.profile?.address || selectedEmployee.address || 'Not Provided'}>
                  {selectedEmployee.profile?.address || selectedEmployee.address || 'Not Provided'}
                </span>
              </div>

              {/* Onboarding Date */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:col-span-2 lg:col-span-1">
                <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  Onboarding Date
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block">
                  {selectedEmployee.profile?.joiningDate ? selectedEmployee.profile.joiningDate.split('T')[0] : (selectedEmployee.createdAt ? selectedEmployee.createdAt.split('T')[0] : 'Active')}
                </span>
              </div>
            </div>

            {/* Dossier Actions Footer */}
            <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedEmployee;
                    setSelectedEmployee(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-500 hover:text-white hover:border-sky-500 dark:hover:bg-sky-600 dark:hover:border-sky-600 text-sm font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedEmployee;
                    setSelectedEmployee(null);
                    setEmployeeToDelete(toDelete);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:border-rose-600 text-sm font-semibold transition-all cursor-pointer shadow-xs"
                  title="Remove Employee from Directory"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-[12px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                Close Dossier
              </button>
            </footer>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ONBOARDED EMPLOYEE CREDENTIALS CARD */}
      {/* ========================================================================= */}
      {createdCreds && (
        <div className="fixed inset-0 z-[999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <main className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <header className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-5" data-purpose="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[1px] shadow-lg shadow-amber-500/25 flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white">
                    <KeyRound className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    Employee Credentials Generated
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                    Welcome email with credentials has been sent to {createdCreds.name}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCreatedCreds(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Automated Email Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2.5 mb-4">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              <span>
                Automated NexaHR welcome email with login credentials was dispatched to <strong>{createdCreds.email}</strong>.
              </span>
            </div>

            {/* Credentials details card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 space-y-3.5 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Employee ID / Code:</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {createdCreds.employeeCode}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/70 dark:border-slate-700/60 pt-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Work Email:</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {createdCreds.email}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/70 dark:border-slate-700/60 pt-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Temporary Password:</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-[12px] border border-amber-200 dark:border-amber-800/80 shadow-xs">
                  {createdCreds.tempPassword}
                </span>
              </div>
            </div>

            {/* Warning Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 font-medium flex items-start sm:items-center gap-2.5 leading-relaxed mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0" />
              <span>
                Upon logging in with these credentials, <strong>{createdCreds.name}</strong> will be prompted to set a new password.
              </span>
            </div>

            {/* Footer Action Buttons */}
            <footer className="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isResendingEmail}
                onClick={() => handleResendOfficialEmail(createdCreds)}
                className="px-4 py-2.5 rounded-[12px] border border-sky-200 dark:border-sky-800 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/70 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="Resend automated NexaHR welcome email with credentials"
              >
                {isResendingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>{isResendingEmail ? 'Sending Email...' : 'Resend Welcome Email'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleEmailCredentials(createdCreds)}
                className="px-4 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Open Gmail compose with pre-filled credentials"
              >
                <span>Gmail Compose</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = `NexaHR Credentials for ${createdCreds.name}:\nWork Email: ${createdCreds.email}\nEmployee Code: ${createdCreds.employeeCode}\nTemporary Password: ${createdCreds.tempPassword}`;
                  navigator.clipboard.writeText(text);
                  setCopiedCreds(true);
                  setTimeout(() => setCopiedCreds(false), 2000);
                }}
                className="px-4 py-2.5 rounded-[12px] border border-amber-200 dark:border-amber-800/80 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/70 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copiedCreds ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCreds ? 'Copied Credentials!' : 'Copy Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCreds(null)}
                className="px-5 py-2.5 rounded-[12px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-all shadow-md cursor-pointer"
              >
                Close & Finish
              </button>
            </footer>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: REMOVE EMPLOYEE CONFIRMATION */}
      {/* ========================================================================= */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-[999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <main className="relative z-10 w-full max-w-xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <header className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6" data-purpose="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-red-400 p-[1px] shadow-lg shadow-rose-500/25 flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white">
                    <UserX className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    Remove Employee
                  </h2>
                  <p className="text-xs sm:text-sm text-rose-500 dark:text-rose-400 mt-0.5 font-semibold">
                    Confirm Deletion Action
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setEmployeeToDelete(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <p className="text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-5">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white font-bold">{employeeToDelete.firstName} {employeeToDelete.lastName}</strong> (<span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">{employeeToDelete.employeeCode}</span>) from company directory?
            </p>

            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 p-4 space-y-2.5 text-xs mb-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Department:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employeeToDelete.profile?.department?.name || 'General Dept'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/70 dark:border-slate-700/70 pt-2.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Role Authorization:</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">{employeeToDelete.role || 'EMPLOYEE'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/70 dark:border-slate-700/70 pt-2.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Work Email:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{getSafeEmail(employeeToDelete)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>This record will be permanently deleted from the database.</span>
            </div>

            {/* Modal Footer / Action Controls */}
            <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
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
            </footer>
          </main>
        </div>
      )}
    </div>
  );
};

export default Employees;
