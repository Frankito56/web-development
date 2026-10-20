import { Book, User, Loan, Reservation, NotificationItem } from '@/types';
import { StorageService } from './storageService';
import { apiClient } from './apiClient';
import { calculateDueDate } from '@/utils/dateUtils';
import { ROLE_LIMITS } from '@/config';

export const LoanService = {
  async fetchUserLoans(userId: string): Promise<{ active: Loan[]; history: Loan[] }> {
    try {
      const serverLoans = await apiClient.loans.getMyLoans();
      const mapped: Loan[] = serverLoans.map((sl) => ({
        id: sl.id,
        bookId: sl.bookId,
        openLibraryKey: (sl as any).book?.openLibraryKey || undefined,
        bookTitle: (sl as any).book?.title || 'Library Book',
        bookCoverUrl: (sl as any).book?.coverUrl || undefined,
        bookAuthors: Array.isArray((sl as any).book?.authors)
          ? (sl as any).book.authors
          : typeof (sl as any).book?.authors === 'string'
          ? (() => {
              try {
                return JSON.parse((sl as any).book.authors);
              } catch {
                return [(sl as any).book.authors];
              }
            })()
          : ['Author'],
        userId: sl.userId,
        userName: 'Student User',
        userRole: 'STUDENT',
        borrowDate: new Date(sl.borrowDate).toISOString(),
        dueDate: new Date(sl.dueDate).toISOString(),
        returnDate: sl.returnDate ? new Date(sl.returnDate).toISOString() : null,
        status: sl.status,
        renewCount: sl.renewCount,
      }));

      StorageService.setItem(StorageService.KEYS.LOANS, mapped);
      return {
        active: mapped.filter((l) => l.status !== 'RETURNED'),
        history: mapped.filter((l) => l.status === 'RETURNED'),
      };
    } catch {
      const cached = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
      const userCached = cached.filter((l) => l.userId === userId);
      return {
        active: userCached.filter((l) => l.status !== 'RETURNED'),
        history: userCached.filter((l) => l.status === 'RETURNED'),
      };
    }
  },

  getActiveLoans(userId: string): Loan[] {
    const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
    return loans.filter((l) => l.userId === userId && l.status !== 'RETURNED');
  },

  getLoanHistory(userId: string): Loan[] {
    const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
    return loans.filter((l) => l.userId === userId && l.status === 'RETURNED');
  },


  isBookBorrowedByUser(userId: string, bookIdentifier: string, bookTitle?: string): boolean {
    const cleanId = bookIdentifier.replace(/^\/?works\//, '');
    const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
    return loans.some((l) => {
      if (l.userId !== userId) return false;
      if (l.status === 'RETURNED') return false;
      const loanOpenLibKey = l.openLibraryKey ? l.openLibraryKey.replace(/^\/?works\//, '') : undefined;
      return (
        l.bookId === bookIdentifier ||
        l.bookId === cleanId ||
        (loanOpenLibKey && (loanOpenLibKey === cleanId || loanOpenLibKey === bookIdentifier)) ||
        (bookTitle && l.bookTitle && l.bookTitle.toLowerCase().trim() === bookTitle.toLowerCase().trim())
      );
    });
  },


  isBookReservedByUser(userId: string, bookIdentifier: string, bookTitle?: string): boolean {
    const cleanId = bookIdentifier.replace(/^\/?works\//, '');
    const reservations = StorageService.getItem<Reservation[]>(StorageService.KEYS.RESERVATIONS, []);
    return reservations.some((r) => {
      if (r.userId !== userId) return false;
      if (r.status === 'CANCELLED' || r.status === 'FULFILLED') return false;
      const resOpenLibKey = r.openLibraryKey ? r.openLibraryKey.replace(/^\/?works\//, '') : undefined;
      return (
        r.bookId === bookIdentifier ||
        r.bookId === cleanId ||
        (resOpenLibKey && (resOpenLibKey === cleanId || resOpenLibKey === bookIdentifier)) ||
        (bookTitle && r.bookTitle && r.bookTitle.toLowerCase().trim() === bookTitle.toLowerCase().trim())
      );
    });
  },

  async fetchUserReservations(userId: string): Promise<Reservation[]> {
    try {
      const serverRes = await apiClient.reservations.getMyReservations();
      const mapped: Reservation[] = serverRes.map((sr) => ({
        id: sr.id,
        bookId: sr.bookId,
        openLibraryKey: (sr as any).book?.openLibraryKey || undefined,
        bookTitle: (sr as any).book?.title || 'Reserved Book',
        bookCoverUrl: (sr as any).book?.coverUrl || undefined,
        userId: sr.userId,
        userName: 'Student User',
        reservationDate: new Date(sr.reservedAt).toISOString(),
        queuePosition: sr.priorityOrder,
        status: sr.status === 'WAITING' ? 'PENDING' : (sr.status as any),
      }));

      StorageService.setItem(StorageService.KEYS.RESERVATIONS, mapped);
      return mapped;
    } catch {
      const cached = StorageService.getItem<Reservation[]>(StorageService.KEYS.RESERVATIONS, []);
      return cached.filter((r) => r.userId === userId && r.status !== 'CANCELLED');
    }
  },

  getUserReservations(userId: string): Reservation[] {
    const reservations = StorageService.getItem<Reservation[]>(StorageService.KEYS.RESERVATIONS, []);
    return reservations.filter((r) => r.userId === userId && r.status !== 'CANCELLED');
  },

  async borrowBook(book: Book, user: User): Promise<{ success: boolean; message: string; loan?: Loan }> {
    try {
      const bookIdentifier = book.id.startsWith('/') ? book.id : book.id.startsWith('OL') ? `/works/${book.id}` : book.id;
      const apiLoan = await apiClient.loans.borrow(bookIdentifier);

      const loanDays = ROLE_LIMITS[user.role]?.maxLoanDays || 14;
      const dueDate = apiLoan.dueDate || calculateDueDate(new Date(), loanDays);

      const newLoan: Loan = {
        id: apiLoan.id,
        bookId: (apiLoan as any).bookId || book.id,
        openLibraryKey: book.id,
        bookTitle: book.title,
        bookCoverUrl: book.coverUrl,
        bookAuthors: book.authors,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        borrowDate: new Date().toISOString(),
        dueDate,
        status: (apiLoan.status as any) || 'PENDING_PICKUP',
        renewCount: 0,
      };

      const existingLoans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
      StorageService.setItem(StorageService.KEYS.LOANS, [newLoan, ...existingLoans]);

      const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);
      const cleanBookId = book.id.replace(/^\/?works\//, '');
      const newAvailableCopies = (apiLoan as any).book?.availableCopies !== undefined
        ? (apiLoan as any).book.availableCopies
        : Math.max(0, book.availableCopies - 1);

      const updatedBooks = localBooks.map((b) => {
        const cleanBId = b.id.replace(/^\/?works\//, '');
        if (b.id === book.id || cleanBId === cleanBookId || b.title === book.title) {
          return {
            ...b,
            availableCopies: newAvailableCopies,
            availabilityStatus: newAvailableCopies > 0 ? ('AVAILABLE' as const) : ('ON_LOAN' as const),
          };
        }
        return b;
      });
      StorageService.setItem(StorageService.KEYS.BOOKS, updatedBooks);

      this.addNotification({
        userId: user.id,
        title: 'Book Requested Successfully',
        message: `You requested "${book.title}". It is ready for pickup at the Circulation Desk.`,
        type: 'SUCCESS',
        link: '/my-loans',
      });

      return {
        success: true,
        message: `Successfully requested "${book.title}". Please pick it up at the Circulation Desk.`,
        loan: newLoan,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Unable to borrow book at this moment.',
      };
    }
  },

  async returnBook(loanId: string): Promise<{ success: boolean; message: string }> {
    let returnedLoan: any = null;
    try {
      returnedLoan = await apiClient.loans.returnLoan(loanId);
    } catch {
    }

    const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
    const targetedLoan = loans.find((l) => l.id === loanId);
    const updated = loans.map((l) =>
      l.id === loanId ? { ...l, status: 'RETURNED' as const, returnDate: new Date().toISOString() } : l
    );
    StorageService.setItem(StorageService.KEYS.LOANS, updated);

    if (targetedLoan) {
      const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);
      const cleanTargetId = targetedLoan.bookId.replace(/^\/?works\//, '');
      const updatedBooks = localBooks.map((b) => {
        const cleanBId = b.id.replace(/^\/?works\//, '');
        if (b.id === targetedLoan.bookId || cleanBId === cleanTargetId || b.title === targetedLoan.bookTitle) {
          const newAvail = returnedLoan?.book?.availableCopies !== undefined
            ? returnedLoan.book.availableCopies
            : Math.min(b.totalCopies, b.availableCopies + 1);
          return {
            ...b,
            availableCopies: newAvail,
            availabilityStatus: 'AVAILABLE' as const,
          };
        }
        return b;
      });
      StorageService.setItem(StorageService.KEYS.BOOKS, updatedBooks);
    }

    return {
      success: true,
      message: 'Book was returned successfully.',
    };
  },

  async renewLoan(loanId: string): Promise<{ success: boolean; message: string; newDueDate?: string }> {
    try {
      const res = await apiClient.loans.renew(loanId);
      const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
      const updated = loans.map((l) =>
        l.id === loanId ? { ...l, dueDate: res.dueDate, renewCount: res.renewCount } : l
      );
      StorageService.setItem(StorageService.KEYS.LOANS, updated);

      return {
        success: true,
        message: `Extended loan until ${new Date(res.dueDate).toLocaleDateString()}.`,
        newDueDate: res.dueDate,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to renew loan.',
      };
    }
  },

  async reserveBook(book: Book, user: User): Promise<{ success: boolean; message: string; reservation?: Reservation }> {
    try {
      const bookIdentifier = book.id.startsWith('/') ? book.id : book.id.startsWith('OL') ? `/works/${book.id}` : book.id;
      const apiRes = await apiClient.reservations.create(bookIdentifier);

      const newReservation: Reservation = {
        id: apiRes.id,
        bookId: (apiRes as any).bookId || book.id,
        openLibraryKey: book.id,
        bookTitle: book.title,
        bookCoverUrl: book.coverUrl,
        userId: user.id,
        userName: user.name,
        reservationDate: new Date().toISOString(),
        queuePosition: apiRes.priorityOrder || 1,
        status: 'PENDING',
      };

      const reservations = StorageService.getItem<Reservation[]>(StorageService.KEYS.RESERVATIONS, []);
      StorageService.setItem(StorageService.KEYS.RESERVATIONS, [...reservations, newReservation]);

      return {
        success: true,
        message: `Reserved "${book.title}". You are #${newReservation.queuePosition} in line.`,
        reservation: newReservation,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to place reservation.',
      };
    }
  },

  async cancelReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.reservations.cancel(reservationId);
    } catch {
    }

    const reservations = StorageService.getItem<Reservation[]>(StorageService.KEYS.RESERVATIONS, []);
    const updated = reservations.map((r) =>
      r.id === reservationId ? { ...r, status: 'CANCELLED' as const } : r
    );
    StorageService.setItem(StorageService.KEYS.RESERVATIONS, updated);

    return { success: true, message: 'Reservation cancelled.' };
  },

  addNotification(notice: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): void {
    const notifications = StorageService.getItem<NotificationItem[]>(StorageService.KEYS.NOTIFICATIONS, []);
    const newNotice: NotificationItem = {
      ...notice,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    StorageService.setItem(StorageService.KEYS.NOTIFICATIONS, [newNotice, ...notifications]);
  },
};
