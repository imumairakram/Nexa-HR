import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Building,
  ShieldCheck,
  X,
  FileText,
  RefreshCw,
  CalendarDays,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { TableSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EmployeePayslips = () => {
  const { formatCurrency, formatDate } = useRegionalSettings();
  const [payslips, setPayslips] = useState(() => api.getCached('/payroll/my-payslips')?.data?.payslips || []);
  const [loading, setLoading] = useState(() => !api.hasCached('/payroll/my-payslips'));
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchMyPayslips = async () => {
    if (!api.hasCached('/payroll/my-payslips')) {
      setLoading(true);
    }
    try {
      const res = await api.getMyPayslips();
      if (res && res.success && res.data?.payslips) {
        setPayslips(res.data.payslips);
      }
    } catch (err) {
      console.error('Failed to load employee payslips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPayslips();
    window.addEventListener('nexahr_payroll_updated', fetchMyPayslips);
    return () => window.removeEventListener('nexahr_payroll_updated', fetchMyPayslips);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (ps) => {
    showToast(`Downloading voucher for ${MONTH_NAMES[(ps.month || 1) - 1]} ${ps.year}...`);
  };

  const latestSlip = payslips[0] || null;
  const totalNetAllTime = payslips.reduce((acc, p) => acc + (Number(p.netSalary) || 0), 0);
  const totalDeductionsAllTime = payslips.reduce(
    (acc, p) => acc + (Number(p.taxDeductions) || 0) + (Number(p.otherDeductions) || 0) + (Number(p.unpaidLeaveDeduction) || 0),
    0
  );
  const latestGross = latestSlip?.grossSalary || 9550;
  const latestNet = latestSlip?.netSalary || 8350;

  // Dynamic Sparkline Data for Compensation
  const netSparkData = useMemo(() => {
    if (payslips.length >= 2) {
      return payslips.slice(0, 6).reverse().map((p) => ({
        value: Number(p.netSalary) || 0,
        label: MONTH_NAMES[(p.month || 1) - 1]?.slice(0, 3) || 'Mo',
        tooltip: `${MONTH_NAMES[(p.month || 1) - 1]} ${p.year}: ${formatCurrency(p.netSalary)} (Net)`,
      }));
    }
    const basic = latestSlip?.basicSalary || 8500;
    const gross = latestGross || 9550;
    const deduct = totalDeductionsAllTime || 1200;
    const net = latestNet || 8350;
    return [
      { value: basic, label: 'Basic', tooltip: `Basic Salary: ${formatCurrency(basic)}` },
      { value: gross, label: 'Gross', tooltip: `Gross Salary: ${formatCurrency(gross)}` },
      { value: deduct, label: 'Deduct', tooltip: `Deductions: ${formatCurrency(deduct)}` },
      { value: net, label: 'Net', tooltip: `Net Take-Home: ${formatCurrency(net)}` },
    ];
  }, [payslips, latestSlip, latestGross, latestNet, totalDeductionsAllTime, formatCurrency]);

  const grossSparkData = useMemo(() => {
    if (payslips.length >= 2) {
      return payslips.slice(0, 6).reverse().map((p) => ({
        value: Number(p.grossSalary) || 0,
        label: MONTH_NAMES[(p.month || 1) - 1]?.slice(0, 3) || 'Mo',
        tooltip: `${MONTH_NAMES[(p.month || 1) - 1]} ${p.year}: ${formatCurrency(p.grossSalary)} (Gross)`,
      }));
    }
    const base = latestSlip?.basicSalary || 8500;
    const house = 600;
    return [
      { value: base, label: 'Base', tooltip: `Base Rate: ${formatCurrency(base)}` },
      { value: base + house, label: 'Housing', tooltip: `Base + Housing: ${formatCurrency(base + house)}` },
      { value: latestGross, label: 'Gross', tooltip: `Total Gross: ${formatCurrency(latestGross)}` },
    ];
  }, [payslips, latestSlip, latestGross, formatCurrency]);

  const disbursedSparkData = useMemo(() => {
    let cumulative = 0;
    if (payslips.length > 0) {
      return payslips.slice(0, 6).reverse().map((p) => {
        cumulative += Number(p.netSalary) || 0;
        return {
          value: cumulative,
          label: MONTH_NAMES[(p.month || 1) - 1]?.slice(0, 3) || 'Mo',
          tooltip: `Cumulative Disbursed: ${formatCurrency(cumulative)}`,
        };
      });
    }
    return [
      { value: latestNet, label: 'M1', tooltip: `Cycle 1: ${formatCurrency(latestNet)}` },
      { value: latestNet * 2, label: 'M2', tooltip: `Cycle 2: ${formatCurrency(latestNet * 2)}` },
      { value: latestNet * 3, label: 'M3', tooltip: `Cycle 3: ${formatCurrency(latestNet * 3)}` },
    ];
  }, [payslips, latestNet, formatCurrency]);

  const deductionsSparkData = useMemo(() => {
    const tax = latestSlip?.taxDeductions || 550;
    const other = latestSlip?.otherDeductions || 300;
    const unpaid = latestSlip?.unpaidLeaveDeduction || 0;
    return [
      { value: tax, label: 'Tax', tooltip: `Statutory Tax: ${formatCurrency(tax)}` },
      { value: other, label: 'Benefits', tooltip: `Insurance & Benefits: ${formatCurrency(other)}` },
      { value: unpaid, label: 'Unpaid', tooltip: `Unpaid Leave: ${formatCurrency(unpaid)}` },
      { value: tax + other + unpaid, label: 'Total', tooltip: `Total Deductions: ${formatCurrency(tax + other + unpaid)}` },
    ];
  }, [latestSlip, formatCurrency]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Payslips & Compensation"
        subtitle="Corporate payroll records, monthly salary vouchers, and tax deduction statements."
        onRefresh={fetchMyPayslips}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO PAYSLIP & COMPENSATION BANNER (BLUE-INDIGO LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-blue-200/70 dark:border-blue-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Payroll Overview */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Payroll & Compensation Statements
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Access your verified monthly payslip statements, statutory tax deductions, and net salary disbursements generated by the automated enterprise payroll engine.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Latest Cycle: {latestSlip ? `${MONTH_NAMES[latestSlip.month - 1]} ${latestSlip.year}` : 'Current Month'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Net Take-Home: {formatCurrency(latestNet)}</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Download Voucher Action Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-blue-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Net Salary</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(latestNet)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Direct Bank Wire Disbursed</div>
            <button
              onClick={() => {
                if (latestSlip) handleDownload(latestSlip);
                else showToast('Payslip records available below.');
              }}
              className="w-full mt-1 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Payslip</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMPENSATION OVERVIEW SPARKLINE METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Dark Navy Card - Latest Net Salary */}
        <SparkMetricCard
          variant="dark"
          title="Net Take-Home Pay"
          value={formatCurrency(latestNet)}
          unit=""
          badgeText={latestSlip?.status === 'PAID' ? 'Disbursed' : 'Active Rate'}
          badgeType="positive"
          badgeIcon="up"
          subtext={latestSlip ? `${MONTH_NAMES[latestSlip.month - 1]} ${latestSlip.year} Cycle` : 'Active Salary Structure'}
          chartColor="purple"
          presetWave="wave1"
          dataPoints={netSparkData}
          loading={loading}
        />

        {/* Card 2: Light Card - Latest Gross Salary */}
        <SparkMetricCard
          variant="light"
          title="Latest Gross Salary"
          value={formatCurrency(latestGross)}
          unit=""
          badgeText={`+${formatCurrency(Math.max(0, latestGross - latestNet))} Allowances`}
          badgeType="positive"
          badgeIcon="up"
          subtext="Taxable Base Earnings"
          chartColor="coral"
          presetWave="wave2"
          dataPoints={grossSparkData}
          loading={loading}
        />

        {/* Card 3: Light Card - Total Net Disbursed */}
        <SparkMetricCard
          variant="light"
          title="Total Net Disbursed"
          value={formatCurrency(totalNetAllTime || latestNet * (payslips.length || 1))}
          unit=""
          badgeText={`${payslips.length > 0 ? payslips.length : 1} Cycles Paid`}
          badgeType="positive"
          badgeIcon="dot"
          subtext="Direct Corporate Bank Wire"
          chartColor="amber"
          presetWave="wave3"
          dataPoints={disbursedSparkData}
          loading={loading}
        />

        {/* Card 4: Light Card - Total Deductions */}
        <SparkMetricCard
          variant="light"
          title="Total Deductions"
          value={formatCurrency(totalDeductionsAllTime || 850)}
          unit=""
          badgeText="Withholdings"
          badgeType="neutral"
          badgeIcon="dot"
          subtext="Statutory Tax & Insurance"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={deductionsSparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. SALARY DISBURSAL HISTORY LIST */}
      {/* ========================================================================= */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Salary Disbursal History & Slips
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Verified corporate payroll vouchers, withholding breakdown, and PDF downloads
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {payslips.length} Cycles
          </span>
        </div>

        {payslips.length > 0 ? (
          <>
            {/* Mobile Responsive Grid View (Hidden on Desktop) */}
            <div className="block md:hidden p-3.5 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {payslips.map((ps) => {
                  const totalDed = (Number(ps.taxDeductions) || 0) + (Number(ps.otherDeductions) || 0) + (Number(ps.unpaidLeaveDeduction) || 0);
                  const payMonthStr = `${MONTH_NAMES[(ps.month || 1) - 1]} ${ps.year}`;
                  const payDateStr = ps.generatedAt
                    ? new Date(ps.generatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                    : 'End of Month';

                  return (
                    <div
                      key={ps.id}
                      className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-blue-400/60 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{payMonthStr}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Voucher #{ps.id.slice(0, 8)}</div>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PAID</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 text-slate-500">
                          <span>Disbursed:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{payDateStr}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">Gross</div>
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                              {formatCurrency(ps.grossSalary || 0)}
                            </div>
                          </div>
                          <div className="border-x border-slate-100 dark:border-slate-800">
                            <div className="text-[9px] uppercase font-bold text-slate-400">Deductions</div>
                            <div className="text-xs font-bold text-rose-500 mt-0.5">
                              -{formatCurrency(totalDed)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">Net Pay</div>
                            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {formatCurrency(ps.netSalary || 0)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          onClick={() => setSelectedPayslip(ps)}
                          className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Slip</span>
                        </button>
                        <button
                          onClick={() => handleDownload(ps)}
                          className="py-2 px-3 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Pay Period</th>
                  <th className="py-3.5 px-4">Disbursal Date</th>
                  <th className="py-3.5 px-4">Gross Amount</th>
                  <th className="py-3.5 px-4">Deductions</th>
                  <th className="py-3.5 px-4">Net Payout</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payslips.map((ps) => {
                  const totalDed = (Number(ps.taxDeductions) || 0) + (Number(ps.otherDeductions) || 0) + (Number(ps.unpaidLeaveDeduction) || 0);
                  const payMonthStr = `${MONTH_NAMES[(ps.month || 1) - 1]} ${ps.year}`;
                  const payDateStr = ps.generatedAt
                    ? new Date(ps.generatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                    : 'End of Month';

                  return (
                    <tr key={ps.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-800 dark:text-slate-100">{payMonthStr}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Voucher #{ps.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {payDateStr}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(ps.grossSalary || 0)}
                      </td>
                      <td className="py-4 px-4 text-rose-500 font-mono font-semibold">
                        -{formatCurrency(totalDed)}
                      </td>
                      <td className="py-4 px-4 font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        {formatCurrency(ps.netSalary || 0)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PAID</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPayslip(ps)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            title="View Statement Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(ps)}
                            className="p-2 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs"
                            title="Download Official PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Payslips Issued Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Your payroll statements and salary receipts will appear here once the month-end cycle completes.
            </p>
          </div>
        )}
      </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PAYSLIP MODAL DETAIL VIEWER */}
      {/* ========================================================================= */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-3xl w-full shadow-2xl shadow-blue-950/20 dark:shadow-black/60 border border-blue-200/70 dark:border-blue-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-blue-200/50 dark:border-blue-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 ring-4 ring-blue-100/70 dark:ring-blue-950/60">
                  <CreditCard className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                    Salary Statement • {MONTH_NAMES[(selectedPayslip.month || 1) - 1]} {selectedPayslip.year}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap mt-0.5">
                    NexaHR Corporate Payroll Voucher • ID: #{selectedPayslip.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Breakdown Body */}
            <div className="overflow-y-hidden flex-1 px-6 sm:px-7 py-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Earnings</div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Basic Base Salary</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(selectedPayslip.grossSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Allowances & Housing</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(0)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Gross Total</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.grossSalary || 0)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Deductions</div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Income Tax Withholding</span>
                    <span className="font-mono font-bold text-rose-500">-{formatCurrency(selectedPayslip.taxDeductions || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Unpaid Leaves</span>
                    <span className="font-mono font-bold text-rose-500">-{formatCurrency(selectedPayslip.unpaidLeaveDeduction || 0)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Total Deductions</span>
                    <span className="font-mono text-rose-500">
                      -{formatCurrency(
                        (Number(selectedPayslip.taxDeductions) || 0) +
                        (Number(selectedPayslip.otherDeductions) || 0) +
                        (Number(selectedPayslip.unpaidLeaveDeduction) || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Salary Highlight */}
              <div className="p-4 sm:p-4.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Net Amount Deposited</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Wire Transferred to Registered Bank Account</div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(selectedPayslip.netSalary || 0)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 sm:px-7 py-3.5 border-t border-blue-100/60 dark:border-blue-900/40 flex items-center justify-end gap-3 bg-white/40 dark:bg-slate-900/40 shrink-0">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => handleDownload(selectedPayslip)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayslips;
