import React from 'react';
import { Package, RefreshCw, CheckCircle } from 'lucide-react';
import type { ApiLoan } from '@/services/apiClient';
import { Button } from '@/components/ui/Button';
import { BookCell, PatronCell, IdCell } from './CirculationTableCells';
import { formatDate } from './circulationHelpers';
import './CirculationTableCells.css';
import './CirculationSection.css';

interface PendingLoansTableProps {
  loans: ApiLoan[];
  filteredLoans: ApiLoan[];
  searchQuery: string;
  delivering: string | null;
  onDeliver: (loanId: string) => void;
}

export const PendingLoansTable: React.FC<PendingLoansTableProps> = ({
  loans,
  filteredLoans,
  searchQuery,
  delivering,
  onDeliver,
}) => {
  if (loans.length === 0) return null;

  return (
    <>
      <h2 className="circ-section__title circ-section__title--pending">
        <Package size={16} /> Pending Pickup ({filteredLoans.length}{searchQuery ? ` of ${loans.length}` : ''})
      </h2>
      {filteredLoans.length === 0 ? (
        <div className="circ-empty" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          No pending pickups match "{searchQuery}".
        </div>
      ) : (
        <div className="circ-table-wrap">
          <table className="circ-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Patron</th>
                <th>ID / Dept</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="circ-table__row circ-table__row--pending">
                  <td><BookCell item={loan} /></td>
                  <td><PatronCell item={loan} /></td>
                  <td><IdCell item={loan} /></td>
                  <td>{formatDate(loan.dueDate)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onDeliver(loan.id)}
                      disabled={delivering === loan.id}
                    >
                      {delivering === loan.id ? (
                        <><RefreshCw size={12} className="circ-spin" /> Delivering…</>
                      ) : (
                        <><CheckCircle size={12} /> Deliver Book</>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
