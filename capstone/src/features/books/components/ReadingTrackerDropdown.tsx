/**
 * UniLib - ReadingTrackerDropdown Component
 */

import React, { useState } from 'react';
import { Book, ReadingStatus } from '@/types';
import { ReadingTrackerService } from '@/services/readingTrackerService';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Bookmark, Check, ChevronDown, BookOpen, CheckCircle2 } from 'lucide-react';

export const ReadingTrackerDropdown: React.FC<{ book: Book }> = ({ book }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const currentItem = ReadingTrackerService.getStatusForBook(user.id, book.id);
  const currentStatus = currentItem?.status;

  const handleSelect = (status: ReadingStatus | 'REMOVE') => {
    if (status === 'REMOVE') {
      ReadingTrackerService.removeItem(user.id, book.id);
      showToast('Reading Tracker', `Removed "${book.title}" from reading list.`, 'INFO');
    } else {
      ReadingTrackerService.updateStatus(user.id, book, status);
      const labels: Record<ReadingStatus, string> = {
        WANT_TO_READ: 'Marked as "Want to Read"',
        READING: 'Marked as "Currently Reading"',
        COMPLETED: 'Marked as "Completed"',
      };
      showToast('Reading Tracker', `${labels[status]}: "${book.title}"`, 'SUCCESS');
    }
    setIsOpen(false);
  };

  const statusLabels: Record<ReadingStatus, { text: string; icon: React.ReactNode; color: string }> = {
    WANT_TO_READ: {
      text: 'Want to Read',
      icon: <Bookmark className="w-3.5 h-3.5" />,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
    },
    READING: {
      text: 'Reading',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    },
    COMPLETED: {
      text: 'Completed',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          currentStatus
            ? `${statusLabels[currentStatus].color} border-current/20`
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        {currentStatus ? statusLabels[currentStatus].icon : <Bookmark className="w-3.5 h-3.5 text-slate-400" />}
        <span>{currentStatus ? statusLabels[currentStatus].text : 'Track Progress'}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 sm:left-0 sm:right-auto mt-1 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1 z-30 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleSelect('WANT_TO_READ')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
              <span>Want to Read</span>
            </div>
            {currentStatus === 'WANT_TO_READ' && <Check className="w-3.5 h-3.5 text-primary-600" />}
          </button>

          <button
            onClick={() => handleSelect('READING')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Currently Reading</span>
            </div>
            {currentStatus === 'READING' && <Check className="w-3.5 h-3.5 text-primary-600" />}
          </button>

          <button
            onClick={() => handleSelect('COMPLETED')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Completed</span>
            </div>
            {currentStatus === 'COMPLETED' && <Check className="w-3.5 h-3.5 text-primary-600" />}
          </button>

          {currentStatus && (
            <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleSelect('REMOVE')}
                className="w-full px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-left"
              >
                Untrack Book
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
