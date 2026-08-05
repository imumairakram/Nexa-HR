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
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Punch Log Form State
  const [punchData, setPunchData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:00',
    checkOutTime: '17:30',
    status: 'PRESENT',
    notes: 'Biometric Face-ID verified',
  });

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const [attRes, empRes] = await Promise.all([
        api.getAttendanceLogs({ status: statusFilter }),
        api.getEmployees(),
      ]);

      if (attRes.success && attRes.data?.attendances) {
        setLogs(attRes.data.attendances);
      }
      if (empRes.success && empRes.data?.employees) {
        setEmployees(empRes.data.employees);
        if (empRes.data.employees.length > 0 && !punchData.userId) {
          setPunchData((prev) => ({ ...prev, userId: empRes.data.employees[0].id }));
        }
      }
    } catch (err) {
      console.warn('Backend offline, using fallback attendance data.', err);
      setLogs([
        {
          id: '1',
          date: '2026-08-04',
          checkInTime: '2026-08-04T08:52:00.000Z',
          checkOutTime: '2026-08-04T17:30:00.000Z',
          status: 'PRESENT',
          totalHours: 8.6,
          notes: 'Biometric Face-ID verified',
          user: { employeeCode: 'EMP-101', firstName: 'Sarah', lastName: 'Connor' },
        },
        {
          id: '2',
          date: '2026-08-04',
          checkInTime: '2026-08-04T08:58:00.000Z',
          checkOutTime: '2026-08-04T17:15:00.000Z',
          status: 'PRESENT',
          totalHours: 8.2,
          notes: 'Biometric Face-ID verified',
          user: { employeeCode: 'EMP-102', firstName: 'John', lastName: 'Doe' },
        },
        {
          id: '3',
          date: '2026-08-04',
          checkInTime: '2026-08-04T09:42:00.000Z',
          checkOutTime: '2026-08-04T17:30:00.000Z',
          status: 'LATE',
          totalHours: 7.8,
          notes: 'Traffic delay recorded',
          user: { employeeCode: 'EMP-103', firstName: 'Alex', lastName: 'Mercer' },
        },
        {
          id: '4',
          date: '2026-08-04',
          checkInTime: '2026-08-04T08:45:00.000Z',
          checkOutTime: '2026-08-04T18:00:00.000Z',
          status: 'PRESENT',
          totalHours: 9.25,
          notes: 'Overtime recorded (+1.25h)',
          user: { employeeCode: 'EMP-104', firstName: 'Emily', lastName: 'Watson' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [statusFilter]);

  const handlePunchSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.logAttendance(punchData);
      if (res.success) {
        setIsLogModalOpen(false);
        loadAttendance();
      }
    } catch (err) {
      alert(err.message || 'Failed to log attendance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const name = `${log.user?.firstName || ''} ${log.user?.lastName || ''}`.toLowerCase();
    const code = (log.user?.employeeCode || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || code.includes(searchQuery.toLowerCase());
  });

  const presentCount = logs.filter((l) => l.status === 'PRESENT').length;
  const lateCount = logs.filter((l) => l.status === 'LATE').length;
  const absentCount = logs.filter((l) => l.status === 'ABSENT').length;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Header matching exact reference screenshot */}
      <AppPageHeader
        title="Attendance & Biometric Logs"
        onSearch={(v) => setSearchQuery(v)}
        onRefresh={() => loadAttendance()}
        loading={loading}
      />

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Present Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900">{presentCount}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">On Time</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Late Arrivals</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900">{lateCount}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Grace Applied</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Absent / Leave</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900">{absentCount}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">Recorded</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Hardware Status</span>
            <Zap className="w-4 h-4 text-purple-500 animate-bounce" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900">100%</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Online</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3.5 rounded-3xl shadow-soft border border-slate-100/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['', 'PRESENT', 'LATE', 'ABSENT', 'HALF_DAY'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {st || 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase">
              <th className="pb-3 px-3">Date</th>
              <th className="pb-3 px-3">Employee</th>
              <th className="pb-3 px-3">Check-In</th>
              <th className="pb-3 px-3">Check-Out</th>
              <th className="pb-3 px-3">Total Hours</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3">Biometric Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                  No attendance records found for this filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const checkInFormatted = log.checkInTime
                  ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--';
                const checkOutFormatted = log.checkOutTime
                  ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-semibold">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">
                        {log.user?.firstName} {log.user?.lastName}
                      </div>
                      <span className="text-[10px] font-bold text-purple-600">{log.user?.employeeCode}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-bold">{checkInFormatted}</td>
                    <td className="py-3 px-3 text-slate-700 font-bold">{checkOutFormatted}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{log.totalHours ? `${log.totalHours} hrs` : '--'}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          log.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.status === 'LATE'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] truncate max-w-xs">{log.notes || 'Verified'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Punch Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Manual Punch Entry</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePunchSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee</label>
                <select
                  value={punchData.userId}
                  onChange={(e) => setPunchData({ ...punchData, userId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={punchData.date}
                    onChange={(e) => setPunchData({ ...punchData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={punchData.status}
                    onChange={(e) => setPunchData({ ...punchData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="LATE">LATE</option>
                    <option value="ABSENT">ABSENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Check-In Time</label>
                  <input
                    type="time"
                    value={punchData.checkInTime}
                    onChange={(e) => setPunchData({ ...punchData, checkInTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Check-Out Time</label>
                  <input
                    type="time"
                    value={punchData.checkOutTime}
                    onChange={(e) => setPunchData({ ...punchData, checkOutTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Exception Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Manual correction by HR"
                  value={punchData.notes}
                  onChange={(e) => setPunchData({ ...punchData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-slate-800"
                >
                  {isSubmitting ? 'Saving...' : 'Save Log'}
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
