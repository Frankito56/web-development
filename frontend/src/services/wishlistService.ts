import { WishlistItem, Book } from '@/types';
import { StorageService } from './storageService';
import { apiClient } from './apiClient';

export const WishlistService = {
  async fetchUserWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const serverItems = await apiClient.wishlist.getMyWishlist();
      const mapped: WishlistItem[] = serverItems.map((sw: any) => ({
        id: sw.id,
        bookId: sw.bookId,
        openLibraryKey: sw.book?.openLibraryKey || undefined,
        bookTitle: sw.book?.title || 'Saved Book',
        bookCoverUrl: sw.book?.coverUrl || undefined,
        bookAuthors: Array.isArray(sw.book?.authors)
          ? sw.book.authors
          : typeof sw.book?.authors === 'string'
          ? (() => {
              try {
                return JSON.parse(sw.book.authors);
              } catch {
                return [sw.book.authors];
              }
            })()
          : ['Author'],
        userId: sw.userId,
        addedAt: sw.addedAt ? new Date(sw.addedAt).toISOString() : new Date().toISOString(),
        notifyWhenAvailable: sw.notifyWhenAvailable ?? true,
        availableCopies: sw.book?.availableCopies ?? undefined,
        totalCopies: sw.book?.totalCopies ?? undefined,
        availabilityStatus: sw.book?.availabilityStatus ?? undefined,
      }));

      StorageService.setItem(StorageService.KEYS.WISHLIST, mapped);
      return mapped;
    } catch {
      return this.getUserWishlist(userId);
    }
  },

  getUserWishlist(userId: string): WishlistItem[] {
    const list = StorageService.getItem<WishlistItem[]>(StorageService.KEYS.WISHLIST, []);
    return list.filter((w) => w.userId === userId);
  },

  isInWishlist(userId: string, bookIdentifier: string, bookTitle?: string): boolean {
    const cleanId = bookIdentifier.replace(/^\/?works\//, '');
    const list = this.getUserWishlist(userId);
    return list.some((w) => {
      if (w.userId !== userId) return false;
      const wOpenLibKey = w.openLibraryKey ? w.openLibraryKey.replace(/^\/?works\//, '') : undefined;
      return (
        w.bookId === bookIdentifier ||
        w.bookId === cleanId ||
        (wOpenLibKey && (wOpenLibKey === cleanId || wOpenLibKey === bookIdentifier)) ||
        (bookTitle && w.bookTitle && w.bookTitle.toLowerCase().trim() === bookTitle.toLowerCase().trim())
      );
    });
  },

  addToWishlist(userId: string, book: Book, notifyWhenAvailable: boolean = true): WishlistItem {
    const allWishlists = StorageService.getItem<WishlistItem[]>(StorageService.KEYS.WISHLIST, []);
    const cleanBookId = book.id.replace(/^\/?works\//, '');
    const existing = allWishlists.find((w) => {
      if (w.userId !== userId) return false;
      const wOpenLibKey = w.openLibraryKey ? w.openLibraryKey.replace(/^\/?works\//, '') : undefined;
      return (
        w.bookId === book.id ||
        w.bookId === cleanBookId ||
        (wOpenLibKey && (wOpenLibKey === cleanBookId || wOpenLibKey === book.id)) ||
        (book.title && w.bookTitle && w.bookTitle.toLowerCase().trim() === book.title.toLowerCase().trim())
      );
    });

    if (existing) {
      return existing;
    }

    const newItem: WishlistItem = {
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookId: book.id,
      openLibraryKey: book.id,
      bookTitle: book.title,
      bookCoverUrl: book.coverUrl,
      bookAuthors: book.authors,
      userId,
      addedAt: new Date().toISOString(),
      notifyWhenAvailable,
    };

    StorageService.setItem(StorageService.KEYS.WISHLIST, [newItem, ...allWishlists]);

    if (apiClient.getToken()) {
      apiClient.wishlist.add(book.id, notifyWhenAvailable).catch(() => {});
    }

    return newItem;
  },

  removeFromWishlist(userId: string, bookIdentifier: string, bookTitle?: string): void {
    const cleanId = bookIdentifier.replace(/^\/?works\//, '');
    const allWishlists = StorageService.getItem<WishlistItem[]>(StorageService.KEYS.WISHLIST, []);
    const targetItem = allWishlists.find((w) => {
      if (w.userId !== userId) return false;
      const wOpenLibKey = w.openLibraryKey ? w.openLibraryKey.replace(/^\/?works\//, '') : undefined;
      return (
        w.bookId === bookIdentifier ||
        w.bookId === cleanId ||
        (wOpenLibKey && (wOpenLibKey === cleanId || wOpenLibKey === bookIdentifier)) ||
        (bookTitle && w.bookTitle && w.bookTitle.toLowerCase().trim() === bookTitle.toLowerCase().trim())
      );
    });

    const filtered = allWishlists.filter((w) => w !== targetItem);
    StorageService.setItem(StorageService.KEYS.WISHLIST, filtered);

    if (apiClient.getToken()) {
      const idToSend = targetItem ? targetItem.bookId : bookIdentifier;
      apiClient.wishlist.remove(idToSend).catch(() => {});
    }
  },
};
