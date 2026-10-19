import { UserRole } from '../../domain/types';

export interface RegisterUserDTO {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  studentOrEmployeeId: string;
  department: string;
  avatarUrl?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    studentOrEmployeeId: string;
    department: string;
    avatarUrl?: string;
  };
}

export interface ImportBookDTO {
  openLibraryKey: string;
  totalCopies?: number;
  shelfLocation?: string;
}

export interface UpdateBookInventoryDTO {
  totalCopies?: number;
  shelfLocation?: string;
}

export interface BorrowBookDTO {
  bookId: string;
  userId?: string;
}

export interface ReturnBookDTO {
  loanId: string;
}

export interface RenewLoanDTO {
  loanId: string;
}

export interface CreateReservationDTO {
  bookId: string;
  userId?: string;
}

export interface FulfillReservationDTO {
  reservationId: string;
}

export interface UpsertReadingRecordDTO {
  bookId: string;
  status: 'WANT_TO_READ' | 'READING' | 'COMPLETED';
  progressPercentage?: number;
  notes?: string;
}

export interface AddToWishlistDTO {
  bookId: string;
  notifyWhenAvailable?: boolean;
}
