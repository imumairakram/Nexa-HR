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
  Sparkles,
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
      showToast(`🎉 ${MONTH_NAMES[runMonth - 1]} ${runYear} Payroll Batch generated and recorded successfully!`);
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

      {/* STATS METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Latest Batch Disbursed</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ${(latestBatch?.netPayable || 0).toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Net All-Time</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ${totalNetDisbursedAllTime.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Tax Withheld YTD</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ${totalTaxWithheldAllTime.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Payslips Stored</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{payslips.length} Slips</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* HERO ACTIONS BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pay Run Engine: {MONTH_NAMES[runMonth - 1]} {runYear}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Generate & Disburse Monthly Payroll</h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl">
            Calculates base salary, allowances, biometric attendance deductions, and tax withholdings directly from PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsRunModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs shadow-lg cursor-pointer transition-all hover:scale-105"
          >
            Run Payroll Batch
          </button>
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
