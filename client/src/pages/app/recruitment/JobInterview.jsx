import React, { useState } from 'react';
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
} from 'lucide-react';

const INITIAL_INTERVIEWS = [
  { id: 1, candidate: 'Elena Rostova', role: 'DevOps & Security Lead', interviewer: 'Marcus Vance', date: 'Aug 10, 2026', time: '02:00 PM EST', type: 'Technical Architecture Round', link: 'https://meet.google.com/nxa-hr-tech', status: 'SCHEDULED' },
  { id: 2, candidate: 'Devon Vance', role: 'Firmware Specialist', interviewer: 'Alex Mercer', date: 'Aug 11, 2026', time: '11:00 AM EST', type: 'Live IoT Systems Test', link: 'https://meet.google.com/nxa-iot-eval', status: 'SCHEDULED' },
  { id: 3, candidate: 'Maya Lin', role: 'Staff Systems Engineer', interviewer: 'David Miller', date: 'Aug 12, 2026', time: '04:00 PM EST', type: 'System Design Deep Dive', link: 'https://meet.google.com/nxa-sys-arch', status: 'SCHEDULED' },
];

const JobInterview = () => {
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    candidate: '',
    role: 'Senior Software Engineer',
    interviewer: 'Alex Mercer',
    date: '2026-08-14',
    time: '14:00',
    type: 'Technical Interview',
  });

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!form.candidate.trim()) return;

    const newInt = {
      id: Date.now(),
      candidate: form.candidate,
      role: form.role,
      interviewer: form.interviewer,
      date: form.date,
      time: form.time,
      type: form.type,
      link: 'https://meet.google.com/nxa-hr-auto',
      status: 'SCHEDULED',
    };

    setInterviews([...interviews, newInt]);
    setIsAddOpen(false);
    setToastMsg(`Interview scheduled with ${form.candidate}!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

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

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Upcoming Candidate Panels</h3>
          <p className="text-xs text-slate-400">Scheduled video calls and evaluation meetings</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {interviews.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase">
                  {item.type}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                  {item.status}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{item.candidate}</h4>
              <p className="text-xs text-slate-400 font-medium">{item.role}</p>

              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.date} at {item.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Interviewer: {item.interviewer}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Room</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Schedule */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Schedule Candidate Interview</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={form.candidate}
                  onChange={(e) => setForm({ ...form, candidate: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Time *</label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Lead Interviewer *</label>
                <select
                  value={form.interviewer}
                  onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Alex Mercer">Alex Mercer (Lead Engineer)</option>
                  <option value="David Miller">David Miller (Backend Architect)</option>
                  <option value="Marcus Vance">Marcus Vance (DevOps Lead)</option>
                  <option value="Emily Zhang">Emily Zhang (VP Product)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
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
