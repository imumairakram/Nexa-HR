import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Banknote,
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
  Clock,
  ChevronDown,
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
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [indUserId, setIndUserId] = useState('');
  const [indMonth, setIndMonth] = useState(new Date().getMonth() + 1);
  const [indYear, setIndYear] = useState(new Date().getFullYear());
  const [indSubmitting, setIndSubmitting] = useState(false);
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

  const openIndividualModal = async () => {
    setIsIndividualModalOpen(true);
    try {
      const res = await api.getEmployees();
      const list = res?.data?.employees || [];
      setEmployeesList(list);
      if (list.length > 0 && !indUserId) {
        setIndUserId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load employees for individual payslip:', err);
    }
  };

  const handleRunIndividualPayslip = async () => {
    if (!indUserId) {
      showToast('Please select an employee.');
      return;
    }
    try {
      setIndSubmitting(true);
      await api.generatePayroll({ month: indMonth, year: indYear, userId: indUserId });
      await fetchPayroll();
      setIsIndividualModalOpen(false);
      showToast(`${MONTH_NAMES[indMonth - 1]} ${indYear} individual payslip generated successfully.`);
    } catch (err) {
      console.error('Failed to generate individual payslip:', err);
      showToast(err.message || 'Failed to generate individual payslip.');
    } finally {
      setIndSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Global Payroll Processing"
        subtitle="Automate salary disbursements, compute tax withholdings, manage allowances, and export payslips."
        onRefresh={fetchPayroll}
        loading={loading}
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
      {/* 1. DYNAMIC PAYROLL HERO BANNER (BLUE-INDIGO LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-5 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Payroll Telemetry */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
              Global Payroll Processing & Auto-Tax Engine
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-lg font-medium">
              Calculates base salary, allowances, biometric attendance deductions, and progressive statutory tax withholdings directly from PostgreSQL.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{formatCurrency(latestBatch?.netPayable || 0)} Latest Batch Disbursed</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{latestBatch ? `${latestBatch.employeesCount} Staff Disbursed` : '0 Staff Disbursed'}</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{payslips.length} Total Payslips Generated</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card (Desktop / Tablet) */}
          <div className="hidden sm:flex bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <Banknote className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Pay Run Generator</div>
              <div className="text-[11px] text-white/80 mt-0.5">Execute monthly disbursement</div>
            </div>
            <div className="flex flex-col w-full gap-2">
              <button
                onClick={() => setIsRunModalOpen(true)}
                className="w-full px-5 py-2.5 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] dark:text-white font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Run Payroll Batch</span>
              </button>
            </div>
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="sm:hidden pt-1 flex items-center gap-2">
            <button
              onClick={() => setIsRunModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] dark:text-white font-extrabold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Run Payroll</span>
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

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={openIndividualModal}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-[12px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Individual Payslip</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/payroll/payslips')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 text-xs font-bold rounded-[12px] transition-all cursor-pointer"
            >
              View All Individual Payslips
            </button>
          </div>
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[12px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold shrink-0">
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
                            PKR {run.totalGross.toLocaleString()}
                          </div>
                        </div>
                        <div className="border-x border-slate-100 dark:border-slate-800">
                          <div className="text-[9px] uppercase font-bold text-slate-400">Tax</div>
                          <div className="text-xs font-bold text-rose-500 mt-0.5">
                            -PKR {run.totalDeductions.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-400">Net</div>
                          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            PKR {run.netPayable.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/app/payroll/payslips')}
                      className="w-full py-2 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
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
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {run.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate('/app/payroll/payslips')}
                          className="px-3.5 py-1.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
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
          <div className="p-12 sm:p-16 text-center space-y-5">
            <div className="relative inline-flex">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500/10 via-sky-500/15 to-sky-500/20 dark:from-sky-500/20 dark:via-sky-500/20 dark:to-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/70 dark:border-sky-700/50 shadow-xl shadow-sky-500/10">
                <CreditCard className="w-10 h-10 stroke-[1.6]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                No Payroll Runs Generated Yet
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Execute enterprise salary disbursements, automated tax deductions, and provident fund allocations for all active staff members with 1-click batch processing.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsRunModalOpen(true)}
                className="px-6 py-3 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-700 hover:to-sky-700 text-white font-extrabold text-xs shadow-lg shadow-sky-600/25 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Run Payroll Batch</span>
              </button>
            </div>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Automated Tax Withholding</span>
              </span>
              <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Batch Direct Bank Transfer</span>
              </span>
              <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span>Cryptographic Voucher Verification</span>
              </span>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RUN PAYROLL BATCH (NEW TICKET CARD UI DESIGN) */}
      {/* ========================================================================= */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-xl sm:max-w-2xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                  <Play className="w-6 h-6 stroke-[2.2] fill-current ml-0.5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Execute Payroll Batch
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Process salary disbursements, tax computations, and automated payslip generation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRunModalOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Row 1: Target Month & Year Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-sky-500" />
                    Target Pay Month <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={runMonth}
                      onChange={(e) => setRunMonth(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner appearance-none pr-10"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    Pay Year <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={runYear}
                    onChange={(e) => setRunYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Policy & Automation Notice Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-slate-50 dark:from-sky-950/40 dark:via-slate-800/60 dark:to-slate-900/60 border border-sky-100 dark:border-sky-900/40 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span>Automated Batch Computation</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 shadow-2xs">
                    {MONTH_NAMES[runMonth - 1]} {runYear} Cycle
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                  Executing this payroll batch will automatically evaluate all active employee salary structures, calculate tax withholdings, deduct unpaid leaves from attendance records, and generate encrypted monthly payslips in PostgreSQL.
                </p>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Automated calculation & audit ledgering</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsRunModalOpen(false)}
                    className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRunPayroll}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating Batch...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                        <span>Confirm & Generate Batch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE INDIVIDUAL PAYSLIP MODAL */}
      {isIndividualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-md shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Generate Individual Payslip
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generate or refresh a single employee&apos;s monthly payslip.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIndividualModalOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={indUserId}
                    onChange={(e) => setIndUserId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 appearance-none pr-10"
                  >
                    {employeesList.length === 0 && <option value="">Loading employees...</option>}
                    {employeesList.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                    Target Pay Month <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={indMonth}
                      onChange={(e) => setIndMonth(parseInt(e.target.value, 10))}
                      className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 appearance-none pr-10"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                    Pay Year <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={indYear}
                    onChange={(e) => setIndYear(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIndividualModalOpen(false)}
                  className="px-4 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRunIndividualPayslip}
                  disabled={indSubmitting || !indUserId}
                  className="px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {indSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                      <span>Generate Payslip</span>
                    </>
                  )}
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
