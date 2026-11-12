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
 */
const ModernSearchBarSection = ({
  statusTabs = [],
  activeStatus = 'ALL',
  onStatusChange,
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

  const dateMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const filterMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  return (
    <div className={`space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0 ${className}`}>
      {/* ========================================================================= */}
      {/* ROW 1: STATUS SEGMENTS + DATE RANGE & SORT PICKERS (+ ACTION BUTTON)      */}
      {/* ========================================================================= */}
      {(statusTabs.length > 0 || dateRangeOptions.length > 0 || sortOptions.length > 0 || actionButton) && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
          {/* Left: Segmented Status Pills */}
          {statusTabs.length > 0 && (
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-full overflow-x-auto max-w-full min-w-0 scrollbar-none no-scrollbar border border-slate-200/60 dark:border-slate-700/60">
              {statusTabs.map((tab) => {
                const isSelected = activeStatus === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onStatusChange && onStatusChange(tab.key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300'
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

          {/* Right: Date Range + Sort Controls + Action Button */}
          <div className="flex flex-wrap items-center gap-2 max-w-full">
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
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 shadow-2xs transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{dateRangeLabel || 'Date Range'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showDateMenu ? 'rotate-180' : ''}`} />
                </button>

                {showDateMenu && (
                  <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            activeDateRange === opt.key
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {activeDateRange === opt.key && <Check className="w-3.5 h-3.5 text-sky-500" />}
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
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 shadow-2xs transition-all cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-none">{sortDisplayLabel}</span>
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            activeSort === opt.key
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {activeSort === opt.key && (
                            <span className="text-[10px] uppercase font-bold text-sky-500">
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

            {/* Action Button (e.g. + Apply on Behalf, + Add Holiday) */}
            {actionButton}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROW 2: SEARCH CAPSULE + CHIPS + SHORTCUT + FILTERS BUTTON                 */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-2.5 w-full">
        {/* Search Capsule Input */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all overflow-hidden">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />

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
                    className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[10px] sm:text-[11px] border border-slate-200 dark:border-slate-600 shrink-0 whitespace-nowrap"
                  >
                    {labelText && (
                      <span className="text-slate-400 font-normal">
                        {labelText}{valText ? ':' : ''}
                      </span>
                    )}
                    {valText && <strong className="font-bold text-slate-800 dark:text-slate-100">{valText}</strong>}
                    {onRemoveTag && (
                      <button
                        type="button"
                        onClick={() => onRemoveTag(tag.key)}
                        className="ml-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
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
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:truncate"
          />

          {/* Smart Search Hint & Keyboard Shortcut */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {searchHint && !searchQuery && filterTags.length === 0 && (
              <span className="hidden lg:inline text-[11px] text-slate-400 select-none">
                {searchHint}
              </span>
            )}

            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 border border-slate-200/80 dark:border-slate-600 text-[10px] font-mono text-slate-400 dark:text-slate-300 font-bold select-none">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Filters Button with Dropdown / Popover */}
        <div className="relative shrink-0" ref={filterMenuRef}>
          <button
            type="button"
            onClick={() => {
              setShowFilterMenu((v) => !v);
              setShowDateMenu(false);
              setShowSortMenu(false);
            }}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap ${
              filterCount > 0
                ? 'bg-white dark:bg-slate-800 border-sky-400 dark:border-sky-500 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/15'
                : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="hidden xs:inline">Filters</span>
            {filterCount > 0 && (
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sky-500 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shrink-0">
                {filterCount}
              </span>
            )}
          </button>

          {/* Filters Dropdown Popover */}
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Active Filters</span>
                </div>
                {filterCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                    {filterCount} applied
                  </span>
                )}
              </div>

              {/* Dynamic Filter Content supplied by consumer page */}
              <div className="py-3 max-h-72 overflow-y-auto custom-scrollbar">
                {filterContent || (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No additional filters configured.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernSearchBarSection;

