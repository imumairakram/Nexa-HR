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
  Sparkles,
  Layers,
  Check,
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
      showToast('Time-off request submitted for management review.');
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
      .reduce((acc, r) => acc + (Number(r.totalDays) || 1), 0);
    const pendingDays = requests
      .filter((r) => r.leaveTypeId === lt.id && r.status === 'PENDING')
      .reduce((acc, r) => acc + (Number(r.totalDays) || 1), 0);
    const available = Math.max(0, lt.daysAllowed - usedDays);
    const percent = Math.min(100, Math.max(0, Math.round((available / (lt.daysAllowed || 1)) * 100)));

    const themes = [
      {
        gradient: 'from-emerald-500 to-teal-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60',
        iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
        accentBar: 'bg-emerald-500',
      },
      {
        gradient: 'from-blue-500 to-indigo-600',
        badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60',
        iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
        accentBar: 'bg-blue-500',
      },
      {
        gradient: 'from-amber-500 to-orange-600',
        badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60',
        iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
        accentBar: 'bg-amber-500',
      },
      {
        gradient: 'from-purple-500 to-pink-600',
        badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60',
        iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
        accentBar: 'bg-purple-500',
      },
    ];

    return {
      type: lt.name,
      total: lt.daysAllowed,
      used: usedDays,
      pending: pendingDays,
      available,
      percent,
      theme: themes[idx % themes.length],
    };
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Leaves & Time-Off"
        subtitle="Manage leave balances, submit vacation or sick leave, and track approvals."
        onRefresh={fetchMyLeaves}
        loading={loading}
        action={
          <button
            onClick={() => setIsApplyOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold rounded-full flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Apply for Leave</span>
          </button>
        }
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LEAVE QUOTA CARDS (MODERN METRIC PROGRESS CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {quotaCards.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.theme.iconBg}`}>
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.type}</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.theme.badgeBg}`}>
                  {item.used} Used
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {item.available}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    / {item.total} Days Left
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">{item.percent}%</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.theme.gradient} transition-all duration-500`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>{item.used} days taken this year</span>
                {item.pending > 0 && (
                  <span className="text-amber-500 font-bold">{item.pending} pending</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 2. LEAVE REQUESTS HISTORY & STATUS TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Leave History & Review Status</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Review log of all time-off submissions and supervisor approval states
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {requests.length} Total Requests
          </span>
        </div>

        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Leave Category</th>
                  <th className="py-3.5 px-4">Duration & Schedule</th>
                  <th className="py-3.5 px-4">Submission Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Approval Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-100">
                            {req.leaveType?.name || 'General Leave'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {req.id ? req.id.slice(0, 8) : 'REQ'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {req.totalDays || 1} {req.totalDays === 1 ? 'day' : 'days'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {req.startDate ? req.startDate.split('T')[0] : ''} to {req.endDate ? req.endDate.split('T')[0] : ''}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                      {req.rejectionReason || (req.status === 'APPROVED' ? 'Approved by HR Lead' : 'Pending Supervisor Review')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Leave Applications Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              You haven't submitted any time-off requests yet. Use the "Apply for Leave" button above to get started.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. APPLY MODAL (PREMIUM ROUNDED DESIGN) */}
      {/* ========================================================================= */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Apply for Time-Off</h3>
                  <p className="text-xs text-slate-400">Submit leave request for manager approval</p>
                </div>
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
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                >
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({lt.daysAllowed} days allowed)
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
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Reason & Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the purpose for this leave request..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition-all hover:scale-105"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Request</span>
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
