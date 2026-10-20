import React from 'react';
import { BookOpen, RefreshCw, CheckCircle } from 'lucide-react';
import type { ApiLoan } from '@/services/apiClient';
import { Button } from '@/components/ui/Button';
import { BookCell, PatronCell, IdCell } from './CirculationTableCells';
import { formatDate, daysFromNow, loanStatusLabel } from './circulationHelpers';
import './CirculationTableCells.css';
import './CirculationSection.css';

interface ActiveLoansTableProps {
  loans: ApiLoan[];
  filteredLoans: ApiLoan[];
  searchQuery: string;
  returning: string | null;
  onReturn: (loanId: string) => void;
}

export const ActiveLoansTable: React.FC<ActiveLoansTableProps> = ({
  loans,
  filteredLoans,
  searchQuery,
  returning,
  onReturn,
}) => (
  <>
    <h2 className="circ-section__title">
      <BookOpen size={16} /> Active Loans ({filteredLoans.length}{searchQuery ? ` of ${loans.length}` : ''})
    </h2>
    {loans.length === 0 ? (
      <div className="circ-empty">No active loans at the moment.</div>
    ) : filteredLoans.length === 0 ? (
      <div className="circ-empty">No active loans match "{searchQuery}".</div>
    ) : (
      <div className="circ-table-wrap">
        <table className="circ-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Patron</th>
              <th>ID / Dept</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Days Left</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan) => {
              const daysLeft = daysFromNow(loan.dueDate);
              const statusInfo = loanStatusLabel(loan.status);
              return (
                <tr
                  key={loan.id}
                  className={`circ-table__row ${daysLeft < 0 ? 'circ-table__row--overdue' : daysLeft <= 3 ? 'circ-table__row--warning' : ''}`}
                >
                  <td><BookCell item={loan} /></td>
                  <td><PatronCell item={loan} /></td>
                  <td><IdCell item={loan} /></td>
                  <td><span className={`circ-status ${statusInfo.cls}`}>{statusInfo.label}</span></td>
                  <td>{formatDate(loan.dueDate)}</td>
                  <td>
                    <span className={`circ-days ${daysLeft < 0 ? 'circ-days--late' : daysLeft <= 3 ? 'circ-days--soon' : 'circ-days--ok'}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d late` : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                    </span>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReturn(loan.id)}
                      disabled={returning === loan.id}
                    >
                      {returning === loan.id ? (
                        <><RefreshCw size={12} className="circ-spin" /> Returning…</>
                      ) : (
                        <><CheckCircle size={12} /> Return Book</>
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </>
);
