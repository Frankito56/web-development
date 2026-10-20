import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WishlistService } from '@/services/wishlistService';
import { LoanService } from '@/services/loanService';
import { StorageService } from '@/services/storageService';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Heart, Star, BookOpen, Calendar } from 'lucide-react';
import { ReadingTrackerDropdown } from './ReadingTrackerDropdown';
import './BookCard.css';

export interface BookCardProps {
  book: Book;
  onBorrowClick?: (book: Book) => void;
  onReserveClick?: (book: Book) => void;
}

const BookCardComponent: React.FC<BookCardProps> = ({ book, onBorrowClick, onReserveClick }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const isLibrarian = user?.role === 'LIBRARIAN';
  const [imageError, setImageError] = useState(false);
  const [inWishlist, setInWishlist] = useState(() => (!isLibrarian && user ? WishlistService.isInWishlist(user.id, book.id, book.title) : false));
  const [, setStorageVersion] = useState(0);

  useEffect(() => {
    if (user && !isLibrarian) {
      setInWishlist(WishlistService.isInWishlist(user.id, book.id, book.title));
    }
    const unsub = StorageService.subscribe(() => {
      setStorageVersion((v) => v + 1);
      if (user && !isLibrarian) {
        setInWishlist(WishlistService.isInWishlist(user.id, book.id, book.title));
      }
    });
    return unsub;
  }, [user, book.id, book.title, isLibrarian]);

  const alreadyBorrowed = (!isLibrarian && user) ? LoanService.isBookBorrowedByUser(user.id, book.id) : false;
  const alreadyReserved = (!isLibrarian && user) ? LoanService.isBookReservedByUser(user.id, book.id, book.title) : false;

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
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
  }, [user, inWishlist, book, showToast]);

  const isAvailable = book.availabilityStatus === 'AVAILABLE' && book.availableCopies > 0;
  const isOnLoan = book.availabilityStatus === 'ON_LOAN' || book.availableCopies === 0;

  return (
    <article
      aria-labelledby={`book-title-${book.id}`}
      className="unilib-book-card"
    >
      {/* Cover Image & Fallback */}
      <div className="unilib-book-card__cover-wrap">
        {book.coverUrl && !imageError ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="unilib-book-card__cover-img"
          />
        ) : (
          <div className="unilib-book-card__cover-fallback">
            <BookOpen size={48} strokeWidth={1.5} className="unilib-book-card__cover-fallback-icon" />
            <span className="unilib-book-card__cover-fallback-title">
              {book.title}
            </span>
          </div>
        )}

        {/* Wishlist Button – hidden for librarians */}
        {!isLibrarian && (
        <button
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`unilib-book-card__wishlist-btn ${
            inWishlist ? 'unilib-book-card__wishlist-btn--active' : ''
          }`}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
        )}

        {/* Availability Badge */}
        <div className="unilib-book-card__badge-wrap">
          {alreadyReserved ? (
            <Badge variant="reserved">Reserved by You</Badge>
          ) : alreadyBorrowed ? (
            <Badge variant="on_loan">Checked Out by You</Badge>
          ) : book.availabilityStatus === 'RESERVED' ? (
            <Badge variant="reserved">Reserved</Badge>
          ) : isAvailable ? (
            <Badge variant="available">Available ({book.availableCopies})</Badge>
          ) : isOnLoan ? (
            <Badge variant="on_loan">On Loan</Badge>
          ) : (
            <Badge variant="reserved">Reserved</Badge>
          )}
        </div>
      </div>

      {}
      <div className="unilib-book-card__body">
        <div>
          {}
          <div className="unilib-book-card__category-row">
            <span className="unilib-book-card__category">
              {book.subjects[0] || 'Academic'}
            </span>
            {book.averageRating && (
              <div className="unilib-book-card__rating">
                <Star size={14} fill="currentColor" />
                <span>{book.averageRating}</span>
              </div>
            )}
          </div>

          {}
          <Link to={`/books/${book.id}`} className="unilib-book-card__title" id={`book-title-${book.id}`}>
            {book.title}
          </Link>

          {}
          <p className="unilib-book-card__author">
            {book.authors.join(', ')}
          </p>

          {}
          <div className="unilib-book-card__meta">
            {book.firstPublishYear && (
              <div className="unilib-book-card__meta-item">
                <Calendar size={12} />
                <span>{book.firstPublishYear}</span>
              </div>
            )}
            {book.locationShelf && (
              <div className="unilib-book-card__meta-item unilib-book-card__meta-item--mono">
                <span>📍 {book.locationShelf}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: tracker + actions. Librarian sees nothing interactive. */}
        <div className="unilib-book-card__footer">
          {!isLibrarian && <ReadingTrackerDropdown book={book} />}

          <div className="unilib-book-card__actions">
            {isLibrarian ? null : alreadyBorrowed ? (
              <Button size="sm" variant="outline" disabled title="You already have this book checked out">
                Checked Out ✓
              </Button>
            ) : alreadyReserved ? (
              <Button size="sm" variant="outline" disabled title="You already have a reservation for this book">
                Reserved ✓
              </Button>
            ) : isAvailable ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onBorrowClick?.(book)}
              >
                Borrow
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReserveClick?.(book)}
              >
                Reserve
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export const BookCard = React.memo(BookCardComponent);
