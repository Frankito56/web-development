/**
 * UniLib - MyLoansPage Component
 * Comprehensive loan management dashboard showing active loans, due dates, countdowns, reservations, and past history.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoanService } from '@/services/loanService';
import { Loan, Reservation } from '@/types';
import { ActiveLoansList } from '../components/ActiveLoansList';
import { LoanHistoryList } from '../components/LoanHistoryList';
import { ReservationsList } from '../components/ReservationsList';
import { EmptyState } from '@/components/feedback/EmptyState';
import { getDueStatus } from '@/utils/dateUtils';
import { ROLE_LIMITS } from '@/config';
import {
  BookMarked,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import '../loans.css';

type Tab = 'active' | 'reservations' | 'history';

export const MyLoansPage: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<Tab>('active');
  const [activeLoans, setActiveLoans] = useState<Loan[]>(() =>
    user ? LoanService.getActiveLoans(user.id) : []
  );
  const [loanHistory, setLoanHistory] = useState<Loan[]>(() =>
    user ? LoanService.getLoanHistory(user.id) : []
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    user ? LoanService.getUserReservations(user.id) : []
  );

  // Fetch fresh data from backend API in parallel, batching state updates
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [{ active, history }, userRes] = await Promise.all([
        LoanService.fetchUserLoans(user.id),
        LoanService.fetchUserReservations(user.id),
      ]);
      setActiveLoans(active);
      setLoanHistory(history);
      setReservations(userRes);
    } catch (error) {
      console.error('Error loading loan data:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!user) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
        <EmptyState
          icon={<BookMarked size={32} />}
          title="Sign in to view your library loans"
          description="Access your active checkouts, track upcoming return dates, and view reservation statuses."
          actionText="Go to Sign In"
          onAction={() => (window.location.href = '/login')}
        />
      </div>
    );
  }

  // Calculate metrics
  const limit = ROLE_LIMITS[user.role]?.maxLoans || 5;
  const dueSoonCount = activeLoans.filter((l) => getDueStatus(l.dueDate).status === 'warning').length;
  const overdueCount = activeLoans.filter((l) => getDueStatus(l.dueDate).status === 'overdue').length;

  return (
    <div className="unilib-loans-container animate-fade-in">
      {/* Page Header */}
      <div className="unilib-loans-header-row">
        <div>
          <h1 className="unilib-loans-title">Circulation & Loan Center</h1>
          <p className="unilib-loans-subtitle">
            Manage your borrowed university literature, review due dates, and monitor reservations.
          </p>
        </div>

        {/* User status badge */}
        <div className="unilib-allowance-badge">
          <span style={{ color: 'var(--color-text-muted)' }}>Borrow Allowance:</span>
          <strong style={{ color: 'var(--color-primary-600)', fontFamily: 'monospace' }}>
            {activeLoans.length} / {limit} books
          </strong>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="unilib-metrics-grid">
        <div className="unilib-metric-card">
          <div className="unilib-metric-card__header">
            <span>Active Loans</span>
            <BookMarked size={16} color="var(--color-primary-500)" />
          </div>
          <span className="unilib-metric-card__value">{activeLoans.length}</span>
          <p className="unilib-metric-card__subtext">In your possession</p>
        </div>

        <div className="unilib-metric-card">
          <div className="unilib-metric-card__header" style={{ color: 'var(--color-warning)' }}>
            <span>Due in ≤ 3 Days</span>
            <Clock size={16} />
          </div>
          <span className="unilib-metric-card__value" style={{ color: 'var(--color-warning)' }}>
            {dueSoonCount}
          </span>
          <p className="unilib-metric-card__subtext">Renew or return soon</p>
        </div>

        <div className="unilib-metric-card">
          <div className="unilib-metric-card__header" style={{ color: 'var(--color-danger)' }}>
            <span>Overdue Loans</span>
            <AlertTriangle size={16} />
          </div>
          <span className="unilib-metric-card__value" style={{ color: 'var(--color-danger)' }}>
            {overdueCount}
          </span>
          <p className="unilib-metric-card__subtext">Needs immediate return</p>
        </div>

        <div className="unilib-metric-card">
          <div className="unilib-metric-card__header" style={{ color: 'var(--color-success)' }}>
            <span>Past Returns</span>
            <CheckCircle2 size={16} />
          </div>
          <span className="unilib-metric-card__value">{loanHistory.length}</span>
          <p className="unilib-metric-card__subtext">Successfully returned</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="unilib-loans-tabs-bar">
        <button
          onClick={() => setCurrentTab('active')}
          className={`unilib-loan-tab-btn ${currentTab === 'active' ? 'unilib-loan-tab-btn--active' : ''}`}
        >
          <span>Active Checkouts</span>
          <span className="unilib-tab-counter">{activeLoans.length}</span>
        </button>

        <button
          onClick={() => setCurrentTab('reservations')}
          className={`unilib-loan-tab-btn ${currentTab === 'reservations' ? 'unilib-loan-tab-btn--active' : ''}`}
        >
          <span>Reservations Queue</span>
          <span className="unilib-tab-counter">{reservations.length}</span>
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className={`unilib-loan-tab-btn ${currentTab === 'history' ? 'unilib-loan-tab-btn--active' : ''}`}
        >
          <span>Borrowing History</span>
          <span className="unilib-tab-counter">{loanHistory.length}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === 'active' && (
          <div>
            {activeLoans.length === 0 ? (
              <EmptyState
                icon={<BookMarked size={32} />}
                title="You have no active book loans"
                description="Browse our academic catalog and borrow books for research or study."
                actionText="Explore Book Catalog"
                onAction={() => (window.location.href = '/books')}
              />
            ) : (
              <ActiveLoansList loans={activeLoans} onRefresh={loadData} />
            )}
          </div>
        )}

        {currentTab === 'reservations' && (
          <div>
            {reservations.length === 0 ? (
              <EmptyState
                icon={<Clock size={32} />}
                title="No current book reservations"
                description="When a book you need is currently on loan, place a reservation to be queued for next return."
                actionText="Browse Catalog"
                onAction={() => (window.location.href = '/books')}
              />
            ) : (
              <ReservationsList reservations={reservations} onRefresh={loadData} />
            )}
          </div>
        )}

        {currentTab === 'history' && (
          <div>
            {loanHistory.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={32} />}
                title="No borrowing history yet"
                description="Books you return will be permanently archived in your borrowing history."
              />
            ) : (
              <LoanHistoryList loans={loanHistory} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
