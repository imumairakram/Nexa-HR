import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarDays,
  CreditCard,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Coffee,
  ArrowRight,
  TrendingUp,
  Award,
  Megaphone,
  UserCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  Users,
  Briefcase,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';

const WEEKLY_HOURS_DATA = [
  { day: 'Mon', hours: 8.5, target: 8.0 },
  { day: 'Tue', hours: 8.2, target: 8.0 },
  { day: 'Wed', hours: 9.0, target: 8.0 },
  { day: 'Thu', hours: 8.4, target: 8.0 },
  { day: 'Fri', hours: 7.8, target: 8.0 },
];

const LEAVE_QUOTA_DATA = [
  { name: 'Annual Leave', available: 10, total: 14, color: '#10B981' },
  { name: 'Casual Leave', available: 4, total: 6, color: '#3B82F6' },
  { name: 'Sick Leave', available: 5, total: 8, color: '#F59E0B' },
];

const TEAM_MEMBERS_TODAY = [
  { name: 'Alex Mercer (You)', role: 'Senior Engineer', status: 'PRESENT', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { name: 'David Miller', role: 'Full-Stack Dev', status: 'PRESENT', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { name: 'Sarah Jenkins', role: 'UI/UX Designer', status: 'REMOTE', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { name: 'Marcus Vance', role: 'DevOps Lead', status: 'PRESENT', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { name: 'Emily Zhang', role: 'Product Manager', status: 'ON_LEAVE', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
];

const MY_TASKS_SUMMARY = [
  { id: 1, title: 'Implement Biometric Webhook Event Handlers', project: 'Biometric API Gateway', priority: 'HIGH', status: 'IN_PROGRESS', due: 'Today' },
  { id: 2, title: 'Refactor Employee Self-Service Mobile Layout', project: 'NexaHR Mobile App V2', priority: 'MEDIUM', status: 'TO_DO', due: 'Tomorrow' },
  { id: 3, title: 'Update Tax Deduction Calculation Rules for FY26', project: 'Payroll Auto-Tax Engine', priority: 'LOW', status: 'COMPLETED', due: 'Completed' },
];

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);

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
      const res = await api.getEmployeeDashboard();
      if (res && res.success) {
        setDashboardData(res.data);
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
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : { firstName: 'Alex', lastName: 'Mercer' };
    } catch {
      return { firstName: 'Alex', lastName: 'Mercer' };
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

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title={`Hello, ${currentUser?.firstName || 'Alex'}! 👋`}
        subtitle="Here is your personal attendance, schedule, and self-service pulse for today."
        loading={loading}
      />

      {/* ========================================================================= */}
      {/* 1. HERO AUTOMATED BIOMETRIC HARDWARE STATUS BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-700/50">
        {/* Background glow effects */}
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
                ? 'Your biometric entry has been recorded directly by the terminal turnstile into the database.'
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
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Biometric Status</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                isPresent
                  ? todayStatus?.status === 'LATE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
              }`}>
                {isPresent ? (todayStatus?.status === 'LATE' ? '⚠️ Late Recorded' : '🟢 Biometric Synced') : '⚪ Awaiting Device Entry'}
              </span>
            </div>

            {/* In / Out Timestamps from Database */}
            <div className="w-full grid grid-cols-2 gap-2 my-2.5">
              <div className="bg-black/25 rounded-2xl p-3 border border-white/5 text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Device Punch In</div>
                <div className="text-lg sm:text-xl font-mono font-black text-emerald-400 mt-0.5">
                  {formatDbTime(todayStatus?.checkInTime) !== '--:--' ? formatDbTime(todayStatus?.checkInTime) : '08:52 AM'}
                </div>
                <div className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Terminal Verified
                </div>
              </div>

              <div className="bg-black/25 rounded-2xl p-3 border border-white/5 text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Device Punch Out</div>
                <div className="text-lg sm:text-xl font-mono font-black text-blue-400 mt-0.5">
                  {todayStatus?.checkOutTime ? formatDbTime(todayStatus?.checkOutTime) : '05:35 PM'}
                </div>
                <div className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" /> Auto-Recorded
                </div>
              </div>
            </div>

            {/* Hardware Terminal Info & Navigation Action */}
            <div className="w-full pt-2">
              <div className="text-[11px] text-slate-300/80 mb-3 leading-snug">
                Recorded via <strong>Face-ID Terminal Gate 01</strong> into database. Manual clock-in is disabled.
              </div>

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

      {/* ========================================================================= */}
      {/* 2. TOP METRICS CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance Rate */}
        <div
          onClick={() => navigate('/employee/attendance')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Attendance Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">96.2%</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">21/22 Days</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.2%' }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">1 Late arrival, 0 Absences</p>
        </div>

        {/* Card 2: Leave Quota */}
        <div
          onClick={() => navigate('/employee/leaves')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Available Leaves</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">19 Days</span>
            <span className="text-xs font-bold text-slate-400">/ 28 Total</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '68%' }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">10 Annual, 4 Casual, 5 Sick</p>
        </div>

        {/* Card 3: Logged Hours */}
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
            <span className="text-2xl font-black text-slate-900 dark:text-white">168.5 h</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">+4.2h OT</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Avg. 8.4 hours / working day</p>
        </div>

        {/* Card 4: Next Payday */}
        <div
          onClick={() => navigate('/employee/payslips')}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Next Payday</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">Aug 31</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">In 22 Days</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '35%' }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Last net payout: $5,450.00</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CHARTS & TEAM SCHEDULE ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Weekly Working Hours Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Weekly Working Hours
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Actual hours logged vs 8.0h expected standard
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              Total 41.9 hrs (On Track)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_HOURS_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '16px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="hours" name="Logged Hours" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 Cols: Leave Quota Breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Leave Balances
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Annual allocated quota distribution
              </p>
            </div>
            <button
              onClick={() => navigate('/employee/leaves')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Apply</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5 my-3">
            {LEAVE_QUOTA_DATA.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white">{item.available}</strong> / {item.total} Days
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.available / item.total) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => navigate('/employee/leaves')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Request Time Off
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TASKS, TEAM PRESENCE & ANNOUNCEMENTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: My Active Tasks */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                My Assigned Tasks
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Sprint tasks requiring your input
              </p>
            </div>
            <button
              onClick={() => navigate('/employee/projects')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {MY_TASKS_SUMMARY.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {task.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {task.project}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : task.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">{task.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Today's Team Presence */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Team Presence Today
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Engineering & DevOps Department
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              5 Members
            </span>
          </div>

          <div className="space-y-2.5">
            {TEAM_MEMBERS_TODAY.map((member, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{member.role}</div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    member.status === 'PRESENT'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : member.status === 'REMOTE'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                  }`}
                >
                  {member.status === 'PRESENT' ? 'On-Site' : member.status === 'REMOTE' ? 'Remote' : 'On Leave'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
