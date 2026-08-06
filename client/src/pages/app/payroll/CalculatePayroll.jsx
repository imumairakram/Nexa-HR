import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { CreditCard, Calculator, CheckCircle2, Play, AlertCircle } from 'lucide-react';

const CalculatePayroll = () => {
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState('2026');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleCalculate = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
    }, 1800);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Calculate Payroll Batch" subtitle="Automated salary calculation wizard with tax & attendance deductions" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Total Workforce Eligible</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">148 Employees</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Estimated Gross Payout</span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">$482,450.00</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Calculated Deductions</span>
          <h3 className="text-2xl font-black text-rose-500 mt-1">$34,120.00</h3>
        </div>
      </div>

      {/* Calculator Form */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Run Payroll Calculation</h3>
          <p className="text-xs text-slate-400">Select target pay period and trigger automatic calculation engine</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pay Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3 text-xs">
          <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-indigo-950 dark:text-indigo-300 leading-snug">
            <p className="font-bold">Automated Batch Engine</p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
              Calculates base salary + overtime allowances - late arrival penalties - statutory taxes for {month} {year}.
            </p>
          </div>
        </div>

        {completed ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-base font-extrabold text-emerald-900 dark:text-emerald-300">Payroll Calculation Complete!</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">148 payslips generated for {month} {year}.</p>
          </div>
        ) : (
          <button
            onClick={handleCalculate}
            disabled={processing}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 disabled:opacity-50"
          >
            {processing ? (
              <span className="animate-pulse">Computing 148 Payroll Records...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Payroll Calculation for {month} {year}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CalculatePayroll;
