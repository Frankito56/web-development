import React from 'react';
import { Search, X } from 'lucide-react';
import './CirculationSearchBar.css';

interface CirculationSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  resultSummary?: string;
}

export const CirculationSearchBar: React.FC<CirculationSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onClear,
  resultSummary,
}) => (
  <div className="circ-search-bar">
    <div className="circ-search-input-wrap">
      <Search size={18} className="circ-search-icon" />
      <input
        type="text"
        className="circ-search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by patron name, campus ID code (e.g. EST-9901, PROF-2024), or book title..."
      />
      {searchQuery && (
        <button
          type="button"
          className="circ-search-clear"
          onClick={onClear}
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
    {searchQuery.trim() && (
      <div className="circ-search-feedback">
        <span>Filtering by: <strong>"{searchQuery}"</strong></span>
        {resultSummary && (
          <span className="circ-search-count">{resultSummary}</span>
        )}
        <button type="button" className="circ-search-clear-btn" onClick={onClear}>
          Reset Filter
        </button>
      </div>
    )}
  </div>
);
