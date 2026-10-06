/**
 * UniLib - ReadingTrackerPage Component
 * Reading progress tracker supporting Want to Read, Currently Reading, and Completed works.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ReadingTrackerService } from '@/services/readingTrackerService';
import { StorageService } from '@/services/storageService';
import { ReadingProgressItem, ReadingStatus } from '@/types';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { BookOpen, Bookmark, CheckCircle2, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    const newStatus: ReadingStatus = finalPercentage >= 100 ? 'COMPLETED' : item.status === 'WANT_TO_READ' ? 'READING' : item.status;
    
    ReadingTrackerService.updateStatus(
      user.id,
      { id: item.bookId, title: item.bookTitle, authors: item.bookAuthors, coverUrl: item.bookCoverUrl } as any,
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
      <div className="py-12 text-center">
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-slate-400" />}
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Academic Reading Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor your study reading lists, update page completion percentages, and log finished literature.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveFilter('READING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'READING'
              ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-semibold">Currently Reading</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {readingNow.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('WANT_TO_READ')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'WANT_TO_READ'
              ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-xs font-semibold">Want to Read</span>
            <Bookmark className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {wantToRead.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'COMPLETED'
              ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-semibold">Completed Works</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {completed.length}
          </span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'READING', 'WANT_TO_READ', 'COMPLETED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === filter
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
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
      </div>

      {/* Items List */}
      {displayedItems.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-slate-400" />}
          title="No books in this reading list"
          description="Browse the catalog to add textbooks, literature or research papers to your tracker."
          actionText="Find Books in Catalog"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedItems.map((item) => (
            <article
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {item.bookCoverUrl ? (
                  <img
                    src={item.bookCoverUrl}
                    alt={item.bookTitle}
                    className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-slate-400" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.status === 'READING'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => handleRemove(item.bookId)}
                      aria-label="Remove from tracker"
                      className="text-slate-400 hover:text-rose-500 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link
                    to={`/books/${item.bookId}`}
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-primary-600 transition-colors line-clamp-1"
                  >
                    {item.bookTitle}
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.bookAuthors.join(', ')}
                  </p>

                  {item.notes && (
                    <p className="text-xs italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg mt-2">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.progressPercentage}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={item.progressPercentage}
                  onChange={(e) => handleUpdatePercentage(item, Number(e.target.value))}
                  className="w-full accent-primary-600 cursor-pointer"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
