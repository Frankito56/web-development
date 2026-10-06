/**
 * UniLib - SearchBar Component
 * Search input with live debouncing and accessibility attributes
 */

import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalResults?: number;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by title, author, subject, or ISBN...',
  totalResults,
  isLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: pressing '/' focuses the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full space-y-1.5">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label="Search catalog"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {value && (
            <button
              onClick={() => onChange('')}
              aria-label="Clear search"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40">
            /
          </span>
        </div>
      </div>

      {/* Screen reader live updates */}
      <div aria-live="polite" className="sr-only">
        {isLoading
          ? 'Searching library catalog...'
          : totalResults !== undefined
          ? `Found ${totalResults} books`
          : ''}
      </div>
    </div>
  );
};
