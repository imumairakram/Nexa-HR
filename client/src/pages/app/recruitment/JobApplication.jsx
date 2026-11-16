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
import { api } from '../../../services/api';

const DEFAULT_APPLICATIONS = [];

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFER', 'HIRED'];

const JobApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getJobApplications();
      if (res?.success && res.data?.applications) {
        setApplications(res.data.applications);
      } else {
        setApplications([]);
      }
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const avgRating = useMemo(() => {
    if (!applications.length) return '5.0';
    const validRatings = applications.map((a) => Number(a.rating || a.score)).filter((r) => !isNaN(r) && r > 0);
    if (!validRatings.length) return '5.0';
    return (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1);
  }, [applications]);

  const shortlistedCount = useMemo(() => {
    return applications.filter((a) => a.stage === 'SHORTLISTED' || a.stage === 'INTERVIEW' || a.stage === 'OFFER' || a.stage === 'HIRED').length;
  }, [applications]);

  // New Application Form State
  const [form, setForm] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    phone: '',
    experience: '',
    location: '',
    rating: '5.0',
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

  const handleCreateApplicant = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    try {
      const payload = {
        name: form.name.trim(),
        role: form.role,
        department: form.department,
        email: form.email.trim(),
        phone: form.phone.trim() || '+92 300 0000000',
        experience: form.experience,
        location: form.location,
        rating: parseFloat(form.rating) || 4.5,
        stage: 'APPLIED',
        resumeSummary: form.resumeSummary.trim() || 'Direct candidate portal submission with verified qualifications.',
      };

      const res = await api.createJobApplication(payload);
      if (res?.success && res.data?.application) {
        const created = res.data.application;
        const formatted = {
          ...created,
          date: new Date(created.createdAt || created.appliedDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
        const updated = [formatted, ...applications];
        saveApplications(updated);
        setToastMsg(`Applicant "${formatted.name}" saved to database!`);
      } else {
        throw new Error(res?.message || 'Failed to save application');
      }
    } catch (err) {
      console.error('Error saving application:', err);
      setToastMsg(`Error: ${err.message || 'Failed to save applicant to database'}`);
    } finally {
      setIsAddModalOpen(false);
      setForm({
        name: '',
        role: '',
        department: '',
        email: '',
        phone: '',
        experience: '',
        location: '',
        rating: '5.0',
        resumeSummary: '',
      });
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleAdvanceStage = async (appId, nextStage) => {
    try {
      await api.updateJobApplicationStage(appId, nextStage);
    } catch (err) {
      console.warn('API error advancing stage:', err);
    }
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
        title="Candidate Applications & Resumes"
        subtitle="Review inbound candidate resumes, stage progression, ATS match scores, and interview evaluations."
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC JOB APPLICATIONS HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-6 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Application Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
              Candidate Application Roster & Resumes
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-lg font-medium">
              Review inbound candidate resumes, stage progression, candidate match ratings, and download verified applicant credentials.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{applications.length} Candidate Submissions</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{shortlistedCount} Shortlisted & Qualified</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{avgRating} Avg Candidate Rating</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-xl text-white flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Talent Pipeline</div>
              <div className="text-[11px] text-white/80 mt-0.5">Add candidate or export archive</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 px-3 py-2.5 rounded-2xl bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Applicant</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2.5 rounded-[12px] bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs border border-white/25 flex items-center justify-center cursor-pointer transition-all"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
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
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-sky-500/40 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">In Interview Loop</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-sky-200/60 dark:border-indigo-800/50 shadow-xs">
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
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {stg === 'ALL' ? 'All Stages' : stg}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Mobile Responsive Grid View (Hidden on Desktop) */}
        <div className="block md:hidden p-3.5 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-blue-400/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{a.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{a.id}</div>
                    </div>
                    <span className="inline-flex items-center font-black text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md text-[10px] shrink-0">
                      {a.rating}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{a.role}</span>
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
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                    <div>{a.email}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{a.phone} • Applied: {a.date}</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedApp(a)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Dossier</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
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
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-600 dark:text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px]"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-lg w-full shadow-2xl border border-sky-200/60 dark:border-indigo-800/60 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-100/80 dark:border-sky-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/60 dark:via-sky-900/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 ring-4 ring-sky-500/15">
                  <UserPlus className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Add Candidate Application
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Register inbound candidate resume, credentials, and match evaluation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="overflow-y-auto flex-1 p-6 sm:p-7 space-y-4 text-xs relative z-10 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold shadow-md shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-sky-200/60 dark:border-indigo-800/60 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            <div className="flex items-start justify-between border-b border-sky-100/80 dark:border-sky-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-500/25">
                  {selectedApp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedApp.name}</h3>
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 whitespace-nowrap">
                    {selectedApp.role} • {selectedApp.department}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
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

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contact Information</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedApp.email}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedApp.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Resume Profile Summary</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl leading-relaxed border border-slate-200/60 dark:border-slate-700/50">
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
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer text-xs transition-colors"
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
