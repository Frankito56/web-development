import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ReadingTrackerService } from '@/services/readingTrackerService';
import { StorageService } from '@/services/storageService';
import { ReadingProgressItem, ReadingStatus, Book } from '@/types';
import { EmptyState } from '@/components/feedback/EmptyState';
import { BookOpen } from 'lucide-react';
import { ReadingTrackerStats } from '../components/ReadingTrackerStats';
import { ReadingTrackerFilterBar } from '../components/ReadingTrackerFilterBar';
import { ReadingTrackerList } from '../components/ReadingTrackerList';
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

  const handleUpdatePercentage = useCallback((item: ReadingProgressItem, newPercentage: number) => {
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
  }, [user]);

  const handleRemove = useCallback((bookId: string) => {
    if (!user) return;
    ReadingTrackerService.removeItem(user.id, bookId);
  }, [user]);

  const readingNow = useMemo(() => items.filter((i) => i.status === 'READING'), [items]);
  const wantToRead = useMemo(() => items.filter((i) => i.status === 'WANT_TO_READ'), [items]);
  const completed = useMemo(() => items.filter((i) => i.status === 'COMPLETED'), [items]);

  const displayedItems = useMemo(
    () => (activeFilter === 'ALL' ? items : items.filter((i) => i.status === activeFilter)),
    [items, activeFilter]
  );

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

  return (
    <div className="unilib-tracker-page-container animate-fade-in">
      <div>
        <h1 className="unilib-tracker-title">Academic Reading Tracker</h1>
        <p className="unilib-tracker-subtitle">
          Monitor your study reading lists, update page completion percentages, and log finished literature.
        </p>
      </div>

      <ReadingTrackerStats
        readingCount={readingNow.length}
        wantToReadCount={wantToRead.length}
        completedCount={completed.length}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      <ReadingTrackerFilterBar
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      <ReadingTrackerList
        items={displayedItems}
        onUpdatePercentage={handleUpdatePercentage}
        onRemove={handleRemove}
      />
    </div>
  );
};
