import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  X,
  FileText,
  AlertCircle,
  Building,
  User,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const Leaves = () => {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Apply on behalf form
  const [applyForm, setApplyForm] = useState({
    userId: '',
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const [reqRes, typesRes, empRes] = await Promise.allSettled([
        api.getLeaveRequests(),
        api.getLeaveTypes(),
        api.getEmployees(),
      ]);

      if (reqRes.status === 'fulfilled' && reqRes.value?.data?.leaveRequests) {
        setRequests(reqRes.value.data.leaveRequests);
      }
      if (typesRes.status === 'fulfilled' && typesRes.value?.data?.leaveTypes) {
        setLeaveTypes(typesRes.value.data.leaveTypes);
        if (typesRes.value.data.leaveTypes.length > 0) {
          setApplyForm((prev) => ({ ...prev, leaveTypeId: typesRes.value.data.leaveTypes[0].id }));
        }
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        setEmployees(empRes.value.data.employees);
        if (empRes.value.data.employees.length > 0) {
          setApplyForm((prev) => ({ ...prev, userId: empRes.value.data.employees[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleUpdateStatus = async (reqId, newStatus) => {
    try {
      setSubmitting(true);
      await api.updateLeaveStatus(reqId, {
        status: newStatus,
        rejectionReason: remarksInput || (newStatus === 'REJECTED' ? 'Rejected by HR Management' : undefined),
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: newStatus,
                rejectionReason: remarksInput,
                approvedBy: { firstName: 'System', lastName: 'Administrator' },
              }
            : r
        )
      );

      setSelectedReq(null);
      setRemarksInput('');
      showToast(`Leave request marked as ${newStatus}!`);
    } catch (err) {
      console.error('Failed to update leave status:', err);
      showToast(err.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOnBehalf = async (e) => {
    e.preventDefault();
    if (!applyForm.userId || !applyForm.leaveTypeId || !applyForm.reason) {
      showToast('Please complete all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createLeaveRequest(applyForm);
      await fetchLeaveData();
      setIsApplyOpen(false);
      setApplyForm({
        userId: employees[0]?.id || '',
        leaveTypeId: leaveTypes[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      showToast('Leave request created successfully!');
    } catch (err) {
      console.error('Failed to create leave:', err);
      showToast(err.message || 'Failed to create leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter((r) => {
    const empName = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase();
    const reason = (r.reason || '').toLowerCase();
    const type = (r.leaveType?.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = empName.includes(query) || reason.includes(query) || type.includes(query);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Leave Management & Approval Workflows"
        subtitle="Review employee time-off applications, manage quota allowances, and automate approval pipelines."
        onRefresh={fetchLeaveData}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Applications</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.pending}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Approved Leaves</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.approved}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Declined</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.rejected}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leave requests by employee name, leave type, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsApplyOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer shrink-0 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Apply on Behalf</span>
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-4">Leave Policy</th>
                  <th className="py-3.5 px-4">Duration & Dates</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {req.user?.firstName} {req.user?.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400">{req.user?.email}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {req.leaveType?.name || 'General Leave'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {req.totalDays || 1} {req.totalDays === 1 ? 'day' : 'days'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {req.startDate ? req.startDate.split('T')[0] : ''} to {req.endDate ? req.endDate.split('T')[0] : ''}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
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
                    <td className="py-4 px-6 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                            disabled={submitting}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                            disabled={submitting}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                          {req.status === 'APPROVED' ? 'Approved' : 'Declined'}
                        </span>
                      )}
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
              There are currently no leave requests matching the selected filter. Applications submitted by employees will appear here in real-time.
            </p>
          </div>
        )}
      </div>

      {/* Apply on Behalf Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Grant Employee Leave</h3>
              </div>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOnBehalf} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Select Employee *</label>
                <select
                  required
                  value={applyForm.userId}
                  onChange={(e) => setApplyForm({ ...applyForm, userId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                      </option>
                    ))
                  ) : (
                    <option value="">No employees onboarded yet</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Leave Policy / Type *</label>
                <select
                  required
                  value={applyForm.leaveTypeId}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
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
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">End Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide context or description for the time-off..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
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
                  <span>Submit Leave</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
