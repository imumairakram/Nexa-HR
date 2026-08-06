import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { Landmark, ArrowUpRight, ArrowDownRight, DollarSign, Plus, Search } from 'lucide-react';

const Accounts = () => {
  const [transactions, setTransactions] = useState([
    { id: 'TX-901', title: 'Monthly Staff Payroll Batch', type: 'EXPENSE', category: 'Payroll', amount: '$482,450.00', date: '08/01/2026' },
    { id: 'TX-902', title: 'Enterprise Software Subscription Income', type: 'INCOME', category: 'Revenue', amount: '$612,000.00', date: '08/03/2026' },
    { id: 'TX-903', title: 'AWS Cloud Infrastructure Invoice', type: 'EXPENSE', category: 'Operations', amount: '$14,200.00', date: '08/04/2026' },
    { id: 'TX-904', title: 'Office Equipment & Hardware Upgrade', type: 'EXPENSE', category: 'Assets', amount: '$8,900.00', date: '08/05/2026' },
  ]);

  const [search, setSearch] = useState('');

  const filtered = transactions.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Accounts & Financial Ledger" subtitle="Monitor company cash flow, department budgets, and general ledgers" />

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Total Monthly Revenue</span>
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">$612,000.00</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Total Monthly Expenses</span>
            <ArrowDownRight className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black text-rose-500">$505,550.00</h3>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">Net Operating Profit</span>
            <Landmark className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">$106,450.00</h3>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ledger entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{t.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{t.title}</td>
                  <td className="py-3.5 px-4 text-slate-500">{t.category}</td>
                  <td className="py-3.5 px-4 text-slate-400">{t.date}</td>
                  <td className={`py-3.5 px-4 text-right font-extrabold ${
                    t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                  }`}>
                    {t.type === 'INCOME' ? `+${t.amount}` : `-${t.amount}`}
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

export default Accounts;
