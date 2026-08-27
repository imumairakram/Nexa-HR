import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  FileText,
  Search,
  Filter,
  Download,
  Star,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  Eye,
  X,
  UserPlus,
  Plus,
  ArrowRight,
  UserCheck,
  Ban,
  Briefcase,
  MapPin,
  Clock,
  RefreshCw,
} from 'lucide-react';

const DEFAULT_APPLICATIONS = [
  {
    id: 'APP-9901',
    name: 'David K. Vance',
    role: 'Senior React & Node Engineer',
    department: 'Engineering & DevOps',
    email: 'david.vance@techlead.io',
    phone: '+92 300 1234567',
    experience: '6.5 Years',
    location: 'Islamabad HQ / Hybrid',
    rating: 4.9,
    stage: 'INTERVIEWING',
    date: 'Aug 22, 2026',
    status: 'ACTIVE',
    resumeSummary: 'Expert in full-stack JavaScript architectures, PostgreSQL, microservices, and React performance optimization.',
  },
  {
    id: 'APP-9902',
    name: 'Ayesha Tariq',
    role: 'Lead Product Designer (Figma)',
    department: 'Product & Design',
    email: 'ayesha.tariq@designcraft.com',
    phone: '+92 321 9876543',
    experience: '5.0 Years',
    location: 'Karachi Regional Hub',
    rating: 4.8,
    stage: 'OFFER',
    date: 'Aug 18, 2026',
    status: 'ACTIVE',
    resumeSummary: 'Proven track record designing enterprise SaaS platforms, design systems, and conducting customer research.',
  },
  {
    id: 'APP-9903',
    name: 'Michael Zhang',
    role: 'DevOps & Kubernetes Architect',
    department: 'Engineering & DevOps',
    email: 'michael.zhang@cloudops.net',
    phone: '+1 415 889 2031',
    experience: '8.0 Years',
    location: 'Remote & Distributed',
    rating: 4.7,
    stage: 'SCREENING',
    date: 'Aug 25, 2026',
    status: 'ACTIVE',
    resumeSummary: 'CI/CD pipeline automation, Terraform infrastructure-as-code, AWS/GCP high availability clusters.',
  },
  {
    id: 'APP-9904',
    name: 'Fatima Noor',
    role: 'Senior Talent Acquisition Specialist',
    department: 'People Operations & HR',
    email: 'fatima.noor@hrnetwork.org',
    phone: '+92 333 4567890',
    experience: '4.5 Years',
    location: 'Lahore Regional Office',
    rating: 4.6,
    stage: 'APPLIED',
    date: 'Aug 26, 2026',
    status: 'ACTIVE',
    resumeSummary: 'Technical hiring specialist experienced in building high-performing engineering and product teams.',
  },
  {
    id: 'APP-9905',
    name: 'Zainab Qureshi',
    role: 'Financial Operations Analyst',
    department: 'Finance & Accounts',
    email: 'zainab.q@finmetrics.com',
    phone: '+92 301 5554321',
    experience: '3.5 Years',
    location: 'Islamabad HQ',
    rating: 4.9,
    stage: 'HIRED',
    date: 'Aug 10, 2026',
    status: 'ACTIVE',
    resumeSummary: 'Corporate budgeting, payroll ledger auditing, and statutory financial reporting.',
  },
];

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFER', 'HIRED'];

const JobApplication = () => {
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_recruitment_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_APPLICATIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // New Application Form State
  const [form, setForm] = useState({
    name: '',
    role: 'Senior React & Node Engineer',
    department: 'Engineering & DevOps',
    email: '',
    phone: '',
    experience: '4 Years',
    location: 'Islamabad HQ',
    rating: '4.8',
    resumeSummary: '',
  });

  const saveApplications = (updated) => {
    setApplications(updated);
    try {
      localStorage.setItem('nexahr_recruitment_applications', JSON.stringify(updated));

      // Sync with Kanban board
      const kanban = {
        APPLIED: updated.filter((a) => a.stage === 'APPLIED'),
        SCREENING: updated.filter((a) => a.stage === 'SCREENING'),
        INTERVIEWING: updated.filter((a) => a.stage === 'INTERVIEWING'),
        OFFER: updated.filter((a) => a.stage === 'OFFER'),
        HIRED: updated.filter((a) => a.stage === 'HIRED'),
      };
      localStorage.setItem('nexahr_recruitment_kanban', JSON.stringify(kanban));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateApplicant = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    const newApp = {
      id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: form.name.trim(),
      role: form.role,
      department: form.department,
      email: form.email.trim(),
      phone: form.phone.trim() || '+92 300 0000000',
      experience: form.experience,
      location: form.location,
      rating: parseFloat(form.rating) || 4.5,
      stage: 'APPLIED',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'ACTIVE',
      resumeSummary: form.resumeSummary.trim() || 'Direct candidate portal submission with verified qualifications.',
    };

    const updated = [newApp, ...applications];
    saveApplications(updated);
    setIsAddModalOpen(false);
    setForm({
      name: '',
      role: 'Senior React & Node Engineer',
      department: 'Engineering & DevOps',
      email: '',
      phone: '',
      experience: '4 Years',
      location: 'Islamabad HQ',
      rating: '4.8',
      resumeSummary: '',
    });
    setToastMsg(`Applicant "${newApp.name}" submitted into hiring pipeline!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAdvanceStage = (appId, nextStage) => {
    const updated = applications.map((a) => {
      if (a.id === appId) {
        return { ...a, stage: nextStage };
      }
      return a;
    });
    saveApplications(updated);
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, stage: nextStage });
    }
    setToastMsg(`Candidate stage updated to "${nextStage}"!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return;
    const headers = ['Candidate ID', 'Name', 'Applied Position', 'Department', 'Email', 'Phone', 'Experience', 'Rating', 'Stage', 'Date'];
    const rows = applications.map((a) => [
      `"${a.id}"`,
      `"${a.name}"`,
      `"${a.role}"`,
      `"${a.department}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.experience}"`,
      `"${a.rating}"`,
      `"${a.stage}"`,
      `"${a.date}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Candidate_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMsg('Candidate application roster exported successfully!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = applications.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || a.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Candidate Application Roster & Resumes"
        subtitle="Review inbound candidate resumes, stage progression, ATS match scores, and interview evaluations."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC JOB APPLICATIONS HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Application Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Candidate Application Roster & Resumes
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Review inbound candidate resumes, stage progression, candidate match ratings, and download verified applicant credentials.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <FileText className="w-3.5 h-3.5" />
                <span>{applications.length} Candidate Submissions</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Star className="w-3.5 h-3.5" />
                <span>4.8 Avg Candidate Rating</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Talent Pipeline</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Add candidate or export archive</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 px-3 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Applicant</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center cursor-pointer transition-all"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Applications</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {applications.length} <span className="text-base font-bold text-slate-400">Submissions</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Received Candidates</span>
              <span className="text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">High Match (&gt;4.7)</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 shadow-xs">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {applications.filter((a) => a.rating >= 4.7).length} <span className="text-base font-bold text-slate-400">Top Match</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Top 5% Talent</span>
              <span className="text-slate-400">Priority</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">In Interview Loop</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {applications.filter((a) => a.stage === 'INTERVIEWING').length} <span className="text-base font-bold text-slate-400">In Loop</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Panel Engaged</span>
              <span className="text-slate-400">Stage 3</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Offers & Hired</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              {applications.filter((a) => a.stage === 'OFFER' || a.stage === 'HIRED').length} <span className="text-base font-bold text-slate-400">Final Stage</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Offer / Accepted</span>
              <span className="text-slate-400">Conversion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Stage Filter */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate applications by name, position, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', ...STAGES].map((stg) => (
            <button
              key={stg}
              onClick={() => setStageFilter(stg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                stageFilter === stg
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {stg === 'ALL' ? 'All Stages' : stg}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-4">Applied Position</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
                <th className="py-3.5 px-4">Applied On</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                    <div>{a.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{a.id}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">{a.role}</td>
                  <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">
                    <div>{a.email}</div>
                    <div className="text-[10px] text-slate-400">{a.phone}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 font-black text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" /> {a.rating}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      a.stage === 'HIRED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : a.stage === 'OFFER'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : a.stage === 'INTERVIEWING'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {a.stage}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-500">{a.date}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedApp(a)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
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
      {/* 3. MODAL: ADD CANDIDATE */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Candidate Application</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zaid Khan"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Applied Position *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Dev"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="zaid@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Total Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 Years"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Initial Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Resume Summary & Key Skills</label>
                <textarea
                  rows="3"
                  placeholder="Summary of experience, technical proficiencies, portfolio links..."
                  value={form.resumeSummary}
                  onChange={(e) => setForm({ ...form, resumeSummary: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Add Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: CANDIDATE DOSSIER & STAGE ADVANCEMENT */}
      {/* ========================================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-lg flex items-center justify-center">
                  {selectedApp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedApp.name}</h3>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {selectedApp.role} • {selectedApp.department}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Experience</div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{selectedApp.experience}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Match Rating</div>
                <div className="text-xs font-black text-amber-500 mt-0.5 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> {selectedApp.rating} / 5.0
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Current Stage</div>
                <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{selectedApp.stage}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Applied Date</div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{selectedApp.date}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contact Information</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedApp.email}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedApp.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Resume Profile Summary</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl leading-relaxed">
                {selectedApp.resumeSummary || 'Candidate dossier in standard format with verified background check.'}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Advance Hiring Stage</div>
              <div className="flex flex-wrap items-center gap-2">
                {STAGES.map((stg) => (
                  <button
                    key={stg}
                    onClick={() => handleAdvanceStage(selectedApp.id, stg)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedApp.stage === stg
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplication;
