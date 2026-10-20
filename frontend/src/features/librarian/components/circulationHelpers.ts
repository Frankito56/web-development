import type { ApiLoan, ApiReservation } from '@/services/apiClient';

export const getBookTitle = (l: ApiLoan | ApiReservation): string =>
  (l as any).book?.title || (l as any).bookTitle || 'Unknown Book';

export const getBookCover = (l: ApiLoan | ApiReservation): string | undefined =>
  (l as any).book?.coverUrl || (l as any).bookCoverUrl;

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const daysFromNow = (dateStr: string): number => {
  const now = Date.now();
  const target = new Date(dateStr).getTime();
  const diff = target - now;
  if (diff < 0) return Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const loanStatusLabel = (status: ApiLoan['status']): { label: string; cls: string } => {
  switch (status) {
    case 'PENDING_PICKUP': return { label: 'Pending Pickup', cls: 'circ-status--pending' };
    case 'ACTIVE':         return { label: 'Checked Out',   cls: 'circ-status--active' };
    case 'DELIVERED':      return { label: 'Delivered',     cls: 'circ-status--delivered' };
    case 'OVERDUE':        return { label: 'Overdue',       cls: 'circ-status--overdue' };
    case 'RETURNED':       return { label: 'Returned',      cls: 'circ-status--returned' };
    default:               return { label: status,          cls: '' };
  }
};
