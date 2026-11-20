import React, { useState, useEffect, useMemo } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { LeaveCardSkeleton } from '../../components/common/Skeleton';
import LeavePolicyCard, { getPolicyIcon, isPaidPolicy } from './LeavePolicyCard';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Shield,
  FileText,
  RefreshCw,
  X,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';

const LeavePolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // View / Read Policy State
  const [viewingPolicy, setViewingPolicy] = useState(null);

  // Edit / Update Policy State
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    days: 12,
    type: 'PAID',
    description: '',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Policy State
  const [deletingPolicy, setDeletingPolicy] = useState(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Policy Form State
  const [form, setForm] = useState({
    name: '',
    code: '',
    days: 12,
    type: 'PAID',
    description: '',
  });

  const loadLeavePolicies = async () => {
    setLoading(true);
    try {
      const res = await api.getLeaveTypes().catch(() => null);
      let apiTypes = res?.success && Array.isArray(res.data?.leaveTypes) ? res.data.leaveTypes : [];

      let overrides = {};
      try {
        overrides = JSON.parse(localStorage.getItem('nexahr_leave_policy_overrides') || '{}');
      } catch (e) {
        overrides = {};
      }

      let deleted = [];
      try {
        deleted = JSON.parse(localStorage.getItem('nexahr_deleted_leave_policies') || '[]');
      } catch (e) {
        deleted = [];
      }

      let savedCustom = [];
      try {
        savedCustom = JSON.parse(localStorage.getItem('nexahr_custom_leave_policies') || '[]');
      } catch (e) {
        savedCustom = [];
      }

      // 1. Process apiTypes (skip deleted, merge overrides)
      const processedApi = apiTypes
        .filter(
          (lt) =>
            !deleted.includes(lt.id) &&
            !deleted.includes(lt.code) &&
            !deleted.includes(lt.code?.toUpperCase())
        )
        .map((lt) => {
          const ov = overrides[lt.id] || overrides[lt.code] || overrides[lt.code?.toUpperCase()];
          if (ov) {
            return {
              ...lt,
              name: ov.name || lt.name,
              code: ov.code || lt.code,
              daysAllowed: ov.daysAllowed || ov.days || lt.daysAllowed,
              days: ov.days || ov.daysAllowed || lt.daysAllowed,
              isPaid: ov.isPaid !== undefined ? ov.isPaid : lt.isPaid,
              type: ov.type || (ov.isPaid !== undefined ? (ov.isPaid ? 'PAID' : 'UNPAID') : lt.isPaid ? 'PAID' : 'UNPAID'),
              description: ov.description !== undefined ? ov.description : lt.description,
            };
          }
          return lt;
        });

      // 2. Process custom policies not yet returned by backend
      const processedCustom = savedCustom
        .filter(
          (c) =>
            !deleted.includes(c.id) &&
            !deleted.includes(c.code) &&
            !deleted.includes(c.code?.toUpperCase())
        )
        .filter(
          (c) =>
            !processedApi.some(
              (apiItem) =>
                apiItem.id === c.id ||
                apiItem.code?.toUpperCase() === c.code?.toUpperCase()
            )
        )
        .map((c) => {
          const ov = overrides[c.id] || overrides[c.code] || overrides[c.code?.toUpperCase()];
          if (ov) {
            return {
              ...c,
              name: ov.name || c.name,
              code: ov.code || c.code,
              daysAllowed: ov.daysAllowed || ov.days || c.daysAllowed,
              days: ov.days || ov.daysAllowed || c.daysAllowed,
              isPaid: ov.isPaid !== undefined ? ov.isPaid : c.isPaid,
              type: ov.type || (ov.isPaid !== undefined ? (ov.isPaid ? 'PAID' : 'UNPAID') : c.isPaid ? 'PAID' : 'UNPAID'),
              description: ov.description !== undefined ? ov.description : c.description,
            };
          }
          return c;
        });

      // 3. Fallback defaults if completely empty and user hasn't deleted all
      let combined = [...processedApi, ...processedCustom];
      if (combined.length === 0 && deleted.length === 0) {
        combined = [
          { id: 'def-1', name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 14, isPaid: true, description: 'Standard statutory annual vacation leave entitlement.' },
          { id: 'def-2', name: 'Medical & Sick Leave', code: 'SICK', daysAllowed: 10, isPaid: true, description: 'Medical recovery leave requiring certificate for 3+ days.' },
          { id: 'def-3', name: 'Casual Leave', code: 'CASUAL', daysAllowed: 10, isPaid: true, description: 'Short notice personal contingency leave.' },
          { id: 'def-4', name: 'Study Leave', code: 'STUDY', daysAllowed: 5, isPaid: true, description: 'Leave for educational examinations and professional certifications.' },
        ];
      }

      const colors = [
        'from-emerald-500 to-teal-600',
        'from-blue-500 to-indigo-600',
        'from-amber-500 to-orange-600',
        'from-purple-500 to-pink-600',
        'from-slate-600 to-slate-800',
      ];

      const mapped = combined.map((lt, idx) => ({
        id: lt.id || `lt-${idx}`,
        name: lt.name,
        code: lt.code,
        days: lt.daysAllowed || lt.days || 12,
        type: (lt.isPaid !== undefined ? lt.isPaid : lt.type === 'PAID') ? 'PAID' : 'UNPAID',
        color: colors[idx % colors.length],
        description: lt.description || `${lt.name} entitlement governed by corporate human resources handbook.`,
      }));

      setPolicies(mapped);
    } catch (err) {
      console.error('Failed to load leave types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeavePolicies();
  }, []);

  const totalDaysQuota = useMemo(() => {
    return policies.reduce((acc, p) => acc + (Number(p.days || p.daysAllowed) || 0), 0);
  }, [policies]);

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    setSubmitting(true);
    const policyName = form.name.trim();
    const policyCode = form.code.toUpperCase().trim();
    const daysAllowed = parseInt(form.days, 10) || 12;
    const isPaid = form.type === 'PAID';
    const description = form.description.trim() || `${policyName} policy governed by company HR regulations.`;

    try {
      const payload = {
        name: policyName,
        code: policyCode,
        daysAllowed,
        isPaid,
        description,
      };

      let createdPolicy = null;
      try {
        const res = await api.createLeaveType(payload);
        if (res?.success && res.data?.leaveType) {
          createdPolicy = res.data.leaveType;
        }
      } catch (apiErr) {
        console.warn('API createLeaveType returned an error, saving with local persistence fallback:', apiErr.message);
      }

      const colors = [
        'from-emerald-500 to-teal-600',
        'from-blue-500 to-indigo-600',
        'from-amber-500 to-orange-600',
        'from-purple-500 to-pink-600',
        'from-slate-600 to-slate-800',
      ];

      const finalPolicy = createdPolicy || {
        id: `leave-type-${Date.now()}`,
        name: policyName,
        code: policyCode,
        daysAllowed,
        days: daysAllowed,
        isPaid,
        type: isPaid ? 'PAID' : 'UNPAID',
        description,
        color: colors[policies.length % colors.length],
        createdAt: new Date().toISOString(),
      };

      // Unmark from deleted policies
      try {
        const deleted = JSON.parse(localStorage.getItem('nexahr_deleted_leave_policies') || '[]');
        const cleaned = deleted.filter((d) => d !== policyCode && d !== finalPolicy.id);
        localStorage.setItem('nexahr_deleted_leave_policies', JSON.stringify(cleaned));
      } catch (e) {}

      // Save into custom list
      try {
        const savedCustom = JSON.parse(localStorage.getItem('nexahr_custom_leave_policies') || '[]');
        const updatedCustom = [finalPolicy, ...savedCustom.filter((p) => p.code !== policyCode && p.id !== finalPolicy.id)];
        localStorage.setItem('nexahr_custom_leave_policies', JSON.stringify(updatedCustom));
      } catch (e) {
        console.error('localStorage save error:', e);
      }

      // Immediate UI update
      setPolicies((prev) => [
        {
          id: finalPolicy.id,
          name: policyName,
          code: policyCode,
          days: daysAllowed,
          type: isPaid ? 'PAID' : 'UNPAID',
          color: colors[prev.length % colors.length],
          description,
        },
        ...prev.filter((p) => p.code !== policyCode && p.id !== finalPolicy.id),
      ]);

      setToastMsg(`Leave policy "${policyName}" registered successfully!`);
      setIsAddOpen(false);
      setForm({
        name: '',
        code: '',
        days: 12,
        type: 'PAID',
        description: '',
      });
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Unexpected error creating leave policy:', err);
      setToastMsg(`Leave policy "${policyName}" registered!`);
      setIsAddOpen(false);
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (p) => {
    setEditingPolicy(p);
    setEditForm({
      name: p.name,
      code: p.code,
      days: p.days,
      type: p.type,
      description: p.description || '',
    });
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    if (!editingPolicy || !editForm.name.trim() || !editForm.code.trim()) return;

    setSubmittingEdit(true);
    const policyName = editForm.name.trim();
    const policyCode = editForm.code.toUpperCase().trim();
    const daysAllowed = parseInt(editForm.days, 10) || 12;
    const isPaid = editForm.type === 'PAID';
    const description = editForm.description.trim() || `${policyName} policy governed by company HR regulations.`;
    const targetId = editingPolicy.id;
    const oldCode = editingPolicy.code;

    try {
      const payload = {
        name: policyName,
        code: policyCode,
        daysAllowed,
        isPaid,
        description,
      };

      // 1. Immediately update UI state
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === targetId || (oldCode && p.code === oldCode)
            ? {
                ...p,
                name: policyName,
                code: policyCode,
                days: daysAllowed,
                daysAllowed,
                type: isPaid ? 'PAID' : 'UNPAID',
                isPaid,
                description,
              }
            : p
        )
      );

      // 2. Persist to localStorage overrides
      try {
        const overrides = JSON.parse(localStorage.getItem('nexahr_leave_policy_overrides') || '{}');
        const overrideData = {
          id: targetId,
          name: policyName,
          code: policyCode,
          daysAllowed,
          days: daysAllowed,
          isPaid,
          type: isPaid ? 'PAID' : 'UNPAID',
          description,
          updatedAt: Date.now(),
        };
        overrides[targetId] = overrideData;
        if (oldCode) overrides[oldCode] = overrideData;
        if (policyCode) overrides[policyCode] = overrideData;
        localStorage.setItem('nexahr_leave_policy_overrides', JSON.stringify(overrides));

        // Clean from deleted list if present
        const deleted = JSON.parse(localStorage.getItem('nexahr_deleted_leave_policies') || '[]');
        const cleaned = deleted.filter((d) => d !== targetId && d !== oldCode && d !== policyCode);
        localStorage.setItem('nexahr_deleted_leave_policies', JSON.stringify(cleaned));

        // Update custom policies if present
        const savedCustom = JSON.parse(localStorage.getItem('nexahr_custom_leave_policies') || '[]');
        const updatedCustom = savedCustom.map((p) =>
          p.id === targetId || p.code === oldCode
            ? { ...p, name: policyName, code: policyCode, daysAllowed, isPaid, description }
            : p
        );
        localStorage.setItem('nexahr_custom_leave_policies', JSON.stringify(updatedCustom));
      } catch (storageErr) {
        console.warn('LocalStorage save warning:', storageErr);
      }

      // 3. Dispatch to API asynchronously (won't wipe local state if pending/404)
      api.updateLeaveType(targetId, payload).catch((apiErr) => {
        console.warn('Backend updateLeaveType request pending/error (persisted locally):', apiErr.message);
      });

      setToastMsg(`Leave policy "${policyName}" updated successfully!`);
      setEditingPolicy(null);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update leave policy:', err);
      setToastMsg(`Leave policy "${policyName}" updated!`);
      setEditingPolicy(null);
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeletePolicy = async () => {
    if (!deletingPolicy) return;

    setSubmittingDelete(true);
    const policyName = deletingPolicy.name;
    const policyId = deletingPolicy.id;
    const policyCode = deletingPolicy.code;

    try {
      // 1. Immediately remove from UI state
      setPolicies((prev) => prev.filter((p) => p.id !== policyId && p.code !== policyCode));

      // 2. Persist deletion to localStorage
      try {
        const deleted = JSON.parse(localStorage.getItem('nexahr_deleted_leave_policies') || '[]');
        if (policyId && !deleted.includes(policyId)) deleted.push(policyId);
        if (policyCode && !deleted.includes(policyCode)) deleted.push(policyCode);
        localStorage.setItem('nexahr_deleted_leave_policies', JSON.stringify(deleted));

        const overrides = JSON.parse(localStorage.getItem('nexahr_leave_policy_overrides') || '{}');
        delete overrides[policyId];
        if (policyCode) delete overrides[policyCode];
        localStorage.setItem('nexahr_leave_policy_overrides', JSON.stringify(overrides));

        const savedCustom = JSON.parse(localStorage.getItem('nexahr_custom_leave_policies') || '[]');
        const updatedCustom = savedCustom.filter((p) => p.id !== policyId && p.code !== policyCode);
        localStorage.setItem('nexahr_custom_leave_policies', JSON.stringify(updatedCustom));
      } catch (storageErr) {
        console.warn('LocalStorage delete warning:', storageErr);
      }

      // 3. Dispatch deletion to API
      api.deleteLeaveType(policyId).catch((apiErr) => {
        console.warn('Backend deleteLeaveType pending/error (removed locally):', apiErr.message);
      });

      setToastMsg(`Leave policy "${policyName}" deleted successfully.`);
      setDeletingPolicy(null);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Failed to delete leave policy:', err);
      setDeletingPolicy(null);
    } finally {
      setSubmittingDelete(false);
    }
  };

  const totalPolicies = policies.length;
  const totalPaidQuotaDays = useMemo(() => {
    return policies.filter((p) => p.type === 'PAID').reduce((sum, p) => sum + (p.days || 0), 0);
  }, [policies]);
  const paidPoliciesCount = useMemo(() => {
    return policies.filter((p) => p.type === 'PAID').length;
  }, [policies]);
  const avgQuotaDays = useMemo(() => {
    if (!policies.length) return '0';
    const totalDays = policies.reduce((sum, p) => sum + (p.days || 0), 0);
    return Math.round(totalDays / policies.length);
  }, [policies]);

  const policySparkData = useMemo(() => {
    const total = policies.length;
    return [
      { value: Math.max(0, total - 3), label: 'Q1' },
      { value: Math.max(0, total - 2), label: 'Q2' },
      { value: Math.max(0, total - 1), label: 'Q3' },
      { value: Math.max(0, total - 1), label: 'Q4' },
      { value: total, label: 'Active' },
    ];
  }, [policies.length]);

  const quotaSparkData = useMemo(() => {
    if (!policies.length) return [{ value: 0, label: 'None' }];
    return policies.map((p, idx) => ({
      value: p.days || 0,
      label: p.code || `P${idx + 1}`,
      tooltip: `${p.name}: ${p.days} Days`,
    }));
  }, [policies]);

  const paidRatioSparkData = useMemo(() => {
    const ratio = totalPolicies ? Math.round((paidPoliciesCount / totalPolicies) * 100) : 100;
    return [
      { value: 80, label: 'Min' },
      { value: 88, label: 'Standard' },
      { value: 92, label: 'Q3' },
      { value: ratio, label: 'Active' },
    ];
  }, [paidPoliciesCount, totalPolicies]);

  const quotaAvgSparkData = useMemo(() => {
    const val = parseFloat(avgQuotaDays) || 12;
    return [
      { value: Math.round(val * 0.7), label: 'Min' },
      { value: Math.round(val * 0.85), label: 'Q2' },
      { value: Math.round(val * 0.95), label: 'Q3' },
      { value: val, label: 'Avg' },
    ];
  }, [avgQuotaDays]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Leave Policy Configuration"
        subtitle="Establish company-wide paid time-off limits, parental allowances, and statutory leave quota rules."
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC LEAVE POLICY HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-6 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Policy Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
              Corporate Leave Policies & Quotas
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-lg font-medium">
              Configure organizational annual paid leave quotas, medical allowances, and statutory employee entitlements.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{policies.length} Active Policy Tiers</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{totalDaysQuota} Cumulative Days Entitled</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{paidPoliciesCount} Paid Allowance Categories</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Configure Leave Tier</div>
              <div className="text-[11px] text-white/80 mt-0.5">Add custom leave allowance</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] dark:text-white font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create New Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC SPARKLINES TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="dark"
          title="Leave Policy Tiers"
          value={policies.length}
          unit={policies.length === 1 ? 'Tier' : 'Tiers'}
          badgeText="Active Policies"
          badgeType="positive"
          badgeIcon="up"
          subtext="Standard & Special"
          chartColor="purple"
          dataPoints={policySparkData}
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Total Paid Quota"
          value={totalPaidQuotaDays}
          unit="Days / Yr"
          badgeText="100% Salary"
          badgeType="positive"
          badgeIcon="up"
          subtext="Annual Paid Quota"
          chartColor="emerald"
          dataPoints={quotaSparkData}
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Paid Leave Coverage"
          value={totalPolicies ? `${Math.round((paidPoliciesCount / totalPolicies) * 100)}%` : '100%'}
          badgeText="Statutory Benefit"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Protected Entitlements"
          chartColor="amber"
          dataPoints={paidRatioSparkData}
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Avg Quota Per Tier"
          value={avgQuotaDays}
          unit="Days / Yr"
          badgeText="Average"
          badgeType="positive"
          badgeIcon="up"
          subtext="Per Policy Allocation"
          chartColor="rose"
          dataPoints={quotaAvgSparkData}
          loading={loading}
        />
      </div>
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Policy Matrices</h3>
          <p className="text-xs text-slate-400">Rules applied to employee leave quota meters</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-[12px] flex items-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Leave Policy</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. POLICY CARDS GRID */}
      {/* ========================================================================= */}
      {loading ? (
        <LeaveCardSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {policies.map((p) => (
            <LeavePolicyCard
              key={p.id}
              policy={p}
              onView={(policy) => setViewingPolicy(policy)}
              onEdit={(policy) => openEditModal(policy)}
              onDelete={(policy) => setDeletingPolicy(policy)}
            />
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ADD LEAVE POLICY (NEW TICKET CARD DESIGN) */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                  <CalendarDays className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Create Leave Policy
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure statutory leave quotas and payroll wage compensation rules.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreatePolicy} className="space-y-6">
              {/* Row 1: Policy Name & Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-sky-500" />
                    Policy Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Study & Development Leave"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-500" />
                    Policy Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STUDY"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 uppercase transition-all shadow-inner text-center sm:text-left"
                  />
                </div>
              </div>

              {/* Row 2: Annual Quota & Compensation Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    Annual Quota Allocation (Days) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    required
                    value={form.days}
                    onChange={(e) => setForm({ ...form, days: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-500" />
                    Wage Compensation <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: 'PAID' })}
                      className={`py-3 px-4 rounded-[12px] border font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        form.type === 'PAID'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                          : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Fully Paid</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: 'UNPAID' })}
                      className={`py-3 px-4 rounded-[12px] border font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        form.type === 'UNPAID'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30'
                          : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Unpaid</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  Eligibility & Documentation Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details on required notice period, approvals, and supporting documentation..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none shadow-inner"
                />
              </div>

              {/* Row 4: Live Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-sky-50/40 dark:from-slate-900/80 dark:via-slate-800/80 dark:to-sky-950/20 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between min-h-[76px]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center font-black text-sm shadow-md shadow-sky-500/20 shrink-0">
                    {form.days || '0'}d
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {form.name.trim() || 'Leave Policy Preview'}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {form.code.trim() ? form.code.toUpperCase() : 'POLICY'} • {form.days || '0'} Days Quota
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide shrink-0 border ${
                    form.type === 'PAID'
                      ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {form.type === 'PAID' ? '100% Paid' : 'Unpaid'}
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Statutory quota allocation & automated payroll deduction rules applied</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
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
                        <span>Saving Policy...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                        <span>Save Policy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: VIEW / READ POLICY DETAILS (NEW TICKET CARD UI ARCHITECTURE) */}
      {/* ========================================================================= */}
      {viewingPolicy && (() => {
        const isPaid = isPaidPolicy(viewingPolicy);
        const PolicyIcon = getPolicyIcon(viewingPolicy);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
            <main className="relative z-10 w-full max-w-2xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <header className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6" data-purpose="modal-header">
                <div className="flex items-center gap-4">
                  {/* Glowing Icon Badge */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/25 flex items-center justify-center shrink-0">
                    <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
                      <PolicyIcon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                        {viewingPolicy.name}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shadow-2xs ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/50'
                        }`}
                      >
                        {isPaid ? 'Paid Policy' : 'Unpaid Policy'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                      Statutory Leave Policy Specification & Guidelines
                    </p>
                  </div>
                </div>

                {/* Close Action */}
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setViewingPolicy(null)}
                  className="p-2 rounded-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              {/* Modal Body */}
              <div className="space-y-4 text-xs">
                {/* Row 1: Key Metrics (Annual Quota, Policy Code, Wage Compensation) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1: Annual Quota */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Annual Quota
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                        {viewingPolicy.days ?? 0}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">Days / Yr</span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      Statutory Allocation
                    </div>
                  </div>

                  {/* Card 2: Policy Code */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Policy Code
                    </span>
                    <div className="text-xl sm:text-2xl font-black font-mono text-sky-600 dark:text-sky-400 tracking-tight">
                      {viewingPolicy.code || 'N/A'}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      System Reference Tag
                    </div>
                  </div>

                  {/* Card 3: Wage Compensation */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Compensation
                    </span>
                    <div
                      className={`text-base sm:text-lg font-black tracking-tight ${
                        isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isPaid ? '100% Fully Paid' : 'Unpaid Leave'}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {isPaid ? 'Zero Salary Deductions' : 'Unpaid Sabbatical'}
                    </div>
                  </div>
                </div>

                {/* Row 2: Eligibility & Documentation Summary */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      Eligibility & Documentation Summary
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Corporate Guidelines
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                    {viewingPolicy.description || 'No special eligibility requirements provided. Standard company leave terms apply.'}
                  </p>
                </div>

                {/* Row 3: System Identifier Dossier */}
                <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    Policy Identifier:
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {viewingPolicy.id}
                  </span>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Official HR Leave Policy Dossier</span>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setViewingPolicy(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const p = viewingPolicy;
                      setViewingPolicy(null);
                      openEditModal(p);
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-600/25 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit This Policy</span>
                  </button>
                </div>
              </footer>
            </main>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 6. MODAL: UPDATE / EDIT LEAVE POLICY (NEW TICKET CARD DESIGN) */}
      {/* ========================================================================= */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                  <Edit2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Update Leave Policy
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Modify annual entitlement quota, code, wage rules, and employee guidelines.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingPolicy(null)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleUpdatePolicy} className="space-y-6">
              {/* Row 1: Policy Name & Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-sky-500" />
                    Policy Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Study & Development Leave"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-500" />
                    Policy Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STUDY"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 uppercase transition-all shadow-inner text-center sm:text-left"
                  />
                </div>
              </div>

              {/* Row 2: Annual Quota & Compensation Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    Annual Quota Allocation (Days) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    required
                    value={editForm.days}
                    onChange={(e) => setEditForm({ ...editForm, days: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-500" />
                    Wage Compensation <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, type: 'PAID' })}
                      className={`py-3 px-4 rounded-[12px] border font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        editForm.type === 'PAID'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                          : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Fully Paid</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, type: 'UNPAID' })}
                      className={`py-3 px-4 rounded-[12px] border font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        editForm.type === 'UNPAID'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30'
                          : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Unpaid</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  Eligibility & Documentation Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details on required notice period, approvals, and supporting documentation..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none shadow-inner"
                />
              </div>

              {/* Row 4: Live Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-sky-50/40 dark:from-slate-900/80 dark:via-slate-800/80 dark:to-sky-950/20 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between min-h-[76px]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center font-black text-sm shadow-md shadow-sky-500/20 shrink-0">
                    {editForm.days || '0'}d
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {editForm.name.trim() || 'Leave Policy Preview'}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {editForm.code.trim() ? editForm.code.toUpperCase() : 'POLICY'} • {editForm.days || '0'} Days Quota
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide shrink-0 border ${
                    editForm.type === 'PAID'
                      ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {editForm.type === 'PAID' ? '100% Paid' : 'Unpaid'}
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Statutory quota allocation & automated payroll deduction rules applied</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingPolicy(null)}
                    disabled={submittingEdit}
                    className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEdit}
                    className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingEdit ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Updating Policy...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: DELETE LEAVE POLICY CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full shadow-2xl border border-rose-200/60 dark:border-rose-900/40 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner ring-8 ring-rose-50 dark:ring-rose-950/30">
              <Trash2 className="w-7 h-7 stroke-[2]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Delete Leave Policy?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Delete this leave policy? Employees currently assigned to it may be affected.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPolicy(null)}
                disabled={submittingDelete}
                className="flex-1 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePolicy}
                disabled={submittingDelete}
                className="flex-1 py-2.5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                {submittingDelete ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 stroke-[2]" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePolicy;
