import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Rocket,
  Box,
  Info,
  BarChart2,
  Clock,
  CalendarDays,
  UserX,
  User,
  Settings,
  LogOut,
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Weekly Biometric Attendance Trend (Main Purple Gradient Area Chart)
  const lineChartData = [
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

  // Department Attendance Metrics (Green/Red Bar Chart)
  const barChartData = [
    { name: '05 Jun', onTime: 80, late: -5 },
    { name: '07 Jun', onTime: 12, late: -2 },
    { name: '09 Jun', onTime: 45, late: -12 },
    { name: '11 Jun', onTime: 25, late: -8 },
    { name: '13 Jun', onTime: 18, late: -18 },
    { name: '15 Jun', onTime: 35, late: -6 },
    { name: '17 Jun', onTime: 28, late: -4 },
    { name: '19 Jun', onTime: 40, late: -10 },
  ];

  // Department Performance (Radar Chart)
  const radarChartData = [
    { subject: 'Punctuality', scoreA: 110, scoreB: 85 },
    { subject: 'Attendance%', scoreA: 130, scoreB: 95 },
    { subject: 'Leave Rate', scoreA: 80, scoreB: 120 },
    { subject: 'Overtime', scoreA: 125, scoreB: 90 },
    { subject: 'Compliance', scoreA: 95, scoreB: 115 },
  ];

  // Live Biometric Logs Data (Table)
  const biometricLogs = [
    { date: '06/07/2026', empCode: 'EMP-101', time: '08:55 AM', status: 'PRESENT', type: 'IN', diff: '+$8.5h' },
    { date: '06/08/2026', empCode: 'EMP-102', time: '09:12 AM', status: 'PRESENT', type: 'IN', diff: '+$8.0h' },
    { date: '06/09/2026', empCode: 'EMP-103', time: '09:45 AM', status: 'LATE', type: 'IN', diff: '-$3.12' },
    { date: '06/10/2026', empCode: 'EMP-104', time: '08:48 AM', status: 'PRESENT', type: 'IN', diff: '+$8.76' },
    { date: '06/11/2026', empCode: 'EMP-105', time: '10:05 AM', status: 'LATE', type: 'IN', diff: '-$2.34' },
    { date: '06/12/2026', empCode: 'EMP-106', time: '08:30 AM', status: 'PRESENT', type: 'IN', diff: '+$9.00' },
    { date: '06/13/2026', empCode: 'EMP-107', time: '09:50 AM', status: 'ABSENT', type: 'OUT', diff: '-$4.67' },
  ];

  return (
    <div className="relative font-sans text-slate-800 space-y-6">
      {/* Top Header Horizontal Pill Bar (Matching Sidebar rounded pill shape) */}
      <div className="bg-white rounded-full px-6 py-3.5 shadow-soft border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Prominent Dashboard Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        </div>

        {/* Right Controls: Wider Search Bar, Notification Icon, Profile Dropdown */}
        <div className="flex items-center gap-3.5">
          {/* 1. Wider Functional Search Bar */}
          <div className="relative w-64 sm:w-80 md:w-[380px]">
            <input
              type="text"
              placeholder="Search employees, attendance, logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-full pl-5 pr-11 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white shadow-inner transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 stroke-[2]" />
          </div>

          {/* 2. Notification Icon Button */}
          <button className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-sm border border-slate-200/80 relative transition-all shrink-0">
            <Bell className="w-4 h-4 text-slate-700 stroke-[1.75]" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2.5 right-2.5 ring-2 ring-white"></span>
          </button>

          {/* 3. Image/Avatar Profile Button with Active Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 p-1.5 pr-3.5 rounded-full border border-slate-200/80 shadow-sm transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-purple-500/20">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] font-semibold text-slate-400 block leading-tight">@admin</span>
                <span className="text-xs font-bold text-slate-900 block leading-tight">System Admin</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Active Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">System Admin</p>
                  <p className="text-[10px] text-slate-400">admin@company.com</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>System Settings</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      localStorage.removeItem('token');
                      window.location.href = '/';
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Greeting Header & Workforce Score Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-slate-400">Tuesday, 20 Jun 2026</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Welcome Back, Admin
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md flex items-center gap-2 transition-all">
            <Rocket className="w-4 h-4 text-emerald-400" />
            <span>Sync Hardware</span>
          </button>
          <button className="bg-white hover:bg-slate-50 text-slate-700 p-2.5 rounded-2xl shadow-sm border border-slate-200/80 transition-all">
            <Box className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Score Gauge & Main Line Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Score & 4 Stat Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Workforce Presence Gauge Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80">
            <p className="text-xs font-bold text-slate-400 mb-1">Today's Workforce Presence</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">85%</h2>

            {/* Rainbow Gradient Gauge Bar */}
            <div className="relative pt-2 pb-6">
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-emerald-400 to-emerald-500 shadow-inner"></div>

              {/* Slider Indicator Pill at 85% position */}
              <div
                className="absolute top-0.5 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                style={{ left: '85%' }}
              >
                <div className="w-3.5 h-6 bg-white rounded-full shadow-md border-2 border-emerald-500 ring-2 ring-emerald-500/20"></div>
              </div>

              {/* Ticks under gauge */}
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

          {/* 4 Stat Cards Grid (2x2) */}
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
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">124</h3>
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
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">92.5%</h3>
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
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">4</h3>
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
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">3</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Main Purple Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">Weekly Biometric Attendance Trend</h3>
              <Info className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-slate-500" />
            </div>
          </div>

          {/* Smooth Recharts Purple Gradient Area Chart */}
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
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#fff', border: 'none' }}
                  cursor={{ stroke: '#A855F7', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#9333EA"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row - 3 Cards (Bar Chart, Radar Chart, Live Biometric Table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Bottom Left Card: Department Attendance Metrics (Bar Chart - 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">Department Attendance Metrics</h3>
              <Info className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-slate-500" />
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="onTime" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#F43F5E" radius={[0, 0, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Middle Card: Department Performance (Radar Chart - 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">Department Performance</h3>
              <Info className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-slate-500" />
            </div>
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

        {/* Bottom Right Card: Live Biometric Logs (Table - 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('recent')}
                className={`pb-1 transition-all ${
                  activeTab === 'recent'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Live Biometric Logs
              </button>
              <button
                onClick={() => setActiveTab('open')}
                className={`pb-1 transition-all ${
                  activeTab === 'open'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Hardware Status
              </button>
            </div>
          </div>

          {/* Table Data */}
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
                      {log.status === 'PRESENT' ? `+${log.time}` : `-${log.time}`}
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
