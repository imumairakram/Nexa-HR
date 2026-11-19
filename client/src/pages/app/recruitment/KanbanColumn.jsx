import React from 'react';
import { ArrowDown } from 'lucide-react';
import CandidateCard from './CandidateCard';

/**
 * KanbanColumn
 * - 16px radius, neutral surface, subtle 1px border.
 * - Sticky header with colored dot, clean stage name, and count pill.
 * - Shows dashed drop target ONLY while dragged over.
 * - Column body scrolls vertically on its own.
 */
const KanbanColumn = ({
  stage,
  sIdx,
  stages = [],
  candidates = [],
  draggedCandidateId,
  isOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onCandidateClick,
  onMoveStage,
}) => {
  const stageName = stage.name || stage.label.replace(/^\d+\.\s*/, '');

  return (
    <div
      onDragOver={(e) => onDragOver(e, stage.key)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, stage.key)}
      className={`min-w-[280px] lg:min-w-0 snap-start flex-1 flex flex-col rounded-[16px] bg-[#F8FAFB] dark:bg-[#112229]/60 border transition-all duration-200 max-h-[calc(100vh-230px)] min-h-[480px] ${
        isOver
          ? 'border-[#0A8FB5] dark:border-[#3CC1E6] ring-2 ring-[#0A8FB5]/20 bg-[#E1F4FA]/20 dark:bg-[#12333D]/20'
          : 'border-[#DCE6EA] dark:border-[#223840]'
      }`}
    >
      {/* Sticky Column Header */}
      <div className="sticky top-0 z-10 bg-[#F8FAFB]/95 dark:bg-[#112229]/95 backdrop-blur-xs py-2.5 px-3.5 border-b border-[#DCE6EA]/70 dark:border-[#223840]/70 flex items-center justify-between rounded-t-[16px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full ${stage.dot} shrink-0`} />
          <h4 className="text-xs font-bold text-[#0E2A33] dark:text-[#E6F2F5] truncate">
            {stageName}
          </h4>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#16272E] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs tabular-nums shrink-0">
          {candidates.length}
        </span>
      </div>

      {/* Column Body: Scrollable Card Stack */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
        {/* Dynamic Dashed Drop Target: shown ONLY while dragged over this column */}
        {isOver && (
          <div className="py-7 text-center border-2 border-dashed border-[#0A8FB5] dark:border-[#3CC1E6] bg-[#E1F4FA]/40 dark:bg-[#12333D]/40 rounded-xl flex flex-col items-center justify-center text-[#07617D] dark:text-[#3CC1E6] animate-in fade-in duration-150">
            <ArrowDown className="w-4 h-4 stroke-[2.5] mb-1 animate-bounce" />
            <span className="text-xs font-bold">Drop here to move</span>
          </div>
        )}

        {/* Candidate Cards */}
        {candidates.map((c) => (
          <CandidateCard
            key={c.id}
            c={c}
            sIdx={sIdx}
            stages={stages}
            draggedCandidateId={draggedCandidateId}
            onDragStart={onDragStart}
            onClick={onCandidateClick}
            onMoveStage={onMoveStage}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
