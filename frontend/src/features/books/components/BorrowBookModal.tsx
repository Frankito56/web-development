import React from 'react';
import { BookOpen } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Book, User } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import './BorrowBookModal.css';

interface BorrowBookModalProps {
  isOpen: boolean;
  book: Book | null;
  user: User | null;
  loanDays: number;
  dueDate: string | Date;
  actionLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const BorrowBookModal: React.FC<BorrowBookModalProps> = ({
  isOpen,
  book,
  user,
  loanDays,
  dueDate,
  actionLoading,
  onClose,
  onConfirm,
}) => {
  if (!book) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Book Borrowing"
      description="Review your borrowing details before confirming."
    >
      <div className="unilib-modal-form">
        <div className="unilib-modal-book-preview">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="unilib-modal-book-cover"
            />
          ) : (
            <div className="unilib-modal-book-fallback">
              <BookOpen size={24} color="var(--color-text-subtle)" />
            </div>
          )}
          <div className="unilib-modal-book-info">
            <h4 className="unilib-modal-book-title">{book.title}</h4>
            <p className="unilib-modal-book-authors">{book.authors.join(', ')}</p>
            <div className="unilib-modal-book-copies">
              Physical copies available: {book.availableCopies}
            </div>
          </div>
        </div>

        <div className="unilib-modal-details-list">
          <div className="unilib-modal-details-row">
            <span className="unilib-modal-details-label">Borrower:</span>
            <strong>{user?.name} ({user?.role})</strong>
          </div>
          <div className="unilib-modal-details-row">
            <span className="unilib-modal-details-label">Loan Duration:</span>
            <strong>{loanDays} Calendar Days</strong>
          </div>
          <div className="unilib-modal-details-row">
            <span className="unilib-modal-details-label">Due Date:</span>
            <strong className="unilib-modal-due-date">{formatDate(dueDate)}</strong>
          </div>
        </div>

        <div className="unilib-modal-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={actionLoading}
            onClick={onConfirm}
          >
            Confirm Borrow
          </Button>
        </div>
      </div>
    </Modal>
  );
};
