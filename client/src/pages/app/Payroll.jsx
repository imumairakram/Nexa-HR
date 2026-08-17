import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Payroll = () => {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
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
        payDate: slip.generatedAt ? new Date(slip.generatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
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
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-blue-200/70 dark:border-blue-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Payroll Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-extrabold border border-blue-600/20 dark:border-blue-500/30">
                <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Pay Run Engine: {MONTH_NAMES[runMonth - 1]} {runYear}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-600/20 dark:border-indigo-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Direct Bank Wire Ready</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Global Payroll Processing & Auto-Tax Engine
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Calculates base salary, allowances, biometric attendance deductions, and progressive statutory tax withholdings directly from PostgreSQL.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${(latestBatch?.netPayable || 0).toLocaleString()} Latest Batch Disbursed</span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <FileText className="w-3.5 h-3.5" />
                <span>{payslips.length} Payslips Stored</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-blue-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Pay Run Generator</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Execute monthly disbursement</div>
            </div>
            <div className="flex flex-col w-full gap-2">
              <button
                onClick={() => setIsRunModalOpen(true)}
                className="w-full px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Latest Batch Disbursed</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${(latestBatch?.netPayable || 0).toLocaleString()}
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Disbursed Successfully</span>
              <span className="text-slate-400">Net Pay</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Net All-Time</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              ${totalNetDisbursedAllTime.toLocaleString()}
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Cumulative Net</span>
              <span className="text-slate-400">Audited</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Tax Withheld YTD</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              ${totalTaxWithheldAllTime.toLocaleString()}
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Statutory Filing</span>
              <span className="text-slate-400">Compliant</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Payslips Stored</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              {payslips.length} <span className="text-base font-bold text-slate-400">Slips</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">PDF Vouchers</span>
              <span className="text-slate-400">Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORICAL PAYRUNS TABLE */}
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
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-bold rounded-2xl transition-all cursor-pointer"
          >
            View All Individual Payslips
          </button>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
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
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">${run.totalGross.toLocaleString()}</td>
                    <td className="py-4 px-4 font-semibold text-rose-500">-${run.totalDeductions.toLocaleString()}</td>
                    <td className="py-4 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ${run.netPayable.toLocaleString()}
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
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Inspect Slips
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* MODAL: RUN PAYROLL BATCH */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Execute {MONTH_NAMES[runMonth - 1]} {runYear} Pay Run
                </h3>
              </div>
              <button
                onClick={() => setIsRunModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Pay Month</label>
                  <select
                    value={runMonth}
                    onChange={(e) => setRunMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Pay Year</label>
                  <input
                    type="number"
                    value={runYear}
                    onChange={(e) => setRunYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  Executing this payroll batch will automatically evaluate all active employee salary structures, calculate tax withholdings, deduct unpaid leaves from attendance records, and generate encrypted monthly payslips in PostgreSQL.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsRunModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRunPayroll}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm & Generate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
