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
import { Heart, Star, BookOpen, Clock, Calendar } from 'lucide-react';
import { ReadingTrackerDropdown } from './ReadingTrackerDropdown';

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
      className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-book-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* Top Banner / Cover */}
      <div className="relative aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
        {book.coverUrl && !imageError ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-600">
            <BookOpen className="w-12 h-12 stroke-[1.5] mb-2 opacity-60" />
            <span className="text-[11px] font-semibold uppercase tracking-wider line-clamp-2">
              {book.title}
            </span>
          </div>
        )}

        {/* Wishlist Floating Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            inWishlist
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
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
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
              {book.subjects[0] || 'Academic'}
            </span>
            {book.averageRating && (
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{book.averageRating}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link to={`/books/${book.id}`} className="group-hover:text-primary-600 transition-colors">
            <h3
              id={`book-title-${book.id}`}
              className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug"
            >
              {book.title}
            </h3>
          </Link>

          {/* Authors */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {book.authors.join(', ')}
          </p>

          {/* Meta Year / Shelf */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-2.5">
            {book.firstPublishYear && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{book.firstPublishYear}</span>
              </div>
            )}
            {book.locationShelf && (
              <div className="flex items-center gap-1 font-mono">
                <span>📍 {book.locationShelf}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <ReadingTrackerDropdown book={book} />

          <div className="flex items-center gap-1.5">
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
