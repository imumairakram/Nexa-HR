import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { JobCardSkeleton, TableSkeleton } from '../../../components/common/Skeleton';
import { api } from '../../../services/api';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  X,
  MoreVertical,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Edit3,
  Trash2,
  LayoutGrid,
  List,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Building2,
  Share2,
} from 'lucide-react';

const INITIAL_JOBS = [
  {
    id: 101,
    title: 'Senior React & Node Engineer',
    dept: 'Engineering & DevOps',
    location: 'Islamabad HQ / Hybrid',
    type: 'Full-Time',
    experience: '5 - 8 Years',
    salary: '$140k - $170k',
    applicants: 14,
    status: 'ACTIVE',
    posted: 'Aug 15, 2026',
    description: 'Lead high-throughput microservices, React design systems, PostgreSQL optimization, and cloud deployments.',
  },
  {
    id: 102,
    title: 'Lead Product Designer (Figma)',
    dept: 'Product & Design',
    location: 'Karachi Regional Hub',
    type: 'Full-Time',
    experience: '5 - 8 Years',
    salary: '$120k - $150k',
    applicants: 8,
    status: 'ACTIVE',
    posted: 'Aug 18, 2026',
    description: 'Architect multi-tenant design tokens, user flow journey maps, and intuitive enterprise SaaS interfaces.',
  },
  {
    id: 103,
    title: 'DevOps & Kubernetes Architect',
    dept: 'Engineering & DevOps',
    location: 'Remote & Distributed',
    type: 'Full-Time Remote',
    experience: '8+ Years',
    salary: '$150k - $185k',
    applicants: 6,
    status: 'ACTIVE',
    posted: 'Aug 20, 2026',
    description: 'Own Terraform infrastructure-as-code, CI/CD pipeline security, multi-region cluster resilience.',
  },
  {
    id: 104,
    title: 'Technical Talent Acquisition Partner',
    dept: 'People Operations & HR',
    location: 'Islamabad HQ',
    type: 'Full-Time',
    experience: '3 - 5 Years',
    salary: '$75k - $95k',
    applicants: 11,
    status: 'ACTIVE',
    posted: 'Aug 22, 2026',
    description: 'Scale engineering and executive hiring, drive pipeline velocity, manage candidate interview experience.',
  },
  {
    id: 105,
    title: 'Data Platform Engineer',
    dept: 'Engineering & DevOps',
    location: 'Remote & Distributed',
    type: 'Full-Time Remote',
    experience: '4 - 7 Years',
    salary: '$135k - $165k',
    applicants: 5,
    status: 'ACTIVE',
    posted: 'Aug 24, 2026',
    description: 'Build real-time telemetry streaming pipelines, ETL data lakes, and dimensional warehouse schemas.',
  },
  {
    id: 106,
    title: 'Financial Operations Analyst',
    dept: 'Finance & Accounts',
    location: 'Islamabad HQ',
    type: 'Full-Time',
    experience: '2 - 5 Years',
    salary: '$80k - $105k',
    applicants: 9,
    status: 'PAUSED',
    posted: 'Aug 10, 2026',
    description: 'Corporate budgeting, payroll ledger auditing, statutory fiscal compliance, and board reporting.',
  },
];

const JobsWorkspace = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [toastMsg, setToastMsg] = useState('');

  // Side-drawer state (Create / Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({
    title: '',
    dept: 'Engineering & DevOps',
    location: 'Islamabad HQ / Hybrid',
    type: 'Full-Time',
    experience: '3 - 5 Years',
    salary: '$100k - $130k',
    status: 'ACTIVE',
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      let saved = [];
      try {
        const local = localStorage.getItem('nexahr_recruitment_jobs');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.length > 0) saved = parsed;
        }
      } catch (e) {
        console.warn(e);
      }

      if (saved.length === 0) {
        saved = INITIAL_JOBS;
        try {
          localStorage.setItem('nexahr_recruitment_jobs', JSON.stringify(INITIAL_JOBS));
        } catch (e) {
          console.error(e);
        }
      }

      const res = await api.getDepartments();
      if (res?.success && res.data?.departments) {
        setDepartments(res.data.departments);
      }

      setJobs(saved);
    } catch (err) {
      console.error('Failed to load recruitment jobs:', err);
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const persistJobs = (updated) => {
    setJobs(updated);
    try {
      localStorage.setItem('nexahr_recruitment_jobs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Open Drawer for Create
  const handleOpenCreate = () => {
    setEditingJob(null);
    setForm({
      title: '',
      dept: departments.length > 0 ? departments[0].name : 'Engineering & DevOps',
      location: 'Islamabad HQ / Hybrid',
      type: 'Full-Time',
      experience: '3 - 5 Years',
      salary: '$110k - $140k',
      status: 'ACTIVE',
      description: '',
    });
    setIsDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      dept: job.dept,
      location: job.location,
      type: job.type,
      experience: job.experience || '3 - 5 Years',
      salary: job.salary,
      status: job.status || 'ACTIVE',
      description: job.description || '',
    });
    setIsDrawerOpen(true);
  };

  // Save handler (Create / Edit)
  const handleSaveJob = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingJob) {
      const updated = jobs.map((j) =>
        j.id === editingJob.id
          ? {
              ...j,
              ...form,
              title: form.title.trim(),
            }
          : j
      );
      persistJobs(updated);
      showToast(`Requisition "${form.title}" updated successfully!`);
    } else {
      const newJob = {
        id: Date.now(),
        title: form.title.trim(),
        dept: form.dept,
        location: form.location,
        type: form.type,
        experience: form.experience,
        salary: form.salary,
        status: form.status,
        applicants: 0,
        posted: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        description: form.description.trim() || 'Role overview and core technical deliverable expectations.',
      };
      persistJobs([newJob, ...jobs]);
      showToast(`New Job requisition "${form.title}" published!`);
    }

    setIsDrawerOpen(false);
  };

  // Delete Job
  const handleDeleteJob = (id) => {
    const updated = jobs.filter((j) => j.id !== id);
    persistJobs(updated);
    showToast('Job requisition deleted');
  };

  // Toggle status
  const handleToggleStatus = (job) => {
    const nextStatus = job.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = jobs.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j));
    persistJobs(updated);
    showToast(`Job status set to ${nextStatus}`);
  };

  // Filtering
  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(q) ||
      job.dept.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      (job.description && job.description.toLowerCase().includes(q));
    const matchesDept = deptFilter === 'ALL' || job.dept === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Telemetry computations
  const totalOpenings = jobs.filter((j) => j.status === 'ACTIVE').length;
  const totalApplicants = jobs.reduce((acc, curr) => acc + (curr.applicants || 0), 0);
  const totalPaused = jobs.filter((j) => j.status === 'PAUSED').length;

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Recruitment Jobs Workspace & Requisition Command"
        subtitle="Consolidated active job openings, applicant pipelines, talent conversion telemetry, and requisition lifecycle management."
      />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO COMMAND BANNER (INTEGRATING JOB DESK TELEMETRY) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Talent Requisitions & Open Positions Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-medium">
              Oversee corporate headcount expansion, manage job openings across all functional branches, and advance high-caliber applicants seamlessly into the ATS pipeline.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                <span>{totalOpenings} Active Requisitions</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>{totalApplicants} Active Candidates Sourced</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>18 Days Avg. Time to Fill</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Job Opening</span>
            </button>
            <button
              onClick={() => navigate('/app/recruitment/pipeline')}
              className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Go to ATS Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RECRUITMENT KPI TELEMETRY CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Published Openings</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalOpenings} <span className="text-base font-bold text-slate-400">Roles</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +2 new this week
              </span>
              <span className="text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Applicants</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {totalApplicants} <span className="text-base font-bold text-slate-400">Candidates</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Across all requisitions</span>
              <span className="text-slate-400">Talent Funnel</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Paused / On Hold</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalPaused} <span className="text-base font-bold text-slate-400">Roles</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Pending allocation</span>
              <span className="text-slate-400">Review</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-purple-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Offer Acceptance</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              92.4% <span className="text-base font-bold text-slate-400">Rate</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-purple-600 dark:text-purple-400 font-bold">Target benchmark exceeded</span>
              <span className="text-slate-400">Velocity</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TOOLBAR & VIEW CONTROLS */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search job requisitions, skills, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and View Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dept Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering & DevOps">Engineering & DevOps</option>
            <option value="Product & Design">Product & Design</option>
            <option value="People Operations & HR">People Operations & HR</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PAUSED">Paused Only</option>
          </select>

          {/* View Toggles */}
          <div className="flex items-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`hidden md:block p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Job Button */}
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Opening</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ACTIVE JOBS DISPLAY (ZERO-LAYOUT-SHIFT SKELETONS) */}
      {/* ========================================================================= */}
      {loading ? (
        <>
          <div className="md:hidden">
            <JobCardSkeleton count={6} />
          </div>
          <div className="hidden md:block">
            {viewMode === 'table' ? (
              <TableSkeleton rows={6} cols={6} />
            ) : (
              <JobCardSkeleton count={6} />
            )}
          </div>
        </>
      ) : (
        <>
          {/* VIEW 1: RICH GLASSMORHIC GRID CARDS (Always on mobile, and desktop when grid) */}
          {(viewMode === 'grid' || viewMode === 'table') && (
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 ${viewMode === 'table' ? 'md:hidden' : ''}`}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="group bg-white dark:bg-[#1E293B] rounded-[32px] p-6 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Header: Dept & Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                          {job.dept}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(job)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              job.status === 'ACTIVE'
                                ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {job.status}
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {job.title}
                      </h3>

                      {/* Meta Pills: Location, Type, Salary */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.location}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.type}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{job.salary}</span>
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    {/* Card Footer: Applicants count + Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => navigate('/app/recruitment/pipeline')}
                        className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <span>{job.applicants} Applicants</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(job)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
                          title="Edit Job Requisition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white dark:bg-[#1E293B] rounded-[32px] border border-slate-100 dark:border-slate-800">
                  <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No job openings found</h4>
                  <p className="text-xs text-slate-400 mt-1">Try clearing your search query or department filters</p>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: DATA TABLE VIEW (Desktop Only) */}
          {viewMode === 'table' && (
            <div className="hidden md:block bg-white dark:bg-[#1E293B] rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                      <th className="py-4 px-6">Job Title & Requisition</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Contract</th>
                      <th className="py-4 px-6">Compensation</th>
                      <th className="py-4 px-6">Candidates</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="leading-snug">{job.title}</p>
                                <p className="text-[10px] text-slate-400 font-normal">Posted {job.posted}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{job.dept}</td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{job.location}</td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                              {job.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-semibold text-emerald-600 dark:text-emerald-400">{job.salary}</td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => navigate('/app/recruitment/pipeline')}
                              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>{job.applicants} candidates</span>
                            </button>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                job.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(job)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                          No jobs matching filter criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 5. SLIDE-OUT SIDE-DRAWER (FRAMER MOTION ANIMATED) FOR CREATE / EDIT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Slide-out Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="w-screen max-w-xl bg-white dark:bg-[#1E293B] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {editingJob ? 'Edit Job Requisition' : 'Create Job Opening'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {editingJob ? 'Update requisition details and compensation' : 'Publish opening to corporate careers portal'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body with Smooth Scroll */}
                <form id="job-drawer-form" onSubmit={handleSaveJob} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Job Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior React & Node Engineer"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  {/* Department & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                      <select
                        value={form.dept}
                        onChange={(e) => setForm({ ...form, dept: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        <option value="Engineering & DevOps">Engineering & DevOps</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="People Operations & HR">People Operations & HR</option>
                        <option value="Finance & Accounts">Finance & Accounts</option>
                        <option value="Growth & Marketing">Growth & Marketing</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Requisition Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        <option value="ACTIVE">Active (Published)</option>
                        <option value="PAUSED">Paused (Internal Hold)</option>
                        <option value="CLOSED">Closed (Archived)</option>
                      </select>
                    </div>
                  </div>

                  {/* Location & Contract Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location Hub</label>
                      <input
                        type="text"
                        placeholder="Islamabad HQ / Remote"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contract Format</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        <option value="Full-Time">Full-Time Permanent</option>
                        <option value="Full-Time Remote">Full-Time Remote</option>
                        <option value="Contract">Fixed-Term Contract</option>
                        <option value="Internship">Internship / Fellow</option>
                      </select>
                    </div>
                  </div>

                  {/* Experience & Salary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Experience Seniority</label>
                      <input
                        type="text"
                        placeholder="e.g. 5 - 8 Years"
                        value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Compensation Range</label>
                      <input
                        type="text"
                        placeholder="e.g. $140k - $170k"
                        value={form.salary}
                        onChange={(e) => setForm({ ...form, salary: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                  </div>

                  {/* Description / Requirements */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Role Overview & Key Qualifications
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Outline mission, key technical expectations, deliverables, and requirements..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 leading-relaxed"
                    />
                  </div>
                </form>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="job-drawer-form"
                    className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
                  >
                    {editingJob ? 'Save Requisition' : 'Publish Job Opening'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobsWorkspace;
