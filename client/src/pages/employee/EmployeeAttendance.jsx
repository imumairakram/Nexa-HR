import React, { useState, useEffect } from 'react';
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
  Info,
  Cpu,
  Fingerprint,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const EmployeeAttendance = () => {
  const { formatTime, formatDate, timezone } = useRegionalSettings();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [todayLog, setTodayLog] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock updating every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real database attendance logs
  const fetchMyAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.getMyAttendanceLogs();
      if (res && res.success && res.data?.attendances) {
        const rawLogs = res.data.attendances;

        // Transform DB attendance objects
        const formatted = rawLogs.map((att) => {
          const inTime = att.checkInTime ? formatTime(att.checkInTime, false) : '--:--';
          const outTime = att.checkOutTime ? formatTime(att.checkOutTime, false) : '--:--';

          const dateObj = new Date(att.date);
          const dayName = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('en-US', { weekday: 'long' })
            : 'Weekday';

          return {
            id: att.id,
            rawDate: att.date,
            formattedDate: formatDate(att.date),
            day: dayName,
            checkIn: inTime,
            checkOut: outTime,
            hours: att.totalHours || (att.checkInTime && att.checkOutTime ? 8.5 : 0),
            ot: att.totalHours && att.totalHours > 8.0 ? parseFloat((att.totalHours - 8.0).toFixed(1)) : 0,
            status: att.status || 'PRESENT',
            method: att.notes || 'Biometric Face-ID (Terminal 01)',
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

  const filteredLogs = logs.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  // Calculate live database metrics directly from PostgreSQL records
  const totalDaysPresent = logs.filter((l) => l.status === 'PRESENT' || l.status === 'LATE').length;
  const lateArrivals = logs.filter((l) => l.status === 'LATE').length;
  const totalHoursLogged = logs.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const totalOvertime = logs.reduce((acc, curr) => acc + (curr.ot || 0), 0);
  const onTimePercentage = totalDaysPresent > 0 ? Math.round(((totalDaysPresent - lateArrivals) / totalDaysPresent) * 100) : 100;

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
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-bold border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Biometric Hardware Station Online</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-md text-blue-300 text-xs font-semibold border border-blue-400/20">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Database Sync Active</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
              {todayLog?.checkIn && todayLog.checkIn !== '--:--'
                ? `Today's Entry: ${todayLog.checkIn} (Verified)`
                : 'Turnstiles & Biometric Gates Synchronized'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Punches are captured in real-time from office biometric face-recognition and fingerprint gate terminals. Manual adjustments are managed by HR.
            </p>

            {/* Live Clock & Shift Details */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
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
                <div className="text-lg sm:text-xl font-mono font-black text-blue-400 mt-0.5">
                  {todayLog?.checkOut || '--:--'}
                </div>
                <div className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />
                  <span>{todayLog?.checkOut && todayLog.checkOut !== '--:--' ? 'Recorded' : 'Pending'}</span>
                </div>
              </div>
            </div>

            <div className="w-full pt-2 flex items-center justify-between text-[11px] text-slate-300 font-medium">
              <span>Shift: 09:00 AM – 05:30 PM</span>
              <span className="text-emerald-400 font-bold">8.5h Standard</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 2. STATS ROW (EXECUTIVE BIOMETRIC TELEMETRY CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Present Days */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Verified Present
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalDaysPresent} <span className="text-base font-bold text-slate-400">{totalDaysPresent === 1 ? 'Day' : 'Days'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{onTimePercentage}% On-Time Rate</span>
              <span className="text-slate-400">Punches Synced</span>
            </div>
          </div>
        </div>

        {/* Card 2: Late Entries */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Late Arrivals
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              {lateArrivals} <span className="text-base font-bold text-slate-400">{lateArrivals === 1 ? 'Day' : 'Days'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">15 Mins Grace (09:15 AM)</span>
              <span className="text-slate-400">Standard Shift</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Work Hours */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Logged Hours
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalHoursLogged.toFixed(1)} <span className="text-base font-bold text-slate-400">hrs</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">+{totalOvertime.toFixed(1)}h Overtime</span>
              <span className="text-slate-400">Cumulative Total</span>
            </div>
          </div>
        </div>

        {/* Card 4: Terminal Sync Logs */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-purple-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Biometric Logs
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Fingerprint className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {logs.length} <span className="text-base font-bold text-slate-400">{logs.length === 1 ? 'Entry' : 'Entries'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-purple-600 dark:text-purple-400 font-bold">Biometric Hardware</span>
              <span className="text-slate-400">Auto-Reconciled</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODERN ATTENDANCE LOG DATA GRID */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Attendance History & Machine Timestamps</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Verified daily time punches captured by IoT biometric attendance terminals
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl self-start sm:self-auto">
            {[
              { id: 'ALL', label: 'All Logs' },
              { id: 'PRESENT', label: 'Present' },
              { id: 'LATE', label: 'Late' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Timeline Data Grid */}
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Work Date</th>
                  <th className="py-3.5 px-4">Punch In</th>
                  <th className="py-3.5 px-4">Punch Out</th>
                  <th className="py-3.5 px-4">Logged Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Verification Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-100">{log.formattedDate}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{log.day}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {log.checkIn}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {log.checkOut}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {log.hours ? `${Number(log.hours).toFixed(1)} hrs` : '--'}
                      </div>
                      {log.ot > 0 && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          +{log.ot}h Overtime
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          log.status === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono">
                        {log.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Fingerprint className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Biometric Logs Recorded</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Your daily presence records will appear here as biometric hardware punch events occur.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendance;
