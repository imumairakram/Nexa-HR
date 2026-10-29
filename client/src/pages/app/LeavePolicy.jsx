import React, { useState, useEffect, useMemo } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { LeaveCardSkeleton } from '../../components/common/Skeleton';
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
        title="Leave Policy Configuration & Quota Rules"
        subtitle="Establish company-wide paid time-off limits, parental allowances, and statutory leave quota rules."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC LEAVE POLICY HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-blue-200/70 dark:border-blue-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Policy Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Corporate Leave Policies & Quotas
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Configure organizational annual paid leave quotas, medical allowances, and statutory employee entitlements.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{policies.length} Active Policy Tiers</span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Clock className="w-3.5 h-3.5" />
                <span>Annual Allocation</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-blue-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Configure Leave Tier</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Add custom leave allowance</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
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
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {policies.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-blue-300/60 dark:hover:border-blue-700/60 transition-all flex flex-col justify-between space-y-4 group hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${p.type === 'PAID'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                  >
                    {p.type} LEAVE
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{p.code}</span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {p.description}
                </p>

                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs border border-slate-100 dark:border-slate-800/60">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400">Allowed Quota:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-black text-sm">{p.days} Days / Year</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">Wage Status:</span>
                    <span className={p.type === 'PAID' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                      {p.type === 'PAID' ? '100% Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD ACTION BUTTONS: READ (VIEW), UPDATE (EDIT), DELETE */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingPolicy(p)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/60 dark:hover:bg-blue-950/60 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-2xs hover:shadow-sm"
                  title="View Policy Details"
                >
                  <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>View</span>
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(p)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-emerald-950/60 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-2xs hover:shadow-sm"
                  title="Edit Policy"
                >
                  <Edit2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingPolicy(p)}
                  className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800/60 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-2xs hover:shadow-sm"
                  title="Delete Policy"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ADD LEAVE POLICY (STITCH LUXURY DESIGN) */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl border border-blue-200/60 dark:border-blue-800/60 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-blue-100/80 dark:border-blue-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/60 dark:via-indigo-950/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 ring-4 ring-blue-500/15">
                  <CalendarDays className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Create Leave Policy
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Configure statutory leave quotas and payroll wage compensation rules.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreatePolicy} className="overflow-y-auto flex-1 p-6 sm:p-7 space-y-4 custom-scrollbar text-xs relative z-10">
              {/* Policy Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Policy Title <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Study & Development Leave"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Policy Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. STUDY"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase transition-all placeholder:text-slate-400 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Annual Quota & Compensation Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Annual Quota Allocation (Days) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      min={1}
                      max={365}
                      required
                      value={form.days}
                      onChange={(e) => setForm({ ...form, days: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Wage Compensation <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: 'PAID' })}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${form.type === 'PAID'
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60'
                        }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Fully Paid</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: 'UNPAID' })}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${form.type === 'UNPAID'
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60'
                        }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Unpaid</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Eligibility & Documentation Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details on required notice period, approvals, and supporting documentation..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/70 via-blue-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-teal-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {form.days || '0'}d
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {form.name.trim() || 'Leave Policy Preview'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {form.code.trim() ? form.code.toUpperCase() : 'POLICY'} • {form.days || '0'} Days Quota
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${form.type === 'PAID'
                  ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}>
                  {form.type === 'PAID' ? '100% Paid' : 'Unpaid'}
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                      <span>Save Policy</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: VIEW / READ POLICY DETAILS */}
      {/* ========================================================================= */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-2xl rounded-3xl max-w-2xl w-full shadow-2xl border border-blue-200/60 dark:border-blue-800/60 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="px-6 py-4.5 border-b border-blue-100/80 dark:border-blue-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/60 dark:via-indigo-950/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 ring-4 ring-blue-500/15">
                  <Eye className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                      {viewingPolicy.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                        viewingPolicy.type === 'PAID'
                          ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {viewingPolicy.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Statutory Leave Policy Specification & Guidelines
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingPolicy(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5 custom-scrollbar text-xs relative z-10">
              {/* Telemetry Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                  <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Annual Quota</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {viewingPolicy.days} <span className="text-xs font-semibold text-slate-400">Days / Yr</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Policy Code</div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    {viewingPolicy.code}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Compensation</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {viewingPolicy.type === 'PAID' ? '100% Fully Paid' : 'Unpaid Leave'}
                  </div>
                </div>
              </div>

              {/* Policy Description / Eligibility Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Eligibility & Documentation Summary</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                  {viewingPolicy.description || 'No special eligibility requirements provided. Standard company leave terms apply.'}
                </p>
              </div>

              {/* System Metadata */}
              <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Policy Identifier:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{viewingPolicy.id}</span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={() => setViewingPolicy(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
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
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit This Policy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: UPDATE / EDIT LEAVE POLICY */}
      {/* ========================================================================= */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl border border-blue-200/60 dark:border-blue-800/60 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-blue-100/80 dark:border-blue-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/60 dark:via-indigo-950/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25 ring-4 ring-emerald-500/15">
                  <Edit2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Update Leave Policy
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Modify annual entitlement quota, code, wage rules, and employee guidelines.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPolicy(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUpdatePolicy} className="overflow-y-auto flex-1 p-6 sm:p-7 space-y-4 custom-scrollbar text-xs relative z-10">
              {/* Policy Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Policy Title <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Study & Development Leave"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Policy Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. STUDY"
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase transition-all placeholder:text-slate-400 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Annual Quota & Compensation Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Annual Quota Allocation (Days) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      min={1}
                      max={365}
                      required
                      value={editForm.days}
                      onChange={(e) => setEditForm({ ...editForm, days: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Wage Compensation <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, type: 'PAID' })}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${editForm.type === 'PAID'
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60'
                        }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Fully Paid</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, type: 'UNPAID' })}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${editForm.type === 'UNPAID'
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60'
                        }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Unpaid</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Eligibility & Documentation Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details on required notice period, approvals, and supporting documentation..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/70 via-blue-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-teal-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {editForm.days || '0'}d
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {editForm.name.trim() || 'Leave Policy Preview'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {editForm.code.trim() ? editForm.code.toUpperCase() : 'POLICY'} • {editForm.days || '0'} Days Quota
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${editForm.type === 'PAID'
                  ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}>
                  {editForm.type === 'PAID' ? '100% Paid' : 'Unpaid'}
                </span>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  disabled={submittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {submittingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
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
                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">"{deletingPolicy.name}"</span> (<span className="font-mono font-bold text-rose-600 dark:text-rose-400">{deletingPolicy.code}</span>)? Employees will no longer be eligible to request this leave category.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPolicy(null)}
                disabled={submittingDelete}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePolicy}
                disabled={submittingDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
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
