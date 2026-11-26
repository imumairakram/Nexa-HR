import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../../components/common/SparkMetricCard';
import { JobCardSkeleton } from '../../../components/common/Skeleton';
import JobCard from './JobCard';
import { api } from '../../../services/api';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MapPin,
  Banknote,
  Users,
  CheckCircle2,
  Clock,
  X,
  MoreVertical,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Building2,
  Share2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const INITIAL_JOBS = [];

const JobsWorkspace = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const mobileFilterRef = useRef(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('recent'); // 'recent' | 'title' | 'applicants'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [toastMsg, setToastMsg] = useState('');

  // Side-drawer state (Create / Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    title: '',
    dept: 'Engineering & DevOps',
    location: 'Islamabad HQ / Remote',
    type: 'Full-Time',
    experience: '3 - 5 Years',
    salary: 'PKR 120k - PKR 150k',
    status: 'ACTIVE',
    description: '',
  });

  const [telemetry, setTelemetry] = useState(null);

  const loadData = async (bypassCache = false) => {
    setLoading(true);
    try {
      const [jobsRes, statsRes, deptRes] = await Promise.allSettled([
        api.getJobOpenings({}, { bypassCache }),
        api.getRecruitmentStats({ bypassCache }),
        api.getDepartments(),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.success && Array.isArray(jobsRes.value.data?.jobs)) {
        let dbJobs = jobsRes.value.data.jobs;

        // Auto-heal: If user previously created jobs locally in localStorage (e.g. "Full-Stack Developer"),
        // sync them to the live database so they persist and show across all devices!
        try {
          const cached = JSON.parse(localStorage.getItem('nexahr_recruitment_jobs') || '[]');
          if (Array.isArray(cached) && cached.length > 0) {
            const unsynced = cached.filter(
              (c) => c && typeof c.id === 'string' && c.id.startsWith('job-') &&
                     !dbJobs.some((dj) => dj.title?.trim().toLowerCase() === c.title?.trim().toLowerCase())
            );
            if (unsynced.length > 0) {
              for (const u of unsynced) {
                try {
                  const syncRes = await api.createJobOpening({
                    title: u.title,
                    department: u.department || u.dept || 'Engineering & DevOps',
                    location: u.location || 'Islamabad HQ / Remote',
                    type: u.type || 'Full-Time',
                    experience: u.experience || '3+ Years',
                    salary: u.salary || 'PKR 100k - PKR 140k',
                    status: u.status || 'ACTIVE',
                    description: u.description || '',
                  });
                  if (syncRes?.success && syncRes.data?.job) {
                    dbJobs = [syncRes.data.job, ...dbJobs];
                  }
                } catch (syncErr) {
                  console.warn('Auto-sync legacy local job failed:', syncErr);
                }
              }
            }
          }
        } catch (e) {}

        setJobs(dbJobs);
        try {
          localStorage.setItem('nexahr_recruitment_jobs', JSON.stringify(dbJobs));
        } catch (e) {}
      } else {
        // Fallback only if database API completely failed (e.g. offline)
        try {
          const cached = localStorage.getItem('nexahr_recruitment_jobs');
          if (cached) {
            setJobs(JSON.parse(cached));
          } else {
            setJobs([]);
          }
        } catch {
          setJobs([]);
        }
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value.data) {
        setTelemetry(statsRes.value.data);
      }

      if (deptRes.status === 'fulfilled' && deptRes.value?.success && deptRes.value.data?.departments) {
        const depts = deptRes.value.data.departments;
        setDepartments(depts);
        if (depts.length > 0 && !form.dept) {
          setForm((prev) => ({ ...prev, dept: depts[0].name }));
        }
      }
    } catch (err) {
      console.error('Failed to load recruitment jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileFilterRef.current && !mobileFilterRef.current.contains(e.target)) {
        setShowMobileFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleShareJob = (job) => {
    try {
      const shareUrl = `${window.location.origin}/careers/${job.id}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        showToast(`Job link copied to clipboard`);
      } else {
        showToast(`Job link: ${shareUrl}`);
      }
    } catch (e) {
      showToast('Job link copied to clipboard');
    }
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
    setFormError('');
    setForm({
      title: '',
      dept: departments.length > 0 ? departments[0].name : 'Engineering & DevOps',
      location: 'Islamabad HQ / Remote',
      type: 'Full-Time',
      experience: '3 - 5 Years',
      salary: 'PKR 120k - PKR 150k',
      status: 'ACTIVE',
      description: '',
    });
    setIsDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormError('');
    setForm({
      title: job.title || '',
      dept: job.dept || job.department || (departments.length > 0 ? departments[0].name : 'Engineering & DevOps'),
      location: job.location || 'Islamabad HQ / Remote',
      type: job.type || 'Full-Time',
      experience: job.experience || '3+ Years',
      salary: job.salary || 'PKR 120k - PKR 150k',
      status: job.status || 'ACTIVE',
      description: job.description || '',
    });
    setIsDrawerOpen(true);
  };

  // Save handler (Create / Edit) with Live Backend Integration
  const handleSaveJob = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) {
      setFormError('Please provide a Job Title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        department: form.dept || (departments.length > 0 ? departments[0].name : 'Engineering & DevOps'),
        location: form.location.trim() || 'Islamabad HQ / Remote',
        type: form.type || 'Full-Time',
        experience: form.experience.trim() || '3+ Years',
        salary: form.salary.trim() || 'PKR 100k - PKR 140k',
        status: form.status || 'ACTIVE',
        description: form.description.trim() || 'Role overview and core technical deliverable expectations.',
      };

      if (editingJob) {
        let updated = null;
        if (typeof editingJob.id === 'string' && editingJob.id.startsWith('job-')) {
          const res = await api.createJobOpening(payload);
          if (res?.success && res.data?.job) {
            updated = res.data.job;
          }
        } else {
          const res = await api.updateJobOpening(editingJob.id, payload);
          if (res?.success && res.data?.job) {
            updated = res.data.job;
          }
        }

        if (!updated) {
          throw new Error('Failed to update job requisition in database.');
        }

        const nextJobs = jobs.map((j) => (j.id === editingJob.id ? updated : j));
        persistJobs(nextJobs);
        showToast(`Requisition "${form.title}" updated and synced to database!`);
        setIsDrawerOpen(false);

        api.getRecruitmentStats({ bypassCache: true }).then((s) => s?.success && s.data && setTelemetry(s.data)).catch(() => {});
      } else {
        const res = await api.createJobOpening(payload);
        if (!res?.success || !res.data?.job) {
          throw new Error(res?.message || 'Failed to publish job opening to database.');
        }

        const createdJob = res.data.job;
        const nextJobs = [createdJob, ...jobs.filter((j) => j.id !== createdJob.id)];
        persistJobs(nextJobs);
        showToast(`Job requisition "${form.title}" published and saved to database!`);
        setIsDrawerOpen(false);

        // Instantly refresh telemetry metrics
        api.getRecruitmentStats({ bypassCache: true }).then((s) => s?.success && s.data && setTelemetry(s.data)).catch(() => {});
      }
    } catch (err) {
      console.error('Error saving job to database:', err);
      const msg = err.message || 'Failed to save job requisition to database. Please check your network connection.';
      setFormError(msg);
      showToast(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Job with Live Backend Integration
  const handleDeleteJob = async (id) => {
    try {
      if (typeof id === 'string' && !id.startsWith('job-')) {
        await api.deleteJobOpening(id);
      }
      const updated = jobs.filter((j) => j.id !== id);
      persistJobs(updated);
      showToast('Job requisition deleted successfully');
      api.getRecruitmentStats({ bypassCache: true }).then((s) => s?.success && s.data && setTelemetry(s.data)).catch(() => {});
    } catch (err) {
      console.error('Failed to delete job:', err);
      showToast(err.message || 'Failed to delete job requisition');
    }
  };

  // Toggle status with Live Backend Integration
  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      if (typeof job.id === 'string' && !job.id.startsWith('job-')) {
        const res = await api.toggleJobOpeningStatus(job.id);
        if (res?.success && res.data?.job) {
          const next = jobs.map((j) => (j.id === job.id ? res.data.job : j));
          persistJobs(next);
          showToast(`Job status set to ${res.data.job.status}`);
          api.getRecruitmentStats({ bypassCache: true }).then((s) => s?.success && s.data && setTelemetry(s.data)).catch(() => {});
          return;
        }
      }
      const next = jobs.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j));
      persistJobs(next);
      showToast(`Job status set to ${nextStatus}`);
      api.getRecruitmentStats({ bypassCache: true }).then((s) => s?.success && s.data && setTelemetry(s.data)).catch(() => {});
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast(err.message || 'Failed to toggle status');
    }
  };

  // Departments List
  const allDepartmentNames = useMemo(() => {
    return Array.from(
      new Set([
        'Engineering & DevOps',
        'Product & Design',
        'People Operations & HR',
        'Finance & Accounts',
        ...departments.map((d) => d.name),
        ...jobs.map((j) => j.dept || j.department),
      ].filter(Boolean))
    );
  }, [departments, jobs]);

  // Filtering
  const filteredJobs = jobs.filter((job) => {
    let q = searchQuery.toLowerCase().trim();
    let typeFilter = null;
    if (q.includes('type:')) {
      const match = q.match(/type:([a-zA-Z0-9_-]+)/);
      if (match) {
        typeFilter = match[1].replace(/_/g, '-');
        q = q.replace(/type:[a-zA-Z0-9_-]+/, '').trim();
      }
    }

    if (typeFilter) {
      const jobType = (job.type || '').toLowerCase().replace(/[\s_]+/g, '-');
      if (!jobType.includes(typeFilter)) {
        return false;
      }
    }

    const jobDept = (job.dept || job.department || '').toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      jobDept.includes(q) ||
      (job.location || '').toLowerCase().includes(q) ||
      (job.description && job.description.toLowerCase().includes(q));
    const matchesDept = deptFilter === 'ALL' || (job.dept || job.department) === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Sorting
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (sortField === 'applicants') {
        comparison = (a.applicants || 0) - (b.applicants || 0);
      } else {
        comparison = (b.id || 0) - (a.id || 0);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredJobs, sortField, sortOrder]);

  // Telemetry computations with dynamic fallback
  const totalOpenings = telemetry?.activeOpenings ?? jobs.filter((j) => j.status === 'ACTIVE').length;
  const totalApplicants = telemetry?.totalApplicants ?? jobs.reduce((acc, curr) => acc + (curr.applicants || 0), 0);
  const totalPaused = telemetry?.pausedOpenings ?? jobs.filter((j) => j.status === 'PAUSED').length;
  const offerRate = (totalOpenings === 0 && totalApplicants === 0) ? '0%' : (telemetry?.offerAcceptanceRate || '0%');

  // 7-day Sparkline Dates ending Today (e.g. Oct 14 ... Oct 20)
  const sparkDates = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return list;
  }, []);

  const openingsSparkData = useMemo(() => {
    const total = totalOpenings || 0;
    const progression = total > 0 ? [
      Math.max(1, total - 2),
      Math.max(1, total - 2),
      Math.max(1, total - 1),
      Math.max(1, total - 1),
      Math.max(1, total),
      Math.max(1, total),
      total,
    ] : [0, 0, 0, 0, 0, 0, 0];
    return sparkDates.map((day, i) => ({
      value: progression[i],
      label: day,
      tooltip: `${day}: ${progression[i]} Published Roles`,
    }));
  }, [totalOpenings, sparkDates]);

  const applicantsSparkData = useMemo(() => {
    const base = totalApplicants || 0;
    const progression = base > 0 ? [
      Math.max(0, base - 14),
      Math.max(0, base - 10),
      Math.max(0, base - 7),
      Math.max(0, base - 5),
      Math.max(0, base - 2),
      Math.max(0, base - 1),
      base,
    ] : [0, 0, 0, 0, 0, 0, 0];
    return sparkDates.map((day, i) => ({
      value: progression[i],
      label: day,
      tooltip: `${day}: ${progression[i]} Candidates`,
    }));
  }, [totalApplicants, sparkDates]);

  const pausedSparkData = useMemo(() => {
    const base = totalPaused || 0;
    const progression = base > 0 ? [
      Math.max(0, base),
      Math.max(0, base + 1),
      Math.max(0, base + 1),
      Math.max(0, base),
      Math.max(0, base + 1),
      base,
      base,
    ] : [0, 0, 0, 0, 0, 0, 0];
    return sparkDates.map((day, i) => ({
      value: progression[i],
      label: day,
      tooltip: `${day}: ${progression[i]} Paused Roles`,
    }));
  }, [totalPaused, sparkDates]);

  const offerSparkData = useMemo(() => {
    const num = parseFloat(String(offerRate).replace('%', '')) || 0;
    const progression = num > 0 ? [
      Math.max(0, num - 4.5),
      Math.max(0, num - 3.2),
      Math.max(0, num - 2.8),
      Math.max(0, num - 1.5),
      Math.max(0, num - 0.7),
      Math.max(0, num - 0.2),
      num,
    ] : [0, 0, 0, 0, 0, 0, 0];
    return sparkDates.map((day, i) => ({
      value: progression[i],
      label: day,
      tooltip: `${day}: ${progression[i].toFixed(1)}% Acceptance`,
    }));
  }, [offerRate, sparkDates]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Recruitment Jobs Workspace"
        subtitle="Consolidated active job openings, applicant pipelines, talent conversion telemetry, and requisition lifecycle management."
      />

      {/* Toast */}
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
      {/* 1. HERO COMMAND BANNER (INTEGRATING JOB DESK TELEMETRY) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-6 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Talent Requisitions & Open Positions Desk
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-xl font-medium">
              Oversee corporate headcount expansion, manage job openings across all functional branches, and advance high-caliber applicants seamlessly into the ATS pipeline.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{jobs.length} Total Postings</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{totalOpenings} Active Requisitions</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{totalApplicants} Active Candidates Sourced</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                <span>{offerRate} Acceptance Rate</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-3 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] dark:text-white font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Job Opening</span>
            </button>
            <button
              onClick={() => navigate('/app/recruitment/pipeline')}
              className="px-4 py-2.5 rounded-[12px] bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs border border-white/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Users className="w-3.5 h-3.5 text-[#3CC1E6]" />
              <span>Go to ATS Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RECRUITMENT KPI TELEMETRY CARDS (SPARK METRIC CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Published Openings */}
        <SparkMetricCard
          variant="light"
          title="Published Openings"
          value={totalOpenings}
          unit={totalOpenings === 1 ? 'Role' : 'Roles'}
          badgeText={totalOpenings > 0 ? `${totalOpenings} Active` : '0 Roles'}
          badgeType="positive"
          badgeIcon="up"
          subtext="Active Requisitions"
          chartColor="sky"
          presetWave="wave1"
          dataPoints={openingsSparkData}
          loading={loading}
          onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
        />

        {/* Card 2: Light Card - Total Applicants */}
        <SparkMetricCard
          variant="light"
          title="Total Applicants"
          value={totalApplicants}
          unit={totalApplicants === 1 ? 'Candidate' : 'Candidates'}
          badgeText={totalApplicants > 0 ? `${totalApplicants} In Funnel` : '0 Candidates'}
          badgeType="positive"
          badgeIcon="up"
          subtext="Across All Requisitions"
          chartColor="orange"
          presetWave="wave2"
          dataPoints={applicantsSparkData}
          loading={loading}
          onClick={() => navigate('/app/recruitment/pipeline')}
        />

        {/* Card 3: Light Card - Paused / On Hold */}
        <SparkMetricCard
          variant="light"
          title="Paused / On Hold"
          value={totalPaused}
          unit={totalPaused === 1 ? 'Role' : 'Roles'}
          badgeText={totalPaused > 0 ? `${totalPaused} In Review` : 'Zero Backlog'}
          badgeType={totalPaused > 0 ? 'warning' : 'positive'}
          badgeIcon={totalPaused > 0 ? 'dot' : 'up'}
          subtext={totalPaused > 0 ? 'Pending allocation' : 'Zero Backlog'}
          chartColor="amber"
          presetWave="wave3"
          dataPoints={pausedSparkData}
          loading={loading}
          onClick={() => setStatusFilter(statusFilter === 'PAUSED' ? 'ALL' : 'PAUSED')}
        />

        {/* Card 4: Light Card - Offer Acceptance */}
        <SparkMetricCard
          variant="light"
          title="Offer Acceptance"
          value={typeof offerRate === 'string' && offerRate.includes('%') ? offerRate : `${offerRate}%`}
          badgeText="Target exceeded"
          badgeType="positive"
          badgeIcon="up"
          subtext="Target benchmark exceeded"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={offerSparkData}
          loading={loading}
          onClick={() => navigate('/app/recruitment/pipeline')}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. TOOLBAR CONTROLS (ROW 1: STATUS & ACTIONS, ROW 2: SEARCH & DEPT FILTER) */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        {/* ROW 1: Status Filter Tabs (Left) & Actions/Sort (Right) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 w-full relative" ref={mobileFilterRef}>
          {/* Left: Status Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[12px] p-1 shadow-2xs shrink-0 overflow-x-auto no-scrollbar scrollbar-none max-w-full">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-[12px] text-xs sm:text-[13px] font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === 'ALL'
                  ? 'bg-[#0E2A33] text-white dark:bg-[#0B3946] dark:text-[#E8F6FA]'
                  : 'text-[#5B727B] hover:text-[#0E2A33] dark:text-[#8FA8B1] dark:hover:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
              }`}
            >
              <span>All postings</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-[10px] font-semibold ${
                  statusFilter === 'ALL'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#5B727B] dark:text-[#8FA8B1]'
                }`}
              >
                {jobs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-[12px] text-xs sm:text-[13px] font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === 'ACTIVE'
                  ? 'bg-[#0E2A33] text-white dark:bg-[#0B3946] dark:text-[#E8F6FA]'
                  : 'text-[#5B727B] hover:text-[#0E2A33] dark:text-[#8FA8B1] dark:hover:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
              }`}
            >
              <span>Active requisitions</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-[10px] font-semibold ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#5B727B] dark:text-[#8FA8B1]'
                }`}
              >
                {jobs.filter((j) => j.status === 'ACTIVE').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('PAUSED')}
              className={`px-3 py-1.5 rounded-[12px] text-xs sm:text-[13px] font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === 'PAUSED'
                  ? 'bg-[#0E2A33] text-white dark:bg-[#0B3946] dark:text-[#E8F6FA]'
                  : 'text-[#5B727B] hover:text-[#0E2A33] dark:text-[#8FA8B1] dark:hover:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
              }`}
            >
              <span>Paused / on hold</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-[10px] font-semibold ${
                  statusFilter === 'PAUSED'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#5B727B] dark:text-[#8FA8B1]'
                }`}
              >
                {jobs.filter((j) => j.status === 'PAUSED').length}
              </span>
            </button>
          </div>

          {/* Right: Controls (Sort + New Opening CTA + Mobile Filter) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-end ml-auto">
            {/* Sort Dropdown */}
            <div className="relative shrink-0 hidden sm:block">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="appearance-none bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] text-[#0E2A33] dark:text-[#E6F2F5] text-xs sm:text-[13px] font-medium rounded-[12px] pl-3 pr-7 py-2 shadow-2xs focus:outline-none cursor-pointer whitespace-nowrap"
              >
                <option value="recent">Sort: Date</option>
                <option value="title">Sort: Title</option>
                <option value="applicants">Sort: Applicants</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#5B727B] dark:text-[#8FA8B1] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* New Opening CTA */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="bg-[#0A8FB5] hover:bg-[#07617D] text-white font-semibold text-xs sm:text-[13px] px-3.5 py-2 rounded-[12px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New opening</span>
            </button>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilter((prev) => !prev)}
              className={`sm:hidden flex items-center justify-center gap-1.5 h-[38px] px-3 rounded-[12px] border text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0 ${
                deptFilter !== 'ALL' || statusFilter !== 'ALL' || sortField !== 'recent' || showMobileFilter
                  ? 'bg-[#E1F4FA] dark:bg-[#12333D] border-[#0A8FB5] dark:border-[#3CC1E6] text-[#07617D] dark:text-[#3CC1E6]'
                  : 'bg-white dark:bg-[#112229] border-[#DCE6EA] dark:border-[#223840] text-[#0E2A33] dark:text-[#E6F2F5] hover:border-[#0A8FB5]'
              }`}
              title="Filter & sort options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span>Filter</span>
              {(deptFilter !== 'ALL' || statusFilter !== 'ALL' || sortField !== 'recent') && (
                <span className="w-2 h-2 rounded-full bg-[#0A8FB5] dark:bg-[#3CC1E6]" />
              )}
            </button>
          </div>

          {/* Mobile Filter Popover Drawer (Status + Sort + Department) */}
          {showMobileFilter && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 space-y-3.5">
              {/* Header with Title & Reset All */}
              <div className="flex items-center justify-between pb-2 border-b border-[#DCE6EA] dark:border-[#223840]">
                <span className="text-xs font-bold text-[#0E2A33] dark:text-[#E6F2F5] uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#0A8FB5]" />
                  Filters & Sort
                </span>
                {(statusFilter !== 'ALL' || deptFilter !== 'ALL' || sortField !== 'recent') && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('ALL');
                      setDeptFilter('ALL');
                      setSortField('recent');
                    }}
                    className="text-[11px] font-bold text-[#0A8FB5] hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* 1. Status Filter Section */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#5B727B] dark:text-[#8FA8B1] uppercase tracking-wider block">
                  Requisition Status
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { key: 'ALL', label: 'All postings', count: jobs.length },
                    { key: 'ACTIVE', label: 'Active requisitions', count: jobs.filter((j) => j.status === 'ACTIVE').length },
                    { key: 'PAUSED', label: 'Paused / on hold', count: jobs.filter((j) => j.status === 'PAUSED').length },
                  ].map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setStatusFilter(st.key)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all cursor-pointer ${
                        statusFilter === st.key
                          ? 'bg-[#0E2A33] text-white dark:bg-[#0B3946] dark:text-[#E8F6FA] font-bold'
                          : 'text-[#0E2A33] dark:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          statusFilter === st.key
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#5B727B] dark:text-[#8FA8B1]'
                        }`}
                      >
                        {st.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Sort By Section */}
              <div className="space-y-1.5 pt-2 border-t border-[#DCE6EA] dark:border-[#223840]">
                <span className="text-[10px] font-bold text-[#5B727B] dark:text-[#8FA8B1] uppercase tracking-wider block">
                  Sort Order
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: 'recent', label: 'Date' },
                    { key: 'title', label: 'Title' },
                    { key: 'applicants', label: 'Applicants' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSortField(s.key)}
                      className={`px-2 py-1.5 rounded-[12px] text-xs font-medium text-center transition-all cursor-pointer truncate ${
                        sortField === s.key
                          ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] font-bold border border-[#0A8FB5]/40'
                          : 'border border-[#DCE6EA] dark:border-[#223840] text-[#5B727B] dark:text-[#8FA8B1] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Department Section */}
              <div className="space-y-1.5 pt-2 border-t border-[#DCE6EA] dark:border-[#223840]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#5B727B] dark:text-[#8FA8B1] uppercase tracking-wider">
                    Department
                  </span>
                  {deptFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setDeptFilter('ALL')}
                      className="text-[10px] font-semibold text-[#0A8FB5] hover:underline"
                    >
                      Reset Dept
                    </button>
                  )}
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setDeptFilter('ALL');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all cursor-pointer ${
                      deptFilter === 'ALL'
                        ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] font-bold'
                        : 'text-[#0E2A33] dark:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
                    }`}
                  >
                    <span>All Departments</span>
                    <span className="text-[10px] text-[#5B727B] dark:text-[#8FA8B1]">{jobs.length}</span>
                  </button>
                  {allDepartmentNames.map((d) => {
                    const count = jobs.filter((j) => (j.dept || j.department) === d).length;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setDeptFilter(d);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all cursor-pointer ${
                          deptFilter === d
                            ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] font-bold'
                            : 'text-[#0E2A33] dark:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
                        }`}
                      >
                        <span className="truncate pr-2">{d}</span>
                        <span className="text-[10px] text-[#5B727B] dark:text-[#8FA8B1]">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Close / Apply button */}
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-2 rounded-[12px] bg-[#0A8FB5] text-white text-xs font-bold hover:bg-[#07617D] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* ROW 2: Searchbar (Left) & All Department Dropdown (Right) */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full">
          {/* Search Input Container */}
          <div className="flex-1 min-w-0 bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[12px] px-3 sm:px-3.5 py-2 flex items-center gap-2 shadow-2xs focus-within:border-[#0A8FB5] dark:focus-within:border-[#3CC1E6] transition-colors">
            <Search className="w-4 h-4 text-[#5B727B] dark:text-[#8FA8B1] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search job requisitions, skills, locations"
              className="w-full bg-transparent border-0 outline-none text-xs sm:text-[13px] text-[#0E2A33] dark:text-[#E6F2F5] placeholder-[#5B727B]/70 min-w-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#5B727B] hover:text-[#0E2A33] dark:text-[#8FA8B1] dark:hover:text-white p-0.5 rounded-full cursor-pointer shrink-0"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!searchQuery.toLowerCase().includes('type:full_time')) {
                  setSearchQuery((prev) => (prev ? `${prev.trim()} type:full_time` : 'type:full_time'));
                }
              }}
              className="hidden sm:inline-block text-xs text-[#5B727B] hover:text-[#0A8FB5] dark:text-[#8FA8B1] dark:hover:text-[#3CC1E6] shrink-0 cursor-pointer font-medium transition-colors whitespace-nowrap"
            >
              Try type:full_time
            </button>
            <kbd className="hidden md:inline-flex text-[11px] font-medium bg-[#F5F8F9] dark:bg-[#0D1B21] border border-[#DCE6EA] dark:border-[#223840] text-[#5B727B] dark:text-[#8FA8B1] px-1.5 py-0.5 rounded-[6px] shrink-0 select-none">
              ⌘K
            </kbd>
          </div>

          {/* Department Dropdown */}
          <div className="relative shrink-0">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] text-[#0E2A33] dark:text-[#E6F2F5] text-xs sm:text-[13px] font-medium rounded-[12px] pl-3 pr-7 py-2 shadow-2xs focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
            >
              <option value="ALL">All departments</option>
              {allDepartmentNames.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#5B727B] dark:text-[#8FA8B1] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Active Filter Tags (Mobile Only) */}
        {(deptFilter !== 'ALL' || statusFilter !== 'ALL' || sortField !== 'recent') && (
          <div className="md:hidden flex items-center gap-1.5 flex-wrap pt-0.5">
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] text-xs font-semibold">
                <span>Status: {statusFilter === 'ACTIVE' ? 'Active' : 'Paused'}</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className="hover:text-rose-500 cursor-pointer p-0.5"
                  title="Clear status filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {deptFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] text-xs font-semibold">
                <span>Dept: {deptFilter}</span>
                <button
                  type="button"
                  onClick={() => setDeptFilter('ALL')}
                  className="hover:text-rose-500 cursor-pointer p-0.5"
                  title="Clear department filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortField !== 'recent' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] text-xs font-semibold">
                <span>Sort: {sortField === 'title' ? 'Title' : 'Applicants'}</span>
                <button
                  type="button"
                  onClick={() => setSortField('recent')}
                  className="hover:text-rose-500 cursor-pointer p-0.5"
                  title="Reset sort"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. ACTIVE JOBS DISPLAY (ZERO-LAYOUT-SHIFT SKELETONS) */}
      {/* ========================================================================= */}
      {loading ? (
        <JobCardSkeleton count={6} />
      ) : jobs.length === 0 ? (
        /* STEP 7: Single page-level empty state when zero jobs overall */
        <div className="py-16 px-6 text-center border border-dashed border-[#DCE6EA] dark:border-[#223840] rounded-[24px] bg-white dark:bg-[#112229] mt-4 flex flex-col items-center justify-center max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] flex items-center justify-center mb-4">
            <Briefcase className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-[#0E2A33] dark:text-[#E6F2F5] mb-1">
            No job postings yet
          </h3>
          <p className="text-sm text-[#5B727B] dark:text-[#8FA8B1] max-w-sm mb-6 leading-relaxed">
            Create your first job requisition to publish openings, track applicants, and accelerate your recruitment pipeline.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[12px] bg-[#0A8FB5] hover:bg-[#07617D] dark:bg-[#3CC1E6] dark:hover:bg-[#7FD8F1] text-white dark:text-[#06222B] font-semibold text-sm transition-all cursor-pointer shadow-sm hover:shadow active:scale-98 focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create job</span>
          </button>
        </div>
      ) : (
        /* POSTED JOB CARDS GRID (COMPACT & SCANNABLE) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 mt-4 items-start">
          {sortedJobs.length > 0 ? (
            sortedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewApplicants={() => navigate('/app/recruitment/pipeline')}
                onShare={handleShareJob}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteJob}
                onToggleStatus={handleToggleStatus}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-[#5B727B] dark:text-[#8FA8B1] text-sm border border-dashed border-[#DCE6EA] dark:border-[#223840] rounded-[20px] bg-white dark:bg-[#112229]">
              <p className="font-medium text-[#0E2A33] dark:text-[#E6F2F5] mb-1">No matching postings</p>
              <p className="text-xs">Try adjusting your search query, status, or department filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. JOB REQUISITION MODAL (NEW TICKET CARD UI ARCHITECTURE) */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-9 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                  <Briefcase className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingJob ? 'Edit Job Requisition' : 'Create Job Opening'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingJob ? 'Update requisition details, classification, and compensation.' : 'Publish opening to corporate careers portal and applicant tracking.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inline Error Alert */}
            {formError && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-300 font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveJob} className="space-y-5">
              {/* Row 1: Job Title */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <Briefcase className="w-3.5 h-3.5 text-sky-500" />
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Product Designer / Senior Full-Stack Engineer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                />
              </div>

              {/* Row 2: Department & Requisition Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-sky-500" />
                    Department
                  </label>
                  <select
                    value={form.dept}
                    onChange={(e) => setForm({ ...form, dept: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                  >
                    {departments.length > 0 ? (
                      departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Engineering & DevOps">Engineering & DevOps</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="People Operations & HR">People Operations & HR</option>
                        <option value="Finance & Accounts">Finance & Accounts</option>
                        <option value="Growth & Marketing">Growth & Marketing</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                    Requisition Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="ACTIVE">Active (Published)</option>
                    <option value="PAUSED">Paused (Internal Hold)</option>
                    <option value="CLOSED">Closed (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Location Hub & Contract Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                    Location Hub <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Islamabad HQ (On-Site) / Remote"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    Contract Format
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="Full-Time Permanent">Full-Time Permanent</option>
                    <option value="Full-Time Remote">Full-Time Remote</option>
                    <option value="Fixed-Term Contract">Fixed-Term Contract</option>
                    <option value="Internship">Internship / Fellow</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Experience Seniority & Compensation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                    Experience Seniority
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3+ Years / Senior Lead"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <Banknote className="w-3.5 h-3.5 text-sky-500" />
                    Compensation Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PKR 100k - PKR 140k"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Row 5: Role Overview & Qualifications */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" />
                  Role Overview & Key Qualifications
                </label>
                <textarea
                  rows={4}
                  placeholder="Outline mission, key technical expectations, deliverables, and requirements..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all leading-relaxed shadow-inner"
                />
              </div>

              {/* Live Requisition Preview Strip */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/70 via-sky-50/30 to-transparent dark:from-sky-950/40 dark:via-slate-800/50 border border-sky-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-sky-500/20 ring-2 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                    <Briefcase className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {form.title || 'Untitled Opening'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {form.dept} • {form.location || 'Location Hub'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-[12px] text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
                    {form.type}
                  </span>
                  {form.salary && (
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-[12px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                      {form.salary}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-6 py-2.5 rounded-[12px] text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingJob ? (isSubmitting ? 'Saving...' : 'Save Requisition') : (isSubmitting ? 'Publishing...' : 'Publish Job Opening')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsWorkspace;
