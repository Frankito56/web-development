import React from 'react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/dateUtils';
import './BookDetailActions.css';

interface BookDetailActionsProps {
  alreadyBorrowed: boolean;
  alreadyReserved: boolean;
  isAvailable: boolean;
  loanDays: number;
  dueDate: string | Date;
  onOpenBorrowModal: () => void;
  onOpenReserveModal: () => void;
}

export const BookDetailActions: React.FC<BookDetailActionsProps> = ({
  alreadyBorrowed,
  alreadyReserved,
  isAvailable,
  loanDays,
  dueDate,
  onOpenBorrowModal,
  onOpenReserveModal,
}) => {
  return (
    <div className="unilib-detail-actions-row">
      {alreadyBorrowed ? (
        <>
          <Button variant="outline" size="lg" disabled>
            Already Checked Out ✓
          </Button>
          <p className="unilib-detail-action-note">
            You currently have this book. Manage it in{' '}
            <a href="/my-loans" className="unilib-detail-action-link">My Loans</a>.
          </p>
        </>
      ) : alreadyReserved ? (
        <>
          <Button variant="outline" size="lg" disabled>
            Reservation Pending ✓
          </Button>
          <p className="unilib-detail-action-note">
            You're in the queue for this book. Track it in{' '}
            <a href="/my-loans" className="unilib-detail-action-link">My Loans</a>.
          </p>
        </>
      ) : isAvailable ? (
        <>
          <Button
            variant="primary"
            size="lg"
            onClick={onOpenBorrowModal}
          >
            Borrow Book Now ({loanDays} Days)
          </Button>
          <p className="unilib-detail-action-note">
            {`Free checkout for enrolled patrons. Due on ${formatDate(dueDate)}.`}
          </p>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            size="lg"
            onClick={onOpenReserveModal}
          >
            Reserve Next Available Copy
          </Button>
          <p className="unilib-detail-action-note">
            All copies checked out. Reservation queue notifies you immediately upon return.
          </p>
        </>
      )}
    </div>
  );
};
