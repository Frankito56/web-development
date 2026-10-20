import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { WishlistService } from '@/services/wishlistService';
import { StorageService } from '@/services/storageService';
import { LoanService } from '@/services/loanService';
import { WishlistItem, Book } from '@/types';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Heart, Bell, BellOff, BookOpen, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './WishlistPage.css';

export const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() =>
    user ? WishlistService.getUserWishlist(user.id) : []
  );

  const syncFromStorage = useCallback(() => {
    if (!user) return;
    setWishlist(WishlistService.getUserWishlist(user.id));
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      WishlistService.fetchUserWishlist(user.id).catch(() => []),
      LoanService.fetchUserLoans(user.id).catch(() => []),
      LoanService.fetchUserReservations(user.id).catch(() => []),
    ]);
    setWishlist(WishlistService.getUserWishlist(user.id));
  }, [user]);

  useEffect(() => {
    loadData();
    const unsubscribe = StorageService.subscribe(syncFromStorage);
    return () => unsubscribe();
  }, [loadData, syncFromStorage]);

  const handleToggleNotification = useCallback((item: WishlistItem) => {
    if (!user) return;
    const newState = WishlistService.toggleNotification(user.id, item.bookId);
    showToast(
      'Availability Alert',
      newState
        ? `You will receive a notification when "${item.bookTitle}" is returned.`
        : `Notifications disabled for "${item.bookTitle}".`,
      'INFO'
    );
    loadData();
  }, [user, showToast, loadData]);

  const handleRemove = useCallback((item: WishlistItem) => {
    if (!user) return;
    WishlistService.removeFromWishlist(user.id, item.bookId, item.bookTitle);
    showToast('Wishlist', `Removed "${item.bookTitle}" from your wishlist.`, 'INFO');
    loadData();
  }, [user, showToast, loadData]);

  const handleQuickBorrow = useCallback(async (item: WishlistItem) => {
    if (!user) return;
    const bookObj: Book = {
      id: item.bookId,
      title: item.bookTitle,
      authors: item.bookAuthors,
      subjects: [],
      coverUrl: item.bookCoverUrl,
      availabilityStatus: item.availabilityStatus || 'AVAILABLE',
      totalCopies: item.totalCopies || 3,
      availableCopies: item.availableCopies || 1,
    };
    const result = await LoanService.borrowBook(bookObj, user);
    if (result.success) {
      showToast('Borrow Successful', result.message, 'SUCCESS');
      await Promise.all([
        LoanService.fetchUserLoans(user.id).catch(() => []),
        loadData(),
      ]);
    } else {
      showToast('Cannot Borrow', result.message, 'ERROR');
    }
  }, [user, showToast, loadData]);

  const handleQuickReserve = useCallback(async (item: WishlistItem) => {
    if (!user) return;
    const bookObj: Book = {
      id: item.bookId,
      title: item.bookTitle,
      authors: item.bookAuthors,
      subjects: [],
      coverUrl: item.bookCoverUrl,
      availabilityStatus: item.availabilityStatus || 'ON_LOAN',
      totalCopies: item.totalCopies || 3,
      availableCopies: 0,
    };
    const result = await LoanService.reserveBook(bookObj, user);
    if (result.success) {
      showToast('Reservation Placed', `Successfully reserved "${item.bookTitle}". You are in the queue.`, 'SUCCESS');
      await Promise.all([
        LoanService.fetchUserReservations(user.id).catch(() => []),
        loadData(),
      ]);
    } else {
      showToast('Cannot Reserve', result.message, 'ERROR');
    }
  }, [user, showToast, loadData]);

  if (!user) {
    return (
      <div className="unilib-wishlist-empty-wrap">
        <EmptyState
          icon={<Heart size={32} color="var(--color-text-muted)" />}
          title="Sign in to view your wishlist"
          description="Save upcoming books and receive alerts as soon as copies are returned to campus."
          actionText="Sign In"
          onAction={() => (window.location.href = '/login')}
        />
      </div>
    );
  }

  return (
    <div className="unilib-wishlist-container">
      {/* Page Header */}
      <div className="unilib-wishlist-header-row">
        <div>
          <h1 className="unilib-wishlist-title">
            Scholarly Wishlist & Availability Alerts
          </h1>
          <p className="unilib-wishlist-subtitle">
            Track books you intend to read later and receive instant in-app alerts when physical copies are returned.
          </p>
        </div>

        <div className="unilib-wishlist-count-badge">
          {wishlist.length} Saved {wishlist.length === 1 ? 'Title' : 'Titles'}
        </div>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart size={32} color="var(--color-text-muted)" />}
          title="Your wishlist is empty"
          description="Browse the library catalog and click the heart icon on any book to add it here."
          actionText="Explore Academic Catalog"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="unilib-wishlist-grid">
          {wishlist.map((item) => {
            const availCopies = item.availableCopies ?? 0;
            const avStatus = item.availabilityStatus;
            const isAvailable =
              (avStatus === 'AVAILABLE' || avStatus == null) && availCopies > 0;
            const alreadyBorrowed = user ? LoanService.isBookBorrowedByUser(user.id, item.bookId, item.bookTitle) : false;
            const alreadyReserved = user ? LoanService.isBookReservedByUser(user.id, item.bookId, item.bookTitle) : false;

            return (
              <article key={item.id} className="unilib-wishlist-card">
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
                        onClick={() => handleRemove(item)}
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

                {/* Card Footer: Notifications & Borrow/Reserve Actions */}
                <div className="unilib-wishlist-card__footer">
                  <button
                    onClick={() => handleToggleNotification(item)}
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
                      onClick={() => handleQuickBorrow(item)}
                    >
                      Borrow Now
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickReserve(item)}
                    >
                      Reserve Copy
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
