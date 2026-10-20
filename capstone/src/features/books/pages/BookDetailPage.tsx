

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Book } from '@/types';
import { OpenLibraryService } from '@/services/openLibraryService';
import { StorageService } from '@/services/storageService';
import { LoanService } from '@/services/loanService';
import { WishlistService } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ReadingTrackerDropdown } from '../components/ReadingTrackerDropdown';
import { calculateDueDate, formatDate } from '@/utils/dateUtils';
import { ROLE_LIMITS } from '@/config';
import {
  ArrowLeft,
  BookOpen,
  Star,
  Heart,
} from 'lucide-react';
import './BookDetailPage.css';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    if (user?.id) {
      WishlistService.fetchUserWishlist(user.id).catch(() => {});
      LoanService.fetchUserReservations(user.id).catch(() => {});
    }

    OpenLibraryService.getBookById(id)
      .then((data) => {
        setBook(data);
        if (data && user) {
          setInWishlist(WishlistService.isInWishlist(user.id, data.id, data.title));
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, user]);

  const [, setStorageTick] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setStorageTick((t) => t + 1);
      if (!id) return;
      const cleanId = id.replace(/^\/?works\//, '');
      const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);
      const matched = localBooks.find((b) => {
        const cleanBId = b.id.replace(/^\/?works\//, '');
        return b.id === id || cleanBId === cleanId;
      });
      if (matched) {
        setBook(matched);
      }
      const targetBook = matched || book;
      if (targetBook && user) {
        setInWishlist(WishlistService.isInWishlist(user.id, targetBook.id, targetBook.title));
      }
    };

    const unsubscribe = StorageService.subscribe(handleStorageChange);
    return () => unsubscribe();
  }, [id, book, user]);

  const handleToggleWishlist = () => {
    if (!user || !book) {
      showToast('Authentication Required', 'Please sign in to save books to your wishlist.', 'WARNING');
      return;
    }

    if (inWishlist) {
      WishlistService.removeFromWishlist(user.id, book.id, book.title);
      setInWishlist(false);
      showToast('Wishlist', `Removed "${book.title}" from wishlist.`, 'INFO');
    } else {
      WishlistService.addToWishlist(user.id, book, true);
      setInWishlist(true);
      showToast('Wishlist', `Added "${book.title}" to wishlist with availability alert.`, 'SUCCESS');
    }
  };

  const handleConfirmBorrow = async () => {
    if (!book || !user) return;
    setActionLoading(true);

    const result = await LoanService.borrowBook(book, user);
    setActionLoading(false);
    setIsBorrowModalOpen(false);

    if (result.success) {
      showToast('Borrow Successful', result.message, 'SUCCESS');
    } else {
      showToast('Cannot Borrow', result.message, 'ERROR');
    }
  };

  const handleConfirmReserve = async () => {
    if (!book || !user) return;
    setActionLoading(true);

    const result = await LoanService.reserveBook(book, user);
    setActionLoading(false);
    setIsReserveModalOpen(false);

    if (result.success) {
      showToast('Reservation Placed', result.message, 'SUCCESS');
    } else {
      showToast('Cannot Reserve', result.message, 'ERROR');
    }
  };

  if (isLoading) {
    return (
      <div className="unilib-detail-container">
        <Skeleton className="unilib-detail-skeleton-back" />
        <div className="unilib-detail-layout">
          <Skeleton className="unilib-detail-skeleton-cover" />
          <div className="unilib-detail-skeleton-content">
            <Skeleton className="unilib-detail-skeleton-title" />
            <Skeleton className="unilib-detail-skeleton-subtitle" />
            <Skeleton className="unilib-detail-skeleton-desc" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="unilib-detail-notfound">
        <BookOpen size={48} color="var(--color-text-subtle)" className="unilib-detail-notfound-icon" />
        <h2 className="unilib-detail-notfound-title">
          Book record not found in university catalog
        </h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/books')}>
          Return to Catalog
        </Button>
      </div>
    );
  }

  const isAvailable = book.availabilityStatus === 'AVAILABLE' && book.availableCopies > 0;
  const isOnLoan = book.availabilityStatus === 'ON_LOAN' || book.availableCopies === 0;
  const loanDays = user ? ROLE_LIMITS[user.role]?.maxLoanDays || 14 : 14;
  const dueDate = calculateDueDate(new Date(), loanDays);
  const alreadyBorrowed = user ? LoanService.isBookBorrowedByUser(user.id, book.id) : false;
  const alreadyReserved = user ? LoanService.isBookReservedByUser(user.id, book.id, book.title) : false;

  return (
    <div className="unilib-detail-container animate-fade-in">
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb">
        <Link to="/books" className="unilib-back-link">
          <ArrowLeft size={16} />
          <span>Back to Academic Catalog</span>
        </Link>
      </nav>

      {/* Main Grid */}
      <div className="unilib-detail-layout">
        {/* Left Column: Visual Asset & Actions */}
        <div className="unilib-detail-left">
          <div className="unilib-detail-cover-card">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={`Cover for ${book.title}`}
                className="unilib-detail-cover-img"
              />
            ) : (
              <div className="unilib-detail-cover-fallback">
                <BookOpen size={64} className="unilib-detail-cover-fallback-icon" />
                <div className="unilib-detail-cover-fallback-title">{book.title}</div>
              </div>
            )}

            {/* Availability Badge */}
            <div className="unilib-detail-badge-pos">
              {alreadyReserved ? (
                <Badge variant="reserved">Reserved by You</Badge>
              ) : alreadyBorrowed ? (
                <Badge variant="on_loan">Checked Out by You</Badge>
              ) : book.availabilityStatus === 'RESERVED' ? (
                <Badge variant="reserved">Reserved for Queue</Badge>
              ) : isAvailable ? (
                <Badge variant="available">Available ({book.availableCopies} in stock)</Badge>
              ) : isOnLoan ? (
                <Badge variant="on_loan">All Copies On Loan</Badge>
              ) : (
                <Badge variant="reserved">Reserved for Queue</Badge>
              )}
            </div>
          </div>

          {}
          <div className="unilib-detail-quick-actions">
            <div className="unilib-detail-qa-row">
              <span className="unilib-detail-qa-label">Reading Status</span>
              <ReadingTrackerDropdown book={book} />
            </div>

            <div className="unilib-detail-qa-wishlist-wrap">
              <Button
                variant={inWishlist ? 'danger' : 'outline'}
                size="sm"
                leftIcon={<Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />}
                onClick={handleToggleWishlist}
                className="unilib-detail-wishlist-btn"
              >
                {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </div>

        {}
        <div className="unilib-detail-right">
          <div>
            <div className="unilib-subjects-list">
              {book.subjects.slice(0, 4).map((sub, i) => (
                <span key={i} className="unilib-subject-chip">
                  {sub}
                </span>
              ))}
            </div>

            <h1 className="unilib-detail-title">{book.title}</h1>

            <p className="unilib-detail-authors unilib-detail-authors--spaced">
              By <strong>{book.authors.join(', ')}</strong>
            </p>
          </div>

          {}
          <div className="unilib-meta-cards-row">
            <div>
              <span className="unilib-meta-card-label">Campus Shelf</span>
              <span className="unilib-meta-card-value unilib-meta-card-value--mono">
                {book.locationShelf || 'Circulation Desk'}
              </span>
            </div>
            <div>
              <span className="unilib-meta-card-label">First Published</span>
              <span className="unilib-meta-card-value">
                {book.firstPublishYear || 'Classical Edition'}
              </span>
            </div>
            <div>
              <span className="unilib-meta-card-label">Rating Score</span>
              <span className="unilib-meta-card-value unilib-meta-card-value--rating">
                <Star size={14} fill="currentColor" />
                {book.averageRating || '4.5'} / 5.0
              </span>
            </div>
          </div>

          {}
          <div>
            <h3 className="unilib-detail-section-title">
              Overview & Abstract
            </h3>
            <p className="unilib-overview-text">
              {book.description || 'Academic catalog summary currently in preparation.'}
            </p>
          </div>

          {}
          <div className="unilib-bibliographic-grid">
            <div>
              <span className="unilib-meta-card-label">Publisher</span>
              <span>{book.publisher || 'University Press'}</span>
            </div>
            <div>
              <span className="unilib-meta-card-label">ISBN</span>
              <span className="unilib-detail-isbn">{book.isbn || 'N/A'}</span>
            </div>
            <div>
              <span className="unilib-meta-card-label">Length</span>
              <span>{book.pageCount ? `${book.pageCount} pages` : 'Standard monograph'}</span>
            </div>
          </div>

          {}
          <div className="unilib-detail-actions-row">
            {alreadyBorrowed ? (
              <>
                <Button variant="outline" size="lg" disabled>
                  Already Checked Out ✓
                </Button>
                <p className="unilib-detail-action-note">
                  You currently have this book. Manage it in{' '}
                  <a href="/my-loans" className="unilib-detail-action-link">My Loans</a>.
                </p>
              </>
            ) : alreadyReserved ? (
              <>
                <Button variant="outline" size="lg" disabled>
                  Reservation Pending ✓
                </Button>
                <p className="unilib-detail-action-note">
                  You're in the queue for this book. Track it in{' '}
                  <a href="/my-loans" className="unilib-detail-action-link">My Loans</a>.
                </p>
              </>
            ) : isAvailable ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsBorrowModalOpen(true)}
                >
                  Borrow Book Now ({loanDays} Days)
                </Button>
                <p className="unilib-detail-action-note">
                  {`Free checkout for enrolled patrons. Due on ${formatDate(dueDate)}.`}
                </p>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsReserveModalOpen(true)}
                >
                  Reserve Next Available Copy
                </Button>
                <p className="unilib-detail-action-note">
                  All copies checked out. Reservation queue notifies you immediately upon return.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Borrow Modal */}
      <Modal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        title="Confirm Book Checkout"
        description="Verify borrowing details for this academic title."
      >
        <div className="unilib-detail-modal-body">
          <div className="unilib-detail-modal-box">
            <div className="unilib-detail-modal-row">
              <span className="unilib-detail-modal-row-label">Title:</span>
              <strong>{book.title}</strong>
            </div>
            <div className="unilib-detail-modal-row">
              <span className="unilib-detail-modal-row-label">Duration:</span>
              <strong>{loanDays} Days</strong>
            </div>
            <div className="unilib-detail-modal-row">
              <span className="unilib-detail-modal-row-label">Scheduled Due Date:</span>
              <strong className="unilib-detail-modal-due">{formatDate(dueDate)}</strong>
            </div>
          </div>

          <div className="unilib-detail-modal-footer">
            <Button variant="ghost" size="sm" onClick={() => setIsBorrowModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={actionLoading} onClick={handleConfirmBorrow}>
              Confirm Borrow
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reserve Modal */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        title="Place Reservation Queue"
        description="Queue for the next physical copy returned."
      >
        <div className="unilib-detail-skeleton-content">
          <p className="unilib-detail-reserve-note">
            When another patron returns "{book.title}", the library circulation desk will hold the copy under your name for 3 days.
          </p>

          <div className="unilib-detail-modal-footer">
            <Button variant="ghost" size="sm" onClick={() => setIsReserveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={actionLoading} onClick={handleConfirmReserve}>
              Join Queue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
