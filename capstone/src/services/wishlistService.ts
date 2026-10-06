/**
 * UniLib - Wishlist Service
 * Handles user wishlists and notification triggers when desired books become available.
 */

import { WishlistItem, Book } from '@/types';
import { StorageService } from './storageService';

export const WishlistService = {
  getUserWishlist(userId: string): WishlistItem[] {
    const list = StorageService.getItem<WishlistItem[]>(StorageService.KEYS.WISHLIST, []);
    return list.filter((w) => w.userId === userId);
  },

  isInWishlist(userId: string, bookId: string): boolean {
    const list = this.getUserWishlist(userId);
    return list.some((w) => w.bookId === bookId);
  },

  addToWishlist(userId: string, book: Book, notifyWhenAvailable: boolean = true): WishlistItem {
    const allWishlists = StorageService.getItem<WishlistItem[]>(StorageService.KEYS.WISHLIST, []);
    const existing = allWishlists.find((w) => w.userId === userId && w.bookId === book.id);
    if (existing) {
      return existing;
    }

    const newItem: WishlistItem = {
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookId: book.id,
      bookTitle: book.title,
      bookCoverUrl: book.coverUrl,
      bookAuthors: book.authors,
      userId,
      addedAt: new Date().toISOString(),
      notifyWhenAvailable,
    };

    StorageService.setItem(StorageService.KEYS.WISHLIST, [newItem, ...allWishlists]);
    return newItem;
  },

  removeFromWishlist(userId: string, bookId: string): void {
    const allWishlists = StorageService.getItem<WishlistItem[]>(StorageService.KEYS.WISHLIST, []);
    const filtered = allWishlists.filter((w) => !(w.userId === userId && w.bookId === bookId));
    StorageService.setItem(StorageService.KEYS.WISHLIST, filtered);
  },

  toggleNotification(userId: string, bookId: string): boolean {
    const allWishlists = StorageService.getItem<WishlistItem[]>(StorageService.KEYS.WISHLIST, []);
    const item = allWishlists.find((w) => w.userId === userId && w.bookId === bookId);
    if (!item) return false;

    item.notifyWhenAvailable = !item.notifyWhenAvailable;
    StorageService.setItem(StorageService.KEYS.WISHLIST, allWishlists);
    return item.notifyWhenAvailable;
  },
};
