/**
 * UniLib - BookCatalogPage Component
 * Main catalog page with real-time API search, category filtering, sorting, pagination, and loan modals.
 */

import React, { useState } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { LoanService } from '@/services/loanService';
import { Book } from '@/types';
import { SearchBar } from '../components/SearchBar';
import { BookFilters } from '../components/BookFilters';
import { BookCard } from '../components/BookCard';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { calculateDueDate, formatDate } from '@/utils/dateUtils';
import { ROLE_LIMITS } from '@/config';
import {
  BookOpen,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  Clock,
} from 'lucide-react';

export const BookCatalogPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const {
    books,
    allBooksCount,
    isLoading,
    filters,
    currentPage,
    setCurrentPage,
    updateSearchQuery,
    updateCategory,
    updateSortBy,
    updateAvailability,
    resetFilters,
  } = useBooks();

  // Modals state
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [selectedBookForReserve, setSelectedBookForReserve] = useState<Book | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination calculation
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(allBooksCount / pageSize));

  const handleConfirmBorrow = () => {
    if (!selectedBookForBorrow || !user) return;
    setActionLoading(true);

    const result = LoanService.borrowBook(selectedBookForBorrow, user);
    setActionLoading(false);
    setSelectedBookForBorrow(null);

    if (result.success) {
      showToast('Borrow Successful', result.message, 'SUCCESS');
    } else {
      showToast('Cannot Borrow', result.message, 'ERROR');
    }
  };

  const handleConfirmReserve = () => {
    if (!selectedBookForReserve || !user) return;
    setActionLoading(true);

    const result = LoanService.reserveBook(selectedBookForReserve, user);
    setActionLoading(false);
    setSelectedBookForReserve(null);

    if (result.success) {
      showToast('Reservation Placed', result.message, 'SUCCESS');
    } else {
      showToast('Cannot Reserve', result.message, 'ERROR');
    }
  };

  const loanDays = user ? ROLE_LIMITS[user.role]?.maxLoanDays || 14 : 14;
  const simulatedDueDate = calculateDueDate(new Date(), loanDays);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* University Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl shadow-primary-950/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-primary-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-primary-300" />
            <span>Academic Resource Discovery System</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Explore the Central Academic Library Repository
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Access thousands of academic works, textbooks, research monographs, and classic literature.
            Manage instant loans, reserve waiting copies, and track your scholarly reading progress.
          </p>

          {/* Quick Search inside Hero */}
          <div className="pt-2 max-w-2xl">
            <SearchBar
              value={filters.searchQuery}
              onChange={updateSearchQuery}
              totalResults={allBooksCount}
              isLoading={isLoading}
              placeholder="Search by title, author, or research domain..."
            />
          </div>
        </div>

        {/* Floating Quick Stats */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono">14 Days</span>
            <p className="text-[11px] text-slate-400">Standard Loan Period</p>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono">24/7</span>
            <p className="text-[11px] text-slate-400">Digital Reservation Queue</p>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono">Auto-Sync</span>
            <p className="text-[11px] text-slate-400">Real-Time Open Library API</p>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono">Zero Penalties</span>
            <p className="text-[11px] text-slate-400">On-Time Return Alerts</p>
          </div>
        </div>
      </section>

      {/* Catalog Filters Bar */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <BookFilters
          filters={filters}
          onCategoryChange={updateCategory}
          onSortChange={updateSortBy}
          onAvailabilityChange={updateAvailability}
          onReset={resetFilters}
        />
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Available Academic Works
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {books.length} works (Page {currentPage} of {totalPages})
          </p>
        </div>
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-slate-400" />}
          title="No books match your current search"
          description="Try broadening your search term, switching categories, or clearing active filters."
          actionText="Clear All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrowClick={(b) => setSelectedBookForBorrow(b)}
              onReserveClick={(b) => setSelectedBookForReserve(b)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && books.length > 0 && totalPages > 1 && (
        <nav
          aria-label="Catalog pagination"
          className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200 dark:border-slate-800"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <span className="text-xs font-semibold px-4 py-2 text-slate-700 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </nav>
      )}

      {/* Borrow Confirmation Modal */}
      <Modal
        isOpen={!!selectedBookForBorrow}
        onClose={() => setSelectedBookForBorrow(null)}
        title="Confirm Book Borrowing"
        description="Review your borrowing details before confirming."
      >
        {selectedBookForBorrow && (
          <div className="space-y-4">
            <div className="flex gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              {selectedBookForBorrow.coverUrl ? (
                <img
                  src={selectedBookForBorrow.coverUrl}
                  alt={selectedBookForBorrow.title}
                  className="w-16 h-22 object-cover rounded-lg shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-16 h-22 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                  {selectedBookForBorrow.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {selectedBookForBorrow.authors.join(', ')}
                </p>
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span>Physical copies available: {selectedBookForBorrow.availableCopies}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user?.name} ({user?.role})
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Loan Duration:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {loanDays} Calendar Days
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">
                  {formatDate(simulatedDueDate)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBookForBorrow(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                onClick={handleConfirmBorrow}
              >
                Confirm Borrow
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reserve Confirmation Modal */}
      <Modal
        isOpen={!!selectedBookForReserve}
        onClose={() => setSelectedBookForReserve(null)}
        title="Place Book Reservation"
        description="All copies of this title are currently loaned out."
      >
        {selectedBookForReserve && (
          <div className="space-y-4">
            <div className="flex gap-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                Placing a reservation puts you into the priority pickup queue. As soon as another student returns a copy, you will receive an in-app alert.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <p className="font-bold text-slate-900 dark:text-slate-100">{selectedBookForReserve.title}</p>
              <p className="text-slate-500">{selectedBookForReserve.authors.join(', ')}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBookForReserve(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                onClick={handleConfirmReserve}
              >
                Join Reservation Queue
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
