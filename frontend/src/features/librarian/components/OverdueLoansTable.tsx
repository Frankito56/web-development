import React from 'react';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import type { ApiLoan } from '@/services/apiClient';
import { Button } from '@/components/ui/Button';
import { BookCell, PatronCell, ContactCell } from './CirculationTableCells';
import { formatDate, daysFromNow } from './circulationHelpers';
import './CirculationTableCells.css';
import './CirculationSection.css';

interface OverdueLoansTableProps {
  loans: ApiLoan[];
  filteredLoans: ApiLoan[];
  searchQuery: string;
  returning: string | null;
  onReturn: (loanId: string) => void;
}

export const OverdueLoansTable: React.FC<OverdueLoansTableProps> = ({
  loans,
  filteredLoans,
  searchQuery,
  returning,
  onReturn,
}) => (
  <div className="circ-section">
    <h2 className="circ-section__title circ-section__title--danger">
      <AlertTriangle size={16} /> Overdue Loans ({filteredLoans.length}{searchQuery ? ` of ${loans.length}` : ''})
    </h2>
    {loans.length === 0 ? (
      <div className="circ-empty circ-empty--success">
        <CheckCircle size={24} />
        No overdue loans — great job!
      </div>
    ) : filteredLoans.length === 0 ? (
      <div className="circ-empty">No overdue loans match "{searchQuery}".</div>
    ) : (
      <div className="circ-table-wrap">
        <table className="circ-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Patron</th>
              <th>Contact</th>
              <th>Due Date</th>
              <th>Days Overdue</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan) => {
              const daysOverdue = Math.abs(daysFromNow(loan.dueDate));
              return (
                <tr key={loan.id} className="circ-table__row circ-table__row--overdue">
                  <td><BookCell item={loan} /></td>
                  <td><PatronCell item={loan} showMeta /></td>
                  <td><ContactCell item={loan} /></td>
                  <td>{formatDate(loan.dueDate)}</td>
                  <td><span className="circ-overdue-badge">{daysOverdue}d overdue</span></td>
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
  </div>
);
