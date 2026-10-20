import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Layers,
  Check,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { TableSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const EmployeeLeaves = () => {
  const [leaveTypes, setLeaveTypes] = useState(() => api.getCached('/leaves/types')?.data?.leaveTypes || []);
  const [requests, setRequests] = useState(() => api.getCached('/leaves/requests')?.data?.leaveRequests || []);
  const [loading, setLoading] = useState(() => !api.hasCached('/leaves/requests'));
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
    if (!api.hasCached('/leaves/requests')) {
      setLoading(true);
    }
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
    window.addEventListener('nexahr_leaves_updated', fetchMyLeaves);
    return () => window.removeEventListener('nexahr_leaves_updated', fetchMyLeaves);
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
      window.dispatchEvent(new Event('nexahr_leaves_updated'));
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
        badgeBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60',
        iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
        accentBar: 'bg-emerald-500',
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

  const totalAvailableLeaves = quotaCards.reduce((acc, c) => acc + c.available, 0);
  const totalAllowedLeaves = quotaCards.reduce((acc, c) => acc + c.total, 0);
  const totalPendingRequests = requests.filter((r) => r.status === 'PENDING').length;
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
    const approved = requests.filter((r) => r.status === 'APPROVED').length;
    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const rejected = requests.filter((r) => r.status === 'REJECTED').length;
    return [
      { value: requests.length, label: 'Total', tooltip: `Total Submitted: ${requests.length} Requests` },
      { value: approved, label: 'Approved', tooltip: `Approved: ${approved} Requests` },
      { value: pending, label: 'Pending', tooltip: `Pending Review: ${pending} Requests` },
      { value: rejected, label: 'Rejected', tooltip: `Rejected: ${rejected} Requests` },
    ];
  }, [requests]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Leaves & Time-Off"
        subtitle="Manage leave balances, submit vacation or sick leave, and track approvals."
        onRefresh={fetchMyLeaves}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO LEAVE & TIME-OFF BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-cyan-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-emerald-200/70 dark:border-emerald-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-300/20 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Leave Entitlement Info */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Time-Off & Leave Entitlement
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Track your remaining annual vacation, medical days, and casual leave quotas. Time-off requests are routed automatically for department supervisor approval.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{totalAvailableLeaves} Days Total Available (of {totalAllowedLeaves})</span>
              </span>
              {totalPendingRequests > 0 && (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-100/60 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{totalPendingRequests} Request{totalPendingRequests > 1 ? 's' : ''} Pending Review</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-emerald-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[240px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Planning Time Off?</div>
              <div className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Submit instant leave request</div>
            </div>
            <button
              onClick={() => setIsApplyOpen(true)}
              className="w-full px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <span>Apply for Leave</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP METRIC SPARKLINE CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
          subtext={sickCard.pending > 0 ? `${sickCard.pending}d Pending Approval` : 'Full Medical Allowance'}
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
          badgeText={totalPendingRequests > 0 ? `${totalPendingRequests} Under Review` : 'All Approved'}
          badgeType={totalPendingRequests > 0 ? 'warning' : 'positive'}
          badgeIcon={totalPendingRequests > 0 ? 'dot' : 'up'}
          subtext={`${requests.length} Total Submissions`}
          chartColor="rose"
          presetWave="wave4"
          dataPoints={pendingSparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. LEAVE REQUESTS HISTORY & STATUS TABLE */}
      {/* ========================================================================= */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Leave History & Review Status</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Review log of all time-off submissions and supervisor approval states
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {requests.length} Total Requests
            </span>
          </div>

          {requests.length > 0 ? (
            <>
              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-blue-400/60 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
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
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border shrink-0 ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                                : req.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-slate-500 font-medium">Duration:</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            {req.totalDays || 1} {req.totalDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="font-semibold text-slate-700 dark:text-slate-300">
                            {req.startDate ? req.startDate.split('T')[0] : ''} to {req.endDate ? req.endDate.split('T')[0] : ''}
                          </div>
                          {req.reason && <p className="line-clamp-2 text-slate-600 dark:text-slate-400">{req.reason}</p>}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="font-bold text-slate-500">Remarks: </span>
                        <span>{req.rejectionReason || (req.status === 'APPROVED' ? 'Approved by HR Lead' : 'Pending Supervisor Review')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-xs tracking-wider border-b border-slate-100 dark:border-slate-800">
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
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {req.leaveType?.name || 'General Leave'}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">ID: {req.id ? req.id.slice(0, 8) : 'REQ'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {req.totalDays || 1} {req.totalDays === 1 ? 'day' : 'days'}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {req.startDate ? req.startDate.split('T')[0] : ''} to {req.endDate ? req.endDate.split('T')[0] : ''}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {req.reason}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400 text-xs">
                        {req.rejectionReason || (req.status === 'APPROVED' ? 'Approved by HR Lead' : 'Pending Supervisor Review')}
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
                You haven't submitted any time-off requests yet. Use the "Apply for Leave" button above to get started.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. APPLY MODAL (ULTRA PREMIUM THEMED DESIGN) */}
      {/* ========================================================================= */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl shadow-emerald-950/15 dark:shadow-black/70 border border-emerald-200/70 dark:border-emerald-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-cyan-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-teal-300/20 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30 ring-3 ring-emerald-100/80 dark:ring-emerald-950/60">
                  <CalendarDays className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Apply for Time-Off
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Submit leave request for supervisory evaluation and entitlement tracking.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsApplyOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-emerald-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-emerald-200/60 dark:hover:border-slate-700 relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleApplySubmit} className="overflow-y-hidden flex-1 px-6 sm:px-7 py-5 space-y-4 text-xs bg-gradient-to-b from-white/40 via-emerald-50/15 to-teal-50/20 dark:from-transparent dark:via-emerald-950/10 dark:to-teal-950/10">
              {/* Leave Policy Classification Cards */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Leave Policy Classification <span className="text-rose-500">*</span></span>
                  <span className="text-xs text-slate-400 font-normal">Select leave category</span>
                </label>

                {leaveTypes && leaveTypes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {leaveTypes.map((lt) => {
                      const isSelected = String(leaveForm.leaveTypeId) === String(lt.id);
                      return (
                        <button
                          type="button"
                          key={lt.id}
                          onClick={() => setLeaveForm({ ...leaveForm, leaveTypeId: lt.id })}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden ${
                            isSelected
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-emerald-500/30'
                              : 'bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-emerald-50/50 dark:hover:bg-slate-800 hover:border-emerald-300/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600'
                              }`}
                            >
                              <CalendarDays className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs leading-tight truncate">
                                {lt.name}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                                {lt.daysAllowed} days annual quota
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-800 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <select
                    required
                    value={leaveForm.leaveTypeId}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select Leave Policy</option>
                  </select>
                )}
              </div>

              {/* Day Mode Selector (Full Day vs Half Day) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Duration Type</span>
                  <span className="text-xs text-slate-400 font-normal">Full absence or partial</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 sm:p-1.5 bg-slate-100/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setLeaveForm({ ...leaveForm, dayType: 'FULL' })}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      leaveForm.dayType === 'FULL'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <span>Full Day</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveForm({ ...leaveForm, dayType: 'HALF' })}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      leaveForm.dayType === 'HALF'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <span>Half Day (0.5 Day)</span>
                  </button>
                </div>
              </div>

              {/* Start Date & End Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-xs text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-xs text-xs"
                  />
                </div>
              </div>

              {/* Reason & Purpose Details */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    Reason & Handover Details <span className="text-rose-500">*</span>
                  </span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="State context, urgent coverage contacts, and handover arrangements during absence..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all resize-none leading-relaxed shadow-xs text-xs"
                />
              </div>

              {/* Live Request Preview Card */}
              <div className="px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs border border-emerald-200/60 dark:border-emerald-800/60">
                    <CalendarDays className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {leaveTypes.find((l) => String(l.id) === String(leaveForm.leaveTypeId))?.name || 'Leave Request'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span>{leaveForm.startDate || 'Start'} to {leaveForm.endDate || 'End'}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {calculateDays()} {calculateDays() === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Pending Approval
                  </span>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-emerald-100/80 dark:border-slate-800 gap-3">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-emerald-50/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 hover:scale-[1.02]"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
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
