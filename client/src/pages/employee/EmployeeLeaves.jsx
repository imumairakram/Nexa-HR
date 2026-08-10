import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  X,
  FileText,
  AlertCircle,
  Calendar,
  XCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const INITIAL_LEAVE_BALANCES = [
  { type: 'Annual Leave', available: 10, total: 14, used: 4, color: 'from-emerald-500 to-teal-600', textCol: 'text-emerald-600' },
  { type: 'Casual Leave', available: 4, total: 6, used: 2, color: 'from-blue-500 to-indigo-600', textCol: 'text-blue-600' },
  { type: 'Sick / Medical', available: 5, total: 8, used: 3, color: 'from-amber-500 to-orange-600', textCol: 'text-amber-600' },
  { type: 'Maternity/Paternity', available: 30, total: 30, used: 0, color: 'from-purple-500 to-pink-600', textCol: 'text-purple-600' },
];

const INITIAL_LEAVE_REQUESTS = [
  {
    id: '1',
    type: 'Annual Leave',
    startDate: '2026-08-17',
    endDate: '2026-08-19',
    days: 3,
    reason: 'Family summer road trip to Yosemite',
    appliedOn: '2026-08-05',
    status: 'APPROVED',
    approver: 'System Administrator (HR)',
    remarks: 'Approved. Enjoy your time off!',
  },
  {
    id: '2',
    type: 'Sick / Medical',
    startDate: '2026-07-14',
    endDate: '2026-07-14',
    days: 1,
    reason: 'Severe dental checkup and root canal appointment',
    appliedOn: '2026-07-13',
    status: 'APPROVED',
    approver: 'System Administrator (HR)',
    remarks: 'Medical certificate verified.',
  },
  {
    id: '3',
    type: 'Casual Leave',
    startDate: '2026-06-22',
    endDate: '2026-06-23',
    days: 2,
    reason: 'Personal urgent family commitment',
    appliedOn: '2026-06-18',
    status: 'APPROVED',
    approver: 'System Administrator (HR)',
    remarks: 'Approved.',
  },
];

const EmployeeLeaves = () => {
  const [balances, setBalances] = useState(INITIAL_LEAVE_BALANCES);
  const [requests, setRequests] = useState(INITIAL_LEAVE_REQUESTS);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Apply Form
  const [leaveForm, setLeaveForm] = useState({
    type: 'Annual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    dayType: 'FULL',
    reason: '',
  });

  const calculateDays = () => {
    if (!leaveForm.startDate || !leaveForm.endDate) return 1;
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const diff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    return leaveForm.dayType === 'HALF' ? 0.5 : diff;
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    const days = calculateDays();
    const newReq = {
      id: String(Date.now()),
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days,
      reason: leaveForm.reason,
      appliedOn: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      approver: 'Pending Manager Review',
      remarks: 'Submitted for HR evaluation',
    };

    setRequests([newReq, ...requests]);
    setIsApplyOpen(false);
    setToastMsg(`Leave application for ${days} days submitted successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCancelPending = (id) => {
    setRequests(requests.filter((r) => r.id !== id));
    setToastMsg('Leave application cancelled.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Leaves"
        subtitle="Leave quotas, time-off requests, and approvals."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LEAVE QUOTA CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">{item.type}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 ${item.textCol}`}>
                  {item.used} Used
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {item.available}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  / {item.total} Days Left
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${item.color} h-full rounded-full transition-all`}
                style={{ width: `${(item.available / item.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 2. LEAVE REQUEST ACTIONS & TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              My Leave Application History
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Track status of all submitted leave requests
            </p>
          </div>

          <button
            onClick={() => setIsApplyOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Apply For Leave</span>
          </button>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Leave Type</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Days</th>
                <th className="py-3.5 px-4">Applied On</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Approver Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                    {r.type}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                    {r.startDate} to {r.endDate}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {r.days} {r.days === 1 ? 'day' : 'days'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{r.appliedOn}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {r.reason}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : r.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.remarks}</div>
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelPending(r.id)}
                        className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer mt-0.5"
                      >
                        Cancel Request
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. APPLY FOR LEAVE MODAL */}
      {/* ========================================================================= */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Submit Leave Application
              </h3>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Annual Leave">Annual Leave (10 Days Available)</option>
                  <option value="Casual Leave">Casual Leave (4 Days Available)</option>
                  <option value="Sick / Medical">Sick / Medical Leave (5 Days Available)</option>
                  <option value="Maternity/Paternity">Maternity/Paternity Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  Calculated Duration:
                </span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  {calculateDays()} Total Working Days
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Time Off
                </label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Explain why you are requesting leave..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;
