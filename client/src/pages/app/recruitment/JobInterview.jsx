import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Calendar, Clock, User, Plus, Star, Video } from 'lucide-react';

const JobInterview = () => {
  const [interviews, setInterviews] = useState([
    { id: 1, candidate: 'Michael Scott', role: 'Senior Full Stack Engineer', round: 'Technical System Design', interviewer: 'Alex Mercer', time: 'Today, 02:00 PM', link: 'https://meet.google.com/abc-def-ghi' },
    { id: 2, candidate: 'Jessica Alba', role: 'Lead Product Designer', round: 'Portfolio Review & UX Challenge', interviewer: 'Emily Zhang', time: 'Tomorrow, 11:00 AM', link: 'https://meet.google.com/jkl-mno-pqr' },
    { id: 3, candidate: 'Pam Beesly', role: 'Lead Product Designer', round: 'Executive Culture Alignment', interviewer: 'Sarah Jenkins', time: 'Aug 10, 04:30 PM', link: 'https://meet.google.com/stu-vwx-yz' },
  ]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Interview Scheduler & Feedback" subtitle="Manage scheduled interviews, Google Meet links, and candidate rating scorecards" />

      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Upcoming Interviews ({interviews.length})</h3>
          <p className="text-xs text-slate-400">Calendar invitations sent automatically</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Schedule Interview</span>
        </button>
      </div>

      <div className="space-y-4">
        {interviews.map((i) => (
          <div key={i.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  {i.round}
                </span>
                <span className="text-xs font-bold text-slate-400">{i.time}</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{i.candidate}</h4>
              <p className="text-xs text-slate-400 font-medium">{i.role} • Interviewer: {i.interviewer}</p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={i.link}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Join Call</span>
              </a>
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl hover:bg-slate-200 cursor-pointer">
                Scorecard
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobInterview;
