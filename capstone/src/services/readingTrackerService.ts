/**
 * UniLib - Reading Tracker Service
 * Allows users to track their reading status (Want to Read, Currently Reading, Completed)
 */

import { ReadingProgressItem, ReadingStatus, Book } from '@/types';
import { StorageService } from './storageService';

export const ReadingTrackerService = {
  getUserItems(userId: string): ReadingProgressItem[] {
    const items = StorageService.getItem<ReadingProgressItem[]>(StorageService.KEYS.READING_ITEMS, []);
    return items.filter((i) => i.userId === userId);
  },

  getStatusForBook(userId: string, bookId: string): ReadingProgressItem | undefined {
    const items = this.getUserItems(userId);
    return items.find((i) => i.bookId === bookId);
  },

  updateStatus(
    userId: string,
    book: Book,
    status: ReadingStatus,
    progressPercentage: number = 0,
    notes?: string,
    rating?: number
  ): ReadingProgressItem {
    const allItems = StorageService.getItem<ReadingProgressItem[]>(StorageService.KEYS.READING_ITEMS, []);
    const existingIndex = allItems.findIndex((i) => i.userId === userId && i.bookId === book.id);

    const updatedItem: ReadingProgressItem = {
      id: existingIndex >= 0 ? allItems[existingIndex].id : `rp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookId: book.id,
      bookTitle: book.title,
      bookCoverUrl: book.coverUrl,
      bookAuthors: book.authors,
      userId,
      status,
      progressPercentage: status === 'COMPLETED' ? 100 : progressPercentage,
      notes: notes !== undefined ? notes : existingIndex >= 0 ? allItems[existingIndex].notes : '',
      rating: rating !== undefined ? rating : existingIndex >= 0 ? allItems[existingIndex].rating : undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      allItems[existingIndex] = updatedItem;
    } else {
      allItems.unshift(updatedItem);
    }

    StorageService.setItem(StorageService.KEYS.READING_ITEMS, allItems);
    return updatedItem;
  },

  removeItem(userId: string, bookId: string): void {
    const allItems = StorageService.getItem<ReadingProgressItem[]>(StorageService.KEYS.READING_ITEMS, []);
    const filtered = allItems.filter((i) => !(i.userId === userId && i.bookId === bookId));
    StorageService.setItem(StorageService.KEYS.READING_ITEMS, filtered);
  },
};
