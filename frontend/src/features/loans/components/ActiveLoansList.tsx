import React from 'react';
import { Loan } from '@/types';
import { DueDateBadge } from './DueDateBadge';
import { formatDate } from '@/utils/dateUtils';
import { BookOpen, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../loans.css';

export interface ActiveLoansListProps {
  loans: Loan[];
  onRefresh?: () => void;
}

export const ActiveLoansList: React.FC<ActiveLoansListProps> = ({ loans }) => {
  return (
    <div className="unilib-loans-list">
      {loans.map((loan) => {
        const isPendingPickup = loan.status === 'PENDING_PICKUP';
        const isOverdue = loan.status === 'OVERDUE';

        return (
          <article key={loan.id} className="unilib-loan-card">
            <div className="unilib-loan-card__main">
              {loan.bookCoverUrl ? (
                <img
                  src={loan.bookCoverUrl}
                  alt={loan.bookTitle}
                  className="unilib-loan-card__cover"
                />
              ) : (
                <div className="unilib-loan-card__cover unilib-loan-card__cover-placeholder">
                  <BookOpen size={24} color="var(--color-text-subtle)" />
                </div>
              )}

              <div className="unilib-loan-card__info">
                <Link
                  to={`/books/${loan.bookId}`}
                  className="unilib-loan-card__title"
                >
                  {loan.bookTitle}
                </Link>
                <p className="unilib-loan-card__author">
                  {loan.bookAuthors.join(', ')}
                </p>

                <div className="unilib-loan-card__dates">
                  <div className="unilib-loan-card__date-item">
                    <Calendar size={12} />
                    <span>
                      {isPendingPickup ? 'Requested:' : 'Borrowed:'} {formatDate(loan.borrowDate)}
                    </span>
                  </div>

                  {!isPendingPickup && (
                    <div className="unilib-loan-card__date-item">
                      <span className="unilib-loan-card__date-label">Due:</span>
                      <span>{formatDate(loan.dueDate)}</span>
                    </div>
                  )}

                  {loan.renewCount > 0 && (
                    <span className="unilib-loan-card__renewed-pill">
                      Renewed {loan.renewCount}x
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="unilib-loan-card__actions">
              <div className="unilib-loan-card__actions-col">
                {isPendingPickup ? (
                  <>
                    <span className="unilib-history-status-pill unilib-history-status-pill--pending">
                      ⏳ Pending Pickup
                    </span>
                    <div className="unilib-loan-card__desk-note">
                      <MapPin size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                      Ready for pickup at the Circulation Desk
                    </div>
                  </>
                ) : isOverdue ? (
                  <>
                    <span className="unilib-history-status-pill unilib-history-status-pill--overdue">
                      ⚠ Overdue
                    </span>
                    <DueDateBadge dueDate={loan.dueDate} />
                    <div className="unilib-loan-card__desk-note" style={{ color: 'var(--color-danger)' }}>
                      <AlertCircle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                      Please return to Circulation Desk immediately
                    </div>
                  </>
                ) : (
                  <>
                    <span className="unilib-history-status-pill unilib-history-status-pill--active">
                      ● Checked Out
                    </span>
                    <DueDateBadge dueDate={loan.dueDate} />
                    <div className="unilib-loan-card__desk-note">
                      Return in person at the Circulation Desk
                    </div>
                  </>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
