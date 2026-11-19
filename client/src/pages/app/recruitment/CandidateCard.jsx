import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Mail,
  Eye,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';

/**
 * Helper to compute relative time: "Just now", "2d ago", etc.
 */
const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

/**
 * Helper to extract initials from candidate name
 */
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * CandidateCard
 * Compact, scannable Kanban card with drag-and-drop, quick actions on hover,
 * clean percentage score display, and relative applied date.
 */
const CandidateCard = React.memo(({
  c,
  sIdx,
  stages = [],
  draggedCandidateId,
  onDragStart,
  onClick,
  onMoveStage,
}) => {
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close move menu on outside click or escape
  useEffect(() => {
    if (!isMoveMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMoveMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMoveMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoveMenuOpen]);

  const initials = getInitials(c.name);
  const relativeDate = formatRelativeTime(c.appliedDate || c.createdAt);
  const isBeingDragged = draggedCandidateId === c.id;

  // AI score tier
  const aiScore = typeof c.aiScore === 'number' ? c.aiScore : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, c.id)}
      onClick={() => onClick(c)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(c);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Candidate ${c.name}, applied for ${c.role}`}
      className={`group relative bg-white dark:bg-[#16272E] rounded-[14px] p-3.5 border border-[#DCE6EA] dark:border-[#223840] shadow-xs hover:shadow-md hover:border-[#0A8FB5]/40 dark:hover:border-[#3CC1E6]/40 transition-all cursor-grab active:cursor-grabbing select-none focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none ${
        isBeingDragged ? 'opacity-40 scale-95 border-[#0A8FB5] dark:border-[#3CC1E6] ring-2 ring-[#0A8FB5]/30' : ''
      }`}
    >
      {/* Top Row: Avatar + Name + AI Score (Number and percentage symbol only) */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Avatar with Initials */}
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#0D1B21] border border-slate-200/80 dark:border-slate-800 text-[#0E2A33] dark:text-[#E6F2F5] font-bold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>

          {/* Name & Role */}
          <div className="min-w-0 flex-1">
            <h5 className="text-xs sm:text-[13px] font-bold text-[#0E2A33] dark:text-[#E6F2F5] group-hover:text-[#0A8FB5] dark:group-hover:text-[#3CC1E6] transition-colors leading-tight truncate">
              {c.name}
            </h5>
            <p className="text-[11px] text-[#5B727B] dark:text-[#8FA8B1] truncate mt-0.5">
              {c.role}
            </p>
          </div>
        </div>

        {/* AI Score: Number and percentage symbol only */}
        {aiScore !== null && (
          <span
            className={`text-xs font-bold tabular-nums shrink-0 ${
              aiScore >= 85
                ? 'text-emerald-600 dark:text-emerald-400'
                : aiScore >= 70
                ? 'text-[#0A8FB5] dark:text-[#3CC1E6]'
                : 'text-amber-600 dark:text-amber-400'
            }`}
            title={`AI Fit Score: ${aiScore}%`}
          >
            {aiScore}%
          </span>
        )}
      </div>

      {/* Interview pill if scheduled */}
      {c.interview && (
        <div className="mt-2.5 p-1.5 rounded-[8px] bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-center gap-1.5 text-[10px] text-purple-700 dark:text-purple-300 font-semibold truncate">
          <Video className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="truncate">{c.interview.date} • {c.interview.time}</span>
        </div>
      )}

      {/* Footer: Quick Actions (on hover) & Relative Date */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between min-h-[26px]">
        {/* Left: Quick Actions (visible on hover) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
        >
          {/* View Profile */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick(c);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-[#0A8FB5] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="View full candidate profile"
            aria-label="View candidate profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Email Candidate */}
          {c.email && (
            <a
              href={`mailto:${c.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md text-slate-400 hover:text-[#0A8FB5] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Send email to ${c.email}`}
              aria-label={`Send email to ${c.email}`}
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Right side: Move to Stage Menu (visible on hover) + Relative Date */}
        <div className="flex items-center gap-2">
          {/* Move to Stage Menu */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
            ref={menuRef}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMoveMenuOpen((prev) => !prev);
              }}
              className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                isMoveMenuOpen
                  ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6]'
                  : 'text-slate-400 hover:text-[#0E2A33] dark:hover:text-[#E6F2F5] hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Move to another stage"
              aria-label="Move candidate to stage"
              aria-expanded={isMoveMenuOpen}
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span className="text-[10px]">Move</span>
            </button>

            {/* Move to Stage Dropdown Menu */}
            {isMoveMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-1 w-44 rounded-xl bg-white dark:bg-[#16272E] border border-[#DCE6EA] dark:border-[#223840] shadow-lg p-1 z-30 animate-in fade-in zoom-in-95"
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Move to stage
                </div>
                <div className="py-1 space-y-0.5">
                  {stages
                    .filter((s) => s.key !== c.stage && !(s.key === 'INTERVIEWING' && c.stage === 'INTERVIEW'))
                    .map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => {
                          setIsMoveMenuOpen(false);
                          onMoveStage(c.id, s.key);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21] hover:text-[#0A8FB5] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          <span className="truncate">{s.name || s.label}</span>
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Relative Date */}
          {relativeDate && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
              {relativeDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default CandidateCard;
