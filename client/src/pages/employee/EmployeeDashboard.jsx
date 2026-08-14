import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Users,
  Briefcase,
  Layers,
  Fingerprint,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
];

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [colleagues, setColleagues] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  // Live clock timer update
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
      const [dashRes, empRes, leaveRes] = await Promise.allSettled([
        api.getEmployeeDashboard(),
        api.getEmployees(),
        api.getLeaveTypes(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboardData(dashRes.value.data);
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        setColleagues(empRes.value.data.employees.slice(0, 5));
      }
      if (leaveRes.status === 'fulfilled' && leaveRes.value?.data?.leaveTypes) {
        setLeaveTypes(leaveRes.value.data.leaveTypes);
      }
    } catch (err) {
      console.warn('Failed to load employee dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const currentUser = (() => {
    if (dashboardData?.user) return dashboardData.user;
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : { firstName: 'Employee', lastName: 'User' };
    } catch {
      return { firstName: 'Employee', lastName: 'User' };
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

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title={`Welcome, ${currentUser?.firstName || 'Staff Member'}`}
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
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-bold border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>General Shift: 09:00 AM – 05:30 PM (8.5 hrs)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {isPresent ? 'Biometric Entry Verified & Active' : 'Automated Biometric Station Active'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isPresent
                ? 'Your biometric entry has been recorded directly into the PostgreSQL database.'
                : 'Attendance is recorded automatically via biometric hardware machines (Face-ID / Fingerprint).'}
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

      {/* TOP METRICS CARDS */}
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
            <span className="text-2xl font-black text-slate-900 dark:text-white">{monthlyAttendance.presentDays} Days</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">{monthlyAttendance.lateDays} Late check-ins</p>
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
            <span className="text-2xl font-black text-slate-900 dark:text-white">{leavesSummary.approved} Approved</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">{leavesSummary.pending} Pending review</p>
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
            <span className="text-2xl font-black text-slate-900 dark:text-white">{monthlyAttendance.totalWorkHours} h</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Computed from live timestamps</p>
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
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {latestPayslip ? `$${latestPayslip.netSalary.toLocaleString()}` : '$0.00'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            {latestPayslip ? `Paid for Month ${latestPayslip.month}/${latestPayslip.year}` : 'Awaiting first pay run'}
          </p>
        </div>
      </div>

      {/* TEAM COLLEAGUES PREVIEW */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">Team Directory Quick Access</h3>
            <p className="text-xs text-slate-400">Your active colleagues across departments</p>
          </div>
          <button
            onClick={() => navigate('/employee/directory')}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            View Full Directory →
          </button>
        </div>

        {colleagues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {colleagues.map((member, idx) => (
              <div
                key={member.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40 flex items-center gap-3"
              >
                <img
                  src={DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length]}
                  alt={member.firstName}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="overflow-hidden">
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {member.profile?.designation?.title || member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            No colleagues registered yet. Newly onboarded employees will appear here dynamically.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
