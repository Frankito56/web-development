import React from 'react';
import { Loan } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../loans.css';

export const LoanHistoryList: React.FC<{ loans: Loan[] }> = ({ loans }) => {
  return (
    <div className="unilib-history-table-container">
      <table className="unilib-history-table">
        <thead>
          <tr>
            <th>Academic Work</th>
            <th>Borrow Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>
                <div className="unilib-history-book-cell">
                  {loan.bookCoverUrl ? (
                    <img
                      src={loan.bookCoverUrl}
                      alt={loan.bookTitle}
                      className="unilib-history-cover"
                    />
                  ) : (
                    <div className="unilib-history-cover-placeholder">
                      <BookOpen size={16} color="var(--color-text-subtle)" />
                    </div>
                  )}
                  <div>
                    <Link
                      to={`/books/${loan.bookId}`}
                      className="unilib-history-title"
                    >
                      {loan.bookTitle}
                    </Link>
                    <span className="unilib-history-author">
                      {loan.bookAuthors.join(', ')}
                    </span>
                  </div>
                </div>
              </td>
              <td className="unilib-history-nowrap">{formatDate(loan.borrowDate)}</td>
              <td className="unilib-history-nowrap">{formatDate(loan.returnDate || loan.dueDate)}</td>
              <td className="unilib-history-nowrap">
                <span className="unilib-history-status-pill unilib-history-status-pill--returned">
                  <CheckCircle2 size={14} color="var(--color-success)" />
                  <span>Returned</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
