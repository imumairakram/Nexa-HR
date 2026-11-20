import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { TableSkeleton } from '../../../components/common/Skeleton';
import { api } from '../../../services/api';
import { isDemoSessionActive, showDemoToast } from '../../../demo/demoSession';
import PipelineToolbar from './PipelineToolbar';
import PipelineSummary from './PipelineSummary';
import KanbanColumn from './KanbanColumn';
import CandidateCard from './CandidateCard';
import PipelineEmptyState from './PipelineEmptyState';
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
  UserPlus,
  User,
  Check,
  Building2,
  Bot,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

const STAGES = [
  { key: 'APPLIED', name: 'Sourced & Applied', label: 'Sourced & Applied', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300', dot: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-900/60' },
  { key: 'SCREENING', name: 'Screening Call', label: 'Screening Call', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-900/60' },
  { key: 'INTERVIEWING', name: 'Technical Interview', label: 'Technical Interview', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300', dot: 'bg-purple-500', border: 'border-purple-200 dark:border-purple-900/60' },
  { key: 'OFFER', name: 'Offer Extended', label: 'Offer Extended', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300', dot: 'bg-indigo-500', border: 'border-sky-200 dark:border-indigo-900/60' },
  { key: 'HIRED', name: 'Signed & Hired', label: 'Signed & Hired', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-900/60' },
];

const getCandidateInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const DEFAULT_APPLICATIONS = [];

const DEFAULT_INTERVIEWS = [];

const ATSPipeline = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentView, setCurrentView] = useState('kanban'); // 'kanban' | 'interviews' | 'table'
  const [toastMsg, setToastMsg] = useState('');
  const [screenedOutCandidates, setScreenedOutCandidates] = useState([]);
  const [screenedOutCount, setScreenedOutCount] = useState(0);
  const [isScreenedOutOpen, setIsScreenedOutOpen] = useState(false);
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);
  const [showWakingUpNotice, setShowWakingUpNotice] = useState(false);

  // Friendly waking-up notice after 3 seconds of waiting on cold start
  useEffect(() => {
    let timer = null;
    if (loading) {
      timer = setTimeout(() => {
        setShowWakingUpNotice(true);
      }, 3000);
    } else {
      setShowWakingUpNotice(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

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
    interviewer: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    type: 'Technical Round',
    link: 'https://meet.google.com/nxa-hr-auto',
  });

  // Add Candidate Modal
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandidateForm, setNewCandidateForm] = useState({
    name: '',
    role: '',
    department: 'Organization-Wide (All Employees)',
    email: '',
    phone: '',
    experience: '',
    location: 'All Duty Stations (HQ + Regional + Remote)',
    stage: 'APPLIED',
    resumeSummary: '',
    fastTrack: true,
    emailConfirm: true,
    autoAssessment: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch applications with high priority and immediately unblock Kanban UI
      const appsPromise = api.getJobApplications().then((appsRes) => {
        if (appsRes?.success && appsRes.data?.applications) {
          setCandidates(appsRes.data.applications);
        } else {
          setCandidates([]);
        }
        setLoading(false); // Instantly display the Kanban as soon as applications arrive!
      }).catch((err) => {
        console.error('Failed to load applications:', err);
        setCandidates([]);
        setLoading(false);
      });

      // 2. Fetch interviews, employees, departments in parallel without holding back the Kanban
      Promise.allSettled([
        api.getJobInterviews(),
        api.getEmployees(),
        api.getDepartments(),
      ]).then(([ivsRes, empRes, deptRes]) => {
        if (ivsRes.status === 'fulfilled' && ivsRes.value?.success && ivsRes.value.data?.interviews) {
          setInterviews(ivsRes.value.data.interviews);
        }
        if (empRes.status === 'fulfilled' && empRes.value?.success && empRes.value.data?.employees) {
          const emps = empRes.value.data.employees;
          setEmployees(emps);
          if (emps.length > 0 && !interviewForm.interviewer) {
            setInterviewForm((prev) => ({
              ...prev,
              interviewer: `${emps[0].firstName} ${emps[0].lastName}`,
            }));
          }
        }
        if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
          setDepartments(deptRes.value.data.departments);
        }
      });

      await appsPromise;
    } catch (err) {
      console.error('Failed to load ATS Pipeline data:', err);
      setLoading(false);
    }
  };

  // Open Candidate Detail Drawer lazily (instant UI response + background detail fill)
  const handleOpenDetail = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailDrawerOpen(true);
    if (candidate && candidate.id && (!candidate.resumeSummary || !candidate.aiBreakdown)) {
      api.getJobApplicationById(candidate.id).then((res) => {
        if (res?.success && res.data?.application) {
          const full = res.data.application;
          setSelectedCandidate((prev) => (prev?.id === full.id ? { ...prev, ...full } : prev));
          setCandidates((prev) => prev.map((c) => (c.id === full.id ? { ...c, ...full } : c)));
        }
      }).catch((err) => console.warn('Could not fetch candidate details:', err));
    }
  };

  // Open Screened-Out Drawer lazily on demand
  const handleOpenScreenedOut = () => {
    setIsScreenedOutOpen(true);
    api.getAiScreenedOutApplications().then((res) => {
      if (res?.success && res.data?.applications) {
        setScreenedOutCandidates(res.data.applications);
        setScreenedOutCount(res.data.applications.length);
      }
    }).catch(console.error);
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

  // Move candidate to a stage with Live Backend API Sync
  const moveCandidateStage = async (candidateId, newStage) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    if (isDemoSessionActive()) {
      showDemoToast('Demo mode: view only. Changes are disabled.');
      return;
    }

    // Optimistic UI state update
    const updated = candidates.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c));
    persistCandidates(updated);

    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate({ ...selectedCandidate, stage: newStage });
    }

    try {
      await api.updateJobApplicationStage(candidateId, newStage).catch(() => null);
    } catch (e) {
      console.warn('Backend stage sync error, keeping optimistic state:', e);
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
      interviewer: employees.length > 0 ? `${employees[0].firstName} ${employees[0].lastName}` : '',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      type: 'Technical Live Coding',
      link: 'https://meet.google.com/nxa-hr-auto',
    });
    setIsScheduleOpen(true);
  };

  // Save Interview with Live Backend API
  const handleSaveInterview = async (e) => {
    e.preventDefault();
    if (!scheduleCandidate) return;

    const payload = {
      applicationId: scheduleCandidate.id,
      candidateName: scheduleCandidate.name,
      candidateEmail: scheduleCandidate.email,
      role: scheduleCandidate.role,
      round: interviewForm.type,
      interviewer: interviewForm.interviewer,
      date: interviewForm.date,
      time: interviewForm.time,
      meetLink: interviewForm.link,
    };

    try {
      const res = await api.createJobInterview(payload);
      if (res?.success && res.data?.interview) {
        const created = res.data.interview;
        const updatedInterviews = [created, ...interviews];
        persistInterviews(updatedInterviews);

        // Auto-advance candidate to INTERVIEW stage if currently in APPLIED or SCREENING
        if (scheduleCandidate.stage === 'APPLIED' || scheduleCandidate.stage === 'SCREENING') {
          moveCandidateStage(scheduleCandidate.id, 'INTERVIEW');
        }

        if (selectedCandidate && selectedCandidate.id === scheduleCandidate.id) {
          setSelectedCandidate({
            ...selectedCandidate,
            stage: 'INTERVIEW',
            interview: created,
          });
        }

        showToast(`Interview scheduled for ${scheduleCandidate.name} and saved to database!`);
      } else {
        throw new Error(res?.message || 'Failed to save interview to database');
      }
    } catch (err) {
      console.error('Error saving interview:', err);
      showToast(`Error: ${err.message || 'Failed to schedule interview'}`);
    } finally {
      setIsScheduleOpen(false);
    }
  };

  // Add Candidate with Live Backend API
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidateForm.name.trim()) return;

    const payload = {
      name: newCandidateForm.name.trim(),
      role: newCandidateForm.role,
      department: newCandidateForm.department,
      email: newCandidateForm.email || `${newCandidateForm.name.toLowerCase().replace(/\s+/g, '.')}@talent.org`,
      phone: newCandidateForm.phone || '+92 300 0000000',
      experience: newCandidateForm.experience,
      location: newCandidateForm.location,
      stage: newCandidateForm.stage,
      resumeSummary: newCandidateForm.resumeSummary || 'Evaluated against core technical requirements and culture fit.',
    };

    try {
      const res = await api.createJobApplication(payload);
      if (res?.success && res.data?.application) {
        persistCandidates([res.data.application, ...candidates]);
        showToast(`Candidate ${payload.name} saved to database!`);
      } else {
        throw new Error(res?.message || 'Failed to save candidate to database');
      }
    } catch (err) {
      console.error('Error adding candidate:', err);
      showToast(`Error: ${err.message || 'Failed to save candidate to database'}`);
    } finally {
      setIsAddCandidateOpen(false);
      setNewCandidateForm({
        name: '',
        role: '',
        department: departments.length > 0 ? departments[0].name : 'Organization-Wide (All Employees)',
        email: '',
        phone: '',
        experience: '',
        location: 'All Duty Stations (HQ + Regional + Remote)',
        stage: 'APPLIED',
        resumeSummary: '',
        fastTrack: true,
        emailConfirm: true,
        autoAssessment: false,
      });
    }
  };

  // Delete Candidate with Live Backend API
  const handleDeleteCandidate = async (candidateId) => {
    try {
      await api.deleteJobApplication(candidateId).catch(() => null);
      persistCandidates(candidates.filter((c) => c.id !== candidateId));
      setIsDetailDrawerOpen(false);
      showToast('Candidate removed from recruitment pipeline');
    } catch (err) {
      console.error('Error deleting candidate:', err);
      persistCandidates(candidates.filter((c) => c.id !== candidateId));
      setIsDetailDrawerOpen(false);
      showToast('Candidate removed');
    }
  };

  // Trigger non-blocking manual Gmail ATS scan with status polling
  const handleSyncGmail = async () => {
    setIsSyncingGmail(true);
    try {
      const res = await api.syncAiScreeningGmail();
      if (res?.success) {
        showToast('Gmail ATS sync initiated in background...');
        let pollCount = 0;
        const interval = setInterval(async () => {
          pollCount++;
          try {
            const statusRes = await api.getAiScreeningStatus();
            if (statusRes?.success && !statusRes.data?.isSyncing) {
              clearInterval(interval);
              setIsSyncingGmail(false);
              showToast('Gmail ATS sync completed!');
              // Re-fetch fresh applications
              const freshRes = await api.getJobApplications({ fresh: 'true' });
              if (freshRes?.success && freshRes.data?.applications) {
                setCandidates(freshRes.data.applications);
              }
            } else if (pollCount > 24) {
              clearInterval(interval);
              setIsSyncingGmail(false);
            }
          } catch (e) {
            clearInterval(interval);
            setIsSyncingGmail(false);
          }
        }, 2500);
      } else {
        showToast(res?.message || 'Gmail credentials not configured yet');
        setIsSyncingGmail(false);
      }
    } catch (err) {
      showToast(`Sync error: ${err.message || 'Failed to sync Gmail'}`);
      setIsSyncingGmail(false);
    }
  };

  // HR manual override of screened-out / unmatched candidate
  const handleOverrideCandidate = async (candidateId) => {
    try {
      const res = await api.overrideAiApplication(candidateId);
      if (res?.success) {
        showToast(`Candidate ${res.data?.application?.name || ''} promoted to Sourced & Applied stage!`);
        await loadData();
      } else {
        showToast(`Override error: ${res?.message}`);
      }
    } catch (err) {
      showToast(`Override error: ${err.message}`);
    }
  };

  // Re-scan candidate CV with AI
const handleViewResume = async (candidateId) => {
    try {
      if (isDemoSessionActive()) {
        showDemoToast('CV preview is not available in demo mode.');
        return;
      }
      showToast('Opening candidate CV...');
      await api.viewApplicationResume(candidateId);
    } catch (err) {
      showToast(`Error opening CV: ${err.message}`);
    }
  };

  const handleRescanCandidate = async (candidateId) => {
    try {
      const res = await api.rescanAiApplication(candidateId);
      if (res?.success) {
        showToast(`Candidate rescanned! Score: ${res.data?.application?.aiScore}/100`);
        if (selectedCandidate && selectedCandidate.id === candidateId) {
          setSelectedCandidate(res.data.application);
        }
        await loadData();
      } else {
        showToast(`Rescan notice: ${res?.message}`);
      }
    } catch (err) {
      showToast(`Rescan error: ${err.message}`);
    }
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
        title="ATS Candidate Pipeline"
        subtitle="Visual drag-and-drop talent board, stages advancement, automated interview schedules, and candidate dossiers."
      />

      {/* Toast Notification */}
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
      {/* 1. DYNAMIC ATS HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-6 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Candidate Kanban Pipeline & Interviews
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-xl font-medium">
              Seamlessly drag and drop candidates across 5 recruitment stages, coordinate panel interviews, review evaluations, and transition finalist hires directly into HR onboarding.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                
<span>{candidates.length} Total Applicants</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                
<span>{interviews.length} Scheduled Interviews</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                
<span>{candidates.filter((c) => c.stage === 'HIRED').length} Hired This Month</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsAddCandidateOpen(true)}
              className="px-5 py-3 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] dark:text-white font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Candidate</span>
            </button>
            <button
              onClick={handleSyncGmail}
              disabled={isSyncingGmail}
              className="px-4 py-2.5 rounded-[12px] bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold text-xs border border-sky-200/80 dark:border-sky-800/80 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
              title="Poll HR Gmail inbox and run AI ATS screening now"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin' : 'text-sky-600 dark:text-sky-400'}`} />
              <span>{isSyncingGmail ? 'Screening Gmail...' : 'Sync Gmail ATS'}</span>
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2.5 rounded-[12px] bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs border border-white/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REDESIGNED TOOLBAR */}
      {/* ========================================================================= */}
      <PipelineToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        uniqueRoles={uniqueRoles}
        totalCandidates={candidates.length}
        currentView={currentView}
        onViewChange={setCurrentView}
        interviewsCount={interviews.length}
        screenedOutCount={screenedOutCount || screenedOutCandidates.length}
        onOpenScreenedOut={handleOpenScreenedOut}
      />

      {/* ========================================================================= */}
      {/* 3. MAIN ATS VIEWS */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="space-y-4">
          {showWakingUpNotice && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Waking up the server...</strong> Connecting to cloud infrastructure, please hold on.
              </span>
            </div>
          )}
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : (
        <>
          {/* VIEW 1: REDESIGNED COMPACT KANBAN BOARD (OR TABLE ON MOBILE) */}
          {(currentView === 'kanban' || currentView === 'table') && (
            <div className={`space-y-3.5 ${currentView === 'table' ? 'md:hidden' : ''}`}>
              {candidates.length === 0 ? (
                /* STEP 4: Page-level centered empty state when total candidates is 0 */
                <PipelineEmptyState onViewJobs={() => navigate('/app/recruitment/workspace')} />
              ) : (
                <>
                  {/* STEP 6: Optional pipeline summary strip */}
                  <PipelineSummary stages={STAGES} candidates={candidates} />

                  {/* Filtered empty notice if search yields no results */}
                  {filteredCandidates.length === 0 ? (
                    <div className="py-12 text-center text-[#5B727B] dark:text-[#8FA8B1] text-sm border border-dashed border-[#DCE6EA] dark:border-[#223840] rounded-[20px] bg-white dark:bg-[#112229]">
                      <p className="font-medium text-[#0E2A33] dark:text-[#E6F2F5] mb-1">No matching candidates found</p>
                      <p className="text-xs">Try adjusting your search query or role filter.</p>
                    </div>
                  ) : (
                    /* STEP 3: Neutral 16px radius columns with snap on mobile and vertical scroll */
                    <div className="flex lg:grid lg:grid-cols-5 gap-3.5 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-thin items-start">
                      {STAGES.map((stage, sIdx) => {
                        const stageCandidates = filteredCandidates.filter(
                          (c) => c.stage === stage.key || (stage.key === 'INTERVIEWING' && c.stage === 'INTERVIEW')
                        );
                        const isOver = dragOverStage === stage.key;

                        return (
                          <KanbanColumn
                            key={stage.key}
                            stage={stage}
                            sIdx={sIdx}
                            stages={STAGES}
                            candidates={stageCandidates}
                            draggedCandidateId={draggedCandidateId}
                            isOver={isOver}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onCandidateClick={handleOpenDetail}
                            onMoveStage={moveCandidateStage}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* VIEW 2: INTERVIEW SCHEDULES LIST */}
          {currentView === 'interviews' && (
            <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                {interviews.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {interviews.map((iv) => (
                      <div
                        key={iv.id}
                        className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-purple-400/60 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                <Video className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 dark:text-white leading-snug text-sm">{iv.candidate}</p>
                                <p className="text-[10px] text-slate-400">{iv.role}</p>
                              </div>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                iv.status === 'SCHEDULED'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {iv.status}
                            </span>
                          </div>

                          <div className="text-xs space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-300">
                            <div><span className="text-slate-400 font-medium">Interviewer: </span><span className="font-semibold">{iv.interviewer}</span></div>
                            <div className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{iv.date}</span>
                              <span className="text-slate-400">• {iv.time}</span>
                            </div>
                            <div><span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-[12px] text-[10px] font-semibold">{iv.type}</span></div>
                          </div>
                        </div>

                        <a
                          href={iv.link}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-100 transition-colors flex items-center justify-center gap-1.5 text-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meet</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No interviews scheduled yet
                  </div>
                )}
              </div>

              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-100 transition-colors"
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

          {/* VIEW 3: ALL CANDIDATES ROSTER TABLE (Desktop Only) */}
          {currentView === 'table' && (
            <div className="hidden md:block bg-white dark:bg-[#1E293B] rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
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
                                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
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
                                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md flex items-center">
                                  {c.rating}
                                </span>
                                {(c.source === 'GMAIL' || typeof c.aiScore === 'number') && (
                                  <span
                                    className={`px-2 py-0.5 rounded-[8px] text-[10px] font-bold tabular-nums flex items-center gap-1 ${
                                      (c.aiScore || 0) >= 85
    ? 'bg-amber-500 text-[#1C2321] dark:bg-amber-400 dark:text-[#0F1715] border border-amber-600/40'
    : (c.aiScore || 0) >= 70
    ? 'bg-teal-700 text-white dark:bg-teal-600 dark:text-white border border-teal-800'
    : 'bg-[#ECEAE4] text-[#1C2321] dark:bg-[#273834] dark:text-[#F1F5F4] border border-[#E2E0D8] dark:border-[#384E48]'
                                    }`}
                                    title={`AI Screening Score: ${c.aiScore || 0}/100`}
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>{c.aiScore || 0} AI</span>
                                  </span>
                                )}
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
                                className="px-3 py-1.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-300 hover:text-sky-600 font-bold text-[11px] transition-colors"
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
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-lg">
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
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 focus:outline-none"
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
                        className="flex-1 py-2 rounded-[12px] bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-sky-500/20"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Interview</span>
                      </button>
                      <button
                        onClick={() => moveCandidateStage(selectedCandidate.id, 'HIRED')}
                        className="px-4 py-2 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
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
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedCandidate.phone || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location & Experience */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Location</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.location || '—'}</p>
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

                  {/* AI ATS Screening Analysis if available */}
                  {(selectedCandidate.source === 'GMAIL' || selectedCandidate.aiScore || selectedCandidate.aiSummary) && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-sky-200/80 dark:border-indigo-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            AI-Powered ATS Screening Analysis
                          </h4>
                        </div>
                        {typeof selectedCandidate.aiScore === 'number' && (
                          <span
                            className={`px-2.5 py-1 rounded-[8px] text-xs font-bold tabular-nums flex items-center gap-1 ${
                              selectedCandidate.aiScore >= 85
    ? 'bg-amber-500 text-[#1C2321] dark:bg-amber-400 dark:text-[#0F1715] border border-amber-600/40'
    : selectedCandidate.aiScore >= 70
    ? 'bg-teal-700 text-white dark:bg-teal-600 dark:text-white border border-teal-800'
    : 'bg-[#ECEAE4] text-[#1C2321] dark:bg-[#273834] dark:text-[#F1F5F4] border border-[#E2E0D8] dark:border-[#384E48]'
                            }`}
                          >
                            Score: {selectedCandidate.aiScore}/100
                          </span>
                        )}
                      </div>

                      {selectedCandidate.aiSummary && (
                        <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            AI Recruiter Summary
                          </p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {selectedCandidate.aiSummary}
                          </p>
                        </div>
                      )}

                      {/* Strengths */}
                      {Array.isArray(selectedCandidate.aiStrengths) && selectedCandidate.aiStrengths.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Key Strengths:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCandidate.aiStrengths.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gaps */}
                      {Array.isArray(selectedCandidate.aiGaps) && selectedCandidate.aiGaps.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                            Areas to Probe / Gaps:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCandidate.aiGaps.map((g, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-[12px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-200/60 dark:border-amber-800/60">
                                ! {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CV Link & Rescan Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-indigo-900/60 text-xs font-bold">
                        {selectedCandidate.resumeUrl ? (
                          <button
                            type="button"
                            onClick={() => handleViewResume(selectedCandidate.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-xs font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Download / View Original CV</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-normal">CV direct upload</span>
                        )}
                        <button
                          onClick={() => handleRescanCandidate(selectedCandidate.id)}
                          className="px-2.5 py-1 rounded-[12px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-scan AI</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                  <button
                    onClick={() => handleDeleteCandidate(selectedCandidate.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive Dossier</span>
                  </button>
                  <button
                    onClick={() => setIsDetailDrawerOpen(false)}
                    className="px-5 py-2.5 rounded-[12px] bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
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
      {/* 4.5. AI SCREENED-OUT APPLICATIONS MODAL (NEW TICKET CARD UI ARCHITECTURE) */}
      {/* ========================================================================= */}
      {isScreenedOutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-9 transition-all max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header: Icon, Titles, Close */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-amber-100 dark:ring-amber-950/50 shrink-0">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    AI Screened-Out Applications
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {screenedOutCandidates.length} candidate(s) below threshold, unmatched, or flagged for manual review
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScreenedOutOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate List Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar my-1">
              {screenedOutCandidates.length > 0 ? (
                screenedOutCandidates.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400/50 dark:hover:border-amber-500/50 transition-all space-y-4 shadow-xs"
                  >
                    {/* Top Row: Avatar, Name, ID, Role, AI Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-extrabold text-sm flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40">
                          {getCandidateInitials(app.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                              {app.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80">
                              {app.applicationId}
                            </span>
                            {app.experience && (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {app.experience}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{app.role}</span>
                            <span>•</span>
                            <span>{app.email}</span>
                            {app.phone && (
                              <>
                                <span>•</span>
                                <span>{app.phone}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* AI Score Badge */}
                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold tabular-nums border shadow-xs shrink-0 flex items-center gap-1.5 ${
                          app.aiScore !== null && app.aiScore !== undefined
                            ? app.aiScore >= 70
                              ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {app.aiScore !== null && app.aiScore !== undefined
                            ? `Score: ${app.aiScore}/100`
                            : app.aiStatus || 'REVIEW'}
                        </span>
                      </span>
                    </div>

                    {/* Gaps Alert Box if present */}
                    {Array.isArray(app.aiGaps) && app.aiGaps.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold uppercase tracking-wide text-[10px] text-amber-700 dark:text-amber-400 block mb-0.5">
                            Screening Gaps Identified
                          </span>
                          <p className="font-medium leading-relaxed">
                            {app.aiGaps.join('; ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI Summary / Resume summary */}
                    {(app.aiSummary || app.resumeSummary) && (
                      <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {app.aiSummary || app.resumeSummary}
                      </div>
                    )}

                    {/* Notes */}
                    {app.notes && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        {app.notes}
                      </p>
                    )}

                    {/* Actions Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/70 dark:border-slate-800">
                      {app.resumeUrl ? (
                        <button
                          type="button"
                          onClick={() => handleViewResume(app.id)}
                          className="text-xs font-bold text-[#0A8FB5] hover:text-[#07617D] dark:text-[#3CC1E6] hover:underline flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View Full CV</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                          No CV link attached
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOverrideCandidate(app.id)}
                        className="px-4 py-2 rounded-[12px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-sky-500/25 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 stroke-[2.2]" />
                        <span>Override & Add to Pipeline</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                  <ShieldCheck className="w-10 h-10 stroke-1 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No screened-out applications recorded</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    All candidate applications received through automated parsing met or exceeded the threshold.
                  </p>
                </div>
              )}
            </div>

            {/* Footer: Trust text + Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Automated AI candidate qualification • NexaHR Talent Engine</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsScreenedOutOpen(false)}
                  className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                        {emp.firstName} {emp.lastName} ({emp.profile?.designation?.title || emp.designation?.name || emp.role || 'Staff'})
                      </option>
                    ))
                  ) : (
                    <option value="">No Active Employees</option>
                  )}
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
                  className="px-4 py-2.5 rounded-[12px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-[12px] bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 active:scale-95 transition-all"
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
      {/* ========================================================================= */}
      {/* 6. STITCH-INSPIRED LUXURY ADD CANDIDATE MODAL */}
      {/* ========================================================================= */}
      {isAddCandidateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl border border-sky-200/70 dark:border-slate-700/80 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20 ring-4 ring-sky-500/15">
                  <UserPlus className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Add Candidate to Pipeline
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Configure profile information, evaluation stage, duty station, and interview automation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCandidateOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddCandidate} className="overflow-y-auto flex-1 p-6 sm:p-7 space-y-4 custom-scrollbar text-xs relative z-10">
              {/* Section 1: Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Candidate Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Candidate Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John"
                      value={newCandidateForm.name}
                      onChange={(e) => setNewCandidateForm({ ...newCandidateForm, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Target Role */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">
                      Target Role <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[12px] bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                      {newCandidateForm.department || 'Active Requisition'}
                    </span>
                  </div>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior React & Node Engineer"
                      value={newCandidateForm.role}
                      onChange={(e) => setNewCandidateForm({ ...newCandidateForm, role: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Interactive Classification Category Segmented Cards */}
              <div className="space-y-2">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Classification Category / Initial Stage
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    {
                      key: 'APPLIED',
                      title: '1. Sourced & Applied',
                      desc: 'Inbound application or direct sourcing',
                      icon: FileText,
                      activeClass: 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 dark:text-blue-100',
                      iconClass: 'text-blue-600 dark:text-blue-400',
                    },
                    {
                      key: 'SCREENING',
                      title: '2. Screening Call',
                      desc: 'Recruiter culture & compensation screening',
                      icon: Phone,
                      activeClass: 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 dark:text-amber-100',
                      iconClass: 'text-amber-600 dark:text-amber-400',
                    },
                    {
                      key: 'INTERVIEWING',
                      title: '3. Technical Interview',
                      desc: 'Live coding & system design panel review',
                      icon: Video,
                      activeClass: 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/20 text-purple-900 dark:text-purple-100',
                      iconClass: 'text-purple-600 dark:text-purple-400',
                    },
                    {
                      key: 'OFFER',
                      title: '4. Offer Extended',
                      desc: 'Formal compensation package discussion',
                      icon: ShieldCheck,
                      activeClass: 'bg-indigo-50/80 dark:bg-indigo-950/50 border-sky-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-100',
                      iconClass: 'text-indigo-600 dark:text-indigo-400',
                    },
                    {
                      key: 'HIRED',
                      title: '5. Signed & Hired',
                      desc: 'Offer accepted, contract signed & onboarding',
                      icon: CheckCircle2,
                      activeClass: 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 dark:text-emerald-100',
                      iconClass: 'text-emerald-600 dark:text-emerald-400',
                    },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = newCandidateForm.stage === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setNewCandidateForm({ ...newCandidateForm, stage: cat.key })}
                        className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                          isSelected
                            ? cat.activeClass
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white dark:bg-slate-900 shadow-xs' : 'bg-slate-100 dark:bg-slate-700/60'}`}>
                          <Icon className={`w-4 h-4 ${isSelected ? cat.iconClass : 'text-slate-500'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{cat.title}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
                            {cat.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Scope & Target Applicability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Duty Stations / Locations
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={newCandidateForm.location}
                      onChange={(e) => setNewCandidateForm({ ...newCandidateForm, location: e.target.value })}
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="All Duty Stations (HQ + Regional + Remote)">All Duty Stations (HQ + Regional + Remote)</option>
                      <option value="Islamabad HQ / Hybrid">Islamabad HQ / Hybrid</option>
                      <option value="Karachi Regional Hub">Karachi Regional Hub</option>
                      <option value="Lahore Regional Office">Lahore Regional Office</option>
                      <option value="Remote & Distributed">Remote & Distributed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Target Departments
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={newCandidateForm.department}
                      onChange={(e) => setNewCandidateForm({ ...newCandidateForm, department: e.target.value })}
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="Organization-Wide (All Employees)">Organization-Wide (All Employees)</option>
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
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="sarah@example.com"
                      value={newCandidateForm.email}
                      onChange={(e) => setNewCandidateForm({ ...newCandidateForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">
                    Phone & WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="+92 300 1234567"
                      value={newCandidateForm.phone}
                      onChange={(e) => setNewCandidateForm({ ...newCandidateForm, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Smart Policy & Automation Glassmorphic Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 dark:from-slate-800/70 dark:via-slate-800/40 dark:to-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs">
                    <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Candidate Screening & Pipeline Automation</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-[12px] text-[10px] font-extrabold bg-sky-100/80 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/80 dark:border-sky-800">
                    
<span>Smart Orchestration Active</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Toggle 1: Fast-track */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Fast-Track Screening</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Priority interviewer queue.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewCandidateForm({ ...newCandidateForm, fastTrack: !newCandidateForm.fastTrack })}
                      className={`w-11 h-6 rounded-[12px] transition-colors relative cursor-pointer shrink-0 ${
                        newCandidateForm.fastTrack ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 shadow-xs ${
                          newCandidateForm.fastTrack ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Automated Receipt */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Auto Receipt Notice</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Send email confirmation.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewCandidateForm({ ...newCandidateForm, emailConfirm: !newCandidateForm.emailConfirm })}
                      className={`w-11 h-6 rounded-[12px] transition-colors relative cursor-pointer shrink-0 ${
                        newCandidateForm.emailConfirm ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 shadow-xs ${
                          newCandidateForm.emailConfirm ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 3: Skills Assessment */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Skills Assessment</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Dispatch screening test.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewCandidateForm({ ...newCandidateForm, autoAssessment: !newCandidateForm.autoAssessment })}
                      className={`w-11 h-6 rounded-[12px] transition-colors relative cursor-pointer shrink-0 ${
                        newCandidateForm.autoAssessment ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 shadow-xs ${
                          newCandidateForm.autoAssessment ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 6: Resume / Profile Summary */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  Resume / Profile Summary
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    rows={3}
                    placeholder="Outline key achievements, tech stack expertise, previous employers..."
                    value={newCandidateForm.resumeSummary}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, resumeSummary: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddCandidateOpen(false)}
                  className="px-5 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Add Candidate</span>
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
