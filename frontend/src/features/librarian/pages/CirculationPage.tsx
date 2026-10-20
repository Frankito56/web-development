import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiClient, ApiLoan, ApiReservation } from '@/services/apiClient';
import { useNotification } from '@/context/NotificationContext';

import { CirculationHeader } from '../components/CirculationHeader';
import { CirculationStatsBar } from '../components/CirculationStatsBar';
import { CirculationSearchBar } from '../components/CirculationSearchBar';
import { CirculationTabs } from '../components/CirculationTabs';
import { PendingLoansTable } from '../components/PendingLoansTable';
import { ActiveLoansTable } from '../components/ActiveLoansTable';
import { ReservationsTable } from '../components/ReservationsTable';
import { OverdueLoansTable } from '../components/OverdueLoansTable';

import './CirculationPage.css';
import '../components/CirculationSection.css';

export type Tab = 'loans' | 'reservations' | 'overdue';

interface CirculationData {
  loans: ApiLoan[];
  reservations: ApiReservation[];
  overdueLoans: ApiLoan[];
}

const getBookTitle = (l: ApiLoan | ApiReservation): string =>
  (l as any).book?.title || (l as any).bookTitle || 'Unknown Book';

const matchesQuery = (item: ApiLoan | ApiReservation, q: string): boolean => {
  const lower = q.toLowerCase().trim();
  return (
    (item.user?.name || '').toLowerCase().includes(lower) ||
    (item.user?.studentOrEmployeeId || '').toLowerCase().includes(lower) ||
    (item.user?.department || '').toLowerCase().includes(lower) ||
    (item.user?.email || '').toLowerCase().includes(lower) ||
    getBookTitle(item).toLowerCase().includes(lower)
  );
};

export const CirculationPage: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<Tab>('loans');
  const [data, setData] = useState<CirculationData>({ loans: [], reservations: [], overdueLoans: [] });
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [returning, setReturning] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const overview = await apiClient.loans.getCirculationOverview();
      setData(overview);
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to load circulation data', 'ERROR');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleDeliver = useCallback(async (loanId: string) => {
    setDelivering(loanId);
    try {
      await apiClient.loans.deliverLoan(loanId);
      showToast('Success', 'Book delivered successfully. 14-day loan period started.', 'SUCCESS');
      await load();
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to deliver loan', 'ERROR');
    } finally {
      setDelivering(null);
    }
  }, [showToast, load]);

  const handleReturn = useCallback(async (loanId: string) => {
    setReturning(loanId);
    try {
      await apiClient.loans.returnLoan(loanId);
      showToast('Success', 'Book returned successfully. Inventory updated.', 'SUCCESS');
      await load();
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to return book', 'ERROR');
    } finally {
      setReturning(null);
    }
  }, [showToast, load]);

  const pendingLoans = useMemo(() => data.loans.filter((l) => l.status === 'PENDING_PICKUP'), [data.loans]);
  const activeLoans = useMemo(() => data.loans.filter((l) => l.status === 'ACTIVE' || l.status === 'DELIVERED'), [data.loans]);

  const filter = useCallback(
    <T extends ApiLoan | ApiReservation>(items: T[]) =>
      searchQuery.trim() ? items.filter((i) => matchesQuery(i, searchQuery)) : items,
    [searchQuery],
  );

  const filteredPending = useMemo(() => filter(pendingLoans), [filter, pendingLoans]);
  const filteredActive = useMemo(() => filter(activeLoans), [filter, activeLoans]);
  const filteredReservations = useMemo(() => filter(data.reservations), [filter, data.reservations]);
  const filteredOverdue = useMemo(() => filter(data.overdueLoans), [filter, data.overdueLoans]);

  const resultSummary = `${filteredPending.length + filteredActive.length} loans · ${filteredReservations.length} reservations · ${filteredOverdue.length} overdue`;

  return (
    <main className="circ-page">
      <CirculationHeader loading={loading} onRefresh={load} />

      <CirculationStatsBar
        pendingCount={pendingLoans.length}
        activeCount={activeLoans.length}
        queueCount={data.reservations.length}
        overdueCount={data.overdueLoans.length}
      />

      <CirculationSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        resultSummary={resultSummary}
      />

      <CirculationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        loansCount={filteredPending.length + filteredActive.length}
        reservationsCount={filteredReservations.length}
        overdueCount={filteredOverdue.length}
      />

      <div className="circ-content">
        {loading ? (
          <div className="circ-loading">
            <RefreshCw size={32} className="circ-spin" />
            <p>Loading circulation data…</p>
          </div>
        ) : (
          <>
            {activeTab === 'loans' && (
              <div className="circ-section">
                <PendingLoansTable
                  loans={pendingLoans}
                  filteredLoans={filteredPending}
                  searchQuery={searchQuery}
                  delivering={delivering}
                  onDeliver={handleDeliver}
                />
                <ActiveLoansTable
                  loans={activeLoans}
                  filteredLoans={filteredActive}
                  searchQuery={searchQuery}
                  returning={returning}
                  onReturn={handleReturn}
                />
                {pendingLoans.length === 0 && activeLoans.length === 0 && (
                  <div className="circ-empty">No loans to show.</div>
                )}
              </div>
            )}

            {activeTab === 'reservations' && (
              <ReservationsTable
                reservations={data.reservations}
                filteredReservations={filteredReservations}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'overdue' && (
              <OverdueLoansTable
                loans={data.overdueLoans}
                filteredLoans={filteredOverdue}
                searchQuery={searchQuery}
                returning={returning}
                onReturn={handleReturn}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default CirculationPage;
