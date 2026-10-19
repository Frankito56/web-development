import { LoanStatus } from '../types';

export interface LoanEntity {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  renewCount: number;
  status: LoanStatus;
  notes?: string;
}
