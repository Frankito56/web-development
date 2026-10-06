/**
 * UniLib - LoanHistoryList Component
 * Displays past returned loans with dates and return status.
 */

import React from 'react';
import { Loan } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoanHistoryList: React.FC<{ loans: Loan[] }> = ({ loans }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
          <tr>
            <th className="py-3.5 px-4">Academic Work</th>
            <th className="py-3.5 px-4">Borrow Date</th>
            <th className="py-3.5 px-4">Return Date</th>
            <th className="py-3.5 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
          {loans.map((loan) => (
            <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  {loan.bookCoverUrl ? (
                    <img
                      src={loan.bookCoverUrl}
                      alt={loan.bookTitle}
                      className="w-8 h-12 object-cover rounded shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <Link
                      to={`/books/${loan.bookId}`}
                      className="font-bold text-slate-900 dark:text-slate-100 hover:text-primary-600 transition-colors line-clamp-1"
                    >
                      {loan.bookTitle}
                    </Link>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {loan.bookAuthors.join(', ')}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">{formatDate(loan.borrowDate)}</td>
              <td className="py-3.5 px-4 whitespace-nowrap">{formatDate(loan.returnDate || loan.dueDate)}</td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
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
