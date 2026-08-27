import React, { useState, useEffect, useMemo } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  FileText,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Server,
  HeartHandshake,
  Laptop,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  FileSpreadsheet,
  Receipt,
  Sparkles,
  Info,
  Check,
  SlidersHorizontal,
  Trash2,
  Edit3,
  Printer,
  Eye,
  RefreshCw,
  ArrowUpDown,
  Tag,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../../services/api';

const DEFAULT_SAMPLE_TXNS = [
  {
    id: 'TXN-9402',
    title: 'AWS Cloud Compute & Kubernetes Cluster - Q3',
    category: 'INFRASTRUCTURE',
    amount: 14250,
    type: 'EXPENSE',
    department: 'Engineering & DevOps',
    date: '2026-08-26',
    time: '14:30 EST',
    status: 'VERIFIED',
    paymentMethod: 'Corp Visa',
    ref: 'INV-AWS-2026-08',
    taxDeductible: true,
    notes: 'Monthly enterprise hosting and container orchestrations on us-east-1.',
  },
  {
    id: 'TXN-9403',
    title: 'Bi-Weekly Company Global Payroll Run',
    category: 'PAYROLL',
    amount: 84000,
    type: 'EXPENSE',
    department: 'Company-Wide',
    date: '2026-08-25',
    time: '09:00 EST',
    status: 'VERIFIED',
    paymentMethod: 'ACH Transfer',
    ref: 'ACH-PR-2026-08',
    taxDeductible: true,
    notes: 'Direct deposit ACH batch for active payroll ledger.',
  },
  {
    id: 'TXN-9404',
    title: 'Client Enterprise SLA Retainer - Acme Corp',
    category: 'REVENUE',
    amount: 50000,
    type: 'INCOME',
    department: 'Marketing & Sales',
    date: '2026-08-24',
    time: '16:45 EST',
    status: 'VERIFIED',
    paymentMethod: 'Wire In',
    ref: 'RET-ACME-883',
    taxDeductible: false,
    notes: 'Quarterly enterprise SaaS retainer payment received via wire.',
  },
  {
    id: 'TXN-9405',
    title: 'Annual Comprehensive Employee Health & Dental',
    category: 'BENEFITS',
    amount: 12500,
    type: 'EXPENSE',
    department: 'People Operations',
    date: '2026-08-22',
    time: '11:15 EST',
    status: 'VERIFIED',
    paymentMethod: 'Direct Deposit',
    ref: 'BNF-HEALTH-99',
    taxDeductible: true,
    notes: 'Group medical and wellness subsidy for full-time staff.',
  },
  {
    id: 'TXN-9406',
    title: 'MacBook Pro M3 Max Engineering Fleet (5 Units)',
    category: 'HARDWARE',
    amount: 17450,
    type: 'EXPENSE',
    department: 'Engineering & DevOps',
    date: '2026-08-20',
    time: '13:20 EST',
    status: 'PENDING',
    paymentMethod: 'Corp Visa',
    ref: 'APL-DEV-889',
    taxDeductible: true,
    notes: 'Workstation hardware provisioning for newly onboarded senior engineers.',
  },
  {
    id: 'TXN-9407',
    title: 'Headquarters Facility Lease & Utilities',
    category: 'FACILITIES',
    amount: 9800,
    type: 'EXPENSE',
    department: 'Operations',
    date: '2026-08-18',
    time: '10:00 EST',
    status: 'VERIFIED',
    paymentMethod: 'ACH Transfer',
    ref: 'FAC-HQ-AUG26',
    taxDeductible: true,
    notes: 'Office lease, power, fiber internet and janitorial service package.',
  },
  {
    id: 'TXN-9408',
    title: 'GitHub Enterprise & Figma Design System Licenses',
    category: 'INFRASTRUCTURE',
    amount: 3600,
    type: 'EXPENSE',
    department: 'Product & Design',
    date: '2026-08-15',
    time: '15:10 EST',
    status: 'VERIFIED',
    paymentMethod: 'Corp Visa',
    ref: 'LIC-GH-FIG-26',
    taxDeductible: true,
    notes: 'Annual seats for product design and engineering workflow tooling.',
  },
  {
    id: 'TXN-9409',
    title: 'Executive Team Offsite & Strategic Travel',
    category: 'OPERATIONS',
    amount: 6200,
    type: 'EXPENSE',
    department: 'Operations',
    date: '2026-08-10',
    time: '18:00 EST',
    status: 'PENDING',
    paymentMethod: 'Corp Visa',
    ref: 'TRV-OFFSITE-Q3',
    taxDeductible: true,
    notes: 'Travel, lodging and workshop facilities for quarterly leadership offsite.',
  },
];

const Accounts = () => {
  const [transactions, setTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fiscalPeriod, setFiscalPeriod] = useState('ALL_TIME');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedDeptChart, setSelectedDeptChart] = useState('ALL');
  const [selectedTxnIds, setSelectedTxnIds] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

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

  // Load departments from API
  const loadDepartments = async () => {
    try {
      const res = await api.getDepartments();
      if (res?.success && res.data?.departments && res.data.departments.length > 0) {
        setDepartments(res.data.departments.map((d) => d.name));
      } else {
        setDepartments([
          'Engineering & DevOps',
          'Product & Design',
          'Marketing & Sales',
          'People Operations',
          'Operations',
          'Company-Wide',
        ]);
      }
    } catch (e) {
      setDepartments([
        'Engineering & DevOps',
        'Product & Design',
        'Marketing & Sales',
        'People Operations',
        'Operations',
        'Company-Wide',
      ]);
    }
  };

  // Load all accounts data
  const loadAccountsData = async () => {
    setLoading(true);
    try {
      await loadDepartments();

      let persistentTxns = [];
      try {
        const saved = localStorage.getItem('nexahr_accounts_transactions');
        if (saved) {
          persistentTxns = JSON.parse(saved);
        } else {
          persistentTxns = DEFAULT_SAMPLE_TXNS;
          localStorage.setItem('nexahr_accounts_transactions', JSON.stringify(DEFAULT_SAMPLE_TXNS));
        }
      } catch (e) {
        console.warn('LocalStorage accounts read error:', e);
        persistentTxns = DEFAULT_SAMPLE_TXNS;
      }

      // Fetch live payroll batch disbursements from NexaHR backend
      let payrollTxns = [];
      try {
        const res = await api.getPayslips();
        if (res?.success && res.data?.payslips && res.data.payslips.length > 0) {
          const batchMap = {};
          res.data.payslips.forEach((p) => {
            const key = `${p.year}-${p.month}`;
            if (!batchMap[key]) {
              const monthStr = String(p.month).padStart(2, '0');
              batchMap[key] = {
                id: `TXN-PR-${p.year}-${monthStr}`,
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
          payrollTxns = Object.values(batchMap);
        }
      } catch (err) {
        console.warn('Live payslip fetch error, using stored transactions:', err);
      }

      // Merge avoiding duplicate IDs
      const allTxns = [...persistentTxns];
      payrollTxns.forEach((pTxn) => {
        if (!allTxns.some((t) => t.id === pTxn.id)) {
          allTxns.unshift(pTxn);
        }
      });

      setTransactions(allTxns);
    } catch (err) {
      console.error('Failed to load accounts ledger:', err);
      showToast('Failed to load live ledger data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountsData();
  }, []);

  const saveTransactionsToStorage = (updatedList) => {
    setTransactions(updatedList);
    try {
      localStorage.setItem('nexahr_accounts_transactions', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Submit / Record New Voucher
  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;

    const amountNum = Math.abs(parseFloat(form.amount) || 0);
    const isIncome = form.voucherType === 'revenue';

    if (editingTxn) {
      // Update existing transaction
      const updated = transactions.map((t) =>
        t.id === editingTxn.id
          ? {
              ...t,
              title: form.title.trim(),
              category: form.category,
              amount: amountNum,
              type: isIncome ? 'INCOME' : 'EXPENSE',
              department: form.department,
              paymentMethod: form.paymentMethod,
              ref: form.ref.trim() || t.ref,
              taxDeductible: form.taxDeductible,
              notes: form.notes,
            }
          : t
      );
      saveTransactionsToStorage(updated);
      setIsRecordDrawerOpen(false);
      setEditingTxn(null);
      setForm(initialForm);
      showToast(`Voucher "${editingTxn.id}" updated successfully!`);
      return;
    }

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
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
      notes: form.notes || 'Recorded via NexaHR Enterprise Accounts Portal',
    };

    const updated = [newTxn, ...transactions];
    saveTransactionsToStorage(updated);
    setIsRecordDrawerOpen(false);
    setForm(initialForm);
    showToast(`Voucher "${newTxn.title}" committed to corporate ledger!`);
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

  // Delete Transaction
  const handleDeleteTxn = (id) => {
    const updated = transactions.filter((t) => t.id !== id);
    saveTransactionsToStorage(updated);
    setSelectedTxnIds((prev) => prev.filter((i) => i !== id));
    if (viewingTxn?.id === id) setViewingTxn(null);
    setDeleteConfirmId(null);
    showToast('Transaction deleted from ledger.');
  };

  // Batch Delete
  const handleBatchDelete = () => {
    if (selectedTxnIds.length === 0) return;
    const updated = transactions.filter((t) => !selectedTxnIds.includes(t.id));
    saveTransactionsToStorage(updated);
    setSelectedTxnIds([]);
    showToast(`${selectedTxnIds.length} vouchers deleted successfully.`);
  };

  // Batch Verify
  const handleBatchVerify = () => {
    if (selectedTxnIds.length === 0) return;
    const updated = transactions.map((t) =>
      selectedTxnIds.includes(t.id) ? { ...t, status: 'VERIFIED' } : t
    );
    saveTransactionsToStorage(updated);
    setSelectedTxnIds([]);
    showToast(`${selectedTxnIds.length} vouchers marked as Verified.`);
  };

  // Quick Toggle Status
  const toggleTxnStatus = (id) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, status: t.status === 'VERIFIED' ? 'PENDING' : 'VERIFIED' } : t
    );
    saveTransactionsToStorage(updated);
    if (viewingTxn && viewingTxn.id === id) {
      setViewingTxn((prev) => ({ ...prev, status: prev.status === 'VERIFIED' ? 'PENDING' : 'VERIFIED' }));
    }
    showToast('Voucher audit status updated.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const targetList = selectedTxnIds.length > 0
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
      t.id,
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
    link.setAttribute('download', `NexaHR_Corporate_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${targetList.length} transactions to CSV.`);
  };

  // Print Audit Report
  const handlePrintAudit = () => {
    window.print();
  };

  // Filter & Sort Pipeline
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Fiscal Period filter
        if (fiscalPeriod === 'Q3_2026') {
          const m = new Date(t.date).getMonth();
          if (m < 6 || m > 8) return false;
        } else if (fiscalPeriod === 'AUGUST_2026') {
          const m = new Date(t.date).getMonth();
          if (m !== 7) return false;
        }

        // Search match
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          (t.title && t.title.toLowerCase().includes(query)) ||
          (t.id && t.id.toLowerCase().includes(query)) ||
          (t.ref && t.ref.toLowerCase().includes(query)) ||
          (t.department && t.department.toLowerCase().includes(query)) ||
          (t.category && t.category.toLowerCase().includes(query)) ||
          (t.paymentMethod && t.paymentMethod.toLowerCase().includes(query));

        // Category filter
        const matchesCategory =
          categoryFilter === 'ALL' ||
          (categoryFilter === 'INFRASTRUCTURE' && (t.category === 'INFRASTRUCTURE' || t.category === 'SAAS')) ||
          t.category === categoryFilter;

        // Status filter
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount_desc') return Number(b.amount || 0) - Number(a.amount || 0);
        if (sortBy === 'amount_asc') return Number(a.amount || 0) - Number(b.amount || 0);
        if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [transactions, searchQuery, categoryFilter, statusFilter, fiscalPeriod, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Real-time dynamic KPIs calculated from filtered or all active transactions
  const totalExpenses = transactions.filter((t) => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const payrollTotal = transactions.filter((t) => t.category === 'PAYROLL').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const benefitsTotal = transactions.filter((t) => t.category === 'BENEFITS').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const infraTotal = transactions.filter((t) => t.category === 'INFRASTRUCTURE' || t.category === 'SAAS').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const hardwareTotal = transactions.filter((t) => t.category === 'HARDWARE').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const facilitiesTotal = transactions.filter((t) => t.category === 'FACILITIES').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const operationsTotal = transactions.filter((t) => t.category === 'OPERATIONS').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpenses;

  // Dynamic Department Spend for Bar Chart
  const departmentSpendData = useMemo(() => {
    const deptSpendMap = {};
    const defaultBudgetMap = {
      'Engineering & DevOps': 65000,
      'Product & Design': 25000,
      'Marketing & Sales': 35000,
      'People Operations': 25000,
      'Operations': 30000,
      'Company-Wide': 100000,
    };

    const colorMap = {
      'Engineering & DevOps': '#6366F1',
      'Product & Design': '#8B5CF6',
      'Marketing & Sales': '#06B6D4',
      'People Operations': '#10B981',
      'Operations': '#F59E0B',
      'Company-Wide': '#3B82F6',
    };

    departments.forEach((dept) => {
      deptSpendMap[dept] = 0;
    });

    transactions.forEach((t) => {
      if (t.type === 'EXPENSE') {
        const dept = t.department || 'Operations';
        deptSpendMap[dept] = (deptSpendMap[dept] || 0) + Number(t.amount || 0);
      }
    });

    let chartList = Object.entries(deptSpendMap).map(([name, spend]) => ({
      name: name.replace(' & DevOps', '').replace(' & Design', '').replace(' & Sales', ''),
      fullName: name,
      spend,
      budget: defaultBudgetMap[name] || Math.max(spend * 1.2, 30000),
      color: colorMap[name] || '#64748B',
    }));

    if (selectedDeptChart !== 'ALL') {
      chartList = chartList.filter((c) =>
        c.fullName.toLowerCase().includes(selectedDeptChart.toLowerCase())
      );
    }

    return chartList.length > 0
      ? chartList
      : [{ name: 'Company-Wide', fullName: 'Company-Wide', spend: totalExpenses || 50000, budget: 100000, color: '#6366F1' }];
  }, [departments, transactions, selectedDeptChart, totalExpenses]);

  // Dynamic Category Spend Allocations
  const categoryAllocations = useMemo(() => {
    const total = totalExpenses || 1;
    return [
      { label: 'Payroll & Compensation', value: payrollTotal, color: 'bg-indigo-500', pct: Math.round((payrollTotal / total) * 100) },
      { label: 'Cloud & SaaS Infrastructure', value: infraTotal, color: 'bg-blue-500', pct: Math.round((infraTotal / total) * 100) },
      { label: 'Hardware & IT Equipment', value: hardwareTotal, color: 'bg-purple-500', pct: Math.round((hardwareTotal / total) * 100) },
      { label: 'Benefits & Health Perks', value: benefitsTotal, color: 'bg-emerald-500', pct: Math.round((benefitsTotal / total) * 100) },
      { label: 'Facilities & Operating Leases', value: facilitiesTotal, color: 'bg-amber-500', pct: Math.round((facilitiesTotal / total) * 100) },
      { label: 'Travel & Operations', value: operationsTotal, color: 'bg-rose-500', pct: Math.round((operationsTotal / total) * 100) },
    ].filter((c) => c.value > 0 || c.label.includes('Payroll') || c.label.includes('Cloud'));
  }, [totalExpenses, payrollTotal, infraTotal, hardwareTotal, benefitsTotal, facilitiesTotal, operationsTotal]);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'PAYROLL': return <CreditCard className="w-3.5 h-3.5" />;
      case 'INFRASTRUCTURE':
      case 'SAAS': return <Server className="w-3.5 h-3.5" />;
      case 'BENEFITS': return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'HARDWARE': return <Laptop className="w-3.5 h-3.5" />;
      case 'FACILITIES': return <Building className="w-3.5 h-3.5" />;
      case 'REVENUE': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'OPERATIONS': return <Briefcase className="w-3.5 h-3.5" />;
      default: return <Tag className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'PAYROLL': return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50';
      case 'INFRASTRUCTURE':
      case 'SAAS': return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/50';
      case 'BENEFITS': return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50';
      case 'HARDWARE': return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/50';
      case 'FACILITIES': return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50';
      case 'REVENUE': return 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/50';
      case 'OPERATIONS': return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const toggleSelectAll = () => {
    if (selectedTxnIds.length === paginatedTransactions.length && paginatedTransactions.length > 0) {
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

  return (
    <div className="space-y-7 font-sans text-slate-800 dark:text-slate-100 pb-16">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HEADER & FISCAL BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Financial Operations & General Ledger
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Synchronized</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {/* Dynamic Period Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <select
                value={fiscalPeriod}
                onChange={(e) => setFiscalPeriod(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold outline-none cursor-pointer text-xs"
              >
                <option value="ALL_TIME">All Fiscal Periods</option>
                <option value="Q3_2026">Q3 2026 (Jul - Sep)</option>
                <option value="AUGUST_2026">August 2026 (Current)</option>
              </select>
            </div>

            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>SOX & GAAP Compliant Ledger</span>
            </span>

            <button
              onClick={loadAccountsData}
              title="Refresh ledger data from backend"
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all hover:scale-102 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintAudit}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all hover:scale-102 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-500" />
            <span>Audit Sheet</span>
          </button>

          <button
            onClick={() => {
              setEditingTxn(null);
              setForm(initialForm);
              setIsRecordDrawerOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record Voucher</span>
          </button>
        </div>
      </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Monthly Spend */}
        <div className="relative overflow-hidden bg-white dark:bg-[#131B2E]/90 backdrop-blur-xl rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/70 dark:border-slate-800/80 group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-2xl pointer-events-none group-hover:bg-indigo-500/25 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Monthly Spend
            </span>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 group-hover:scale-110 transition-transform shadow-xs">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50">
                <TrendingUp className="w-3 h-3" />
                <span>+4.2% MoM</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">MTD Outflow</span>
            </div>
          </div>
        </div>

        {/* Card 2: Payroll Outflow */}
        <div className="relative overflow-hidden bg-white dark:bg-[#131B2E]/90 backdrop-blur-xl rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/70 dark:border-slate-800/80 group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-2xl pointer-events-none group-hover:bg-blue-500/25 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Payroll & Compensation
            </span>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 group-hover:scale-110 transition-transform shadow-xs">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              ${payrollTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/50">
                <span>{totalExpenses > 0 ? ((payrollTotal / totalExpenses) * 100).toFixed(0) : 0}% of OPEX</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">Live Payslips Sync</span>
            </div>
          </div>
        </div>

        {/* Card 3: Benefits & Wellness */}
        <div className="relative overflow-hidden bg-white dark:bg-[#131B2E]/90 backdrop-blur-xl rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/70 dark:border-slate-800/80 group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Benefits & Wellness
            </span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60 group-hover:scale-110 transition-transform shadow-xs">
              <HeartHandshake className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              ${benefitsTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200/60 dark:border-teal-800/50">
                <span>Healthcare & Perks</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">Tax Deductible</span>
            </div>
          </div>
        </div>

        {/* Card 4: Operating Runway & Net Cash */}
        <div className="relative overflow-hidden bg-white dark:bg-[#131B2E]/90 backdrop-blur-xl rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/70 dark:border-slate-800/80 group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-2xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Net Cash Runway
            </span>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60 group-hover:scale-110 transition-transform shadow-xs">
              <Building className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2">
              <span>18.4</span>
              <span className="text-base font-bold text-slate-400">Months</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/50">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Audited Ledger</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">${(totalExpenses / 1000).toFixed(0)}k/mo Burn</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC FINANCIAL ANALYTICS & RUNWAY GAUGES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Spend vs Budget Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#131B2E]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 shadow-sm border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Department Spend vs. Allocated Budget
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Live DB Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly departmental burn compared against target quarterly caps
              </p>
            </div>

            {/* Department Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                onClick={() => setSelectedDeptChart('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDeptChart === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              {departments.slice(0, 4).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDeptChart(d)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDeptChart === d
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {d.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentSpendData} margin={{ top: 15, right: 10, left: -10, bottom: 10 }}>
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name === 'spend' ? 'Current Spend' : 'Target Cap',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                />
                <Bar dataKey="spend" radius={[10, 10, 0, 0]}>
                  {departmentSpendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="budget" radius={[10, 10, 0, 0]} fill="#E2E8F0" opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" />
                <span>Actual Spend</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-300 dark:bg-slate-700 inline-block" />
                <span>Target Cap</span>
              </span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
              Total Tracked Outflow: ${totalExpenses.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cash Flow Gauge & Category Allocation Meter (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#131B2E]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 shadow-sm border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Cash Flow & Runway Health
              </h3>
              <span className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-xs text-slate-400">Liquidity & burn forecast ratio</p>
          </div>

          {/* Runway Progress Gauge */}
          <div className="relative flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  className="dark:stroke-slate-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray="251"
                  strokeDashoffset="35"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">95%</span>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Healthy Margin
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Runway</span>
                <div className="text-sm font-black text-slate-900 dark:text-white">18.4 Mo</div>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Net Monthly Burn</span>
                <div className="text-sm font-black text-rose-500">-${(totalExpenses / 1000).toFixed(0)}k</div>
              </div>
            </div>
          </div>

          {/* Allocation Progress Bars */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Spend Allocation by Category
            </span>
            <div className="space-y-2">
              {categoryAllocations.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      <span className="truncate max-w-[170px]">{cat.label}</span>
                    </span>
                    <span className="text-slate-900 dark:text-white font-extrabold">
                      ${(cat.value / 1000).toFixed(0)}k ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(4, cat.pct))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CORPORATE LEDGER DATA TABLE & LIVE CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#131B2E]/90 backdrop-blur-xl rounded-[32px] shadow-sm border border-slate-200/70 dark:border-slate-800/80 overflow-hidden space-y-4 p-6">
        {/* Controls Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 pb-2">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ledger by ID, reference, title, department, payment method..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PAYROLL', label: 'Payroll' },
              { id: 'INFRASTRUCTURE', label: 'SaaS Infra' },
              { id: 'BENEFITS', label: 'Benefits' },
              { id: 'HARDWARE', label: 'Hardware' },
              { id: 'FACILITIES', label: 'Facilities' },
              { id: 'OPERATIONS', label: 'Operations' },
              { id: 'REVENUE', label: 'Revenue' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Filter & Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending Audit</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Amount (High to Low)</option>
              <option value="amount_asc">Amount (Low to High)</option>
              <option value="title_asc">Title (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Batch Action Bar */}
        {selectedTxnIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold animate-in fade-in">
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
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/70 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTxnIds.length > 0 && selectedTxnIds.length === paginatedTransactions.length}
                    onChange={toggleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">Transaction / Reference</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4">Timestamp</th>
                <th className="py-4 px-4">Audit Status</th>
                <th className="py-4 px-4">Payment Method</th>
                <th className="py-4 px-4 text-right">Net Amount</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        No ledger vouchers match your filter.
                      </p>
                      <p className="text-xs text-slate-400">Try changing your search keywords or category filters.</p>
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
                      className={`hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTxn(t.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Transaction Title & Ref */}
                      <td className="py-4 px-4">
                        <div
                          onClick={() => setViewingTxn(t)}
                          className="flex items-center gap-3 cursor-pointer group/item"
                        >
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60'
                                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/60'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white max-w-xs sm:max-w-sm truncate group-hover/item:text-indigo-600 transition-colors">
                              {t.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span className="font-bold text-slate-500 dark:text-slate-300">{t.id}</span>
                              <span>•</span>
                              <span>Ref: {t.ref}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${getCategoryBadgeClass(
                            t.category
                          )}`}
                        >
                          {getCategoryIcon(t.category)}
                          <span>{t.category}</span>
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {t.department}
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        <div className="font-bold text-slate-700 dark:text-slate-200">{t.date}</div>
                        <div className="text-[10px] text-slate-400">{t.time || '12:00 EST'}</div>
                      </td>

                      {/* Audit Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleTxnStatus(t.id)}
                          title="Click to toggle audit status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all hover:scale-105 ${
                            t.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                          }`}
                        >
                          {t.status === 'VERIFIED' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-500" />
                          )}
                          <span>{t.status === 'VERIFIED' ? 'Verified' : 'Pending Audit'}</span>
                        </button>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <CreditCard className="w-3 h-3" />
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                            {t.paymentMethod || 'ACH Transfer'}
                          </span>
                        </div>
                      </td>

                      {/* Net Amount */}
                      <td
                        className={`py-4 px-4 text-right font-black text-sm ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : '-'}${Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingTxn(t)}
                            title="View Voucher Details"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => startEditTxn(t)}
                            title="Edit Voucher"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(t.id)}
                            title="Delete Voucher"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Table Footer & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{filteredTransactions.length}</span> recorded vouchers
            </span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value={5}>5 / page</option>
              <option value={8}>8 / page</option>
              <option value={15}>15 / page</option>
              <option value={30}>30 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                  currentPage === pageNum
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SLIDE-OVER DRAWER: RECORD / EDIT VOUCHER */}
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
                      {editingTxn ? 'Update existing journal entry' : 'Post new journal entry to corporate ledger'}
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
              <form id="record-voucher-form" onSubmit={handleRecordSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {/* Voucher Type */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Voucher Classification *
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
                        className={`py-2.5 px-3 rounded-2xl font-black text-xs border text-center transition-all cursor-pointer ${
                          form.voucherType === vt.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
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
                    Transaction Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud Infrastructure Billing August..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Amount (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none"
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
                      className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="INFRASTRUCTURE">SaaS & DevOps Infra</option>
                      <option value="PAYROLL">Payroll Disbursement</option>
                      <option value="BENEFITS">Benefits & Wellness</option>
                      <option value="HARDWARE">Hardware & IT</option>
                      <option value="FACILITIES">Facilities & Rent</option>
                      <option value="OPERATIONS">Operations & Travel</option>
                      <option value="REVENUE">Revenue Inflow</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Department Allocation *
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
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
                      className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none cursor-pointer"
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
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Audit Notes & Justification
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter details for the accounting & audit committee..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>

                {/* Tax Deduction Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-extrabold text-slate-800 dark:text-slate-200">Tax Deduction Eligible</div>
                    <div className="text-[10px] text-slate-400">Apply standard corporate tax offset</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.taxDeductible}
                      onChange={(e) => setForm({ ...form, taxDeductible: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Attachment Dropzone */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Receipt / Invoice Attachment
                  </label>
                  <div
                    onClick={() => showToast('Receipt document attached to voucher')}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-indigo-50/20 group"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mb-1.5">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-xs">Click to upload receipt or drag & drop</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Calculated Net Impact:</span>
                  <span className={`text-base font-black ${form.voucherType === 'revenue' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                    {form.voucherType === 'revenue' ? '+' : '-'}${parseFloat(form.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecordDrawerOpen(false);
                      setEditingTxn(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="record-voucher-form"
                    className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-600/25 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{editingTxn ? 'Save Changes' : 'Commit Voucher'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: VOUCHER AUDIT DETAILS VIEW */}
      {/* ========================================================================= */}
      {viewingTxn && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setViewingTxn(null)}
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131B2E] rounded-[32px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                      viewingTxn.type === 'INCOME'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/60'
                    }`}
                  >
                    {viewingTxn.type === 'INCOME' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{viewingTxn.id}</h3>
                    <p className="text-xs text-slate-400">Ref: {viewingTxn.ref}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingTxn(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Description</div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{viewingTxn.title}</div>
                  {viewingTxn.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{viewingTxn.notes}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Amount</div>
                    <div className={`text-base font-black ${viewingTxn.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                      {viewingTxn.type === 'INCOME' ? '+' : '-'}${Number(viewingTxn.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Department</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{viewingTxn.department}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Category</div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${getCategoryBadgeClass(viewingTxn.category)}`}>
                        {getCategoryIcon(viewingTxn.category)}
                        <span>{viewingTxn.category}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Audit Status</div>
                    <div className="mt-1">
                      <button
                        onClick={() => toggleTxnStatus(viewingTxn.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          viewingTxn.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {viewingTxn.status === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3 text-amber-500" />}
                        <span>{viewingTxn.status} (Click to toggle)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Payment Method</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{viewingTxn.paymentMethod || 'ACH Transfer'}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Date Logged</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{viewingTxn.date} {viewingTxn.time}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setDeleteConfirmId(viewingTxn.id)}
                  className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditTxn(viewingTxn)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setViewingTxn(null)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 cursor-pointer"
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
      {/* 7. CONFIRM DELETE MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131B2E] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Delete Voucher?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This transaction will be permanently removed from the corporate ledger.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTxn(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 cursor-pointer"
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
