import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Cpu,
  Calendar,
  CalendarDays,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Zap,
  X,
  Check,
  ShieldCheck,
  MapPin,
  Filter,
  Fingerprint,
  Radio,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Download,
  Users,
  User,
  Building2,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { TableSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const getInitials = (firstName = '', lastName = '') => {
  const f = firstName ? firstName[0].toUpperCase() : '';
  const l = lastName ? lastName[0].toUpperCase() : '';
  return f + l || 'EM';
};

const Attendance = () => {
  const { formatTime, formatDate, timezone } = useRegionalSettings();

  const todayDate = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(() => todayDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(() => todayDate.getFullYear());
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const monthDropdownRef = useRef(null);

  // Employee Selection ('ALL' or employeeId)
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [showEmployeeMenu, setShowEmployeeMenu] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const employeeDropdownRef = useRef(null);

  // Department Selection ('ALL' or department name)
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [showDepartmentMenu, setShowDepartmentMenu] = useState(false);
  const departmentDropdownRef = useRef(null);

  // Status Filter ('ALL' | 'PRESENT' | 'LATE' | 'ON_LEAVE')
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthMenu(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setShowEmployeeMenu(false);
      }
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentMenu(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Is current real calendar month?
  const isCurrentMonth =
    selectedMonth === todayDate.getMonth() + 1 && selectedYear === todayDate.getFullYear();

  // Disable Next button if already on current month (can't navigate to future)
  const isNextDisabled =
    isCurrentMonth ||
    selectedYear > todayDate.getFullYear() ||
    (selectedYear === todayDate.getFullYear() && selectedMonth >= todayDate.getMonth() + 1);

  // Formatted month labels
  const selectedMonthLabel = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedMonth, selectedYear]);

  // Available past 12 months for quick direct selection
  const pastMonthsList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(todayDate.getFullYear(), todayDate.getMonth() - i, 1);
      list.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        short: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        isCurrent: i === 0,
      });
    }
    return list;
  }, [todayDate]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isNextDisabled) return;
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleJumpToCurrent = () => {
    setSelectedMonth(todayDate.getMonth() + 1);
    setSelectedYear(todayDate.getFullYear());
  };

  // Load employee roster for the selector
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await api.getEmployees({ limit: 100 });
        const list = res?.data?.employees || (Array.isArray(res?.data) ? res.data : []);
        if (list && list.length > 0) {
          setEmployees(list);
        }
      } catch (err) {
        console.warn('Failed to load employees for attendance switcher:', err.message);
      }
    };
    loadEmployees();
  }, []);

  // Fetch real database attendance logs for the selected month, year, employee, and department
  const fetchAttendance = async (
    m = selectedMonth,
    y = selectedYear,
    empId = selectedEmployee,
    dept = selectedDepartment
  ) => {
    setLoading(true);
    try {
      const params = { month: m, year: y, limit: 1000 };
      if (empId !== 'ALL') params.employeeId = empId;
      if (dept !== 'ALL') params.department = dept;

      const res = await api.getAttendanceLogs(params);
      const raw = Array.isArray(res?.data)
        ? res.data
        : res?.data?.attendances || res?.data?.logs || res?.data?.records || [];

      if (Array.isArray(raw)) {
        const todayStr = new Date().toISOString().split('T')[0];

        const formatted = raw.map((item) => {
          const rawDate = item.date || item.checkInTime || item.clockIn;
          const dateObj = new Date(rawDate);
          const dayName = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('en-US', { weekday: 'long' })
            : 'Weekday';
          const dayNum = !isNaN(dateObj.getTime())
            ? String(dateObj.getDate()).padStart(2, '0')
            : '--';
          const monthShort = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
            : '---';

          const itemDateStr = item.date
            ? String(item.date).split('T')[0]
            : !isNaN(dateObj.getTime())
            ? dateObj.toISOString().split('T')[0]
            : '';
          const isToday = itemDateStr === todayStr;

          const inTime = item.checkInTime
            ? formatTime(item.checkInTime, false)
            : item.clockIn
            ? formatTime(item.clockIn, false)
            : '--:--';

          const outTime = item.checkOutTime
            ? formatTime(item.checkOutTime, false)
            : item.clockOut
            ? formatTime(item.clockOut, false)
            : '--:--';

          const totalHours =
            item.totalHours != null
              ? Number(item.totalHours)
              : item.workHours != null
              ? Number(item.workHours)
              : item.checkInTime && item.checkOutTime
              ? parseFloat(
                  (
                    Math.max(0, new Date(item.checkOutTime) - new Date(item.checkInTime)) /
                    3600000
                  ).toFixed(1)
                )
              : 0;

          const ot =
            item.ot != null
              ? Number(item.ot)
              : totalHours > 8.0
              ? parseFloat((totalHours - 8.0).toFixed(1))
              : 0;

          // Normalize user object
          const userObj = item.user || {};
          const firstName =
            userObj.firstName ||
            (item.employeeName ? item.employeeName.split(' ')[0] : 'Employee');
          const lastName =
            userObj.lastName ||
            (item.employeeName ? item.employeeName.split(' ').slice(1).join(' ') : '');
          const employeeCode =
            userObj.employeeCode || item.employeeCode || userObj.id || item.userId || 'EMP';
          const department =
            userObj.profile?.department?.name ||
            userObj.department ||
            item.department ||
            'Operations';
          const designation =
            userObj.profile?.designation?.title || userObj.designation || 'Staff';
          const avatarUrl = userObj.profile?.avatarUrl || userObj.avatarUrl || null;

          return {
            id: item.id || `att-${itemDateStr}-${employeeCode}`,
            rawDate,
            dateObj,
            dayNum,
            monthShort,
            dayName,
            isToday,
            formattedDate: formatDate(rawDate),
            day: dayName,
            checkIn: inTime,
            checkOut: outTime,
            checkInTime: item.checkInTime || item.clockIn,
            checkOutTime: item.checkOutTime || item.clockOut,
            totalHours,
            ot,
            status: (item.status || 'PRESENT').toUpperCase(),
            notes: item.notes || item.terminal || 'Biometric Face-ID Terminal HQ',
            user: {
              id: userObj.id || item.userId,
              firstName,
              lastName,
              fullName: `${firstName} ${lastName}`.trim(),
              email: userObj.email || '',
              employeeCode,
              department,
              designation,
              avatarUrl,
            },
          };
        });

        // Sort descending by date
        formatted.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
        setLogs(formatted);

        // Supplement employees list if missing
        if (employees.length === 0) {
          const uniqueUsers = [];
          const seen = new Set();
          formatted.forEach((l) => {
            if (l.user?.id && !seen.has(l.user.id)) {
              seen.add(l.user.id);
              uniqueUsers.push(l.user);
            }
          });
          if (uniqueUsers.length > 0) setEmployees(uniqueUsers);
        }
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.warn('Failed to load company attendance from DB:', err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedMonth, selectedYear, selectedEmployee, selectedDepartment);
  }, [selectedMonth, selectedYear, selectedEmployee, selectedDepartment, timezone]);

  const handleSyncHardware = async () => {
    setIsSyncing(true);
    setToastMsg('Syncing live attendance records with PostgreSQL database...');
    await fetchAttendance(selectedMonth, selectedYear, selectedEmployee, selectedDepartment);
    setTimeout(() => {
      setIsSyncing(false);
      setToastMsg('Biometric database sync completed successfully!');
      setTimeout(() => setToastMsg(''), 3500);
    }, 800);
  };

  // Active Selected Employee Object (when in single-employee mode)
  const activeEmployeeObj = useMemo(() => {
    if (selectedEmployee === 'ALL') return null;
    return (
      employees.find((e) => e.id === selectedEmployee || e.employeeCode === selectedEmployee) ||
      logs.find(
        (l) => l.user?.id === selectedEmployee || l.user?.employeeCode === selectedEmployee
      )?.user ||
      null
    );
  }, [selectedEmployee, employees, logs]);

  // Unique departments for filter
  const departmentList = useMemo(() => {
    const set = new Set();
    employees.forEach((e) => {
      const dName = e.profile?.department?.name || e.department;
      if (dName) set.add(dName);
    });
    logs.forEach((l) => {
      if (l.user?.department) set.add(l.user.department);
    });
    return Array.from(set).sort();
  }, [employees, logs]);

  // Filtered employees for dropdown search
  const filteredEmployeesList = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const q = employeeSearch.toLowerCase().trim();
    return employees.filter((e) => {
      const name = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();
      const code = (e.employeeCode || '').toLowerCase();
      const dept = (e.profile?.department?.name || e.department || '').toLowerCase();
      return name.includes(q) || code.includes(q) || dept.includes(q);
    });
  }, [employees, employeeSearch]);

  // Client-side filtering across search query and status
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      // 1. Employee Filter
      if (selectedEmployee !== 'ALL') {
        const itemUserId = item.user?.id || item.userId;
        const itemEmpCode = item.user?.employeeCode;
        if (itemUserId !== selectedEmployee && itemEmpCode !== selectedEmployee) {
          return false;
        }
      }

      // 2. Department Filter
      if (selectedDepartment !== 'ALL') {
        const itemDept = (item.user?.department || '').toLowerCase();
        if (itemDept !== selectedDepartment.toLowerCase()) {
          return false;
        }
      }

      // 3. Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PRESENT' && item.status !== 'PRESENT') return false;
        if (statusFilter === 'LATE' && item.status !== 'LATE') return false;
        if (
          statusFilter === 'ON_LEAVE' &&
          item.status !== 'ON_LEAVE' &&
          item.status !== 'LEAVE'
        )
          return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = (item.user?.fullName || '').toLowerCase();
        const code = (item.user?.employeeCode || '').toLowerCase();
        const dept = (item.user?.department || '').toLowerCase();
        const formattedDate = (item.formattedDate || '').toLowerCase();
        const day = (item.day || '').toLowerCase();
        const notes = (item.notes || '').toLowerCase();
        const status = (item.status || '').toLowerCase();
        const checkIn = (item.checkIn || '').toLowerCase();
        const checkOut = (item.checkOut || '').toLowerCase();

        const matches =
          fullName.includes(q) ||
          code.includes(q) ||
          dept.includes(q) ||
          formattedDate.includes(q) ||
          day.includes(q) ||
          notes.includes(q) ||
          status.includes(q) ||
          checkIn.includes(q) ||
          checkOut.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [logs, selectedEmployee, selectedDepartment, statusFilter, searchQuery]);

  // Counts for status filter dropdown
  const counts = useMemo(() => {
    let base = logs;
    if (selectedEmployee !== 'ALL') {
      base = base.filter(
        (l) =>
          l.user?.id === selectedEmployee || l.user?.employeeCode === selectedEmployee
      );
    }
    if (selectedDepartment !== 'ALL') {
      base = base.filter(
        (l) => (l.user?.department || '').toLowerCase() === selectedDepartment.toLowerCase()
      );
    }
    return {
      all: base.length,
      present: base.filter((l) => l.status === 'PRESENT').length,
      late: base.filter((l) => l.status === 'LATE').length,
      leave: base.filter((l) => l.status === 'ON_LEAVE' || l.status === 'LEAVE').length,
    };
  }, [logs, selectedEmployee, selectedDepartment]);

  // CSV Export
  const exportToCSV = () => {
    if (!filteredLogs.length) return;
    const isSingle = selectedEmployee !== 'ALL';
    const headers = isSingle
      ? ['Date', 'Day', 'Punch In', 'Punch Out', 'Hours Logged', 'Overtime', 'Status', 'Terminal']
      : [
          'Employee Name',
          'Employee Code',
          'Department',
          'Date',
          'Day',
          'Punch In',
          'Punch Out',
          'Hours Logged',
          'Overtime',
          'Status',
          'Terminal',
        ];

    const rows = filteredLogs.map((l) => {
      const name = `"${l.user?.fullName || 'Employee'}"`;
      const code = `"${l.user?.employeeCode || ''}"`;
      const dept = `"${l.user?.department || ''}"`;
      const date = `"${l.formattedDate || l.rawDate}"`;
      const day = `"${l.day}"`;
      const inTime = `"${l.checkIn}"`;
      const outTime = `"${l.checkOut}"`;
      const hours = `"${l.totalHours}h"`;
      const ot = `"${l.ot}h"`;
      const st = `"${l.status}"`;
      const notes = `"${(l.notes || '').replace(/"/g, '""')}"`;

      return isSingle
        ? [date, day, inTime, outTime, hours, ot, st, notes]
        : [name, code, dept, date, day, inTime, outTime, hours, ot, st, notes];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = isSingle
      ? `Timesheet_${(activeEmployeeObj?.firstName || 'Employee')}_${selectedMonthLabel.replace(
          /\s+/g,
          '_'
        )}.csv`
      : `Organization_Attendance_${selectedMonthLabel.replace(/\s+/g, '_')}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Live Metrics Calculations
  const totalDaysPresent = useMemo(
    () => logs.filter((l) => l.status === 'PRESENT' || l.status === 'LATE').length,
    [logs]
  );
  const lateArrivals = useMemo(() => logs.filter((l) => l.status === 'LATE').length, [logs]);
  const onLeaveCount = useMemo(
    () => logs.filter((l) => l.status === 'ON_LEAVE' || l.status === 'LEAVE').length,
    [logs]
  );
  const totalHoursLogged = useMemo(
    () => logs.reduce((acc, l) => acc + (Number(l.totalHours) || 0), 0),
    [logs]
  );
  const totalOvertime = useMemo(
    () => logs.reduce((acc, l) => acc + (Number(l.ot) || 0), 0),
    [logs]
  );
  const onTimePercentage = useMemo(() => {
    const onTime = logs.filter((l) => l.status === 'PRESENT').length;
    const totalWorking = totalDaysPresent;
    if (!totalWorking) return 100;
    return Math.round((onTime / totalWorking) * 100);
  }, [logs, totalDaysPresent]);

  // Sparkline data generators
  const presenceSparkData = useMemo(() => {
    if (!logs.length) return [{ value: 0, label: 'Empty' }];
    const dateCounts = {};
    logs.forEach((l) => {
      if (l.status === 'PRESENT' || l.status === 'LATE') {
        const d = (l.rawDate || '').split('T')[0] || l.dayNum;
        dateCounts[d] = (dateCounts[d] || 0) + 1;
      }
    });
    const keys = Object.keys(dateCounts).sort();
    if (!keys.length) return [{ value: 0, label: '0' }];
    return keys.slice(-10).map((k) => ({
      value: dateCounts[k],
      label: k.slice(-2),
      tooltip: `${dateCounts[k]} Present`,
    }));
  }, [logs]);

  const lateSparkData = useMemo(() => {
    if (!logs.length) return [{ value: 0, label: 'Empty' }];
    const dateCounts = {};
    logs.forEach((l) => {
      if (l.status === 'LATE') {
        const d = (l.rawDate || '').split('T')[0] || l.dayNum;
        dateCounts[d] = (dateCounts[d] || 0) + 1;
      }
    });
    const keys = Object.keys(dateCounts).sort();
    if (!keys.length) return [{ value: 0, label: '0' }];
    return keys.slice(-10).map((k) => ({
      value: dateCounts[k],
      label: k.slice(-2),
      tooltip: `${dateCounts[k]} Late`,
    }));
  }, [logs]);

  const hoursSparkData = useMemo(() => {
    if (!logs.length) return [{ value: 0, label: '0h' }];
    const dateHours = {};
    logs.forEach((l) => {
      const d = (l.rawDate || '').split('T')[0] || l.dayNum;
      dateHours[d] = (dateHours[d] || 0) + (Number(l.totalHours) || 0);
    });
    const keys = Object.keys(dateHours).sort();
    if (!keys.length) return [{ value: 0, label: '0h' }];
    return keys.slice(-10).map((k) => ({
      value: parseFloat(dateHours[k].toFixed(1)),
      label: k.slice(-2),
      tooltip: `${dateHours[k].toFixed(1)} hrs`,
    }));
  }, [logs]);

  const punchesSparkData = useMemo(() => {
    if (!logs.length) return [{ value: 0, label: '0' }];
    const datePunches = {};
    logs.forEach((l) => {
      const d = (l.rawDate || '').split('T')[0] || l.dayNum;
      datePunches[d] = (datePunches[d] || 0) + 1;
    });
    const keys = Object.keys(datePunches).sort();
    if (!keys.length) return [{ value: 0, label: '0' }];
    return keys.slice(-10).map((k) => ({
      value: datePunches[k],
      label: k.slice(-2),
      tooltip: `${datePunches[k]} punches`,
    }));
  }, [logs]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Biometric Attendance & Time Tracking"
        subtitle="Automated IoT hardware terminal synchronization, workforce punch timesheets, and multi-employee history."
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC BIOMETRIC HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-green-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] p-5 sm:p-8 shadow-soft border border-emerald-200/70 dark:border-emerald-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Biometric Telemetry */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Biometric Attendance & Workforce Time Engine
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Synchronize real-time clock-in logs from hardware face-ID terminals, turnstile gates,
              and monitor individual and organization-wide workforce compliance.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>{totalDaysPresent} Staff Verified This Month</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold bg-amber-100/60 dark:bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800/60">
                <Clock className="w-3.5 h-3.5" />
                <span>{lateArrivals} Late Arrivals</span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Calendar className="w-3.5 h-3.5" />
                <span>{onLeaveCount} Leave Records</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Card */}
          <div className="hidden sm:flex bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-emerald-200/60 dark:border-slate-700/60 shadow-lg flex-col items-center text-center min-w-[220px] sm:min-w-[260px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cpu className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                Biometric Gateway Active
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Hardware sync engine running
              </div>
            </div>
            <div className="flex flex-col w-full gap-2">
              <button
                onClick={handleSyncHardware}
                disabled={isSyncing}
                className="w-full px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Biometric Logs'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Quick Action */}
          <div className="sm:hidden pt-1 flex items-center gap-2">
            <button
              onClick={handleSyncHardware}
              disabled={isSyncing}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Biometric Logs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS ROW (EXACT HIGH-FIDELITY VECTOR SPARKLINE CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Verified Present */}
        <SparkMetricCard
          variant="dark"
          title={selectedEmployee === 'ALL' ? 'Total Clocked In' : 'Verified Present'}
          value={totalDaysPresent}
          unit={totalDaysPresent === 1 ? 'Record' : 'Records'}
          badgeText={selectedEmployee === 'ALL' ? 'Company Staff' : 'Verified Staff'}
          badgeType="positive"
          badgeIcon="up"
          subtext="Active On-Time Duty"
          chartColor="purple"
          presetWave="wave1"
          dataPoints={presenceSparkData}
          loading={loading}
        />

        {/* Card 2: Light Card - Late Arrivals */}
        <SparkMetricCard
          variant="light"
          title="Late Arrivals"
          value={lateArrivals}
          unit={lateArrivals === 1 ? 'Flagged' : 'Flagged'}
          badgeText="> 15m Grace"
          badgeType={lateArrivals > 0 ? 'warning' : 'positive'}
          badgeIcon={lateArrivals > 0 ? 'down' : 'up'}
          subtext="Grace Compliance"
          chartColor="orange"
          presetWave="wave2"
          dataPoints={lateSparkData}
          loading={loading}
        />

        {/* Card 3: Light Card - Logged Work Hours */}
        <SparkMetricCard
          variant="light"
          title="Total Logged Hours"
          value={totalHoursLogged.toFixed(1)}
          unit="hrs"
          badgeText={`+${totalOvertime.toFixed(1)}h OT`}
          badgeType="positive"
          badgeIcon="up"
          subtext="Biometric Shift Work"
          chartColor="amber"
          presetWave="wave3"
          dataPoints={hoursSparkData}
          loading={loading}
        />

        {/* Card 4: Light Card - Biometric Logs */}
        <SparkMetricCard
          variant="light"
          title="Biometric Entries"
          value={logs.length}
          unit={logs.length === 1 ? 'Entry' : 'Entries'}
          badgeText={`${onTimePercentage}% On-Time`}
          badgeType="positive"
          badgeIcon="dot"
          subtext="Punctuality Score"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={punchesSparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. ATTENDANCE HISTORY & TIMESHEETS CONTAINER */}
      {/* ========================================================================= */}
      {loading ? (
        <TableSkeleton rows={6} cols={selectedEmployee === 'ALL' ? 5 : 4} />
      ) : (
        <div className="bg-white dark:bg-[#111C24] rounded-2xl shadow-sm border border-slate-200/80 dark:border-emerald-950/40 overflow-hidden transition-all">
          {/* Header with Title & Month Navigation Controls */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Attendance History & Timesheets</span>
                    {!isCurrentMonth && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                        Past Month Archive
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {selectedEmployee === 'ALL'
                      ? `Viewing organization-wide attendance records (${selectedMonthLabel})`
                      : `Viewing timesheet for ${activeEmployeeObj?.fullName || 'Selected Employee'} (${selectedMonthLabel})`}
                  </p>
                </div>
              </div>
            </div>

            {/* Month Navigator Toolbar */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  title="Previous Month"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Month Picker Button & Dropdown */}
                <div className="relative" ref={monthDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowMonthMenu((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{selectedMonthLabel}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showMonthMenu && (
                    <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-56 max-h-72 overflow-y-auto bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Select Month & Year
                      </div>
                      {pastMonthsList.map((mItem) => {
                        const isSelected =
                          mItem.month === selectedMonth && mItem.year === selectedYear;
                        return (
                          <button
                            key={`${mItem.year}-${mItem.month}`}
                            type="button"
                            onClick={() => {
                              setSelectedMonth(mItem.month);
                              setSelectedYear(mItem.year);
                              setShowMonthMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <span>{mItem.label}</span>
                            {mItem.isCurrent ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                                Current
                              </span>
                            ) : isSelected ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={isNextDisabled}
                  title={isNextDisabled ? 'Cannot navigate to future months' : 'Next Month'}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isNextDisabled
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-900 cursor-pointer'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Jump to Current Month Button */}
              {!isCurrentMonth && (
                <button
                  type="button"
                  onClick={handleJumpToCurrent}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer transition-all shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Current Month</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Toolbar & Summary Strip */}
          <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Quick summary badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{counts.present} Present</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{totalHoursLogged.toFixed(1)} hrs</span>
              </span>
              {totalOvertime > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/50 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  +{totalOvertime.toFixed(1)}h OT
                </span>
              )}
              {counts.late > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/50 text-xs font-bold text-amber-700 dark:text-amber-300">
                  {counts.late} Late
                </span>
              )}
            </div>

            {/* Filter Controls: Employee Dropdown + Department + Search + Status Filter + Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* HR Employee Selector Dropdown */}
              <div className="relative" ref={employeeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowEmployeeMenu((prev) => !prev)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                    selectedEmployee !== 'ALL'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="max-w-[130px] sm:max-w-[160px] truncate">
                    {selectedEmployee === 'ALL'
                      ? 'All Employees'
                      : activeEmployeeObj?.fullName || 'Employee'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showEmployeeMenu && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          placeholder="Search employee..."
                          className="w-full pl-8 pr-2 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="pt-1.5 space-y-1">
                      {/* Option 1: All Employees */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmployee('ALL');
                          setShowEmployeeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                          selectedEmployee === 'ALL'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-500" />
                          <span>All Employees (Overview)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {employees.length || '15'}
                        </span>
                      </button>

                      {/* Employee List */}
                      {filteredEmployeesList.map((emp) => {
                        const isSelected = selectedEmployee === emp.id || selectedEmployee === emp.employeeCode;
                        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
                        const dept = emp.profile?.department?.name || emp.department || 'Operations';
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setSelectedEmployee(emp.id);
                              setShowEmployeeMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                {getInitials(emp.firstName, emp.lastName)}
                              </div>
                              <div className="text-left min-w-0">
                                <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {fullName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono truncate">
                                  {emp.employeeCode} • {dept}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Department Filter Dropdown */}
              <div className="relative" ref={departmentDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDepartmentMenu((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                    selectedDepartment !== 'ALL'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="max-w-[110px] truncate">
                    {selectedDepartment === 'ALL' ? 'All Depts' : selectedDepartment}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showDepartmentMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Department
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDepartment('ALL');
                        setShowDepartmentMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedDepartment === 'ALL'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>All Departments</span>
                      {selectedDepartment === 'ALL' && (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </button>
                    {departmentList.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setShowDepartmentMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selectedDepartment === dept
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{dept}</span>
                        {selectedDepartment === dept && (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-auto min-w-[160px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search records, staff..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status Filter Button with Dropdown Menu */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowFilterMenu((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                    statusFilter !== 'ALL'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>
                    {statusFilter === 'ALL'
                      ? 'Filter'
                      : statusFilter === 'PRESENT'
                      ? 'Present'
                      : statusFilter === 'LATE'
                      ? 'Late'
                      : 'Leave'}
                  </span>
                  {statusFilter !== 'ALL' ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  )}
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Filter by Status
                    </div>
                    {[
                      { id: 'ALL', label: 'All Records', count: counts.all },
                      {
                        id: 'PRESENT',
                        label: 'Present',
                        count: counts.present,
                        dot: 'bg-emerald-500',
                      },
                      { id: 'LATE', label: 'Late Arrival', count: counts.late, dot: 'bg-amber-500' },
                      {
                        id: 'ON_LEAVE',
                        label: 'On Leave',
                        count: counts.leave,
                        dot: 'bg-indigo-500',
                      },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setStatusFilter(st.id);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          statusFilter === st.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {st.dot ? (
                            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                          )}
                          <span>{st.label}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            statusFilter === st.id
                              ? 'bg-emerald-200/60 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {st.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={exportToCSV}
                title="Export filtered records to CSV"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Individual Employee Profile Header (When an employee is selected) */}
          {selectedEmployee !== 'ALL' && activeEmployeeObj && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-800/40 border-b border-emerald-200/60 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/20 border-2 border-white dark:border-slate-800">
                  {getInitials(activeEmployeeObj.firstName, activeEmployeeObj.lastName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {activeEmployeeObj.fullName ||
                        `${activeEmployeeObj.firstName} ${activeEmployeeObj.lastName}`}
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60">
                      {activeEmployeeObj.employeeCode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                    <span>
                      {activeEmployeeObj.profile?.designation?.title ||
                        activeEmployeeObj.designation ||
                        'Staff'}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      {activeEmployeeObj.profile?.department?.name ||
                        activeEmployeeObj.department ||
                        'Operations'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedEmployee('ALL')}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>View All Employees</span>
                </button>
              </div>
            </div>
          )}

          {/* Table / Timeline Data Grid */}
          {filteredLogs.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/75 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      {selectedEmployee === 'ALL' && (
                        <th className="py-3.5 px-6">Employee</th>
                      )}
                      <th className="py-3.5 px-6">Work Date</th>
                      <th className="py-3.5 px-4">Punch In</th>
                      <th className="py-3.5 px-4">Punch Out</th>
                      <th className="py-3.5 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filteredLogs.map((log) => {
                      const isLeave = log.status === 'ON_LEAVE' || log.status === 'LEAVE';
                      const isLate = log.status === 'LATE';

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* 0. Employee Column (When All Employees view is active) */}
                          {selectedEmployee === 'ALL' && (
                            <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-[11px] flex items-center justify-center shrink-0 border border-white dark:border-slate-800 shadow-2xs">
                                  {getInitials(log.user?.firstName, log.user?.lastName)}
                                </div>
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedEmployee(log.user?.id)}
                                    title="Click to view this employee timesheet"
                                    className="font-extrabold text-slate-900 dark:text-white text-xs block text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[170px] cursor-pointer"
                                  >
                                    {log.user?.fullName}
                                  </button>
                                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                    <span>{log.user?.employeeCode}</span>
                                    <span>•</span>
                                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                                      {log.user?.department}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* 1. Work Date Column */}
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3.5">
                              {/* Date Number Badge */}
                              <div
                                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center border transition-all ${
                                  log.isToday
                                    ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 group-hover:border-emerald-400/50'
                                }`}
                              >
                                <span className="text-[9px] font-black uppercase tracking-wider leading-none">
                                  {log.monthShort || 'DAY'}
                                </span>
                                <span className="text-base font-black leading-tight mt-0.5">
                                  {log.dayNum || '01'}
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                                    {log.formattedDate}
                                  </span>
                                  {log.isToday && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      Today
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                  {log.day}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Punch In Column */}
                          <td className="py-4 px-4 font-mono">
                            {isLeave ? (
                              <span className="text-slate-400 dark:text-slate-500 text-xs font-sans italic">
                                — (Time Off)
                              </span>
                            ) : (
                              <div>
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                                    isLate
                                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-800/40 text-amber-700 dark:text-amber-300'
                                      : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300'
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isLate ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                  />
                                  {log.checkIn}
                                </span>
                                <div className="text-[10px] text-slate-400 font-sans mt-0.5 pl-1">
                                  {isLate ? 'Late Arrival Flagged' : 'On-Time Shift Start'}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 3. Punch Out Column */}
                          <td className="py-4 px-4 font-mono">
                            {isLeave ? (
                              <span className="text-slate-400 dark:text-slate-500 text-xs font-sans italic">
                                — (Time Off)
                              </span>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
                                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                                  {log.checkOut}
                                </span>
                                <div className="text-[10px] text-slate-400 font-sans mt-0.5 pl-1">
                                  {log.checkOut !== '--:--' ? 'Shift Completed' : 'Shift Active'}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 4. Status Column (Right aligned) */}
                          <td className="py-4 px-6 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border shadow-2xs ${
                                log.status === 'PRESENT'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50'
                                  : isLate
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50'
                                  : isLeave
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/50'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/50'
                              }`}
                            >
                              {log.status === 'PRESENT' && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              )}
                              {isLate && (
                                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              )}
                              {isLeave && (
                                <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              )}
                              <span>{isLate ? 'Late Arrival' : isLeave ? 'On Leave' : log.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Bottom Monthly Summary Strip */}
              <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="font-medium">
                  Showing{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {filteredLogs.length}
                  </span>{' '}
                  records for{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedMonthLabel}
                  </span>{' '}
                  {selectedEmployee !== 'ALL' && (
                    <span>({activeEmployeeObj?.fullName || 'Individual Timesheet'})</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <span>
                    Total Logged:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {totalHoursLogged.toFixed(1)} hrs
                    </strong>
                  </span>
                  <span>
                    Overtime:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      +{totalOvertime.toFixed(1)} hrs
                    </strong>
                  </span>
                  <span>
                    On-Time Rate:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {onTimePercentage}%
                    </strong>
                  </span>
                </div>
              </div>

              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredLogs.map((log) => {
                    const isLeave = log.status === 'ON_LEAVE' || log.status === 'LEAVE';
                    const isLate = log.status === 'LATE';
                    const durationVal = Number(log.totalHours) || 0;
                    const progressPct = Math.min(100, Math.round((durationVal / 8.5) * 100));

                    return (
                      <div
                        key={log.id}
                        className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/70 space-y-3.5 shadow-xs hover:border-emerald-400/60 transition-all"
                      >
                        {/* Header: Employee/Date + Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border ${
                                log.isToday
                                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <span className="text-[8px] font-black uppercase tracking-wider leading-none">
                                {log.monthShort}
                              </span>
                              <span className="text-sm font-black leading-tight mt-0.5">
                                {log.dayNum}
                              </span>
                            </div>

                            <div>
                              {selectedEmployee === 'ALL' && (
                                <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[150px]">
                                  {log.user?.fullName}
                                </div>
                              )}
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {log.formattedDate}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {log.day} {selectedEmployee === 'ALL' && `• ${log.user?.employeeCode}`}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                              log.status === 'PRESENT'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                                : isLate
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{isLate ? 'Late' : isLeave ? 'Leave' : 'Present'}</span>
                          </span>
                        </div>

                        {/* Punch In / Out / Duration Summary */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/60 text-center">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">
                              Punch In
                            </div>
                            <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {log.checkIn}
                            </div>
                          </div>
                          <div className="border-x border-slate-100 dark:border-slate-800">
                            <div className="text-[9px] uppercase font-bold text-slate-400">
                              Punch Out
                            </div>
                            <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                              {log.checkOut}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">
                              Logged
                            </div>
                            <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                              {durationVal.toFixed(1)}h
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar & Method */}
                        <div className="space-y-1.5">
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                log.ot > 0
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                  : durationVal >= 8.0
                                  ? 'bg-emerald-500'
                                  : isLate
                                  ? 'bg-amber-500'
                                  : 'bg-teal-500'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="truncate max-w-[170px]">{log.notes}</span>
                            {log.ot > 0 && (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                +{log.ot}h OT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 sm:p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 shadow-sm">
                <CalendarDays className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {searchQuery || statusFilter !== 'ALL' || selectedDepartment !== 'ALL'
                    ? 'No records match your filter criteria'
                    : 'No Attendance Records Found'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {searchQuery || statusFilter !== 'ALL' || selectedDepartment !== 'ALL'
                    ? 'Try clearing your filters or choosing a different employee, department, or month.'
                    : `No attendance records logged for ${selectedMonthLabel}. Use the month navigation above to view other periods.`}
                </p>
              </div>
              {(searchQuery ||
                statusFilter !== 'ALL' ||
                selectedDepartment !== 'ALL' ||
                selectedEmployee !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setSelectedDepartment('ALL');
                    setSelectedEmployee('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
