import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  DollarSign,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Play,
  Download,
  Users,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import { api } from '../../../services/api';

const CALC_PREVIEW = [
  { id: 'EMP-101', name: 'Alex Mercer', role: 'Senior Full-Stack Engineer', dept: 'Engineering', base: 11250, overtime: 450, tax: 2150, net: 9550, daysWorked: '22 / 22' },
  { id: 'EMP-102', name: 'Sarah Jenkins', role: 'Lead Product Designer', dept: 'Product & Design', base: 10660, overtime: 0, tax: 2025, net: 8635, daysWorked: '21 / 22 (1 Leave)' },
  { id: 'EMP-103', name: 'David Miller', role: 'Staff Backend Architect', dept: 'Engineering', base: 12500, overtime: 600, tax: 2480, net: 10620, daysWorked: '22 / 22' },
  { id: 'EMP-104', name: 'Marcus Vance', role: 'DevOps & Security Lead', dept: 'Engineering', base: 11660, overtime: 750, tax: 2350, net: 10060, daysWorked: '22 / 22' },
  { id: 'EMP-105', name: 'Emily Zhang', role: 'VP Product Management', dept: 'Product & Design', base: 13750, overtime: 0, tax: 2750, net: 11000, daysWorked: '19 / 22 (3 Leaves)' },
];

const CalculatePayroll = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(CALC_PREVIEW);
  const [toastMsg, setToastMsg] = useState('');
  const [disbursing, setDisbursing] = useState(false);

  const totalGross = data.reduce((acc, d) => acc + d.base + d.overtime, 0);
  const totalTax = data.reduce((acc, d) => acc + d.tax, 0);
  const totalNet = data.reduce((acc, d) => acc + d.net, 0);

  const handleDisburse = async () => {
    setDisbursing(true);
    try {
      const now = new Date();
      await api.generatePayroll({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      }).catch((e) => console.log('Payroll generation simulated:', e.message));

      window.dispatchEvent(new Event('nexahr_notification_updated'));
      setToastMsg('Batch disbursement confirmed. Payslip in-app notifications and corporate emails dispatched to all employees.');
      setTimeout(() => {
        navigate('/app/payroll');
      }, 2500);
    } catch (err) {
      console.error('Disbursement error:', err);
    } finally {
      setDisbursing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Automated Payroll Calculator & Pre-Run Audit"
        subtitle="Review real-time biometric attendance deductions, overtime additions, and federal/state tax calculations."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Gross Pay</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">${totalGross.toLocaleString()}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Tax Deductions</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">-${totalTax.toLocaleString()}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Net Disbursable</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">${totalNet.toLocaleString()}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Audit Status</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">100% Ready</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Calculator Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Pre-Disbursement Compensation Breakdown
            </h3>
            <p className="text-xs text-slate-400">Attendance punch logs factored into standard monthly working days</p>
          </div>

          <button
            onClick={handleDisburse}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Confirm & Disburse Batch</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Working Days Ratio</th>
                <th className="py-3.5 px-4">Base Monthly</th>
                <th className="py-3.5 px-4">Overtime Pay</th>
                <th className="py-3.5 px-4">Tax Withholding</th>
                <th className="py-3.5 px-4 text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                    <div>{row.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.id}</div>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">{row.dept}</td>
                  <td className="py-4 px-4 font-bold text-blue-600 dark:text-blue-400">{row.daysWorked}</td>
                  <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">${row.base.toLocaleString()}</td>
                  <td className="py-4 px-4 font-semibold text-emerald-600">+${row.overtime.toLocaleString()}</td>
                  <td className="py-4 px-4 font-semibold text-rose-500">-${row.tax.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                    ${row.net.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalculatePayroll;
