import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { CreditCard, Download, Eye, Search, Printer, CheckCircle2 } from 'lucide-react';

const PayslipList = () => {
  const [payslips, setPayslips] = useState([
    { id: 'PAY-801', employee: 'Alex Mercer', role: 'Senior Developer', netPay: '$7,250.00', month: 'July 2026', status: 'PAID' },
    { id: 'PAY-802', employee: 'Sarah Jenkins', role: 'Marketing Manager', netPay: '$6,400.00', month: 'July 2026', status: 'PAID' },
    { id: 'PAY-803', employee: 'David Miller', role: 'Financial Analyst', netPay: '$5,800.00', month: 'July 2026', status: 'PENDING' },
    { id: 'PAY-804', employee: 'Emily Zhang', role: 'UI/UX Designer', netPay: '$4,900.00', month: 'July 2026', status: 'PAID' },
  ]);

  const [search, setSearch] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const filtered = payslips.filter(p =>
    p.employee.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Payslip Directory" subtitle="Search, view, and download individual staff monthly salary slips" />

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payslips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">Total: {filtered.length} Payslips</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-3 px-4">Payslip ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{p.id}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{p.employee}</p>
                    <p className="text-[10px] text-slate-400">{p.role}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{p.month}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{p.netPay}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedPayslip(p)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Payslip #{selectedPayslip.id}</h3>
                <p className="text-xs text-slate-400">{selectedPayslip.month}</p>
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                {selectedPayslip.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Employee Name:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{selectedPayslip.employee}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Role:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedPayslip.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Net Disbursed:</span>
                <span className="font-black text-emerald-600 text-sm">{selectedPayslip.netPay}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Payslip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipList;
