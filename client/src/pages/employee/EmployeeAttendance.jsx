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
  RotateCcw,
  Check,
  History,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import ModernSearchBarSection from '../../components/common/ModernSearchBarSection';
import { TableSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const EmployeeAttendance = () => {
  const { formatTime, formatDate, timezone } = useRegionalSettings();
  const todayDate = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(() => todayDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(() => todayDate.getFullYear());
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const monthDropdownRef = useRef(null);

  const [logs, setLogs] = useState(() => {
    const cached = api.getCached('/attendance/my-logs')?.data?.attendances || api.getCached('/attendance/my-logs')?.data?.logs;
    return cached || [];
  });
  const [loading, setLoading] = useState(() => !api.hasCached('/attendance/my-logs'));
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [todayLog, setTodayLog] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthMenu(false);
      }
    };
    if (showFilterMenu || showMonthMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu, showMonthMenu]);

  // Is current real calendar month?
  const isCurrentMonth = selectedMonth === (todayDate.getMonth() + 1) && selectedYear === todayDate.getFullYear();

  // Disable Next button if already on current month (can't go to future)
  const isNextDisabled = isCurrentMonth || (
    selectedYear > todayDate.getFullYear() ||
    (selectedYear === todayDate.getFullYear() && selectedMonth >= todayDate.getMonth() + 1)
  );

  // Formatted month labels
  const selectedMonthLabel = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedMonth, selectedYear]);

  const selectedMonthShortLabel = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [selectedMonth, selectedYear]);

  // Available past 12 months for quick direct selection
  const pastMonthsList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(todayDate.getFullYear(), todayDate.getMonth() - i, 1);
      list.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        short: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        isCurrent: i === 0,
      });
    }
    return list;
  }, [todayDate]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isNextDisabled) return;
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleJumpToCurrent = () => {
    setSelectedMonth(todayDate.getMonth() + 1);
    setSelectedYear(todayDate.getFullYear());
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const loadUserData = async () => {
    try {
      const res = await api.getMe();
      if (res?.success && res.data?.user) {
        setCurrentUser(res.data.user);
      }
    } catch {}
  };

  useEffect(() => {
    loadUserData();
    window.addEventListener('user_profile_updated', loadUserData);
    return () => window.removeEventListener('user_profile_updated', loadUserData);
  }, []);

  const officeLocation = currentUser?.profile?.workLocation || currentUser?.workLocation || 'Corporate Office';
  const employeeShift = currentUser?.profile?.shift || currentUser?.shift || 'General Shift (09:00 AM – 05:30 PM)';

  // Live clock updating every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real database attendance logs for the selected month and year
  const fetchMyAttendance = async (m = selectedMonth, y = selectedYear) => {
    setLoading(true);
    try {
      const res = await api.getMyAttendanceLogs({ month: m, year: y, limit: 100 });
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
      } else {
        setLogs([]);
        setTodayLog(null);
      }
    } catch (err) {
      console.warn('Failed to load real database attendance:', err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, timezone]);

  // Sort Options
  const sortOptions = [
    { key: 'date', label: 'Sort: Date' },
    { key: 'hours', label: 'Sort: Hours Logged' },
    { key: 'overtime', label: 'Sort: Overtime' },
  ];

  const filteredLogs = useMemo(() => {
    let list = logs.filter((item) => {
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

    list.sort((a, b) => {
      let valA, valB;
      if (activeSort === 'date') {
        valA = new Date(a.rawDate || a.date || 0).getTime();
        valB = new Date(b.rawDate || b.date || 0).getTime();
      } else if (activeSort === 'hours') {
        valA = parseFloat(a.totalHours || 0);
        valB = parseFloat(b.totalHours || 0);
      } else if (activeSort === 'overtime') {
        valA = parseFloat(a.ot || 0);
        valB = parseFloat(b.ot || 0);
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [logs, statusFilter, searchQuery, activeSort, sortOrder]);

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
    link.setAttribute('download', `Attendance_Log_${selectedMonthLabel.replace(/\s+/g, '_')}.csv`);
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
    <div className="space-y-6 font-sans text-slate-900 dark:text-white">
      <EmployeePageHeader
        title="My Attendance"
        subtitle="Automated biometric time records, punch timestamps, and presence logs."
        onRefresh={fetchMyAttendance}
        loading={loading}
      />

      {/* ========================================================================= */}
      {/* 1. HERO BIOMETRIC HARDWARE STATUS BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-5 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Biometric Hardware Live Pulse */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              {todayLog?.checkIn && todayLog.checkIn !== '--:--'
                ? `Today's Entry: ${todayLog.checkIn} (Verified)`
                : 'Turnstiles & Biometric Gates Synchronized'}
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-xl font-medium">
              Punches are captured in real-time from office biometric face-recognition and fingerprint gate terminals. Manual adjustments are managed by HR.
            </p>

            {/* Banner Metrics Tags */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{totalDaysPresent} On-Time Days Logged</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{lateArrivals} Late Arrivals Flagged</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{officeLocation}</span>
              </span>
            </div>

            {/* Live Clock & Date */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xs flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-white" />
                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
              <span className="text-xs text-white/80 font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right Side: Glassmorphic Punch Summary Card */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex flex-col items-center text-center min-w-[280px] sm:min-w-[320px]">
            <div className="flex items-center justify-between w-full mb-3 text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Fingerprint className="w-4 h-4 text-[#7CD1EB]" />
                <span>Today's Activity</span>
              </span>
              <span
                className={`px-3 py-1 rounded-[12px] text-[10px] font-extrabold uppercase tracking-wider ${
                  todayLog?.status === 'LATE'
                    ? 'bg-amber-400/20 text-amber-200 border border-amber-300/40'
                    : todayLog?.status === 'PRESENT'
                      ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/40'
                      : 'bg-white text-[#07617D] dark:text-white border border-white dark:border-slate-700 shadow-xs font-black'
                }`}
              >
                {todayLog?.status || 'Awaiting Punch'}
              </span>
            </div>

            {/* In / Out Timestamps */}
            <div className="w-full grid grid-cols-2 gap-2.5 my-1">
              <div className="bg-white dark:bg-slate-800/90 rounded-[12px] p-3 border border-white/40 dark:border-slate-700/80 text-left shadow-2xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Punch In</div>
                <div className="text-lg sm:text-xl font-mono font-black text-[#0A8FB5] dark:text-[#3CC1E6] mt-0.5">
                  {todayLog?.checkIn || '--:--'}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#0A8FB5]" />
                  <span>{todayLog?.checkIn && todayLog.checkIn !== '--:--' ? 'Recorded' : 'Pending'}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/90 rounded-[12px] p-3 border border-white/40 dark:border-slate-700/80 text-left shadow-2xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Punch Out</div>
                <div className="text-lg sm:text-xl font-mono font-black text-[#0A8FB5] dark:text-[#3CC1E6] mt-0.5">
                  {todayLog?.checkOut || '--:--'}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#0A8FB5]" />
                  <span>{todayLog?.checkOut && todayLog.checkOut !== '--:--' ? 'Recorded' : 'Pending'}</span>
                </div>
              </div>
            </div>

            <div className="w-full pt-2.5 flex items-center justify-center text-xs sm:text-sm text-white font-medium leading-normal text-center">
              <span className="text-white/95 drop-shadow-xs font-semibold">Shift: <strong className="text-white font-bold">{employeeShift}</strong></span>
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
      {/* 3. MODERN DYNAMIC ATTENDANCE SEARCHBAR COMMAND BAR */}
      {/* ========================================================================= */}
      <ModernSearchBarSection
        statusTabs={[
          { key: 'ALL', label: 'All Records', count: counts.all },
          { key: 'PRESENT', label: 'Present', count: counts.present },
          { key: 'LATE', label: 'Late', count: counts.late },
          { key: 'ON_LEAVE', label: 'On Leave', count: counts.leave },
        ]}
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search records, notes, punch times..."
        searchHint="status:late"
        dateRangeLabel={selectedMonthLabel}
        dateRangeOptions={pastMonthsList.map((m) => ({
          key: `${m.year}-${m.month}`,
          label: m.label,
        }))}
        activeDateRange={`${selectedYear}-${selectedMonth}`}
        onDateRangeChange={(val) => {
          const [y, m] = val.split('-').map(Number);
          setSelectedYear(y);
          setSelectedMonth(m);
        }}
        sortOptions={sortOptions}
        activeSort={activeSort}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setActiveSort(key);
          setSortOrder(order);
        }}
        filterCount={statusFilter !== 'ALL' ? 1 : 0}
        filterContent={
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Attendance Status
              </span>
              {statusFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1">
              {[
                { id: 'ALL', label: 'All Records', count: counts.all },
                { id: 'PRESENT', label: 'Present', count: counts.present },
                { id: 'LATE', label: 'Late Arrival', count: counts.late },
                { id: 'ON_LEAVE', label: 'On Leave', count: counts.leave },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs font-semibold cursor-pointer transition-all ${
                    statusFilter === st.id
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{st.label}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {st.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        }
        actionButton={
          <button
            type="button"
            onClick={exportToCSV}
            title="Export filtered records to CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* ========================================================================= */}
      {/* 4. ATTENDANCE HISTORY & TIMESHEETS CONTAINER (MATCHED TO HR/ADMIN UI) */}
      {/* ========================================================================= */}
      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : (
        <div className="bg-white dark:bg-[#111C24] rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-all overflow-hidden">
          {/* Header with Title */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Attendance History & Timesheets</span>
                    {!isCurrentMonth && (
                      <span className="text-[10px] px-2 py-0.5 rounded-[12px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                        Past Month Archive
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {isCurrentMonth
                      ? `Viewing personal attendance records & timesheets (${selectedMonthLabel})`
                      : `Viewing archived attendance records & timesheets (${selectedMonthLabel})`}
                  </p>
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-[12px] self-start md:self-auto shrink-0">
              {filteredLogs.length} Records
            </span>
          </div>

          {/* Table / Timeline Data Grid */}
          {filteredLogs.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/75 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6">Work Date</th>
                      <th className="py-3.5 px-4">Punch In</th>
                      <th className="py-3.5 px-4">Punch Out</th>
                      <th className="py-3.5 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filteredLogs.map((log) => {
                      const isLeave = log.status === 'ON_LEAVE' || log.status === 'LEAVE';
                      const isLate = log.status === 'LATE';

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
                                    ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-400 dark:border-sky-600 text-sky-600 dark:text-sky-400 shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 group-hover:border-sky-400/50'
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
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[12px] text-[9px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
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

                          {/* 4. Status Column (Right aligned) */}
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
                              {log.status === 'PRESENT' && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              )}
                              {isLate && (
                                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              )}
                              {isLeave && (
                                <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              )}
                              <span>{isLate ? 'Late Arrival' : isLeave ? 'On Leave' : log.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Bottom Monthly Summary Strip */}
              <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="font-medium">
                  Showing{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {filteredLogs.length}
                  </span>{' '}
                  records for{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedMonthLabel}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <span>
                    Total Logged:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {totalHoursLogged.toFixed(1)} hrs
                    </strong>
                  </span>
                  <span>
                    Overtime:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      +{totalOvertime.toFixed(1)} hrs
                    </strong>
                  </span>
                  <span>
                    On-Time Rate:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {onTimePercentage}%
                    </strong>
                  </span>
                </div>
              </div>

              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredLogs.map((log) => {
                    const isLeave = log.status === 'ON_LEAVE' || log.status === 'LEAVE';
                    const isLate = log.status === 'LATE';
                    const durationVal = Number(log.hours || log.totalHours) || 0;
                    const progressPct = Math.min(100, Math.round((durationVal / 8.5) * 100));

                    return (
                      <div
                        key={log.id}
                        className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/70 space-y-3.5 shadow-xs hover:border-sky-400/60 transition-all"
                      >
                        {/* Header: Date + Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border ${
                                log.isToday
                                  ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-400 text-sky-600 dark:text-sky-400'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <span className="text-[8px] font-black uppercase tracking-wider leading-none">
                                {log.monthShort}
                              </span>
                              <span className="text-sm font-black leading-tight mt-0.5">
                                {log.dayNum}
                              </span>
                            </div>

                            <div>
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {log.formattedDate}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {log.day}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                              log.status === 'PRESENT'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                                : isLate
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{isLate ? 'Late' : isLeave ? 'Leave' : 'Present'}</span>
                          </span>
                        </div>

                        {/* Punch In / Out / Duration Summary */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/60 text-center">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">
                              Punch In
                            </div>
                            <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {log.checkIn}
                            </div>
                          </div>
                          <div className="border-x border-slate-100 dark:border-slate-800">
                            <div className="text-[9px] uppercase font-bold text-slate-400">
                              Punch Out
                            </div>
                            <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                              {log.checkOut}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">
                              Logged
                            </div>
                            <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                              {durationVal.toFixed(1)}h
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar & Method */}
                        <div className="space-y-1.5">
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
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
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="truncate max-w-[170px]">{log.notes || log.method}</span>
                            {log.ot > 0 && (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                +{log.ot}h OT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 sm:p-16 text-center space-y-5">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500/10 via-sky-500/15 to-sky-500/20 dark:from-sky-500/20 dark:via-sky-500/20 dark:to-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/70 dark:border-sky-700/50 shadow-xl shadow-sky-500/10">
                  <CalendarDays className="w-10 h-10 stroke-[1.6]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'No Matching Attendance Records'
                    : 'Attendance Register is Empty'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'No attendance records match your active search filters or status criteria. Try clearing search keywords or resetting status filters.'
                    : `You have not recorded any attendance punch logs for ${selectedMonthLabel} yet. Real-time biometric timestamps, geofenced mobile check-ins, and shift records will appear here.`}
                </p>
              </div>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span>Multi-Tier Approval Routing</span>
                </span>
                <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span>Automated Attendance Waiver</span>
                </span>
                <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span>Zero Quota Deductions on Gazetted Days</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
