import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Coffee,
  Filter,
  Download,
  Plus,
  RefreshCw,
  X,
  Check,
  Zap,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';

const INITIAL_ATTENDANCE_LOGS = [
  { id: '1', date: '2026-08-08', day: 'Saturday', checkIn: '--', checkOut: '--', hours: 0, ot: 0, status: 'WEEKEND', method: '--', notes: 'Weekly Holiday' },
  { id: '2', date: '2026-08-07', day: 'Friday', checkIn: '08:52 AM', checkOut: '05:35 PM', hours: 8.7, ot: 0.2, status: 'PRESENT', method: 'Face-ID Biometric', notes: 'On-time check-in' },
  { id: '3', date: '2026-08-06', day: 'Thursday', checkIn: '09:14 AM', checkOut: '05:40 PM', hours: 8.4, ot: 0.0, status: 'LATE', method: 'Mobile GPS', notes: 'Traffic delay' },
  { id: '4', date: '2026-08-05', day: 'Wednesday', checkIn: '08:45 AM', checkOut: '06:05 PM', hours: 9.3, ot: 0.8, status: 'PRESENT', method: 'Web Console', notes: 'Sprint overtime' },
  { id: '5', date: '2026-08-04', day: 'Tuesday', checkIn: '08:58 AM', checkOut: '05:30 PM', hours: 8.5, ot: 0.0, status: 'PRESENT', method: 'Face-ID Biometric', notes: 'On-time check-in' },
  { id: '6', date: '2026-08-03', day: 'Monday', checkIn: '08:50 AM', checkOut: '05:32 PM', hours: 8.7, ot: 0.2, status: 'PRESENT', method: 'Face-ID Biometric', notes: 'On-time check-in' },
  { id: '7', date: '2026-08-02', day: 'Sunday', checkIn: '--', checkOut: '--', hours: 0, ot: 0, status: 'WEEKEND', method: '--', notes: 'Weekly Holiday' },
  { id: '8', date: '2026-08-01', day: 'Saturday', checkIn: '--', checkOut: '--', hours: 0, ot: 0, status: 'WEEKEND', method: '--', notes: 'Weekly Holiday' },
];

const EmployeeAttendance = () => {
  const [logs, setLogs] = useState(INITIAL_ATTENDANCE_LOGS);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('August 2026');

  // Live Punch State
  const [clockedIn, setClockedIn] = useState(() => {
    return localStorage.getItem('nexahr_clocked_in') === 'true';
  });
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(28540);

  // Missing Punch Regularization Modal
  const [isRegularizeOpen, setIsRegularizeOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '17:30',
    reason: '',
  });
  const [toastMsg, setToastMsg] = useState('');

  // Selected date log detail modal
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    let timer = null;
    if (clockedIn && !isOnBreak) {
      timer = setInterval(() => setTimerSeconds((p) => p + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [clockedIn, isOnBreak]);

  useEffect(() => {
    const handlePunch = () => {
      setClockedIn(localStorage.getItem('nexahr_clocked_in') === 'true');
    };
    window.addEventListener('nexahr_punch_updated', handlePunch);
    return () => window.removeEventListener('nexahr_punch_updated', handlePunch);
  }, []);

  const handleTogglePunch = () => {
    const nextState = !clockedIn;
    setClockedIn(nextState);
    localStorage.setItem('nexahr_clocked_in', String(nextState));
    window.dispatchEvent(new Event('nexahr_punch_updated'));
    if (!nextState) setIsOnBreak(false);

    setToastMsg(nextState ? 'Successfully Clocked In for today!' : 'Successfully Clocked Out. Good job today!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleRegularizeSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: String(Date.now()),
      date: regForm.date,
      day: new Date(regForm.date).toLocaleDateString('en-US', { weekday: 'long' }),
      checkIn: regForm.checkIn,
      checkOut: regForm.checkOut,
      hours: 8.5,
      ot: 0.0,
      status: 'PRESENT',
      method: 'Manual Regularization',
      notes: regForm.reason || 'Missing punch adjusted by employee',
    };
    setLogs([newEntry, ...logs]);
    setIsRegularizeOpen(false);
    setToastMsg('Regularization request submitted to HR for approval!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const formatTimer = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredLogs = logs.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Attendance & Shift Logs"
        subtitle="Live biometric punch terminal, working session tracker, and monthly presence history."
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CLOCK STATION WIDGET */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${clockedIn ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {clockedIn ? 'Currently Clocked In (Active Session)' : 'You are currently Clocked Out'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white tracking-wider">
              {clockedIn ? formatTimer(timerSeconds) : '00:00:00'}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>HQ - Silicon Valley (GPS Verified)</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Biometric Face-ID Gateway Connected</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTogglePunch}
              className={`px-6 py-3.5 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                clockedIn
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
            >
              {clockedIn ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{clockedIn ? 'Punch Out' : 'Punch In'}</span>
            </button>

            {clockedIn && (
              <button
                onClick={() => setIsOnBreak(!isOnBreak)}
                className={`px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                  isOnBreak
                    ? 'bg-amber-500 text-slate-900 border-amber-500 font-extrabold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>{isOnBreak ? 'End Break' : 'Take Break'}</span>
              </button>
            )}

            <button
              onClick={() => setIsRegularizeOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Missing Punch Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Total Hours Logged</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">168.5 hrs</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            +4.2h Overtime this month
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Present Days</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">21 Days</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">96.2% On-time arrival</div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Late Arrivals</div>
          <div className="text-2xl font-black text-amber-500">1 Day</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Aug 06 (14m late)</div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Average Daily Shift</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">8.4 hrs</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Standard: 8.0 hrs</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LOGS TABLE & FILTERS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Daily Attendance History
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Verified punch records for {selectedMonth}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Status Filter Buttons */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
              {['ALL', 'PRESENT', 'LATE'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Records' : st === 'PRESENT' ? 'Present' : 'Late'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-4">Check In</th>
                <th className="py-3.5 px-4">Check Out</th>
                <th className="py-3.5 px-4">Working Hours</th>
                <th className="py-3.5 px-4">Overtime</th>
                <th className="py-3.5 px-4">Verification Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                    <div>{row.date}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{row.day}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                    {row.checkIn}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                    {row.checkOut}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {row.hours > 0 ? `${row.hours} hrs` : '--'}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                    {row.ot > 0 ? `+${row.ot} hrs` : '--'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {row.method}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        row.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : row.status === 'LATE'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right text-[11px] text-slate-400">
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MISSING PUNCH MODAL */}
      {/* ========================================================================= */}
      {isRegularizeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Request Missing Punch Adjustment
              </h3>
              <button
                onClick={() => setIsRegularizeOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegularizeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Occurrence
                </label>
                <input
                  type="date"
                  value={regForm.date}
                  onChange={(e) => setRegForm({ ...regForm, date: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Check-In Time
                  </label>
                  <input
                    type="time"
                    value={regForm.checkIn}
                    onChange={(e) => setRegForm({ ...regForm, checkIn: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Check-Out Time
                  </label>
                  <input
                    type="time"
                    value={regForm.checkOut}
                    onChange={(e) => setRegForm({ ...regForm, checkOut: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Missing Punch
                </label>
                <textarea
                  rows={3}
                  value={regForm.reason}
                  onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })}
                  placeholder="e.g. Biometric device offline, client site visit..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegularizeOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
