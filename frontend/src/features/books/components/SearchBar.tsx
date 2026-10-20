import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

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
    <div className="unilib-searchbar-wrapper">
      <div className="unilib-searchbar-container">
        <span className="unilib-searchbar__icon">
          <Search size={16} />
        </span>
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label="Search catalog"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="unilib-searchbar__input"
        />

        <div className="unilib-searchbar__actions">
          {value && (
            <button
              onClick={() => onChange('')}
              aria-label="Clear search"
              className="unilib-searchbar__clear-btn"
            >
              <X size={14} />
            </button>
          )}
          <span className="unilib-searchbar__shortcut">/</span>
        </div>
      </div>

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
