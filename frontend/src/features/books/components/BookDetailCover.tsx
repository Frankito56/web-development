import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReadingTrackerDropdown } from './ReadingTrackerDropdown';
import { Book } from '@/types';
import './BookDetailCover.css';

interface BookDetailCoverProps {
  book: Book;
  inWishlist: boolean;
  alreadyBorrowed: boolean;
  alreadyReserved: boolean;
  isAvailable: boolean;
  isOnLoan: boolean;
  onToggleWishlist: () => void;
}

export const BookDetailCover: React.FC<BookDetailCoverProps> = ({
  book,
  inWishlist,
  alreadyBorrowed,
  alreadyReserved,
  isAvailable,
  isOnLoan,
  onToggleWishlist,
}) => {
  return (
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
            onClick={onToggleWishlist}
            className="unilib-detail-wishlist-btn"
          >
            {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
          </Button>
        </div>
      </div>
    </div>
  );
};
