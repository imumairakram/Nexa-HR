import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { TableSkeleton } from '../../../components/common/Skeleton';
import { api } from '../../../services/api';
import {
  Users,
  Search,
  Filter,
  Plus,
  X,
  Star,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Video,
  Mail,
  Phone,
  CheckCircle2,
  MapPin,
  Briefcase,
  FileText,
  UserCheck,
  Ban,
  RefreshCw,
  LayoutGrid,
  List,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  Trash2,
  Edit2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const STAGES = [
  { key: 'APPLIED', label: '1. Sourced & Applied', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300', dot: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-900/60' },
  { key: 'SCREENING', label: '2. Screening Call', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-900/60' },
  { key: 'INTERVIEWING', label: '3. Technical Interview', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300', dot: 'bg-purple-500', border: 'border-purple-200 dark:border-purple-900/60' },
  { key: 'OFFER', label: '4. Offer Extended', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300', dot: 'bg-indigo-500', border: 'border-indigo-200 dark:border-indigo-900/60' },
  { key: 'HIRED', label: '5. Signed & Hired', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-900/60' },
];

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
    resumeSummary: 'Full-stack specialist proficient in React 19, TypeScript, PostgreSQL, microservices, and Docker high-availability infrastructure.',
    interview: {
      interviewer: 'Sarah Jenkins',
      date: '2026-08-28',
      time: '14:30',
      type: 'System Architecture Round',
      link: 'https://meet.google.com/nxa-hr-auto',
    },
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
    resumeSummary: 'Proven track record designing enterprise SaaS design systems, user journey wireframes, and design token architectures.',
    interview: {
      interviewer: 'Muhammad Umair',
      date: '2026-08-27',
      time: '16:00',
      type: 'Leadership & Culture Fit',
      link: 'https://meet.google.com/nxa-hr-auto',
    },
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
    resumeSummary: 'CI/CD pipeline automation, Terraform infrastructure-as-code, AWS/GCP Kubernetes clusters, and zero-trust security postures.',
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
    resumeSummary: 'Technical hiring specialist experienced in scaling high-performing engineering organizations and candidate experience lifecycle.',
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
    resumeSummary: 'Corporate financial auditing, statutory payroll taxation, and cash flow ledger modeling.',
  },
  {
    id: 'APP-9906',
    name: 'Bilal Ahmed',
    role: 'Data Platform Engineer',
    department: 'Engineering & DevOps',
    email: 'bilal.ahmed@datalake.io',
    phone: '+92 345 1122334',
    experience: '4.0 Years',
    location: 'Remote & Distributed',
    rating: 4.5,
    stage: 'APPLIED',
    date: 'Aug 27, 2026',
    status: 'ACTIVE',
    resumeSummary: 'Apache Spark, Kafka streaming pipelines, Python ETL processes, and ClickHouse data analytics.',
  },
];

const DEFAULT_INTERVIEWS = [
  {
    id: 101,
    candidate: 'David K. Vance',
    role: 'Senior React & Node Engineer',
    interviewer: 'Sarah Jenkins',
    date: '2026-08-28',
    time: '14:30',
    type: 'System Architecture Round',
    link: 'https://meet.google.com/nxa-hr-auto',
    status: 'SCHEDULED',
  },
  {
    id: 102,
    candidate: 'Michael Zhang',
    role: 'DevOps & Kubernetes Architect',
    interviewer: 'Alex Mercer',
    date: '2026-08-29',
    time: '11:00',
    type: 'Technical Live Coding',
    link: 'https://meet.google.com/nxa-hr-auto',
    status: 'SCHEDULED',
  },
  {
    id: 103,
    candidate: 'Ayesha Tariq',
    role: 'Lead Product Designer (Figma)',
    interviewer: 'Muhammad Umair',
    date: '2026-08-27',
    time: '16:00',
    type: 'Leadership & Culture Fit',
    link: 'https://meet.google.com/nxa-hr-auto',
    status: 'PASSED',
  },
];

const ATSPipeline = () => {
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentView, setCurrentView] = useState('kanban'); // 'kanban' | 'interviews' | 'table'
  const [toastMsg, setToastMsg] = useState('');

  // Drag and drop state
  const [draggedCandidateId, setDraggedCandidateId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Candidate Details Drawer
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Schedule Interview Modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleCandidate, setScheduleCandidate] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewer: 'Sarah Jenkins',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    type: 'Technical Round',
    link: 'https://meet.google.com/nxa-hr-auto',
  });

  // Add Candidate Modal
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandidateForm, setNewCandidateForm] = useState({
    name: '',
    role: 'Senior React & Node Engineer',
    department: 'Engineering & DevOps',
    email: '',
    phone: '',
    experience: '4.0 Years',
    location: 'Islamabad HQ / Hybrid',
    stage: 'APPLIED',
    resumeSummary: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Candidates
      let apps = [];
      try {
        const localApps = localStorage.getItem('nexahr_recruitment_applications');
        if (localApps) {
          const parsed = JSON.parse(localApps);
          if (parsed && parsed.length > 0) apps = parsed;
        }
      } catch (e) {
        console.warn(e);
      }
      if (apps.length === 0) {
        apps = DEFAULT_APPLICATIONS;
        try {
          localStorage.setItem('nexahr_recruitment_applications', JSON.stringify(DEFAULT_APPLICATIONS));
        } catch (e) {}
      }
      setCandidates(apps);

      // 2. Load Interviews
      let ivs = [];
      try {
        const localIvs = localStorage.getItem('nexahr_recruitment_interviews');
        if (localIvs) {
          const parsed = JSON.parse(localIvs);
          if (parsed && parsed.length > 0) ivs = parsed;
        }
      } catch (e) {
        console.warn(e);
      }
      if (ivs.length === 0) {
        ivs = DEFAULT_INTERVIEWS;
        try {
          localStorage.setItem('nexahr_recruitment_interviews', JSON.stringify(DEFAULT_INTERVIEWS));
        } catch (e) {}
      }
      setInterviews(ivs);

      // 3. Load Employees for Interviewer dropdown
      const empRes = await api.getEmployees();
      if (empRes?.success && empRes.data?.employees) {
        setEmployees(empRes.data.employees);
      }
    } catch (err) {
      console.error('Failed to load ATS Pipeline data:', err);
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

  const persistCandidates = (updated) => {
    setCandidates(updated);
    try {
      localStorage.setItem('nexahr_recruitment_applications', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const persistInterviews = (updated) => {
    setInterviews(updated);
    try {
      localStorage.setItem('nexahr_recruitment_interviews', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Move candidate to a stage
  const moveCandidateStage = (candidateId, newStage) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const updated = candidates.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c));
    persistCandidates(updated);

    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate({ ...selectedCandidate, stage: newStage });
    }

    const stageObj = STAGES.find((s) => s.key === newStage);
    showToast(`${candidate.name} moved to ${stageObj ? stageObj.label : newStage}`);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, candidateId) => {
    e.dataTransfer.setData('text/plain', candidateId);
    setDraggedCandidateId(candidateId);
  };

  const handleDragOver = (e, stageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageKey) {
      setDragOverStage(stageKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('text/plain') || draggedCandidateId;
    setDragOverStage(null);
    setDraggedCandidateId(null);
    if (candidateId) {
      moveCandidateStage(candidateId, targetStage);
    }
  };

  // Open Schedule Interview Modal
  const handleOpenSchedule = (candidate) => {
    setScheduleCandidate(candidate);
    setInterviewForm({
      interviewer: employees.length > 0 ? `${employees[0].firstName} ${employees[0].lastName}` : 'Sarah Jenkins',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      type: 'Technical Live Coding',
      link: 'https://meet.google.com/nxa-hr-auto',
    });
    setIsScheduleOpen(true);
  };

  const handleSaveInterview = (e) => {
    e.preventDefault();
    if (!scheduleCandidate) return;

    const newInterview = {
      id: Date.now(),
      candidate: scheduleCandidate.name,
      role: scheduleCandidate.role,
      interviewer: interviewForm.interviewer,
      date: interviewForm.date,
      time: interviewForm.time,
      type: interviewForm.type,
      link: interviewForm.link,
      status: 'SCHEDULED',
    };

    const updatedInterviews = [newInterview, ...interviews];
    persistInterviews(updatedInterviews);

    // Update candidate's interview info and advance to INTERVIEWING stage if needed
    const updatedCandidates = candidates.map((c) =>
      c.id === scheduleCandidate.id
        ? {
            ...c,
            stage: c.stage === 'APPLIED' || c.stage === 'SCREENING' ? 'INTERVIEWING' : c.stage,
            interview: {
              interviewer: interviewForm.interviewer,
              date: interviewForm.date,
              time: interviewForm.time,
              type: interviewForm.type,
              link: interviewForm.link,
            },
          }
        : c
    );
    persistCandidates(updatedCandidates);

    if (selectedCandidate && selectedCandidate.id === scheduleCandidate.id) {
      setSelectedCandidate({
        ...selectedCandidate,
        stage: selectedCandidate.stage === 'APPLIED' || selectedCandidate.stage === 'SCREENING' ? 'INTERVIEWING' : selectedCandidate.stage,
        interview: newInterview,
      });
    }

    setIsScheduleOpen(false);
    showToast(`Interview scheduled for ${scheduleCandidate.name} on ${interviewForm.date}`);
  };

  // Add Candidate
  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!newCandidateForm.name.trim()) return;

    const candidate = {
      id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCandidateForm.name.trim(),
      role: newCandidateForm.role,
      department: newCandidateForm.department,
      email: newCandidateForm.email || 'candidate@talent.org',
      phone: newCandidateForm.phone || '+92 300 0000000',
      experience: newCandidateForm.experience,
      location: newCandidateForm.location,
      rating: 4.8,
      stage: newCandidateForm.stage,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'ACTIVE',
      resumeSummary: newCandidateForm.resumeSummary || 'Evaluated against core technical requirements and culture fit.',
    };

    persistCandidates([candidate, ...candidates]);
    setIsAddCandidateOpen(false);
    setNewCandidateForm({
      name: '',
      role: 'Senior React & Node Engineer',
      department: 'Engineering & DevOps',
      email: '',
      phone: '',
      experience: '4.0 Years',
      location: 'Islamabad HQ / Hybrid',
      stage: 'APPLIED',
      resumeSummary: '',
    });
    showToast(`Candidate ${candidate.name} added to pipeline`);
  };

  // Filtering
  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      (c.resumeSummary && c.resumeSummary.toLowerCase().includes(q));
    const matchesRole = roleFilter === 'ALL' || c.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Unique roles for filter dropdown
  const uniqueRoles = Array.from(new Set(candidates.map((c) => c.role)));

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="ATS Candidate Pipeline & Interview Orchestration"
        subtitle="Visual drag-and-drop talent board, stages advancement, automated interview schedules, and candidate dossiers."
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC ATS HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full ATS Lifecycle</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Candidate Kanban Pipeline & Interviews
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-medium">
              Seamlessly drag and drop candidates across 5 recruitment stages, coordinate panel interviews, review evaluations, and transition finalist hires directly into HR onboarding.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>{candidates.length} Total Applicants</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                <span>{interviews.length} Scheduled Interviews</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{candidates.filter((c) => c.stage === 'HIRED').length} Hired This Month</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsAddCandidateOpen(true)}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Candidate</span>
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOOLBAR & VIEW CONTROLS */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search candidates by name, role, tech stack..."
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

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Roles ({candidates.length})</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* View Mode Tabs */}
          <div className="flex items-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'kanban' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setCurrentView('interviews')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'interviews' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Interviews ({interviews.length})</span>
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'table' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>All Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN ATS VIEWS */}
      {/* ========================================================================= */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <>
          {/* VIEW 1: UNIFIED KANBAN BOARD WITH DRAG & DROP */}
          {currentView === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              {STAGES.map((stage, sIdx) => {
                const stageCandidates = filteredCandidates.filter((c) => c.stage === stage.key);
                const isOver = dragOverStage === stage.key;

                return (
                  <div
                    key={stage.key}
                    onDragOver={(e) => handleDragOver(e, stage.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, stage.key)}
                    className={`rounded-[28px] p-4 bg-slate-50/70 dark:bg-slate-900/50 border transition-all duration-200 flex flex-col min-h-[500px] ${
                      isOver
                        ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : `${stage.border}`
                    }`}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`}></span>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
                          {stage.label}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>
                        {stageCandidates.length}
                      </span>
                    </div>

                    {/* Candidate Cards Column */}
                    <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                      {stageCandidates.length > 0 ? (
                        stageCandidates.map((c) => (
                          <div
                            key={c.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, c.id)}
                            onClick={() => {
                              setSelectedCandidate(c);
                              setIsDetailDrawerOpen(true);
                            }}
                            className={`group bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-200/70 dark:border-slate-800 transition-all cursor-grab active:cursor-grabbing space-y-2.5 ${
                              draggedCandidateId === c.id ? 'opacity-40 scale-95 border-indigo-500' : ''
                            }`}
                          >
                            {/* Card Header: Avatar / Code & Rating */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-slate-400">
                                {c.id}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                                <span>{c.rating}</span>
                              </div>
                            </div>

                            {/* Name & Role */}
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                {c.name}
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {c.role}
                              </p>
                            </div>

                            {/* Interview Badge if scheduled */}
                            {c.interview && (
                              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-center gap-1.5 text-[10px] text-purple-700 dark:text-purple-300 font-bold">
                                <Video className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span className="truncate">{c.interview.date} • {c.interview.time}</span>
                              </div>
                            )}

                            {/* Experience and Location */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                              <span>{c.experience}</span>
                              <span>{c.location.split('/')[0].trim()}</span>
                            </div>

                            {/* Quick Stage Shifter Arrows */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center justify-between pt-1"
                            >
                              <button
                                disabled={sIdx === 0}
                                onClick={() => moveCandidateStage(c.id, STAGES[sIdx - 1].key)}
                                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Previous Stage"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenSchedule(c)}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Interview</span>
                              </button>

                              <button
                                disabled={sIdx === STAGES.length - 1}
                                onClick={() => moveCandidateStage(c.id, STAGES[sIdx + 1].key)}
                                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Advance Stage"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                          <Users className="w-6 h-6 stroke-1 mb-1" />
                          <span className="text-[10px] font-semibold">Drop candidates here</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: INTERVIEW SCHEDULES LIST */}
          {currentView === 'interviews' && (
            <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                      <th className="py-4 px-6">Candidate & Target Position</th>
                      <th className="py-4 px-6">Lead Interviewer</th>
                      <th className="py-4 px-6">Date & Schedule</th>
                      <th className="py-4 px-6">Interview Round Format</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Meeting Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {interviews.length > 0 ? (
                      interviews.map((iv) => (
                        <tr key={iv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                <Video className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="leading-snug">{iv.candidate}</p>
                                <p className="text-[10px] text-slate-400 font-normal">{iv.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{iv.interviewer}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{iv.date}</span>
                              <span className="text-slate-400 font-normal">• {iv.time}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl font-semibold">
                              {iv.type}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                iv.status === 'SCHEDULED'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {iv.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <a
                              href={iv.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join Meet</span>
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                          No interviews scheduled yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: ALL CANDIDATES ROSTER TABLE */}
          {currentView === 'table' && (
            <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                      <th className="py-4 px-6">Candidate & Role</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Experience & Rating</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Current Pipeline Stage</th>
                      <th className="py-4 px-6 text-right">Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredCandidates.length > 0 ? (
                      filteredCandidates.map((c) => {
                        const stObj = STAGES.find((s) => s.key === c.stage) || STAGES[0];
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                  {c.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="leading-snug">{c.name}</p>
                                  <p className="text-[10px] text-slate-400 font-normal">{c.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{c.department}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{c.experience}</span>
                                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" /> {c.rating}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{c.location}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stObj.badge}`}>
                                {stObj.label}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => {
                                  setSelectedCandidate(c);
                                  setIsDetailDrawerOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold text-[11px] transition-colors"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                          No candidates matching filter
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
      {/* 4. CANDIDATE PROFILE SLIDE-OUT DRAWER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDetailDrawerOpen && selectedCandidate && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

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
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
                      {selectedCandidate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        {selectedCandidate.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCandidate.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDetailDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Candidate Content Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                  {/* Stage Advancement Control */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pipeline Stage:</span>
                      <select
                        value={selectedCandidate.stage}
                        onChange={(e) => moveCandidateStage(selectedCandidate.id, e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
                      >
                        {STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          handleOpenSchedule(selectedCandidate);
                        }}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Interview</span>
                      </button>
                      <button
                        onClick={() => moveCandidateStage(selectedCandidate.id, 'HIRED')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Hire</span>
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-[10px] text-slate-400 font-semibold">Email</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedCandidate.email}</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-[10px] text-slate-400 font-semibold">Phone</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedCandidate.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location & Experience */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Location</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.location}</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Experience</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.experience}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Interview Dossier if any */}
                  {selectedCandidate.interview && (
                    <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                        <Video className="w-4 h-4" />
                        <span>Active Interview Scheduled</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Round: <span className="font-bold">{selectedCandidate.interview.type}</span> with{' '}
                        <span className="font-bold">{selectedCandidate.interview.interviewer}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Time: {selectedCandidate.interview.date} at {selectedCandidate.interview.time}
                      </p>
                      <a
                        href={selectedCandidate.interview.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Video Conference Link</span>
                      </a>
                    </div>
                  )}

                  {/* Resume Dossier Summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span>Resume & Technical Dossier Summary</span>
                    </h4>
                    <p className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedCandidate.resumeSummary}
                    </p>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                  <button
                    onClick={() => {
                      const updated = candidates.filter((c) => c.id !== selectedCandidate.id);
                      persistCandidates(updated);
                      setIsDetailDrawerOpen(false);
                      showToast('Candidate removed from pipeline');
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive Dossier</span>
                  </button>
                  <button
                    onClick={() => setIsDetailDrawerOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. SCHEDULE INTERVIEW MODAL */}
      {/* ========================================================================= */}
      {isScheduleOpen && scheduleCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Video className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Schedule Candidate Interview
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    For {scheduleCandidate.name} ({scheduleCandidate.role})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInterview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Lead Interviewer</label>
                <select
                  value={interviewForm.interviewer}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewer: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Engineering Director)</option>
                  <option value="Alex Mercer">Alex Mercer (Staff DevOps Architect)</option>
                  <option value="Muhammad Umair">Muhammad Umair (Product & Design Lead)</option>
                  <option value="Fatima Noor">Fatima Noor (Lead Talent Acquisition)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                      {emp.firstName} {emp.lastName} ({emp.designation?.name || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time</label>
                  <input
                    type="time"
                    required
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Interview Format / Round</label>
                <select
                  value={interviewForm.type}
                  onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="Initial Screening">Initial HR Screening Call</option>
                  <option value="Technical Live Coding">Technical Live Coding & Data Structures</option>
                  <option value="System Architecture Round">System Architecture & Scalability Round</option>
                  <option value="Product Design Portfolio">Product Design & Portfolio Review</option>
                  <option value="Leadership & Culture Fit">Executive Leadership & Culture Fit</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Video Meeting URL</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/nxa-hr-auto"
                  value={interviewForm.link}
                  onChange={(e) => setInterviewForm({ ...interviewForm, link: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Confirm & Send Calendar Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ADD CANDIDATE MODAL */}
      {/* ========================================================================= */}
      {isAddCandidateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Users className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add Candidate to Pipeline
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Direct sourcing or referral application</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCandidateOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newCandidateForm.name}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Role</label>
                  <input
                    type="text"
                    required
                    placeholder="Senior React & Node Engineer"
                    value={newCandidateForm.role}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, role: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Initial Stage</label>
                  <select
                    value={newCandidateForm.stage}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, stage: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={newCandidateForm.email}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={newCandidateForm.phone}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Resume / Profile Summary</label>
                <textarea
                  rows={3}
                  placeholder="Outline key achievements, tech stack expertise, previous employers..."
                  value={newCandidateForm.resumeSummary}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, resumeSummary: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCandidateOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSPipeline;
