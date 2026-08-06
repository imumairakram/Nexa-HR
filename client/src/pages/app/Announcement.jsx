import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { Megaphone, Plus, Bell, Calendar, User } from 'lucide-react';

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Annual Company Retreat 2026 Announcement', date: '08/05/2026', category: 'EVENT', priority: 'HIGH', content: 'We are thrilled to announce our upcoming annual team retreat in Lake Tahoe from Sept 15-18!' },
    { id: 2, title: 'Updated Health Insurance Benefit Plan', date: '08/02/2026', category: 'BENEFITS', priority: 'MEDIUM', content: 'Please review the updated medical coverage brochure in the Media Library. Open enrollment ends Aug 25.' },
    { id: 3, title: 'Q3 Town Hall All-Hands Meeting', date: '07/28/2026', category: 'MEETING', priority: 'INFO', content: 'Join CEO & Leadership for Q3 roadmap strategy update this Friday at 3:00 PM EST.' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title) return;
    setAnnouncements([
      {
        id: Date.now(),
        title,
        content,
        date: new Date().toLocaleDateString(),
        category: 'COMPANY',
        priority: 'INFO',
      },
      ...announcements,
    ]);
    setTitle('');
    setContent('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Company Announcements" subtitle="Broadcast internal news, events, and important organization updates" />

      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Notices ({announcements.length})</h3>
          <p className="text-xs text-slate-400">Announcements appear on all employee dashboards</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  a.priority === 'HIGH' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' :
                  a.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                }`}>
                  {a.category} • {a.priority}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{a.date}</span>
              </div>
            </div>

            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{a.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{a.content}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">New Announcement</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headline Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Q3 Townhall Schedule"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Details</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Write message..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;
