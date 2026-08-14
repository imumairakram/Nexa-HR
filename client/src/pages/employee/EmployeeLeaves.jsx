import React, { useState, useEffect } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';

const EmployeeLeaves = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Apply Form
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    dayType: 'FULL',
    reason: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const [typesRes, reqRes] = await Promise.allSettled([
        api.getLeaveTypes(),
        api.getLeaveRequests(),
      ]);

      if (typesRes.status === 'fulfilled' && typesRes.value?.data?.leaveTypes) {
        setLeaveTypes(typesRes.value.data.leaveTypes);
        if (typesRes.value.data.leaveTypes.length > 0) {
          setLeaveForm((prev) => ({ ...prev, leaveTypeId: typesRes.value.data.leaveTypes[0].id }));
        }
      }
      if (reqRes.status === 'fulfilled' && reqRes.value?.data?.leaveRequests) {
        setRequests(reqRes.value.data.leaveRequests);
      }
    } catch (err) {
      console.error('Error fetching employee leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const calculateDays = () => {
    if (!leaveForm.startDate || !leaveForm.endDate) return 1;
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const diff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    return leaveForm.dayType === 'HALF' ? 0.5 : diff;
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.leaveTypeId || !leaveForm.reason.trim()) {
      showToast('Please select a leave policy and state the reason.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createLeaveRequest({
        leaveTypeId: leaveForm.leaveTypeId,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason.trim(),
      });

      await fetchMyLeaves();
      setIsApplyOpen(false);
      setLeaveForm({
        leaveTypeId: leaveTypes[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        dayType: 'FULL',
        reason: '',
      });
      showToast('Time-off application submitted for management review successfully.');
    } catch (err) {
      console.error('Apply leave error:', err);
      showToast(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute live quota balances
  const quotaCards = leaveTypes.map((lt, idx) => {
    const usedDays = requests
      .filter((r) => r.leaveTypeId === lt.id && r.status === 'APPROVED')
      .reduce((acc, r) => acc + (r.totalDays || 1), 0);
    const available = Math.max(0, lt.daysAllowed - usedDays);
    const colors = [
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-amber-500 to-orange-600',
      'from-purple-500 to-pink-600',
    ];
    return {
      type: lt.name,
      total: lt.daysAllowed,
      used: usedDays,
      available,
      gradient: colors[idx % colors.length],
    };
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Leaves & Time-Off"
        subtitle="Manage personal leave quotas, submit time-off requests, and track supervisor approvals."
        onRefresh={fetchMyLeaves}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* LEAVE QUOTA CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotaCards.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">{item.type}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.used} Used
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {item.available}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  / {item.total} Days Total
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                  style={{ width: `${Math.min(100, Math.round((item.available / (item.total || 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTION BANNER */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Need Time Off?</h3>
          <p className="text-xs text-slate-400 mt-0.5">Submit planned leaves or medical absence for supervisor evaluation.</p>
        </div>

        <button
          onClick={() => setIsApplyOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer shrink-0 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* REQUESTS LIST */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Leave History & Status</h3>
        </div>

        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Leave Type</th>
                  <th className="py-3.5 px-4">Duration & Dates</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {req.leaveType?.name || 'General Leave'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {req.totalDays || 1} {req.totalDays === 1 ? 'day' : 'days'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {req.startDate ? req.startDate.split('T')[0] : ''} to {req.endDate ? req.endDate.split('T')[0] : ''}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400">
                      {req.rejectionReason || (req.status === 'APPROVED' ? 'Approved by HR' : 'Pending')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Leave Applications</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              You have not submitted any leave requests yet. Click "Apply for Leave" above to request time-off.
            </p>
          </div>
        )}
      </div>

      {/* APPLY MODAL */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Apply for Leave</h3>
              </div>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Leave Type *</label>
                <select
                  required
                  value={leaveForm.leaveTypeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({lt.daysAllowed} days)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the purpose for this leave request..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Application</span>
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
