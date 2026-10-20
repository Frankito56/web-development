

import React from 'react';
import { CATEGORIES } from '@/config';
import { BookFiltersState, SortOption } from '@/types';
import { ArrowUpDown, RotateCcw } from 'lucide-react';
import './BookFilters.css';

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
    <div className="unilib-filters-wrap">
      {}
      <div className="unilib-category-slider">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`unilib-cat-pill ${isSelected ? 'unilib-cat-pill--active' : ''}`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {}
      <div className="unilib-filters-secondary">
        {}
        <div className="unilib-avail-toggle-group">
          <button
            onClick={() => onAvailabilityChange('ALL')}
            className={`unilib-avail-btn ${filters.availability === 'ALL' ? 'unilib-avail-btn--active' : ''}`}
          >
            All Works
          </button>
          <button
            onClick={() => onAvailabilityChange('AVAILABLE')}
            className={`unilib-avail-btn ${filters.availability === 'AVAILABLE' ? 'unilib-avail-btn--active unilib-avail-btn--available-active' : ''}`}
          >
            Available Now
          </button>
          <button
            onClick={() => onAvailabilityChange('ON_LOAN')}
            className={`unilib-avail-btn ${filters.availability === 'ON_LOAN' ? 'unilib-avail-btn--active unilib-avail-btn--onloan-active' : ''}`}
          >
            On Loan
          </button>
        </div>

        {}
        <div className="unilib-filters-actions">
          <div className="unilib-sort-group">
            <ArrowUpDown size={14} />
            <span>Sort:</span>
            <select
              aria-label="Sort books by"
              value={filters.sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="unilib-sort-select"
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
              className="unilib-reset-filters-btn"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
