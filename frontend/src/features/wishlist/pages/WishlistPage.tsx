import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { WishlistService } from '@/services/wishlistService';
import { StorageService } from '@/services/storageService';
import { LoanService } from '@/services/loanService';
import { WishlistItem, Book } from '@/types';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Heart } from 'lucide-react';
import { WishlistHeader } from '../components/WishlistHeader';
import { WishlistGrid } from '../components/WishlistGrid';
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
      <WishlistHeader totalCount={wishlist.length} />
      <WishlistGrid
        wishlist={wishlist}
        user={user}
        onRemove={handleRemove}
        onQuickBorrow={handleQuickBorrow}
        onQuickReserve={handleQuickReserve}
      />
    </div>
  );
};
