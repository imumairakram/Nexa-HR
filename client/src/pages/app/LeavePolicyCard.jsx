import React, { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Sun,
  HeartPulse,
  Coffee,
  Compass,
  GraduationCap,
  CalendarDays,
} from 'lucide-react';

/**
 * Returns a suitable Lucide icon based on the leave policy name and code
 */
export const getPolicyIcon = (policy) => {
  const name = (policy?.name || '').toLowerCase();
  const code = (policy?.code || '').toLowerCase();

  if (name.includes('medical') || name.includes('sick') || code.includes('sick')) {
    return HeartPulse;
  }
  if (name.includes('annual') || name.includes('vacation') || code.includes('annual')) {
    return Sun;
  }
  if (name.includes('casual') || code.includes('casual')) {
    return Coffee;
  }
  if (name.includes('unpaid') || name.includes('sabbatical') || code.includes('unpaid')) {
    return Compass;
  }
  if (
    name.includes('study') ||
    name.includes('training') ||
    name.includes('education') ||
    code.includes('study')
  ) {
    return GraduationCap;
  }
  return CalendarDays;
};

/**
 * Determines whether the policy is paid or unpaid
 */
export const isPaidPolicy = (policy) => {
  if (typeof policy?.isPaid === 'boolean') return policy.isPaid;
  if (policy?.type === 'PAID') return true;
  if (policy?.type === 'UNPAID') return false;
  return true;
};

/**
 * Subcomponent: QuotaStat
 * Renders the hero quota number with unit on the left and the wage status chip on the right
 */
export const QuotaStat = ({ policy }) => {
  const isPaid = isPaidPolicy(policy);
  const quotaDays = policy?.daysAllowed ?? policy?.days ?? 0;
  const wageLabel = isPaid ? '100% Paid' : 'Unpaid';

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      {/* Hero Stat: Large bold number + small muted unit */}
      <div className="flex items-baseline">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tabular-nums tracking-tight">
          {quotaDays}
        </span>
        <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1.5">
          days / year
        </span>
      </div>

      {/* Wage Status Chip */}
      <span
        className={`px-2.5 py-1 rounded-[10px] text-[11px] font-bold tracking-tight shrink-0 border ${
          isPaid
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60'
            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60'
        }`}
      >
        {wageLabel}
      </span>
    </div>
  );
};

/**
 * Subcomponent: LeaveCardMenu
 * Renders the 3-dots action dropdown with View, Edit, and Delete actions
 */
export const LeaveCardMenu = ({ policy, onView, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative z-10 shrink-0" ref={menuRef}>
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4 stroke-[2]" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Policy actions"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onView?.(policy);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Details</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onEdit?.(policy);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Policy</span>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDelete?.(policy);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer text-left"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Main Subcomponent: LeavePolicyCard
 * Renders the streamlined, scannable leave policy card
 */
export const LeavePolicyCard = ({ policy, onView, onEdit, onDelete }) => {
  const isPaid = isPaidPolicy(policy);
  const PolicyIcon = getPolicyIcon(policy);

  return (
    <div
      className="relative bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group text-left h-full"
    >
      <div>
        {/* Header Row: Left Icon Tile + Title + Right More Actions Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Rounded Icon Tile tinted by policy type */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                isPaid
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40'
              }`}
            >
              <PolicyIcon className="w-5 h-5 stroke-[2]" />
            </div>

            {/* Title (stretched click target) */}
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                <button
                  type="button"
                  onClick={() => onView?.(policy)}
                  className="text-left cursor-pointer focus:outline-none focus-visible:underline after:absolute after:inset-0 after:content-[''] after:rounded-2xl"
                >
                  {policy.name}
                </button>
              </h3>
            </div>
          </div>

          {/* 3-Dots Menu */}
          <LeaveCardMenu
            policy={policy}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        {/* Description: Muted, Clamped to 2 lines */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
          {policy.description || 'Standard corporate leave entitlement and eligibility guidelines apply.'}
        </p>
      </div>

      <div>
        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 my-3.5" />

        {/* Stat Row */}
        <QuotaStat policy={policy} />
      </div>
    </div>
  );
};

export default LeavePolicyCard;
