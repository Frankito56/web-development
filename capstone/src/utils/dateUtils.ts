import { APP_CONFIG } from '@/config';

export function calculateDueDate(startDate: Date | string = new Date(), days: number = APP_CONFIG.MAX_LOAN_DAYS): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function getDaysRemaining(dueDate: string | Date): number {
  const target = new Date(dueDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff < 0) {
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: string | Date): boolean {
  return getDaysRemaining(dueDate) < 0;
}

export type DueBadgeVariant = 'success' | 'warning' | 'danger';

export interface DueStatus {
  status: 'safe' | 'warning' | 'overdue';
  daysRemaining: number;
  label: string;
  badgeVariant: DueBadgeVariant;
}

export function getDueStatus(dueDate: string | Date): DueStatus {
  const days = getDaysRemaining(dueDate);

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      status: 'overdue',
      daysRemaining: days,
      label: overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`,
      badgeVariant: 'danger',
    };
  }

  if (days <= 3) {
    if (days === 0) {
      return {
        status: 'warning',
        daysRemaining: 0,
        label: 'Due today!',
        badgeVariant: 'warning',
      };
    }
    return {
      status: 'warning',
      daysRemaining: days,
      label: days === 1 ? 'Due tomorrow' : `Due in ${days} days`,
      badgeVariant: 'warning',
    };
  }

  return {
    status: 'safe',
    daysRemaining: days,
    label: `${days} days left`,
    badgeVariant: 'success',
  };
}

export function formatDate(date: string | Date): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}
