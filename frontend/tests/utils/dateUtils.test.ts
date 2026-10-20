import { describe, it, expect } from 'vitest';
import {
  calculateDueDate,
  getDaysRemaining,
  isOverdue,
  getDueStatus,
} from '@/utils/dateUtils';

describe('dateUtils - Happy Paths', () => {
  it('calculateDueDate adds the specified number of days to a base date', () => {
    const baseDate = new Date('2026-10-01T12:00:00Z');
    const result14 = calculateDueDate(baseDate, 14);
    const result30 = calculateDueDate(baseDate, 30);

    expect(result14).toContain('2026-10-15');
    expect(result30).toContain('2026-10-31');
  });

  it('getDaysRemaining returns positive number for future due dates', () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const remaining = getDaysRemaining(futureDate);
    expect(remaining).toBeGreaterThanOrEqual(4);
  });

  it('isOverdue correctly detects whether a date is in the past', () => {
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    expect(isOverdue(pastDate)).toBe(true);
    expect(isOverdue(futureDate)).toBe(false);
  });

  it('getDueStatus returns correct status and badge variants', () => {
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const overdueStatus = getDueStatus(pastDate);
    expect(overdueStatus.status).toBe('overdue');
    expect(overdueStatus.badgeVariant).toBe('danger');

    const futureSafeDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const safeStatus = getDueStatus(futureSafeDate);
    expect(safeStatus.status).toBe('safe');
    expect(safeStatus.badgeVariant).toBe('success');
  });
});
