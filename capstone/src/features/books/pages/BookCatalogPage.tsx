

import React, { useState, useEffect } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { LoanService } from '@/services/loanService';
import { WishlistService } from '@/services/wishlistService';
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
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
  const totalPages = Math.max(1, Math.ceil(allBooksCount / pageSize));

  const handleConfirmBorrow = async () => {
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
  };

  const handleConfirmReserve = async () => {
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
  };

  const loanDays = user ? ROLE_LIMITS[user.role]?.maxLoanDays || 14 : 14;
  const simulatedDueDate = calculateDueDate(new Date(), loanDays);

  return (
    <div className="unilib-catalog-container animate-fade-in">
      {}
      <section className="unilib-hero-banner">
        <div className="unilib-hero-content">
          <div className="unilib-hero-badge">
            <Sparkles size={14} />
            <span>Academic Resource Discovery System</span>
          </div>

          <h1 className="unilib-hero-title">
            Explore the Central Academic Library Repository
          </h1>

          <p className="unilib-hero-description">
            Access thousands of academic works, textbooks, research monographs, and classic literature.
            Manage instant loans, reserve waiting copies, and track your scholarly reading progress.
          </p>

          <div className="unilib-hero-search-wrap">
            <SearchBar
              value={filters.searchQuery}
              onChange={updateSearchQuery}
              totalResults={allBooksCount}
              isLoading={isLoading}
              placeholder="Search by title, author, or research domain..."
            />
          </div>
        </div>

        {}
        <div className="unilib-hero-stats-row">
          <div>
            <div className="unilib-stat-number">14 Days</div>
            <div className="unilib-stat-label">Standard Loan Period</div>
          </div>
          <div>
            <div className="unilib-stat-number">24/7</div>
            <div className="unilib-stat-label">Digital Reservation Queue</div>
          </div>
          <div>
            <div className="unilib-stat-number">Auto-Sync</div>
            <div className="unilib-stat-label">Real-Time Open Library API</div>
          </div>
          <div>
            <div className="unilib-stat-number">Zero Penalties</div>
            <div className="unilib-stat-label">On-Time Return Alerts</div>
          </div>
        </div>
      </section>

      {}
      <section className="unilib-filters-card">
        <BookFilters
          filters={filters}
          onCategoryChange={updateCategory}
          onSortChange={updateSortBy}
          onAvailabilityChange={updateAvailability}
          onReset={resetFilters}
        />
      </section>

      {}
      <div className="unilib-catalog-header">
        <div>
          <h2 className="unilib-catalog-title">Available Academic Works</h2>
          <p className="unilib-catalog-count">
            Showing {books.length} works (Page {currentPage} of {totalPages})
          </p>
        </div>
      </div>

      {}
      {isLoading ? (
        <div className="unilib-books-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="No books match your current search"
          description="Try broadening your search term, switching categories, or clearing active filters."
          actionText="Clear All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="unilib-books-grid">
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

      {}
      {!isLoading && books.length > 0 && totalPages > 1 && (
        <nav aria-label="Catalog pagination" className="unilib-pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            leftIcon={<ChevronLeft size={16} />}
          >
            Previous
          </Button>

          <span className="unilib-page-counter">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            rightIcon={<ChevronRight size={16} />}
          >
            Next
          </Button>
        </nav>
      )}

      {}
      <Modal
        isOpen={!!selectedBookForBorrow}
        onClose={() => setSelectedBookForBorrow(null)}
        title="Confirm Book Borrowing"
        description="Review your borrowing details before confirming."
      >
        {selectedBookForBorrow && (
          <div className="unilib-modal-form">
            <div className="unilib-modal-book-preview">
              {selectedBookForBorrow.coverUrl ? (
                <img
                  src={selectedBookForBorrow.coverUrl}
                  alt={selectedBookForBorrow.title}
                  className="unilib-modal-book-cover"
                />
              ) : (
                <div className="unilib-modal-book-fallback">
                  <BookOpen size={24} color="var(--color-text-subtle)" />
                </div>
              )}
              <div className="unilib-modal-book-info">
                <h4 className="unilib-modal-book-title">
                  {selectedBookForBorrow.title}
                </h4>
                <p className="unilib-modal-book-authors">
                  {selectedBookForBorrow.authors.join(', ')}
                </p>
                <div className="unilib-modal-book-copies">
                  Physical copies available: {selectedBookForBorrow.availableCopies}
                </div>
              </div>
            </div>

            <div className="unilib-modal-details-list">
              <div className="unilib-modal-details-row">
                <span className="unilib-modal-details-label">Borrower:</span>
                <strong>{user?.name} ({user?.role})</strong>
              </div>
              <div className="unilib-modal-details-row">
                <span className="unilib-modal-details-label">Loan Duration:</span>
                <strong>{loanDays} Calendar Days</strong>
              </div>
              <div className="unilib-modal-details-row">
                <span className="unilib-modal-details-label">Due Date:</span>
                <strong className="unilib-modal-due-date">{formatDate(simulatedDueDate)}</strong>
              </div>
            </div>

            <div className="unilib-modal-actions">
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

      <Modal
        isOpen={!!selectedBookForReserve}
        onClose={() => setSelectedBookForReserve(null)}
        title="Place Book Reservation"
        description="All copies of this title are currently loaned out."
      >
        {selectedBookForReserve && (
          <div className="unilib-modal-form">
            <div className="unilib-modal-alert-box">
              <Clock size={20} color="var(--color-warning)" className="unilib-modal-alert-icon" />
              <div className="unilib-modal-alert-text">
                Placing a reservation puts you into the priority pickup queue. As soon as another student returns a copy, you will receive an in-app alert.
              </div>
            </div>

            <div className="unilib-modal-reserve-summary">
              <p className="unilib-modal-reserve-summary-title">{selectedBookForReserve.title}</p>
              <p className="unilib-modal-reserve-summary-authors">{selectedBookForReserve.authors.join(', ')}</p>
            </div>

            <div className="unilib-modal-actions">
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
