import React, { useState, useEffect } from 'react';
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
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const Announcement = () => {
  const { formatDate } = useRegionalSettings();
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_company_announcements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Post form state
  const [form, setForm] = useState({
    title: '',
    category: 'EVENTS',
    priority: 'HIGH',
    department: 'Company-Wide (All Offices)',
    summary: '',
    content: '',
    pinned: false,
  });

  const saveAnnouncements = (updated) => {
    setAnnouncements(updated);
    try {
      localStorage.setItem('nexahr_company_announcements', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const newNotice = {
      id: `ANN-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      priority: form.priority,
      author: 'People Operations & HR',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      date: formatDate(new Date()),
      department: form.department,
      summary: form.summary.trim() || form.content.slice(0, 120) + '...',
      content: form.content.trim(),
      pinned: form.pinned,
      views: 1,
    };

    const updated = [newNotice, ...announcements];
    saveAnnouncements(updated);
    setIsPostModalOpen(false);
    setForm({
      title: '',
      category: 'EVENTS',
      priority: 'HIGH',
      department: 'Company-Wide (All Offices)',
      summary: '',
      content: '',
      pinned: false,
    });
    setToastMsg(`Announcement published and broadcast to employee portal! 🎉`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const togglePin = (id) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a));
    saveAnnouncements(updated);
  };

  const handleDelete = (id) => {
    const updated = announcements.filter((a) => a.id !== id);
    saveAnnouncements(updated);
    setToastMsg('Announcement removed.');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.department || '').toLowerCase().includes(searchQuery.toLowerCase());
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

      {/* STATS METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bulletins</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total} Circulars</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pinned Notices</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.pinned} Pinned</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Events & Retreats</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.events} Events</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Benefits & Policy</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.benefits} Policies</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS CONTROLS */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars by title, keyword, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {['ALL', 'PINNED', 'EVENTS', 'BENEFITS', 'MEETINGS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat === 'PINNED' ? '⭐ Pinned' : cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer shrink-0 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Post Circular</span>
          </button>
        </div>
      </div>

      {/* ANNOUNCEMENTS LIST */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border transition-all ${
                item.pinned
                  ? 'border-blue-300 dark:border-blue-800/80 bg-blue-50/10 dark:bg-blue-950/10'
                  : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        item.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : item.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {item.category} • {item.priority}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                    <span className="text-[11px] text-slate-400 font-medium">• {item.author}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedNotice(item)}
                    className="text-base font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() => setSelectedNotice(item)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Full Notice</span>
                    </button>
                    <span className="text-[11px] text-slate-400">Broadcasted to employee portal</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePin(item.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      item.pinned
                        ? 'border-amber-300 bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:border-amber-800'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                    }`}
                    title={item.pinned ? 'Unpin' : 'Pin to Top'}
                  >
                    <Star className={`w-4 h-4 ${item.pinned ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800">
            <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Announcements Published Yet</h4>
            <p className="text-xs text-slate-400 mt-1">Click "Post Circular" above to broadcast an official announcement to your employees.</p>
          </div>
        )}
      </div>

      {/* MODAL: POST CIRCULAR */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Broadcast Announcement</h3>
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
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Company Retreat 2026 Announcement & RSVP"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="EVENTS">Events & Retreats</option>
                    <option value="BENEFITS">Benefits & Health</option>
                    <option value="MEETINGS">Meetings & Town Halls</option>
                    <option value="OPERATIONS">Operations & IT</option>
                    <option value="CORPORATE">Corporate Circular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Priority Level</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="HIGH">High Priority (Red Alert)</option>
                    <option value="MEDIUM">Medium Priority (Amber)</option>
                    <option value="INFO">Informational (Blue)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Detailed Notice Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Full circular details, instructions, action links..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-bold text-slate-700 dark:text-slate-200">Pin this circular to top of Employee Notice Board</span>
              </label>

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
                  Publish & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  {selectedNotice.category} • {selectedNotice.priority}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">{selectedNotice.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedNotice.date} • {selectedNotice.author}</p>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {selectedNotice.content}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
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
