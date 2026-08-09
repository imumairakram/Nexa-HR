import React, { useState } from 'react';
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
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';

const INITIAL_REQUESTS = [
  {
    id: 'LEV-401',
    employee: 'Alex Mercer',
    employeeCode: 'EMP-101',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    department: 'Engineering & DevOps',
    type: 'Annual Vacation',
    startDate: '2026-08-17',
    endDate: '2026-08-19',
    days: 3,
    reason: 'Family summer road trip to Yosemite National Park',
    appliedOn: '2026-08-05',
    status: 'APPROVED',
    approver: 'System Administrator (You)',
    remarks: 'Approved. Enjoy your time off!',
  },
  {
    id: 'LEV-402',
    employee: 'Sarah Jenkins',
    employeeCode: 'EMP-102',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    department: 'Product & Design',
    type: 'Casual Leave',
    startDate: '2026-08-12',
    endDate: '2026-08-12',
    days: 1,
    reason: 'Personal urgent family commitment and doctor visit',
    appliedOn: '2026-08-08',
    status: 'PENDING',
    approver: 'Pending Admin Action',
    remarks: '',
  },
  {
    id: 'LEV-403',
    employee: 'David Miller',
    employeeCode: 'EMP-103',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    department: 'Engineering & DevOps',
    type: 'Sick / Medical',
    startDate: '2026-08-03',
    endDate: '2026-08-04',
    days: 2,
    reason: 'Viral fever and prescribed medical rest',
    appliedOn: '2026-08-03',
    status: 'APPROVED',
    approver: 'System Administrator (You)',
    remarks: 'Medical certificate verified.',
  },
  {
    id: 'LEV-404',
    employee: 'Marcus Vance',
    employeeCode: 'EMP-104',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    department: 'Engineering & DevOps',
    type: 'Annual Vacation',
    startDate: '2026-07-28',
    endDate: '2026-07-30',
    days: 3,
    reason: 'Personal travel plans',
    appliedOn: '2026-07-25',
    status: 'REJECTED',
    approver: 'System Administrator (You)',
    remarks: 'Conflicted with critical infrastructure release sprint.',
  },
];

const Leaves = () => {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Apply on behalf form
  const [applyForm, setApplyForm] = useState({
    employee: 'Alex Mercer (EMP-101)',
    type: 'Annual Vacation',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const handleUpdateStatus = (reqId, newStatus) => {
    setRequests(
      requests.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: newStatus,
              approver: 'System Administrator (You)',
              remarks: remarksInput || (newStatus === 'APPROVED' ? 'Approved by Admin' : 'Rejected by Admin'),
            }
          : r
      )
    );
    setSelectedReq(null);
    setRemarksInput('');
    setToastMsg(`Leave request ${reqId} marked as ${newStatus}!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCreateOnBehalf = (e) => {
    e.preventDefault();
    const newReq = {
      id: `LEV-${Math.floor(400 + Math.random() * 500)}`,
      employee: applyForm.employee.split(' (')[0],
      employeeCode: 'EMP-101',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      department: 'Engineering',
      type: applyForm.type,
      startDate: applyForm.startDate,
      endDate: applyForm.endDate,
      days: 1,
      reason: applyForm.reason,
      appliedOn: new Date().toISOString().split('T')[0],
      status: 'APPROVED',
      approver: 'Admin Direct Entry',
      remarks: 'Created and approved directly by HR Admin',
    };

    setRequests([newReq, ...requests]);
    setIsApplyOpen(false);
    setToastMsg(`Leave granted for ${newReq.employee}!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
    onLeaveToday: 1,
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Leave Management & Approval Workflows"
        subtitle="Review employee time-off applications, verify quotas, approve leave requests, and monitor absences."
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
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Approvals</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.pending} Requests</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Approved This Month</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.approved} Granted</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Rejected Requests</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.rejected} Declined</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">On Leave Today</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.onLeaveToday} Away</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOOLBAR & FILTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or leave reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Requests' : st}
              </button>
            ))}

            <button
              onClick={() => setIsApplyOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Grant Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LEAVE APPLICATIONS TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-4">Leave Category</th>
                <th className="py-3.5 px-4">Duration Range</th>
                <th className="py-3.5 px-4">Days</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.avatar}
                        alt={r.employee}
                        className="w-9 h-9 rounded-xl object-cover"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">{r.employee}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.employeeCode} • {r.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                      {r.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {r.startDate} → {r.endDate}
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                    {r.days} {r.days === 1 ? 'Day' : 'Days'}
                  </td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {r.reason}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {r.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedReq(r);
                            handleUpdateStatus(r.id, 'APPROVED');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedReq(r)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 font-bold text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">{r.approver}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: REJECT / REMARKS DIALOG */}
      {/* ========================================================================= */}
      {selectedReq && selectedReq.status === 'PENDING' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Decision for {selectedReq.employee} ({selectedReq.id})
              </h3>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Reason given: <strong>"{selectedReq.reason}"</strong> ({selectedReq.days} days from {selectedReq.startDate})
              </p>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Approval / Rejection Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context or instructions for the employee..."
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleUpdateStatus(selectedReq.id, 'REJECTED')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer shadow-sm"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedReq.id, 'APPROVED')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer shadow-sm"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: GRANT ON BEHALF */}
      {/* ========================================================================= */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Grant Leave on Behalf</h3>
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
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Select Colleague *</label>
                <select
                  value={applyForm.employee}
                  onChange={(e) => setApplyForm({ ...applyForm, employee: e.target.value })}
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
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">End Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Leave Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter reason or medical circumstance..."
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
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Grant & Approve
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
