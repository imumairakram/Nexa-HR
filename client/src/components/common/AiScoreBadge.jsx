import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * AI Candidate Screening Score Badge
 * Re-mapped to DESIGN.md palette:
 * - >= 85: Amber FILL with dark ink text (#1C2321) (WCAG AA compliant contrast)
 * - 70-84: Deep Teal FILL with white text
 * - < 70: Neutral warm slate with dark ink text
 * Strict 8px control radius, tabular-nums.
 */
export const AiScoreBadge = ({ score = 0, showLabel = true, className = '' }) => {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;

  let styling = '';
  let ratingLabel = '';

  if (numericScore >= 85) {
    // High match: Amber fill with dark ink text
    styling = 'bg-amber-500 text-[#1C2321] border border-amber-600/40 dark:bg-amber-400 dark:text-[#0F1715] shadow-2xs';
    ratingLabel = 'High Match';
  } else if (numericScore >= 70) {
    // Passing match: Deep Teal fill with white text
    styling = 'bg-teal-700 text-white border border-teal-800 dark:bg-teal-600 dark:text-white shadow-2xs';
    ratingLabel = 'Passing';
  } else {
    // Review / Low match: Neutral warm slate
    styling = 'bg-[#ECEAE4] text-[#1C2321] border border-[#E2E0D8] dark:bg-[#273834] dark:text-[#F1F5F4] dark:border-[#384E48]';
    ratingLabel = 'Under Review';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[12px] text-[10px] sm:text-[11px] font-bold tracking-tight select-none shrink-0 ${styling} ${className}`}
      title={`AI Screening Score: ${numericScore}/100 (${ratingLabel})`}
    >
      <Sparkles className="w-3 h-3 stroke-[1.75] shrink-0" />
      <span className="tabular-nums">{numericScore}</span>
      {showLabel && <span className="opacity-80 font-semibold text-[10px]">AI</span>}
    </span>
  );
};

export default AiScoreBadge;

