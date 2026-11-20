import React, { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal,
  Users,
  Share2,
  Check,
  ChevronDown,
  Edit3,
  Copy,
  Trash2,
  PauseCircle,
  PlayCircle,
  Clock,
  Banknote,
  AlertTriangle,
} from 'lucide-react';

/**
 * Derives a clean single-line meta string: "Islamabad · On-site · Full-time"
 */
export const getJobMetaString = (job) => {
  const parts = [];
  if (job.location) {
    const match = job.location.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      if (match[1].trim()) parts.push(match[1].trim());
      if (match[2].trim()) parts.push(match[2].trim());
    } else {
      parts.push(job.location.trim());
    }
  }

  if (job.workplace && !parts.some((p) => p.toLowerCase() === job.workplace.toLowerCase())) {
    parts.push(job.workplace.trim());
  }

  const type = job.type || job.employmentType;
  if (type && !parts.some((p) => p.toLowerCase() === type.toLowerCase())) {
    parts.push(type.trim());
  }

  return parts.length > 0 ? parts.join(' · ') : 'Islamabad · On-site · Full-time';
};

/**
 * "⋯" Dropdown Menu with Edit, Duplicate (if supported), Close/Reopen, and Delete with Confirmation Dialog
 */
export const JobCardMenu = ({ job, onEdit, onToggleStatus, onDelete, onDuplicate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close menu and confirm dialog on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowConfirmDelete(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isClosed = job.status !== 'ACTIVE';

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Job options"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#5B727B] hover:text-[#0E2A33] dark:text-[#8FA8B1] dark:hover:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#12333D] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 text-left">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(job);
              }}
              className="w-full text-left px-3 py-1.5 rounded-[8px] text-xs font-medium text-[#0E2A33] dark:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#12333D] flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#5B727B] dark:text-[#8FA8B1]" />
              <span>Edit</span>
            </button>
          )}

          {onDuplicate && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDuplicate(job);
              }}
              className="w-full text-left px-3 py-1.5 rounded-[8px] text-xs font-medium text-[#0E2A33] dark:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#12333D] flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none"
            >
              <Copy className="w-3.5 h-3.5 text-[#5B727B] dark:text-[#8FA8B1]" />
              <span>Duplicate</span>
            </button>
          )}

          {onToggleStatus && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onToggleStatus(job);
              }}
              className="w-full text-left px-3 py-1.5 rounded-[8px] text-xs font-medium text-[#0E2A33] dark:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#12333D] flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none"
            >
              {isClosed ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Reopen job</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Close job</span>
                </>
              )}
            </button>
          )}

          {onDelete && (
            <>
              <div className="border-t border-[#DCE6EA] dark:border-[#223840] my-1" />
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowConfirmDelete(true);
                }}
                className="w-full text-left px-3 py-1.5 rounded-[8px] text-xs font-medium text-[#C0354A] dark:text-[#F07185] hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {showConfirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowConfirmDelete(false)}
        >
          <div
            className="bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[20px] p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#C0354A] dark:text-[#F07185] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 id="confirm-delete-title" className="text-base font-bold text-[#0E2A33] dark:text-[#E6F2F5]">
                  Delete this job?
                </h4>
                <p className="text-xs text-[#5B727B] dark:text-[#8FA8B1] leading-relaxed">
                  This will also remove its applicants. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE6EA] dark:border-[#223840]">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-3.5 py-1.5 rounded-[10px] text-xs font-semibold text-[#5B727B] hover:text-[#0E2A33] dark:text-[#8FA8B1] dark:hover:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#12333D] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmDelete(false);
                  onDelete(job.id);
                }}
                className="px-4 py-1.5 rounded-[10px] bg-[#C0354A] hover:bg-[#a82c3f] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Expandable Details Panel revealing full description, experience & salary
 */
export const JobCardDetails = ({ job, isExpanded }) => {
  return (
    <div
      id={`job-details-${job.id}`}
      className={`overflow-hidden transition-all duration-200 ease-in-out ${
        isExpanded
          ? 'max-h-96 opacity-100 pt-3 border-t border-[#DCE6EA]/60 dark:border-[#223840]/60 space-y-2.5'
          : 'max-h-0 opacity-0'
      }`}
    >
      {job.description && (
        <p className="text-xs text-[#5B727B] dark:text-[#8FA8B1] leading-relaxed whitespace-pre-line text-left">
          {job.description}
        </p>
      )}

      {(job.experience || job.salary) && (
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          {job.experience && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5B727B] dark:text-[#8FA8B1] bg-[#F5F8F9] dark:bg-[#0D1B21] px-2.5 py-1 rounded-[8px] border border-[#DCE6EA] dark:border-[#223840]">
              <Clock className="w-3.5 h-3.5 text-[#5B727B] dark:text-[#8FA8B1]" />
              <span>{job.experience}</span>
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#157A45] dark:text-[#5FD08C] bg-[#DDF3E6] dark:bg-[#12301F] px-2.5 py-1 rounded-[8px]">
              <Banknote className="w-3.5 h-3.5 text-current" />
              <span>{job.salary}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Redesigned, compact and scannable Job Card component
 */
export const JobCard = ({
  job,
  onViewApplicants,
  onShare,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const metaString = getJobMetaString(job);
  const isActive = job.status === 'ACTIVE';

  const handleShareClick = () => {
    if (onShare) {
      onShare(job);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[18px] sm:rounded-[20px] p-4 sm:p-4.5 shadow-[0_1px_2px_rgba(14,42,51,0.06),0_8px_24px_-12px_rgba(14,42,51,0.14)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)] flex flex-col justify-between gap-3 relative transition-all duration-200 hover:shadow-md hover:border-[#0A8FB5]/50 hover:-translate-y-0.5 group text-left self-start w-full">
      <div className="space-y-2">
        {/* Row 1: Department tag (left), status badge "● Active/Closed" (right), then "⋯" icon button */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-[#07617D] dark:text-[#3CC1E6] bg-[#E1F4FA] dark:bg-[#12333D] rounded-[8px] px-2.5 py-0.5 truncate max-w-[160px] sm:max-w-[200px]">
            {job.dept || job.department || 'General'}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-[12px] px-2.5 py-0.5 select-none ${
                isActive
                  ? 'text-[#157A45] dark:text-[#5FD08C] bg-[#DDF3E6] dark:bg-[#12301F]'
                  : 'text-[#9A6100] dark:text-[#F0BE5A] bg-[#FBEFD3] dark:bg-[#33270B]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-[#157A45] dark:bg-[#5FD08C]' : 'bg-[#9A6100] dark:bg-[#F0BE5A]'
                }`}
              />
              <span>{isActive ? 'Active' : 'Closed'}</span>
            </span>

            <JobCardMenu
              job={job}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          </div>
        </div>

        {/* Row 2: Job title (prominent, max 2 lines, truncate with ellipsis) */}
        <h3
          className="text-base sm:text-[17px] font-bold text-[#0E2A33] dark:text-[#E6F2F5] leading-snug line-clamp-2 tracking-tight"
          title={job.title}
        >
          {job.title}
        </h3>

        {/* Row 3: One muted meta line: "Islamabad · On-site · Full-time" */}
        <p className="text-xs text-[#5B727B] dark:text-[#8FA8B1] font-medium truncate">
          {metaString}
        </p>
      </div>

      <div className="space-y-1.5 pt-1">
        {/* Divider */}
        <div className="border-t border-[#DCE6EA] dark:border-[#223840]" />

        {/* Row 4: Primary button "Applicants" with count badge + icon-only Share button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => onViewApplicants && onViewApplicants(job)}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[12px] bg-[#0A8FB5] hover:bg-[#07617D] dark:bg-[#3CC1E6] dark:hover:bg-[#7FD8F1] text-white dark:text-[#06222B] font-semibold text-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Applicants</span>
            <b className="bg-white/25 dark:bg-black/20 rounded-[6px] px-1.5 py-0.5 font-bold text-[11px]">
              {job.applicants ?? 0}
            </b>
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            aria-label="Copy share link"
            title={copied ? 'Link copied' : 'Copy share link'}
            className="w-9 h-9 rounded-[12px] border border-[#DCE6EA] dark:border-[#223840] bg-white dark:bg-[#112229] hover:border-[#0A8FB5] dark:hover:border-[#3CC1E6] text-[#5B727B] dark:text-[#8FA8B1] hover:text-[#0A8FB5] dark:hover:text-[#3CC1E6] flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in-50 duration-150" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Details Toggle Button */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          aria-controls={`job-details-${job.id}`}
          className="w-full flex items-center justify-center gap-1 pt-1.5 text-[11px] font-semibold text-[#5B727B] hover:text-[#0A8FB5] dark:text-[#8FA8B1] dark:hover:text-[#3CC1E6] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0A8FB5] focus-visible:outline-none select-none"
        >
          <span>{isExpanded ? 'Hide Details' : 'Details'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Expandable Section */}
        <JobCardDetails job={job} isExpanded={isExpanded} />
      </div>
    </article>
  );
};

export default JobCard;
