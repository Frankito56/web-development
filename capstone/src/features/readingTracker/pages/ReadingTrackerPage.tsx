

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ReadingTrackerService } from '@/services/readingTrackerService';
import { StorageService } from '@/services/storageService';
import { ReadingProgressItem, ReadingStatus, Book } from '@/types';
import { EmptyState } from '@/components/feedback/EmptyState';
import { BookOpen, Bookmark, CheckCircle2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ReadingTrackerPage.css';

export const ReadingTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ReadingProgressItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<ReadingStatus | 'ALL'>('ALL');

  const loadData = useCallback(() => {
    if (!user) return;
    setItems(ReadingTrackerService.getUserItems(user.id));
  }, [user]);

  useEffect(() => {
    loadData();
    const unsubscribe = StorageService.subscribe(loadData);
    return () => unsubscribe();
  }, [loadData]);

  const handleUpdatePercentage = (item: ReadingProgressItem, newPercentage: number) => {
    if (!user) return;
    const finalPercentage = Math.min(100, Math.max(0, newPercentage));
    const newStatus: ReadingStatus =
      finalPercentage >= 100 ? 'COMPLETED' : item.status === 'WANT_TO_READ' ? 'READING' : item.status;

    const pseudoBook: Book = {
      id: item.bookId,
      title: item.bookTitle,
      authors: item.bookAuthors,
      coverUrl: item.bookCoverUrl,
      subjects: [],
      availabilityStatus: 'AVAILABLE',
      totalCopies: 1,
      availableCopies: 1,
    };

    ReadingTrackerService.updateStatus(
      user.id,
      pseudoBook,
      newStatus,
      finalPercentage,
      item.notes,
      item.rating
    );
  };

  const handleRemove = (bookId: string) => {
    if (!user) return;
    ReadingTrackerService.removeItem(user.id, bookId);
  };

  if (!user) {
    return (
      <div className="unilib-tracker-empty-wrap">
        <EmptyState
          icon={<BookOpen size={32} />}
          title="Sign in to track reading goals"
          description="Keep track of articles, monographs, and textbooks you are currently studying."
          actionText="Sign In"
          onAction={() => (window.location.href = '/login')}
        />
      </div>
    );
  }

  const readingNow = items.filter((i) => i.status === 'READING');
  const wantToRead = items.filter((i) => i.status === 'WANT_TO_READ');
  const completed = items.filter((i) => i.status === 'COMPLETED');

  const displayedItems =
    activeFilter === 'ALL'
      ? items
      : items.filter((i) => i.status === activeFilter);

  return (
    <div className="unilib-tracker-page-container animate-fade-in">
      {}
      <div>
        <h1 className="unilib-tracker-title">Academic Reading Tracker</h1>
        <p className="unilib-tracker-subtitle">
          Monitor your study reading lists, update page completion percentages, and log finished literature.
        </p>
      </div>

      {}
      <div className="unilib-tracker-stats-grid">
        <button
          onClick={() => setActiveFilter('READING')}
          className={`unilib-tracker-stat-btn ${activeFilter === 'READING' ? 'unilib-tracker-stat-btn--active' : ''}`}
        >
          <div className="unilib-tracker-stat-header unilib-tracker-stat-header--reading">
            <span className="unilib-tracker-stat-label">Currently Reading</span>
            <BookOpen size={16} />
          </div>
          <span className="unilib-tracker-stat-value">
            {readingNow.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('WANT_TO_READ')}
          className={`unilib-tracker-stat-btn ${activeFilter === 'WANT_TO_READ' ? 'unilib-tracker-stat-btn--active' : ''}`}
        >
          <div className="unilib-tracker-stat-header unilib-tracker-stat-header--want">
            <span className="unilib-tracker-stat-label">Want to Read</span>
            <Bookmark size={16} />
          </div>
          <span className="unilib-tracker-stat-value">
            {wantToRead.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`unilib-tracker-stat-btn ${activeFilter === 'COMPLETED' ? 'unilib-tracker-stat-btn--active' : ''}`}
        >
          <div className="unilib-tracker-stat-header unilib-tracker-stat-header--completed">
            <span className="unilib-tracker-stat-label">Completed Works</span>
            <CheckCircle2 size={16} />
          </div>
          <span className="unilib-tracker-stat-value">
            {completed.length}
          </span>
        </button>
      </div>

      {}
      <div className="unilib-tracker-filter-bar">
        {(['ALL', 'READING', 'WANT_TO_READ', 'COMPLETED'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
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

      {}
      {displayedItems.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="No books in this reading list"
          description="Browse the catalog to add textbooks, literature or research papers to your tracker."
          actionText="Find Books in Catalog"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="unilib-tracker-items-grid">
          {displayedItems.map((item) => (
            <article key={item.id} className="unilib-tracker-card">
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
                      onClick={() => handleRemove(item.bookId)}
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

              {}
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
                  onChange={(e) => handleUpdatePercentage(item, Number(e.target.value))}
                  className="unilib-tracker-card__slider"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
