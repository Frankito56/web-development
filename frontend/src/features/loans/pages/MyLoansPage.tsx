import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoanService } from '@/services/loanService';
import { Loan, Reservation } from '@/types';
import { ActiveLoansList } from '../components/ActiveLoansList';
import { LoanHistoryList } from '../components/LoanHistoryList';
import { ReservationsList } from '../components/ReservationsList';
import { LoansHeader } from '../components/LoansHeader';
import { LoansMetrics } from '../components/LoansMetrics';
import { LoansTabs, LoanTab } from '../components/LoansTabs';
import { EmptyState } from '@/components/feedback/EmptyState';
import { getDueStatus } from '@/utils/dateUtils';
import { ROLE_LIMITS } from '@/config';
import { BookMarked, Clock, CheckCircle2 } from 'lucide-react';
import '../loans.css';

export const MyLoansPage: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<LoanTab>('active');
  const [activeLoans, setActiveLoans] = useState<Loan[]>(() =>
    user ? LoanService.getActiveLoans(user.id) : []
  );
  const [loanHistory, setLoanHistory] = useState<Loan[]>(() =>
    user ? LoanService.getLoanHistory(user.id) : []
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    user ? LoanService.getUserReservations(user.id) : []
  );

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
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const limit = user ? ROLE_LIMITS[user.role]?.maxLoans || 5 : 5;

  const pendingPickupCount = useMemo(
    () => activeLoans.filter((l) => l.status === 'PENDING_PICKUP').length,
    [activeLoans]
  );
  const dueSoonCount = useMemo(
    () => activeLoans.filter(
      (l) => l.status !== 'PENDING_PICKUP' && getDueStatus(l.dueDate).status === 'warning'
    ).length,
    [activeLoans]
  );
  const overdueCount = useMemo(
    () => activeLoans.filter(
      (l) => l.status === 'OVERDUE' || (l.status !== 'PENDING_PICKUP' && getDueStatus(l.dueDate).status === 'overdue')
    ).length,
    [activeLoans]
  );

  if (!user) {
    return (
      <div className="unilib-loans-empty-wrap">
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

  return (
    <div className="unilib-loans-container animate-fade-in">
      <LoansHeader activeCount={activeLoans.length} limit={limit} />

      <LoansMetrics
        activeCount={activeLoans.length}
        pendingPickupCount={pendingPickupCount}
        dueSoonCount={dueSoonCount}
        overdueCount={overdueCount}
        historyCount={loanHistory.length}
      />

      <LoansTabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeCount={activeLoans.length}
        reservationsCount={reservations.length}
        historyCount={loanHistory.length}
      />

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
