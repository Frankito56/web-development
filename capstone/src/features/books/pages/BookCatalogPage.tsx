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

  // Modals state
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [selectedBookForReserve, setSelectedBookForReserve] = useState<Book | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination calculation
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
      {/* University Hero Section */}
      <section className="unilib-hero-banner">
        <div style={{ maxWidth: '48rem' }}>
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

        {/* Floating Quick Stats */}
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

      {/* Catalog Filters Bar */}
      <section className="unilib-filters-card">
        <BookFilters
          filters={filters}
          onCategoryChange={updateCategory}
          onSortChange={updateSortBy}
          onAvailabilityChange={updateAvailability}
          onReset={resetFilters}
        />
      </section>

      {/* Results Header */}
      <div className="unilib-catalog-header">
        <div>
          <h2 className="unilib-catalog-title">Available Academic Works</h2>
          <p className="unilib-catalog-count">
            Showing {books.length} works (Page {currentPage} of {totalPages})
          </p>
        </div>
      </div>

      {/* Books Grid */}
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

      {/* Pagination Controls */}
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

      {/* Borrow Confirmation Modal */}
      <Modal
        isOpen={!!selectedBookForBorrow}
        onClose={() => setSelectedBookForBorrow(null)}
        title="Confirm Book Borrowing"
        description="Review your borrowing details before confirming."
      >
        {selectedBookForBorrow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--color-bg-card-subtle)', border: '1px solid var(--color-border)' }}>
              {selectedBookForBorrow.coverUrl ? (
                <img
                  src={selectedBookForBorrow.coverUrl}
                  alt={selectedBookForBorrow.title}
                  style={{ width: '4rem', height: '5.5rem', objectFit: 'cover', borderRadius: '6px' }}
                />
              ) : (
                <div style={{ width: '4rem', height: '5.5rem', backgroundColor: 'var(--color-border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} color="var(--color-text-subtle)" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                  {selectedBookForBorrow.title}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.2rem 0' }}>
                  {selectedBookForBorrow.authors.join(', ')}
                </p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-success-text)', fontWeight: 600 }}>
                  Physical copies available: {selectedBookForBorrow.availableCopies}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Borrower:</span>
                <strong>{user?.name} ({user?.role})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Loan Duration:</span>
                <strong>{loanDays} Calendar Days</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Due Date:</span>
                <strong style={{ color: 'var(--color-primary-600)' }}>{formatDate(simulatedDueDate)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)' }}>
              <Clock size={20} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--color-warning-text)', lineHeight: 1.4 }}>
                Placing a reservation puts you into the priority pickup queue. As soon as another student returns a copy, you will receive an in-app alert.
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--color-bg-card-subtle)', border: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
              <p style={{ fontWeight: 700, margin: 0 }}>{selectedBookForReserve.title}</p>
              <p style={{ color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>{selectedBookForReserve.authors.join(', ')}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
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
