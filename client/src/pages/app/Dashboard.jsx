import React, { useState, useEffect, useMemo } from 'react';
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
  Zap,
  CheckCircle2,
  X,
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
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { api } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener('user_profile_updated', syncUser);
    window.addEventListener('session_started', syncUser);
    return () => {
      window.removeEventListener('user_profile_updated', syncUser);
      window.removeEventListener('session_started', syncUser);
    };
  }, []);

  const mobileDashboardTitle = useMemo(() => {
    const role = (currentUser?.role || '').toUpperCase();
    const portalRole = (currentUser?.portalRole || '').toLowerCase();
    const email = (currentUser?.email || '').toLowerCase();
    const designation = (currentUser?.designation || '').toLowerCase();

    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || email.startsWith('admin@')) {
      return 'Admin Dashboard';
    }
    if (
      role === 'HR_MANAGER' ||
      role === 'HR' ||
      role.includes('HR') ||
      portalRole === 'hr' ||
      email.startsWith('hr@') ||
      designation.includes('hr')
    ) {
      return 'HR Dashboard';
    }
    if (
      role === 'EMPLOYEE' ||
      role === 'STAFF' ||
      portalRole === 'employee' ||
      email.startsWith('user@') ||
      email.startsWith('employee@')
    ) {
      return 'Employee Dashboard';
    }
    return 'Admin Dashboard';
  }, [currentUser]);

  const desktopTitle = useMemo(() => {
    if (mobileDashboardTitle === 'HR Dashboard') {
      return 'HR Dashboard';
    }
    if (mobileDashboardTitle === 'Employee Dashboard') {
      return 'Employee Dashboard';
    }
    return 'Admin Dashboard';
  }, [mobileDashboardTitle]);

  const isHrPortal = useMemo(() => {
    return mobileDashboardTitle === 'HR Dashboard';
  }, [mobileDashboardTitle]);

  const [metricsData, setMetricsData] = useState(() => api.getCached('/dashboard/admin')?.data || null);
  const [loading, setLoading] = useState(() => !api.hasCached('/dashboard/admin'));
  const [deptTimeframe, setDeptTimeframe] = useState('today');
  const [trendTimeframe, setTrendTimeframe] = useState('7d');

  // Quick Biometric Punch Modal State
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState(() => api.getCached('/employees')?.data?.employees || []);
  const [punchForm, setPunchForm] = useState({
    employeeCode: '',
    type: 'IN',
    timestamp: new Date().toISOString().slice(0, 16),
  });
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchToast, setPunchToast] = useState('');
  const [simulatePunchEnabled, setSimulatePunchEnabled] = useState(false);

  const loadDashboardMetrics = async () => {
    if (!api.hasCached('/dashboard/admin')) {
      setLoading(true);
    }
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

  const loadEmployeesForPunch = async () => {
    try {
      const res = await api.getEmployees();
      if (res && res.success && res.data?.employees) {
        setEmployeesList(res.data.employees);
        if (res.data.employees.length > 0 && !punchForm.employeeCode) {
          setPunchForm((prev) => ({
            ...prev,
            employeeCode: res.data.employees[0].employeeCode,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to load employees for quick punch:', err);
    }
  };

  useEffect(() => {
    loadDashboardMetrics();
    loadEmployeesForPunch();
    api.getSimulatePunchStatus().then((r) => r && r.success && setSimulatePunchEnabled(r.enabled)).catch(() => {});
    // Warm client cache in idle background for smooth instant navigation across all pages
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        api.prefetch(['/employees', '/departments', '/designations', '/attendance', '/leaves/requests', '/payroll/payslips']);
      }, 300);
    }
  }, []);

  const handleQuickPunch = async (e) => {
    e.preventDefault();
    if (!punchForm.employeeCode) return;
    setPunchLoading(true);
    try {
      const res = await api.simulatePunch({
        employeeCode: punchForm.employeeCode,
        type: punchForm.type,
        timestamp: new Date(punchForm.timestamp).toISOString(),
      });

      if (res && res.success) {
        setPunchToast(`Biometric ${punchForm.type} punch recorded for ${punchForm.employeeCode}!`);
        setIsPunchModalOpen(false);
        await loadDashboardMetrics();
      } else {
        setPunchToast(`Error: ${res?.message || 'Punch failed'}`);
      }
    } catch (err) {
      setPunchToast(`Error: ${err.message}`);
    } finally {
      setPunchLoading(false);
      setTimeout(() => setPunchToast(''), 4500);
    }
  };

  // Extracted Dynamic Values directly from PostgreSQL Database
  const metrics = metricsData?.metrics || {};
  const widgets = metricsData?.widgets || {};
  const totalEmployees = metrics.totalActiveEmployees ?? 0;
  const pendingLeaves = metrics.pendingLeaveRequests ?? 0;
  const workforcePresence = metrics.workforcePresence ?? 0;
  const onTimeArrival = metrics.onTimeArrival ?? 0;
  const absentToday = metrics.absentToday ?? 0;

  const todayStats = metricsData?.todayAttendance?.stats || {};
  const todayPresentCount = todayStats.present ?? (totalEmployees > 0 && workforcePresence > 0 ? Math.round((workforcePresence / 100) * totalEmployees) : 0);
  const todayOnTimeCount = todayStats.onTime ?? 0;

  // Chart & Table Data Arrays directly from API
  const trendTimeframes = metricsData?.charts?.attendanceTrends;
  const lineChartData = useMemo(() => {
    if (trendTimeframes && trendTimeframes[trendTimeframe]) {
      return trendTimeframes[trendTimeframe];
    }
    return metricsData?.charts?.weeklyTrend || [];
  }, [trendTimeframes, trendTimeframe, metricsData]);

  const totalPeriodAttendance = useMemo(
    () => lineChartData.reduce((acc, d) => acc + (d.attendance || 0), 0),
    [lineChartData]
  );

  const deptTimeframes = metricsData?.charts?.departmentAttendanceTimeframes;
  const barChartData = useMemo(() => {
    if (deptTimeframes && deptTimeframes[deptTimeframe]) {
      return deptTimeframes[deptTimeframe];
    }
    return metricsData?.charts?.departmentAttendance || [];
  }, [deptTimeframes, deptTimeframe, metricsData]);

  const radarChartData = metricsData?.charts?.departmentPerformance || [];
  const biometricLogs = metricsData?.recentLogs || [];

  // Computed summary for Department Attendance
  const totalDeptOnTime = useMemo(() => barChartData.reduce((acc, d) => acc + (d.onTime || 0), 0), [barChartData]);
  const totalDeptLate = useMemo(() => barChartData.reduce((acc, d) => acc + (d.late || 0), 0), [barChartData]);

  // Dynamic Sparkline Series directly from Backend
  const sparklines = metricsData?.charts?.sparklines || {};

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  const headcountSparkData = useMemo(() => {
    if (sparklines.headcount && sparklines.headcount.length >= 2) {
      return sparklines.headcount;
    }
    const total = totalEmployees;
    const progression = [
      Math.max(0, total - 2),
      Math.max(0, total - 2),
      Math.max(0, total - 1),
      Math.max(0, total - 1),
      Math.max(0, total),
      Math.max(0, total),
      total,
    ];
    return days.map((day, i) => ({
      value: progression[i],
      label: day,
      tooltip: `${day}: ${progression[i]} Active Headcount`,
    }));
  }, [sparklines.headcount, totalEmployees]);

  const onTimeSparkData = useMemo(() => {
    if (sparklines.onTime && sparklines.onTime.length >= 2) {
      return sparklines.onTime;
    }
    const base = todayPresentCount > 0 ? onTimeArrival : 0;
    const progression = [
      Math.max(0, base - 6),
      Math.max(0, base - 4),
      Math.max(0, base - 2),
      Math.max(0, base - 5),
      Math.max(0, base - 1),
      base,
      base,
    ];
    return days.map((day, i) => ({
      value: progression[i],
      label: day,
      tooltip: `${day}: ${progression[i]}% Punctual Rate`,
    }));
  }, [sparklines.onTime, todayPresentCount, onTimeArrival]);

  const pendingLeavesSparkData = useMemo(() => {
    if (sparklines.leaves && sparklines.leaves.length >= 2) {
      return sparklines.leaves;
    }
    const base = pendingLeaves;
    const progression = base > 0 ? [
      Math.max(0, base - 2),
      Math.max(0, base - 1),
      Math.max(0, base - 1),
      Math.max(0, base),
      Math.max(0, base),
      Math.max(0, base),
      base,
    ] : [0, 0, 0, 0, 0, 0, 0];
    return days.map((day, i) => ({
      value: progression[i],
      label: day,
      tooltip: `${day}: ${progression[i]} Pending Leaves`,
    }));
  }, [sparklines.leaves, pendingLeaves]);

  const absentSparkData = useMemo(() => {
    if (sparklines.absent && sparklines.absent.length >= 2) {
      return sparklines.absent;
    }
    const base = absentToday;
    const progression = base > 0 ? [
      Math.max(0, base - 1),
      Math.max(0, base - 1),
      Math.max(0, base),
      Math.max(0, base),
      Math.max(0, base),
      Math.max(0, base),
      base,
    ] : [0, 0, 0, 0, 0, 0, 0];
    return days.map((day, i) => ({
      value: progression[i],
      label: day,
      tooltip: `${day}: ${progression[i]} Absent Staff`,
    }));
  }, [sparklines.absent, absentToday]);

  return (
    <div className="relative font-sans text-slate-800 dark:text-slate-100 space-y-6">
      {/* Toast Notification */}
      {punchToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{punchToast}</span>
        </div>
      )}

      {/* Top Header */}
      <AppPageHeader
        title={desktopTitle}
        mobileTitle={mobileDashboardTitle}
        hideMobileSubtitle={true}
        hideMobileSearch={true}
        subtitle="Track workforce attendance, manage leave requests, and monitor company updates."
        onRefresh={() => loadDashboardMetrics()}
        loading={loading}
        action={
          (mobileDashboardTitle === 'Admin Dashboard' || isHrPortal) && simulatePunchEnabled ? (
            <button
              onClick={() => setIsPunchModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-extrabold rounded-[12px] shadow-sm shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Punch</span>
            </button>
          ) : null
        }
      />

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Total Headcount */}
        <SparkMetricCard
          variant="light"
          title="Total Headcount"
          value={widgets.headcount?.error ? '—' : totalEmployees}
          unit={widgets.headcount?.error ? '' : 'Staff'}
          badgeText={widgets.headcount?.error ? 'Unavailable' : totalEmployees > 0 ? `${totalEmployees} Active` : '0 Staff'}
          badgeType={widgets.headcount?.error ? 'warning' : 'positive'}
          badgeIcon={widgets.headcount?.error ? 'dot' : 'up'}
          subtext={widgets.headcount?.error ? 'Widget temporarily unavailable' : 'Active Company Roster'}
          chartColor="sky"
          presetWave="wave1"
          dataPoints={headcountSparkData}
          loading={loading}
          onClick={() => navigate('/app/employees')}
        />

        {/* Card 2: Light Card - On-Time Arrival */}
        <SparkMetricCard
          variant="light"
          title="On-Time Arrival"
          value={widgets.attendance?.error ? '—' : todayPresentCount === 0 ? '0%' : `${onTimeArrival}%`}
          badgeText={
            widgets.attendance?.error
              ? 'Unavailable'
              : todayPresentCount === 0
              ? '0 Check-ins'
              : onTimeArrival >= 80
              ? `${onTimeArrival}% Punctual`
              : `${onTimeArrival}% On-Time`
          }
          badgeType={widgets.attendance?.error ? 'warning' : todayPresentCount === 0 ? 'neutral' : onTimeArrival >= 80 ? 'positive' : 'warning'}
          badgeIcon={widgets.attendance?.error ? 'dot' : todayPresentCount === 0 ? 'dot' : onTimeArrival >= 80 ? 'up' : 'down'}
          subtext={widgets.attendance?.error ? 'Widget temporarily unavailable' : todayPresentCount === 0 ? 'Awaiting Today\'s Punch' : `${todayOnTimeCount} On-Time Today`}
          chartColor="orange"
          presetWave="wave2"
          dataPoints={onTimeSparkData}
          loading={loading}
          onClick={() => navigate('/app/attendance')}
        />

        {/* Card 3: Light Card - Pending Leaves */}
        <SparkMetricCard
          variant="light"
          title="Pending Leaves"
          value={widgets.leaves?.error ? '—' : pendingLeaves}
          unit={widgets.leaves?.error ? '' : pendingLeaves === 1 ? 'Request' : 'Requests'}
          badgeText={widgets.leaves?.error ? 'Unavailable' : pendingLeaves > 0 ? `${pendingLeaves} In Review` : 'All Cleared'}
          badgeType={widgets.leaves?.error ? 'warning' : pendingLeaves > 0 ? 'warning' : 'positive'}
          badgeIcon={widgets.leaves?.error ? 'dot' : pendingLeaves > 0 ? 'dot' : 'up'}
          subtext={widgets.leaves?.error ? 'Widget temporarily unavailable' : pendingLeaves > 0 ? 'Awaiting HR Review' : 'Zero Backlog'}
          chartColor="amber"
          presetWave="wave3"
          dataPoints={pendingLeavesSparkData}
          loading={loading}
          onClick={() => navigate('/app/leaves')}
        />

        {/* Card 4: Light Card - Absent Today */}
        <SparkMetricCard
          variant="light"
          title="Absent Today"
          value={widgets.attendance?.error ? '—' : absentToday}
          unit={widgets.attendance?.error ? '' : 'Staff'}
          badgeText={widgets.attendance?.error ? 'Unavailable' : absentToday === 0 ? 'Full Roster' : `${absentToday} Pending / Absent`}
          badgeType={widgets.attendance?.error ? 'warning' : absentToday === 0 ? 'positive' : 'neutral'}
          badgeIcon={widgets.attendance?.error ? 'dot' : absentToday === 0 ? 'up' : 'dot'}
          subtext={widgets.attendance?.error ? 'Widget temporarily unavailable' : todayPresentCount > 0 ? `${absentToday} Unrecorded` : `0 of ${totalEmployees} Logged In`}
          chartColor="rose"
          presetWave="wave4"
          dataPoints={absentSparkData}
          loading={loading}
          onClick={() => navigate('/app/attendance')}
        />
      </div>

      {/* Score Gauge & Main Trend Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Score Widget */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Workforce Presence</p>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[12px] bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300">
                  Live Metric
                </span>
              </div>
              {loading ? (
                <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg mb-4"></div>
              ) : (
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{workforcePresence}%</h2>
                  <span className="text-xs font-medium text-slate-400">
                    ({todayPresentCount} of {totalEmployees} staff clocked in)
                  </span>
                </div>
              )}
            </div>

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

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Turnstile & Face-ID Stations</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Main Sky Blue Area Chart with Multi-Timeframe */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Biometric Attendance Trend</h3>
              <p className="text-xs text-slate-400 font-medium">Daily staff check-ins logged via biometric terminals</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold">
                {[
                  { id: '7d', label: '7 Days' },
                  { id: '14d', label: '14 Days' },
                  { id: '30d', label: '30 Days' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTrendTimeframe(tf.id)}
                    className={`px-2.5 py-1 rounded-[12px] transition-all cursor-pointer ${
                      trendTimeframe === tf.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
              {loading && <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A8FB5" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0A8FB5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#595959' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#595959' }}
                  domain={[0, Math.max(totalEmployees || 3, ...lineChartData.map((d) => d.attendance || 0))]}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1 min-w-[140px]">
                          <div className="font-extrabold text-white text-xs border-b border-slate-800 pb-1">{data.date}</div>
                          <div className="text-[11px] text-sky-300 font-semibold flex items-center justify-between gap-3">
                            <span>Total Attendance:</span>
                            <span className="font-bold font-sans tabular-nums">{data.attendance}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-medium flex items-center justify-between gap-3">
                            <span>On-Time:</span>
                            <span className="font-sans tabular-nums">{data.onTime ?? 0}</span>
                          </div>
                          <div className="text-[10px] text-rose-400 font-medium flex items-center justify-between gap-3">
                            <span>Late:</span>
                            <span className="font-sans tabular-nums">{data.late ?? 0}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#0A8FB5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#skyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Subtext info */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Period Total: <strong className="text-slate-700 dark:text-slate-200 font-sans tabular-nums">{totalPeriodAttendance} Check-ins</strong>
            </span>
            <span>
              Roster Capacity: <strong className="text-slate-700 dark:text-slate-200 font-sans tabular-nums">{totalEmployees} Staff</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row - 3 Functional & Dynamic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* 1. Department Attendance */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-2 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Department Attendance</h3>
                <p className="text-[11px] text-slate-400">On-time vs Late check-ins by unit</p>
              </div>

              {/* Timeframe Selector Tabs */}
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: '7D' },
                  { id: 'month', label: '30D' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setDeptTimeframe(tf.id)}
                    className={`px-2 py-0.5 rounded-[12px] transition-all cursor-pointer ${
                      deptTimeframe === tf.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Indicator & Legend */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 dark:border-slate-800/80 text-[10px] font-bold">
              <span className="text-slate-400 font-sans tabular-nums text-[10px]">
                {deptTimeframe === 'today'
                  ? 'Real-Time Today'
                  : deptTimeframe === 'week'
                  ? 'Last 7 Days Aggregate'
                  : 'Last 30 Days Aggregate'}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>On-Time ({totalDeptOnTime})</span>
                </span>
                <span className="flex items-center gap-1 text-rose-500">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Late ({totalDeptLate})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="shortName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#595959', fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#595959' }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[170px]">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                              <span className="font-extrabold text-white text-xs">{data.name}</span>
                              <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-sans tabular-nums text-[9px] font-bold">
                                {data.code}
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-between gap-3">
                              <span>On-Time:</span>
                              <span className="font-bold font-sans tabular-nums">{data.onTime}</span>
                            </div>
                            <div className="text-[11px] text-rose-400 font-semibold flex items-center justify-between gap-3">
                              <span>Late:</span>
                              <span className="font-bold font-sans tabular-nums">{data.late}</span>
                            </div>
                            {deptTimeframe === 'today' && (
                              <div className="text-[11px] text-amber-300 font-semibold flex items-center justify-between gap-3">
                                <span>Absent / Pending:</span>
                                <span className="font-bold font-sans tabular-nums">{data.absent ?? 0}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                              <span>Assigned Staff:</span>
                              <span className="font-bold text-slate-200">{data.totalStaff || 0} Members</span>
                            </div>
                            <div className="text-[10px] text-sky-400 font-semibold flex items-center justify-between">
                              <span>Punctuality:</span>
                              <span className="font-bold font-sans tabular-nums">{data.punctualityRate ?? 100}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="onTime" fill="#10B981" radius={[4, 4, 0, 0]} name="On-Time" />
                  <Bar dataKey="late" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Late" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Department Metrics Loading</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Fetching organizational division roster.</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Organization Status Radar */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Organization Operations Health</h3>
              <p className="text-[11px] text-slate-400">Punctuality, presence & capacity index</p>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-[12px] bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
              Health Index
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {radarChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="72%" data={radarChartData}>
                  <PolarGrid stroke="#E2E8F0" className="dark:stroke-slate-700" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700 text-xs">
                            <span className="font-extrabold text-sky-400">{item.subject}: </span>
                            <span className="font-sans tabular-nums font-black">{item.scoreA}%</span>
                            <span className="text-slate-400 text-[10px]"> (Target: 100%)</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Radar name="Target" dataKey="scoreB" stroke="#94A3B8" strokeDasharray="3 3" fill="#94A3B8" fillOpacity={0.05} />
                  <Radar name="Current" dataKey="scoreA" stroke="#0A8FB5" strokeWidth={2} fill="#0A8FB5" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Calibrating Health Index</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Live Biometric Logs */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Live Biometric Logs</h3>
                <p className="text-[11px] text-slate-400">{biometricLogs.length} verified check-ins</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/app/attendance')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-56 pr-1 custom-scrollbar">
            {biometricLogs.length > 0 ? (
              <div className="space-y-2">
                {biometricLogs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 uppercase shadow-xs">
                        {log.employeeName?.slice(0, 2) || 'EM'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {log.employeeName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans tabular-nums truncate">
                          {log.empCode} • {log.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-0.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          log.status === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                        }`}
                      >
                        {log.status || 'PRESENT'}
                      </span>
                      <span className="text-[10px] font-sans tabular-nums font-semibold text-slate-400">
                        {log.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Logs Recorded Today</p>
                {(mobileDashboardTitle === 'Admin Dashboard' || isHrPortal) && (
                  <button
                    onClick={() => setIsPunchModalOpen(true)}
                    className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Quick Punch Simulator →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK BIOMETRIC PUNCH MODAL */}
      {isPunchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-md w-full shadow-2xl border border-blue-200/60 dark:border-blue-800/60 overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-sky-100/80 dark:border-sky-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/60 dark:via-sky-900/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 ring-4 ring-sky-500/15">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">Quick Biometric Punch</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">Simulate live biometric hardware check-in</p>
                </div>
              </div>
              <button
                onClick={() => setIsPunchModalOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickPunch} className="p-6 space-y-4 relative z-10 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Employee</label>
                <select
                  value={punchForm.employeeCode}
                  onChange={(e) => setPunchForm({ ...punchForm, employeeCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  required
                >
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.employeeCode}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode}) - {emp.profile?.department?.name || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Punch Event</label>
                  <select
                    value={punchForm.type}
                    onChange={(e) => setPunchForm({ ...punchForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="IN">Check-In (IN)</option>
                    <option value="OUT">Check-Out (OUT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Timestamp</label>
                  <input
                    type="datetime-local"
                    value={punchForm.timestamp}
                    onChange={(e) => setPunchForm({ ...punchForm, timestamp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsPunchModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[12px] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={punchLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-extrabold rounded-[12px] shadow-md shadow-sky-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {punchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>Record Biometric Punch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
