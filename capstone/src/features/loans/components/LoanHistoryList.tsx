/**
 * UniLib - LoanHistoryList Component
 * Displays past returned loans with dates and return status.
 */

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {loan.bookCoverUrl ? (
                    <img
                      src={loan.bookCoverUrl}
                      alt={loan.bookTitle}
                      style={{ width: '2rem', height: '3rem', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: '2rem', height: '3rem', backgroundColor: 'var(--color-bg-card-subtle)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={16} color="var(--color-text-subtle)" />
                    </div>
                  )}
                  <div>
                    <Link
                      to={`/books/${loan.bookId}`}
                      style={{ fontWeight: 700, color: 'var(--color-text-main)', display: 'block' }}
                    >
                      {loan.bookTitle}
                    </Link>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {loan.bookAuthors.join(', ')}
                    </span>
                  </div>
                </div>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(loan.borrowDate)}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(loan.returnDate || loan.dueDate)}</td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success-text)',
                  border: '1px solid var(--color-success-border)'
                }}>
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
