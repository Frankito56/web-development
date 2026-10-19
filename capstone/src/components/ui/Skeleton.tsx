/**
 * UniLib - Skeleton Loading Placeholders
 */

import React from 'react';
import './Skeleton.css';

export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => {
  return (
    <div
      className={`unilib-skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="unilib-book-skeleton">
      <Skeleton className="unilib-book-skeleton__cover" />
      <div className="unilib-book-skeleton__chips">
        <Skeleton style={{ width: '4.5rem', height: '1.25rem', borderRadius: '9999px' }} />
        <Skeleton style={{ width: '5rem', height: '1.25rem', borderRadius: '9999px' }} />
      </div>
      <Skeleton style={{ width: '80%', height: '1.25rem', marginTop: '0.25rem' }} />
      <Skeleton style={{ width: '55%', height: '0.9rem' }} />
      <div className="unilib-book-skeleton__footer">
        <Skeleton style={{ width: '5rem', height: '1rem' }} />
        <Skeleton style={{ width: '4.5rem', height: '2rem', borderRadius: '8px' }} />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="unilib-table-skeleton">
      <Skeleton style={{ width: '100%', height: '2.5rem', borderRadius: '8px' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} style={{ width: '100%', height: '4rem', borderRadius: '8px' }} />
      ))}
    </div>
  );
};
