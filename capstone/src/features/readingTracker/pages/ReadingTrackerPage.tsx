/**
 * UniLib - ReadingTrackerPage Component
 * Reading progress tracker supporting Want to Read, Currently Reading, and Completed works.
 */

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
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
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
      {/* Header */}
      <div>
        <h1 className="unilib-tracker-title">Academic Reading Tracker</h1>
        <p className="unilib-tracker-subtitle">
          Monitor your study reading lists, update page completion percentages, and log finished literature.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="unilib-tracker-stats-grid">
        <button
          onClick={() => setActiveFilter('READING')}
          className={`unilib-tracker-stat-btn ${activeFilter === 'READING' ? 'unilib-tracker-stat-btn--active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Currently Reading</span>
            <BookOpen size={16} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace' }}>
            {readingNow.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('WANT_TO_READ')}
          className={`unilib-tracker-stat-btn ${activeFilter === 'WANT_TO_READ' ? 'unilib-tracker-stat-btn--active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#6366f1', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Want to Read</span>
            <Bookmark size={16} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace' }}>
            {wantToRead.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`unilib-tracker-stat-btn ${activeFilter === 'COMPLETED' ? 'unilib-tracker-stat-btn--active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10b981', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Completed Works</span>
            <CheckCircle2 size={16} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace' }}>
            {completed.length}
          </span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        {(['ALL', 'READING', 'WANT_TO_READ', 'COMPLETED'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: activeFilter === filter ? 'var(--color-primary-600)' : 'var(--color-bg-card-subtle)',
              color: activeFilter === filter ? '#ffffff' : 'var(--color-text-main)',
              transition: 'all 0.15s ease',
            }}
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

      {/* Items List */}
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
                  <div className="unilib-tracker-card__cover" style={{ backgroundColor: 'var(--color-bg-card-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={24} color="var(--color-text-subtle)" />
                  </div>
                )}

                <div className="unilib-tracker-card__content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor:
                          item.status === 'COMPLETED'
                            ? 'var(--color-success-bg)'
                            : item.status === 'READING'
                            ? 'var(--color-warning-bg)'
                            : 'rgba(99, 102, 241, 0.12)',
                        color:
                          item.status === 'COMPLETED'
                            ? 'var(--color-success-text)'
                            : item.status === 'READING'
                            ? 'var(--color-warning-text)'
                            : '#6366f1',
                      }}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => handleRemove(item.bookId)}
                      aria-label="Remove from tracker"
                      style={{ color: 'var(--color-text-subtle)', padding: '0.2rem', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <Link
                    to={`/books/${item.bookId}`}
                    style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)', marginTop: '0.25rem', display: 'block' }}
                  >
                    {item.bookTitle}
                  </Link>

                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {item.bookAuthors.join(', ')}
                  </p>

                  {item.notes && (
                    <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-card-subtle)', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}>
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="unilib-tracker-card__slider-wrap">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Progress</span>
                  <strong style={{ color: 'var(--color-text-main)' }}>{item.progressPercentage}%</strong>
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
