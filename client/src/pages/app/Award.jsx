import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { Award as AwardIcon, Trophy, Plus, Star, Gift } from 'lucide-react';

const Award = () => {
  const [awards, setAwards] = useState([
    { id: 1, recipient: 'Alex Mercer', title: 'Employee of the Month', department: 'Engineering', month: 'July 2026', gift: '$1,000 Bonus', reason: 'Outstanding leadership during high-load infrastructure migration' },
    { id: 2, title: 'Innovation Excellence Award', recipient: 'Sarah Jenkins', department: 'Marketing', month: 'Q2 2026', gift: '$500 Voucher', reason: 'Pioneered AI-driven social media growth campaign' },
    { id: 3, title: 'Star Performer', recipient: 'Emily Zhang', department: 'Product & Design', month: 'June 2026', gift: 'MacBook M3 Pro', reason: 'Redesigned core mobile application design system' },
  ]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Employee Recognition & Awards Wall" subtitle="Celebrate team achievements, stellar performance, and monthly awards" />

      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Recognition Wall</h3>
          <p className="text-xs text-slate-400">Nominate team members for outstanding achievements</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Nominate / Give Award</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {awards.map((a) => (
          <div key={a.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between space-y-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none flex items-top justify-end p-4">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>

            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                {a.month}
              </span>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">{a.title}</h4>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">{a.recipient}</p>
              <p className="text-[11px] text-slate-400 font-medium">{a.department}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">"{a.reason}"</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Gift className="w-4 h-4" />
              <span>Reward: {a.gift}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Award;
