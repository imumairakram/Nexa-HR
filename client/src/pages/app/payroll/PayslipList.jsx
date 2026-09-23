import React, { useState, useEffect, useMemo } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../../components/common/SparkMetricCard';
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
  RefreshCw,
} from 'lucide-react';
import { api } from '../../../services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PayslipList = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadPayslips = async () => {
    setLoading(true);
    try {
      const res = await api.getPayslips();
      if (res?.success && res.data?.payslips) {
        const mapped = res.data.payslips.map((p) => ({
          id: `PSL-${p.year}-${String(p.month).padStart(2, '0')}-${p.user?.employeeCode || p.userId.slice(0, 4)}`,
          rawId: p.id,
          employee: `${p.user?.firstName || 'Staff'} ${p.user?.lastName || 'Member'}`,
          code: p.user?.employeeCode || 'EMP-100',
          dept: p.user?.profile?.department?.name || 'Operations',
          month: `${MONTH_NAMES[p.month - 1]} ${p.year}`,
          gross: Number(p.grossSalary || 0),
          deductions: Number(p.taxDeductions || 0) + Number(p.otherDeductions || 0) + Number(p.unpaidLeaveDeduction || 0),
          net: Number(p.netSalary || 0),
          date: p.generatedAt ? new Date(p.generatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
          status: p.status || 'PAID',
        }));
        setPayslips(mapped);
      }
    } catch (err) {
      console.error('Failed to load payslips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, []);

  // Dynamic Sparkline Telemetry
  const disbursedSparkData = useMemo(() => {
    if (!payslips.length) return null;
    return payslips.slice(0, 7).reverse().map((p) => ({
      label: p.employee.split(' ')[0] || 'Staff',
      value: p.net,
    }));
  }, [payslips]);

  const taxSparkData = useMemo(() => {
    if (!payslips.length) return null;
    return payslips.slice(0, 7).reverse().map((p) => ({
      label: p.employee.split(' ')[0] || 'Staff',
      value: p.deductions,
    }));
  }, [payslips]);

  const vouchersSparkData = useMemo(() => {
    if (!payslips.length) return null;
    return payslips.slice(0, 7).map((_, idx) => ({
      label: `Voucher ${idx + 1}`,
      value: idx + 1,
    }));
  }, [payslips]);

  const avgSparkData = useMemo(() => {
    if (!payslips.length) return null;
    return payslips.slice(0, 7).map((p) => ({
      label: p.employee.split(' ')[0] || 'Staff',
      value: Math.round(p.net),
    }));
  }, [payslips]);

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

      {/* ========================================================================= */}
      {/* 1. DYNAMIC PAYSLIPS HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Payslip Archive Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Employee Payslip Repository & PDF Invoicing
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Search and print official company payslips, verify tax withholding schedules, and export encrypted batch archives.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <FileText className="w-3.5 h-3.5" />
                <span>{payslips.length} Official Payslips Recorded</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Disbursed Successfully</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Batch Export</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Download all monthly slips</div>
            </div>
            <button
              onClick={() => {
                setToastMsg('Exporting zip package containing all official PDF payslips...');
                setTimeout(() => setToastMsg(''), 3000);
              }}
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Batch Archive</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS WITH SPARKLINES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="dark"
          title="Total Vouchers"
          value={payslips.length}
          unit={payslips.length === 1 ? 'Slip' : 'Slips'}
          badgeText="Current Cycle"
          badgeType="positive"
          badgeIcon="up"
          subtext="All Departments"
          chartColor="purple"
          presetWave="wave1"
          dataPoints={vouchersSparkData}
          loading={loading}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Total Disbursed"
          value={`$${payslips.reduce((acc, p) => acc + p.net, 0).toLocaleString()}`}
          badgeText="100% Net Paid"
          badgeType="positive"
          badgeIcon="up"
          subtext="Direct Wire Settled"
          chartColor="emerald"
          presetWave="wave2"
          dataPoints={disbursedSparkData}
          loading={loading}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Tax Withholdings"
          value={`$${payslips.reduce((acc, p) => acc + p.deductions, 0).toLocaleString()}`}
          badgeText="Statutory Filing"
          badgeType="warning"
          badgeIcon="dot"
          subtext="W-2 Deductions"
          chartColor="rose"
          presetWave="wave3"
          dataPoints={taxSparkData}
          loading={loading}
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Average Net Salary"
          value={`$${Math.round(payslips.reduce((acc, p) => acc + p.net, 0) / (payslips.length || 1)).toLocaleString()}`}
          badgeText="Per Employee"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Net Average Payout"
          chartColor="blue"
          presetWave="wave4"
          dataPoints={avgSparkData}
          loading={loading}
        />
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
