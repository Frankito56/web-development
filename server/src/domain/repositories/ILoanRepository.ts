import { LoanEntity } from '../entities/LoanEntity';

export interface CreateLoanInput {
  bookId: string;
  userId: string;
  dueDate: Date;
  notes?: string;
}

export interface ILoanRepository {
  findById(id: string): Promise<LoanEntity | null>;
  findByUserId(userId: string): Promise<LoanEntity[]>;
  findActiveByBookId(bookId: string): Promise<LoanEntity[]>;
  findActiveByUserAndBook(userId: string, bookId: string): Promise<LoanEntity | null>;
  findOverdue(): Promise<LoanEntity[]>;
  create(input: CreateLoanInput): Promise<LoanEntity>;
  returnBook(loanId: string, returnDate: Date): Promise<LoanEntity>;
  renew(loanId: string, newDueDate: Date): Promise<LoanEntity>;
}
