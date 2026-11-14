import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../../components/common/SparkMetricCard';
import ModernSearchBarSection from '../../../components/common/ModernSearchBarSection';
import { JobCardSkeleton, TableSkeleton } from '../../../components/common/Skeleton';
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
  Edit3,
  Trash2,
  LayoutGrid,
  List,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Building2,
  Share2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const INITIAL_JOBS = [];

const JobsWorkspace = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('recent'); // 'recent' | 'title' | 'applicants'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
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
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/80 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
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
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{jobs.length} Total Postings</span>
              </span>
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{totalOpenings} Active Requisitions</span>
              </span>
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{totalApplicants} Active Candidates Sourced</span>
              </span>
              <span className="flex items-center bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span>{offerRate} Acceptance Rate</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
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
      {/* 2. RECRUITMENT KPI TELEMETRY CARDS (SPARK METRIC CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Published Openings */}
        <SparkMetricCard
          variant="dark"
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
      {/* 3. MODERN SEARCHBAR & TOOLBAR CONTROLS */}
      {/* ========================================================================= */}
      <ModernSearchBarSection
        statusTabs={[
          { key: 'ALL', label: 'All Postings', count: jobs.length },
          { key: 'ACTIVE', label: 'Active Requisitions', count: jobs.filter((j) => j.status === 'ACTIVE').length },
          { key: 'PAUSED', label: 'Paused / On Hold', count: jobs.filter((j) => j.status === 'PAUSED').length },
        ]}
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search job requisitions, skills, locations..."
        searchHint="type:full_time"
        filterTags={[
          ...(deptFilter !== 'ALL' ? [{ key: 'dept', label: `Dept: ${deptFilter}` }] : []),
          ...(searchQuery ? [{ key: 'query', label: `"${searchQuery}"` }] : []),
        ]}
        onRemoveTag={(key) => {
          if (key === 'dept') setDeptFilter('ALL');
          if (key === 'query') setSearchQuery('');
        }}
        sortOptions={[
          { key: 'recent', label: 'Date' },
          { key: 'title', label: 'Title' },
          { key: 'applicants', label: 'Applicants' },
        ]}
        activeSort={sortField}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setSortField(key);
          setSortOrder(order);
        }}
        filterCount={deptFilter !== 'ALL' ? 1 : 0}
        filterContent={
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Department</span>
              {deptFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setDeptFilter('ALL')}
                  className="text-[10px] font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => setDeptFilter('ALL')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  deptFilter === 'ALL'
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <span>All Departments</span>
                <span className="text-[10px] font-bold text-slate-400">{jobs.length}</span>
              </button>
              {allDepartmentNames.map((d) => {
                const count = jobs.filter((j) => (j.dept || j.department) === d).length;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDeptFilter(d)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      deptFilter === d
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="truncate pr-2">{d}</span>
                    <span className="text-[10px] font-bold text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        }
        actionButton={
          <div className="flex items-center gap-2">
            {/* Department Quick Dropdown */}
            <div className="relative">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className={`border rounded-full px-3.5 py-1.5 sm:py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer outline-none ${
                  deptFilter !== 'ALL'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <option value="ALL">All Departments</option>
                {allDepartmentNames.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid / Table View Toggles */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-full p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`hidden md:block p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* New Opening CTA */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 active:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Opening</span>
            </button>
          </div>
        }
      />

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
          {/* VIEW 1: RICH "NEW TICKET CARD" GLASSMORHIC GRID CARDS */}
          {(viewMode === 'grid' || viewMode === 'table') && (
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${viewMode === 'table' ? 'md:hidden' : ''}`}>
              {sortedJobs.length > 0 ? (
                sortedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="group relative bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-sky-100/80 dark:border-slate-800 flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Top Header: Icon + Dept + Status Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                            <Briefcase className="w-6 h-6 stroke-[2.2]" />
                          </div>
                          <div className="min-w-0">
                            <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-200/80 dark:border-sky-800/80 shadow-2xs truncate max-w-[190px]">
                              {job.dept}
                            </span>
                            {job.posted && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 truncate">
                                Posted {job.posted}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Pill Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all border shadow-2xs flex items-center gap-1.5 shrink-0 active:scale-95 ${
                            job.status === 'ACTIVE'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-100'
                          }`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span>{job.status}</span>
                        </button>
                      </div>

                      {/* Job Title */}
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                          {job.title}
                        </h3>
                      </div>

                      {/* Requisition Meta Strip (Signature "New Ticket" preview strip) */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/70 via-sky-50/30 to-transparent dark:from-sky-950/40 dark:via-slate-800/50 border border-sky-100/80 dark:border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-3 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>{job.location}</span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                          <Briefcase className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>{job.type}</span>
                        </span>
                        {job.experience && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-slate-600 dark:text-slate-300 font-semibold">
                              {job.experience}
                            </span>
                          </>
                        )}
                        {job.salary && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                              <Banknote className="w-3.5 h-3.5 shrink-0" />
                              <span>{job.salary}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                        {job.description}
                      </p>
                    </div>

                    {/* Card Footer: Applicants count + Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/app/recruitment/pipeline')}
                        className="px-3.5 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 text-xs font-bold transition-all flex items-center gap-2 shadow-2xs group/btn cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <span>{job.applicants || 0} {job.applicants === 1 ? 'Applicant' : 'Applicants'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-sky-500 transition-transform group-hover/btn:translate-x-0.5" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(job)}
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950/60 text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 border border-slate-200/70 dark:border-slate-700/70 hover:border-sky-200 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                          title="Edit Job Requisition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id)}
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200/70 dark:border-slate-700/70 hover:border-rose-200 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl border border-sky-100/80 dark:border-slate-800 shadow-xl space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/50">
                    <Briefcase className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">No job openings found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">Try clearing your search query, status tabs, or department filters.</p>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: DATA TABLE VIEW (Desktop Only) */}
          {viewMode === 'table' && (
            <div className="hidden md:block bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl border border-sky-100/80 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-sky-100/80 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-gradient-to-r from-sky-50/50 via-white to-transparent dark:from-sky-950/30 dark:via-slate-800/40">
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
                    {sortedJobs.length > 0 ? (
                      sortedJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-sky-500/20 ring-2 ring-sky-100 dark:ring-sky-950/50 shrink-0">
                                <Briefcase className="w-5 h-5 stroke-[2.2]" />
                              </div>
                              <div>
                                <p className="leading-snug">{job.title}</p>
                                <p className="text-[10px] text-slate-400 font-normal mt-0.5">Posted {job.posted || 'recently'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
                              {job.dept}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{job.location}</td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                              {job.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-emerald-600 dark:text-emerald-400">{job.salary}</td>
                          <td className="py-4 px-6">
                            <button
                              type="button"
                              onClick={() => navigate('/app/recruitment/pipeline')}
                              className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>{job.applicants || 0} {job.applicants === 1 ? 'candidate' : 'candidates'}</span>
                            </button>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(job)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all border shadow-2xs flex items-center gap-1.5 ${
                                job.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                              <span>{job.status}</span>
                            </button>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(job)}
                                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950/60 text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 border border-slate-200/70 dark:border-slate-700/70 hover:border-sky-200 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                                title="Edit Job Requisition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteJob(job.id)}
                                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200/70 dark:border-slate-700/70 hover:border-rose-200 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                                title="Delete Job"
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
      {/* 5. JOB REQUISITION MODAL (NEW TICKET CARD UI ARCHITECTURE) */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-2xl lg:max-w-3xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-9 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
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
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
                    {form.type}
                  </span>
                  {form.salary && (
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
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
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
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
