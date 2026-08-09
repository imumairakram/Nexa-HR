import React, { useState } from 'react';
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
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';

const PAYROLL_HISTORY = [
  { id: 'PR-2026-07', month: 'July 2026', employeesCount: 158, totalGross: 245000, totalDeductions: 46500, netPayable: 198500, status: 'PAID', payDate: 'Jul 31, 2026' },
  { id: 'PR-2026-06', month: 'June 2026', employeesCount: 155, totalGross: 240000, totalDeductions: 45600, netPayable: 194400, status: 'PAID', payDate: 'Jun 30, 2026' },
  { id: 'PR-2026-05', month: 'May 2026', employeesCount: 152, totalGross: 236000, totalDeductions: 44800, netPayable: 191200, status: 'PAID', payDate: 'May 31, 2026' },
  { id: 'PR-2026-04', month: 'April 2026', employeesCount: 148, totalGross: 230000, totalDeductions: 43700, netPayable: 186300, status: 'PAID', payDate: 'Apr 30, 2026' },
];

const Payroll = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(PAYROLL_HISTORY);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleRunPayroll = () => {
    const newRun = {
      id: `PR-2026-08`,
      month: 'August 2026',
      employeesCount: 160,
      totalGross: 250000,
      totalDeductions: 47500,
      netPayable: 202500,
      status: 'PAID',
      payDate: 'Aug 31, 2026',
    };
    setHistory([newRun, ...history]);
    setIsRunModalOpen(false);
    setToastMsg('August 2026 Payroll Batch generated and disbursed successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Global Payroll Processing & Auto-Tax Engine"
        subtitle="Automate salary disbursements, compute tax withholdings, manage allowances, and export payslips."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STATS METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">July Payroll Disbursed</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">$198,500</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Average Salary</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">$7,850 / mo</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Tax Withholdings</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">$46,500 YTD</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Active Payees</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">158 Staff</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO ACTIONS BANNER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Pay Cycle: August 2026</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Ready to Run August 2026 Payroll</h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl">
            Auto-Tax calculation engine has verified attendance logs, approved leaves, and overtime hours for 160 active employees.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/app/payroll/calculate')}
            className="px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs border border-white/20 cursor-pointer transition-all"
          >
            Calculate Preview
          </button>

          <button
            onClick={() => setIsRunModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs shadow-lg cursor-pointer transition-all hover:scale-105"
          >
            Run Payroll Batch
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HISTORICAL PAYRUNS TABLE */}
      {/* ========================================================================= */}
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
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: RUN PAYROLL BATCH */}
      {/* ========================================================================= */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Execute August 2026 Pay Run</h3>
              </div>
              <button
                onClick={() => setIsRunModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Total Active Employees:</span>
                  <span className="font-bold text-slate-900 dark:text-white">160 Payees</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Total Gross Compensation:</span>
                  <span className="font-bold text-slate-900 dark:text-white">$250,000.00</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Federal & State Tax Withholding:</span>
                  <span className="font-bold text-rose-500">-$47,500.00</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-black">
                  <span className="text-slate-900 dark:text-white">Total Net Disbursement:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">$202,500.00</span>
                </div>
              </div>

              <p className="text-slate-500 leading-relaxed text-[11px]">
                Clicking confirm will automatically generate 160 individual encrypted payslips and queue ACH direct bank deposits.
              </p>
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
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Confirm & Disburse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
