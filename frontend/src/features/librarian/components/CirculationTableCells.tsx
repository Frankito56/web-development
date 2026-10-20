import React from 'react';
import { BookOpen, User, Mail, Badge as BadgeIcon } from 'lucide-react';
import type { ApiLoan, ApiReservation } from '@/services/apiClient';
import { getBookTitle, getBookCover } from './circulationHelpers';
import './CirculationTableCells.css';

interface BookCellProps {
  item: ApiLoan | ApiReservation;
}

export const BookCell: React.FC<BookCellProps> = ({ item }) => {
  const cover = getBookCover(item);
  return (
    <div className="circ-book-cell">
      {cover ? (
        <img src={cover} alt="" className="circ-book-thumb" />
      ) : (
        <div className="circ-book-thumb circ-book-thumb--fallback">
          <BookOpen size={16} />
        </div>
      )}
      <span className="circ-book-title">{getBookTitle(item)}</span>
    </div>
  );
};

interface PatronCellProps {
  item: ApiLoan | ApiReservation;
  showMeta?: boolean;
}

export const PatronCell: React.FC<PatronCellProps> = ({ item, showMeta = false }) => (
  <div className="circ-patron-cell">
    <User size={14} />
    <div>
      <div className="circ-patron-name">{item.user?.name || item.userId}</div>
      {showMeta ? (
        <div className="circ-patron-meta">
          <BadgeIcon size={11} /> {item.user?.studentOrEmployeeId || '—'} · {item.user?.department || '—'}
        </div>
      ) : (
        <div className="circ-patron-email">
          <Mail size={11} /> {item.user?.email || '—'}
        </div>
      )}
    </div>
  </div>
);

interface IdCellProps {
  item: ApiLoan | ApiReservation;
}

export const IdCell: React.FC<IdCellProps> = ({ item }) => (
  <div className="circ-id-cell">
    <span className="circ-id-badge">{item.user?.studentOrEmployeeId || '—'}</span>
    <span className="circ-dept">{item.user?.department || ''}</span>
  </div>
);

interface ContactCellProps {
  item: ApiLoan | ApiReservation;
}

export const ContactCell: React.FC<ContactCellProps> = ({ item }) => (
  <div className="circ-patron-email">
    <Mail size={11} /> {item.user?.email || '—'}
  </div>
);
