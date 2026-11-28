import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  X,
  ChevronDown,
  Check,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';

/**
 * ModernSearchBarSection
 *
 * Reusable, high-fidelity search & filtering bar matching the modern SaaS segmented UI.
 * Features:
 * - Segmented status tabs with count badges (All, Paid/Approved, Pending, etc.)
 * - Date range quick picker
 * - Sort selector with direction toggle
 * - Capsule search input with tag chips, smart hint, and Cmd/Ctrl+K shortcut
 * - Filters popover button with active counter badge
 * - Optional top-right action button
 *
 * Mobile behaviour (< sm breakpoint):
 * - Row 1 (status tabs, date range, sort, view toggle) is HIDDEN
 * - All those controls move INSIDE the Filters panel so the user can access them
 * - Only the search bar + Filters button are shown on mobile
 */
const ModernSearchBarSection = ({
  statusTabs = [],
  activeStatus = 'ALL',
  onStatusChange,
  customTabs = null,
  viewMode = '',
  onViewModeChange = null,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchShortPlaceholder = '',
  searchHint = '',
  filterTags = [],
  onRemoveTag,
  dateRangeLabel = '',
  dateRangeOptions = [],
  activeDateRange = 'ALL',
  onDateRangeChange,
  sortOptions = [],
  activeSort = '',
  sortOrder = 'desc', // 'asc' | 'desc'
  onSortChange,
  filterCount = 0,
  filterContent = null,
  actionButton = null,
  className = '',
}) => {
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  // Tracks whether we're on a mobile-sized screen
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  const dateMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const filterMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Track window size for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target)) {
        setShowDateMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSortOption = sortOptions.find((s) => s.key === activeSort) || sortOptions[0];
  const sortRawLabel = activeSortOption?.label || 'Default';
  const sortDisplayLabel = sortRawLabel.toLowerCase().startsWith('sort:')
    ? sortRawLabel
    : `Sort: ${sortRawLabel}`;

  // Calculate effective filter count: on mobile include status/date/sort as "filters"
  const mobileExtraCount =
    isMobile
      ? (activeStatus !== 'ALL' ? 1 : 0) +
        (activeDateRange !== 'ALL' ? 1 : 0) +
        (activeSort ? 1 : 0)
      : 0;
  const effectiveFilterCount = filterCount + mobileExtraCount;

  // Whether any Row-1 controls exist
  const hasRow1 =
    customTabs ||
    statusTabs.length > 0 ||
    dateRangeOptions.length > 0 ||
    sortOptions.length > 0 ||
    onViewModeChange ||
    actionButton;

  // Whether to show the filter button at all
  const showFilterButton = filterContent || effectiveFilterCount > 0 || isMobile;

  return (
    <div className={`space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0 ${className}`}>
      {/* ========================================================================= */}
      {/* ROW 1: STATUS SEGMENTS + DATE RANGE & SORT PICKERS (+ ACTION BUTTON)      */}
      {/* Hidden on mobile — controls move into the Filters panel instead           */}
      {/* ========================================================================= */}
      {hasRow1 && (
        <div className="hidden sm:flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 w-full min-w-0">
          {/* Left: Custom Tabs (e.g. Issued Documents vs Policies) + Segmented Status Pills */}
          <div className="flex items-center gap-1.5 flex-wrap lg:flex-nowrap max-w-full min-w-0">
            {customTabs}
            {statusTabs.length > 0 && (
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[12px] shadow-2xs overflow-x-auto max-w-full min-w-0 scrollbar-none no-scrollbar">
                {statusTabs.map((tab) => {
                  const isSelected = activeStatus === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => onStatusChange && onStatusChange(tab.key)}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[12px] text-xs sm:text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                        isSelected
                          ? 'bg-[#0E2A33] text-white dark:bg-[#0B3946] dark:text-[#E8F6FA]'
                          : 'text-[#5B727B] hover:text-[#0E2A33] dark:text-[#8FA8B1] dark:hover:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-[10px] transition-all ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#5B727B] dark:text-[#8FA8B1]'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Date Range + Sort Controls + Action Button */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 sm:gap-2 ml-auto shrink-0 max-w-full">
            {/* Date Range Picker Button */}
            {dateRangeOptions.length > 0 && (
              <div className="relative" ref={dateMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDateMenu((v) => !v);
                    setShowSortMenu(false);
                    setShowFilterMenu(false);
                  }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 h-9 px-3.5 rounded-[12px] bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] text-xs sm:text-[13.5px] font-medium text-[#0E2A33] dark:text-[#E6F2F5] hover:border-[#0A8FB5] shadow-2xs transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#5B727B] dark:text-[#8FA8B1] shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{dateRangeLabel || 'Date Range'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#5B727B] dark:text-[#8FA8B1] shrink-0 transition-transform ${showDateMenu ? 'rotate-180' : ''}`} />
                </button>

                {showDateMenu && (
                  <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-[#DCE6EA] dark:border-[#223840] text-[10px] font-bold uppercase tracking-wider text-[#5B727B] dark:text-[#8FA8B1]">
                      Select Time Range
                    </div>
                    <div className="p-1 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
                      {dateRangeOptions.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            onDateRangeChange && onDateRangeChange(opt.key);
                            setShowDateMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs sm:text-[13px] font-medium transition-all cursor-pointer ${
                            activeDateRange === opt.key
                              ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] font-bold'
                              : 'text-[#0E2A33] dark:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {activeDateRange === opt.key && <Check className="w-3.5 h-3.5 text-[#0A8FB5] dark:text-[#3CC1E6]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sort Selector Button */}
            {sortOptions.length > 0 && (
              <div className="relative" ref={sortMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSortMenu((v) => !v);
                    setShowDateMenu(false);
                    setShowFilterMenu(false);
                  }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 h-9 px-3.5 rounded-[12px] bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] text-xs sm:text-[13.5px] font-medium text-[#0E2A33] dark:text-[#E6F2F5] hover:border-[#0A8FB5] shadow-2xs transition-all cursor-pointer"
                >
                  <ArrowUpDown className="w-4 h-4 text-[#5B727B] dark:text-[#8FA8B1] shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-none">{sortDisplayLabel}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#5B727B] dark:text-[#8FA8B1] shrink-0 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] shadow-2xl py-1.5 z-40 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-[#DCE6EA] dark:border-[#223840] text-[10px] font-bold uppercase tracking-wider text-[#5B727B] dark:text-[#8FA8B1]">
                      Sort Criteria
                    </div>
                    <div className="p-1 space-y-0.5">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            const nextOrder = activeSort === opt.key && sortOrder === 'desc' ? 'asc' : 'desc';
                            onSortChange && onSortChange(opt.key, nextOrder);
                            setShowSortMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs sm:text-[13px] font-medium transition-all cursor-pointer ${
                            activeSort === opt.key
                              ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] font-bold'
                              : 'text-[#0E2A33] dark:text-[#E6F2F5] hover:bg-[#F5F8F9] dark:hover:bg-[#0D1B21]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {activeSort === opt.key && (
                            <span className="text-[10px] uppercase font-bold text-[#0A8FB5] dark:text-[#3CC1E6]">
                              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View Mode Toggle Capsule (Grid / List) */}
            {onViewModeChange && (
              <div className="flex items-center bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] rounded-[12px] p-1 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => onViewModeChange('list')}
                  className={`w-9 h-7 rounded-[12px] flex items-center justify-center transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6]'
                      : 'text-[#5B727B] dark:text-[#8FA8B1] hover:text-[#0E2A33] dark:hover:text-[#E6F2F5]'
                  }`}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('grid')}
                  className={`w-9 h-7 rounded-[12px] flex items-center justify-center transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6]'
                      : 'text-[#5B727B] dark:text-[#8FA8B1] hover:text-[#0E2A33] dark:hover:text-[#E6F2F5]'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Button (e.g. + Apply on Behalf, + Add Holiday) */}
            {actionButton}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROW 2: SEARCH CAPSULE + CHIPS + SHORTCUT + FILTERS BUTTON                 */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-2.5 w-full">
        {/* Search Input Container */}
        <div className="flex-1 min-w-0 h-9 flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 rounded-[12px] bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] shadow-2xs focus-within:border-[#0A8FB5] dark:focus-within:border-[#3CC1E6] transition-colors">
          <Search className="w-4 h-4 text-[#5B727B] dark:text-[#8FA8B1] shrink-0" />

          {/* Interactive Filter Chips */}
          {filterTags.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 max-w-[50%] sm:max-w-none overflow-x-auto scrollbar-none no-scrollbar py-0.5">
              {filterTags.map((tag) => {
                let labelText = (tag.label || '').trim();
                let valText = (tag.value !== undefined && tag.value !== null ? String(tag.value) : '').trim();
                if (!valText && labelText.includes(':')) {
                  const colonIdx = labelText.indexOf(':');
                  valText = labelText.slice(colonIdx + 1).trim();
                  labelText = labelText.slice(0, colonIdx).trim();
                } else {
                  labelText = labelText.replace(/:+$/, '').trim();
                }

                return (
                  <span
                    key={tag.key}
                    className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-[12px] bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#0E2A33] dark:text-[#E6F2F5] font-mono text-[10px] sm:text-[11px] border border-[#DCE6EA] dark:border-[#223840] shrink-0 whitespace-nowrap"
                  >
                    {labelText && (
                      <span className="text-[#5B727B] dark:text-[#8FA8B1] font-normal">
                        {labelText}{valText ? ':' : ''}
                      </span>
                    )}
                    {valText && <strong className="font-bold text-[#0E2A33] dark:text-[#E6F2F5]">{valText}</strong>}
                    {onRemoveTag && (
                      <button
                        type="button"
                        onClick={() => onRemoveTag(tag.key)}
                        className="ml-0.5 text-[#5B727B] hover:text-[#0E2A33] dark:hover:text-[#E6F2F5] cursor-pointer p-0.5"
                        title="Remove filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {/* Text Input */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={filterTags.length > 0 ? (searchShortPlaceholder || 'Search...') : searchPlaceholder}
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-xs sm:text-[13.5px] text-[#0E2A33] dark:text-[#E6F2F5] placeholder-[#5B727B]/70"
          />

          {/* Smart Search Hint & Keyboard Shortcut */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {searchHint && !searchQuery && filterTags.length === 0 && (
              <span className="hidden sm:inline-block text-xs text-[#5B727B] hover:text-[#0A8FB5] dark:text-[#8FA8B1] dark:hover:text-[#3CC1E6] select-none font-medium transition-colors">
                {searchHint}
              </span>
            )}

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="text-[#5B727B] hover:text-[#0E2A33] dark:text-[#8FA8B1] dark:hover:text-white p-0.5 rounded-full cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Button with Dropdown / Popover */}
        {showFilterButton && (
          <div className="relative shrink-0" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowFilterMenu((v) => !v);
                setShowDateMenu(false);
                setShowSortMenu(false);
              }}
              className={`inline-flex items-center gap-1.5 sm:gap-2 h-9 px-3 sm:px-4 rounded-[12px] border text-xs sm:text-[13.5px] font-medium transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap ${
                effectiveFilterCount > 0 || showFilterMenu
                  ? 'bg-[#E1F4FA] dark:bg-[#12333D] border-[#0A8FB5] dark:border-[#3CC1E6] text-[#07617D] dark:text-[#3CC1E6]'
                  : 'bg-white dark:bg-[#112229] border-[#DCE6EA] dark:border-[#223840] text-[#0E2A33] dark:text-[#E6F2F5] hover:border-[#0A8FB5]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span>Filters</span>
              {effectiveFilterCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0A8FB5] dark:bg-[#3CC1E6] text-white dark:text-[#0E2A33] text-[9px] sm:text-[10px] font-bold flex items-center justify-center shrink-0">
                  {effectiveFilterCount}
                </span>
              )}
            </button>

            {/* Filters Dropdown Popover */}
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-[#112229] border border-[#DCE6EA] dark:border-[#223840] shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE6EA] dark:border-[#223840]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#5B727B] dark:text-[#8FA8B1]" />
                    <span className="text-xs font-bold text-[#0E2A33] dark:text-[#E6F2F5]">Filters</span>
                  </div>
                  {effectiveFilterCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[12px] bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] border border-[#0A8FB5]/20">
                      {effectiveFilterCount} applied
                    </span>
                  )}
                </div>

                {/* ============================================================= */}
                {/* MOBILE-ONLY CONTROLS: Status tabs, Date range, Sort, View      */}
                {/* These are only shown on mobile inside the filter panel         */}
                {/* ============================================================= */}
                <div className="sm:hidden py-3 space-y-4 border-b border-[#DCE6EA] dark:border-[#223840]">
                  {/* Status Tabs on mobile */}
                  {(statusTabs.length > 0 || customTabs) && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B727B] dark:text-[#8FA8B1] mb-2">Status</div>
                      <div className="flex flex-wrap gap-1.5">
                        {statusTabs.map((tab) => {
                          const isSelected = activeStatus === tab.key;
                          return (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() => {
                                onStatusChange && onStatusChange(tab.key);
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                                isSelected
                                  ? 'bg-[#0E2A33] text-white dark:bg-[#0B3946] dark:text-[#E8F6FA]'
                                  : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#5B727B] dark:text-[#8FA8B1] border border-[#DCE6EA] dark:border-[#223840]'
                              }`}
                            >
                              <span>{tab.label}</span>
                              {tab.count !== undefined && (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 ml-0.5 rounded-[10px] ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-[#DCE6EA] dark:bg-[#223840] text-[#5B727B] dark:text-[#8FA8B1]'
                                  }`}
                                >
                                  {tab.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Date Range on mobile */}
                  {dateRangeOptions.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B727B] dark:text-[#8FA8B1] mb-2">
                        {dateRangeLabel || 'Date Range'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dateRangeOptions.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => onDateRangeChange && onDateRangeChange(opt.key)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all cursor-pointer ${
                              activeDateRange === opt.key
                                ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] font-bold border border-[#0A8FB5]/30'
                                : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#0E2A33] dark:text-[#E6F2F5] border border-[#DCE6EA] dark:border-[#223840]'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {activeDateRange === opt.key && <Check className="w-3 h-3 text-[#0A8FB5] dark:text-[#3CC1E6]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sort on mobile */}
                  {sortOptions.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B727B] dark:text-[#8FA8B1] mb-2">Sort By</div>
                      <div className="flex flex-wrap gap-1.5">
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              const nextOrder = activeSort === opt.key && sortOrder === 'desc' ? 'asc' : 'desc';
                              onSortChange && onSortChange(opt.key, nextOrder);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all cursor-pointer ${
                              activeSort === opt.key
                                ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] font-bold border border-[#0A8FB5]/30'
                                : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#0E2A33] dark:text-[#E6F2F5] border border-[#DCE6EA] dark:border-[#223840]'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {activeSort === opt.key && (
                              <span className="text-[9px] uppercase font-bold">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Mode on mobile */}
                  {onViewModeChange && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B727B] dark:text-[#8FA8B1] mb-2">View</div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onViewModeChange('list')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all cursor-pointer border ${
                            viewMode === 'list'
                              ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] border-[#0A8FB5]/30'
                              : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#0E2A33] dark:text-[#E6F2F5] border-[#DCE6EA] dark:border-[#223840]'
                          }`}
                        >
                          <List className="w-3.5 h-3.5" />
                          <span>List</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewModeChange('grid')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-medium transition-all cursor-pointer border ${
                            viewMode === 'grid'
                              ? 'bg-[#E1F4FA] dark:bg-[#12333D] text-[#07617D] dark:text-[#3CC1E6] border-[#0A8FB5]/30'
                              : 'bg-[#F5F8F9] dark:bg-[#0D1B21] text-[#0E2A33] dark:text-[#E6F2F5] border-[#DCE6EA] dark:border-[#223840]'
                          }`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>Grid</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Filter Content supplied by consumer page */}
                {filterContent && (
                  <div className="py-3 max-h-72 overflow-y-auto custom-scrollbar">
                    {filterContent}
                  </div>
                )}

                {/* Empty state when no filter content and not mobile */}
                {!filterContent && effectiveFilterCount === 0 && (
                  <div className="sm:block hidden text-center py-4 text-xs text-[#5B727B] dark:text-[#8FA8B1]">
                    No additional filters configured.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernSearchBarSection;
