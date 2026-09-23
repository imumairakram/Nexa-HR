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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';
import { api } from '../../services/api';
import { getYearHolidays } from '../../utils/holidayEngine';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate, formatTime } = useRegionalSettings();

  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [payslipHistory, setPayslipHistory] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Live digital clock timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real database attendance, history & dashboard metrics
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, leaveRes, reqRes, annRes, logsRes, payRes] = await Promise.allSettled([
        api.getEmployeeDashboard(),
        api.getLeaveTypes(),
        api.getLeaveRequests(),
        api.getAnnouncements(),
        api.getMyAttendanceLogs ? api.getMyAttendanceLogs({ limit: 14 }) : Promise.resolve(null),
        api.getMyPayslips ? api.getMyPayslips() : Promise.resolve(null),
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
    window.addEventListener('nexahr_punch_updated', fetchDashboard);
    window.addEventListener('nexahr_notification_updated', fetchDashboard);
    window.addEventListener('user_profile_updated', fetchDashboard);
    return () => {
      window.removeEventListener('nexahr_punch_updated', fetchDashboard);
      window.removeEventListener('nexahr_notification_updated', fetchDashboard);
      window.removeEventListener('user_profile_updated', fetchDashboard);
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
    const defaultTypes = [
      { id: 'lt-1', name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 18 },
      { id: 'lt-2', name: 'Casual Leave', code: 'CASUAL', daysAllowed: 8 },
      { id: 'lt-3', name: 'Medical / Sick Leave', code: 'SICK', daysAllowed: 12 },
    ];

    const typesToUse = leaveTypes && leaveTypes.length > 0 ? leaveTypes : defaultTypes;

    return typesToUse.slice(0, 3).map((type, idx) => {
      const totalAllowed = Number(type.daysAllowed) || (idx === 0 ? 18 : idx === 1 ? 10 : 6);
      const approvedDays = leaveRequests
        .filter(
          (r) =>
            (r.leaveTypeId === type.id ||
              r.leaveType?.name === type.name ||
              r.leaveType?.code === type.code) &&
            r.status === 'APPROVED'
        )
        .reduce((sum, r) => sum + (Number(r.totalDays) || 1), 0);

      const pendingDays = leaveRequests
        .filter(
          (r) =>
            (r.leaveTypeId === type.id ||
              r.leaveType?.name === type.name ||
              r.leaveType?.code === type.code) &&
            r.status === 'PENDING'
        )
        .reduce((sum, r) => sum + (Number(r.totalDays) || 1), 0);

      const remaining = Math.max(0, totalAllowed - approvedDays);
      const percentage = Math.min(100, Math.max(0, Math.round((remaining / totalAllowed) * 100)));

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
    : formatCurrency(currentUser?.salaryStructure?.basicSalary || 8500);

  const payslipPeriod = latestPayslip?.month
    ? `Paid for Month ${latestPayslip.month}/${latestPayslip.year}`
    : `Period • ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

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
    return dynamicLeaveBalances.reduce((acc, q) => acc + (q.totalAllowed || 0), 0) || 34;
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
      { value: 18, label: 'Annual', tooltip: 'Annual Vacation: 18/18 days left' },
      { value: 10, label: 'Sick', tooltip: 'Medical & Sick: 10/10 days left' },
      { value: 6, label: 'Casual', tooltip: 'Casual & Emergency: 6/6 days left' },
    ];
  }, [dynamicLeaveBalances]);

  const salarySparkData = useMemo(() => {
    if (payslipHistory && payslipHistory.length >= 2) {
      return payslipHistory.slice(0, 6).reverse().map((p) => {
        const amount = Number(p.netSalary) || 8500;
        return {
          value: amount,
          label: `M${p.month}`,
          tooltip: `Month ${p.month}/${p.year}: ${formatCurrency(amount)} • ${p.status || 'PAID'}`,
        };
      });
    }
    const base = currentUser?.salaryStructure?.basicSalary || 8500;
    const allowances = (currentUser?.salaryStructure?.housingAllowance || 0) + (currentUser?.salaryStructure?.transportAllowance || 0);
    const deductions = (currentUser?.salaryStructure?.taxDeductions || 0) + (currentUser?.salaryStructure?.otherDeductions || 0);
    const gross = base + allowances;
    const net = gross - deductions;
    return [
      { value: base, label: 'Basic', tooltip: `Basic Salary: ${formatCurrency(base)}` },
      { value: gross, label: 'Gross', tooltip: `Gross Pay: ${formatCurrency(gross)} (+${formatCurrency(allowances)} Allowances)` },
      { value: Math.max(0, deductions), label: 'Deduct', tooltip: `Deductions & Tax: ${formatCurrency(deductions)}` },
      { value: net, label: 'Net', tooltip: `Net Take-Home: ${formatCurrency(net)}` },
    ];
  }, [payslipHistory, currentUser, formatCurrency]);

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
    return { text: 'Configured', type: 'positive', icon: 'dot', sub: 'Active Salary Structure' };
  }, [latestPayslip, payslipPeriod]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title={`Welcome, ${currentUser?.firstName || 'Alex'}`}
        subtitle="Here is your personal attendance, schedule, and self-service pulse for today."
        onRefresh={fetchDashboard}
        loading={loading}
      />

      {/* HERO BIOMETRIC HARDWARE STATUS BANNER */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Greeting & Digital Clock */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-bold border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>General Shift: 09:00 AM – 05:30 PM (8.5 hrs)</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight leading-tight whitespace-nowrap">
              {isPresent ? 'Biometric Entry Verified & Active' : 'Automated Biometric Station Active'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              Attendance is recorded automatically via biometric hardware machines (Face-ID / Fingerprint).
            </p>

            {/* Live Clock Display */}
            <div className="flex items-center gap-4 pt-2">
              <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right Column: Automated Database Punch Card */}
          <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/20 dark:border-slate-700/60 shadow-2xl flex flex-col items-center text-center min-w-[290px] sm:min-w-[340px]">
            <div className="flex items-center justify-between w-full mb-3 text-xs font-semibold text-slate-300">
              <span>Biometric Status</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isPresent
                    ? todayStatus?.status === 'LATE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                }`}
              >
                {isPresent ? (todayStatus?.status === 'LATE' ? 'Late Recorded' : 'Biometric Synced') : 'Awaiting Device Entry'}
              </span>
            </div>

            {/* In / Out Timestamps from Database */}
            <div className="w-full grid grid-cols-2 gap-2 my-2.5">
              <div className="bg-black/25 rounded-2xl p-3 border border-white/5 text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Device Punch In</div>
                <div className="text-lg sm:text-xl font-mono font-black text-emerald-400 mt-0.5">
                  {formatDbTime(todayStatus?.checkInTime)}
                </div>
                <div className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  {todayStatus?.checkInTime ? 'Recorded' : 'Pending'}
                </div>
              </div>

              <div className="bg-black/25 rounded-2xl p-3 border border-white/5 text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Device Punch Out</div>
                <div className="text-lg sm:text-xl font-mono font-black text-blue-400 mt-0.5">
                  {formatDbTime(todayStatus?.checkOutTime)}
                </div>
                <div className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />
                  {todayStatus?.checkOutTime ? 'Recorded' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Hardware Terminal Navigation Action */}
            <div className="w-full pt-2">
              <button
                onClick={() => navigate('/employee/attendance')}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 shadow-md"
              >
                <span>View Full Attendance History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOP METRICS CARDS (EXACT HIGH-FIDELITY VECTOR SPARKLINE CARDS FOR EMPLOYEE PORTAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
        />

        {/* Card 4: Light Card - Latest Net Salary */}
        <SparkMetricCard
          variant="light"
          title="Latest Net Salary"
          value={netSalaryAmount}
          badgeText={card4Badge.text}
          badgeType={card4Badge.type}
          badgeIcon={card4Badge.icon}
          subtext={card4Badge.sub}
          chartColor="rose"
          presetWave="wave4"
          dataPoints={salarySparkData}
          onClick={() => navigate('/employee/payslips')}
        />
      </div>

      {/* QUICK SELF-SERVICE ACTIONS HUB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/employee/leaves')}
          className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 shadow-soft hover:border-emerald-500/50 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Apply For Leave
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Submit medical, casual, or annual vacation requests
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
        </button>

        <button
          onClick={() => navigate('/employee/payslips')}
          className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 shadow-soft hover:border-blue-500/50 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Download Payslip
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              View monthly salary slips, tax breakdown & benefits
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
        </button>

        <button
          onClick={() => navigate('/employee/helpdesk')}
          className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 shadow-soft hover:border-indigo-500/50 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Helpdesk & Support
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Raise a support ticket for IT equipment, HR or ops
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
        </button>

        <button
          onClick={() => navigate('/employee/documents')}
          className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 shadow-soft hover:border-purple-500/50 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Policies & Handbook
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Access company code of conduct & employee perks
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
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
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {dynamicAnnouncements.length > 0 ? (
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
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.desc || item.summary || item.content}
                      </p>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/80 dark:border-slate-700/40 text-[11px] font-semibold text-slate-400">
                        <span>By {item.author || item.createdBy || 'People Operations & HR'}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
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
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
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
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
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
                          : 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
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
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 shadow-soft text-white border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Assigned Shift Schedule
                </span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Policy
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-400">Shift Name</span>
                <span className="font-bold text-white">General Standard Shift</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-400">Working Hours</span>
                <span className="font-bold text-emerald-400">09:00 AM – 05:30 PM</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {selectedAnnouncement.category || 'NOTICE'}
              </span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                {selectedAnnouncement.title}
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Published {selectedAnnouncement.date || (selectedAnnouncement.createdAt ? formatDate(selectedAnnouncement.createdAt) : 'Aug 14, 2026')} • By {selectedAnnouncement.author || selectedAnnouncement.createdBy || 'Executive Operations'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
              {selectedAnnouncement.desc || selectedAnnouncement.content}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedAnnouncement(null);
                  navigate('/employee/announcements');
                }}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-600/20"
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
