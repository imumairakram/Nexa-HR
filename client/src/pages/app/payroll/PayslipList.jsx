import React, { useState, useEffect, useMemo } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../../components/common/SparkMetricCard';
import ModernSearchBarSection from '../../../components/common/ModernSearchBarSection';
import { TableSkeleton } from '../../../components/common/Skeleton';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  X,
  Printer,
  DollarSign,
  Building,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../../services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PayslipList = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('amount');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState('ALL');
  const [minAmount, setMinAmount] = useState(null);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadPayslips = async () => {
    setLoading(true);
    try {
      const res = await api.getPayslips();
      if (res?.success && res.data?.payslips) {
        const mapped = res.data.payslips.map((p) => ({
          id: `PSL-${p.year}-${String(p.month).padStart(2, '0')}-${p.user?.employeeCode || p.userId.slice(0, 4)}`,
          rawId: p.id,
          employee: `${p.user?.firstName || 'Staff'} ${p.user?.lastName || ''}`.trim() || 'Employee',
          code: p.user?.employeeCode || (p.userId ? `EMP-${p.userId.slice(0, 4).toUpperCase()}` : '-'),
          dept: p.user?.profile?.department?.name || 'General',
          month: `${MONTH_NAMES[p.month - 1]} ${p.year}`,
          gross: Number(p.grossSalary || 0),
          deductions: Number(p.taxDeductions || 0) + Number(p.otherDeductions || 0) + Number(p.unpaidLeaveDeduction || 0),
          net: Number(p.netSalary || 0),
          date: p.generatedAt ? new Date(p.generatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
          status: p.status || 'PAID',
        }));
        setPayslips(mapped);
      }
    } catch (err) {
      console.error('Failed to load payslips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, []);

  // Dynamic Sparkline Telemetry
  const disbursedSparkData = useMemo(() => {
    if (!payslips.length) return null;
    return payslips.slice(0, 7).reverse().map((p) => ({
      label: p.employee.split(' ')[0] || 'Staff',
      value: p.net,
    }));
  }, [payslips]);

  const taxSparkData = useMemo(() => {
    if (!payslips.length) return null;
    return payslips.slice(0, 7).reverse().map((p) => ({
      label: p.employee.split(' ')[0] || 'Staff',
      value: p.deductions,
    }));
  }, [payslips]);

  const vouchersSparkData = useMemo(() => {
    if (!payslips.length) return null;
    return payslips.slice(0, 7).map((_, idx) => ({
      label: `Voucher ${idx + 1}`,
      value: idx + 1,
    }));
  }, [payslips]);

  const avgSparkData = useMemo(() => {
    if (!payslips.length) return null;
    return payslips.slice(0, 7).map((p) => ({
      label: p.employee.split(' ')[0] || 'Staff',
      value: Math.round(p.net),
    }));
  }, [payslips]);

  const filtered = useMemo(() => {
    return payslips
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          p.employee.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.dept.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'ALL' ||
          (p.status && p.status.toUpperCase() === statusFilter.toUpperCase());

        const matchesDept = deptFilter === 'ALL' || p.dept === deptFilter;

        const matchesAmount = !minAmount || p.net >= minAmount;

        return matchesSearch && matchesStatus && matchesDept && matchesAmount;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortKey === 'amount') {
          diff = b.net - a.net;
        } else if (sortKey === 'gross') {
          diff = b.gross - a.gross;
        } else if (sortKey === 'employee') {
          diff = a.employee.localeCompare(b.employee);
        } else if (sortKey === 'date') {
          diff = new Date(b.date) - new Date(a.date);
        }
        return sortOrder === 'asc' ? -diff : diff;
      });
  }, [payslips, searchQuery, statusFilter, deptFilter, minAmount, sortKey, sortOrder]);

  const statusTabs = useMemo(() => {
    const paidCount = payslips.filter((p) => (p.status || '').toUpperCase() === 'PAID').length;
    const pendingCount = payslips.filter((p) => (p.status || '').toUpperCase() === 'PENDING').length;
    return [
      { key: 'ALL', label: 'All', count: payslips.length },
      { key: 'PAID', label: 'Paid', count: paidCount },
      { key: 'PENDING', label: 'Pending', count: pendingCount },
      { key: 'OVERDUE', label: 'Overdue', count: 0 },
      { key: 'DRAFT', label: 'Draft', count: 0 },
    ];
  }, [payslips]);

  const dateRangeOptions = [
    { key: 'ALL', label: 'All Cycles' },
    { key: 'THIS_MONTH', label: 'Oct 1 – Oct 31, 2026' },
    { key: 'LAST_MONTH', label: 'Sep 1 – Sep 30, 2026' },
    { key: 'THIS_YEAR', label: 'Fiscal Year 2026' },
  ];

  const dateRangeLabel = useMemo(() => {
    if (dateRange === 'THIS_MONTH') return 'Oct 1 – Oct 31, 2026';
    if (dateRange === 'LAST_MONTH') return 'Sep 1 – Sep 30, 2026';
    if (dateRange === 'THIS_YEAR') return 'Fiscal Year 2026';
    return 'All Cycles';
  }, [dateRange]);

  const sortOptions = [
    { key: 'amount', label: 'Amount' },
    { key: 'gross', label: 'Gross' },
    { key: 'date', label: 'Disbursed Date' },
    { key: 'employee', label: 'Staff Name' },
  ];

  const filterTags = useMemo(() => {
    const tags = [];
    if (minAmount) {
      tags.push({ key: 'amount', label: 'amount', value: `>${minAmount}` });
    }
    if (deptFilter !== 'ALL') {
      tags.push({ key: 'dept', label: 'dept', value: deptFilter });
    }
    return tags;
  }, [minAmount, deptFilter]);

  const filterCount = (minAmount ? 1 : 0) + (deptFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Employee Payslip Repository & PDF Invoicing"
        subtitle="Search and print official company payslips, verify tax withholding schedules, and export batch archives."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC PAYSLIPS HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Payslip Archive Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Employee Payslip Repository & PDF Invoicing
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Search and print official company payslips, verify tax withholding schedules, and export encrypted batch archives.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{payslips.length} Official Payslips Recorded</span>
              </span>
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>100% Disbursed Successfully</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Batch Export</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Download all monthly slips</div>
            </div>
            <button
              onClick={() => {
                setToastMsg('Exporting zip package containing all official PDF payslips...');
                setTimeout(() => setToastMsg(''), 3000);
              }}
              className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Batch Archive</span>
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
          title="Total Vouchers"
          value={payslips.length}
          unit={payslips.length === 1 ? 'Slip' : 'Slips'}
          badgeText="Current Cycle"
          badgeType="positive"
          badgeIcon="up"
          subtext="All Departments"
          chartColor="sky"
          presetWave="wave1"
          dataPoints={vouchersSparkData}
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Total Disbursed"
          value={`$${payslips.reduce((acc, p) => acc + p.net, 0).toLocaleString()}`}
          badgeText="100% Net Paid"
          badgeType="positive"
          badgeIcon="up"
          subtext="Direct Wire Settled"
          chartColor="emerald"
          presetWave="wave2"
          dataPoints={disbursedSparkData}
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Tax Withholdings"
          value={`$${payslips.reduce((acc, p) => acc + p.deductions, 0).toLocaleString()}`}
          badgeText="Statutory Filing"
          badgeType="warning"
          badgeIcon="dot"
          subtext="W-2 Deductions"
          chartColor="rose"
          presetWave="wave3"
          dataPoints={taxSparkData}
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Average Net Salary"
          value={`$${Math.round(payslips.reduce((acc, p) => acc + p.net, 0) / (payslips.length || 1)).toLocaleString()}`}
          badgeText="Per Employee"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Net Average Payout"
          chartColor="blue"
          presetWave="wave4"
          dataPoints={avgSparkData}
          loading={loading}
        />
      </div>

      {/* Modern Dynamic Search & Filter Section */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800">
        <ModernSearchBarSection
          statusTabs={statusTabs}
          activeStatus={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search payouts by employee name, code, or voucher..."
          searchHint='Try "status:overdue"'
          filterTags={filterTags}
          onRemoveTag={(key) => {
            if (key === 'amount') setMinAmount(null);
            if (key === 'dept') setDeptFilter('ALL');
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
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Minimum Net Payout
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[null, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt || 'any'}
                      type="button"
                      onClick={() => setMinAmount(amt)}
                      className={`px-2 py-1.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                        minAmount === amt
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-700'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      {amt ? `>${amt}` : 'Any'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Department
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['ALL', ...new Set(payslips.map((p) => p.dept))].map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setDeptFilter(dept)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer truncate ${
                        deptFilter === dept
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-700'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {filterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMinAmount(null);
                    setDeptFilter('ALL');
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-center"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          }
        />
      </div>

      {/* Payslips Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Mobile Responsive Grid View (Hidden on Desktop) */}
        <div className="block md:hidden p-3.5 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-blue-400/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{p.employee}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {p.code} • {p.dept}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold shrink-0">
                      
<span>{p.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500 font-medium">{p.month}</span>
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900/60 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      {p.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Gross</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        ${p.gross.toLocaleString()}
                      </div>
                    </div>
                    <div className="border-x border-slate-100 dark:border-slate-800">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Deduct</div>
                      <div className="text-xs font-bold text-rose-500 mt-0.5">
                        -${p.deductions.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Net</div>
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ${p.net.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSlip(p)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Slip</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Invoice Ref</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Pay Period</th>
                <th className="py-3.5 px-4">Gross Earnings</th>
                <th className="py-3.5 px-4">Tax Deductions</th>
                <th className="py-3.5 px-4">Net Salary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-[10px] font-bold text-slate-400">
                    {p.id}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                    <div>{p.employee}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.code} • {p.dept}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">{p.month}</td>
                  <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">${p.gross.toLocaleString()}</td>
                  <td className="py-4 px-4 font-medium text-rose-500">-${p.deductions.toLocaleString()}</td>
                  <td className="py-4 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    ${p.net.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                      
<span>{p.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedSlip(p)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal: Printable Payslip PDF Preview */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-sky-200/60 dark:border-sky-800/60 space-y-4 animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-start justify-between border-b border-sky-100/80 dark:border-sky-800/60 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{selectedSlip.id}</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Official Salary Statement
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                  NexaHR Enterprise Systems Inc.
                </p>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Employee</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSlip.employee}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{selectedSlip.code}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Disbursement Period</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSlip.month}</span>
                <span className="text-[10px] text-slate-400 block">{selectedSlip.date}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Gross Base Salary & Allowances:</span>
                <span className="font-bold text-slate-900 dark:text-white">${selectedSlip.gross.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Federal/State Tax & Benefits Deductions:</span>
                <span className="font-bold text-rose-500">-${selectedSlip.deductions.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between py-3 text-sm font-black bg-sky-50/80 dark:bg-sky-950/40 p-4 rounded-xl border border-sky-100 dark:border-sky-900/50">
                <span className="text-sky-900 dark:text-sky-200">Net Take-Home Pay (ACH Direct):</span>
                <span className="text-emerald-600 dark:text-emerald-400">${selectedSlip.net.toLocaleString()}.00</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print PDF</span>
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-6 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 cursor-pointer shadow-md shadow-sky-500/25 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipList;
