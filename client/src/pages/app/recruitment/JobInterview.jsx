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

const DEFAULT_INTERVIEWS = [];

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
    role: '',
    interviewer: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    type: 'Technical Round',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ivRes, empRes] = await Promise.allSettled([
        api.getJobInterviews(),
        api.getEmployees(),
      ]);

      if (ivRes.status === 'fulfilled' && ivRes.value?.success && ivRes.value.data?.interviews) {
        setInterviews(ivRes.value.data.interviews);
      } else {
        setInterviews([]);
      }

      if (empRes.status === 'fulfilled' && empRes.value?.success && empRes.value.data?.employees) {
        const emps = empRes.value.data.employees;
        setEmployees(emps);
        if (emps.length > 0 && !form.interviewer) {
          setForm((prev) => ({
            ...prev,
            interviewer: `${emps[0].firstName} ${emps[0].lastName}`,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!form.candidate.trim()) return;

    try {
      const payload = {
        candidateName: form.candidate.trim(),
        role: form.role,
        interviewer: form.interviewer || (employees[0] ? `${employees[0].firstName} ${employees[0].lastName}` : 'Hiring Lead'),
        date: form.date,
        time: form.time,
        round: form.type,
        meetLink: 'https://meet.google.com/nxa-hr-auto',
      };

      const res = await api.createJobInterview(payload);
      if (res?.success && res.data?.interview) {
        const created = res.data.interview;
        const formatted = {
          ...created,
          candidate: created.candidateName,
          type: created.round,
          link: created.meetLink,
        };
        const updated = [formatted, ...interviews];
        setInterviews(updated);
        try {
          localStorage.setItem('nexahr_recruitment_interviews', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        setToastMsg(`Interview scheduled for ${formatted.candidate} and saved to database!`);
      } else {
        throw new Error(res?.message || 'Failed to schedule interview');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setToastMsg(`Error: ${err.message || 'Failed to save interview to database'}`);
    } finally {
      setIsAddOpen(false);
      setForm((prev) => ({
        ...prev,
        candidate: '',
      }));
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateJobInterview(id, { status: newStatus });
    } catch (err) {
      console.warn('API error updating interview:', err);
    }
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

  const handleDeleteInterview = async (id) => {
    try {
      await api.deleteJobInterview(id);
    } catch (err) {
      console.warn('API error deleting interview:', err);
    }
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
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-sky-200/70 dark:border-sky-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
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
              <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold bg-sky-100/60 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800/60">
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
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-sky-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Schedule Loop</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Book video assessment</div>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
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
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-lg w-full shadow-2xl border border-sky-200/60 dark:border-indigo-800/60 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-100/80 dark:border-sky-800/60 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/60 dark:via-sky-900/40 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 ring-4 ring-sky-500/15">
                  <Video className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Schedule Candidate Assessment
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Book video interview session with panel evaluators.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="p-6 sm:p-7 space-y-4 text-xs relative z-10">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={form.candidate}
                  onChange={(e) => setForm({ ...form, candidate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Panel Evaluator</label>
                <select
                  value={form.interviewer}
                  onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer"
                >
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                        {emp.firstName} {emp.lastName} ({emp.profile?.designation?.title || emp.designation?.name || 'Staff Specialist'})
                      </option>
                    ))
                  ) : (
                    <option value="">No Active Employees</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Assessment Round</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer"
                >
                  <option value="Technical Screening">Technical Screening</option>
                  <option value="System Architecture Round">System Architecture Round</option>
                  <option value="Pair Coding Assessment">Pair Coding Assessment</option>
                  <option value="Leadership & Culture Fit">Leadership & Culture Fit</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold shadow-md shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
