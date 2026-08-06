import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Globe, ExternalLink, Sliders, CheckCircle2 } from 'lucide-react';

const JobBoard = () => {
  const [boardConfig, setBoardConfig] = useState({
    title: 'NexaHR Public Careers Portal',
    subtext: 'Join our mission building next-generation enterprise software',
    primaryColor: '#4F46E5',
    published: true,
  });

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Public Job Board Portal Settings" subtitle="Customize and publish your company public careers page" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Portal Settings</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Career Site Heading</label>
              <input
                type="text"
                value={boardConfig.title}
                onChange={(e) => setBoardConfig({ ...boardConfig, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Welcome Subtext</label>
              <textarea
                rows={3}
                value={boardConfig.subtext}
                onChange={(e) => setBoardConfig({ ...boardConfig, subtext: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2 bg-slate-950 text-white rounded-3xl p-8 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Live Portal Preview
              </span>
              <button className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
                <span>Open Public URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-6 text-center space-y-2">
              <h2 className="text-2xl font-black">{boardConfig.title}</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">{boardConfig.subtext}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-center text-slate-400">
            4 Active Job Requisitions Published
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobBoard;
