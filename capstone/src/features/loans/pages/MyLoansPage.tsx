/**
 * UniLib - MyLoansPage Component
 * Comprehensive loan management dashboard showing active loans, due dates, countdowns, reservations, and past history.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoanService } from '@/services/loanService';
import { StorageService } from '@/services/storageService';
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
  BookmarkCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type Tab = 'active' | 'reservations' | 'history';

export const MyLoansPage: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<Tab>('active');
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [loanHistory, setLoanHistory] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const loadData = useCallback(() => {
    if (!user) return;
    setActiveLoans(LoanService.getActiveLoans(user.id));
    setLoanHistory(LoanService.getLoanHistory(user.id));
    setReservations(LoanService.getUserReservations(user.id));
  }, [user]);

  useEffect(() => {
    loadData();
    const unsubscribe = StorageService.subscribe(loadData);
    return () => unsubscribe();
  }, [loadData]);

  if (!user) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          icon={<BookMarked className="w-8 h-8 text-slate-400" />}
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
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Circulation & Loan Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your borrowed university literature, review due dates, and monitor reservations.
          </p>
        </div>

        {/* User status badge */}
        <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500">Borrow Allowance:</span>
          <strong className="text-primary-600 dark:text-primary-400 font-mono">
            {activeLoans.length} / {limit} books
          </strong>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Loans</span>
            <BookMarked className="w-4 h-4 text-primary-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {activeLoans.length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">In your possession</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold">Due in ≤ 3 Days</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {dueSoonCount}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Renew or return soon</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold">Overdue Loans</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
            {overdueCount}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Needs immediate return</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Past Returns</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {loanHistory.length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Successfully returned</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-8" aria-label="Loans tabs">
          <button
            onClick={() => setCurrentTab('active')}
            className={`py-3.5 px-1 border-b-2 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 ${
              currentTab === 'active'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>Active Checkouts</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {activeLoans.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('reservations')}
            className={`py-3.5 px-1 border-b-2 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 ${
              currentTab === 'reservations'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>Reservations Queue</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {reservations.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`py-3.5 px-1 border-b-2 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 ${
              currentTab === 'history'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>Borrowing History</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {loanHistory.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === 'active' && (
          <div>
            {activeLoans.length === 0 ? (
              <EmptyState
                icon={<BookMarked className="w-8 h-8 text-slate-400" />}
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
                icon={<Clock className="w-8 h-8 text-slate-400" />}
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
                icon={<CheckCircle2 className="w-8 h-8 text-slate-400" />}
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
