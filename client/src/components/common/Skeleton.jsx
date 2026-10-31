import React from 'react';

/**
 * Generic Base Skeleton Block with shimmer effect
 */
export const Skeleton = ({ className = '', rounded = 'rounded-[8px]', ...props }) => {
  return (
    <div
      className={`skeleton-shimmer animate-pulse ${rounded} ${className}`}
      {...props}
    />
  );
};

/**
 * Skeleton for modern Employee / Personnel Card Grid
 */
export const EmployeeCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[14px] bg-white dark:bg-[#16211E] p-6 shadow-sm border border-[#E2E1DC] dark:border-[#273834] flex flex-col justify-between space-y-4"
        >
          <div className="space-y-4">
            {/* Header: Avatar + Top Right Action */}
            <div className="flex items-start justify-between">
              <Skeleton className="w-18 h-18 sm:w-20 sm:h-20 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>

            {/* Name and Designation */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4 rounded-[8px]" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>

            {/* Location row */}
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="w-4 h-4 rounded-full shrink-0" />
              <Skeleton className="h-3.5 w-2/3 rounded-md" />
            </div>

            {/* Bio paragraph (3 lines) */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-5/6 rounded-md" />
              <Skeleton className="h-3 w-4/6 rounded-md" />
            </div>

            {/* Contact Rows */}
            <div className="space-y-2.5 pt-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                <Skeleton className="h-3.5 w-1/2 rounded-md" />
              </div>
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                <Skeleton className="h-3.5 w-1/3 rounded-md" />
              </div>
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                <Skeleton className="h-3.5 w-2/5 rounded-md" />
              </div>
            </div>
          </div>

          {/* Footer: Date + 3 action buttons */}
          <div className="pt-4 border-t border-[#E2E1DC] dark:border-[#273834]/80 flex items-center justify-between">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for Department Cards Grid
 */
export const DepartmentCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[14px] bg-white dark:bg-[#16211E] p-6 shadow-sm border border-[#E2E1DC] dark:border-[#273834] flex flex-col justify-between space-y-4"
        >
          <div className="space-y-4">
            {/* Header: Badge Icon + Action buttons */}
            <div className="flex items-start justify-between">
              <Skeleton className="w-14 h-14 rounded-[8px]" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>

            {/* Department Title & Description */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4 rounded-[8px]" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-4/5 rounded-md" />
            </div>

            {/* Department Lead info */}
            <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-slate-900/40 border border-[#E2E1DC] dark:border-[#273834] flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-2/3 rounded-md" />
                <Skeleton className="h-3 w-1/3 rounded-md" />
              </div>
            </div>
          </div>

          {/* Footer: Staff count button */}
          <div className="pt-4 border-t border-[#E2E1DC] dark:border-[#273834]/80 flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-[8px]" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for Table Views (e.g. Employees Table, Attendance, Payroll, Leaves)
 */
export const TableSkeleton = ({ rows = 6, cols = 5 }) => {
  return (
    <div className="bg-white dark:bg-[#16211E] rounded-[14px] shadow-subtle border border-[#E2E1DC] dark:border-[#273834] overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#E2E1DC] dark:border-[#273834] flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-64 rounded-[8px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-[8px]" />
          <Skeleton className="h-9 w-20 rounded-[8px]" />
        </div>
      </div>
      {/* Mobile Card Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden">
        {Array.from({ length: Math.min(rows, 4) }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 rounded-[8px] bg-slate-50/60 dark:bg-slate-800/40 border border-[#E2E1DC] dark:border-[#273834] space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-[8px] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E1DC] dark:border-[#273834]/60">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md ml-auto" />
            </div>
          </div>
        ))}
      </div>
      {/* Desktop Table Skeleton */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-[#E2E1DC] dark:border-[#273834]">
            <tr>
              {Array.from({ length: cols }).map((_, cIdx) => (
                <th key={cIdx} className="py-4 px-5">
                  <Skeleton className="h-3 w-20 rounded-md" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-[8px] shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                  </div>
                </td>
                {Array.from({ length: cols - 1 }).map((_, cIdx) => (
                  <td key={cIdx} className="py-4 px-5">
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Skeleton for Spark Metric Cards (Telemetry KPIs)
 */
export const MetricGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[14px] bg-white dark:bg-[#16211E] p-5 sm:p-6 shadow-sm border border-[#E2E1DC] dark:border-[#273834] flex flex-col justify-between space-y-4 min-h-[160px]"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="w-3 h-3 rounded-full" />
          </div>
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-8 w-20 rounded-[8px]" />
            <Skeleton className="h-4 w-12 rounded-md" />
          </div>
          <div className="h-10 w-full rounded-[8px] overflow-hidden">
            <Skeleton className="w-full h-full rounded-[8px]" />
          </div>
          <div className="pt-2 border-t border-[#E2E1DC] dark:border-[#273834]/80 flex items-center justify-between">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for Profile Pages (Admin & Employee Profile)
 */
export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Hero Card Skeleton */}
      <div className="rounded-[32px] bg-white dark:bg-[#16211E] p-6 sm:p-8 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] flex flex-col sm:flex-row items-center gap-6">
        <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0" />
        <div className="space-y-3 flex-1 text-center sm:text-left">
          <Skeleton className="h-8 w-60 mx-auto sm:mx-0 rounded-[8px]" />
          <Skeleton className="h-4 w-40 mx-auto sm:mx-0 rounded-md" />
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-36 rounded-[8px]" />
        <Skeleton className="h-11 w-36 rounded-[8px]" />
        <Skeleton className="h-11 w-36 rounded-[8px]" />
      </div>

      {/* Form Fields Grid Skeleton */}
      <div className="rounded-[32px] bg-white dark:bg-[#16211E] p-6 sm:p-8 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] space-y-6">
        <Skeleton className="h-6 w-48 rounded-[8px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-12 w-full rounded-[8px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Announcements Grid
 */
export const AnnouncementSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[14px] bg-white dark:bg-[#16211E] p-6 shadow-sm border border-[#E2E1DC] dark:border-[#273834] space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <Skeleton className="h-6 w-3/4 rounded-[8px]" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-5/6 rounded-md" />
            <Skeleton className="h-3.5 w-4/6 rounded-md" />
          </div>
          <div className="pt-4 border-t border-[#E2E1DC] dark:border-[#273834] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="h-3.5 w-20 rounded-md" />
            </div>
            <Skeleton className="h-7 w-20 rounded-[8px]" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for Leave Balance & Request Cards
 */
export const LeaveCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[14px] bg-white dark:bg-[#16211E] p-5 shadow-sm border border-[#E2E1DC] dark:border-[#273834] space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-[8px]" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-24 rounded-md" />
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-7 w-16 rounded-[8px]" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for Job Postings / Requisitions Grid
 */
export const JobCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-[#16211E] rounded-[14px] p-6 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24 rounded-[8px]" />
              <Skeleton className="h-5 w-16 rounded-[8px]" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded-[8px]" />
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <div className="space-y-1.5 pt-2">
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-4/5 rounded-md" />
            </div>
          </div>
          <div className="pt-4 border-t border-[#E2E1DC] dark:border-[#273834] flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-[8px]" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for Helpdesk Tickets List
 */
export const HelpdeskTicketSkeleton = ({ count = 5 }) => {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2.5 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded-[8px]" />
            <Skeleton className="h-3.5 w-5/6 rounded-md" />
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-20 rounded-md" />
            </div>
          </div>
          <div className="flex sm:flex-col items-end gap-2 shrink-0">
            <Skeleton className="h-7 w-24 rounded-[8px]" />
            <Skeleton className="h-3.5 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for User Access Control / Security Roster Grid
 */
export const SecurityRosterSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: User Roster Skeleton */}
      <div className="lg:col-span-5 bg-white dark:bg-[#16211E] rounded-[14px] p-5 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded-[8px]" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-[8px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 flex-1 rounded-[8px]" />
          <Skeleton className="h-8 flex-1 rounded-[8px]" />
        </div>
        <div className="space-y-2 pt-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-3.5 rounded-[8px] border border-[#E2E1DC] dark:border-[#273834] flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-10 h-10 rounded-[8px] shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-36 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Permission Matrix Skeleton */}
      <div className="lg:col-span-7 bg-white dark:bg-[#16211E] rounded-[14px] p-6 sm:p-7 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 rounded-[8px]" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-8 w-28 rounded-[8px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-4 rounded-[8px] border border-[#E2E1DC] dark:border-[#273834] space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="w-9 h-5 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Document Cards & Policy Cards Grid
 */
export const DocumentCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[14px] p-5 border border-[#E2E1DC] dark:border-[#273834] bg-white dark:bg-[#16211E] shadow-subtle space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-[8px]" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#E2E1DC] dark:border-[#273834]">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-[8px]" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for System & Employee Settings Page
 */
export const SettingsSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      {/* Category 1: Theme Selector Skeleton */}
      <div className="w-full bg-white dark:bg-[#16211E] rounded-[14px] p-6 sm:p-8 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E2E1DC] dark:border-[#273834] pb-4">
          <Skeleton className="w-10 h-10 rounded-[8px]" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-1">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-5 rounded-[8px] border border-[#E2E1DC] dark:border-[#273834] bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
              <Skeleton className="h-24 w-full rounded-[8px]" />
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-3 w-32 rounded-md" />
                </div>
                <Skeleton className="w-4 h-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category 2: Regional Preferences Skeleton */}
      <div className="w-full bg-white dark:bg-[#16211E] rounded-[14px] p-6 sm:p-8 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E2E1DC] dark:border-[#273834] pb-4">
          <Skeleton className="w-10 h-10 rounded-[8px]" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3.5 w-72 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-11 w-full rounded-[8px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Category 3: Notification Toggles Skeleton */}
      <div className="w-full bg-white dark:bg-[#16211E] rounded-[14px] p-6 sm:p-8 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E2E1DC] dark:border-[#273834] pb-4">
          <Skeleton className="w-10 h-10 rounded-[8px]" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-52 rounded-md" />
            <Skeleton className="h-3.5 w-60 rounded-md" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-4 rounded-[8px] border border-[#E2E1DC] dark:border-[#273834] flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-3 w-56 rounded-md" />
              </div>
              <Skeleton className="w-11 h-6 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
