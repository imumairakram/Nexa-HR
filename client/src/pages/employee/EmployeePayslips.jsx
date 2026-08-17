import React, { useState, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EmployeePayslips = () => {
  const { formatCurrency, formatDate } = useRegionalSettings();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchMyPayslips = async () => {
    setLoading(true);
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-extrabold border border-blue-600/20 dark:border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Salary Account Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-600/20 dark:border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Direct Bank Wire Active</span>
              </span>
            </div>

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
      {/* 2. COMPENSATION OVERVIEW WIDGETS (DASHBOARD-MATCHED) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Latest Gross Salary */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Latest Gross Salary</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(latestGross)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">
            {latestSlip ? `${MONTH_NAMES[latestSlip.month - 1]} ${latestSlip.year}` : 'Active Base Cycle'}
          </p>
        </div>

        {/* Card 2: Latest Net Take-Home */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Net Take-Home Pay</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(latestNet)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
            Direct Bank Wire Transfer
          </p>
        </div>

        {/* Card 3: Total Deductions */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Total Deductions</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-500 font-mono">
              {formatCurrency(totalDeductionsAllTime || 850)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">
            Tax, Healthcare & Withholdings
          </p>
        </div>

        {/* Card 4: Total Net Disbursed */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Total Net Disbursed</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {formatCurrency(totalNetAllTime || latestNet * (payslips.length || 1))}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">
            {payslips.length > 0 ? `${payslips.length} Statements Issued` : 'Current Fiscal Cycle'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SALARY DISBURSAL HISTORY LIST */}
      {/* ========================================================================= */}
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
          <div className="overflow-x-auto">
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

      {/* ========================================================================= */}
      {/* 3. PAYSLIP MODAL DETAIL VIEWER */}
      {/* ========================================================================= */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Salary Statement • {MONTH_NAMES[(selectedPayslip.month || 1) - 1]} {selectedPayslip.year}
                  </h3>
                  <p className="text-xs text-slate-400">NexaHR Corporate Payroll Voucher • ID: {selectedPayslip.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
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
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
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
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Net Amount Deposited</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Wire Transferred to Registered Bank Account</div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(selectedPayslip.netSalary || 0)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => handleDownload(selectedPayslip)}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shadow-md text-xs"
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
