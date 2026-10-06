/**
 * UniLib - Storage Service
 * Type-safe localStorage persistence wrapper with reactive listeners & auto-seeding.
 */

import { APP_CONFIG } from '@/config';
import { Book, User, Loan, Reservation, ReadingProgressItem, WishlistItem, NotificationItem } from '@/types';
import { INITIAL_BOOKS, INITIAL_USERS, INITIAL_LOANS, INITIAL_RESERVATIONS, INITIAL_READING_ITEMS } from '@/utils/mockData';

const KEYS = {
  USERS: `${APP_CONFIG.STORAGE_PREFIX}users`,
  CURRENT_USER: `${APP_CONFIG.STORAGE_PREFIX}current_user`,
  BOOKS: `${APP_CONFIG.STORAGE_PREFIX}books`,
  LOANS: `${APP_CONFIG.STORAGE_PREFIX}loans`,
  RESERVATIONS: `${APP_CONFIG.STORAGE_PREFIX}reservations`,
  READING_ITEMS: `${APP_CONFIG.STORAGE_PREFIX}reading_items`,
  WISHLIST: `${APP_CONFIG.STORAGE_PREFIX}wishlist`,
  NOTIFICATIONS: `${APP_CONFIG.STORAGE_PREFIX}notifications`,
  THEME: `${APP_CONFIG.STORAGE_PREFIX}theme`,
};

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
}

export const StorageService = {
  KEYS,

  /**
   * Safe getter from localStorage
   */
  getItem<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return fallback;
    }
  },

  /**
   * Safe setter to localStorage with reactivity
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      notifyListeners();
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  },

  /**
   * Remove item
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      notifyListeners();
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  /**
   * Subscribe to storage change events (in-app updates)
   */
  subscribe(listener: StorageListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Initialize local storage with default database seed data if empty
   */
  initializeStorage(): void {
    if (!localStorage.getItem(KEYS.USERS)) {
      this.setItem<User[]>(KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      this.setItem<User>(KEYS.CURRENT_USER, INITIAL_USERS[0]); // Default to student
    }
    if (!localStorage.getItem(KEYS.BOOKS)) {
      this.setItem<Book[]>(KEYS.BOOKS, INITIAL_BOOKS);
    }
    if (!localStorage.getItem(KEYS.LOANS)) {
      this.setItem<Loan[]>(KEYS.LOANS, INITIAL_LOANS);
    }
    if (!localStorage.getItem(KEYS.RESERVATIONS)) {
      this.setItem<Reservation[]>(KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
    }
    if (!localStorage.getItem(KEYS.READING_ITEMS)) {
      this.setItem<ReadingProgressItem[]>(KEYS.READING_ITEMS, INITIAL_READING_ITEMS);
    }
    if (!localStorage.getItem(KEYS.WISHLIST)) {
      this.setItem<WishlistItem[]>(KEYS.WISHLIST, []);
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      const initialNotice: NotificationItem[] = [
        {
          id: 'notif-welcome',
          userId: INITIAL_USERS[0].id,
          title: 'Welcome to UniLib',
          message: 'Your academic library account is active. You can borrow up to 5 books.',
          type: 'INFO',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/books',
        },
      ];
      this.setItem<NotificationItem[]>(KEYS.NOTIFICATIONS, initialNotice);
    }
  },

  /**
   * Reset database back to default seed data
   */
  resetToDefaults(): void {
    this.setItem<User[]>(KEYS.USERS, INITIAL_USERS);
    this.setItem<User>(KEYS.CURRENT_USER, INITIAL_USERS[0]);
    this.setItem<Book[]>(KEYS.BOOKS, INITIAL_BOOKS);
    this.setItem<Loan[]>(KEYS.LOANS, INITIAL_LOANS);
    this.setItem<Reservation[]>(KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
    this.setItem<ReadingProgressItem[]>(KEYS.READING_ITEMS, INITIAL_READING_ITEMS);
    this.setItem<WishlistItem[]>(KEYS.WISHLIST, []);
    this.setItem<NotificationItem[]>(KEYS.NOTIFICATIONS, []);
  },
};

// Auto-run initialization
StorageService.initializeStorage();
