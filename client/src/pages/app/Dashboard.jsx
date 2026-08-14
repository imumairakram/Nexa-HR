import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Clock,
  CalendarDays,
  UserX,
  Info,
  Loader2,
  UserPlus,
  Fingerprint,
  Building2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      if (res && res.success && res.data) {
        setMetricsData(res.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch offline or using current DB state', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  // Extracted Dynamic Values directly from PostgreSQL Database
  const metrics = metricsData?.metrics || {};
  const totalEmployees = metrics.totalActiveEmployees ?? 0;
  const pendingLeaves = metrics.pendingLeaveRequests ?? 0;
  const workforcePresence = metrics.workforcePresence ?? 0;
  const onTimeArrival = metrics.onTimeArrival ?? 0;
  const absentToday = metrics.absentToday ?? 0;

  // Chart & Table Data Arrays directly from API
  const lineChartData = metricsData?.charts?.weeklyTrend || [];
  const barChartData = metricsData?.charts?.departmentAttendance || [];
  const radarChartData = metricsData?.charts?.departmentPerformance || [];
  const biometricLogs = metricsData?.recentLogs || [];

  return (
    <div className="relative font-sans text-slate-800 dark:text-slate-100 space-y-6">
      {/* Top Header */}
      <AppPageHeader
        title="Admin Control Center & Performance Dashboard"
        subtitle="Live PostgreSQL analytics, workforce biometric attendance tracking, and leave pipeline."
        onRefresh={() => loadDashboardMetrics()}
        loading={loading}
      />

      {/* Score Gauge & Main Line Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Score & 4 Stat Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Workforce Presence Gauge Widget */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Workforce Presence</p>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                Live Metric
              </span>
            </div>
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg mb-4"></div>
            ) : (
              <div className="flex items-baseline gap-2 mb-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{workforcePresence}%</h2>
                <span className="text-xs font-medium text-slate-400">of active staff logged in</span>
              </div>
            )}

            <div className="relative pt-2 pb-4">
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-emerald-500 shadow-inner"></div>
              <div
                className="absolute top-0.5 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                style={{ left: `${Math.min(100, Math.max(0, workforcePresence))}%` }}
              >
                <div className="w-3.5 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md border-2 border-emerald-500 ring-2 ring-emerald-500/20"></div>
              </div>

              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2 px-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Total Employees */}
            <div
              onClick={() => navigate('/app/employees')}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-blue-500/40 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Headcount</p>
                {loading ? (
                  <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalEmployees}</h3>
                )}
              </div>
            </div>

            {/* Card 2: On-Time Arrival */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">On-Time Arrival</p>
                {loading ? (
                  <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{onTimeArrival}%</h3>
                )}
              </div>
            </div>

            {/* Card 3: Pending Leaves */}
            <div
              onClick={() => navigate('/app/leaves')}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-amber-500/40 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Leaves</p>
                {loading ? (
                  <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{pendingLeaves}</h3>
                )}
              </div>
            </div>

            {/* Card 4: Absent Today */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Absent Today</p>
                {loading ? (
                  <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{absentToday}</h3>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Main Purple Area Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Weekly Biometric Attendance Trend</h3>
              <p className="text-xs text-slate-400 font-medium">Real daily staff check-ins logged via biometric hardware</p>
            </div>
            {loading && <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />}
          </div>

          <div className="h-64 w-full">
            {lineChartData.length > 0 && lineChartData.some((d) => d.attendance > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#fff', border: 'none' }} />
                  <Area type="monotone" dataKey="attendance" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#purpleGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Fingerprint className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Weekly Attendance Logs Yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Records will dynamically appear here when staff clock in via the attendance portal.</p>
                <button
                  onClick={() => navigate('/app/attendance')}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Open Attendance Simulator →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Department Attendance */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Department Attendance</h3>
              <p className="text-[11px] text-slate-400">On-time vs Late arrivals by unit</p>
            </div>
          </div>
          <div className="h-56 w-full">
            {barChartData.length > 0 && barChartData.some((d) => d.onTime > 0 || d.late > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none' }} />
                  <Bar dataKey="onTime" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill="#F43F5E" radius={[0, 0, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Department Check-Ins Today</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Awaiting today's department check-in logs.</p>
              </div>
            )}
          </div>
        </div>

        {/* Organization Status Radar */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Organization Operations Health</h3>
              <p className="text-[11px] text-slate-400">Punctuality, presence & capacity</p>
            </div>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="70%" data={radarChartData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748B' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Current" dataKey="scoreA" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                <Radar name="Target" dataKey="scoreB" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Biometric Logs */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Live Today's Check-Ins</h3>
              <p className="text-[11px] text-slate-400">{biometricLogs.length} events logged</p>
            </div>
            <button
              onClick={() => navigate('/app/attendance')}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          <div className="overflow-x-auto h-56">
            {biometricLogs.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase">
                    <th className="pb-2 px-1">Employee</th>
                    <th className="pb-2 px-1 text-right">Check-In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] font-medium">
                  {biometricLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-1">
                        <div className="font-bold text-slate-900 dark:text-white">{log.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.empCode}</div>
                      </td>
                      <td className="py-2.5 px-1 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-50 text-amber-600'}`}>
                          {log.time}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Logs Recorded Today</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Use the Attendance Simulator to log staff check-ins.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
