import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Layers,
  Fingerprint,
  Megaphone,
  Calendar,
  LifeBuoy,
  BookOpen,
  FileText,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Bell,
  Sun,
  X,
  Tag,
  User,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { AnnouncementSkeleton } from '../../components/common/Skeleton';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';
import { api } from '../../services/api';
import { getYearHolidays } from '../../utils/holidayEngine';
import { subscribeAppEvent } from '../../utils/crossTabSync';
import { calculateLeaveDays } from './EmployeeLeaves';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate, formatTime } = useRegionalSettings();

  const [loading, setLoading] = useState(() => !api.hasCached('/dashboard/employee'));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(() => api.getCached('/dashboard/employee')?.data || null);
  const [leaveTypes, setLeaveTypes] = useState(() => api.getCached('/leaves/types')?.data?.leaveTypes || []);
  const [leaveRequests, setLeaveRequests] = useState(() => api.getCached('/leaves/my-requests')?.data?.leaveRequests || api.getCached('/leaves/requests')?.data?.leaveRequests || []);
  const [announcements, setAnnouncements] = useState(() => api.getCached('/announcements')?.data?.announcements || []);
  const [attendanceLogs, setAttendanceLogs] = useState(() => api.getCached('/attendance/my-logs?limit=14')?.data?.attendances || []);
  const [payslipHistory, setPayslipHistory] = useState(() => api.getCached('/payroll/my-payslips')?.data?.payslips || []);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isSalaryHidden, setIsSalaryHidden] = useState(() => {
    try {
      return localStorage.getItem('nexahr_hide_salary') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSalaryVisibility = (e) => {
    e?.stopPropagation();
    setIsSalaryHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nexahr_hide_salary', String(next));
      } catch {}
      return next;
    });
  };

  // Live digital clock timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real database attendance, history & dashboard metrics
  const fetchDashboard = async (bypass = false) => {
    if (bypass) {
      api.invalidateLeavesCache();
    } else if (!api.hasCached('/dashboard/employee')) {
      setLoading(true);
    }
    try {
      const opts = bypass ? { bypassCache: true } : {};
      const [dashRes, leaveRes, reqRes, annRes, logsRes, payRes] = await Promise.allSettled([
        api.getEmployeeDashboard(opts),
        api.getLeaveTypes(opts),
        api.getMyLeaveRequests({}, opts),
        api.getAnnouncements(opts),
        api.getMyAttendanceLogs ? api.getMyAttendanceLogs({ limit: 14 }, opts) : Promise.resolve(null),
        api.getMyPayslips ? api.getMyPayslips(opts) : Promise.resolve(null),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboardData(dashRes.value.data);
      }
      if (leaveRes.status === 'fulfilled' && leaveRes.value?.data?.leaveTypes) {
        setLeaveTypes(leaveRes.value.data.leaveTypes);
      }
      if (reqRes.status === 'fulfilled' && reqRes.value?.data?.leaveRequests) {
        setLeaveRequests(reqRes.value.data.leaveRequests);
      }
      if (annRes.status === 'fulfilled' && annRes.value?.data?.announcements) {
        setAnnouncements(annRes.value.data.announcements);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value?.data) {
        const records = logsRes.value.data.attendances || logsRes.value.data.logs || [];
        setAttendanceLogs(records);
      }
      if (payRes.status === 'fulfilled' && payRes.value?.data?.payslips) {
        setPayslipHistory(payRes.value.data.payslips);
      }
    } catch (err) {
      console.warn('Failed to load employee dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Auto-listen to global updates for live synchronization
    const unsubLeaves = subscribeAppEvent('nexahr_leaves_updated', () => fetchDashboard(true));
    window.addEventListener('nexahr_punch_updated', fetchDashboard);
    window.addEventListener('nexahr_notification_updated', fetchDashboard);
    window.addEventListener('user_profile_updated', fetchDashboard);
    const handleFocus = () => fetchDashboard(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubLeaves();
      window.removeEventListener('nexahr_punch_updated', fetchDashboard);
      window.removeEventListener('nexahr_notification_updated', fetchDashboard);
      window.removeEventListener('user_profile_updated', fetchDashboard);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const currentUser = (() => {
    if (dashboardData?.user) return dashboardData.user;
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const todayStatus = dashboardData?.todayClockStatus;
  const isPresent = todayStatus?.status === 'PRESENT' || todayStatus?.status === 'LATE';

  const formatDbTime = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const monthlyAttendance = dashboardData?.monthlyAttendance || { presentDays: 0, lateDays: 0, totalWorkHours: 0 };
  const leavesSummary = dashboardData?.leavesSummary || { pending: 0, approved: 0, rejected: 0 };
  const latestPayslip = dashboardData?.latestPayslip || null;

  const { timezone, dateFormat } = useRegionalSettings();

  // Compute dynamic upcoming holidays with live day count
  const dynamicUpcomingHolidays = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const holidaysThisYear = getYearHolidays(currentYear, timezone, dateFormat);
    const holidaysNextYear = getYearHolidays(currentYear + 1, timezone, dateFormat);
    const combined = [...holidaysThisYear, ...holidaysNextYear];

    return combined
      .filter((h) => h.status === 'UPCOMING' || h.status === 'ACTIVE_TODAY')
      .slice(0, 4);
  }, [currentTime, timezone, dateFormat]);

  // Compute dynamic leave quota & balances from real database leave types and requests
  const dynamicLeaveBalances = useMemo(() => {
    if (!leaveTypes || leaveTypes.length === 0) return [];

    return leaveTypes.slice(0, 3).map((type, idx) => {
      const totalAllowed = Number(type.daysAllowed) || 0;
      const approvedDays = leaveRequests
        .filter(
          (r) =>
            (r.leaveTypeId === type.id ||
              r.leaveType?.name === type.name ||
              r.leaveType?.code === type.code) &&
            r.status === 'APPROVED'
        )
        .reduce((sum, r) => sum + calculateLeaveDays(r), 0);

      const pendingDays = leaveRequests
        .filter(
          (r) =>
            (r.leaveTypeId === type.id ||
              r.leaveType?.name === type.name ||
              r.leaveType?.code === type.code) &&
            r.status === 'PENDING'
        )
        .reduce((sum, r) => sum + calculateLeaveDays(r), 0);

      const remaining = Math.max(0, totalAllowed - approvedDays);
      const percentage = totalAllowed > 0 ? Math.min(100, Math.max(0, Math.round((remaining / totalAllowed) * 100))) : 0;

      return {
        id: type.id || idx,
        name: type.name,
        code: type.code,
        totalAllowed,
        approvedDays,
        pendingDays,
        remaining,
        percentage,
        colorIdx: idx,
      };
    });
  }, [leaveTypes, leaveRequests]);

  // Dynamic Announcements list from backend
  const dynamicAnnouncements = useMemo(() => {
    if (announcements && announcements.length > 0) {
      return announcements.slice(0, 3);
    }
    return [];
  }, [announcements]);

  const netSalaryAmount = latestPayslip?.netSalary
    ? formatCurrency(latestPayslip.netSalary)
    : currentUser?.salaryStructure?.basicSalary
    ? formatCurrency(currentUser.salaryStructure.basicSalary)
    : formatCurrency(0);

  const displaySalary = useMemo(() => {
    if (!isSalaryHidden) return netSalaryAmount;
    if (typeof netSalaryAmount === 'string') {
      const parts = netSalaryAmount.trim().split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0]} ••••••`;
      }
      const match = netSalaryAmount.match(/^([^0-9]+)/);
      if (match) {
        return `${match[1].trim()} ••••••`;
      }
    }
    return '••••••••';
  }, [netSalaryAmount, isSalaryHidden]);

  const payslipPeriod = latestPayslip?.month
    ? `Paid for Month ${latestPayslip.month}/${latestPayslip.year}`
    : currentUser?.salaryStructure
    ? `Base Rate • ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : 'No Payroll Record';

  // Calculations for fully dynamic employee portal metric cards
  const attendanceOnTimeRate = useMemo(() => {
    if (!monthlyAttendance?.presentDays || monthlyAttendance.presentDays === 0) return 0;
    const onTime = monthlyAttendance.presentDays - (monthlyAttendance.lateDays || 0);
    return Math.max(0, Math.min(100, Math.round((onTime / monthlyAttendance.presentDays) * 100)));
  }, [monthlyAttendance]);

  const totalRemainingLeaves = useMemo(() => {
    return dynamicLeaveBalances.reduce((acc, q) => acc + (q.remaining || 0), 0);
  }, [dynamicLeaveBalances]);

  const totalAllowedLeaves = useMemo(() => {
    return dynamicLeaveBalances.reduce((acc, q) => acc + (q.totalAllowed || 0), 0);
  }, [dynamicLeaveBalances]);

  const avgDailyHours = useMemo(() => {
    if (!monthlyAttendance?.presentDays || monthlyAttendance.presentDays === 0) {
      return '0.0';
    }
    return (monthlyAttendance.totalWorkHours / monthlyAttendance.presentDays).toFixed(1);
  }, [monthlyAttendance]);

  // Dynamic Sparkline Time-Series Data Series
  const attendanceSparkData = useMemo(() => {
    if (attendanceLogs && attendanceLogs.length >= 2) {
      return attendanceLogs.slice(0, 10).reverse().map((log) => {
        const d = new Date(log.date);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const hours = Number(log.totalHours) || (log.status === 'PRESENT' ? 8.5 : log.status === 'LATE' ? 7.5 : 0);
        return {
          value: hours,
          label: dayLabel,
          tooltip: `${dateStr} (${dayLabel}): ${hours} hrs • ${log.status || 'PRESENT'}`,
        };
      });
    }
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const present = monthlyAttendance?.presentDays > 0 && !isWeekend;
      const hours = isWeekend ? 0 : present ? 8.5 : 0;
      return {
        value: hours,
        label: dayLabel,
        tooltip: `${dateStr} (${dayLabel}): ${hours > 0 ? `${hours} hrs (Present)` : isWeekend ? 'Weekend Off' : 'Pending Entry'}`,
      };
    });
  }, [attendanceLogs, monthlyAttendance]);

  const hoursSparkData = useMemo(() => {
    if (attendanceLogs && attendanceLogs.length >= 2) {
      return attendanceLogs.slice(0, 8).reverse().map((log) => {
        const d = new Date(log.date);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const hours = Number(log.totalHours) || (log.status === 'PRESENT' ? 8.5 : 0);
        return {
          value: hours,
          label: dayLabel,
          tooltip: `${dateStr} (${dayLabel}): ${hours} hrs Logged`,
        };
      });
    }
    const now = new Date();
    const avg = Number(avgDailyHours) || (monthlyAttendance?.totalWorkHours > 0 ? 8.5 : 0);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (5 - i));
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const val = avg > 0 ? (i % 2 === 0 ? avg : Math.max(0, avg - 0.5)) : 0;
      return {
        value: Number(val.toFixed(1)),
        label: dayLabel,
        tooltip: `${dateStr} (${dayLabel}): ${val.toFixed(1)} hrs Logged`,
      };
    });
  }, [attendanceLogs, avgDailyHours, monthlyAttendance]);

  const leavesSparkData = useMemo(() => {
    if (dynamicLeaveBalances && dynamicLeaveBalances.length >= 1) {
      return dynamicLeaveBalances.map((q) => ({
        value: q.remaining,
        label: q.code || q.name.slice(0, 3),
        tooltip: `${q.name}: ${q.remaining}/${q.totalAllowed} days left (${q.approvedDays}d used)`,
      }));
    }
    return [
      { value: 0, label: 'Leaves', tooltip: 'No Leave Quotas Allocated' },
    ];
  }, [dynamicLeaveBalances]);

  const salarySparkData = useMemo(() => {
    if (payslipHistory && payslipHistory.length >= 2) {
      return payslipHistory.slice(0, 6).reverse().map((p) => {
        const amount = Number(p.netSalary) || 0;
        return {
          value: amount,
          label: `M${p.month}`,
          tooltip: isSalaryHidden
            ? `Month ${p.month}/${p.year}: ••••••`
            : `Month ${p.month}/${p.year}: ${formatCurrency(amount)} • ${p.status || 'PAID'}`,
        };
      });
    }
    const base = Number(currentUser?.salaryStructure?.basicSalary) || 0;
    const allowances = (Number(currentUser?.salaryStructure?.housingAllowance) || 0) + (Number(currentUser?.salaryStructure?.transportAllowance) || 0);
    const deductions = (Number(currentUser?.salaryStructure?.taxDeductions) || 0) + (Number(currentUser?.salaryStructure?.otherDeductions) || 0);
    const gross = base + allowances;
    const net = gross - deductions;
    return [
      { value: base, label: 'Basic', tooltip: isSalaryHidden ? 'Basic: ••••••' : `Basic Salary: ${formatCurrency(base)}` },
      { value: gross, label: 'Gross', tooltip: isSalaryHidden ? 'Gross: ••••••' : `Gross Pay: ${formatCurrency(gross)} (+${formatCurrency(allowances)} Allowances)` },
      { value: Math.max(0, deductions), label: 'Deduct', tooltip: isSalaryHidden ? 'Deductions: ••••••' : `Deductions & Tax: ${formatCurrency(deductions)}` },
      { value: net, label: 'Net', tooltip: isSalaryHidden ? 'Net: ••••••' : `Net Take-Home: ${formatCurrency(net)}` },
    ];
  }, [payslipHistory, currentUser, formatCurrency, isSalaryHidden]);

  // Card 1 Dynamic Tag Logic
  const card1Badge = useMemo(() => {
    if (!monthlyAttendance.presentDays || monthlyAttendance.presentDays === 0) {
      return { text: '0d Logged', type: 'neutral', icon: 'dot', sub: 'Awaiting Punch-In' };
    }
    if (monthlyAttendance.lateDays > 0) {
      return {
        text: `+${attendanceOnTimeRate}% On-Time`,
        type: attendanceOnTimeRate >= 80 ? 'positive' : 'warning',
        icon: attendanceOnTimeRate >= 80 ? 'up' : 'down',
        sub: `${monthlyAttendance.lateDays} Late Check-in${monthlyAttendance.lateDays > 1 ? 's' : ''}`,
      };
    }
    return { text: '100% Punctual', type: 'positive', icon: 'up', sub: '100% On-Time Record' };
  }, [monthlyAttendance, attendanceOnTimeRate]);

  // Card 2 Dynamic Tag Logic
  const card2Badge = useMemo(() => {
    if (!monthlyAttendance.totalWorkHours || monthlyAttendance.totalWorkHours === 0) {
      return { text: '0.0h / Day', type: 'neutral', icon: 'dot', sub: 'Shift: 09:00 – 17:30' };
    }
    const avg = Number(avgDailyHours);
    return {
      text: `+${avgDailyHours}h / Day`,
      type: avg >= 8 ? 'positive' : 'warning',
      icon: avg >= 8 ? 'up' : 'down',
      sub: `${monthlyAttendance.totalWorkHours}h / 176h Monthly Goal`,
    };
  }, [monthlyAttendance, avgDailyHours]);

  // Card 3 Dynamic Tag Logic
  const card3Badge = useMemo(() => {
    if (leavesSummary.pending > 0) {
      return {
        text: `${leavesSummary.pending} Pending Review`,
        type: 'warning',
        icon: 'dot',
        sub: `Awaiting HR Approval`,
      };
    }
    if (leavesSummary.approved > 0) {
      return {
        text: `-${leavesSummary.approved}d Consumed`,
        type: 'neutral',
        icon: 'down',
        sub: `${leavesSummary.approved} Days Used This Year`,
      };
    }
    return {
      text: `${totalRemainingLeaves}d Available`,
      type: 'positive',
      icon: 'up',
      sub: `Quota: ${totalAllowedLeaves} Days Total`,
    };
  }, [leavesSummary, totalRemainingLeaves, totalAllowedLeaves]);

  // Card 4 Dynamic Tag Logic
  const card4Badge = useMemo(() => {
    if (latestPayslip?.status === 'PAID') {
      return { text: 'Disbursed', type: 'positive', icon: 'up', sub: payslipPeriod };
    }
    if (latestPayslip?.status === 'GENERATED') {
      return { text: 'Generated', type: 'warning', icon: 'dot', sub: payslipPeriod };
    }
    if (latestPayslip?.status === 'DRAFT') {
      return { text: 'Processing', type: 'neutral', icon: 'dot', sub: payslipPeriod };
    }
    if (currentUser?.salaryStructure?.basicSalary) {
      return { text: 'Configured', type: 'positive', icon: 'dot', sub: 'Active Salary Structure' };
    }
    return { text: 'No Records', type: 'neutral', icon: 'dot', sub: 'No Payroll Setup' };
  }, [latestPayslip, currentUser, payslipPeriod]);

  const employeeShift = currentUser?.profile?.shift || currentUser?.shift || 'General Shift';
  const officeLocation = currentUser?.profile?.workLocation || currentUser?.workLocation || 'Corporate Office';

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title={`Welcome, ${currentUser?.firstName || 'Employee'}`}
        mobileTitle="Employee Dashboard"
        hideMobileSubtitle={true}
        hideMobileSearch={true}
        subtitle="Here is your personal attendance, schedule, and self-service pulse for today."
        onRefresh={fetchDashboard}
        loading={loading}
      />

      {/* HERO BIOMETRIC HARDWARE STATUS BANNER */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-5 sm:p-8 shadow-soft border border-sky-200/80 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Column: Greeting & Digital Clock */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {isPresent ? 'Biometric Entry Verified & Active' : 'Automated Biometric Station Active'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
              Attendance is recorded automatically via biometric hardware machines (Face-ID / Fingerprint) synchronized in real-time with enterprise cloud turnstiles. Daily punch records, shift rosters, and working hours are streamed live into your personal employee dossier.
            </p>

            {/* Dynamic Telemetry Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-sky-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span>{employeeShift}</span>
              </span>
              <span className="flex items-center bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-sky-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span>{officeLocation}</span>
              </span>
              <span className="flex items-center bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-sky-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span>{monthlyAttendance.presentDays || 0} Days Present</span>
              </span>
              {(monthlyAttendance.lateDays || 0) > 0 && (
                <span className="flex items-center bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-xl border border-amber-200/80 dark:border-amber-800/50 font-bold">
                  <span>{monthlyAttendance.lateDays} Late Arrivals</span>
                </span>
              )}
            </div>

            {/* Live Clock Display */}
            <div className="flex items-center gap-4 pt-1">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-200/70 dark:border-slate-700/80 shadow-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wider">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right Column: Automated Database Punch Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[280px] sm:min-w-[320px]">
            <div className="flex items-center justify-between w-full mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Biometric Status</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isPresent
                    ? todayStatus?.status === 'LATE'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50'
                      : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/50'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isPresent ? (todayStatus?.status === 'LATE' ? 'Late Recorded' : 'Biometric Synced') : 'Awaiting Device Entry'}
              </span>
            </div>

            {/* In / Out Timestamps from Database */}
            <div className="w-full grid grid-cols-2 gap-2 my-2">
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-sky-100 dark:border-slate-700/80 text-left shadow-2xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Device Punch In</div>
                <div className="text-lg sm:text-xl font-mono font-black text-sky-600 dark:text-sky-400 mt-0.5">
                  {formatDbTime(todayStatus?.checkInTime)}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5 text-sky-500" />
                  {todayStatus?.checkInTime ? 'Recorded' : 'Pending'}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-sky-100 dark:border-slate-700/80 text-left shadow-2xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Device Punch Out</div>
                <div className="text-lg sm:text-xl font-mono font-black text-sky-600 dark:text-sky-400 mt-0.5">
                  {formatDbTime(todayStatus?.checkOutTime)}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5 text-sky-500" />
                  {todayStatus?.checkOutTime ? 'Recorded' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Hardware Terminal Navigation Action */}
            <div className="w-full pt-2">
              <button
                onClick={() => navigate('/employee/attendance')}
                className="w-full py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95"
              >
                <span>View Full Attendance History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOP METRICS CARDS (EXACT HIGH-FIDELITY VECTOR SPARKLINE CARDS FOR EMPLOYEE PORTAL) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Present Attendance */}
        <SparkMetricCard
          variant="dark"
          title="Present This Month"
          value={monthlyAttendance.presentDays || 0}
          unit={monthlyAttendance.presentDays === 1 ? 'Day' : 'Days'}
          badgeText={card1Badge.text}
          badgeType={card1Badge.type}
          badgeIcon={card1Badge.icon}
          subtext={card1Badge.sub}
          chartColor="purple"
          presetWave="wave1"
          dataPoints={attendanceSparkData}
          onClick={() => navigate('/employee/attendance')}
          loading={loading}
        />

        {/* Card 2: Light Card - Logged Work Hours */}
        <SparkMetricCard
          variant="light"
          title="Logged Hours"
          value={monthlyAttendance.totalWorkHours || 0}
          unit="hrs"
          badgeText={card2Badge.text}
          badgeType={card2Badge.type}
          badgeIcon={card2Badge.icon}
          subtext={card2Badge.sub}
          chartColor="orange"
          presetWave="wave2"
          dataPoints={hoursSparkData}
          onClick={() => navigate('/employee/attendance')}
          loading={loading}
        />

        {/* Card 3: Light Card - Available Leaves */}
        <SparkMetricCard
          variant="light"
          title="Available Leaves"
          value={totalRemainingLeaves}
          unit="Days"
          badgeText={card3Badge.text}
          badgeType={card3Badge.type}
          badgeIcon={card3Badge.icon}
          subtext={card3Badge.sub}
          chartColor="amber"
          presetWave="wave3"
          dataPoints={leavesSparkData}
          onClick={() => navigate('/employee/leaves')}
          loading={loading}
        />

        {/* Card 4: Light Card - Latest Net Salary */}
        <SparkMetricCard
          variant="light"
          title="Latest Net Salary"
          titleAction={
            <button
              type="button"
              onClick={toggleSalaryVisibility}
              title={isSalaryHidden ? 'Show Net Salary' : 'Hide Net Salary'}
              aria-label={isSalaryHidden ? 'Show Net Salary' : 'Hide Net Salary'}
              className="p-1 -my-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer inline-flex items-center justify-center active:scale-90"
            >
              {isSalaryHidden ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          }
          value={displaySalary}
          badgeText={card4Badge.text}
          badgeType={card4Badge.type}
          badgeIcon={card4Badge.icon}
          subtext={card4Badge.sub}
          chartColor="rose"
          presetWave="wave4"
          dataPoints={salarySparkData}
          onClick={() => navigate('/employee/payslips')}
          loading={loading}
        />
      </div>

      {/* QUICK SELF-SERVICE ACTIONS HUB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/employee/leaves')}
          className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 shadow-soft hover:border-sky-500/50 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              Apply For Leave
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Submit medical, casual, or annual vacation requests
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
        </button>

        <button
          onClick={() => navigate('/employee/payslips')}
          className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 shadow-soft hover:border-sky-500/50 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              Download Payslip
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              View monthly salary slips, tax breakdown & benefits
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
        </button>

        <button
          onClick={() => navigate('/employee/helpdesk')}
          className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 shadow-soft hover:border-sky-500/50 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              Helpdesk & Support
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Raise a support ticket for IT equipment, HR or ops
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
        </button>

        <button
          onClick={() => navigate('/employee/documents')}
          className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 shadow-soft hover:border-sky-500/50 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              Policies & Handbook
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Access company code of conduct & employee perks
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
        </button>
      </div>

      {/* TWO-COLUMN DETAILS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dynamic Announcements & Live Leave Quotas (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Company Announcements */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Company Announcements & Bulletins
                  </h3>
                  <p className="text-xs text-slate-400">Official company-wide notices and organizational updates</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/employee/announcements')}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <AnnouncementSkeleton count={2} />
              ) : dynamicAnnouncements.length > 0 ? (
                dynamicAnnouncements.map((item, idx) => {
                  const itemDate = item.date || (item.createdAt ? formatDate(item.createdAt) : 'Recent');
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => setSelectedAnnouncement(item)}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-600 shadow-2xs">
                          {item.category || 'COMPANY NOTICE'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {itemDate}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.desc || item.summary || item.content}
                      </p>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/80 dark:border-slate-700/40 text-[11px] font-semibold text-slate-400">
                        <span>By {item.author || item.createdBy || 'People Operations & HR'}</span>
                        <span className="text-sky-600 dark:text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                          Read Notice →
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 space-y-1.5">
                  <Megaphone className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300">No Active Announcements</div>
                  <p className="text-[11px] text-slate-400">All official company circulars posted by HR will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Holidays & Shift Pulse (1/3 width) */}
        <div className="space-y-6">
          {/* Upcoming Official Holidays */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Upcoming Holidays
                  </h3>
                  <p className="text-xs text-slate-400">Official non-working observance days</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/employee/holidays')}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {dynamicUpcomingHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  onClick={() => navigate('/employee/holidays')}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {holiday.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>{holiday.displayDate}</span>
                      <span>•</span>
                      <span>{holiday.day}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        holiday.countdown.includes('Today')
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse'
                          : 'bg-sky-100/80 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300'
                      }`}
                    >
                      {holiday.countdown}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Shift Schedule Card */}
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 rounded-3xl p-6 shadow-soft text-white border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Assigned Shift Schedule
                </span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Active Policy
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-400">Shift Name</span>
                <span className="font-bold text-white truncate max-w-[180px]">{employeeShift}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-400">Working Hours</span>
                <span className="font-bold text-sky-400">09:00 AM – 05:30 PM</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-400">Work Week</span>
                <span className="font-bold text-white">Monday – Friday</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Grace Period</span>
                <span className="font-bold text-amber-300">15 Mins (Till 09:15 AM)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Quick Preview Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-lg w-full shadow-2xl shadow-slate-950/20 dark:shadow-black/60 border border-slate-200/70 dark:border-slate-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-slate-50 via-slate-100/60 to-slate-50 dark:from-slate-900/80 dark:via-slate-800/60 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 left-10 w-36 h-36 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 relative z-10">
                {selectedAnnouncement.category || 'NOTICE'}
              </span>

              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 py-5 space-y-3.5 text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  Published {selectedAnnouncement.date || (selectedAnnouncement.createdAt ? formatDate(selectedAnnouncement.createdAt) : 'Aug 14, 2026')} • By {selectedAnnouncement.author || selectedAnnouncement.createdBy || 'Executive Operations'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-56 overflow-y-auto custom-scrollbar font-medium">
                {selectedAnnouncement.desc || selectedAnnouncement.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200/50 dark:border-slate-800/40 flex items-center justify-end gap-2.5 bg-white/40 dark:bg-slate-900/40 shrink-0">
              <button
                onClick={() => {
                  setSelectedAnnouncement(null);
                  navigate('/employee/announcements');
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-sky-600/20"
              >
                Go to Announcements Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
