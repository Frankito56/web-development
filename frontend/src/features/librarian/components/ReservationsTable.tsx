import React from 'react';
import { Clock } from 'lucide-react';
import type { ApiReservation } from '@/services/apiClient';
import { BookCell, PatronCell, IdCell } from './CirculationTableCells';
import { formatDate } from './circulationHelpers';
import './CirculationTableCells.css';
import './CirculationSection.css';

interface ReservationsTableProps {
  reservations: ApiReservation[];
  filteredReservations: ApiReservation[];
  searchQuery: string;
}

export const ReservationsTable: React.FC<ReservationsTableProps> = ({
  reservations,
  filteredReservations,
  searchQuery,
}) => (
  <div className="circ-section">
    <h2 className="circ-section__title">
      <Clock size={16} /> Reservations Queue ({filteredReservations.length}{searchQuery ? ` of ${reservations.length}` : ''})
    </h2>
    {reservations.length === 0 ? (
      <div className="circ-empty">No active reservations in the queue.</div>
    ) : filteredReservations.length === 0 ? (
      <div className="circ-empty">No reservations match "{searchQuery}".</div>
    ) : (
      <div className="circ-table-wrap">
        <table className="circ-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Book</th>
              <th>Patron</th>
              <th>ID / Dept</th>
              <th>Reserved On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((res) => (
              <tr key={res.id} className="circ-table__row">
                <td><span className="circ-queue-pos">#{res.priorityOrder}</span></td>
                <td><BookCell item={res} /></td>
                <td><PatronCell item={res} /></td>
                <td><IdCell item={res} /></td>
                <td>{formatDate(res.reservedAt)}</td>
                <td>
                  <span className={`circ-status ${res.status === 'READY_FOR_PICKUP' ? 'circ-status--active' : 'circ-status--pending'}`}>
                    {res.status === 'READY_FOR_PICKUP' ? 'Ready' : 'Waiting'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
