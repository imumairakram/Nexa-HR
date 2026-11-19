import React from 'react';

/**
 * PipelineSummary
 * Thin summary strip above the board with stage counts, hidden on mobile.
 */
const PipelineSummary = ({ stages = [], candidates = [] }) => {
  const total = candidates.length;

  return (
    <div className="hidden lg:flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[14px] shadow-2xs text-xs">
      <div className="flex items-center gap-3 xl:gap-5 overflow-x-auto no-scrollbar scrollbar-none">
        <span className="font-bold text-[#0E2A33] dark:text-[#E6F2F5] shrink-0">Pipeline Overview:</span>
        <div className="flex items-center gap-3 xl:gap-5">
          {stages.map((stage) => {
            const count = candidates.filter(
              (c) => c.stage === stage.key || (stage.key === 'INTERVIEWING' && c.stage === 'INTERVIEW')
            ).length;

            return (
              <div key={stage.key} className="flex items-center gap-1.5 shrink-0">
                <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {stage.name || stage.label}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-4 border-l border-slate-200/60 dark:border-slate-800 shrink-0">
        Total in Pipeline: <span className="font-bold text-[#0E2A33] dark:text-[#E6F2F5] tabular-nums">{total}</span>
      </div>
    </div>
  );
};

export default PipelineSummary;
