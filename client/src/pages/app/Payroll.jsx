import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Eye,
  Plus,
  X,
  Building,
  RefreshCw,
  Zap,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { TableSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Payroll = () => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useRegionalSettings();
  const [payslips, setPayslips] = useState(() => api.getCached('/payroll/payslips')?.data?.payslips || []);
  const [loading, setLoading] = useState(() => !api.hasCached('/payroll/payslips'));
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentDate = new Date();
  const [runMonth, setRunMonth] = useState(currentDate.getMonth() + 1);
  const [runYear, setRunYear] = useState(currentDate.getFullYear());

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchPayroll = async () => {
    if (!api.hasCached('/payroll/payslips')) {
      setLoading(true);
    }
    try {
      const res = await api.getPayslips();
      if (res && res.success && res.data?.payslips) {
        setPayslips(res.data.payslips);
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  // Group payslips into historical batches by (year, month)
  const batchMap = {};
  payslips.forEach((slip) => {
    const key = `${slip.year}-${slip.month}`;
    if (!batchMap[key]) {
      batchMap[key] = {
        id: `PR-${slip.year}-${String(slip.month).padStart(2, '0')}`,
        year: slip.year,
        monthNum: slip.month,
        month: `${MONTH_NAMES[slip.month - 1]} ${slip.year}`,
        employeesCount: 0,
        totalGross: 0,
        totalDeductions: 0,
        netPayable: 0,
        status: slip.status || 'PAID',
        payDate: slip.generatedAt ? formatDate(slip.generatedAt) : 'N/A',
      };
    }
    batchMap[key].employeesCount++;
    batchMap[key].totalGross += Number(slip.grossSalary || 0);
    batchMap[key].totalDeductions += Number(slip.taxDeductions || 0) + Number(slip.otherDeductions || 0) + Number(slip.unpaidLeaveDeduction || 0);
    batchMap[key].netPayable += Number(slip.netSalary || 0);
  });

  const history = Object.values(batchMap).sort((a, b) => b.year - a.year || b.monthNum - a.monthNum);

  // Overall Statistics from live data
  const totalNetDisbursedAllTime = history.reduce((acc, h) => acc + h.netPayable, 0);
  const totalTaxWithheldAllTime = history.reduce((acc, h) => acc + h.totalDeductions, 0);
  const latestBatch = history[0] || null;

  // Dynamic Sparkline Telemetry
  const latestBatchSparkData = React.useMemo(() => {
    if (!history.length) return null;
    return history.slice(0, 7).reverse().map((h) => ({
      label: h.month.split(' ')[0],
      value: h.netPayable,
    }));
  }, [history]);

  const totalNetSparkData = React.useMemo(() => {
    if (!history.length) return null;
    return history.slice(0, 7).reverse().map((h) => ({
      label: h.month.split(' ')[0],
      value: h.totalGross,
    }));
  }, [history]);

  const taxSparkData = React.useMemo(() => {
    if (!history.length) return null;
    return history.slice(0, 7).reverse().map((h) => ({
      label: h.month.split(' ')[0],
      value: h.totalDeductions,
    }));
  }, [history]);

  const payslipsSparkData = React.useMemo(() => {
    if (!history.length) return null;
    return history.slice(0, 7).reverse().map((h) => ({
      label: h.month.split(' ')[0],
      value: h.employeesCount,
    }));
  }, [history]);

  const handleRunPayroll = async () => {
    try {
      setSubmitting(true);
      await api.generatePayroll({ month: runMonth, year: runYear });
      await fetchPayroll();
      setIsRunModalOpen(false);
      showToast(`${MONTH_NAMES[runMonth - 1]} ${runYear} Payroll Batch generated and recorded successfully.`);
    } catch (err) {
      console.error('Failed to generate payroll:', err);
      showToast(err.message || 'Failed to generate payroll batch.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Global Payroll Processing & Auto-Tax Engine"
        subtitle="Automate salary disbursements, compute tax withholdings, manage allowances, and export payslips."
        onRefresh={fetchPayroll}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC PAYROLL HERO BANNER (BLUE-INDIGO LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] p-5 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Payroll Telemetry */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Global Payroll Processing & Auto-Tax Engine
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Calculates base salary, allowances, biometric attendance deductions, and progressive statutory tax withholdings directly from PostgreSQL.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold bg-sky-100/60 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800/60">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{formatCurrency(latestBatch?.netPayable || 0)} Latest Batch Disbursed</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <FileText className="w-3.5 h-3.5" />
                <span>{payslips.length} Payslips Stored</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card (Desktop / Tablet) */}
          <div className="hidden sm:flex bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Pay Run Generator</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Execute monthly disbursement</div>
            </div>
            <div className="flex flex-col w-full gap-2">
              <button
                onClick={() => setIsRunModalOpen(true)}
                className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Run Payroll Batch</span>
              </button>
              <Link
                to="/app/payroll/calculate"
                className="w-full px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all text-center"
              >
                <span>Tax Calculator</span>
              </Link>
            </div>
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="sm:hidden pt-1 flex items-center gap-2">
            <button
              onClick={() => setIsRunModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-extrabold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Run Payroll</span>
            </button>
            <Link
              to="/app/payroll/calculate"
              className="py-3 px-4 rounded-2xl bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center"
            >
              <span>Tax Calculator</span>
            </Link>
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
          title="Latest Batch Disbursed"
          value={formatCurrency(latestBatch?.netPayable || 0)}
          badgeText="Disbursed"
          badgeType="positive"
          badgeIcon="up"
          subtext="Net Pay Disbursed"
          chartColor="purple"
          presetWave="wave1"
          dataPoints={latestBatchSparkData}
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Total Net All-Time"
          value={formatCurrency(totalNetDisbursedAllTime)}
          badgeText="Cumulative Net"
          badgeType="positive"
          badgeIcon="up"
          subtext="Audited Payruns"
          chartColor="emerald"
          presetWave="wave2"
          dataPoints={totalNetSparkData}
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Tax Withheld YTD"
          value={formatCurrency(totalTaxWithheldAllTime)}
          badgeText="Statutory Filing"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Tax Compliant"
          chartColor="amber"
          presetWave="wave3"
          dataPoints={taxSparkData}
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Payslips Stored"
          value={payslips.length}
          unit={payslips.length === 1 ? 'Slip' : 'Slips'}
          badgeText="PDF Vouchers"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Encrypted Storage"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={payslipsSparkData}
          loading={loading}
        />
      </div>

      {/* HISTORICAL PAYRUNS TABLE */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Payroll Run History & Disbursements
            </h3>
            <p className="text-xs text-slate-400 font-medium">Historical batch pay records and tax statements</p>
          </div>

          <button
            onClick={() => navigate('/app/payroll/payslips')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 text-xs font-bold rounded-2xl transition-all cursor-pointer"
          >
            View All Individual Payslips
          </button>
        </div>

        {history.length > 0 ? (
          <>
            {/* Mobile Responsive Grid View (Hidden on Desktop) */}
            <div className="block md:hidden p-3.5 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {history.map((run) => (
                  <div
                    key={run.id}
                    className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">{run.month}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{run.id}</div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{run.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{run.payDate}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-800">
                          {run.employeesCount} Staff
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-400">Gross</div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            ${run.totalGross.toLocaleString()}
                          </div>
                        </div>
                        <div className="border-x border-slate-100 dark:border-slate-800">
                          <div className="text-[9px] uppercase font-bold text-slate-400">Tax</div>
                          <div className="text-xs font-bold text-rose-500 mt-0.5">
                            -${run.totalDeductions.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-400">Net</div>
                          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            ${run.netPayable.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/app/payroll/payslips')}
                      className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Inspect Slips
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
                    <th className="py-3.5 px-6">Pay Period Cycle</th>
                    <th className="py-3.5 px-4">Disbursement Date</th>
                    <th className="py-3.5 px-4">Payees</th>
                    <th className="py-3.5 px-4">Gross Salaries</th>
                    <th className="py-3.5 px-4">Tax Deductions</th>
                    <th className="py-3.5 px-4">Net Disbursed</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900 dark:text-white">{run.month}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{run.id}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">{run.payDate}</td>
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">{run.employeesCount} Staff</td>
                      <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(run.totalGross)}</td>
                      <td className="py-4 px-4 font-semibold text-rose-500">-{formatCurrency(run.totalDeductions)}</td>
                      <td className="py-4 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(run.netPayable)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{run.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate('/app/payroll/payslips')}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Inspect Slips
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Payroll Runs Generated Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click "Run Payroll Batch" above to execute salary disbursements and compute tax deductions for your onboarded employees.
            </p>
          </div>
        )}
      </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RUN PAYROLL BATCH (STITCH LUXURY DESIGN) */}
      {/* ========================================================================= */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-lg w-full shadow-2xl border border-blue-200/60 dark:border-blue-800/60 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-100/80 dark:border-sky-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/60 dark:via-sky-900/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 ring-4 ring-sky-500/15">
                  <Play className="w-5 h-5 fill-current stroke-none ml-0.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Execute Payroll Batch
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Process salary disbursements, tax computations, and automated payslip generation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRunModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto flex-1 p-6 sm:p-7 space-y-4 custom-scrollbar text-xs relative z-10">
              {/* Month & Year Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Target Pay Month <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={runMonth}
                    onChange={(e) => setRunMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Pay Year <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={runYear}
                    onChange={(e) => setRunYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Policy & Automation Notice Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-blue-100 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Automated Batch Computation</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                    {MONTH_NAMES[runMonth - 1]} {runYear} Cycle
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  Executing this payroll batch will automatically evaluate all active employee salary structures, calculate tax withholdings, deduct unpaid leaves from attendance records, and generate encrypted monthly payslips in PostgreSQL.
                </p>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsRunModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRunPayroll}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  )}
                  <span>Confirm & Generate Batch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
