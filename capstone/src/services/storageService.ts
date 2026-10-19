import { APP_CONFIG } from '@/config';

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

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      notifyListeners();
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      notifyListeners();
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  subscribe(listener: StorageListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  initializeStorage(): void {
    if (!localStorage.getItem(KEYS.LOANS)) {
      this.setItem(KEYS.LOANS, []);
    }
    if (!localStorage.getItem(KEYS.RESERVATIONS)) {
      this.setItem(KEYS.RESERVATIONS, []);
    }
    if (!localStorage.getItem(KEYS.READING_ITEMS)) {
      this.setItem(KEYS.READING_ITEMS, []);
    }
    if (!localStorage.getItem(KEYS.WISHLIST)) {
      this.setItem(KEYS.WISHLIST, []);
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      this.setItem(KEYS.NOTIFICATIONS, []);
    }
  },

  clearLocalCache(): void {
    this.setItem(KEYS.LOANS, []);
    this.setItem(KEYS.RESERVATIONS, []);
    this.setItem(KEYS.READING_ITEMS, []);
    this.setItem(KEYS.WISHLIST, []);
    this.setItem(KEYS.NOTIFICATIONS, []);
  },
};
