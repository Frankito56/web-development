import React from 'react';
import { ReadingStatus } from '@/types';
import './ReadingTrackerFilterBar.css';

interface ReadingTrackerFilterBarProps {
  activeFilter: ReadingStatus | 'ALL';
  onSelectFilter: (filter: ReadingStatus | 'ALL') => void;
}

const FILTERS: (ReadingStatus | 'ALL')[] = ['ALL', 'READING', 'WANT_TO_READ', 'COMPLETED'];

export const ReadingTrackerFilterBar: React.FC<ReadingTrackerFilterBarProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="unilib-tracker-filter-bar">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          onClick={() => onSelectFilter(filter)}
          className={`unilib-tracker-filter-btn ${activeFilter === filter ? 'unilib-tracker-filter-btn--active' : ''}`}
        >
          {filter === 'ALL'
            ? 'All Books'
            : filter === 'READING'
            ? 'Currently Reading'
            : filter === 'WANT_TO_READ'
            ? 'Want to Read'
            : 'Completed'}
        </button>
      ))}
    </div>
  );
};
