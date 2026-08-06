import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { BarChart3, Download, FileSpreadsheet, Calendar, Filter } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [format, setFormat] = useState('CSV');
  const [downloading, setDownloading] = useState(false);

  const reportsList = [
    { id: 'attendance', title: 'Monthly Attendance & Biometric Log', desc: 'Detailed employee check-in, check-out, late arrivals, and overtime hours' },
    { id: 'leave', title: 'Leave Utilization & Balance Report', desc: 'Employee annual leave consumption, pending requests, and carry-over totals' },
    { id: 'payroll', title: 'Payroll Expense & Tax Summary', desc: 'Gross payout, tax withholdings, allowances, and net salary disbursement per department' },
    { id: 'recruitment', title: 'Recruitment & Candidate Pipeline Analytics', desc: 'Job open duration, candidate applications, interview pass rates, and time-to-hire' },
  ];

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Report generated and downloaded as ${format}!`);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Exportable Business Reports" subtitle="Generate comprehensive analytical reports across HR, Attendance, and Payroll" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Types List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Select Report Category</h3>
          <div className="space-y-3">
            {reportsList.map((r) => (
              <div
                key={r.id}
                onClick={() => setReportType(r.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 ${
                  reportType === r.id
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-soft'
                    : 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className={`p-3 rounded-2xl shrink-0 ${
                  reportType === r.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{r.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Settings Panel */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6 h-fit">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Export Settings</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date Range</label>
              <input
                type="month"
                defaultValue="2026-08"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('CSV')}
                  className={`py-2 rounded-xl font-bold transition-colors ${
                    format === 'CSV' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Excel / CSV
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('PDF')}
                  className={`py-2 rounded-xl font-bold transition-colors ${
                    format === 'PDF' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  PDF Document
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 disabled:opacity-50"
          >
            {downloading ? (
              <span className="animate-pulse">Generating Report...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Report ({format})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
