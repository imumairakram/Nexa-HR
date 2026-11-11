import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarDays,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  X,
  FileText,
  AlertCircle,
  AlertTriangle,
  Building,
  Check,
  RefreshCw,
  ChevronDown,
  RotateCcw,
  Download,
  Users,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import ModernSearchBarSection from '../../components/common/ModernSearchBarSection';
import { TableSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { broadcastAppEvent, subscribeAppEvent } from '../../utils/crossTabSync';

const getInitials = (firstName = '', lastName = '') => {
  const f = firstName ? firstName[0].toUpperCase() : '';
  const l = lastName ? lastName[0].toUpperCase() : '';
  return f + l || 'EM';
};

const parseDateInfo = (dateStr) => {
  if (!dateStr) return { monthShort: 'DAY', dayNum: '--', formatted: '--', weekday: '' };
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const monthShort = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const dayNum = String(d.getDate()).padStart(2, '0');
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      return { monthShort, dayNum, formatted, weekday };
    }
  } catch {}
  return { monthShort: 'DAY', dayNum: '--', formatted: dateStr, weekday: '' };
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate) return '--';
  const sInfo = parseDateInfo(startDate);
  if (!endDate || startDate === endDate) return sInfo.formatted;
  const eInfo = parseDateInfo(endDate);
  return `${sInfo.formatted} – ${eInfo.formatted}`;
};

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
    } catch { }
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState('ALL');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
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

  const activeEmployeeObj =
    selectedEmployee !== 'ALL'
      ? employees.find(
          (e) => e.id === selectedEmployee || e.employeeCode === selectedEmployee
        )
      : null;

  const filtered = requests
    .filter((r) => {
      const empName = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase();
      const empCode = (r.user?.employeeCode || '').toLowerCase();
      const reason = (r.reason || '').toLowerCase();
      const type = (r.leaveType?.name || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        empName.includes(query) ||
        empCode.includes(query) ||
        reason.includes(query) ||
        type.includes(query);

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesType = leaveTypeFilter === 'ALL' || (r.leaveType?.name || '') === leaveTypeFilter;
      const matchesEmployee =
        selectedEmployee === 'ALL' ||
        r.userId === selectedEmployee ||
        r.user?.id === selectedEmployee ||
        r.user?.employeeCode === selectedEmployee;

      let matchesDate = true;
      if (dateRange !== 'ALL' && r.startDate) {
        try {
          const reqDate = new Date(r.startDate);
          const now = new Date();
          if (dateRange === 'THIS_MONTH') {
            matchesDate =
              reqDate.getFullYear() === now.getFullYear() && reqDate.getMonth() === now.getMonth();
          } else if (dateRange === 'LAST_MONTH') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            matchesDate =
              reqDate.getFullYear() === lastMonth.getFullYear() &&
              reqDate.getMonth() === lastMonth.getMonth();
          } else if (dateRange === 'THIS_YEAR') {
            matchesDate = reqDate.getFullYear() === now.getFullYear();
          }
        } catch { }
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate && matchesEmployee;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === 'date') {
        diff = new Date(b.startDate || b.createdAt || 0) - new Date(a.startDate || a.createdAt || 0);
      } else if (sortKey === 'days') {
        diff = calculateLeaveDays(b) - calculateLeaveDays(a);
      } else if (sortKey === 'employee') {
        const nameA = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.trim();
        const nameB = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.trim();
        diff = nameA.localeCompare(nameB);
      }
      return sortOrder === 'asc' ? -diff : diff;
    });

  const exportToCSV = () => {
    if (!filtered.length) return;
    const isSingle = selectedEmployee !== 'ALL';
    const headers = isSingle
      ? ['Leave Policy', 'Start Date', 'End Date', 'Total Days', 'Day Type', 'Status', 'Reason / Notes']
      : [
          'Employee Name',
          'Employee Code',
          'Department',
          'Leave Policy',
          'Start Date',
          'End Date',
          'Total Days',
          'Day Type',
          'Status',
          'Reason / Notes',
        ];
    const csvRows = [
      headers.join(','),
      ...filtered.map((r) => {
        const name = `"${((r.user?.firstName || '') + ' ' + (r.user?.lastName || '')).trim()}"`;
        const code = `"${r.user?.employeeCode || ''}"`;
        const dept = `"${typeof r.user?.department === 'object' ? r.user?.department?.name || '' : r.user?.profile?.department?.name || r.user?.department || ''}"`;
        const policy = `"${r.leaveType?.name || 'General Leave'}"`;
        const start = r.startDate ? r.startDate.split('T')[0] : '';
        const end = r.endDate ? r.endDate.split('T')[0] : '';
        const days = calculateLeaveDays(r);
        const dayType = r.dayType === 'HALF' ? 'Half Day' : 'Full Day';
        const status = r.status;
        const reason = `"${(r.reason || '').replace(/"/g, '""')}"`;
        return isSingle
          ? [policy, start, end, days, dayType, status, reason].join(',')
          : [name, code, dept, policy, start, end, days, dayType, status, reason].join(',');
      }),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leaves_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  };

  const statusTabs = [
    { key: 'ALL', label: 'All', count: stats.total },
    { key: 'APPROVED', label: 'Approved', count: stats.approved },
    { key: 'PENDING', label: 'Pending', count: stats.pending },
    { key: 'REJECTED', label: 'Declined', count: stats.rejected },
  ];

  const dateRangeOptions = [
    { key: 'ALL', label: 'All Dates' },
    { key: 'THIS_MONTH', label: 'This Month' },
    { key: 'LAST_MONTH', label: 'Last Month' },
    { key: 'THIS_YEAR', label: 'This Year' },
  ];

  const dateRangeLabel = (() => {
    if (dateRange === 'THIS_MONTH') {
      const now = new Date();
      return `${now.toLocaleString('en-US', { month: 'short' })} 1 – ${now.toLocaleString('en-US', { month: 'short' })} ${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}, ${now.getFullYear()}`;
    }
    if (dateRange === 'LAST_MONTH') return 'Last Month';
    if (dateRange === 'THIS_YEAR') return `Year ${new Date().getFullYear()}`;
    return 'All Dates';
  })();

  const sortOptions = [
    { key: 'date', label: 'Date' },
    { key: 'days', label: 'Duration' },
    { key: 'employee', label: 'Employee' },
  ];

  const filterTags = [];
  if (selectedEmployee !== 'ALL' && activeEmployeeObj) {
    filterTags.push({
      key: 'employee',
      label: `staff: ${activeEmployeeObj.fullName || activeEmployeeObj.firstName}`,
    });
  }
  if (leaveTypeFilter !== 'ALL') {
    filterTags.push({ key: 'leaveType', label: `type: ${leaveTypeFilter}` });
  }
  if (dateRange !== 'ALL') {
    filterTags.push({ key: 'dateRange', label: `range: ${dateRange.replace('_', ' ').toLowerCase()}` });
  }

  const filterCount =
    (selectedEmployee !== 'ALL' ? 1 : 0) +
    (leaveTypeFilter !== 'ALL' ? 1 : 0) +
    (dateRange !== 'ALL' ? 1 : 0);

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

      {/* ========================================================================= */}
      {/* 3. LEAVE APPLICATIONS & APPROVAL WORKFLOWS TABLE CONTAINER */}
      {/* ========================================================================= */}
      {loading ? (
        <TableSkeleton rows={6} cols={selectedEmployee === 'ALL' ? 6 : 5} />
      ) : (
        <div className="bg-white dark:bg-[#111C24] rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-all">
          {/* Header with Title & Action Controls */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Leave Applications & Approval Workflows</span>
                    {stats.pending > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                        {stats.pending} Pending Review
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {selectedEmployee === 'ALL'
                      ? `Viewing organization-wide leave records (${filtered.length} applications)`
                      : `Viewing leave records for ${activeEmployeeObj?.fullName || `${activeEmployeeObj?.firstName} ${activeEmployeeObj?.lastName}`} (${filtered.length} applications)`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={exportToCSV}
                title="Export filtered records to CSV"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleOpenApplyModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm shadow-sky-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply on Behalf</span>
              </button>
            </div>
          </div>

          {/* Modern Dynamic Search & Filtering Section */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40">
            <ModernSearchBarSection
              statusTabs={statusTabs}
              activeStatus={statusFilter}
              onStatusChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search leave requests by employee name, code, reason, or leave type..."
              searchHint="status:pending"
              filterTags={filterTags}
              onRemoveTag={(tag) => {
                const key = typeof tag === 'string' ? tag : tag.key;
                if (key === 'employee') setSelectedEmployee('ALL');
                if (key === 'leaveType') setLeaveTypeFilter('ALL');
                if (key === 'dateRange') setDateRange('ALL');
              }}
              dateRangeLabel={dateRangeLabel}
              dateRangeOptions={dateRangeOptions}
              activeDateRange={dateRange}
              onDateRangeChange={setDateRange}
              sortOptions={sortOptions}
              activeSort={sortKey}
              sortOrder={sortOrder}
              onSortChange={(key, order) => {
                setSortKey(key);
                setSortOrder(order);
              }}
              filterCount={filterCount}
              filterContent={
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Leave Filters
                    </span>
                    {filterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmployee('ALL');
                          setLeaveTypeFilter('ALL');
                          setDateRange('ALL');
                        }}
                        className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Staff Member Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Staff Member
                    </label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedEmployee('ALL')}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                          selectedEmployee === 'ALL'
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>All Employees</span>
                        {selectedEmployee === 'ALL' && <Check className="w-3.5 h-3.5 text-sky-500" />}
                      </button>
                      {employees.map((emp) => {
                        const isSelected = selectedEmployee === emp.id || selectedEmployee === emp.employeeCode;
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => setSelectedEmployee(emp.id)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">{emp.firstName} {emp.lastName}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Leave Type Filter */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Leave Policy
                    </label>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {['ALL', ...new Set(leaveTypes.map((t) => t.name))].map((typeName) => {
                        const isSelected = leaveTypeFilter === typeName;
                        return (
                          <button
                            key={typeName}
                            type="button"
                            onClick={() => setLeaveTypeFilter(typeName)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">{typeName === 'ALL' ? 'All Policies' : typeName}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {dateRangeOptions.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setDateRange(opt.key)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer truncate ${
                            dateRange === opt.key
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-700'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              }
              actionButton={
                <button
                  type="button"
                  onClick={exportToCSV}
                  title="Export filtered records to CSV"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              }
            />
          </div>

          {/* Individual Employee Profile Header (When an employee is selected) */}
          {selectedEmployee !== 'ALL' && activeEmployeeObj && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-slate-50/60 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-800/40 border-b border-sky-200/60 dark:border-sky-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-sky-500/20 border-2 border-white dark:border-slate-800">
                  {getInitials(activeEmployeeObj.firstName, activeEmployeeObj.lastName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {activeEmployeeObj.fullName ||
                        `${activeEmployeeObj.firstName} ${activeEmployeeObj.lastName}`}
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800/60">
                      {activeEmployeeObj.employeeCode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                    <span>
                      {activeEmployeeObj.profile?.designation?.title ||
                        activeEmployeeObj.designation ||
                        'Staff'}
                    </span>
                    <span>•</span>
                    <span className="text-sky-700 dark:text-sky-300 font-bold">
                      {activeEmployeeObj.profile?.department?.name ||
                        activeEmployeeObj.department ||
                        'Operations'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedEmployee('ALL')}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>View All Employees</span>
                </button>
              </div>
            </div>
          )}

          {/* Table / Timeline Data Grid */}
          {filtered.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/75 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      {selectedEmployee === 'ALL' && (
                        <th className="py-3.5 px-6">Employee</th>
                      )}
                      <th className="py-3.5 px-6">Leave Duration & Dates</th>
                      <th className="py-3.5 px-4">Leave Policy</th>
                      <th className="py-3.5 px-4">Reason / Notes</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filtered.map((req) => {
                      const startInfo = parseDateInfo(req.startDate);
                      const daysCount = calculateLeaveDays(req);
                      const dateRangeText = formatDateRange(req.startDate, req.endDate);

                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* 0. Employee Column (When All Employees view is active) */}
                          {selectedEmployee === 'ALL' && (
                            <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 border border-white dark:border-slate-800 shadow-2xs">
                                  {getInitials(req.user?.firstName, req.user?.lastName)}
                                </div>
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedEmployee(req.user?.id || req.userId)}
                                    title="Click to filter by this employee"
                                    className="font-extrabold text-slate-900 dark:text-white text-xs block text-left hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate max-w-[170px] cursor-pointer"
                                  >
                                    {req.user?.firstName} {req.user?.lastName}
                                  </button>
                                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                    <span>{req.user?.employeeCode || req.user?.email}</span>
                                    {(req.user?.department || req.user?.profile?.department?.name) && (
                                      <>
                                        <span>•</span>
                                        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                                          {typeof req.user.department === 'object'
                                            ? req.user.department?.name
                                            : req.user?.profile?.department?.name || req.user.department}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* 1. Leave Duration & Dates Column */}
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3.5">
                              {/* Date Number Badge */}
                              <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center border transition-all bg-slate-100 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 group-hover:border-sky-400/50 shrink-0">
                                <span className="text-[9px] font-black uppercase tracking-wider leading-none">
                                  {startInfo.monthShort}
                                </span>
                                <span className="text-base font-black leading-tight mt-0.5">
                                  {startInfo.dayNum}
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                                    {dateRangeText}
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/50">
                                    {formatLeaveDays(daysCount)}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                                  <span>{startInfo.weekday ? `${startInfo.weekday} Start` : 'Scheduled'}</span>
                                  <span>•</span>
                                  <span>{req.dayType === 'HALF' ? 'Half Day' : 'Full Day'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Leave Policy Column */}
                          <td className="py-4 px-4 font-mono">
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/40 text-sky-700 dark:text-sky-300 text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-sky-500" />
                                {req.leaveType?.name || 'General Leave'}
                              </span>
                              <div className="text-[10px] text-slate-400 font-sans mt-0.5 pl-1">
                                {req.leaveType?.isPaid !== false ? 'Paid Allowance' : 'Unpaid Leave'}
                              </div>
                            </div>
                          </td>

                          {/* 3. Reason / Notes Column */}
                          <td className="py-4 px-4 max-w-xs">
                            <p
                              className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed"
                              title={req.reason}
                            >
                              {req.reason || (
                                <span className="text-slate-400 italic">No notes or reason provided</span>
                              )}
                            </p>
                          </td>

                          {/* 4. Status Column */}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border shadow-2xs ${
                                req.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50'
                                  : req.status === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/50'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50'
                              }`}
                            >
                              {req.status === 'APPROVED' && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              )}
                              {req.status === 'REJECTED' && (
                                <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              )}
                              {req.status === 'PENDING' && (
                                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              )}
                              <span>
                                {req.status === 'PENDING'
                                  ? 'Pending'
                                  : req.status === 'APPROVED'
                                  ? 'Approved'
                                  : 'Declined'}
                              </span>
                            </span>
                          </td>

                          {/* 5. Actions Column (Right aligned) */}
                          <td className="py-4 px-6 text-right">
                            {req.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                  disabled={submitting}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                  disabled={submitting}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white text-xs font-bold transition-all cursor-pointer border border-rose-200/70 dark:border-rose-800/50 shadow-2xs active:scale-95 disabled:opacity-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-400">
                                {req.status === 'APPROVED' ? 'Approved by HR Lead' : 'Application Declined'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Bottom Summary Strip */}
              <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="font-medium">
                  Showing{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {filtered.length}
                  </span>{' '}
                  records{' '}
                  {dateRangeLabel !== 'All Dates' && (
                    <>
                      for <span className="font-bold text-emerald-600 dark:text-emerald-400">{dateRangeLabel}</span>
                    </>
                  )}{' '}
                  {selectedEmployee !== 'ALL' && (
                    <span>({activeEmployeeObj?.fullName || 'Individual Records'})</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <span>
                    Pending:{' '}
                    <strong className="text-amber-600 dark:text-amber-400">
                      {stats.pending}
                    </strong>
                  </span>
                  <span>
                    Approved:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {stats.approved}
                    </strong>
                  </span>
                  <span>
                    Approval Rate:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                    </strong>
                  </span>
                </div>
              </div>

              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filtered.map((req) => {
                    const startInfo = parseDateInfo(req.startDate);
                    const daysCount = calculateLeaveDays(req);
                    return (
                      <div
                        key={req.id}
                        className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/70 space-y-3.5 shadow-xs hover:border-sky-400/60 transition-all"
                      >
                        {/* Header: Employee/Date + Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
                              <span className="text-[8px] font-black uppercase tracking-wider leading-none">
                                {startInfo.monthShort}
                              </span>
                              <span className="text-sm font-black leading-tight mt-0.5">
                                {startInfo.dayNum}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[150px]">
                                {req.user?.firstName} {req.user?.lastName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                {req.user?.employeeCode || req.user?.email}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                                : req.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>
                              {req.status === 'PENDING'
                                ? 'Pending'
                                : req.status === 'APPROVED'
                                ? 'Approved'
                                : 'Declined'}
                            </span>
                          </span>
                        </div>

                        {/* Duration & Policy Summary */}
                        <div className="grid grid-cols-2 gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/60 text-center">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">
                              Leave Policy
                            </div>
                            <div className="text-xs font-bold text-sky-600 dark:text-sky-400 truncate mt-0.5">
                              {req.leaveType?.name || 'General Leave'}
                            </div>
                          </div>
                          <div className="border-l border-slate-100 dark:border-slate-800">
                            <div className="text-[9px] uppercase font-bold text-slate-400">
                              Duration
                            </div>
                            <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                              {formatLeaveDays(daysCount)}
                            </div>
                          </div>
                        </div>

                        {/* Dates & Reason */}
                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                          <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {formatDateRange(req.startDate, req.endDate)}{' '}
                            {req.dayType === 'HALF' ? '(Half Day)' : ''}
                          </div>
                          {req.reason && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed bg-white/60 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                              {req.reason}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        {req.status === 'PENDING' ? (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              disabled={submitting}
                              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs text-center flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              disabled={submitting}
                              className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 border border-rose-200/60 dark:border-rose-800/50"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-center font-medium text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            {req.status === 'APPROVED' ? 'Approved by HR Lead' : 'Application Declined'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 sm:p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center border border-sky-200/60 dark:border-sky-800/50 shadow-sm">
                <CalendarDays className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {searchQuery || statusFilter !== 'ALL' || leaveTypeFilter !== 'ALL' || dateRange !== 'ALL' || selectedEmployee !== 'ALL'
                    ? 'No records match your filter criteria'
                    : 'No Leave Applications Found'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {searchQuery || statusFilter !== 'ALL' || leaveTypeFilter !== 'ALL' || dateRange !== 'ALL' || selectedEmployee !== 'ALL'
                    ? 'Try clearing your filters or choosing a different staff member, leave policy, or status.'
                    : 'There are currently no leave requests submitted. Applications submitted by employees will appear here in real-time.'}
                </p>
              </div>
              {(searchQuery ||
                statusFilter !== 'ALL' ||
                leaveTypeFilter !== 'ALL' ||
                dateRange !== 'ALL' ||
                selectedEmployee !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setLeaveTypeFilter('ALL');
                    setDateRange('ALL');
                    setSelectedEmployee('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
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
