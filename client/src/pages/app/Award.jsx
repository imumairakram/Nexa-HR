import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  Award as AwardIcon,
  Trophy,
  Plus,
  Star,
  Gift,
  Heart,
  ThumbsUp,
  Search,
  Filter,
  CheckCircle2,
  X,
  Flame,
  Users,
} from 'lucide-react';

const INITIAL_AWARDS = [
  {
    id: 1,
    recipient: 'Alex Mercer',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    title: 'Star Engineer of the Month',
    department: 'Engineering & DevOps',
    month: 'July 2026',
    gift: '$1,000 Spot Bonus',
    reason: 'Outstanding leadership and architecting high-throughput Biometric API Gateway under tight timelines.',
    claps: 28,
  },
  {
    id: 2,
    recipient: 'Sarah Jenkins',
    recipientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    title: 'Design Innovation Excellence',
    department: 'Product & Design',
    month: 'Q2 2026',
    gift: '$500 Wellness Card',
    reason: 'Pioneered the NexaHR enterprise design token system and delivered 100% positive usability scores.',
    claps: 34,
  },
  {
    id: 3,
    recipient: 'Marcus Vance',
    recipientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    title: 'Punctuality & Reliability Champion',
    department: 'Engineering & DevOps',
    month: 'June 2026',
    gift: 'MacBook Pro M3 Max',
    reason: 'Maintained 100% on-time check-in and 99.99% infrastructure uptime across 6 consecutive months.',
    claps: 41,
  },
  {
    id: 4,
    recipient: 'Chloe Bennett',
    recipientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    title: 'People Champion & Top Mentor',
    department: 'People Operations & HR',
    month: 'May 2026',
    gift: '$750 Travel Stipend',
    reason: 'Voted top onboarding mentor and conducted high-impact engineering culture workshops.',
    claps: 22,
  },
];

const Award = () => {
  const [awards, setAwards] = useState(INITIAL_AWARDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNominateOpen, setIsNominateOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form State
  const [form, setForm] = useState({
    recipient: 'David Miller',
    title: 'Innovation Excellence Award',
    department: 'Engineering & DevOps',
    month: 'August 2026',
    gift: '$500 Spot Bonus',
    reason: '',
  });

  const handleCreateAward = (e) => {
    e.preventDefault();
    if (!form.reason.trim()) return;

    const newAward = {
      id: Date.now(),
      recipient: form.recipient,
      recipientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      title: form.title,
      department: form.department,
      month: form.month,
      gift: form.gift,
      reason: form.reason,
      claps: 1,
    };

    setAwards([newAward, ...awards]);
    setIsNominateOpen(false);
    setForm({
      recipient: 'David Miller',
      title: 'Innovation Excellence Award',
      department: 'Engineering & DevOps',
      month: 'August 2026',
      gift: '$500 Spot Bonus',
      reason: '',
    });
    setToastMsg(`Award conferred to ${form.recipient} successfully.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleClap = (id) => {
    setAwards(awards.map((a) => (a.id === id ? { ...a, claps: a.claps + 1 } : a)));
  };

  const filtered = awards.filter(
    (a) =>
      a.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalAwards: awards.length,
    totalRewards: '$2,750',
    honorees: awards.length,
    departments: 3,
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Employee Recognition & Awards Wall"
        subtitle="Celebrate team achievements, stellar milestone performance, and monthly executive awards."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC AWARDS HERO BANNER (AMBER-ORANGE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/60 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-amber-200/70 dark:border-amber-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Recognition Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-extrabold border border-amber-600/20 dark:border-amber-500/30">
                <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Excellence Recognition Active</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-semibold border border-orange-600/20 dark:border-orange-500/30">
                <Gift className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span>Spot Bonuses & Perks</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Employee Recognition & Awards Wall
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Celebrate high performance, innovative milestones, stellar peer support, and confer executive bonuses and company-wide trophies.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold bg-amber-100/60 dark:bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800/60">
                <Trophy className="w-3.5 h-3.5" />
                <span>{stats.totalAwards} Total Awards Conferred</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Gift className="w-3.5 h-3.5" />
                <span>{stats.totalRewards} Spot Rewards Granted</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-amber-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Confer Recognition</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Honor outstanding employee</div>
            </div>
            <button
              onClick={() => setIsNominateOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Confer New Award</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Awards</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.totalAwards} <span className="text-base font-bold text-slate-400">Trophies</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Lifetime Total</span>
              <span className="text-slate-400">Conferred</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Rewards Granted</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.totalRewards}
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Bonus Pool</span>
              <span className="text-slate-400">Disbursed</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Honorees</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {stats.honorees} <span className="text-base font-bold text-slate-400">Champions</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Cross-Functional</span>
              <span className="text-slate-400">Staff</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-rose-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-rose-500/10 blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Peer Appreciations</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              125+ <span className="text-base font-bold text-slate-400">Claps</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-rose-600 dark:text-rose-400 font-bold">Team Morale</span>
              <span className="text-slate-400">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOOLBAR & NOMINATION CTA */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search awardees by name, title, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setIsNominateOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Confer New Award</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. AWARDS GRID CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filtered.map((a) => (
          <div
            key={a.id}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/60 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
          >
            {/* Top decorative glow */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-400/10 via-amber-300/5 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={a.recipientAvatar}
                    alt={a.recipient}
                    className="w-13 h-13 rounded-2xl object-cover ring-2 ring-amber-400/40 shadow-sm"
                  />
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      {a.month}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      {a.recipient}
                    </h3>
                    <p className="text-xs font-medium text-slate-400">{a.department}</p>
                  </div>
                </div>

                <div className="text-2xl p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                  {a.badgeIcon}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>{a.title}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                  "{a.reason}"
                </p>
              </div>
            </div>

            {/* Bottom: Reward & Clap Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Gift className="w-4 h-4" />
                <span>{a.gift}</span>
              </div>

              <button
                onClick={() => handleClap(a.id)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{a.claps} Applauds</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: CONFER NEW AWARD */}
      {/* ========================================================================= */}
      {isNominateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Confer Employee Recognition Award</h3>
              </div>
              <button
                onClick={() => setIsNominateOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAward} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Select Recipient *
                  </label>
                  <select
                    value={form.recipient}
                    onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="David Miller">David Miller (Backend Architect)</option>
                    <option value="Alex Mercer">Alex Mercer (Lead Engineer)</option>
                    <option value="Sarah Jenkins">Sarah Jenkins (Design Lead)</option>
                    <option value="Marcus Vance">Marcus Vance (DevOps Lead)</option>
                    <option value="Chloe Bennett">Chloe Bennett (People Ops)</option>
                    <option value="Lucas Morales">Lucas Morales (Payroll Lead)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Award Category *
                  </label>
                  <select
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Employee of the Month">Employee of the Month</option>
                    <option value="Innovation Excellence Award">Innovation Excellence Award</option>
                    <option value="Punctuality & Reliability Champion">Punctuality Champion</option>
                    <option value="People Champion & Top Mentor">Top Mentor & People Champion</option>
                    <option value="Customer Hero Award">Customer Hero Award</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Reward / Gift *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $500 Spot Bonus, Apple Watch"
                    value={form.gift}
                    onChange={(e) => setForm({ ...form, gift: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Official Citation / Reason for Recognition *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain why this team member is being honored..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNominateOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Present Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Award;
