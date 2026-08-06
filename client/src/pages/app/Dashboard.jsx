import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Clock,
  CalendarDays,
  UserX,
  Info,
  Loader2,
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
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      if (res.success && res.data) {
        setMetricsData(res.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch offline or using fallback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  // Extracted Dynamic Values with robust fallbacks
  const metrics = metricsData?.metrics || {};
  const totalEmployees = metrics.totalActiveEmployees ?? metricsData?.summary?.totalActiveEmployees ?? 124;
  const pendingLeaves = metrics.pendingLeaveRequests ?? metricsData?.summary?.pendingLeaveRequests ?? 4;
  const workforcePresence = metrics.workforcePresence ?? 85;
  const onTimeArrival = metrics.onTimeArrival ?? 92.5;
  const absentToday = metrics.absentToday ?? 3;

  // Chart & Table Data Arrays from API
  const lineChartData = metricsData?.charts?.weeklyTrend || [
    { date: '05 Jun, 2026', attendance: 85, peak: 95 },
    { date: '07 Jun, 2026', attendance: 120, peak: 135 },
    { date: '09 Jun, 2026', attendance: 90, peak: 105 },
    { date: '11 Jun, 2026', attendance: 75, peak: 85 },
    { date: '13 Jun, 2026', attendance: 110, peak: 120 },
    { date: '15 Jun, 2026', attendance: 140, peak: 148 },
    { date: '17 Jun, 2026', attendance: 105, peak: 115 },
    { date: '19 Jun, 2026', attendance: 70, peak: 80 },
    { date: '21 Jun, 2026', attendance: 115, peak: 125 },
    { date: '23 Jun, 2026', attendance: 98, peak: 108 },
    { date: '25 Jun, 2026', attendance: 130, peak: 138 },
  ];

  const barChartData = metricsData?.charts?.departmentAttendance || [
    { name: '05 Jun', onTime: 80, late: -5 },
    { name: '07 Jun', onTime: 12, late: -2 },
    { name: '09 Jun', onTime: 45, late: -12 },
    { name: '11 Jun', onTime: 25, late: -8 },
    { name: '13 Jun', onTime: 18, late: -18 },
    { name: '15 Jun', onTime: 35, late: -6 },
    { name: '17 Jun', onTime: 28, late: -4 },
    { name: '19 Jun', onTime: 40, late: -10 },
  ];

  const radarChartData = metricsData?.charts?.departmentPerformance || [
    { subject: 'Punctuality', scoreA: 110, scoreB: 85 },
    { subject: 'Attendance%', scoreA: 130, scoreB: 95 },
    { subject: 'Leave Rate', scoreA: 80, scoreB: 120 },
    { subject: 'Overtime', scoreA: 125, scoreB: 90 },
    { subject: 'Compliance', scoreA: 95, scoreB: 115 },
  ];

  const biometricLogs = metricsData?.recentLogs || [
    { date: '06/07/2026', empCode: 'EMP-101', time: '08:55 AM', status: 'PRESENT' },
    { date: '06/08/2026', empCode: 'EMP-102', time: '09:12 AM', status: 'PRESENT' },
    { date: '06/09/2026', empCode: 'EMP-103', time: '09:45 AM', status: 'LATE' },
    { date: '06/10/2026', empCode: 'EMP-104', time: '08:48 AM', status: 'PRESENT' },
    { date: '06/11/2026', empCode: 'EMP-105', time: '10:05 AM', status: 'LATE' },
  ];

  return (
    <div className="relative font-sans text-slate-800 space-y-6">
      {/* Top Header */}
      <AppPageHeader
        title="Welcome Back, Admin"
        onRefresh={() => loadDashboardMetrics()}
        loading={loading}
      />

      {/* Score Gauge & Main Line Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Score & 4 Stat Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Workforce Presence Gauge Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80">
            <p className="text-xs font-bold text-slate-400 mb-1">Today's Workforce Presence</p>
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg mb-4"></div>
            ) : (
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">{workforcePresence}%</h2>
            )}

            <div className="relative pt-2 pb-6">
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-emerald-400 to-emerald-500 shadow-inner"></div>
              <div
                className="absolute top-0.5 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                style={{ left: `${Math.min(100, Math.max(0, workforcePresence))}%` }}
              >
                <div className="w-3.5 h-6 bg-white rounded-full shadow-md border-2 border-emerald-500 ring-2 ring-emerald-500/20"></div>
              </div>

              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2 px-1">
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Total Employees */}
            <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between hover:shadow-soft-hover transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <Info className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">Total Employees</p>
                {loading ? (
                  <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalEmployees}</h3>
                )}
              </div>
            </div>

            {/* Card 2: On-Time Arrival */}
            <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between hover:shadow-soft-hover transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <Info className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">On-Time Arrival</p>
                {loading ? (
                  <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{onTimeArrival}%</h3>
                )}
              </div>
            </div>

            {/* Card 3: Pending Leaves */}
            <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between hover:shadow-soft-hover transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <Info className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">Pending Leaves</p>
                {loading ? (
                  <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{pendingLeaves}</h3>
                )}
              </div>
            </div>

            {/* Card 4: Absent Today */}
            <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between hover:shadow-soft-hover transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
                <Info className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">Absent Today</p>
                {loading ? (
                  <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{absentToday}</h3>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Main Purple Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">Weekly Biometric Attendance Trend</h3>
              <Info className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-slate-500" />
            </div>
            {loading && <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#fff', border: 'none' }} />
                <Area type="monotone" dataKey="attendance" stroke="#9333EA" strokeWidth={3} fillOpacity={1} fill="url(#purpleGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800">Department Attendance</h3>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none' }} />
                <Bar dataKey="onTime" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#F43F5E" radius={[0, 0, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800">Department Performance</h3>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="70%" data={radarChartData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748B' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Shift A" dataKey="scoreA" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                <Radar name="Shift B" dataKey="scoreB" stroke="#F97316" fill="#F97316" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800">Live Biometric Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase">
                  <th className="pb-2 px-1">Date</th>
                  <th className="pb-2 px-1">Emp Code</th>
                  <th className="pb-2 px-1 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] font-medium">
                {biometricLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-1 text-slate-500">{log.date}</td>
                    <td className="py-2.5 px-1 font-bold text-slate-800">{log.empCode}</td>
                    <td className={`py-2.5 px-1 text-right font-extrabold ${log.status === 'PRESENT' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {log.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
