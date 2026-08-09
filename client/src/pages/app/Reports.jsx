import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  BarChart2,
} from 'lucide-react';

const REPORT_TEMPLATES = [
  {
    id: 'REP-ATT',
    title: 'Monthly Biometric Attendance & Punctuality Audit',
    category: 'ATTENDANCE',
    description: 'Detailed daily punch logs, late arrivals, overtime hours, and biometric device verification logs across all departments.',
    frequency: 'Monthly',
    records: '1,420 Records',
    lastGenerated: 'Today, 08:30 AM',
    icon: Clock,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'REP-PAY',
    title: 'Executive Payroll & Tax Withholding Ledger',
    category: 'PAYROLL',
    description: 'Comprehensive gross vs. net salaries, federal/state tax deductions, health insurance premiums, and 401(k) allocations.',
    frequency: 'Monthly',
    records: '158 Employees',
    lastGenerated: 'Jul 31, 2026',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'REP-LEV',
    title: 'Leave Quota Consumption & Liability Report',
    category: 'LEAVES',
    description: 'Year-to-date utilized vs. remaining leave days per employee, pending requests, and financial accrual liability audit.',
    frequency: 'Quarterly',
    records: '450 Requests',
    lastGenerated: 'Aug 01, 2026',
    icon: Calendar,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'REP-RET',
    title: 'Headcount Growth & Department Retention Forecast',
    category: 'HEADCOUNT',
    description: 'Quarterly hiring velocity, department headcount ratios, turnover rates, and voluntary attrition metrics.',
    frequency: 'Quarterly',
    records: '12 Quarters',
    lastGenerated: 'Jul 15, 2026',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'REP-ATS',
    title: 'Recruitment Funnel & Time-to-Hire Analytics',
    category: 'RECRUITMENT',
    description: 'Applicant conversion rates per hiring stage, interview pass-through percentages, and sourcing channel effectiveness.',
    frequency: 'Weekly',
    records: '84 Candidates',
    lastGenerated: 'Aug 06, 2026',
    icon: Briefcase,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'REP-SEC',
    title: 'SOC-2 Compliance & Role Access Audit Log',
    category: 'SECURITY',
    description: 'System login attempts, administrative privilege elevations, credential changes, and permission assignment logs.',
    frequency: 'Daily',
    records: '3,890 Events',
    lastGenerated: 'Today, 06:00 AM',
    icon: ShieldCheck,
    color: 'from-slate-600 to-slate-800',
  },
];

const Reports = () => {
  const [filter, setFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('YTD 2026');
  const [exportFormat, setExportFormat] = useState('CSV');
  const [toastMsg, setToastMsg] = useState('');

  const handleExport = (report) => {
    setToastMsg(`Exporting "${report.title}" as ${exportFormat}...`);
    setTimeout(() => {
      setToastMsg(`Report "${report.id}.${exportFormat.toLowerCase()}" ready! Download started.`);
      setTimeout(() => setToastMsg(''), 3000);
    }, 1500);
  };

  const filtered = REPORT_TEMPLATES.filter(
    (r) => filter === 'ALL' || r.category === filter
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Executive Reports & Workforce Intelligence"
        subtitle="Generate and download audit-ready compliance summaries, payroll logs, and analytics dossiers."
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
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ready Reports</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">6 Templates</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Export Formats</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">CSV • PDF • XLSX</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Compliance Grade</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">SOC-2 Type II</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Data Freshness</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">Real-Time Sync</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOOLBAR & FORMAT SELECTOR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'ATTENDANCE', 'PAYROLL', 'LEAVES', 'HEADCOUNT', 'RECRUITMENT', 'SECURITY'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Reports' : cat}
              </button>
            ))}
          </div>

          {/* Export format pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Export As:</span>
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {['CSV', 'PDF', 'XLSX'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    exportFormat === fmt
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. REPORT TEMPLATE CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${report.color} text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{report.id}</span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Frequency: {report.frequency}</span>
                  <span>{report.records}</span>
                </div>

                <button
                  onClick={() => handleExport(report)}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate & Export ({exportFormat})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
