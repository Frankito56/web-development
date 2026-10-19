/**
 * UniLib - ActiveLoansList Component
 * Displays active loans with color-coded due dates, renew options, and return action.
 */

import React, { useState } from 'react';
import { Loan } from '@/types';
import { DueDateBadge } from './DueDateBadge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/dateUtils';
import { LoanService } from '@/services/loanService';
import { useNotification } from '@/context/NotificationContext';
import { BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../loans.css';

export interface ActiveLoansListProps {
  loans: Loan[];
  onRefresh: () => void;
}

export const ActiveLoansList: React.FC<ActiveLoansListProps> = ({ loans, onRefresh }) => {
  const { showToast } = useNotification();
  const [returningId, setReturningId] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const handleReturn = async (loan: Loan) => {
    setReturningId(loan.id);
    const result = await LoanService.returnBook(loan.id);
    setReturningId(null);

    if (result.success) {
      showToast('Book Returned', result.message, 'SUCCESS');
      onRefresh();
    } else {
      showToast('Return Failed', result.message, 'ERROR');
    }
  };

  const handleRenew = async (loan: Loan) => {
    setRenewingId(loan.id);
    const result = await LoanService.renewLoan(loan.id);
    setRenewingId(null);

    if (result.success) {
      showToast('Loan Renewed', result.message, 'SUCCESS');
      onRefresh();
    } else {
      showToast('Renewal Notice', result.message, 'WARNING');
    }
  };

  return (
    <div className="unilib-loans-list">
      {loans.map((loan) => (
        <article key={loan.id} className="unilib-loan-card">
          {/* Book Info */}
          <div className="unilib-loan-card__main">
            {loan.bookCoverUrl ? (
              <img
                src={loan.bookCoverUrl}
                alt={loan.bookTitle}
                className="unilib-loan-card__cover"
              />
            ) : (
              <div className="unilib-loan-card__cover" style={{ backgroundColor: 'var(--color-bg-card-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

              {/* Dates */}
              <div className="unilib-loan-card__dates">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} />
                  <span>Borrowed: {formatDate(loan.borrowDate)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Due:</span>
                  <span>{formatDate(loan.dueDate)}</span>
                </div>
                {loan.renewCount > 0 && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                    Renewed {loan.renewCount}x
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status & Action Buttons */}
          <div className="unilib-loan-card__actions">
            <DueDateBadge dueDate={loan.dueDate} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Button
                variant="outline"
                size="sm"
                isLoading={renewingId === loan.id}
                onClick={() => handleRenew(loan)}
                disabled={loan.renewCount >= 2}
                title={loan.renewCount >= 2 ? 'Max renewal limit reached' : 'Extend due date by 14 days'}
              >
                Renew (+14d)
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={returningId === loan.id}
                onClick={() => handleReturn(loan)}
                leftIcon={<CheckCircle size={16} />}
              >
                Return Book
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
