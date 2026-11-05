import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  Zap,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  Cpu,
  Fingerprint,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  Building2,
  Search,
  X,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { TableSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const EmployeeAttendance = () => {
  const { formatTime, formatDate, timezone } = useRegionalSettings();
  const [logs, setLogs] = useState(() => {
    const cached = api.getCached('/attendance/my-logs')?.data?.attendances || api.getCached('/attendance/my-logs')?.data?.logs;
    return cached || [];
  });
  const [loading, setLoading] = useState(() => !api.hasCached('/attendance/my-logs'));
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [todayLog, setTodayLog] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu]);

  const officeLocation = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u?.profile?.workLocation || u?.workLocation || 'Islamabad HQ & Innovation Lab';
    } catch {
      return 'Islamabad HQ & Innovation Lab';
    }
  }, []);

  // Live clock updating every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real database attendance logs
  const fetchMyAttendance = async () => {
    if (!api.hasCached('/attendance/my-logs')) {
      setLoading(true);
    }
    try {
      const res = await api.getMyAttendanceLogs();
      const rawLogs = res?.data?.attendances || res?.data?.logs || (Array.isArray(res?.data) ? res?.data : null);
      if (rawLogs && Array.isArray(rawLogs)) {
        // Transform DB attendance objects
        const formatted = rawLogs.map((att) => {
          const inTime = att.checkInTime ? formatTime(att.checkInTime, false) : (att.clockIn ? formatTime(att.clockIn, false) : '--:--');
          const outTime = att.checkOutTime ? formatTime(att.checkOutTime, false) : (att.clockOut ? formatTime(att.clockOut, false) : '--:--');

          const dateObj = new Date(att.date || att.checkInTime || att.clockIn);
          const dayName = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('en-US', { weekday: 'long' })
            : 'Weekday';
          const dayNum = !isNaN(dateObj.getTime())
            ? String(dateObj.getDate()).padStart(2, '0')
            : '--';
          const monthShort = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
            : '---';

          const todayStr = new Date().toISOString().split('T')[0];
          const itemDateStr = att.date ? String(att.date).split('T')[0] : (!isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '');
          const isToday = itemDateStr === todayStr;

          const totalHours = att.totalHours != null ? Number(att.totalHours) : (att.workHours != null ? Number(att.workHours) : (att.checkInTime && att.checkOutTime ? parseFloat((Math.max(0, new Date(att.checkOutTime) - new Date(att.checkInTime)) / 3600000).toFixed(1)) : 0));
          const ot = att.ot != null ? Number(att.ot) : (totalHours > 8.0 ? parseFloat((totalHours - 8.0).toFixed(1)) : 0);

          return {
            id: att.id,
            rawDate: att.date || att.checkInTime || att.clockIn,
            dateObj,
            dayNum,
            monthShort,
            dayName,
            isToday,
            formattedDate: formatDate(att.date || att.checkInTime || att.clockIn),
            day: dayName,
            checkIn: inTime,
            checkOut: outTime,
            hours: totalHours,
            ot,
            status: (att.status || 'PRESENT').toUpperCase(),
            method: att.notes || att.terminal || 'Biometric Face-ID Terminal HQ',
            notes: att.notes || 'Biometric verified entry',
          };
        });

        setLogs(formatted);

        // Find today's record matching current local date
        const todayStr = new Date().toISOString().split('T')[0];
        const currentToday = formatted.find((l) => (l.rawDate || '').split('T')[0] === todayStr);
        if (currentToday) {
          setTodayLog(currentToday);
        } else {
          setTodayLog(null);
        }
      }
    } catch (err) {
      console.warn('Failed to load real database attendance:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [timezone]);

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PRESENT' && item.status !== 'PRESENT') return false;
        if (statusFilter === 'LATE' && item.status !== 'LATE') return false;
        if (statusFilter === 'ON_LEAVE' && item.status !== 'ON_LEAVE' && item.status !== 'LEAVE') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDate = (item.formattedDate || '').toLowerCase().includes(q);
        const matchDay = (item.day || '').toLowerCase().includes(q);
        const matchMethod = (item.method || '').toLowerCase().includes(q);
        const matchStatus = (item.status || '').toLowerCase().includes(q);
        const matchIn = (item.checkIn || '').toLowerCase().includes(q);
        const matchOut = (item.checkOut || '').toLowerCase().includes(q);
        if (!matchDate && !matchDay && !matchMethod && !matchStatus && !matchIn && !matchOut) {
          return false;
        }
      }
      return true;
    });
  }, [logs, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: logs.length,
      present: logs.filter((l) => l.status === 'PRESENT').length,
      late: logs.filter((l) => l.status === 'LATE').length,
      leave: logs.filter((l) => l.status === 'ON_LEAVE' || l.status === 'LEAVE').length,
    };
  }, [logs]);

  const exportToCSV = () => {
    if (!logs.length) return;
    const headers = ['Date', 'Day', 'Punch In', 'Punch Out', 'Hours Logged', 'Overtime', 'Status'];
    const rows = filteredLogs.map((l) => [
      `"${l.formattedDate}"`,
      `"${l.day}"`,
      `"${l.checkIn}"`,
      `"${l.checkOut}"`,
      `"${l.hours}h"`,
      `"${l.ot}h"`,
      `"${l.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate live database metrics directly from PostgreSQL records
  const totalDaysPresent = logs.filter((l) => l.status === 'PRESENT' || l.status === 'LATE').length;
  const lateArrivals = logs.filter((l) => l.status === 'LATE').length;
  const totalHoursLogged = logs.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const totalOvertime = logs.reduce((acc, curr) => acc + (curr.ot || 0), 0);
  const onTimePercentage = totalDaysPresent > 0 ? Math.round(((totalDaysPresent - lateArrivals) / totalDaysPresent) * 100) : 100;

  // 1. Attendance presence sparkline data
  const presenceSparkData = useMemo(() => {
    if (logs && logs.length >= 2) {
      return logs.slice(0, 10).reverse().map((log) => ({
        value: log.status === 'PRESENT' ? 8.5 : log.status === 'LATE' ? 7.0 : 0,
        label: log.day?.slice(0, 3) || 'Day',
        tooltip: `${log.formattedDate} (${log.day}): ${log.status} (${log.hours}h)`,
      }));
    }
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const hours = isWeekend ? 0 : totalDaysPresent > 0 ? 8.5 : 0;
      return {
        value: hours,
        label: dayLabel,
        tooltip: `${dateStr} (${dayLabel}): ${hours > 0 ? `${hours} hrs (Present)` : isWeekend ? 'Weekend Off' : 'Pending Entry'}`,
      };
    });
  }, [logs, totalDaysPresent]);

  // 2. Late arrivals variance sparkline data
  const lateSparkData = useMemo(() => {
    if (logs && logs.length >= 2) {
      return logs.slice(0, 8).reverse().map((log) => ({
        value: log.status === 'LATE' ? 2.5 : 0,
        label: log.day?.slice(0, 3) || 'Day',
        tooltip: `${log.formattedDate}: ${log.status === 'LATE' ? 'Late Arrival (Flagged)' : 'On-Time Entry'}`,
      }));
    }
    return [
      { value: 0, label: 'Mon', tooltip: 'No Entry Logged' },
      { value: 0, label: 'Tue', tooltip: 'No Entry Logged' },
      { value: lateArrivals > 0 ? 2 : 0, label: 'Wed', tooltip: lateArrivals > 0 ? 'Late Check-In' : 'No Entry' },
      { value: 0, label: 'Thu', tooltip: 'No Entry Logged' },
      { value: 0, label: 'Fri', tooltip: 'No Entry Logged' },
    ];
  }, [logs, lateArrivals]);

  // 3. Logged work hours time-series sparkline data
  const hoursSparkData = useMemo(() => {
    if (logs && logs.length >= 2) {
      return logs.slice(0, 8).reverse().map((log) => ({
        value: Number(log.hours) || 0,
        label: log.day?.slice(0, 3) || 'Day',
        tooltip: `${log.formattedDate} (${log.day}): ${log.hours} hrs logged`,
      }));
    }
    const avg = totalDaysPresent > 0 ? totalHoursLogged / totalDaysPresent : 0;
    const now = new Date();
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
  }, [logs, totalHoursLogged, totalDaysPresent]);

  // 4. Biometric terminal synchronization timeline sparkline data
  const punchesSparkData = useMemo(() => {
    if (logs && logs.length >= 2) {
      return logs.slice(0, 6).reverse().map((log) => ({
        value: log.checkIn && log.checkIn !== '--:--' && log.checkOut && log.checkOut !== '--:--' ? 2 : log.checkIn && log.checkIn !== '--:--' ? 1 : 0,
        label: log.day?.slice(0, 3) || 'Day',
        tooltip: `${log.formattedDate}: In ${log.checkIn} | Out ${log.checkOut}`,
      }));
    }
    return [
      { value: 0, label: 'D1', tooltip: 'No Biometric Punch' },
      { value: 0, label: 'D2', tooltip: 'No Biometric Punch' },
      { value: 0, label: 'D3', tooltip: 'No Biometric Punch' },
      { value: 0, label: 'D4', tooltip: 'No Biometric Punch' },
      { value: todayLog?.checkIn ? 1 : 0, label: 'Today', tooltip: todayLog?.checkIn ? `Today Punch: ${todayLog.checkIn}` : 'Awaiting Entry' },
    ];
  }, [logs, todayLog]);

  // Dynamic Badges
  const card1Badge = useMemo(() => {
    if (totalDaysPresent === 0) {
      return { text: '0d Logged', type: 'neutral', icon: 'dot', sub: 'Awaiting Punch-In' };
    }
    if (lateArrivals > 0) {
      return {
        text: `+${onTimePercentage}% On-Time`,
        type: onTimePercentage >= 80 ? 'positive' : 'warning',
        icon: onTimePercentage >= 80 ? 'up' : 'down',
        sub: `${lateArrivals} Late Check-in${lateArrivals > 1 ? 's' : ''}`,
      };
    }
    return { text: '100% Punctual', type: 'positive', icon: 'up', sub: '100% On-Time Record' };
  }, [totalDaysPresent, lateArrivals, onTimePercentage]);

  const card2Badge = useMemo(() => {
    if (lateArrivals === 0) {
      return { text: '0 Late', type: 'positive', icon: 'up', sub: '15 Mins Grace (09:15 AM)' };
    }
    return {
      text: `-${lateArrivals} Check-in${lateArrivals > 1 ? 's' : ''}`,
      type: 'warning',
      icon: 'down',
      sub: `${lateArrivals} Late Arrival${lateArrivals > 1 ? 's' : ''} Flagged`,
    };
  }, [lateArrivals]);

  const card3Badge = useMemo(() => {
    if (totalHoursLogged === 0) {
      return { text: '0.0h / Day', type: 'neutral', icon: 'dot', sub: 'Shift: 09:00 – 17:30' };
    }
    if (totalOvertime > 0) {
      return {
        text: `+${totalOvertime.toFixed(1)}h OT`,
        type: 'positive',
        icon: 'up',
        sub: `+${totalOvertime.toFixed(1)}h Overtime Logged`,
      };
    }
    const avg = (totalHoursLogged / Math.max(1, totalDaysPresent)).toFixed(1);
    return {
      text: `+${avg}h / Day`,
      type: Number(avg) >= 8 ? 'positive' : 'warning',
      icon: Number(avg) >= 8 ? 'up' : 'down',
      sub: 'Standard 8.5h Shift Target',
    };
  }, [totalHoursLogged, totalOvertime, totalDaysPresent]);

  const card4Badge = useMemo(() => {
    if (logs.length === 0) {
      return { text: 'Standby', type: 'neutral', icon: 'dot', sub: 'IoT Terminals Ready' };
    }
    return { text: '100% Synced', type: 'positive', icon: 'dot', sub: 'Biometric IoT Hardware' };
  }, [logs]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Attendance"
        subtitle="Automated biometric time records, punch timestamps, and presence logs."
        onRefresh={fetchMyAttendance}
        loading={loading}
      />

      {/* ========================================================================= */}
      {/* 1. HERO BIOMETRIC HARDWARE STATUS BANNER (EMERALD & TEAL BIOMETRIC AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Biometric Hardware Live Pulse */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
              {todayLog?.checkIn && todayLog.checkIn !== '--:--'
                ? `Today's Entry: ${todayLog.checkIn} (Verified)`
                : 'Turnstiles & Biometric Gates Synchronized'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Punches are captured in real-time from office biometric face-recognition and fingerprint gate terminals. Manual adjustments are managed by HR.
            </p>

            {/* Live Clock, Office Location & Shift Details */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
              <div className="bg-emerald-500/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-200">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{officeLocation}</span>
              </div>
              <span className="text-xs text-slate-300 font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right Side: Glassmorphic Punch Summary Card */}
          <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/20 dark:border-slate-700/60 shadow-2xl flex flex-col items-center text-center min-w-[280px] sm:min-w-[320px]">
            <div className="flex items-center justify-between w-full mb-3 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                <span>Today's Activity</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  todayLog?.status === 'LATE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : todayLog?.status === 'PRESENT'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                }`}
              >
                {todayLog?.status || 'Awaiting Punch'}
              </span>
            </div>

            {/* In / Out Timestamps */}
            <div className="w-full grid grid-cols-2 gap-2.5 my-1">
              <div className="bg-black/25 rounded-2xl p-3 border border-white/5 text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Punch In</div>
                <div className="text-lg sm:text-xl font-mono font-black text-emerald-400 mt-0.5">
                  {todayLog?.checkIn || '--:--'}
                </div>
                <div className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{todayLog?.checkIn && todayLog.checkIn !== '--:--' ? 'Recorded' : 'Pending'}</span>
                </div>
              </div>

              <div className="bg-black/25 rounded-2xl p-3 border border-white/5 text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Punch Out</div>
                <div className="text-lg sm:text-xl font-mono font-black text-emerald-400 mt-0.5">
                  {todayLog?.checkOut || '--:--'}
                </div>
                <div className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{todayLog?.checkOut && todayLog.checkOut !== '--:--' ? 'Recorded' : 'Pending'}</span>
                </div>
              </div>
            </div>

            <div className="w-full pt-2 flex items-center justify-between text-xs sm:text-sm text-slate-200 font-medium leading-normal">
              <span>Shift: 09:00 AM – 05:30 PM</span>
              <span className="text-emerald-400 font-semibold">8.5h Standard</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS ROW (EXACT HIGH-FIDELITY VECTOR SPARKLINE CARDS FOR ATTENDANCE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Verified Present */}
        <SparkMetricCard
          variant="dark"
          title="Verified Present"
          value={totalDaysPresent}
          unit={totalDaysPresent === 1 ? 'Day' : 'Days'}
          badgeText={card1Badge.text}
          badgeType={card1Badge.type}
          badgeIcon={card1Badge.icon}
          subtext={card1Badge.sub}
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
          unit={lateArrivals === 1 ? 'Late Day' : 'Late Days'}
          badgeText={card2Badge.text}
          badgeType={card2Badge.type}
          badgeIcon={card2Badge.icon}
          subtext={card2Badge.sub}
          chartColor="orange"
          presetWave="wave2"
          dataPoints={lateSparkData}
          loading={loading}
        />

        {/* Card 3: Light Card - Logged Work Hours */}
        <SparkMetricCard
          variant="light"
          title="Logged Hours"
          value={totalHoursLogged.toFixed(1)}
          unit="hrs"
          badgeText={card3Badge.text}
          badgeType={card3Badge.type}
          badgeIcon={card3Badge.icon}
          subtext={card3Badge.sub}
          chartColor="amber"
          presetWave="wave3"
          dataPoints={hoursSparkData}
          loading={loading}
        />

        {/* Card 4: Light Card - Terminal Sync Logs */}
        <SparkMetricCard
          variant="light"
          title="Biometric Logs"
          value={logs.length}
          unit={logs.length === 1 ? 'Entry' : 'Entries'}
          badgeText={card4Badge.text}
          badgeType={card4Badge.type}
          badgeIcon={card4Badge.icon}
          subtext={card4Badge.sub}
          chartColor="rose"
          presetWave="wave4"
          dataPoints={punchesSparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. MODERN ATTENDANCE LOG DATA GRID */}
      {/* ========================================================================= */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <div className="bg-white dark:bg-[#111C24] rounded-2xl shadow-sm border border-slate-200/80 dark:border-emerald-950/40 overflow-hidden transition-all">
          {/* Header & Filter Controls */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Attendance History & Timesheets
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Verified daily attendance records, punch timestamps, and shift durations
                  </p>
                </div>
              </div>
            </div>

            {/* Right actions: Search + Filter button + Export */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search date, weekday, time..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Button with Dropdown Menu */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowFilterMenu((prev) => !prev)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                    statusFilter !== 'ALL'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300'
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
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  )}
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700 p-1.5 z-30">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Filter by Status
                    </div>
                    {[
                      { id: 'ALL', label: 'All Records', count: counts.all },
                      { id: 'PRESENT', label: 'Present', count: counts.present, dot: 'bg-emerald-500' },
                      { id: 'LATE', label: 'Late Arrival', count: counts.late, dot: 'bg-amber-500' },
                      { id: 'ON_LEAVE', label: 'On Leave', count: counts.leave, dot: 'bg-indigo-500' },
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
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Table / Timeline Data Grid */}
          {filteredLogs.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6">Work Date</th>
                      <th className="py-3.5 px-4">Punch In</th>
                      <th className="py-3.5 px-4">Punch Out</th>
                      <th className="py-3.5 px-4">Logged Duration</th>
                      <th className="py-3.5 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filteredLogs.map((log) => {
                      const isLeave = log.status === 'ON_LEAVE' || log.status === 'LEAVE';
                      const isLate = log.status === 'LATE';
                      const durationVal = Number(log.hours) || 0;
                      const progressPct = Math.min(100, Math.round((durationVal / 8.5) * 100));

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                        >
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

                          {/* 4. Logged Duration Column */}
                          <td className="py-4 px-4">
                            {isLeave ? (
                              <span className="text-slate-400 text-xs font-medium">0.0 hrs</span>
                            ) : (
                              <div className="space-y-1.5 min-w-[130px]">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-extrabold text-slate-900 dark:text-white">
                                    {durationVal.toFixed(1)} hrs
                                  </span>
                                  {log.ot > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                                      +{log.ot}h OT
                                    </span>
                                  )}
                                </div>
                                {/* Slim progress bar */}
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
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
                              </div>
                            )}
                          </td>

                          {/* 5. Status Column (Right aligned) */}
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
                              {log.status === 'PRESENT' && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                              {isLate && <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                              {isLeave && <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                              <span>{isLate ? 'Late Arrival' : isLeave ? 'On Leave' : log.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredLogs.map((log) => {
                    const isLeave = log.status === 'ON_LEAVE' || log.status === 'LEAVE';
                    const isLate = log.status === 'LATE';
                    const durationVal = Number(log.hours) || 0;
                    const progressPct = Math.min(100, Math.round((durationVal / 8.5) * 100));

                    return (
                      <div
                        key={log.id}
                        className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/70 space-y-3.5 shadow-xs hover:border-emerald-400/60 transition-all"
                      >
                        {/* Header: Date + Status */}
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
                                {log.monthShort || 'DAY'}
                              </span>
                              <span className="text-sm font-black leading-tight mt-0.5">
                                {log.dayNum || '01'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                                  {log.formattedDate}
                                </span>
                                {log.isToday && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                                    Today
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">{log.day}</div>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              log.status === 'PRESENT'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                                : isLate
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
                                : isLeave
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40'
                            }`}
                          >
                            <span>{isLate ? 'Late' : isLeave ? 'Leave' : log.status}</span>
                          </span>
                        </div>

                        {/* Punch In / Out Tiles */}
                        <div className="grid grid-cols-2 gap-2 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 text-center">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">Punch In</div>
                            <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {log.checkIn}
                            </div>
                          </div>
                          <div className="border-l border-slate-100 dark:border-slate-800">
                            <div className="text-[9px] uppercase font-bold text-slate-400">Punch Out</div>
                            <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                              {log.checkOut}
                            </div>
                          </div>
                        </div>

                        {/* Duration meter & Overtime */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                              Duration: <span className="font-extrabold text-slate-900 dark:text-white">{durationVal.toFixed(1)} hrs</span>
                            </span>
                            {log.ot > 0 && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                +{log.ot}h Overtime
                              </span>
                            )}
                          </div>
                          <div className="w-full h-1.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Fingerprint className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {searchQuery ? 'No Matching Records Found' : 'No Biometric Logs Recorded'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchQuery
                  ? `No attendance punches matched your query "${searchQuery}". Try searching by another date or status.`
                  : 'Your daily presence records will appear here as biometric hardware punch events occur.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
