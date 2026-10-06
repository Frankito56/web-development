/**
 * UniLib - Date Calculation & Formatting Utilities
 */

import { APP_CONFIG } from '@/config';

/**
 * Calculates due date based on borrow date and loan period (default 14 days)
 */
export function calculateDueDate(startDate: Date | string = new Date(), days: number = APP_CONFIG.MAX_LOAN_DAYS): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Returns number of calendar days remaining until due date (negative if overdue)
 */
export function getDaysRemaining(dueDate: string | Date): number {
  const due = new Date(dueDate);
  const now = new Date();
  
  // Set both to start of day for clean day comparison
  due.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determines whether a loan is overdue
 */
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

/**
 * Categorizes the loan status for UI badges:
 * - Green (success): > 3 days remaining
 * - Yellow (warning): <= 3 days remaining and >= 0
 * - Red (danger): < 0 (Overdue)
 */
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

/**
 * Formats date into readable string, e.g., "Oct 14, 2026"
 */
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

/**
 * Formats date with time, e.g., "Oct 14, 2026, 2:30 PM"
 */
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
