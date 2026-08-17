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
      {/* 1. DYNAMIC REPORTS HERO BANNER (PURPLE-INDIGO LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-purple-50/90 via-indigo-50/80 to-blue-50/60 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-purple-200/70 dark:border-purple-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Intelligence Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-extrabold border border-purple-600/20 dark:border-purple-500/30">
                <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Executive Dossier Engine Active</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-600/20 dark:border-indigo-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Audit Ready Exports</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Executive Reports & Workforce Intelligence
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Generate and download audit-ready compliance summaries, payroll logs, headcount attrition metrics, and security access logs in CSV, PDF, or XLSX formats.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold bg-purple-100/60 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800/60">
                <FileText className="w-3.5 h-3.5" />
                <span>{REPORT_TEMPLATES.length} Enterprise Templates</span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SOC-2 Type II Certified</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-purple-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Batch Export Dossier</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Download all {exportFormat} reports</div>
            </div>
            <button
              onClick={() => handleExport({ id: 'FULL-DOSSIER-2026', title: 'Full Company Workforce Dossier' })}
              className="w-full px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full Package</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Ready Templates</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {REPORT_TEMPLATES.length} <span className="text-base font-bold text-slate-400">Templates</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Standard & Custom</span>
              <span className="text-slate-400">Real-time</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Export Formats</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Download className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              CSV • PDF • XLSX
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Encrypted Archive</span>
              <span className="text-slate-400">Zip Output</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Audit Compliance</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              100% <span className="text-base font-bold text-slate-400">Compliant</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">SOC-2 & GDPR</span>
              <span className="text-slate-400">Certified</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Audit Logs Today</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              3,890 <span className="text-base font-bold text-slate-400">Events</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Automated Daily Log</span>
              <span className="text-slate-400">06:00 AM</span>
            </div>
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
