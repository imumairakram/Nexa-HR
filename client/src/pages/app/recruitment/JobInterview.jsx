import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  X,
  User,
  Users,
  Briefcase,
  Check,
  Ban,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../../services/api';

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

const JobInterview = () => {
  const [interviews, setInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    candidate: '',
    role: 'Senior Software Engineer',
    interviewer: 'Sarah Jenkins',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    type: 'Technical Round',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      let savedInterviews = [];
      try {
        const saved = localStorage.getItem('nexahr_recruitment_interviews');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) savedInterviews = parsed;
        }
      } catch (e) {
        console.warn(e);
      }

      if (savedInterviews.length === 0) {
        savedInterviews = DEFAULT_INTERVIEWS;
        try {
          localStorage.setItem('nexahr_recruitment_interviews', JSON.stringify(savedInterviews));
        } catch (e) {
          console.error(e);
        }
      }

      const res = await api.getEmployees();
      if (res?.success && res.data?.employees) {
        const emps = res.data.employees;
        setEmployees(emps);
        if (emps.length > 0 && !form.interviewer) {
          setForm((prev) => ({
            ...prev,
            interviewer: `${emps[0].firstName} ${emps[0].lastName}`,
          }));
        }
      }

      setInterviews(savedInterviews);
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!form.candidate.trim()) return;

    const newInt = {
      id: Date.now(),
      candidate: form.candidate.trim(),
      role: form.role,
      interviewer: form.interviewer || (employees[0] ? `${employees[0].firstName} ${employees[0].lastName}` : 'Hiring Lead'),
      date: form.date,
      time: form.time,
      type: form.type,
      link: 'https://meet.google.com/nxa-hr-auto',
      status: 'SCHEDULED',
    };

    const updated = [newInt, ...interviews];
    setInterviews(updated);
    try {
      localStorage.setItem('nexahr_recruitment_interviews', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setIsAddOpen(false);
    setForm((prev) => ({
      ...prev,
      candidate: '',
    }));
    setToastMsg(`Interview scheduled for ${newInt.candidate}!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updated = interviews.map((item) => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setInterviews(updated);
    try {
      localStorage.setItem('nexahr_recruitment_interviews', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setToastMsg(`Interview status updated to "${newStatus}"!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleDeleteInterview = (id) => {
    const updated = interviews.filter((item) => item.id !== id);
    setInterviews(updated);
    try {
      localStorage.setItem('nexahr_recruitment_interviews', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setToastMsg('Interview session removed from schedule.');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = interviews.filter((item) => {
    const matchesSearch =
      item.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.interviewer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Candidate Interview Schedules & Panels"
        subtitle="Coordinate technical assessments, panel interviews, calendar invitations, and scorecards."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC JOB INTERVIEWS HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Interview Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Candidate Interview Schedules & Panels
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Coordinate technical assessments, panel loops, calendar invitations, video room links, and evaluator scorecards.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Calendar className="w-3.5 h-3.5" />
                <span>{interviews.length} Scheduled Sessions</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Clock className="w-3.5 h-3.5" />
                <span>100% Calendar Confirmed</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Schedule Loop</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Book video assessment</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Schedule Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search interviews by candidate, position, or interviewer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'SCHEDULED', 'PASSED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Sessions' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">{item.candidate}</h4>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{item.role}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  item.status === 'PASSED'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : item.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Round: {item.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.date} at {item.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lead Evaluator: {item.interviewer}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Video Room</span>
              </a>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleUpdateStatus(item.id, 'PASSED')}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 flex items-center justify-center gap-1 cursor-pointer"
                  title="Mark as Passed"
                >
                  <Check className="w-3 h-3" />
                  <span>Pass</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                  className="flex-1 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[11px] hover:bg-rose-100 flex items-center justify-center gap-1 cursor-pointer"
                  title="Mark as Rejected"
                >
                  <Ban className="w-3 h-3" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => handleDeleteInterview(item.id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: SCHEDULE INTERVIEW */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Schedule Candidate Assessment</h3>
                  <p className="text-xs text-slate-500">Book video interview with panel evaluators.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={form.candidate}
                  onChange={(e) => setForm({ ...form, candidate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Panel Evaluator</label>
                <select
                  value={form.interviewer}
                  onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                        {emp.firstName} {emp.lastName} ({emp.profile?.designation?.title || 'Staff Specialist'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Sarah Jenkins">Sarah Jenkins (Lead Staff Engineer)</option>
                      <option value="Alex Mercer">Alex Mercer (Principal UI/UX Designer)</option>
                      <option value="Muhammad Umair">Muhammad Umair (System Administrator)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Assessment Round</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Technical Screening">Technical Screening</option>
                  <option value="System Architecture Round">System Architecture Round</option>
                  <option value="Pair Coding Assessment">Pair Coding Assessment</option>
                  <option value="Leadership & Culture Fit">Leadership & Culture Fit</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobInterview;
