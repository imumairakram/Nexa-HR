import React, { useState, useEffect } from 'react';
import {
  Clock,
  Cpu,
  Calendar,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Zap,
  X,
  Check,
  ShieldCheck,
  MapPin,
  Filter,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const INITIAL_LOGS = [
  {
    id: '1',
    date: '2026-08-08',
    checkInTime: '2026-08-08T08:52:00.000Z',
    checkOutTime: '2026-08-08T17:35:00.000Z',
    status: 'PRESENT',
    totalHours: 8.7,
    notes: 'Biometric Face-ID Hardware Terminal 1',
    user: { employeeCode: 'EMP-101', firstName: 'Alex', lastName: 'Mercer', department: 'Engineering' },
  },
  {
    id: '2',
    date: '2026-08-08',
    checkInTime: '2026-08-08T08:58:00.000Z',
    checkOutTime: '2026-08-08T17:30:00.000Z',
    status: 'PRESENT',
    totalHours: 8.5,
    notes: 'Biometric Face-ID Hardware Terminal 2',
    user: { employeeCode: 'EMP-103', firstName: 'David', lastName: 'Miller', department: 'Engineering' },
  },
  {
    id: '3',
    date: '2026-08-08',
    checkInTime: '2026-08-08T09:14:00.000Z',
    checkOutTime: '2026-08-08T17:40:00.000Z',
    status: 'LATE',
    totalHours: 8.4,
    notes: 'Mobile GPS Check-in (Traffic delay)',
    user: { employeeCode: 'EMP-102', firstName: 'Sarah', lastName: 'Jenkins', department: 'Product & Design' },
  },
  {
    id: '4',
    date: '2026-08-08',
    checkInTime: '2026-08-08T08:45:00.000Z',
    checkOutTime: '2026-08-08T18:05:00.000Z',
    status: 'PRESENT',
    totalHours: 9.3,
    notes: 'Biometric Hardware Gateway (Overtime +0.8h)',
    user: { employeeCode: 'EMP-104', firstName: 'Marcus', lastName: 'Vance', department: 'Engineering' },
  },
  {
    id: '5',
    date: '2026-08-08',
    checkInTime: null,
    checkOutTime: null,
    status: 'ON_LEAVE',
    totalHours: 0,
    notes: 'Approved Annual Vacation Leave',
    user: { employeeCode: 'EMP-105', firstName: 'Emily', lastName: 'Zhang', department: 'Product & Design' },
  },
];

const Attendance = () => {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Manual Punch Form State
  const [punchForm, setPunchForm] = useState({
    employeeName: 'Alex Mercer (EMP-101)',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '17:30',
    status: 'PRESENT',
    notes: 'Manual punch override by HR',
  });

  const handleSyncHardware = () => {
    setIsSyncing(true);
    setToastMsg('Syncing with biometric turnstiles & IoT gateways...');
    setTimeout(() => {
      setIsSyncing(false);
      setToastMsg('Biometric hardware sync complete! 124 logs verified.');
      setTimeout(() => setToastMsg(''), 3000);
    }, 1500);
  };

  const handleManualPunch = (e) => {
    e.preventDefault();
    const newLog = {
      id: String(Date.now()),
      date: punchForm.date,
      checkInTime: `${punchForm.date}T${punchForm.checkIn}:00.000Z`,
      checkOutTime: `${punchForm.date}T${punchForm.checkOut}:00.000Z`,
      status: punchForm.status,
      totalHours: 8.5,
      notes: punchForm.notes,
      user: {
        employeeCode: 'EMP-101',
        firstName: punchForm.employeeName.split(' ')[0],
        lastName: punchForm.employeeName.split(' ')[1] || '',
        department: 'Engineering',
      },
    };

    setLogs([newLog, ...logs]);
    setIsLogModalOpen(false);
    setToastMsg('Manual attendance record added successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filteredLogs = logs.filter((log) => {
    const name = `${log.user?.firstName} ${log.user?.lastName}`.toLowerCase();
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      log.user?.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    present: logs.filter((l) => l.status === 'PRESENT').length,
    late: logs.filter((l) => l.status === 'LATE').length,
    onLeave: logs.filter((l) => l.status === 'ON_LEAVE').length,
    overtime: '14.5 Hours',
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Biometric Attendance & Time Tracking"
        subtitle="Live synchronization with hardware turnstiles, biometric facial terminals, shift hours, and punch logs."
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STATS METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Present Today</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.present} Clocked In</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Late Arrivals</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.late} Flagged</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">On Approved Leave</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.onLeave} Staff</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Overtime Logged</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.overtime}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOOLBAR & SYNC CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by employee name, code, or terminal notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSyncHardware}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Cpu className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Biometrics'}</span>
            </button>

            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {['ALL', 'PRESENT', 'LATE', 'ON_LEAVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Logs' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ATTENDANCE LOGS TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Working Hours</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6">Verification Method / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {log.user?.firstName} {log.user?.lastName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {log.user?.employeeCode} • {log.user?.department}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {log.date}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </td>
                  <td className="py-4 px-4 font-black text-blue-600 dark:text-blue-400">
                    {log.totalHours > 0 ? `${log.totalHours} hrs` : '--'}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        log.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.status === 'LATE'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{log.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: MANUAL PUNCH ENTRY */}
      {/* ========================================================================= */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Manual Punch Override</h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualPunch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Select Employee *</label>
                <select
                  value={punchForm.employeeName}
                  onChange={(e) => setPunchForm({ ...punchForm, employeeName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Alex Mercer (EMP-101)">Alex Mercer (EMP-101)</option>
                  <option value="Sarah Jenkins (EMP-102)">Sarah Jenkins (EMP-102)</option>
                  <option value="David Miller (EMP-103)">David Miller (EMP-103)</option>
                  <option value="Marcus Vance (EMP-104)">Marcus Vance (EMP-104)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Check In Time *</label>
                  <input
                    type="time"
                    required
                    value={punchForm.checkIn}
                    onChange={(e) => setPunchForm({ ...punchForm, checkIn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Check Out Time *</label>
                  <input
                    type="time"
                    required
                    value={punchForm.checkOut}
                    onChange={(e) => setPunchForm({ ...punchForm, checkOut: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Reason / Admin Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biometric terminal card read failure..."
                  value={punchForm.notes}
                  onChange={(e) => setPunchForm({ ...punchForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
