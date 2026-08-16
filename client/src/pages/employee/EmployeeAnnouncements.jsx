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
  Sparkles,
  Pin,
  Bookmark,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';

const EmployeeAnnouncements = () => {
  const [filter, setFilter] = useState('ALL');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sync live announcements from backend
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.getAnnouncements();
      if (res?.success && res.data?.announcements) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error('Failed to load employee announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    window.addEventListener('nexahr_notification_updated', loadAnnouncements);
    return () => window.removeEventListener('nexahr_notification_updated', loadAnnouncements);
  }, []);

  const togglePin = async (id, currentPinned) => {
    try {
      await api.updateAnnouncement(id, { pinned: !currentPinned });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, pinned: !currentPinned } : a))
      );
    } catch (e) {
      console.warn('Error toggling pin:', e);
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
        subtitle="Official circulars, executive broadcasts, benefits updates, and department memos."
        onRefresh={loadAnnouncements}
        loading={loading}
      />

      {/* ========================================================================= */}
      {/* 1. SEGMENTED CATEGORY TABS (SLEEK PILLS) */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex-wrap">
          {[
            { id: 'ALL', label: 'All Circulars' },
            { id: 'PINNED', label: 'Pinned Only' },
            { id: 'EVENTS', label: 'Events' },
            { id: 'BENEFITS', label: 'Benefits' },
            { id: 'MEETINGS', label: 'Meetings & All-Hands' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === cat.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-400">
          Showing {filtered.length} notices
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. ANNOUNCEMENTS LIST (PREMIUM PURE WHITE CARDS) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-6 shadow-soft border transition-all hover:shadow-md ${
                item.pinned
                  ? 'bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-white dark:to-[#1E293B] border-amber-200/70 dark:border-amber-900/40'
                  : 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1 min-w-0">
                  {/* Category & Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60">
                        <Pin className="w-2.5 h-2.5" />
                        <span>PINNED NOTICE</span>
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        item.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60'
                          : item.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60'
                      }`}
                    >
                      {item.category} • {item.priority || 'GENERAL'}
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                    <span className="text-[11px] text-slate-400 font-medium">• By {item.author || 'HR Dept'}</span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setSelectedItem(item)}
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h3>

                  {/* Description / Summary */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
                    {item.summary || item.desc}
                  </p>

                  {/* Footer Actions */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Full Notice</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium">Broadcasted to all personnel</span>
                  </div>
                </div>

                {/* Star / Pin Button */}
                <button
                  onClick={() => togglePin(item.id, item.pinned)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                    item.pinned
                      ? 'border-amber-300 bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:border-amber-800'
                      : 'border-slate-200/70 dark:border-slate-800 text-slate-400 hover:text-amber-500 hover:bg-slate-50'
                  }`}
                  title={item.pinned ? 'Unpin Announcement' : 'Pin to Top'}
                >
                  <Star className={`w-4 h-4 ${item.pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
            <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">No Notices in This Category</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              All official memos and circulars will be published here as soon as executive broadcasts are posted.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. FULL ANNOUNCEMENT MODAL READER */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {selectedItem.category}
                </span>
                <span className="text-xs text-slate-400">{selectedItem.date}</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {selectedItem.title}
              </h2>
              <div className="text-xs font-semibold text-slate-400">
                Author: {selectedItem.author || 'People Operations'}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedItem.summary || selectedItem.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
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
