import { LoanEntity } from '../entities/LoanEntity';
import { LoanStatus } from '../types';

export interface CreateLoanInput {
  bookId: string;
  userId: string;
  dueDate: Date;
  status?: LoanStatus;
  notes?: string;
}

export interface ILoanRepository {
  findById(id: string): Promise<LoanEntity | null>;
  findByUserId(userId: string): Promise<LoanEntity[]>;
  findActiveByBookId(bookId: string): Promise<LoanEntity[]>;
  findActiveByUserAndBook(userId: string, bookId: string): Promise<LoanEntity | null>;
  findOverdue(): Promise<LoanEntity[]>;
  findCirculation(filters?: { status?: string; overdueOnly?: boolean; userId?: string }): Promise<LoanEntity[]>;
  create(input: CreateLoanInput): Promise<LoanEntity>;
  deliver(loanId: string, newDueDate: Date): Promise<LoanEntity>;
  returnBook(loanId: string, returnDate: Date): Promise<LoanEntity>;
  renew(loanId: string, newDueDate: Date): Promise<LoanEntity>;
}
