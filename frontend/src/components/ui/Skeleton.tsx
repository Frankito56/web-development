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
        <Skeleton className="unilib-book-skeleton__chip-sm" />
        <Skeleton className="unilib-book-skeleton__chip-md" />
      </div>
      <Skeleton className="unilib-book-skeleton__title" />
      <Skeleton className="unilib-book-skeleton__subtitle" />
      <div className="unilib-book-skeleton__footer">
        <Skeleton className="unilib-book-skeleton__footer-stat" />
        <Skeleton className="unilib-book-skeleton__footer-btn" />
      </div>
    </div>
  );
};
