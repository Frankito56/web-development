import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trash2 } from 'lucide-react';
import { ReadingProgressItem } from '@/types';
import './ReadingTrackerCard.css';

interface ReadingTrackerCardProps {
  item: ReadingProgressItem;
  onUpdatePercentage: (item: ReadingProgressItem, percentage: number) => void;
  onRemove: (bookId: string) => void;
}

export const ReadingTrackerCard: React.FC<ReadingTrackerCardProps> = ({
  item,
  onUpdatePercentage,
  onRemove,
}) => {
  return (
    <article className="unilib-tracker-card">
      <div className="unilib-tracker-card__header">
        {item.bookCoverUrl ? (
          <img
            src={item.bookCoverUrl}
            alt={item.bookTitle}
            className="unilib-tracker-card__cover"
          />
        ) : (
          <div className="unilib-tracker-card__cover unilib-tracker-card__cover-placeholder">
            <BookOpen size={24} color="var(--color-text-subtle)" />
          </div>
        )}

        <div className="unilib-tracker-card__content">
          <div className="unilib-tracker-card__top-row">
            <span
              className={`unilib-tracker-badge ${
                item.status === 'COMPLETED'
                  ? 'unilib-tracker-badge--completed'
                  : item.status === 'READING'
                  ? 'unilib-tracker-badge--reading'
                  : 'unilib-tracker-badge--want'
              }`}
            >
              {item.status.replace(/_/g, ' ')}
            </span>
            <button
              onClick={() => onRemove(item.bookId)}
              aria-label="Remove from tracker"
              className="unilib-tracker-card__trash-btn"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <Link
            to={`/books/${item.bookId}`}
            className="unilib-tracker-card__title"
          >
            {item.bookTitle}
          </Link>

          <p className="unilib-tracker-card__author">
            {item.bookAuthors.join(', ')}
          </p>

          {item.notes && (
            <p className="unilib-tracker-card__notes">
              "{item.notes}"
            </p>
          )}
        </div>
      </div>

      <div className="unilib-tracker-card__slider-wrap">
        <div className="unilib-tracker-card__progress-info">
          <span className="unilib-tracker-card__progress-label">Progress</span>
          <strong className="unilib-tracker-card__progress-value">{item.progressPercentage}%</strong>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={item.progressPercentage}
          onChange={(e) => onUpdatePercentage(item, Number(e.target.value))}
          className="unilib-tracker-card__slider"
        />
      </div>
    </article>
  );
};
