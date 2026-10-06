/**
 * UniLib - Loan & Reservation Management Service
 * Domain logic for borrowing, returns, due dates, reservation queues, and wishlist notifications.
 */

import { Book, User, Loan, Reservation, WishlistItem, NotificationItem } from '@/types';
import { StorageService } from './storageService';
import { calculateDueDate } from '@/utils/dateUtils';
import { ROLE_LIMITS } from '@/config';

export const LoanService = {
  /**
   * Get all active loans for a user
   */
  getActiveLoans(userId: string): Loan[] {
    const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
    return loans.filter((l) => l.userId === userId && l.status === 'ACTIVE');
  },

  /**
   * Get all past loans for a user
   */
  getLoanHistory(userId: string): Loan[] {
    const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
    return loans.filter((l) => l.userId === userId && l.status === 'RETURNED');
  },

  /**
   * Get all active loans across the system (for librarian)
   */
  getAllLoans(): Loan[] {
    return StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
  },

  /**
   * Get user reservations
   */
  getUserReservations(userId: string): Reservation[] {
    const reservations = StorageService.getItem<Reservation[]>(StorageService.KEYS.RESERVATIONS, []);
    return reservations.filter((r) => r.userId === userId && r.status !== 'CANCELLED');
  },

  /**
   * Borrow a book: calculates 14-day due date, checks limits, and updates inventory
   */
  borrowBook(book: Book, user: User): { success: boolean; message: string; loan?: Loan } {
    const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
    const books = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);

    // 1. Check user borrow limit
    const activeUserLoans = loans.filter((l) => l.userId === user.id && l.status === 'ACTIVE');
    const limit = ROLE_LIMITS[user.role]?.maxLoans || 5;
    if (activeUserLoans.length >= limit) {
      return {
        success: false,
        message: `Borrowing limit reached (${activeUserLoans.length}/${limit} books). Please return a book first.`,
      };
    }

    // 2. Check if user already has an active loan of this same book
    const alreadyHasBook = activeUserLoans.some((l) => l.bookId === book.id);
    if (alreadyHasBook) {
      return {
        success: false,
        message: `You currently already have an active loan for "${book.title}".`,
      };
    }

    // 3. Check inventory
    const currentBook = books.find((b) => b.id === book.id) || book;
    if (currentBook.availableCopies <= 0 || currentBook.availabilityStatus === 'ON_LOAN') {
      return {
        success: false,
        message: `All physical copies of "${book.title}" are currently on loan. You can place a reservation instead.`,
      };
    }

    // 4. Calculate loan period
    const loanDays = ROLE_LIMITS[user.role]?.maxLoanDays || 14;
    const borrowDate = new Date().toISOString();
    const dueDate = calculateDueDate(borrowDate, loanDays);

    const newLoan: Loan = {
      id: `loan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookId: book.id,
      bookTitle: book.title,
      bookCoverUrl: book.coverUrl,
      bookAuthors: book.authors,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      borrowDate,
      dueDate,
      status: 'ACTIVE',
      renewCount: 0,
    };

    // 5. Update book availability
    const newAvailableCopies = Math.max(0, currentBook.availableCopies - 1);
    const updatedBook: Book = {
      ...currentBook,
      availableCopies: newAvailableCopies,
      availabilityStatus: newAvailableCopies === 0 ? 'ON_LOAN' : 'AVAILABLE',
    };

    // 6. Save updates
    StorageService.setItem(StorageService.KEYS.LOANS, [newLoan, ...loans]);
    const updatedBooks = books.map((b) => (b.id === book.id ? updatedBook : b));
    if (!books.some((b) => b.id === book.id)) {
      updatedBooks.push(updatedBook);
    }
    StorageService.setItem(StorageService.KEYS.BOOKS, updatedBooks);

    // 7. Add notification
    this.addNotification({
      userId: user.id,
      title: 'Book Borrowed Successfully',
      message: `You borrowed "${book.title}". Due date is in ${loanDays} days (${new Date(dueDate).toLocaleDateString()}).`,
      type: 'SUCCESS',
      link: '/my-loans',
    });

    return {
      success: true,
      message: `Successfully borrowed "${book.title}". Due date: ${new Date(dueDate).toLocaleDateString()}.`,
      loan: newLoan,
    };
  },

  /**
   * Return a book: restores copy, checks reservations queue and triggers wishlist notifications
   */
  returnBook(loanId: string): { success: boolean; message: string } {
    const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
    const books = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);
    const reservations = StorageService.getItem<Reservation[]>(StorageService.KEYS.RESERVATIONS, []);
    const wishlist = StorageService.getItem<WishlistItem[]>(StorageService.KEYS.WISHLIST, []);

    const targetLoanIndex = loans.findIndex((l) => l.id === loanId);
    if (targetLoanIndex === -1) {
      return { success: false, message: 'Loan record not found.' };
    }

    const loan = loans[targetLoanIndex];
    if (loan.status === 'RETURNED') {
      return { success: false, message: 'This book has already been returned.' };
    }

    // 1. Mark loan as RETURNED
    const updatedLoan: Loan = {
      ...loan,
      status: 'RETURNED',
      returnDate: new Date().toISOString(),
    };
    loans[targetLoanIndex] = updatedLoan;
    StorageService.setItem(StorageService.KEYS.LOANS, loans);

    // 2. Update Book inventory
    const bookIndex = books.findIndex((b) => b.id === loan.bookId);
    if (bookIndex !== -1) {
      const book = books[bookIndex];
      const newAvailableCopies = book.availableCopies + 1;

      // 3. Check for queued reservations
      const pendingReservations = reservations
        .filter((r) => r.bookId === book.id && r.status === 'PENDING')
        .sort((a, b) => a.queuePosition - b.queuePosition);

      if (pendingReservations.length > 0) {
        // Assign to first student in reservation queue
        const nextInQueue = pendingReservations[0];
        nextInQueue.status = 'READY_FOR_PICKUP';
        nextInQueue.pickupDeadline = calculateDueDate(new Date(), 3); // 3 days to pick up

        // Update reservations
        StorageService.setItem(StorageService.KEYS.RESERVATIONS, reservations);

        // Notify the student who reserved
        this.addNotification({
          userId: nextInQueue.userId,
          title: 'Reserved Book Ready for Pickup!',
          message: `"${book.title}" is now available at the central circulation desk. Please pick it up within 3 days.`,
          type: 'INFO',
          link: '/my-loans',
        });

        books[bookIndex] = {
          ...book,
          availableCopies: newAvailableCopies,
          availabilityStatus: 'RESERVED',
        };
      } else {
        books[bookIndex] = {
          ...book,
          availableCopies: newAvailableCopies,
          availabilityStatus: 'AVAILABLE',
        };

        // 4. Trigger Wishlist notifications for users who wished for this book!
        const interestedUsers = wishlist.filter(
          (w) => w.bookId === book.id && w.notifyWhenAvailable
        );
        interestedUsers.forEach((w) => {
          this.addNotification({
            userId: w.userId,
            title: 'Wishlist Book is Now Available!',
            message: `Good news! "${book.title}" from your wishlist is now back in stock and ready to borrow.`,
            type: 'SUCCESS',
            link: `/books/${book.id}`,
          });
        });
      }

      StorageService.setItem(StorageService.KEYS.BOOKS, books);
    }

    // 5. Notify the returning user
    this.addNotification({
      userId: loan.userId,
      title: 'Book Returned',
      message: `"${loan.bookTitle}" has been returned and added to your loan history.`,
      type: 'SUCCESS',
      link: '/my-loans',
    });

    return {
      success: true,
      message: `"${loan.bookTitle}" was returned successfully.`,
    };
  },

  /**
   * Place a reservation on an unavailable book
   */
  reserveBook(book: Book, user: User): { success: boolean; message: string; reservation?: Reservation } {
    const reservations = StorageService.getItem<Reservation[]>(StorageService.KEYS.RESERVATIONS, []);
    
    // Check if user already has an active reservation
    const existing = reservations.find(
      (r) => r.bookId === book.id && r.userId === user.id && r.status === 'PENDING'
    );
    if (existing) {
      return {
        success: false,
        message: `You are already in queue (Position #${existing.queuePosition}) for "${book.title}".`,
      };
    }

    const currentBookReservations = reservations.filter(
      (r) => r.bookId === book.id && r.status === 'PENDING'
    );
    const queuePosition = currentBookReservations.length + 1;

    const newReservation: Reservation = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookId: book.id,
      bookTitle: book.title,
      bookCoverUrl: book.coverUrl,
      userId: user.id,
      userName: user.name,
      reservationDate: new Date().toISOString(),
      queuePosition,
      status: 'PENDING',
    };

    StorageService.setItem(StorageService.KEYS.RESERVATIONS, [...reservations, newReservation]);

    this.addNotification({
      userId: user.id,
      title: 'Reservation Confirmed',
      message: `You are in position #${queuePosition} for "${book.title}". We will notify you when a copy is returned.`,
      type: 'INFO',
      link: '/my-loans',
    });

    return {
      success: true,
      message: `Reserved "${book.title}". You are #${queuePosition} in line.`,
      reservation: newReservation,
    };
  },

  /**
   * Cancel an active reservation
   */
  cancelReservation(reservationId: string): { success: boolean; message: string } {
    const reservations = StorageService.getItem<Reservation[]>(StorageService.KEYS.RESERVATIONS, []);
    const updated = reservations.map((r) =>
      r.id === reservationId ? { ...r, status: 'CANCELLED' as const } : r
    );
    StorageService.setItem(StorageService.KEYS.RESERVATIONS, updated);
    return { success: true, message: 'Reservation cancelled.' };
  },

  /**
   * Renew an active loan
   */
  renewLoan(loanId: string): { success: boolean; message: string; newDueDate?: string } {
    const loans = StorageService.getItem<Loan[]>(StorageService.KEYS.LOANS, []);
    const loanIndex = loans.findIndex((l) => l.id === loanId);
    if (loanIndex === -1) return { success: false, message: 'Loan not found.' };

    const loan = loans[loanIndex];
    if (loan.renewCount >= 2) {
      return { success: false, message: 'Maximum renewal limit (2 times) reached for this loan.' };
    }

    const newDueDate = calculateDueDate(loan.dueDate, 14);
    loans[loanIndex] = {
      ...loan,
      dueDate: newDueDate,
      renewCount: loan.renewCount + 1,
    };

    StorageService.setItem(StorageService.KEYS.LOANS, loans);

    this.addNotification({
      userId: loan.userId,
      title: 'Loan Extended',
      message: `Due date for "${loan.bookTitle}" has been extended by 14 days until ${new Date(newDueDate).toLocaleDateString()}.`,
      type: 'SUCCESS',
      link: '/my-loans',
    });

    return {
      success: true,
      message: `Extended loan until ${new Date(newDueDate).toLocaleDateString()}.`,
      newDueDate,
    };
  },

  /**
   * Helper to dispatch in-app notifications
   */
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
