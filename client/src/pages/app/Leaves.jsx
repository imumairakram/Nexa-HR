import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  RefreshCw,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { TableSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { broadcastAppEvent, subscribeAppEvent } from '../../utils/crossTabSync';

export const calculateLeaveDays = (req) => {
  if (!req) return 1;
  if (req.startDate && req.endDate) {
    try {
      const s = new Date(req.startDate);
      const e = new Date(req.endDate);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        const utc1 = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
        const utc2 = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
        const diff = Math.max(1, Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24)) + 1);
        return req.dayType === 'HALF' ? 0.5 : diff;
      }
    } catch {}
  }
  const explicit = Number(req.totalDays ?? req.days);
  if (!isNaN(explicit) && explicit > 0) return explicit;
  return 1;
};

export const formatLeaveDays = (days) => {
  const count = Number(days);
  if (isNaN(count) || count <= 0) return '1 day';
  return `${count} ${count === 1 ? 'day' : 'days'}`;
};

const Leaves = () => {
  const [requests, setRequests] = useState(() => api.getCached('/leaves/requests')?.data?.leaveRequests || []);
  const [leaveTypes, setLeaveTypes] = useState(() => api.getCached('/leaves/types')?.data?.leaveTypes || []);
  const [employees, setEmployees] = useState(() => api.getCached('/employees')?.data?.employees || []);
  const [loading, setLoading] = useState(() => !api.hasCached('/leaves/requests'));
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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

  const fetchLeaveData = async (bypass = false) => {
    if (bypass) {
      api.invalidateLeavesCache();
    } else if (!api.hasCached('/leaves/requests')) {
      setLoading(true);
    }
    try {
      const opts = bypass ? { bypassCache: true } : {};
      const [reqRes, typesRes, empRes] = await Promise.allSettled([
        api.getLeaveRequests({}, opts),
        api.getLeaveTypes(opts),
        api.getEmployees(),
      ]);

      if (reqRes.status === 'fulfilled' && reqRes.value?.data?.leaveRequests) {
        setRequests(reqRes.value.data.leaveRequests);
      }
      if (typesRes.status === 'fulfilled' && typesRes.value?.data?.leaveTypes) {
        setLeaveTypes(typesRes.value.data.leaveTypes);
        if (typesRes.value.data.leaveTypes.length > 0) {
          setApplyForm((prev) => ({ ...prev, leaveTypeId: prev.leaveTypeId || typesRes.value.data.leaveTypes[0].id }));
        }
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        setEmployees(empRes.value.data.employees);
        if (empRes.value.data.employees.length > 0) {
          setApplyForm((prev) => ({ ...prev, userId: prev.userId || empRes.value.data.employees[0].id }));
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
    const unsub = subscribeAppEvent('nexahr_leaves_updated', () => {
      fetchLeaveData(true);
    });
    const handleFocus = () => {
      fetchLeaveData(true);
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      unsub();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleOpenApplyModal = () => {
    setApplyForm((prev) => ({
      ...prev,
      userId: prev.userId || (employees.length > 0 ? employees[0].id : ''),
      leaveTypeId: prev.leaveTypeId || (leaveTypes.length > 0 ? leaveTypes[0].id : ''),
    }));
    setIsApplyOpen(true);
  };

  const handleUpdateStatus = async (reqId, newStatus) => {
    try {
      setSubmitting(true);
      await api.updateLeaveStatus(reqId, {
        status: newStatus,
        rejectionReason: remarksInput || (newStatus === 'REJECTED' ? 'Rejected by HR Management' : undefined),
      });

      const currentUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('user')) || {};
        } catch {
          return {};
        }
      })();

      setRequests((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: newStatus,
                rejectionReason: remarksInput,
                approvedBy: {
                  firstName: currentUser.firstName || 'HR',
                  lastName: currentUser.lastName || 'Management',
                },
              }
            : r
        )
      );

      setSelectedReq(null);
      setRemarksInput('');
      broadcastAppEvent('nexahr_leaves_updated');
      broadcastAppEvent('nexahr_notification_updated');
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
    const effectiveUserId = applyForm.userId || (employees.length > 0 ? employees[0].id : '');
    const effectiveLeaveTypeId = applyForm.leaveTypeId || (leaveTypes.length > 0 ? leaveTypes[0].id : '');

    if (!effectiveUserId || !effectiveLeaveTypeId || !applyForm.reason.trim()) {
      showToast('Please complete all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createLeaveRequest({
        ...applyForm,
        userId: effectiveUserId,
        leaveTypeId: effectiveLeaveTypeId,
        reason: applyForm.reason.trim(),
      });
      await fetchLeaveData(true);
      broadcastAppEvent('nexahr_leaves_updated');
      broadcastAppEvent('nexahr_notification_updated');
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

      {/* ========================================================================= */}
      {/* 1. DYNAMIC LEAVES HERO BANNER (EMERALD-TEAL LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] p-5 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Leave Telemetry */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Leave Applications & Quota Approvals
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Review incoming vacation, casual, and medical time-off requests. Approve or reject applications with audit notes and quota deductions.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{stats.approved} Leaves Approved</span>
              </span>
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{stats.pending} Applications Pending Review</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card (Desktop / Tablet) */}
          <div className="hidden sm:flex bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Admin Time-Off Entry</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Apply on behalf of staff</div>
            </div>
            <button
              onClick={handleOpenApplyModal}
              className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Apply On Behalf</span>
            </button>
          </div>

          {/* Mobile Quick Action Button */}
          <div className="sm:hidden pt-1">
            <button
              onClick={handleOpenApplyModal}
              className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-extrabold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Apply On Behalf of Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS WITH SPARKLINES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="dark"
          title="Total Applications"
          value={stats.total}
          unit={stats.total === 1 ? 'Request' : 'Requests'}
          badgeText="Lifetime Total"
          badgeType="positive"
          badgeIcon="up"
          subtext="All Leave Types"
          chartColor="purple"
          presetWave="wave1"
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Pending Review"
          value={stats.pending}
          unit="Awaiting"
          badgeText={stats.pending > 0 ? `${stats.pending} Needs Review` : 'All Cleared'}
          badgeType={stats.pending > 0 ? 'warning' : 'positive'}
          badgeIcon={stats.pending > 0 ? 'dot' : 'up'}
          subtext="HR Queue"
          chartColor="amber"
          presetWave="wave2"
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Approved Leaves"
          value={stats.approved}
          unit="Granted"
          badgeText="Synchronized"
          badgeType="positive"
          badgeIcon="up"
          subtext="Quota Deducted"
          chartColor="emerald"
          presetWave="wave3"
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Declined / Rejected"
          value={stats.rejected}
          unit="Declined"
          badgeText={stats.rejected > 0 ? `${stats.rejected} Declined` : '0 Declined'}
          badgeType={stats.rejected > 0 ? 'negative' : 'neutral'}
          badgeIcon={stats.rejected > 0 ? 'down' : 'dot'}
          subtext="Audit Reason Logged"
          chartColor="rose"
          presetWave="wave4"
          loading={loading}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-3 transition-all">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leave requests by employee name, leave type, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Button with Dropdown Menu */}
          <div className="relative shrink-0" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setShowFilterMenu((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-2xs shrink-0 ${
                statusFilter !== 'ALL'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-emerald-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700/60'
              }`}
              title="Filter by Status"
            >
              <Filter className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="hidden sm:inline">
                {statusFilter === 'ALL'
                  ? 'Filter'
                  : statusFilter === 'PENDING'
                  ? 'Pending'
                  : statusFilter === 'APPROVED'
                  ? 'Approved'
                  : 'Declined'}
              </span>
              <span className="inline sm:hidden">
                {statusFilter === 'ALL'
                  ? 'Filter'
                  : statusFilter === 'PENDING'
                  ? 'Pending'
                  : statusFilter === 'APPROVED'
                  ? 'Approved'
                  : 'Declined'}
              </span>
              {statusFilter !== 'ALL' ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              ) : (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    showFilterMenu ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span>Filter by Status</span>
                  {statusFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('ALL');
                        setShowFilterMenu(false);
                      }}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-0.5">
                  {[
                    { key: 'ALL', label: 'All Requests', count: stats.total, dot: 'bg-slate-400' },
                    { key: 'PENDING', label: 'Pending Review', count: stats.pending, dot: 'bg-amber-500' },
                    { key: 'APPROVED', label: 'Approved', count: stats.approved, dot: 'bg-emerald-500' },
                    { key: 'REJECTED', label: 'Declined', count: stats.rejected, dot: 'bg-rose-500' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setStatusFilter(item.key);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        statusFilter === item.key
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          statusFilter === item.key
                            ? 'bg-emerald-200/60 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleOpenApplyModal}
            className="px-3.5 sm:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer shrink-0 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Apply on Behalf</span>
            <span className="inline sm:hidden">Apply</span>
          </button>
        </div>

        {/* Active Filters Bar */}
        {(searchQuery || statusFilter !== 'ALL') && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Filter:
              </span>
              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                  <span>
                    Status:{' '}
                    {statusFilter === 'PENDING'
                      ? 'Pending'
                      : statusFilter === 'APPROVED'
                      ? 'Approved'
                      : 'Declined'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className="hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                  <span className="truncate max-w-[150px]">"{searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <span className="text-slate-400 text-[11px]">
                ({filtered.length} of {stats.total} shown)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Requests Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          {filtered.length > 0 ? (
            <>
              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filtered.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {req.user?.firstName} {req.user?.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {req.user?.email}
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : req.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {req.leaveType?.name || 'General Leave'}
                          </span>
                          <span className="font-black text-blue-600 dark:text-blue-400">
                            {formatLeaveDays(calculateLeaveDays(req))}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Timeline & Reason</div>
                          <div className="font-semibold text-slate-700 dark:text-slate-300">
                            {req.startDate ? req.startDate.split('T')[0] : ''} to {req.endDate ? req.endDate.split('T')[0] : ''}
                          </div>
                          {req.reason && <p className="mt-1 line-clamp-2 text-slate-600 dark:text-slate-400">{req.reason}</p>}
                        </div>
                      </div>

                      {req.status === 'PENDING' ? (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                            disabled={submitting}
                            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs text-center"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                            disabled={submitting}
                            className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer text-center"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-center font-medium text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          {req.status === 'APPROVED' ? 'Approved by HR Lead' : 'Application Declined'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
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
                            {formatLeaveDays(calculateLeaveDays(req))}
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
            </>
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
      )}

      {/* Apply on Behalf Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl shadow-sky-950/20 dark:shadow-black/60 border border-sky-200/70 dark:border-sky-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-200/50 dark:border-sky-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/30 ring-4 ring-sky-100/70 dark:ring-sky-950/60">
                  <CalendarDays className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Grant Employee Leave
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap mt-0.5">
                    Submit authorized absence record on behalf of an employee with direct ledger sync.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsApplyOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOnBehalf} className="overflow-y-hidden flex-1 px-6 sm:px-7 py-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">Select Employee *</label>
                  <select
                    required
                    value={applyForm.userId || (employees[0]?.id || '')}
                    onChange={(e) => setApplyForm({ ...applyForm, userId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer"
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

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">Leave Policy / Type *</label>
                  <select
                    required
                    value={applyForm.leaveTypeId || (leaveTypes[0]?.id || '')}
                    onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer"
                  >
                    {leaveTypes.map((lt) => (
                      <option key={lt.id} value={lt.id}>
                        {lt.name} ({lt.daysAllowed} days allowed)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">End Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">Reason & Administrative Remarks *</label>
                <textarea
                  rows={2.5}
                  required
                  placeholder="Provide context or description for the time-off..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-sky-100/60 dark:border-sky-900/40 gap-3">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-sky-500/25 cursor-pointer flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 text-xs"
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
