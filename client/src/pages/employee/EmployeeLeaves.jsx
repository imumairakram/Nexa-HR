import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  X,
  FileText,
  AlertCircle,
  Calendar,
  XCircle,
  ArrowRight,
  RefreshCw,
  Layers,
  Check,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Eye,
  UserCheck,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import ModernSearchBarSection from '../../components/common/ModernSearchBarSection';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { TableSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { broadcastAppEvent, subscribeAppEvent } from '../../utils/crossTabSync';

export const calculateLeaveDays = (req) => {
  if (!req) return 1;
  // If startDate and endDate are present, compute exact days from the schedule window
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

export const parseDateInfo = (dateStr) => {
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
  } catch { }
  return { monthShort: 'DAY', dayNum: '--', formatted: dateStr, weekday: '' };
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate) return '--';
  const sInfo = parseDateInfo(startDate);
  if (!endDate || startDate === endDate) return sInfo.formatted;
  const eInfo = parseDateInfo(endDate);
  return `${sInfo.formatted} – ${eInfo.formatted}`;
};

export const DEFAULT_LEAVE_TYPES = [
  { id: '5597bb84-f5d9-4215-aacf-b6b54d2a334b', name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 18, isPaid: true, description: 'Statutory annual vacation and leisure leave entitlement.' },
  { id: '51dff8bd-044f-4d4a-9b9f-1f4d45829442', name: 'Medical / Sick Leave', code: 'SICK', daysAllowed: 12, isPaid: true, description: 'Medical recovery leave requiring certificate for 3+ days.' },
  { id: '5396b4f6-9e59-4e95-96e4-64eff6f91006', name: 'Casual Leave', code: 'CASUAL', daysAllowed: 10, isPaid: true, description: 'Short notice personal contingency leave.' },
  { id: '49699223-7cd8-46ec-a561-37fe717205fa', name: 'Maternity / Parental Leave', code: 'PARENTAL', daysAllowed: 90, isPaid: true, description: 'Statutory maternity, paternity, and child care entitlement.' },
  { id: '60342682-3578-47d8-be90-a4abe3adf6c1', name: 'Unpaid Leave / Sabbatical', code: 'UNPAID', daysAllowed: 30, isPaid: false, description: 'Discretionary leave without pay for extended absence.' },
];

const EmployeeLeaves = () => {
  const [leaveTypes, setLeaveTypes] = useState(() => {
    const cached = api.getCached('/leaves/types')?.data?.leaveTypes;
    return Array.isArray(cached) && cached.length > 0 ? cached : DEFAULT_LEAVE_TYPES;
  });
  const [requests, setRequests] = useState(() => api.getCached('/leaves/my-requests')?.data?.leaveRequests || api.getCached('/leaves/requests')?.data?.leaveRequests || []);
  const [loading, setLoading] = useState(() => !api.hasCached('/leaves/my-requests') && !api.hasCached('/leaves/requests'));
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

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
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchMyLeaves = async (bypass = false) => {
    if (bypass) {
      api.invalidateLeavesCache();
    } else if (!api.hasCached('/leaves/my-requests') && !api.hasCached('/leaves/requests')) {
      setLoading(true);
    }
    try {
      const opts = bypass ? { bypassCache: true } : {};
      const [typesRes, reqRes] = await Promise.allSettled([
        api.getLeaveTypes(opts),
        api.getMyLeaveRequests({}, opts),
      ]);

      if (typesRes.status === 'fulfilled' && Array.isArray(typesRes.value?.data?.leaveTypes) && typesRes.value.data.leaveTypes.length > 0) {
        setLeaveTypes(typesRes.value.data.leaveTypes);
        if (!leaveForm.leaveTypeId) {
          setLeaveForm((prev) => ({ ...prev, leaveTypeId: prev.leaveTypeId || typesRes.value.data.leaveTypes[0].id }));
        }
      } else {
        setLeaveTypes((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : DEFAULT_LEAVE_TYPES));
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

    // Cross-tab and local event sync
    const unsub = subscribeAppEvent('nexahr_leaves_updated', () => {
      fetchMyLeaves(true);
    });

    // Auto-refresh when tab gains focus
    const handleFocus = () => {
      fetchMyLeaves(true);
    };
    window.addEventListener('focus', handleFocus);

    // Periodic silent sync for live liveness
    const interval = setInterval(() => {
      fetchMyLeaves(false);
    }, 20000);

    return () => {
      unsub();
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
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

      broadcastAppEvent('nexahr_leaves_updated');
      broadcastAppEvent('nexahr_notification_updated');
      await fetchMyLeaves(true);
      setIsApplyOpen(false);
      setLeaveForm({
        leaveTypeId: activeLeaveTypes[0]?.id || '',
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

  const activeLeaveTypes = useMemo(() => {
    return Array.isArray(leaveTypes) && leaveTypes.length > 0 ? leaveTypes : DEFAULT_LEAVE_TYPES;
  }, [leaveTypes]);

  // Compute live quota balances
  const quotaCards = useMemo(() => {
    return activeLeaveTypes.map((lt, idx) => {
      const usedDays = requests
        .filter((r) => (r.leaveTypeId === lt.id || r.leaveType?.id === lt.id || r.leaveType?.name === lt.name || r.leaveType?.code === lt.code) && r.status === 'APPROVED')
        .reduce((acc, r) => acc + calculateLeaveDays(r), 0);
      const pendingDays = requests
        .filter((r) => (r.leaveTypeId === lt.id || r.leaveType?.id === lt.id || r.leaveType?.name === lt.name || r.leaveType?.code === lt.code) && r.status === 'PENDING')
        .reduce((acc, r) => acc + calculateLeaveDays(r), 0);
      const available = Math.max(0, lt.daysAllowed - usedDays);
      const percent = Math.min(100, Math.max(0, Math.round((available / (lt.daysAllowed || 1)) * 100)));

      const themes = [
        {
          gradient: 'from-sky-500 to-sky-600',
          badgeBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200/60',
          iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
          accentBar: 'bg-sky-500',
        },
        {
          gradient: 'from-blue-500 to-indigo-600',
          badgeBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/60',
          iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
          accentBar: 'bg-blue-500',
        },
        {
          gradient: 'from-amber-500 to-orange-600',
          badgeBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/60',
          iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
          accentBar: 'bg-amber-500',
        },
        {
          gradient: 'from-purple-500 to-pink-600',
          badgeBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200/60',
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
  }, [activeLeaveTypes, requests]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  }), [requests]);

  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (r.leaveType?.name && r.leaveType.name.toLowerCase().includes(query)) ||
          (r.reason && r.reason.toLowerCase().includes(query)) ||
          (r.startDate && r.startDate.includes(query)) ||
          (r.endDate && r.endDate.includes(query));

        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchesType = typeFilter === 'ALL' || (r.leaveType?.name || '') === typeFilter;

        let matchesDate = true;
        if (dateRange !== 'ALL' && r.startDate) {
          try {
            const reqDate = new Date(r.startDate);
            const now = new Date();
            if (dateRange === 'THIS_MONTH') {
              matchesDate = reqDate.getFullYear() === now.getFullYear() && reqDate.getMonth() === now.getMonth();
            } else if (dateRange === 'LAST_MONTH') {
              const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              matchesDate = reqDate.getFullYear() === lastMonth.getFullYear() && reqDate.getMonth() === lastMonth.getMonth();
            } else if (dateRange === 'THIS_YEAR') {
              matchesDate = reqDate.getFullYear() === now.getFullYear();
            }
          } catch { }
        }

        return matchesSearch && matchesStatus && matchesType && matchesDate;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortKey === 'date') {
          diff = new Date(b.startDate || b.createdAt || 0) - new Date(a.startDate || a.createdAt || 0);
        } else if (sortKey === 'days') {
          diff = calculateLeaveDays(b) - calculateLeaveDays(a);
        } else if (sortKey === 'policy') {
          diff = (a.leaveType?.name || '').localeCompare(b.leaveType?.name || '');
        }
        return sortOrder === 'asc' ? -diff : diff;
      });
  }, [requests, searchQuery, statusFilter, typeFilter, dateRange, sortKey, sortOrder]);

  const statusTabs = useMemo(() => [
    { key: 'ALL', label: 'All', count: stats.total },
    { key: 'APPROVED', label: 'Approved', count: stats.approved },
    { key: 'PENDING', label: 'Pending', count: stats.pending },
    { key: 'REJECTED', label: 'Declined', count: stats.rejected },
  ], [stats]);

  const sortOptions = [
    { key: 'date', label: 'Date' },
    { key: 'days', label: 'Duration' },
    { key: 'policy', label: 'Policy' },
  ];

  const dateRangeOptions = [
    { key: 'ALL', label: 'All Dates' },
    { key: 'THIS_MONTH', label: 'This Month' },
    { key: 'LAST_MONTH', label: 'Last Month' },
    { key: 'THIS_YEAR', label: 'This Year' },
  ];

  const dateRangeLabel = useMemo(() => {
    if (dateRange === 'THIS_MONTH') return 'This Month';
    if (dateRange === 'LAST_MONTH') return 'Last Month';
    if (dateRange === 'THIS_YEAR') return 'This Year';
    return 'All Dates';
  }, [dateRange]);

  const filterTags = useMemo(() => {
    const tags = [];
    if (typeFilter !== 'ALL') tags.push({ key: 'type', label: 'policy', value: typeFilter });
    if (dateRange !== 'ALL') tags.push({ key: 'date', label: 'range', value: dateRange.replace('_', ' ').toLowerCase() });
    return tags;
  }, [typeFilter, dateRange]);

  const filterCount = (typeFilter !== 'ALL' ? 1 : 0) + (dateRange !== 'ALL' ? 1 : 0);

  const totalAvailableLeaves = quotaCards.reduce((acc, c) => acc + c.available, 0);
  const totalAllowedLeaves = quotaCards.reduce((acc, c) => acc + c.total, 0);
  const totalPendingRequests = stats.pending;
  const annualCard = quotaCards.find((c) => c.type?.toLowerCase().includes('annual') || c.type?.toLowerCase().includes('vacation')) || quotaCards[0] || { type: 'Annual Leave', available: 0, total: 0, used: 0, percent: 0, pending: 0 };
  const sickCard = quotaCards.find((c) => c.type?.toLowerCase().includes('sick') || c.type?.toLowerCase().includes('medical')) || quotaCards[1] || { type: 'Sick Leave', available: 0, total: 0, used: 0, percent: 0, pending: 0 };

  // Dynamic Sparkline Data for Leaves
  const totalLeavesSparkData = useMemo(() => {
    if (quotaCards.length > 0) {
      return quotaCards.map((c) => ({
        value: c.available,
        label: c.type.split(' ')[0],
        tooltip: `${c.type}: ${c.available} / ${c.total} Days Left (${c.used} Used)`,
      }));
    }
    return [
      { value: 0, label: 'Leaves', tooltip: 'No Leave Quotas Allocated' },
    ];
  }, [quotaCards]);

  const annualSparkData = useMemo(() => {
    const total = annualCard.total || 0;
    const used = annualCard.used || 0;
    const avail = annualCard.available || (total - used);
    return [
      { value: total, label: 'Quota', tooltip: `Total Entitlement: ${total} Days` },
      { value: Math.max(0, total - Math.round(used * 0.5)), label: 'Q2', tooltip: `Mid-Year Balance: ${Math.max(0, total - Math.round(used * 0.5))} Days` },
      { value: avail, label: 'Available', tooltip: `Current Remaining: ${avail} Days (${used} Taken)` },
    ];
  }, [annualCard]);

  const sickSparkData = useMemo(() => {
    const total = sickCard.total || 0;
    const used = sickCard.used || 0;
    const avail = sickCard.available || (total - used);
    return [
      { value: total, label: 'Quota', tooltip: `Medical Quota: ${total} Days` },
      { value: Math.max(0, total - used), label: 'Active', tooltip: `Current Available: ${avail} Days` },
      { value: used, label: 'Taken', tooltip: `Medical Leave Used: ${used} Days` },
    ];
  }, [sickCard]);

  const pendingSparkData = useMemo(() => {
    return [
      { value: stats.total, label: 'Total', tooltip: `Total Submissions: ${stats.total} Requests` },
      { value: stats.approved, label: 'Approved', tooltip: `Approved: ${stats.approved} Requests` },
      { value: stats.pending, label: 'Pending', tooltip: `Pending Review: ${stats.pending} Requests` },
      { value: stats.rejected, label: 'Rejected', tooltip: `Declined: ${stats.rejected} Requests` },
    ];
  }, [stats]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Leaves & Time-Off"
        subtitle="Manage leave balances, submit vacation or sick leave, and track real-time approval status."
        onRefresh={() => fetchMyLeaves(true)}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO LEAVE & TIME-OFF BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-5 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Leave Entitlement Info */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
              Time-Off & Leave Entitlement
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-lg font-medium">
              Track your remaining annual vacation, medical days, and casual leave quotas. Applications are routed live for management review.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{totalAvailableLeaves} Days Total Available (of {totalAllowedLeaves})</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{stats.approved} Leaves Approved</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex flex-col items-center text-center min-w-[220px] sm:min-w-[240px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Planning Time Off?</div>
              <div className="text-xs text-white/80 mt-0.5">Submit instant leave request</div>
            </div>
            <button
              onClick={() => setIsApplyOpen(true)}
              className="w-full px-5 py-2.5 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] dark:text-white font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-[#07617D] dark:text-white">Apply for Leave</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#07617D] dark:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP METRIC SPARKLINE CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Total Available Leaves */}
        <SparkMetricCard
          variant="dark"
          title="Total Leave Balance"
          value={totalAvailableLeaves}
          unit={totalAvailableLeaves === 1 ? 'Day' : 'Days'}
          badgeText={`${totalAvailableLeaves}d Available`}
          badgeType="positive"
          badgeIcon="up"
          subtext={`Quota: ${totalAllowedLeaves} Total Days`}
          chartColor="purple"
          presetWave="wave1"
          dataPoints={totalLeavesSparkData}
          loading={loading}
        />

        {/* Card 2: Light Card - Annual Vacation */}
        <SparkMetricCard
          variant="light"
          title="Annual Vacation"
          value={annualCard.available}
          unit={`/ ${annualCard.total}d`}
          badgeText={`${annualCard.percent}% Available`}
          badgeType={annualCard.percent >= 50 ? 'positive' : 'warning'}
          badgeIcon={annualCard.percent >= 50 ? 'up' : 'dot'}
          subtext={`${annualCard.used} Days Used This Year`}
          chartColor="coral"
          presetWave="wave2"
          dataPoints={annualSparkData}
          loading={loading}
        />

        {/* Card 3: Light Card - Sick & Medical */}
        <SparkMetricCard
          variant="light"
          title="Sick & Medical"
          value={sickCard.available}
          unit={`/ ${sickCard.total}d`}
          badgeText={`${sickCard.percent}% Available`}
          badgeType={sickCard.used === 0 ? 'positive' : 'neutral'}
          badgeIcon={sickCard.used === 0 ? 'up' : 'dot'}
          subtext={sickCard.used > 0 ? `${sickCard.used}d Used • Medical Allowance` : 'Full Medical Allowance'}
          chartColor="amber"
          presetWave="wave3"
          dataPoints={sickSparkData}
          loading={loading}
        />

        {/* Card 4: Light Card - Pending Requests */}
        <SparkMetricCard
          variant="light"
          title="Pending Requests"
          value={totalPendingRequests}
          unit={totalPendingRequests === 1 ? 'Request' : 'Requests'}
          badgeText={totalPendingRequests > 0 ? `${totalPendingRequests} Under Review` : `${stats.approved} Approved`}
          badgeType={totalPendingRequests > 0 ? 'warning' : 'positive'}
          badgeIcon={totalPendingRequests > 0 ? 'dot' : 'up'}
          subtext={`${stats.total} Total Submissions (${stats.approved} Approved, ${stats.rejected} Declined)`}
          chartColor="rose"
          presetWave="wave4"
          dataPoints={pendingSparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. MODERN DYNAMIC SEARCH & FILTER COMMAND BAR */}
      {/* ========================================================================= */}
      <ModernSearchBarSection
        statusTabs={statusTabs}
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search leave requests by policy, reason, or date..."
        searchHint='Try "status:pending"'
        filterTags={filterTags}
        onRemoveTag={(key) => {
          if (key === 'type') setTypeFilter('ALL');
          if (key === 'date') setDateRange('ALL');
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
        actionButton={
          <button
            type="button"
            onClick={() => setIsApplyOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply for Leave</span>
          </button>
        }
        filterContent={
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Leave Policy
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['ALL', ...new Set(activeLeaveTypes.map((t) => t.name))].map((typeName) => (
                  <button
                    key={typeName}
                    type="button"
                    onClick={() => setTypeFilter(typeName)}
                    className={`px-2.5 py-1.5 rounded-[12px] text-xs font-semibold text-left transition-all cursor-pointer truncate ${typeFilter === typeName
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-700'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                  >
                    {typeName === 'ALL' ? 'All Policies' : typeName}
                  </button>
                ))}
              </div>
            </div>

            {filterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('ALL');
                  setDateRange('ALL');
                }}
                className="w-full py-2 rounded-[12px] bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-center"
              >
                Reset All Filters
              </button>
            )}
          </div>
        }
      />

      {/* ========================================================================= */}
      {/* 4. LEAVE REQUESTS HISTORY & STATUS TABLE */}
      {/* ========================================================================= */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <div className="bg-white dark:bg-[#111C24] rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-all overflow-hidden">
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Leave History & Review Status</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Review log of all time-off submissions and management approval states
                  </p>
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-[12px] self-start md:self-auto shrink-0">
              {filteredRequests.length} Requests Found
            </span>
          </div>

          {filteredRequests.length > 0 ? (
            <>
              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredRequests.map((req) => {
                    const startInfo = parseDateInfo(req.startDate);
                    const daysCount = calculateLeaveDays(req);
                    const dateRangeText = formatDateRange(req.startDate, req.endDate);

                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedReq(req)}
                        className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-sky-400/60 transition-all flex flex-col justify-between cursor-pointer"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                                <Layers className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                                  {req.leaveType?.name || 'General Leave'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">ID: {req.id ? req.id.slice(0, 8) : 'REQ'}</div>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border shadow-2xs shrink-0 ${req.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50'
                                : req.status === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/50'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50'
                                }`}
                            >
                              {req.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                              {req.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                              {req.status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />}
                              <span>{req.status}</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <span className="text-slate-500 font-medium">Duration:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[12px] text-[10px] font-extrabold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/50">
                              {formatLeaveDays(daysCount)}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {dateRangeText}
                            </div>
                            {req.reason && <p className="line-clamp-2 text-slate-600 dark:text-slate-400">{req.reason}</p>}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="font-bold text-slate-500">Remarks:</span>
                          <span className="text-right truncate max-w-[180px] font-medium text-slate-600 dark:text-slate-300">
                            {req.status === 'APPROVED'
                              ? `Approved by ${req.approvedBy?.firstName || 'HR Lead'}`
                              : req.status === 'REJECTED'
                                ? req.rejectionReason || 'Declined by HR'
                                : 'Pending Supervisor Review'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/75 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6">Leave Duration & Dates</th>
                      <th className="py-3.5 px-4">Leave Policy</th>
                      <th className="py-3.5 px-4">Reason / Notes</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Review Notes / Approver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filteredRequests.map((req) => {
                      const startInfo = parseDateInfo(req.startDate);
                      const daysCount = calculateLeaveDays(req);
                      const dateRangeText = formatDateRange(req.startDate, req.endDate);

                      return (
                        <tr
                          key={req.id}
                          onClick={() => setSelectedReq(req)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        >
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
                                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    ({formatLeaveDays(daysCount)})
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
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {req.leaveType?.name || 'General Leave'}
                              </span>
                              <div className="text-[10px] text-slate-400 font-sans mt-0.5">
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
                              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase ${req.status === 'APPROVED'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : req.status === 'REJECTED'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-amber-600 dark:text-amber-400'
                                }`}
                            >
                              {req.status === 'APPROVED' && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              )}
                              {req.status === 'PENDING' && (
                                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              )}
                              {req.status === 'REJECTED' && (
                                <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              )}
                              <span>{req.status}</span>
                            </span>
                          </td>

                          {/* 5. Review Notes / Approver Column */}
                          <td className="py-4 px-6 text-right text-xs font-medium">
                            {req.status === 'APPROVED' ? (
                              <div className="inline-flex flex-col items-end">
                                <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Approved</span>
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                  by {req.approvedBy?.firstName || 'HR Lead'} {req.approvedBy?.lastName || ''}
                                </span>
                              </div>
                            ) : req.status === 'REJECTED' ? (
                              <div className="inline-flex flex-col items-end">
                                <span className="text-rose-700 dark:text-rose-300 font-bold">
                                  Declined
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5 max-w-[200px] truncate" title={req.rejectionReason}>
                                  {req.rejectionReason || 'Declined by HR'}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-end">
                                <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>Awaiting Review</span>
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                  In HR Management Queue
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 sm:p-16 text-center space-y-5">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500/10 via-sky-500/15 to-sky-500/20 dark:from-sky-500/20 dark:via-sky-500/20 dark:to-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/70 dark:border-sky-700/50 shadow-xl shadow-sky-500/10">
                  <CalendarDays className="w-10 h-10 stroke-[1.6]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {statusFilter !== 'ALL' || searchQuery ? 'No Matching Leave Requests' : 'Time-Off Register is Empty'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {statusFilter !== 'ALL' || searchQuery
                    ? 'No time-off requests matched your active filters or search criteria. Try clearing search keywords or resetting filters.'
                    : 'You have not submitted any time-off applications yet. Annual vacation, medical leaves, and casual days off can be scheduled here with automated supervisor approval routing.'}
                </p>
              </div>
              {statusFilter === 'ALL' && !searchQuery ? (
                <div className="pt-2">
                  <button
                    onClick={() => setIsApplyOpen(true)}
                    className="px-6 py-3 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-700 hover:to-sky-700 text-white font-extrabold text-xs shadow-lg shadow-sky-600/25 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Apply for Leave</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setStatusFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="px-5 py-2.5 rounded-[12px] bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Search & Filters</span>
                  </button>
                </div>
              )}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span>Multi-Tier Approval Routing</span>
                </span>
                <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span>Automated Attendance Waiver</span>
                </span>
                <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span>Zero Quota Deductions on Gazetted Days</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DETAIL INSPECTION MODAL (NEW TICKET CARD UI ARCHITECTURE) */}
      {/* ========================================================================= */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <main className="relative z-10 w-full max-w-2xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <header className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6" data-purpose="modal-header">
              <div className="flex items-center gap-4">
                {/* Glowing Icon Badge */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/25 flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
                    <CalendarDays className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                      {selectedReq.leaveType?.name || 'Leave Record'}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shadow-2xs ${selectedReq.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50'
                          : selectedReq.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/50'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50'
                        }`}
                    >
                      {selectedReq.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                      {selectedReq.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                      {selectedReq.status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />}
                      <span>{selectedReq.status}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    REQ ID: #{selectedReq.id}
                  </p>
                </div>
              </div>

              {/* Close Action */}
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setSelectedReq(null)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* Row 1: Key Metrics (Duration & Status Overview) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Duration & Policy */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      Approved Duration
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-[12px] border border-sky-200/60 dark:border-sky-800/40">
                      {selectedReq.leaveType?.isPaid !== false ? 'Paid Allowance' : 'Unpaid Leave'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {formatLeaveDays(calculateLeaveDays(selectedReq))}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {selectedReq.dayType === 'HALF' ? 'Half-Day Session' : 'Full-Day Allocation'} • {selectedReq.leaveType?.name || 'General Leave'}
                  </div>
                </div>

                {/* Card 2: Schedule Window & Calendar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      Schedule Window
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Calendar Span
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {formatDateRange(selectedReq.startDate, selectedReq.endDate)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {selectedReq.startDate ? selectedReq.startDate.split('T')[0] : ''} → {selectedReq.endDate ? selectedReq.endDate.split('T')[0] : ''}
                  </div>
                </div>
              </div>

              {/* Row 2: Submission Reason */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-500" />
                    Submission Reason
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Employee Statement
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedReq.reason || <span className="italic text-slate-400">No specific reason provided</span>}
                </p>
              </div>

              {/* Row 3: Audit & Supervisor Notes */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-2 shadow-xs ${selectedReq.status === 'APPROVED'
                    ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/80 dark:border-emerald-800/50'
                    : selectedReq.status === 'REJECTED'
                      ? 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-rose-200/80 dark:border-rose-800/50'
                      : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/80 dark:border-amber-800/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                    Audit & Supervisor Notes
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-[12px] border ${selectedReq.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60'
                        : selectedReq.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60'
                      }`}
                  >
                    {selectedReq.status === 'APPROVED' ? 'Approved' : selectedReq.status === 'REJECTED' ? 'Declined' : 'Pending Review'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-medium">
                  {selectedReq.status === 'APPROVED' ? (
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        Approved by {selectedReq.approvedBy?.firstName || 'System'} {selectedReq.approvedBy?.lastName || 'Administrator'}
                      </span>
                    </div>
                  ) : selectedReq.status === 'REJECTED' ? (
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <span>
                        Declined: {selectedReq.rejectionReason || 'Declined by HR Management'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
                      <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>
                        Awaiting Supervisor Review & Operational Quota Clearance
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-6">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Official HR Leave Workflow Dossier</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-600/25 active:scale-[0.99] transition-all cursor-pointer"
              >
                Close
              </button>
            </footer>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. APPLY MODAL (ULTRA PREMIUM THEMED DESIGN) */}
      {/* ========================================================================= */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-5xl lg:max-w-6xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-9 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                  <CalendarDays className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Apply for Time-Off
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Submit leave request for supervisory evaluation and quota entitlement tracking.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsApplyOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-6">
              {/* Row 1: Leave Policy Classification Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Leave Policy Classification <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-medium text-slate-400">
                    Select leave category & quota
                  </span>
                </div>

                <div className="relative">
                  <select
                    required
                    value={leaveForm.leaveTypeId}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}
                    className="w-full appearance-none px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner pr-10"
                  >
                    <option value="">Select Leave Policy</option>
                    {activeLeaveTypes.map((lt) => (
                      <option
                        key={lt.id}
                        value={lt.id}
                        className="text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 py-1.5"
                      >
                        {lt.name} ({lt.daysAllowed || lt.days || 12} days quota • {lt.isPaid ? 'Paid' : 'Unpaid'})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Row 2: Duration Type & Date Range Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Duration Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    Duration Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'FULL', label: 'Full Day', hint: 'Full absence' },
                      { id: 'HALF', label: 'Half Day', hint: '0.5 day (partial)' },
                    ].map((d) => {
                      const isSelected = leaveForm.dayType === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setLeaveForm((prev) => ({ ...prev, dayType: d.id }))}
                          className={`py-2 px-3 rounded-[12px] border text-center transition-all cursor-pointer font-bold text-xs ${isSelected
                            ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/25 ring-2 ring-sky-400/30'
                            : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                        >
                          <div>{d.label}</div>
                          <div className={`text-[10px] font-normal opacity-80 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {d.hint}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      Start Date <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                  />
                </div>

                {/* End Date */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      End Date <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                  />
                </div>
              </div>

              {/* Row 3: Two-column Description & Live Routing Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Description Column */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                      Reason & Handover Details <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="State context, urgent coverage contacts, and handover arrangements during absence..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none shadow-inner"
                  />
                </div>

                {/* Live Preview Column */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-sky-500" />
                      Live Preview & Record Card
                    </label>
                    <span className="text-xs font-medium text-slate-400">
                      Real-time summary
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-sky-50/40 dark:from-slate-900/80 dark:via-slate-800/80 dark:to-sky-950/20 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3.5 min-h-[110px]">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {activeLeaveTypes.find((l) => String(l.id) === String(leaveForm.leaveTypeId))?.name || 'Leave Request'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {activeLeaveTypes.find((l) => String(l.id) === String(leaveForm.leaveTypeId))?.daysAllowed
                            ? `${activeLeaveTypes.find((l) => String(l.id) === String(leaveForm.leaveTypeId))?.daysAllowed} Days Annual Quota`
                            : 'Standard Policy'}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 truncate">
                          {leaveForm.startDate || 'Start Date'} to {leaveForm.endDate || 'End Date'}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                          {calculateDays()} {calculateDays() === 1 ? 'Day' : 'Days'} ({leaveForm.dayType === 'HALF' ? 'Half Day' : 'Full Day'})
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-white text-black border border-slate-300 shadow-2xs dark:bg-slate-800 dark:text-white dark:border-slate-700">
                          Pending Review
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Trust text + Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Automated quota reconciliation & multi-tier approval routing</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsApplyOpen(false)}
                    className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;
