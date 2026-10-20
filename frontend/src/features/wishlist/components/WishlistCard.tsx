import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, BookOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WishlistItem, User } from '@/types';
import { LoanService } from '@/services/loanService';
import './WishlistCard.css';

interface WishlistCardProps {
  item: WishlistItem;
  user: User | null;
  onRemove: (item: WishlistItem) => void;
  onToggleNotification: (item: WishlistItem) => void;
  onQuickBorrow: (item: WishlistItem) => void;
  onQuickReserve: (item: WishlistItem) => void;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({
  item,
  user,
  onRemove,
  onToggleNotification,
  onQuickBorrow,
  onQuickReserve,
}) => {
  const availCopies = item.availableCopies ?? 0;
  const avStatus = item.availabilityStatus;
  const isAvailable =
    (avStatus === 'AVAILABLE' || avStatus == null) && availCopies > 0;
  const alreadyBorrowed = user ? LoanService.isBookBorrowedByUser(user.id, item.bookId, item.bookTitle) : false;
  const alreadyReserved = user ? LoanService.isBookReservedByUser(user.id, item.bookId, item.bookTitle) : false;

  return (
    <article className="unilib-wishlist-card">
      <div className="unilib-wishlist-card__main">
        {item.bookCoverUrl ? (
          <img
            src={item.bookCoverUrl}
            alt={item.bookTitle}
            className="unilib-wishlist-card__cover"
          />
        ) : (
          <div className="unilib-wishlist-card__cover-placeholder">
            <BookOpen size={24} />
          </div>
        )}

        <div className="unilib-wishlist-card__info">
          <div className="unilib-wishlist-card__header">
            {alreadyReserved ? (
              <Badge variant="reserved">Reserved by You</Badge>
            ) : alreadyBorrowed ? (
              <Badge variant="on_loan">Checked Out by You</Badge>
            ) : isAvailable ? (
              <Badge variant="available">In Stock ({availCopies})</Badge>
            ) : (
              <Badge variant="on_loan">All Copies On Loan</Badge>
            )}

            <button
              onClick={() => onRemove(item)}
              aria-label="Remove from wishlist"
              className="unilib-wishlist-card__remove-btn"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <Link
            to={`/books/${item.bookId}`}
            className="unilib-wishlist-card__title"
          >
            {item.bookTitle}
          </Link>

          <p className="unilib-wishlist-card__author">
            {item.bookAuthors.join(', ')}
          </p>
        </div>
      </div>

      <div className="unilib-wishlist-card__footer">
        <button
          onClick={() => onToggleNotification(item)}
          className={`unilib-alert-toggle-btn ${
            item.notifyWhenAvailable ? 'unilib-alert-toggle-btn--active' : ''
          }`}
        >
          {item.notifyWhenAvailable ? (
            <>
              <Bell size={14} />
              <span>Alert On</span>
            </>
          ) : (
            <>
              <BellOff size={14} />
              <span>Alert Off</span>
            </>
          )}
        </button>

        {alreadyBorrowed ? (
          <Button size="sm" variant="outline" disabled title="You currently have this book checked out">
            Checked Out ✓
          </Button>
        ) : alreadyReserved ? (
          <Button size="sm" variant="outline" disabled title="You already have an active reservation for this book">
            Reserved ✓
          </Button>
        ) : isAvailable ? (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onQuickBorrow(item)}
          >
            Borrow Now
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onQuickReserve(item)}
          >
            Reserve Copy
          </Button>
        )}
      </div>
    </article>
  );
};
