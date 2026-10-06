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
import { Heart, Bell, BellOff, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const handleQuickBorrow = (book: Book) => {
    if (!user) return;
    const result = LoanService.borrowBook(book, user);
    if (result.success) {
      showToast('Borrow Successful', result.message, 'SUCCESS');
      // optionally remove from wishlist after borrowing
      WishlistService.removeFromWishlist(user.id, book.id);
    } else {
      showToast('Cannot Borrow', result.message, 'ERROR');
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          icon={<Heart className="w-8 h-8 text-slate-400" />}
          title="Sign in to view your wishlist"
          description="Save upcoming books and receive alerts as soon as copies are returned to campus."
          actionText="Sign In"
          onAction={() => (window.location.href = '/login')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Scholarly Wishlist & Availability Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track books you intend to read later and receive instant in-app alerts when physical copies are returned.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900 text-xs font-semibold text-primary-700 dark:text-primary-300">
          {wishlist.length} Saved {wishlist.length === 1 ? 'Title' : 'Titles'}
        </div>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-slate-400" />}
          title="Your wishlist is empty"
          description="Browse the library catalog and click the heart icon on any book to add it here."
          actionText="Explore Academic Catalog"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const matchedBook = books.find((b) => b.id === item.bookId);
            const isAvailable = matchedBook
              ? matchedBook.availabilityStatus === 'AVAILABLE' && matchedBook.availableCopies > 0
              : false;

            return (
              <article
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {item.bookCoverUrl ? (
                    <img
                      src={item.bookCoverUrl}
                      alt={item.bookTitle}
                      className="w-16 h-24 object-cover rounded-lg shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-slate-400" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      {isAvailable ? (
                        <Badge variant="available">In Stock ({matchedBook?.availableCopies})</Badge>
                      ) : (
                        <Badge variant="on_loan">All Copies On Loan</Badge>
                      )}

                      <button
                        onClick={() => handleRemove(item)}
                        aria-label="Remove from wishlist"
                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      to={`/books/${item.bookId}`}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-primary-600 transition-colors line-clamp-2"
                    >
                      {item.bookTitle}
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {item.bookAuthors.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Notification Toggle */}
                  <button
                    onClick={() => handleToggleNotification(item)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                      item.notifyWhenAvailable
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.notifyWhenAvailable ? (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Alert On</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5" />
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
