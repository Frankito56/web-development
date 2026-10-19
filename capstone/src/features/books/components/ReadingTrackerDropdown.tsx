/**
 * UniLib - ReadingTrackerDropdown Component
 */

import React, { useState } from 'react';
import { Book, ReadingStatus } from '@/types';
import { ReadingTrackerService } from '@/services/readingTrackerService';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Bookmark, Check, ChevronDown, BookOpen, CheckCircle2 } from 'lucide-react';
import './ReadingTrackerDropdown.css';

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

  const statusLabels: Record<ReadingStatus, { text: string; icon: React.ReactNode }> = {
    WANT_TO_READ: {
      text: 'Want to Read',
      icon: <Bookmark size={14} color="#6366f1" />,
    },
    READING: {
      text: 'Reading',
      icon: <BookOpen size={14} color="#f59e0b" />,
    },
    COMPLETED: {
      text: 'Completed',
      icon: <CheckCircle2 size={14} color="#10b981" />,
    },
  };

  return (
    <div className="unilib-tracker-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="unilib-tracker-btn"
      >
        {currentStatus ? statusLabels[currentStatus].icon : <Bookmark size={14} color="var(--color-text-subtle)" />}
        <span>{currentStatus ? statusLabels[currentStatus].text : 'Track Progress'}</span>
        <ChevronDown size={12} color="var(--color-text-subtle)" />
      </button>

      {isOpen && (
        <div
          className="unilib-tracker-menu"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleSelect('WANT_TO_READ')}
            className="unilib-tracker-option"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bookmark size={14} color="#6366f1" />
              <span>Want to Read</span>
            </div>
            {currentStatus === 'WANT_TO_READ' && <Check size={14} color="var(--color-primary-600)" />}
          </button>

          <button
            onClick={() => handleSelect('READING')}
            className="unilib-tracker-option"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={14} color="#f59e0b" />
              <span>Currently Reading</span>
            </div>
            {currentStatus === 'READING' && <Check size={14} color="var(--color-primary-600)" />}
          </button>

          <button
            onClick={() => handleSelect('COMPLETED')}
            className="unilib-tracker-option"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Completed</span>
            </div>
            {currentStatus === 'COMPLETED' && <Check size={14} color="var(--color-primary-600)" />}
          </button>

          {currentStatus && (
            <div style={{ paddingTop: '0.25rem', marginTop: '0.25rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              <button
                onClick={() => handleSelect('REMOVE')}
                className="unilib-tracker-option unilib-tracker-option--remove"
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
