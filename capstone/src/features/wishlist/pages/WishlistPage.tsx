/**
 * UniLib - WishlistPage Component
 * Manages saved books and local notification alerts when wished titles become available.
 */

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
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  const loadData = useCallback(() => {
    if (!user) return;
    setWishlist(WishlistService.getUserWishlist(user.id));
    setBooks(StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []));
  }, [user]);

  useEffect(() => {
    loadData();
    const unsubscribe = StorageService.subscribe(loadData);
    return () => unsubscribe();
  }, [loadData]);

  const handleToggleNotification = (item: WishlistItem) => {
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
  };

  const handleRemove = (item: WishlistItem) => {
    if (!user) return;
    WishlistService.removeFromWishlist(user.id, item.bookId);
    showToast('Wishlist', `Removed "${item.bookTitle}" from your wishlist.`, 'INFO');
    loadData();
  };

  const handleQuickBorrow = async (book: Book) => {
    if (!user) return;
    const result = await LoanService.borrowBook(book, user);
    if (result.success) {
      showToast('Borrow Successful', result.message, 'SUCCESS');
      WishlistService.removeFromWishlist(user.id, book.id);
    } else {
      showToast('Cannot Borrow', result.message, 'ERROR');
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
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
      {/* Header */}
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
            const matchedBook = books.find((b) => b.id === item.bookId);
            const isAvailable = matchedBook
              ? matchedBook.availabilityStatus === 'AVAILABLE' && matchedBook.availableCopies > 0
              : false;

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
                      {isAvailable ? (
                        <Badge variant="available">In Stock ({matchedBook?.availableCopies})</Badge>
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

                {/* Bottom Controls */}
                <div className="unilib-wishlist-card__footer">
                  {/* Notification Toggle */}
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

                  {/* Borrow Action if available */}
                  {isAvailable && matchedBook && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleQuickBorrow(matchedBook)}
                    >
                      Borrow Now
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
