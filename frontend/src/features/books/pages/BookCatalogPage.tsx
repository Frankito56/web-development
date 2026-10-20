import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { LoanService } from '@/services/loanService';
import { WishlistService } from '@/services/wishlistService';
import { Book } from '@/types';
import { CatalogHero } from '../components/CatalogHero';
import { BookFilters } from '../components/BookFilters';
import { CatalogBookGrid } from '../components/CatalogBookGrid';
import { CatalogPagination } from '../components/CatalogPagination';
import { BorrowBookModal } from '../components/BorrowBookModal';
import { ReserveBookModal } from '../components/ReserveBookModal';
import { calculateDueDate } from '@/utils/dateUtils';
import { ROLE_LIMITS } from '@/config';
import './BookCatalogPage.css';

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

  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [selectedBookForReserve, setSelectedBookForReserve] = useState<Book | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      LoanService.fetchUserLoans(user.id).catch(() => {});
      LoanService.fetchUserReservations(user.id).catch(() => {});
      WishlistService.fetchUserWishlist(user.id).catch(() => {});
    }
  }, [user?.id]);

  const pageSize = 12;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(allBooksCount / pageSize)), [allBooksCount, pageSize]);

  const handleBorrowClick = useCallback((book: Book) => {
    setSelectedBookForBorrow(book);
  }, []);

  const handleReserveClick = useCallback((book: Book) => {
    setSelectedBookForReserve(book);
  }, []);

  const handleConfirmBorrow = useCallback(async () => {
    if (!selectedBookForBorrow || !user) return;
    setActionLoading(true);

    const result = await LoanService.borrowBook(selectedBookForBorrow, user);
    setActionLoading(false);
    setSelectedBookForBorrow(null);

    if (result.success) {
      showToast('Borrow Successful', result.message, 'SUCCESS');
    } else {
      showToast('Cannot Borrow', result.message, 'ERROR');
    }
  }, [selectedBookForBorrow, user, showToast]);

  const handleConfirmReserve = useCallback(async () => {
    if (!selectedBookForReserve || !user) return;
    setActionLoading(true);

    const result = await LoanService.reserveBook(selectedBookForReserve, user);
    setActionLoading(false);
    setSelectedBookForReserve(null);

    if (result.success) {
      showToast('Reservation Placed', result.message, 'SUCCESS');
    } else {
      showToast('Cannot Reserve', result.message, 'ERROR');
    }
  }, [selectedBookForReserve, user, showToast]);

  const loanDays = useMemo(() => (user ? ROLE_LIMITS[user.role]?.maxLoanDays || 14 : 14), [user]);
  const simulatedDueDate = useMemo(() => calculateDueDate(new Date(), loanDays), [loanDays]);

  return (
    <div className="unilib-catalog-container animate-fade-in">
      <CatalogHero
        searchQuery={filters.searchQuery}
        totalResults={allBooksCount}
        isLoading={isLoading}
        onSearchChange={updateSearchQuery}
      />

      <section className="unilib-filters-card">
        <BookFilters
          filters={filters}
          onCategoryChange={updateCategory}
          onSortChange={updateSortBy}
          onAvailabilityChange={updateAvailability}
          onReset={resetFilters}
        />
      </section>

      <div className="unilib-catalog-header">
        <div>
          <h2 className="unilib-catalog-title">Available Academic Works</h2>
          <p className="unilib-catalog-count">
            Showing {books.length} works (Page {currentPage} of {totalPages})
          </p>
        </div>
      </div>

      <CatalogBookGrid
        books={books}
        isLoading={isLoading}
        onBorrowClick={handleBorrowClick}
        onReserveClick={handleReserveClick}
        onResetFilters={resetFilters}
      />

      {!isLoading && books.length > 0 && totalPages > 1 && (
        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <BorrowBookModal
        isOpen={!!selectedBookForBorrow}
        book={selectedBookForBorrow}
        user={user}
        loanDays={loanDays}
        dueDate={simulatedDueDate}
        actionLoading={actionLoading}
        onClose={() => setSelectedBookForBorrow(null)}
        onConfirm={handleConfirmBorrow}
      />

      <ReserveBookModal
        isOpen={!!selectedBookForReserve}
        book={selectedBookForReserve}
        actionLoading={actionLoading}
        onClose={() => setSelectedBookForReserve(null)}
        onConfirm={handleConfirmReserve}
      />
    </div>
  );
};
