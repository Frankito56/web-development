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
import { BookOpen, RotateCcw, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ActiveLoansListProps {
  loans: Loan[];
  onRefresh: () => void;
}

export const ActiveLoansList: React.FC<ActiveLoansListProps> = ({ loans, onRefresh }) => {
  const { showToast } = useNotification();
  const [returningId, setReturningId] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const handleReturn = (loan: Loan) => {
    setReturningId(loan.id);
    const result = LoanService.returnBook(loan.id);
    setReturningId(null);

    if (result.success) {
      showToast('Book Returned', result.message, 'SUCCESS');
      onRefresh();
    } else {
      showToast('Return Failed', result.message, 'ERROR');
    }
  };

  const handleRenew = (loan: Loan) => {
    setRenewingId(loan.id);
    const result = LoanService.renewLoan(loan.id);
    setRenewingId(null);

    if (result.success) {
      showToast('Loan Renewed', result.message, 'SUCCESS');
      onRefresh();
    } else {
      showToast('Renewal Notice', result.message, 'WARNING');
    }
  };

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <article
          key={loan.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-4"
        >
          {/* Book Info */}
          <div className="flex items-start gap-4 min-w-0">
            {loan.bookCoverUrl ? (
              <img
                src={loan.bookCoverUrl}
                alt={loan.bookTitle}
                className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-14 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-slate-400" />
              </div>
            )}

            <div className="min-w-0 space-y-1">
              <Link
                to={`/books/${loan.bookId}`}
                className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-primary-600 transition-colors line-clamp-1"
              >
                {loan.bookTitle}
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {loan.bookAuthors.join(', ')}
              </p>

              {/* Dates */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Borrowed: {formatDate(loan.borrowDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Due:</span>
                  <span>{formatDate(loan.dueDate)}</span>
                </div>
                {loan.renewCount > 0 && (
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950">
                    Renewed {loan.renewCount}x
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status & Action Buttons */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <DueDateBadge dueDate={loan.dueDate} />

            <div className="flex items-center gap-2">
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
                leftIcon={<CheckCircle className="w-4 h-4" />}
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
