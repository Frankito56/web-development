/**
 * UniLib - BookFilters Component
 * Category pills, sorting options, availability filters, and filter reset
 */

import React from 'react';
import { CATEGORIES } from '@/config';
import { BookFiltersState, SortOption } from '@/types';
import { Filter, ArrowUpDown, RotateCcw } from 'lucide-react';

export interface BookFiltersProps {
  filters: BookFiltersState;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: SortOption) => void;
  onAvailabilityChange: (availability: BookFiltersState['availability']) => void;
  onReset: () => void;
}

export const BookFilters: React.FC<BookFiltersProps> = ({
  filters,
  onCategoryChange,
  onSortChange,
  onAvailabilityChange,
  onReset,
}) => {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'title_asc', label: 'Title (A - Z)' },
    { value: 'title_desc', label: 'Title (Z - A)' },
    { value: 'year_desc', label: 'Newest First' },
    { value: 'year_asc', label: 'Oldest First' },
    { value: 'rating_desc', label: 'Highest Rated' },
  ];

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.sortBy !== 'relevance' ||
    filters.availability !== 'ALL' ||
    filters.searchQuery !== '';

  return (
    <div className="space-y-4">
      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-medium transition-all duration-150 ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Second Row: Availability, Sorting & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        {/* Availability Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => onAvailabilityChange('ALL')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filters.availability === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Works
          </button>
          <button
            onClick={() => onAvailabilityChange('AVAILABLE')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filters.availability === 'AVAILABLE'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Available Now
          </button>
          <button
            onClick={() => onAvailabilityChange('ON_LOAN')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filters.availability === 'ON_LOAN'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            On Loan
          </button>
        </div>

        {/* Sort selector & reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort by:</span>
            <select
              aria-label="Sort books by"
              value={filters.sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline px-2 py-1 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
