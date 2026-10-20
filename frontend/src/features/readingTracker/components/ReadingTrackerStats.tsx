import React from 'react';
import { BookOpen, Bookmark, CheckCircle2 } from 'lucide-react';
import { ReadingStatus } from '@/types';
import './ReadingTrackerStats.css';

interface ReadingTrackerStatsProps {
  readingCount: number;
  wantToReadCount: number;
  completedCount: number;
  activeFilter: ReadingStatus | 'ALL';
  onSelectFilter: (filter: ReadingStatus) => void;
}

export const ReadingTrackerStats: React.FC<ReadingTrackerStatsProps> = ({
  readingCount,
  wantToReadCount,
  completedCount,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="unilib-tracker-stats-grid">
      <button
        onClick={() => onSelectFilter('READING')}
        className={`unilib-tracker-stat-btn ${activeFilter === 'READING' ? 'unilib-tracker-stat-btn--active' : ''}`}
      >
        <div className="unilib-tracker-stat-header unilib-tracker-stat-header--reading">
          <span className="unilib-tracker-stat-label">Currently Reading</span>
          <BookOpen size={16} />
        </div>
        <span className="unilib-tracker-stat-value">{readingCount}</span>
      </button>

      <button
        onClick={() => onSelectFilter('WANT_TO_READ')}
        className={`unilib-tracker-stat-btn ${activeFilter === 'WANT_TO_READ' ? 'unilib-tracker-stat-btn--active' : ''}`}
      >
        <div className="unilib-tracker-stat-header unilib-tracker-stat-header--want">
          <span className="unilib-tracker-stat-label">Want to Read</span>
          <Bookmark size={16} />
        </div>
        <span className="unilib-tracker-stat-value">{wantToReadCount}</span>
      </button>

      <button
        onClick={() => onSelectFilter('COMPLETED')}
        className={`unilib-tracker-stat-btn ${activeFilter === 'COMPLETED' ? 'unilib-tracker-stat-btn--active' : ''}`}
      >
        <div className="unilib-tracker-stat-header unilib-tracker-stat-header--completed">
          <span className="unilib-tracker-stat-label">Completed Works</span>
          <CheckCircle2 size={16} />
        </div>
        <span className="unilib-tracker-stat-value">{completedCount}</span>
      </button>
    </div>
  );
};
