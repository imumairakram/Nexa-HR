import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Heart,
  ThumbsUp,
  Star,
  Plus,
  X,
  CheckCircle2,
  Users,
  Trophy,
  Flame,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const INITIAL_MY_BADGES = [
  { id: 1, title: 'Star Engineer Q2 2026', desc: 'Awarded for architecting high-throughput Biometric API Gateway', icon: Trophy, color: 'from-amber-400 to-orange-500', date: 'Jun 2026' },
  { id: 2, title: 'Punctuality Champion', desc: '100% On-time check-in record for 6 consecutive months', icon: Sparkles, color: 'from-emerald-400 to-teal-500', date: 'May 2026' },
  { id: 3, title: 'Team Player & Mentor', desc: 'Voted top mentor during new engineering onboarding sprint', icon: Heart, color: 'from-pink-500 to-rose-500', date: 'Mar 2026' },
];

const INITIAL_KUDOS_FEED = [
  {
    id: 1,
    from: 'Sarah Jenkins (UX Lead)',
    fromAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    to: 'Alex Mercer',
    badge: '🚀 Rock Star Delivery',
    message: 'Huge thanks to Alex for staying late to help unblock the client dashboard responsive bug!',
    time: 'Yesterday',
    likes: 8,
  },
  {
    id: 2,
    from: 'Marcus Vance (DevOps)',
    fromAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    to: 'David Miller',
    badge: '💡 Innovation Spark',
    message: 'Awesome work automating our CI/CD container tests. Build time dropped by 40%!',
    time: '3 days ago',
    likes: 12,
  },
  {
    id: 3,
    from: 'Emily Zhang (Product)',
    fromAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    to: 'Sarah Jenkins',
    badge: '🎨 Design Excellence',
    message: 'The new employee self-service wireframes received 100% positive executive feedback.',
    time: 'Aug 01',
    likes: 15,
  },
];

const EmployeeAwards = () => {
  const [kudosList, setKudosList] = useState(INITIAL_KUDOS_FEED);
  const [isSendKudosOpen, setIsSendKudosOpen] = useState(false);
  const [recipient, setRecipient] = useState('Sarah Jenkins');
  const [selectedBadge, setSelectedBadge] = useState('🚀 Rock Star Delivery');
  const [kudosNote, setKudosNote] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const handleSendKudos = (e) => {
    e.preventDefault();
    const newKudos = {
      id: Date.now(),
      from: 'Alex Mercer (You)',
      fromAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      to: recipient,
      badge: selectedBadge,
      message: kudosNote,
      time: 'Just now',
      likes: 1,
    };
    setKudosList([newKudos, ...kudosList]);
    setIsSendKudosOpen(false);
    setKudosNote('');
    setToastMsg(`Kudos sent to ${recipient}! 🎉`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLike = (id) => {
    setKudosList(
      kudosList.map((k) => (k.id === id ? { ...k, likes: k.likes + 1 } : k))
    );
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Awards & Kudos"
        subtitle="Milestones, honors, and peer recognitions."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EMPLOYEE OF THE MONTH SPOTLIGHT */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Employee of the Month • July 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Alex Mercer</h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl">
              "For exceptional technical leadership on the biometric hardware sync protocol and delivering core sprint milestones ahead of schedule."
            </p>
          </div>

          <button
            onClick={() => setIsSendKudosOpen(true)}
            className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-50 rounded-2xl text-xs font-extrabold shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Send Kudos to a Peer</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MY HONORS & BADGES */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          My Earned Badges & Recognition ({INITIAL_MY_BADGES.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_MY_BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">{b.date}</span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{b.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PEER KUDOS WALL */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Company Kudos Wall
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Real-time peer appreciation and cross-department shoutouts
            </p>
          </div>

          <button
            onClick={() => setIsSendKudosOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Give Kudos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {kudosList.map((k) => (
            <div
              key={k.id}
              className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    {k.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">{k.time}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  "{k.message}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={k.fromAvatar} alt={k.from} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    To <strong className="text-emerald-600 dark:text-emerald-400">{k.to}</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleLike(k.id)}
                  className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{k.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SEND KUDOS MODAL */}
      {/* ========================================================================= */}
      {isSendKudosOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Send Peer Kudos 🎉
              </h3>
              <button
                onClick={() => setIsSendKudosOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendKudos} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teammate
                </label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (UI/UX Design)</option>
                  <option value="David Miller">David Miller (Full-Stack Dev)</option>
                  <option value="Marcus Vance">Marcus Vance (DevOps Lead)</option>
                  <option value="Emily Zhang">Emily Zhang (Product Manager)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Praise Badge
                </label>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="🚀 Rock Star Delivery">🚀 Rock Star Delivery</option>
                  <option value="💡 Innovation Spark">💡 Innovation Spark</option>
                  <option value="🎨 Design Excellence">🎨 Design Excellence</option>
                  <option value="❤️ Team Player & Mentor">❤️ Team Player & Mentor</option>
                  <option value="🔥 Problem Solver">🔥 Problem Solver</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Appreciation Message
                </label>
                <textarea
                  rows={3}
                  value={kudosNote}
                  onChange={(e) => setKudosNote(e.target.value)}
                  placeholder="Tell them why they rock! (e.g. Thanks for your quick help on the client bug...)"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSendKudosOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Post Kudos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAwards;
