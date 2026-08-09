import React, { useState } from 'react';
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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const PAYSLIP_RECORDS = [
  {
    id: 'PS-2026-07',
    month: 'July 2026',
    payPeriod: 'Jul 01, 2026 - Jul 31, 2026',
    payDate: 'Jul 31, 2026',
    gross: 6500,
    deductions: 1050,
    net: 5450,
    status: 'PAID',
    earnings: [
      { name: 'Basic Salary', amount: 3800 },
      { name: 'House Rent Allowance (HRA)', amount: 1400 },
      { name: 'Special Allowance', amount: 800 },
      { name: 'Medical & Conveyance', amount: 500 },
    ],
    deductionItems: [
      { name: 'Federal & State Income Tax', amount: 620 },
      { name: 'Provident Fund (401k)', amount: 310 },
      { name: 'Health Insurance Premium', amount: 120 },
    ],
  },
  {
    id: 'PS-2026-06',
    month: 'June 2026',
    payPeriod: 'Jun 01, 2026 - Jun 30, 2026',
    payDate: 'Jun 30, 2026',
    gross: 6500,
    deductions: 1050,
    net: 5450,
    status: 'PAID',
    earnings: [
      { name: 'Basic Salary', amount: 3800 },
      { name: 'House Rent Allowance (HRA)', amount: 1400 },
      { name: 'Special Allowance', amount: 800 },
      { name: 'Medical & Conveyance', amount: 500 },
    ],
    deductionItems: [
      { name: 'Federal & State Income Tax', amount: 620 },
      { name: 'Provident Fund (401k)', amount: 310 },
      { name: 'Health Insurance Premium', amount: 120 },
    ],
  },
  {
    id: 'PS-2026-05',
    month: 'May 2026',
    payPeriod: 'May 01, 2026 - May 31, 2026',
    payDate: 'May 31, 2026',
    gross: 6800,
    deductions: 1110,
    net: 5690,
    status: 'PAID',
    earnings: [
      { name: 'Basic Salary', amount: 3800 },
      { name: 'House Rent Allowance (HRA)', amount: 1400 },
      { name: 'Special Allowance', amount: 800 },
      { name: 'Medical & Conveyance', amount: 500 },
      { name: 'Q2 Performance Bonus', amount: 300 },
    ],
    deductionItems: [
      { name: 'Federal & State Income Tax', amount: 680 },
      { name: 'Provident Fund (401k)', amount: 310 },
      { name: 'Health Insurance Premium', amount: 120 },
    ],
  },
  {
    id: 'PS-2026-04',
    month: 'April 2026',
    payPeriod: 'Apr 01, 2026 - Apr 30, 2026',
    payDate: 'Apr 30, 2026',
    gross: 6500,
    deductions: 1050,
    net: 5450,
    status: 'PAID',
    earnings: [
      { name: 'Basic Salary', amount: 3800 },
      { name: 'House Rent Allowance (HRA)', amount: 1400 },
      { name: 'Special Allowance', amount: 800 },
      { name: 'Medical & Conveyance', amount: 500 },
    ],
    deductionItems: [
      { name: 'Federal & State Income Tax', amount: 620 },
      { name: 'Provident Fund (401k)', amount: 310 },
      { name: 'Health Insurance Premium', amount: 120 },
    ],
  },
];

const EmployeePayslips = () => {
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (ps) => {
    setToastMsg(`Downloading payslip for ${ps.month}...`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Payslips & Compensation"
        subtitle="Review your monthly salary disbursements, tax withholding, and printable payslip vouchers."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COMPENSATION OVERVIEW CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Monthly Gross Salary</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">$6,500.00</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            Annual CTC: $78,000 / yr
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Monthly Net Take-Home</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">$5,450.00</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Direct Bank Deposit</div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">Monthly Deductions & Tax</div>
          <div className="text-2xl font-black text-rose-500">$1,050.00</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">TDS, 401k & Healthcare</div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 mb-1">YTD Net Earnings (2026)</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">$38,390.00</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">7 Payslips Disbursed</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PAYSLIPS LIST TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Salary Disbursal History
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Click view to inspect the authentic corporate salary voucher or download PDF
          </p>
        </div>

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
              {PAYSLIP_RECORDS.map((ps) => (
                <tr key={ps.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                    <div>{ps.month}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{ps.payPeriod}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                    {ps.payDate}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    ${ps.gross.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-rose-500 font-bold">
                    -${ps.deductions.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                    ${ps.net.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{ps.status}</span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DETAILED CORPORATE SALARY VOUCHER MODAL */}
      {/* ========================================================================= */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  N
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">NexaHR Corporation</h3>
                  <p className="text-[11px] text-slate-400">Monthly Compensation Voucher • Confidential</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Employee Name</span>
                <span className="font-bold text-slate-900 dark:text-white">Alex Mercer</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Employee ID</span>
                <span className="font-bold text-slate-900 dark:text-white">EMP-101</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Designation</span>
                <span className="font-bold text-slate-900 dark:text-white">Senior Full-Stack Eng.</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Pay Period</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPayslip.month}</span>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Earnings Column */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  Earnings (Gross)
                </h4>
                <div className="space-y-1.5 text-xs">
                  {selectedPayslip.earnings.map((item, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                      <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 text-xs font-extrabold">
                    <span>Total Gross Earnings</span>
                    <span className="text-slate-900 dark:text-white">${selectedPayslip.gross.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  Deductions (Taxes & PF)
                </h4>
                <div className="space-y-1.5 text-xs">
                  {selectedPayslip.deductionItems.map((item, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                      <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                      <span className="font-bold text-rose-500">-${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 text-xs font-extrabold">
                    <span>Total Deductions</span>
                    <span className="text-rose-500">-${selectedPayslip.deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Net Payable Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-lg">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-100">
                  Net Salary Disbursed
                </div>
                <div className="text-xs text-emerald-50">Transferred to Chase Bank A/C ending ••••4892</div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono">
                ${selectedPayslip.net.toLocaleString()}.00
              </div>
            </div>

            {/* Footer Signoff */}
            <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
              Generated by NexaHR Automated Payroll Engine on {selectedPayslip.payDate}.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayslips;
