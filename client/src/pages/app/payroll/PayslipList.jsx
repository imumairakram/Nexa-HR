import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  X,
  Printer,
  DollarSign,
  Building,
  Calendar,
} from 'lucide-react';

const INITIAL_PAYSLIPS = [
  { id: 'PSL-2026-07-101', employee: 'Alex Mercer', code: 'EMP-101', dept: 'Engineering', month: 'July 2026', gross: 11700, deductions: 2150, net: 9550, date: 'Jul 31, 2026', status: 'PAID' },
  { id: 'PSL-2026-07-102', employee: 'Sarah Jenkins', code: 'EMP-102', dept: 'Product & Design', month: 'July 2026', gross: 10660, deductions: 2025, net: 8635, date: 'Jul 31, 2026', status: 'PAID' },
  { id: 'PSL-2026-07-103', employee: 'David Miller', code: 'EMP-103', dept: 'Engineering', month: 'July 2026', gross: 13100, deductions: 2480, net: 10620, date: 'Jul 31, 2026', status: 'PAID' },
  { id: 'PSL-2026-07-104', employee: 'Marcus Vance', code: 'EMP-104', dept: 'Engineering', month: 'July 2026', gross: 12410, deductions: 2350, net: 10060, date: 'Jul 31, 2026', status: 'PAID' },
  { id: 'PSL-2026-07-105', employee: 'Emily Zhang', code: 'EMP-105', dept: 'Product & Design', month: 'July 2026', gross: 13750, deductions: 2750, net: 11000, date: 'Jul 31, 2026', status: 'PAID' },
];

const PayslipList = () => {
  const [payslips, setPayslips] = useState(INITIAL_PAYSLIPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const filtered = payslips.filter((p) =>
    p.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Employee Payslip Repository & PDF Invoicing"
        subtitle="Search and print official company payslips, verify tax withholding schedules, and export batch archives."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payslips by employee name, ID, or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => {
            setToastMsg('Exporting zip package containing all 158 PDF payslips...');
            setTimeout(() => setToastMsg(''), 3000);
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Batch Archive</span>
        </button>
      </div>

      {/* Payslips Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Invoice Ref</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Pay Period</th>
                <th className="py-3.5 px-4">Gross Earnings</th>
                <th className="py-3.5 px-4">Tax Deductions</th>
                <th className="py-3.5 px-4">Net Salary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-[10px] font-bold text-slate-400">
                    {p.id}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                    <div>{p.employee}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.code} • {p.dept}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">{p.month}</td>
                  <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">${p.gross.toLocaleString()}</td>
                  <td className="py-4 px-4 font-medium text-rose-500">-${p.deductions.toLocaleString()}</td>
                  <td className="py-4 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    ${p.net.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{p.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedSlip(p)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Printable Payslip PDF Preview */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{selectedSlip.id}</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Official Salary Statement
                </h3>
                <p className="text-xs text-slate-400">NexaHR Enterprise Systems Inc.</p>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Employee</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSlip.employee}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{selectedSlip.code}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Disbursement Period</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSlip.month}</span>
                <span className="text-[10px] text-slate-400 block">{selectedSlip.date}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gross Base Salary & Allowances:</span>
                <span className="font-bold text-slate-900 dark:text-white">${selectedSlip.gross.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Federal/State Tax & Benefits Deductions:</span>
                <span className="font-bold text-rose-500">-${selectedSlip.deductions.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between py-3 text-sm font-black bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl">
                <span className="text-blue-900 dark:text-blue-200">Net Take-Home Pay (ACH Direct):</span>
                <span className="text-emerald-600 dark:text-emerald-400">${selectedSlip.net.toLocaleString()}.00</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print PDF</span>
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipList;
