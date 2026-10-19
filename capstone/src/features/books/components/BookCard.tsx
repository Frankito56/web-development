/**
 * UniLib - Accessible BookCard Component
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WishlistService } from '@/services/wishlistService';
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

export const BookCard: React.FC<BookCardProps> = ({ book, onBorrowClick, onReserveClick }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [imageError, setImageError] = useState(false);
  const [inWishlist, setInWishlist] = useState(() => (user ? WishlistService.isInWishlist(user.id, book.id) : false));

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Authentication Required', 'Please sign in to save books to your wishlist.', 'WARNING');
      return;
    }

    if (inWishlist) {
      WishlistService.removeFromWishlist(user.id, book.id);
      setInWishlist(false);
      showToast('Wishlist', `Removed "${book.title}" from wishlist.`, 'INFO');
    } else {
      WishlistService.addToWishlist(user.id, book, true);
      setInWishlist(true);
      showToast('Wishlist', `Added "${book.title}" to wishlist with availability alert.`, 'SUCCESS');
    }
  };

  const isAvailable = book.availabilityStatus === 'AVAILABLE' && book.availableCopies > 0;
  const isOnLoan = book.availabilityStatus === 'ON_LOAN' || book.availableCopies === 0;

  return (
    <article
      aria-labelledby={`book-title-${book.id}`}
      className="unilib-book-card"
    >
      {/* Top Banner / Cover */}
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
            <BookOpen size={48} strokeWidth={1.5} style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {book.title}
            </span>
          </div>
        )}

        {/* Wishlist Floating Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`unilib-book-card__wishlist-btn ${
            inWishlist ? 'unilib-book-card__wishlist-btn--active' : ''
          }`}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Availability Badge */}
        <div className="unilib-book-card__badge-wrap">
          {isAvailable ? (
            <Badge variant="available">Available ({book.availableCopies})</Badge>
          ) : isOnLoan ? (
            <Badge variant="on_loan">On Loan</Badge>
          ) : (
            <Badge variant="reserved">Reserved</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="unilib-book-card__body">
        <div>
          {/* Category & Rating */}
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

          {/* Title */}
          <Link to={`/books/${book.id}`} className="unilib-book-card__title" id={`book-title-${book.id}`}>
            {book.title}
          </Link>

          {/* Authors */}
          <p className="unilib-book-card__author">
            {book.authors.join(', ')}
          </p>

          {/* Meta Year / Shelf */}
          <div className="unilib-book-card__meta">
            {book.firstPublishYear && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={12} />
                <span>{book.firstPublishYear}</span>
              </div>
            )}
            {book.locationShelf && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'monospace' }}>
                <span>📍 {book.locationShelf}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="unilib-book-card__footer">
          <ReadingTrackerDropdown book={book} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {isAvailable ? (
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
