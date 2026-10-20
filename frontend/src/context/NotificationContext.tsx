import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { NotificationItem, NotificationType } from '@/types';
import { StorageService } from '@/services/storageService';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: NotificationType) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const loadNotifications = useCallback(() => {
    const all = StorageService.getItem<NotificationItem[]>(StorageService.KEYS.NOTIFICATIONS, []);
    if (user) {
      setNotifications(all.filter((n) => n.userId === user.id));
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    const unsubscribe = StorageService.subscribe(loadNotifications);
    return () => unsubscribe();
  }, [loadNotifications]);

  const markAsRead = useCallback((id: string) => {
    const all = StorageService.getItem<NotificationItem[]>(StorageService.KEYS.NOTIFICATIONS, []);
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    StorageService.setItem(StorageService.KEYS.NOTIFICATIONS, updated);
    loadNotifications();
  }, [loadNotifications]);

  const markAllAsRead = useCallback(() => {
    if (!user) return;
    const all = StorageService.getItem<NotificationItem[]>(StorageService.KEYS.NOTIFICATIONS, []);
    const updated = all.map((n) => (n.userId === user.id ? { ...n, read: true } : n));
    StorageService.setItem(StorageService.KEYS.NOTIFICATIONS, updated);
    loadNotifications();
  }, [user, loadNotifications]);

  const clearNotifications = useCallback(() => {
    if (!user) return;
    const all = StorageService.getItem<NotificationItem[]>(StorageService.KEYS.NOTIFICATIONS, []);
    const remaining = all.filter((n) => n.userId !== user.id);
    StorageService.setItem(StorageService.KEYS.NOTIFICATIONS, remaining);
    loadNotifications();
  }, [user, loadNotifications]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message: string, type: NotificationType = 'INFO') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const contextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      toasts,
      showToast,
      removeToast,
    }),
    [
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      toasts,
      showToast,
      removeToast,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
