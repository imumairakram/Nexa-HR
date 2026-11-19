import React from 'react';
import { Users, Plus, ArrowRight } from 'lucide-react';

/**
 * PipelineEmptyState
 * Centered page-level empty state when no applicants exist in the pipeline.
 */
const PipelineEmptyState = ({ onViewJobs }) => {
  return (
    <div className="py-16 px-6 text-center border border-dashed border-[#DCE6EA] dark:border-[#223840] rounded-[24px] bg-white dark:bg-[#112229] my-4 flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] flex items-center justify-center mb-4">
        <Users className="w-7 h-7 stroke-[1.8]" />
      </div>
      <h3 className="text-lg font-bold text-[#0E2A33] dark:text-[#E6F2F5] mb-1.5">
        No candidates yet
      </h3>
      <p className="text-sm text-[#5B727B] dark:text-[#8FA8B1] max-w-sm mb-6 leading-relaxed">
        Share a job link to start receiving applicants and populate your candidate pipeline stages.
      </p>
      <button
        type="button"
        onClick={onViewJobs}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-[12px] bg-[#0A8FB5] hover:bg-[#07617D] dark:bg-[#3CC1E6] dark:hover:bg-[#7FD8F1] text-white dark:text-[#06222B] font-semibold text-sm transition-all cursor-pointer shadow-sm hover:shadow active:scale-98 focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none"
      >
        <span>View jobs</span>
        <ArrowRight className="w-4 h-4 stroke-[2.2]" />
      </button>
    </div>
  );
};

export default PipelineEmptyState;
