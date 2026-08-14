import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Calendar,
  User,
  Star,
  Download,
  Eye,
  CheckCircle2,
  Tag,
  Share2,
  X,
  Bell,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const EmployeeAnnouncements = () => {
  const [filter, setFilter] = useState('ALL');
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_company_announcements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedItem, setSelectedItem] = useState(null);

  // Sync live announcements when HR updates or posts
  const loadAnnouncements = () => {
    try {
      const saved = localStorage.getItem('nexahr_company_announcements');
      setAnnouncements(saved ? JSON.parse(saved) : []);
    } catch {
      setAnnouncements([]);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    window.addEventListener('storage', loadAnnouncements);
    return () => window.removeEventListener('storage', loadAnnouncements);
  }, []);

  const togglePin = (id) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a));
    setAnnouncements(updated);
    try {
      localStorage.setItem('nexahr_company_announcements', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const filtered = announcements.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'PINNED') return a.pinned;
    return a.category === filter;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Company Notice Board"
        subtitle="Official circulars, executive communications, retreat updates, and HR bulletins."
        onRefresh={loadAnnouncements}
      />

      {/* Category Filter Chips */}
      {announcements.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'PINNED', 'EVENTS', 'BENEFITS', 'MEETINGS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All Notices' : cat === 'PINNED' ? '⭐ Pinned' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border transition-all ${
                item.pinned
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
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
                    onClick={() => setSelectedItem(item)}
                    className="text-base font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Full Announcement</span>
                    </button>
                    <span className="text-[11px] text-slate-400">Broadcast to all staff</span>
                  </div>
                </div>

                <button
                  onClick={() => togglePin(item.id)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                    item.pinned
                      ? 'border-amber-300 bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:border-amber-800'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500 hover:bg-slate-50'
                  }`}
                  title={item.pinned ? 'Unpin' : 'Pin to Top'}
                >
                  <Star className={`w-4 h-4 ${item.pinned ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
            <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Company Announcements Posted Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Official circulars, retreat notices, and policy broadcasts from HR Management will appear here in real-time.
            </p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  {selectedItem.category} • {selectedItem.priority}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">{selectedItem.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedItem.date} • {selectedItem.author}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {selectedItem.content || selectedItem.summary}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAnnouncements;
