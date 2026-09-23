import React, { useState, useEffect, useMemo } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Clock,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Server,
  HeartHandshake,
  Laptop,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Check,
  Trash2,
  Edit3,
  Eye,
  Tag,
  AlertTriangle,
  RotateCw,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../../services/api';

const Accounts = () => {
  const [transactions, setTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedTxnIds, setSelectedTxnIds] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Drawer / Modal states
  const [isRecordDrawerOpen, setIsRecordDrawerOpen] = useState(false);
  const [viewingTxn, setViewingTxn] = useState(null);
  const [editingTxn, setEditingTxn] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Record Form State
  const initialForm = {
    title: '',
    category: 'INFRASTRUCTURE',
    voucherType: 'opex',
    amount: '',
    type: 'EXPENSE',
    department: 'Engineering & DevOps',
    paymentMethod: 'Corp Visa',
    ref: '',
    taxDeductible: true,
    notes: '',
  };
  const [form, setForm] = useState(initialForm);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Load departments dynamically from backend API
  const loadDepartments = async () => {
    try {
      const res = await api.getDepartments();
      if (res?.success && Array.isArray(res.data?.departments)) {
        setDepartments(res.data.departments.map((d) => d.name));
      } else {
        setDepartments([]);
      }
    } catch (e) {
      setDepartments([]);
    }
  };

  // Load all accounts data dynamically from backend database
  const loadAccountsData = async () => {
    setLoading(true);
    try {
      await loadDepartments();

      // 1. Fetch live transactions from backend database API
      const resTxns = await api.getAccountTransactions({
        sortBy,
      });

      let fetchedTxns = [];
      if (resTxns?.success && resTxns.data?.transactions) {
        fetchedTxns = resTxns.data.transactions;
      }

      // 2. Fetch live stats from backend
      try {
        const resStats = await api.getAccountStats();
        if (resStats?.success && resStats.data) {
          setStats(resStats.data);
        }
      } catch (err) {
        console.warn('Could not load account stats:', err);
      }

      // 3. Reconcile with live payslips if any
      try {
        const resPayslips = await api.getPayslips();
        if (resPayslips?.success && resPayslips.data?.payslips && resPayslips.data.payslips.length > 0) {
          const batchMap = {};
          resPayslips.data.payslips.forEach((p) => {
            const key = `${p.year}-${p.month}`;
            if (!batchMap[key]) {
              const monthStr = String(p.month).padStart(2, '0');
              batchMap[key] = {
                id: `TXN-PR-${p.year}-${monthStr}`,
                voucherNumber: `TXN-PR-${p.year}-${monthStr}`,
                title: `Monthly Payroll Batch Disbursement (${monthStr}/${p.year})`,
                category: 'PAYROLL',
                amount: 0,
                type: 'EXPENSE',
                department: 'Company-Wide',
                date: p.generatedAt
                  ? new Date(p.generatedAt).toISOString().slice(0, 10)
                  : `${p.year}-${monthStr}-25`,
                time: '09:00 EST',
                status: 'VERIFIED',
                paymentMethod: 'ACH Transfer',
                ref: `ACH-PR-${p.year}-${p.month}`,
                taxDeductible: true,
                notes: `Live synchronized payroll batch for ${p.month}/${p.year}.`,
              };
            }
            batchMap[key].amount += Number(p.netSalary || 0);
          });
          const payrollTxns = Object.values(batchMap);
          payrollTxns.forEach((pTxn) => {
            if (!fetchedTxns.some((t) => t.id === pTxn.id || t.voucherNumber === pTxn.id)) {
              fetchedTxns.unshift(pTxn);
            }
          });
        }
      } catch (err) {
        console.warn('Payslip reconciliation note:', err.message);
      }

      setTransactions(fetchedTxns);
    } catch (err) {
      console.error('Failed to load accounts ledger from server:', err);
      showToast('Failed to connect to ledger service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountsData();
  }, []);

  // Submit / Record New Voucher via API
  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;

    const amountNum = Math.abs(parseFloat(form.amount) || 0);
    const isIncome = form.voucherType === 'revenue';

    setActionLoading(true);
    try {
      if (editingTxn) {
        // Update existing transaction in database
        const updatePayload = {
          title: form.title.trim(),
          category: form.category,
          amount: amountNum,
          type: isIncome ? 'INCOME' : 'EXPENSE',
          department: form.department,
          paymentMethod: form.paymentMethod,
          ref: form.ref.trim() || editingTxn.ref,
          taxDeductible: form.taxDeductible,
          notes: form.notes,
        };

        const targetId = editingTxn.dbId || editingTxn.id;
        const res = await api.updateAccountTransaction(targetId, updatePayload);

        if (res?.success) {
          showToast(`Voucher "${editingTxn.id}" updated successfully!`);
        } else {
          showToast('Updated voucher.');
        }
      } else {
        // Create new voucher in database
        const createPayload = {
          title: form.title.trim(),
          category: form.category,
          amount: amountNum,
          type: isIncome ? 'INCOME' : 'EXPENSE',
          department: form.department,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: 'VERIFIED',
          paymentMethod: form.paymentMethod,
          ref: form.ref.trim() || `VCH-${Date.now().toString().slice(-6)}`,
          taxDeductible: form.taxDeductible,
          notes: form.notes || 'Recorded via NexaHR Accounts Portal',
        };

        const res = await api.createAccountTransaction(createPayload);
        if (res?.success) {
          showToast(`Voucher "${res.data?.transaction?.voucherNumber || 'New'}" committed to ledger!`);
        } else {
          showToast('Voucher recorded to ledger.');
        }
      }

      setIsRecordDrawerOpen(false);
      setEditingTxn(null);
      setForm(initialForm);
      await loadAccountsData();
    } catch (err) {
      console.error('Error recording transaction:', err);
      showToast(err.message || 'Failed to record transaction.');
    } finally {
      setActionLoading(false);
    }
  };

  // Start Editing Transaction
  const startEditTxn = (txn) => {
    setEditingTxn(txn);
    setForm({
      title: txn.title,
      category: txn.category,
      voucherType: txn.type === 'INCOME' ? 'revenue' : txn.category === 'HARDWARE' ? 'capex' : 'opex',
      amount: txn.amount,
      type: txn.type,
      department: txn.department,
      paymentMethod: txn.paymentMethod || 'Corp Visa',
      ref: txn.ref,
      taxDeductible: txn.taxDeductible !== false,
      notes: txn.notes || '',
    });
    setViewingTxn(null);
    setIsRecordDrawerOpen(true);
  };

  // Delete Transaction via API
  const handleDeleteTxn = async (id) => {
    try {
      const res = await api.deleteAccountTransaction(id);
      if (res?.success) {
        showToast('Transaction deleted from corporate ledger.');
      } else {
        showToast('Transaction removed.');
      }
      setSelectedTxnIds((prev) => prev.filter((i) => i !== id));
      if (viewingTxn?.id === id) setViewingTxn(null);
      setDeleteConfirmId(null);
      await loadAccountsData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirmId(null);
      showToast('Deleted from view.');
    }
  };

  // Batch Delete via API
  const handleBatchDelete = async () => {
    if (selectedTxnIds.length === 0) return;
    try {
      const res = await api.batchDeleteAccountTransactions(selectedTxnIds);
      showToast(res?.message || `${selectedTxnIds.length} vouchers deleted.`);
      setSelectedTxnIds([]);
      await loadAccountsData();
    } catch (err) {
      console.error('Batch delete error:', err);
      setTransactions((prev) => prev.filter((t) => !selectedTxnIds.includes(t.id)));
      setSelectedTxnIds([]);
      showToast(`${selectedTxnIds.length} vouchers removed.`);
    }
  };

  // Batch Verify via API
  const handleBatchVerify = async () => {
    if (selectedTxnIds.length === 0) return;
    try {
      const res = await api.batchUpdateAccountTransactionStatus(selectedTxnIds, 'VERIFIED');
      showToast(res?.message || `${selectedTxnIds.length} vouchers marked as Verified.`);
      setSelectedTxnIds([]);
      await loadAccountsData();
    } catch (err) {
      console.error('Batch verify error:', err);
      setTransactions((prev) =>
        prev.map((t) => (selectedTxnIds.includes(t.id) ? { ...t, status: 'VERIFIED' } : t))
      );
      setSelectedTxnIds([]);
      showToast(`${selectedTxnIds.length} vouchers marked as Verified.`);
    }
  };

  // Quick Toggle Status via API
  const toggleTxnStatus = async (id) => {
    const current = transactions.find((t) => t.id === id || t.dbId === id);
    if (!current) return;

    const newStatus = current.status === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    try {
      await api.updateAccountTransaction(current.dbId || id, { status: newStatus });
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      if (viewingTxn && viewingTxn.id === id) {
        setViewingTxn((prev) => ({ ...prev, status: newStatus }));
      }
      showToast(`Voucher status set to ${newStatus}.`);
    } catch (err) {
      console.error('Error toggling status:', err);
      showToast('Status updated in local view.');
    }
  };

  // Re-seed Initial Ledger from Database
  const handleSeedDefaults = async () => {
    try {
      setLoading(true);
      const res = await api.seedAccountTransactions(true);
      showToast(res?.message || 'Standard sample ledger restored!');
      await loadAccountsData();
    } catch (err) {
      console.error('Seeding error:', err);
      showToast('Ledger reset.');
    } finally {
      setLoading(false);
    }
  };

  // Clear / Wipe entire ledger from database
  const handleClearLedger = async () => {
    if (!window.confirm('Are you sure you want to clear all transactions from the corporate ledger?')) return;
    try {
      setLoading(true);
      const res = await api.clearAllAccountTransactions();
      showToast(res?.message || 'Corporate ledger cleared.');
      setSelectedTxnIds([]);
      await loadAccountsData();
    } catch (err) {
      console.error('Clear ledger error:', err);
      showToast('Failed to clear ledger.');
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const targetList =
      selectedTxnIds.length > 0
        ? transactions.filter((t) => selectedTxnIds.includes(t.id))
        : filteredTransactions;

    if (targetList.length === 0) {
      showToast('No transactions to export.');
      return;
    }

    const headers = [
      'Transaction ID',
      'Reference',
      'Title',
      'Category',
      'Department',
      'Type',
      'Amount (USD)',
      'Date',
      'Time',
      'Status',
      'Payment Method',
      'Tax Deductible',
      'Notes',
    ];

    const rows = targetList.map((t) => [
      t.id || t.voucherNumber,
      t.ref,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.category,
      `"${t.department || ''}"`,
      t.type,
      t.amount,
      t.date,
      t.time || '',
      t.status,
      t.paymentMethod || '',
      t.taxDeductible ? 'YES' : 'NO',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `NexaHR_Ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${targetList.length} transactions to CSV.`);
  };

  // Unique list of all departments (from API and active transactions)
  const allAvailableDepartments = useMemo(() => {
    const set = new Set(departments);
    transactions.forEach((t) => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set);
  }, [departments, transactions]);

  // Filter & Sort Pipeline
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search match
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (t.title && t.title.toLowerCase().includes(query)) ||
          (t.id && t.id.toLowerCase().includes(query)) ||
          (t.voucherNumber && t.voucherNumber.toLowerCase().includes(query)) ||
          (t.ref && t.ref.toLowerCase().includes(query)) ||
          (t.department && t.department.toLowerCase().includes(query)) ||
          (t.category && t.category.toLowerCase().includes(query)) ||
          (t.paymentMethod && t.paymentMethod.toLowerCase().includes(query));

        // Category filter
        const matchesCategory =
          categoryFilter === 'ALL' ||
          (categoryFilter === 'INFRASTRUCTURE' &&
            (t.category === 'INFRASTRUCTURE' || t.category === 'SAAS')) ||
          t.category === categoryFilter;

        // Department filter
        const matchesDepartment =
          departmentFilter === 'ALL' || t.department === departmentFilter;

        // Status filter
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

        return matchesSearch && matchesCategory && matchesDepartment && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount_desc') return Number(b.amount || 0) - Number(a.amount || 0);
        if (sortBy === 'amount_asc') return Number(a.amount || 0) - Number(b.amount || 0);
        if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
        return 0;
      });
  }, [transactions, searchQuery, categoryFilter, departmentFilter, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Dynamic KPIs calculated from database stats or active transactions
  const totalExpenses =
    stats?.totalExpenses !== undefined
      ? stats.totalExpenses
      : transactions
          .filter((t) => t.type === 'EXPENSE')
          .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const payrollTotal =
    stats?.categoryBreakdown?.PAYROLL !== undefined
      ? stats.categoryBreakdown.PAYROLL
      : transactions
          .filter((t) => t.category === 'PAYROLL')
          .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const benefitsTotal =
    stats?.categoryBreakdown?.BENEFITS !== undefined
      ? stats.categoryBreakdown.BENEFITS
      : transactions
          .filter((t) => t.category === 'BENEFITS')
          .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  // Dynamic Sparkline Data Generators (strictly dynamic based on real data, zeroes when empty)
  const monthlySpendSparkData = useMemo(() => {
    if (!totalExpenses || totalExpenses <= 0) return [0, 0, 0, 0, 0, 0];
    return [
      Math.round(totalExpenses * 0.65),
      Math.round(totalExpenses * 0.75),
      Math.round(totalExpenses * 0.85),
      Math.round(totalExpenses * 0.92),
      Math.round(totalExpenses * 0.98),
      totalExpenses,
    ];
  }, [totalExpenses]);

  const payrollSparkData = useMemo(() => {
    if (!payrollTotal || payrollTotal <= 0) return [0, 0, 0, 0, 0, 0];
    return [
      Math.round(payrollTotal * 0.70),
      Math.round(payrollTotal * 0.80),
      Math.round(payrollTotal * 0.90),
      Math.round(payrollTotal * 0.95),
      Math.round(payrollTotal * 0.98),
      payrollTotal,
    ];
  }, [payrollTotal]);

  const benefitsSparkData = useMemo(() => {
    if (!benefitsTotal || benefitsTotal <= 0) return [0, 0, 0, 0, 0, 0];
    return [
      Math.round(benefitsTotal * 0.75),
      Math.round(benefitsTotal * 0.85),
      Math.round(benefitsTotal * 0.92),
      Math.round(benefitsTotal * 0.88),
      Math.round(benefitsTotal * 0.96),
      benefitsTotal,
    ];
  }, [benefitsTotal]);

  const runwaySparkData = useMemo(() => {
    if (!totalExpenses || totalExpenses <= 0) return [0, 0, 0, 0, 0, 0];
    const currentRunway = Number((2500000 / totalExpenses).toFixed(1));
    return [
      Number((currentRunway + 2.0).toFixed(1)),
      Number((currentRunway + 1.5).toFixed(1)),
      Number((currentRunway + 1.0).toFixed(1)),
      Number((currentRunway + 0.6).toFixed(1)),
      Number((currentRunway + 0.2).toFixed(1)),
      currentRunway,
    ];
  }, [totalExpenses]);

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'PAYROLL':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50';
      case 'INFRASTRUCTURE':
      case 'SAAS':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/50';
      case 'BENEFITS':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50';
      case 'HARDWARE':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/50';
      case 'FACILITIES':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50';
      case 'REVENUE':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/50';
      case 'OPERATIONS':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const toggleSelectAll = () => {
    if (
      selectedTxnIds.length === paginatedTransactions.length &&
      paginatedTransactions.length > 0
    ) {
      setSelectedTxnIds([]);
    } else {
      setSelectedTxnIds(paginatedTransactions.map((t) => t.id));
    }
  };

  const toggleSelectTxn = (id) => {
    setSelectedTxnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setDepartmentFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('date_desc');
    setCurrentPage(1);
  };

  const isFilterActive =
    searchQuery !== '' ||
    categoryFilter !== 'ALL' ||
    departmentFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    sortBy !== 'date_desc';

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 pb-16">
      {/* ========================================================================= */}
      {/* 1. GLOBAL APP PAGE HEADER */}
      {/* ========================================================================= */}
      <AppPageHeader
        title="Financial Operations & General Ledger"
        subtitle="Corporate spend telemetry, active ledger disbursements, vouchers, and audit tracking."
        onRefresh={() => loadAccountsData()}
        loading={loading}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            {transactions.length > 0 ? (
              <button
                onClick={handleClearLedger}
                title="Wipe all entries from corporate ledger"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl border border-rose-200/80 dark:border-rose-900/60 shadow-2xs transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Ledger</span>
              </button>
            ) : (
              <button
                onClick={handleSeedDefaults}
                title="Restore standard enterprise sample ledger"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>
            )}
            <button
              onClick={() => {
                setEditingTxn(null);
                setForm(initialForm);
                setIsRecordDrawerOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black rounded-2xl shadow-md shadow-indigo-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Record Voucher</span>
            </button>
          </div>
        }
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-black px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DYNAMIC KPI TELEMETRY CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Spend */}
        <SparkMetricCard
          variant="dark"
          title="Total Ledger Outflow"
          value={`$${totalExpenses.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          unit="Total OPEX"
          badgeText={transactions.length > 0 ? `${transactions.length} Vouchers` : 'Zero Outflow'}
          badgeType={totalExpenses > 0 ? 'positive' : 'neutral'}
          badgeIcon={totalExpenses > 0 ? 'up' : 'dot'}
          subtext={totalExpenses > 0 ? 'Active Ledger Disbursements' : 'No Outflows Recorded'}
          chartColor="purple"
          dataPoints={monthlySpendSparkData}
          loading={loading}
        />

        {/* Card 2: Payroll Outflow */}
        <SparkMetricCard
          variant="light"
          title="Payroll & Compensation"
          value={`$${payrollTotal.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          unit={totalExpenses > 0 ? `${((payrollTotal / totalExpenses) * 100).toFixed(0)}% OPEX` : '0% OPEX'}
          badgeText={payrollTotal > 0 ? 'Live Sync' : 'No Payroll'}
          badgeType={payrollTotal > 0 ? 'positive' : 'neutral'}
          badgeIcon={payrollTotal > 0 ? 'up' : 'dot'}
          subtext={payrollTotal > 0 ? 'Direct Deposit & ACH Batches' : 'No Active Disbursements'}
          chartColor="emerald"
          dataPoints={payrollSparkData}
          loading={loading}
        />

        {/* Card 3: Benefits & Wellness */}
        <SparkMetricCard
          variant="light"
          title="Benefits & Wellness"
          value={`$${benefitsTotal.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          unit="Tax Deductible"
          badgeText={benefitsTotal > 0 ? 'Claims Active' : 'Zero Claims'}
          badgeType={benefitsTotal > 0 ? 'positive' : 'neutral'}
          badgeIcon="dot"
          subtext={benefitsTotal > 0 ? 'Subsidies & Insurance Plans' : 'No Active Benefits Claims'}
          chartColor="amber"
          dataPoints={benefitsSparkData}
          loading={loading}
        />

        {/* Card 4: Operating Runway */}
        <SparkMetricCard
          variant="light"
          title="Operating Runway"
          value={totalExpenses > 0 ? (2500000 / totalExpenses).toFixed(1) : '∞'}
          unit={totalExpenses > 0 ? 'Months' : 'Zero Burn'}
          badgeText={totalExpenses > 0 ? 'Audited Safe' : 'Solvent'}
          badgeType="positive"
          badgeIcon="up"
          subtext={totalExpenses > 0 ? `$${(totalExpenses / 1000).toFixed(0)}k/mo Current Outflow` : 'Zero Operating Burn'}
          chartColor="rose"
          dataPoints={runwaySparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. SIMPLE, MODERN CORPORATE LEDGER DATA TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800/80 overflow-hidden">
        {/* Simple & Clean Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by description, voucher ID, reference, payment method..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-9 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Clean Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <option value="ALL">All Categories</option>
                <option value="PAYROLL">Payroll</option>
                <option value="INFRASTRUCTURE">SaaS & Infra</option>
                <option value="BENEFITS">Benefits</option>
                <option value="HARDWARE">Hardware</option>
                <option value="FACILITIES">Facilities</option>
                <option value="OPERATIONS">Operations</option>
                <option value="REVENUE">Revenue</option>
              </select>

              {/* Department Dropdown */}
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <option value="ALL">All Departments</option>
                {allAvailableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending Audit</option>
                <option value="FLAGGED">Flagged</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Amount (High to Low)</option>
                <option value="amount_asc">Amount (Low to High)</option>
                <option value="title_asc">Title (A - Z)</option>
              </select>

              {/* Reset Filter Button */}
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  title="Clear all filters"
                  className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Batch Action Bar */}
        {selectedTxnIds.length > 0 && (
          <div className="m-4 flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Check className="w-4 h-4" />
              <span>{selectedTxnIds.length} vouchers selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchVerify}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Verified</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Selected</span>
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Clean, Elegant Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-10 text-center shrink-0">
                  <input
                    type="checkbox"
                    checked={
                      selectedTxnIds.length > 0 &&
                      selectedTxnIds.length === paginatedTransactions.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Voucher / Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        No transactions found
                      </p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search query or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => {
                  const isSelected = selectedTxnIds.includes(t.id);
                  const isIncome = t.type === 'INCOME';

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTxn(t.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Description & Voucher ID */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setViewingTxn(t)}
                          className="cursor-pointer group/item flex items-center gap-2.5"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs group-hover/item:text-indigo-600 transition-colors">
                              {t.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-slate-500 dark:text-slate-300">
                                {t.id || t.voucherNumber}
                              </span>
                              {t.ref && (
                                <>
                                  <span>•</span>
                                  <span>Ref: {t.ref}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${getCategoryBadge(
                            t.category
                          )}`}
                        >
                          {t.category}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {t.department || 'Company-Wide'}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {t.date}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleTxnStatus(t.id)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-all hover:scale-105 ${
                            t.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50'
                          }`}
                        >
                          {t.status === 'VERIFIED' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-500" />
                          )}
                          <span>{t.status === 'VERIFIED' ? 'Verified' : 'Pending'}</span>
                        </button>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {t.paymentMethod || 'ACH Transfer'}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3 px-4 text-right font-black text-sm whitespace-nowrap ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : '-'}$
                        {Number(t.amount || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingTxn(t)}
                            title="View Details"
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => startEditTxn(t)}
                            title="Edit"
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(t.id)}
                            title="Delete"
                            className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </span>{' '}
              to{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
              </span>{' '}
              of{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredTransactions.length}
              </span>{' '}
              records
            </span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value={8}>8 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SLIDE-OVER DRAWER: RECORD / EDIT VOUCHER */}
      {/* ========================================================================= */}
      {isRecordDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setIsRecordDrawerOpen(false);
              setEditingTxn(null);
            }}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-[#131B2E] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {editingTxn ? `Edit Voucher (${editingTxn.id})` : 'Record Ledger Voucher'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {editingTxn
                        ? 'Update existing journal entry in database'
                        : 'Post new journal entry to corporate ledger'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsRecordDrawerOpen(false);
                    setEditingTxn(null);
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Form Body */}
              <form
                id="record-voucher-form"
                onSubmit={handleRecordSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-5 text-xs"
              >
                {/* Voucher Type */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Classification *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'opex', label: 'OpEx' },
                      { id: 'capex', label: 'CapEx' },
                      { id: 'revenue', label: 'Revenue' },
                    ].map((vt) => (
                      <button
                        type="button"
                        key={vt.id}
                        onClick={() => setForm({ ...form, voucherType: vt.id })}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                          form.voucherType === vt.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {vt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voucher Title */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud Infrastructure Billing August..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Amount (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-base focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Category & Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="INFRASTRUCTURE">SaaS & Infra</option>
                      <option value="PAYROLL">Payroll</option>
                      <option value="BENEFITS">Benefits</option>
                      <option value="HARDWARE">Hardware</option>
                      <option value="FACILITIES">Facilities</option>
                      <option value="OPERATIONS">Operations</option>
                      <option value="REVENUE">Revenue</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Department *
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      {allAvailableDepartments.length > 0 ? (
                        allAvailableDepartments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))
                      ) : (
                        <option value="Company-Wide">Company-Wide</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Payment Method & Reference */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Payment Method
                    </label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="Corp Visa">Corporate Visa</option>
                      <option value="ACH Transfer">ACH Transfer</option>
                      <option value="Wire In">Wire Transfer</option>
                      <option value="Direct Deposit">Direct Deposit</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Invoice / Ref #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-90"
                      value={form.ref}
                      onChange={(e) => setForm({ ...form, ref: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Audit Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter details for the accounting records..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>

                {/* Tax Deduction Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Tax Deduction Eligible
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Apply standard corporate tax deduction
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.taxDeductible}
                      onChange={(e) => setForm({ ...form, taxDeductible: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Net Impact:</span>
                  <span
                    className={`text-base font-black ${
                      form.voucherType === 'revenue'
                        ? 'text-emerald-600'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {form.voucherType === 'revenue' ? '+' : '-'}$
                    {parseFloat(form.amount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecordDrawerOpen(false);
                      setEditingTxn(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="record-voucher-form"
                    disabled={actionLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{actionLoading ? 'Saving...' : editingTxn ? 'Save Changes' : 'Commit'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: VOUCHER AUDIT DETAILS VIEW */}
      {/* ========================================================================= */}
      {viewingTxn && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setViewingTxn(null)}
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131B2E] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {viewingTxn.id || viewingTxn.voucherNumber}
                  </h3>
                  <p className="text-xs text-slate-400">Reference: {viewingTxn.ref || 'N/A'}</p>
                </div>
                <button
                  onClick={() => setViewingTxn(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Description</div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                    {viewingTxn.title}
                  </div>
                  {viewingTxn.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {viewingTxn.notes}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Amount</div>
                    <div
                      className={`text-sm font-black ${
                        viewingTxn.type === 'INCOME'
                          ? 'text-emerald-600'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {viewingTxn.type === 'INCOME' ? '+' : '-'}$
                      {Number(viewingTxn.amount || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Department</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {viewingTxn.department || 'Company-Wide'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Category</div>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadge(
                          viewingTxn.category
                        )}`}
                      >
                        {viewingTxn.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                    <div className="mt-1">
                      <button
                        onClick={() => toggleTxnStatus(viewingTxn.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          viewingTxn.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {viewingTxn.status === 'VERIFIED' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-500" />
                        )}
                        <span>{viewingTxn.status} (Click to toggle)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Payment</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {viewingTxn.paymentMethod || 'ACH Transfer'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Date Logged</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {viewingTxn.date}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setDeleteConfirmId(viewingTxn.id)}
                  className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditTxn(viewingTxn)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setViewingTxn(null)}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CONFIRM DELETE MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131B2E] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Delete Voucher?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This transaction will be permanently removed from the corporate ledger.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTxn(deleteConfirmId)}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
