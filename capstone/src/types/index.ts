/**
 * UniLib - Core Domain Type Definitions
 */

export type UserRole = 'STUDENT' | 'PROFESSOR' | 'LIBRARIAN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentOrEmployeeId: string;
  department: string;
  avatarUrl: string;
  maxBorrowLimit: number;
  joinedDate: string;
}

export type BookAvailabilityStatus = 'AVAILABLE' | 'ON_LOAN' | 'RESERVED';

export interface Book {
  id: string; // OpenLibrary work ID or ISBN/key
  title: string;
  authors: string[];
  coverUrl?: string;
  firstPublishYear?: number;
  subjects: string[];
  description?: string;
  isbn?: string;
  publisher?: string;
  pageCount?: number;
  averageRating?: number;
  ratingsCount?: number;
  availabilityStatus: BookAvailabilityStatus;
  totalCopies: number;
  availableCopies: number;
  locationShelf?: string;
}

export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string;
  bookAuthors: string[];
  userId: string;
  userName: string;
  userRole: UserRole;
  borrowDate: string; // ISO date string
  dueDate: string; // ISO date string
  returnDate?: string | null; // ISO date string
  status: LoanStatus;
  renewCount: number;
}

export type ReservationStatus = 'PENDING' | 'READY_FOR_PICKUP' | 'FULFILLED' | 'CANCELLED';

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string;
  userId: string;
  userName: string;
  reservationDate: string; // ISO date string
  queuePosition: number;
  status: ReservationStatus;
  pickupDeadline?: string;
}

export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED';

export interface ReadingProgressItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string;
  bookAuthors: string[];
  userId: string;
  status: ReadingStatus;
  progressPercentage: number;
  rating?: number;
  notes?: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string;
  bookAuthors: string[];
  userId: string;
  addedAt: string;
  notifyWhenAvailable: boolean;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
}

export type SortOption =
  | 'relevance'
  | 'title_asc'
  | 'title_desc'
  | 'year_desc'
  | 'year_asc'
  | 'rating_desc';

export interface BookFiltersState {
  searchQuery: string;
  category: string;
  sortBy: SortOption;
  availability: 'ALL' | 'AVAILABLE' | 'ON_LOAN';
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
