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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EmployeePayslips = () => {
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
  const totalNetAllTime = payslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);
  const totalDeductionsAllTime = payslips.reduce((acc, p) => acc + (p.taxDeductions || 0) + (p.otherDeductions || 0) + (p.unpaidLeaveDeduction || 0), 0);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Payslips & Compensation"
        subtitle="View corporate salary disbursements, monthly pay vouchers, and tax deductions."
        onRefresh={fetchMyPayslips}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* COMPENSATION OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Latest Gross Salary</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ${(latestSlip?.grossSalary || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            {latestSlip ? `${MONTH_NAMES[latestSlip.month - 1]} ${latestSlip.year}` : 'No cycle yet'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Latest Net Take-Home</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ${(latestSlip?.netSalary || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Direct Bank Deposit</div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Total Deductions All-Time</div>
          <div className="text-2xl font-black text-rose-500">
            ${totalDeductionsAllTime.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Tax & Leave Deductions</div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Total Net Disbursed</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            ${totalNetAllTime.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">{payslips.length} Payslips Issued</div>
        </div>
      </div>

      {/* PAYSLIPS LIST TABLE */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Salary Disbursal History
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Inspect authentic corporate salary vouchers and view deductions
          </p>
        </div>

        {payslips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Pay Period</th>
                  <th className="py-3.5 px-4">Pay Date</th>
                  <th className="py-3.5 px-4">Gross Payout</th>
                  <th className="py-3.5 px-4">Deductions</th>
                  <th className="py-3.5 px-4">Net Payout</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {payslips.map((ps) => {
                  const totalDed = (ps.taxDeductions || 0) + (ps.otherDeductions || 0) + (ps.unpaidLeaveDeduction || 0);
                  const payMonthStr = `${MONTH_NAMES[(ps.month || 1) - 1]} ${ps.year}`;
                  const payDateStr = ps.generatedAt ? new Date(ps.generatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A';

                  return (
                    <tr key={ps.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                        <div>{payMonthStr}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {ps.id.slice(0, 8)}...</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {payDateStr}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ${(ps.grossSalary || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-rose-500 font-bold">
                        -${totalDed.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        ${(ps.netSalary || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{ps.status || 'PAID'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPayslip(ps)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="View Full Payslip"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleDownload(ps)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                            title="Download PDF"
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
              Your payslip vouchers will automatically appear here as soon as monthly payroll runs are processed by HR.
            </p>
          </div>
        )}
      </div>

      {/* DETAILED VOUCHER MODAL */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">
                    Payslip Voucher — {MONTH_NAMES[(selectedPayslip.month || 1) - 1]} {selectedPayslip.year}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Encrypted Receipt #{selectedPayslip.id.slice(0, 12)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block uppercase text-[10px]">
                  Earnings & Allowances
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Basic Base Salary:</span>
                  <span className="font-bold">${(selectedPayslip.basicSalary || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Allowances:</span>
                  <span className="font-bold">${(selectedPayslip.totalAllowances || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/50 flex justify-between font-extrabold text-emerald-700 dark:text-emerald-400">
                  <span>Gross Pay:</span>
                  <span>${(selectedPayslip.grossSalary || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-2">
                <span className="font-extrabold text-rose-800 dark:text-rose-300 block uppercase text-[10px]">
                  Withholdings & Deductions
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Income Tax (TDS):</span>
                  <span className="font-bold text-rose-600">-${(selectedPayslip.taxDeductions || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unpaid Leaves ({selectedPayslip.unpaidLeaveDays || 0}d):</span>
                  <span className="font-bold text-rose-600">-${(selectedPayslip.unpaidLeaveDeduction || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-rose-200/50 flex justify-between font-extrabold text-rose-700 dark:text-rose-400">
                  <span>Total Deductions:</span>
                  <span>
                    -${((selectedPayslip.taxDeductions || 0) + (selectedPayslip.unpaidLeaveDeduction || 0) + (selectedPayslip.otherDeductions || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Amount Deposited</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  ${(selectedPayslip.netSalary || 0).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayslips;
