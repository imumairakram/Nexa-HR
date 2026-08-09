import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Star,
  Tag,
  Share2,
  Trash2,
  CheckCircle2,
  X,
  Eye,
  AlertCircle,
  Building,
  Bell,
  Sparkles,
} from 'lucide-react';

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Annual Company Retreat 2026 Announcement & RSVP',
    category: 'EVENTS',
    priority: 'HIGH',
    author: 'People Operations & HR',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    date: 'Aug 05, 2026',
    department: 'Company-Wide (All Offices)',
    summary: 'We are thrilled to announce our upcoming annual team retreat in Lake Tahoe from Sept 15-18! Flights, hotel accommodations, and activities are fully sponsored.',
    content: 'We are thrilled to announce our upcoming annual team retreat in Lake Tahoe from Sept 15-18! Flights, hotel accommodations, and outdoor excursions are fully sponsored by NexaHR. Please fill out your dietary preferences and room allocation preferences in the portal before Aug 25.',
    pinned: true,
    views: 142,
  },
  {
    id: 2,
    title: 'Updated Comprehensive Health Insurance Benefits Plan',
    category: 'BENEFITS',
    priority: 'MEDIUM',
    author: 'Global Benefits Committee',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    date: 'Aug 02, 2026',
    department: 'All Full-Time Staff',
    summary: 'Open enrollment for FY2027 health, dental, and vision insurance begins next week. Enhanced mental wellness coverage and gym stipend now included.',
    content: 'Open enrollment for FY2027 health, dental, and vision insurance begins next week. Enhanced mental wellness counseling ($1,200 annual credit) and fitness gym stipend ($60/mo) are now included in every tier.',
    pinned: false,
    views: 98,
  },
  {
    id: 3,
    title: 'Q3 Town Hall & Executive Roadmap All-Hands',
    category: 'MEETINGS',
    priority: 'INFO',
    author: 'Executive Leadership Team',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    date: 'Jul 28, 2026',
    department: 'All Departments',
    summary: 'Join CEO and Leadership for the quarterly company-wide town hall this Friday at 3:00 PM EST. Submit your anonymous Q&A questions beforehand.',
    content: 'Join CEO and Leadership for the quarterly company-wide town hall this Friday at 3:00 PM EST. We will review Q2 growth metrics, upcoming enterprise AI rollouts, and answer team questions live.',
    pinned: false,
    views: 210,
  },
  {
    id: 4,
    title: 'Office Infrastructure Biometric Gateway Upgrade',
    category: 'OPERATIONS',
    priority: 'HIGH',
    author: 'IT & Security Operations',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    date: 'Jul 20, 2026',
    department: 'San Francisco & NY Hubs',
    summary: 'Hardware biometrics firmware is being updated this Saturday between 12:00 AM - 04:00 AM EST. Web check-in available during maintenance.',
    content: 'Hardware biometrics firmware is being updated this Saturday between 12:00 AM - 04:00 AM EST. Physical turnstiles will remain unlocked with badge backup. Normal operations resume Sunday.',
    pinned: false,
    views: 85,
  },
];

const Announcement = () => {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Post form state
  const [form, setForm] = useState({
    title: '',
    category: 'CORPORATE',
    priority: 'MEDIUM',
    department: 'All Departments',
    summary: '',
    content: '',
    pinned: false,
  });

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const newNotice = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      priority: form.priority,
      author: 'HR Administrator (You)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      department: form.department,
      summary: form.summary || form.content.slice(0, 120) + '...',
      content: form.content,
      pinned: form.pinned,
      views: 1,
    };

    setAnnouncements([newNotice, ...announcements]);
    setIsPostModalOpen(false);
    setForm({
      title: '',
      category: 'CORPORATE',
      priority: 'MEDIUM',
      department: 'All Departments',
      summary: '',
      content: '',
      pinned: false,
    });
    setToastMsg(`Announcement published successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const togglePin = (id) => {
    setAnnouncements(
      announcements.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
    );
  };

  const handleDelete = (id) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    setToastMsg('Announcement removed.');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'PINNED' ? a.pinned : a.category === categoryFilter);
    return matchesSearch && matchesCat;
  });

  const stats = {
    total: announcements.length,
    pinned: announcements.filter((a) => a.pinned).length,
    events: announcements.filter((a) => a.category === 'EVENTS').length,
    benefits: announcements.filter((a) => a.category === 'BENEFITS').length,
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Company Announcements & Notice Board"
        subtitle="Publish official company circulars, policy changes, retreat notices, and executive broadcasts."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STATS METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Notices</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total} Circulars</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pinned Notices</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.pinned} Featured</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Events & Town Halls</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.events} Active</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Benefits Updates</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.benefits} Circulars</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements by title, department, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Announcement</span>
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {['ALL', 'PINNED', 'EVENTS', 'BENEFITS', 'MEETINGS', 'OPERATIONS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Notices' : cat === 'PINNED' ? '⭐ Pinned' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ANNOUNCEMENTS LIST */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border transition-all ${
              item.pinned
                ? 'border-blue-300 dark:border-blue-800/80 bg-blue-50/20 dark:bg-blue-950/10'
                : 'border-slate-100 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase">
                    {item.category}
                  </span>

                  {item.priority === 'HIGH' && (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold">
                      🔴 URGENT
                    </span>
                  )}

                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </span>

                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Building className="w-3.5 h-3.5" />
                    <span>{item.department}</span>
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.summary}
                </p>

                <div className="pt-2 flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.authorAvatar}
                      alt={item.author}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.author}</span>
                  </div>
                  <span>•</span>
                  <span>{item.views} Views</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                <button
                  onClick={() => togglePin(item.id)}
                  title={item.pinned ? 'Unpin' : 'Pin to Top'}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    item.pinned
                      ? 'bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-950/60'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-500'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={() => setSelectedNotice(item)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Notice</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  title="Delete Announcement"
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: PUBLISH ANNOUNCEMENT */}
      {/* ========================================================================= */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Publish New Announcement</h3>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Town Hall Meeting & Product Strategy..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="EVENTS">Events & Retreats</option>
                    <option value="BENEFITS">Benefits & Perks</option>
                    <option value="MEETINGS">Town Halls & Meetings</option>
                    <option value="OPERATIONS">Operations & IT</option>
                    <option value="CORPORATE">Corporate Policy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Priority Tier *
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="HIGH">High (Urgent)</option>
                    <option value="MEDIUM">Medium (Standard)</option>
                    <option value="INFO">Informational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. All Departments"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Detailed Circular Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter full notice body, instructions, and links..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="pinCheck" className="text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                  Pin this circular to top of all employee dashboards
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: VIEW FULL NOTICE */}
      {/* ========================================================================= */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase">
                  {selectedNotice.category}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              {selectedNotice.content}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Published by {selectedNotice.author} on {selectedNotice.date}</span>
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;
