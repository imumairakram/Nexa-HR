import React, { useState } from 'react';
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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Annual Company Retreat 2026 Announcement & RSVP',
    category: 'EVENTS',
    priority: 'HIGH',
    author: 'People Operations & HR',
    date: 'Aug 05, 2026',
    summary: 'We are thrilled to announce our upcoming annual team retreat in Lake Tahoe from Sept 15-18! Flights, hotel accommodations, and activities are fully sponsored.',
    content: 'We are thrilled to announce our upcoming annual team retreat in Lake Tahoe from Sept 15-18! Flights, hotel accommodations, and outdoor excursions are fully sponsored by NexaHR. Please fill out your dietary preferences and room allocation preferences in the portal before Aug 25.',
    pinned: true,
  },
  {
    id: 2,
    title: 'Updated Comprehensive Health Insurance Benefits Plan',
    category: 'BENEFITS',
    priority: 'MEDIUM',
    author: 'Global Benefits Committee',
    date: 'Aug 02, 2026',
    summary: 'Open enrollment for FY2027 health, dental, and vision insurance begins next week. Enhanced mental wellness coverage and gym stipend now included.',
    content: 'Open enrollment for FY2027 health, dental, and vision insurance begins next week. Enhanced mental wellness counseling ($1,200 annual credit) and fitness gym stipend ($60/mo) are now included in every tier.',
    pinned: false,
  },
  {
    id: 3,
    title: 'Q3 Town Hall & Executive Roadmap All-Hands',
    category: 'MEETINGS',
    priority: 'INFO',
    author: 'Executive Leadership Team',
    date: 'Jul 28, 2026',
    summary: 'Join CEO and Leadership for the quarterly company-wide town hall this Friday at 3:00 PM EST. Submit your anonymous Q&A questions beforehand.',
    content: 'Join CEO and Leadership for the quarterly company-wide town hall this Friday at 3:00 PM EST. We will review Q2 growth metrics, upcoming enterprise AI rollouts, and answer team questions live.',
    pinned: false,
  },
];

const EmployeeAnnouncements = () => {
  const [filter, setFilter] = useState('ALL');
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [selectedItem, setSelectedItem] = useState(null);

  const togglePin = (id) => {
    setAnnouncements(
      announcements.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
    );
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
      />

      {/* Category Filter Chips */}
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

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((item) => (
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

                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  {item.summary}
                </p>
              </div>

              <button
                onClick={() => togglePin(item.id)}
                title={item.pinned ? 'Unpin' : 'Pin to top'}
                className={`p-2 rounded-2xl transition-all cursor-pointer ${
                  item.pinned
                    ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-slate-300 dark:text-slate-600 hover:text-slate-600'
                }`}
              >
                <Star className={`w-4 h-4 ${item.pinned ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedItem(item)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Read Full Announcement</span>
              </button>

              <span className="text-[11px] text-slate-400 font-medium">Broadcast to all staff</span>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Reader Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {selectedItem.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedItem.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Posted by {selectedItem.author} on {selectedItem.date}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedItem.content}
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
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

export default EmployeeAnnouncements;
