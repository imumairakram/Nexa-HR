import React from 'react';
import {
  Search,
  X,
  LayoutGrid,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

/**
 * PipelineToolbar
 * - Left: Search input (full width on mobile), Role dropdown.
 * - Right: Board view indicator + AI Screened-Out button.
 */
const PipelineToolbar = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  uniqueRoles = [],
  totalCandidates = 0,
  currentView = 'kanban',
  onViewChange,
  interviewsCount = 0,
  screenedOutCount = 0,
  onOpenScreenedOut,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
      {/* Left: Search Bar & Role Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search candidates by name, role, tech stack..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[12px] pl-9.5 pr-8 py-2 text-xs sm:text-[13px] font-medium text-[#0E2A33] dark:text-[#E6F2F5] placeholder-[#5B727B]/70 focus:outline-none focus:border-[#0A8FB5] dark:focus:border-[#3CC1E6] transition-colors shadow-2xs"
          />
          <Search className="w-4 h-4 text-[#5B727B] dark:text-[#8FA8B1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              title="Clear search"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Dropdown */}
        <div className="relative shrink-0 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[12px] pl-3.5 pr-8 py-2 text-xs sm:text-[13px] font-medium text-[#0E2A33] dark:text-[#E6F2F5] focus:outline-none focus:border-[#0A8FB5] dark:focus:border-[#3CC1E6] shadow-2xs cursor-pointer max-w-full sm:max-w-[210px] truncate"
            aria-label="Filter candidates by role"
          >
            <option value="ALL">All Roles ({totalCandidates})</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#5B727B] dark:text-[#8FA8B1] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right: Board & AI Screened-Out Button */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-0.5 md:pb-0 shrink-0">
        {/* Board View Button */}
        <div className="flex items-center bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[12px] p-1 shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => onViewChange && onViewChange('kanban')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-[#0E2A33] text-white dark:bg-[#0B3946] dark:text-[#E8F6FA] shadow-xs cursor-pointer whitespace-nowrap"
            aria-pressed={true}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
        </div>

        {/* AI Screened-Out Outlined Button */}
        <button
          type="button"
          onClick={onOpenScreenedOut}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shadow-2xs shrink-0 ${
            screenedOutCount > 0
              ? 'border-amber-400 dark:border-amber-500/50 bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-amber-950/50'
              : 'border-[#DCE6EA] dark:border-[#223840] bg-white dark:bg-[#112229] text-[#5B727B] dark:text-[#8FA8B1] hover:text-[#0E2A33] dark:hover:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
          }`}
          title="View low-score, unmatched, or error candidates stored for audit"
          aria-label={`View AI Screened-Out candidates (${screenedOutCount})`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${screenedOutCount > 0 ? 'text-amber-500' : 'text-[#5B727B] dark:text-[#8FA8B1]'}`} />
          <span>AI Screened-Out</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              screenedOutCount > 0
                ? 'bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {screenedOutCount}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PipelineToolbar;
