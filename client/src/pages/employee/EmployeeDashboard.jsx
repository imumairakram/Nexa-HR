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
import { useRegionalSettings } from '../../context/RegionalSettingsContext';
import { api } from '../../services/api';

const ALL_HOLIDAYS_MASTER = [
  { id: 1, name: 'Independence Day (Youm-e-Azadi)', date: '2026-08-14', displayDate: 'Aug 14, 2026', day: 'Friday', type: 'Gazetted National', isLongWeekend: true },
  { id: 2, name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: '2026-08-25', displayDate: 'Aug 25, 2026', day: 'Tuesday', type: 'Gazetted Religious', isLongWeekend: false },
  { id: 3, name: 'Iqbal Day (Allama Iqbal Memorial)', date: '2026-11-09', displayDate: 'Nov 09, 2026', day: 'Monday', type: 'Gazetted National', isLongWeekend: true },
  { id: 4, name: 'Quaid-e-Azam Day / Christmas', date: '2026-12-25', displayDate: 'Dec 25, 2026', day: 'Friday', type: 'Gazetted National', isLongWeekend: true },
  { id: 5, name: 'Kashmir Solidarity Day', date: '2027-02-05', displayDate: 'Feb 05, 2027', day: 'Friday', type: 'Gazetted National', isLongWeekend: true },
  { id: 6, name: 'Pakistan Day (Resolution Day)', date: '2027-03-23', displayDate: 'Mar 23, 2027', day: 'Tuesday', type: 'Gazetted National', isLongWeekend: false },
  { id: 7, name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', date: '2027-04-10', displayDate: 'Apr 10, 2027', day: 'Saturday', type: 'Gazetted Religious', isLongWeekend: true },
  { id: 8, name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', date: '2027-04-11', displayDate: 'Apr 11, 2027', day: 'Sunday', type: 'Gazetted Religious', isLongWeekend: true },
  { id: 9, name: 'Labour Day (May Day)', date: '2027-05-01', displayDate: 'May 01, 2027', day: 'Saturday', type: 'Gazetted National', isLongWeekend: true },
  { id: 10, name: 'Eid-ul-Adha (Feast of Sacrifice)', date: '2027-06-16', displayDate: 'Jun 16, 2027', day: 'Wednesday', type: 'Gazetted Religious', isLongWeekend: true },
];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-01',
    title: 'Annual Performance Appraisal Cycle (FY2026)',
    desc: 'Self-assessment reviews are now open. Please complete your goals and KPIs before month-end.',
    category: 'HR & TALENT',
    date: 'Aug 12, 2026',
    author: 'People Operations',
  },
  {
    id: 'ann-02',
    title: 'Comprehensive Health Insurance Policy Renewal',
    desc: 'Updated outpatient (OPD) and hospitalization coverage tiers have been synced with employee benefits portal.',
    category: 'BENEFITS',
    date: 'Aug 08, 2026',
    author: 'Corporate Benefits',
  },
  {
    id: 'ann-03',
    title: 'Cloud Infrastructure & Engineering All-Hands',
    desc: 'Quarterly engineering sync and product roadmap showcase scheduled for this Thursday at 3:00 PM.',
    category: 'OPERATIONS',
    date: 'Aug 04, 2026',
    author: 'Engineering Leadership',
  },
];

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate, formatTime } = useRegionalSettings();

  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Live digital clock timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real database attendance & dashboard metrics
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, leaveRes, reqRes, annRes] = await Promise.allSettled([
        api.getEmployeeDashboard(),
        api.getLeaveTypes(),
        api.getLeaveRequests(),
        api.getAnnouncements(),
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

  // Compute dynamic upcoming holidays with live day count
  const dynamicUpcomingHolidays = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return ALL_HOLIDAYS_MASTER.map((h) => {
      const hDate = new Date(h.date);
      const hMidnight = new Date(hDate.getFullYear(), hDate.getMonth(), hDate.getDate()).getTime();
      const diffDays = Math.round((hMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

      let countdown = '';
      if (diffDays === 0) countdown = 'Today • Active';
      else if (diffDays === 1) countdown = 'Tomorrow';
      else if (diffDays > 1) countdown = `In ${diffDays} Days`;
      else countdown = 'Observed';

      return {
        ...h,
        diffDays,
        countdown,
      };
    })
      .filter((h) => h.diffDays >= 0)
      .slice(0, 4);
  }, [currentTime]);

  // Compute dynamic leave quota & balances from real database leave types and requests
  const dynamicLeaveBalances = useMemo(() => {
    const defaultTypes = [
      { id: 'lt-1', name: 'Annual Vacation', code: 'ANNUAL', daysAllowed: 18 },
      { id: 'lt-2', name: 'Sick & Medical', code: 'SICK', daysAllowed: 10 },
      { id: 'lt-3', name: 'Casual Emergency', code: 'CASUAL', daysAllowed: 6 },
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

  // Dynamic Announcements list from backend or fallback
  const dynamicAnnouncements = useMemo(() => {
    if (announcements && announcements.length > 0) {
      return announcements.slice(0, 3);
    }
    return INITIAL_ANNOUNCEMENTS;
  }, [announcements]);

  const netSalaryAmount = latestPayslip?.netSalary
    ? formatCurrency(latestPayslip.netSalary)
    : formatCurrency(currentUser?.salaryStructure?.basicSalary || 9550);

  const payslipPeriod = latestPayslip?.month
    ? `Paid for Month ${latestPayslip.month}/${latestPayslip.year}`
    : `Current Period • ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

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

      {/* TOP METRICS CARDS (100% DYNAMIC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Days Present */}
        <div
          onClick={() => navigate('/employee/attendance')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Present This Month</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {monthlyAttendance.presentDays} Days
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            {monthlyAttendance.lateDays} Late check-ins
          </p>
        </div>

        {/* Card 2: Leave Summary */}
        <div
          onClick={() => navigate('/employee/leaves')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Approved Leaves</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {leavesSummary.approved} Approved
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            {leavesSummary.pending} Pending review
          </p>
        </div>

        {/* Card 3: Total Work Hours */}
        <div
          onClick={() => navigate('/employee/attendance')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Logged Hours (Month)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {monthlyAttendance.totalWorkHours} h
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            Computed from live timestamps
          </p>
        </div>

        {/* Card 4: Latest Payslip */}
        <div
          onClick={() => navigate('/employee/payslips')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Latest Net Salary</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {netSalaryAmount}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            {payslipPeriod}
          </p>
        </div>
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
              {dynamicAnnouncements.map((item, idx) => {
                const itemDate = item.date || (item.createdAt ? formatDate(item.createdAt) : 'Aug 14, 2026');
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
                      {item.desc || item.content}
                    </p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/80 dark:border-slate-700/40 text-[11px] font-semibold text-slate-400">
                      <span>By {item.author || item.createdBy || 'Operations Team'}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                        Read Notice →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Leave Quota & Balances */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    My Leave Quota & Balances
                  </h3>
                  <p className="text-xs text-slate-400">Live entitlement and consumed balances for current year</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/employee/leaves')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer border border-emerald-200 dark:border-emerald-800/60"
              >
                Request Leave
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dynamicLeaveBalances.map((quota) => {
                const colorTheme =
                  quota.colorIdx === 0
                    ? { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }
                    : quota.colorIdx === 1
                    ? { bar: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' }
                    : { bar: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' };

                return (
                  <div
                    key={quota.id}
                    onClick={() => navigate('/employee/leaves')}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40 space-y-2 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate pr-1">
                        {quota.name}
                      </span>
                      <span className={`text-[10px] font-bold ${colorTheme.text} shrink-0`}>
                        {quota.percentage}% Left
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {quota.remaining}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        / {quota.totalAllowed} Days
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`${colorTheme.bar} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${quota.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                      <span>Used: {quota.approvedDays}d</span>
                      {quota.pendingDays > 0 && (
                        <span className="text-amber-500">Pending: {quota.pendingDays}d</span>
                      )}
                    </div>
                  </div>
                );
              })}
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
                    {holiday.isLongWeekend && (
                      <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">
                        Long Weekend
                      </span>
                    )}
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
