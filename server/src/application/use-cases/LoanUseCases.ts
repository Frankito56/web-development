import { ILoanRepository } from '../../domain/repositories/ILoanRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IOpenLibraryFetcher } from './BookUseCases';
import { LoanEntity } from '../../domain/entities/LoanEntity';
import {
  BookNotAvailableError,
  AlreadyBorrowedError,
  NotFoundError,
  LoanNotActiveError,
  MaxRenewalsReachedError,
  ForbiddenError,
} from '../../domain/errors/DomainErrors';

const LOAN_DAYS = 14;
const MAX_RENEWALS = 2;

export class GetUserLoansUseCase {
  constructor(private readonly loanRepo: ILoanRepository) {}

  async execute(userId: string): Promise<LoanEntity[]> {
    return this.loanRepo.findByUserId(userId);
  }
}

export class BorrowBookUseCase {
  constructor(
    private readonly loanRepo: ILoanRepository,
    private readonly bookRepo: IBookRepository,
    private readonly openLibraryFetcher?: IOpenLibraryFetcher,
  ) {}

  async execute(userId: string, bookIdOrKey: string): Promise<LoanEntity> {
    let book = await this.bookRepo.findById(bookIdOrKey);
    if (!book) {
      book = await this.bookRepo.findByOpenLibraryKey(bookIdOrKey);
    }

    if (!book && this.openLibraryFetcher && (bookIdOrKey.startsWith('/works/') || bookIdOrKey.startsWith('OL'))) {
      const remote = await this.openLibraryFetcher.fetchBookByWorkKey(bookIdOrKey);
      if (remote) {
        book = await this.bookRepo.create({
          openLibraryKey: bookIdOrKey,
          isbn: remote.isbn,
          title: remote.title,
          authors: remote.authors,
          publishYear: remote.publishYear,
          coverUrl: remote.coverUrl,
          description: remote.description,
          subjects: remote.subjects,
          totalCopies: 2,
          shelfLocation: 'Floor 1 - Main Desk',
        });
      }
    }

    if (!book) {
      throw new NotFoundError('Book');
    }

    if (book.availableCopies <= 0) {
      throw new BookNotAvailableError();
    }

    const existing = await this.loanRepo.findActiveByUserAndBook(userId, book.id);
    if (existing) {
      throw new AlreadyBorrowedError();
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_DAYS);

    const loan = await this.loanRepo.create({ bookId: book.id, userId, dueDate });
    await this.bookRepo.decrementAvailable(book.id);

    return loan;
  }
}

export class ReturnBookUseCase {
  constructor(
    private readonly loanRepo: ILoanRepository,
    private readonly bookRepo: IBookRepository,
  ) {}

  async execute(loanId: string, userId?: string, userRole?: string): Promise<LoanEntity> {
    const loan = await this.loanRepo.findById(loanId);
    if (!loan) {
      throw new NotFoundError('Loan');
    }
    if (userId && userRole !== 'LIBRARIAN' && loan.userId !== userId) {
      throw new ForbiddenError('You can only return your own loans.');
    }
    if (loan.status !== 'ACTIVE' && loan.status !== 'OVERDUE') {
      throw new LoanNotActiveError();
    }

    const returned = await this.loanRepo.returnBook(loanId, new Date());
    await this.bookRepo.incrementAvailable(loan.bookId);

    return returned;
  }
}

export class RenewLoanUseCase {
  constructor(private readonly loanRepo: ILoanRepository) {}

  async execute(loanId: string, userId: string): Promise<LoanEntity> {
    const loan = await this.loanRepo.findById(loanId);
    if (!loan) {
      throw new NotFoundError('Loan');
    }
    if (loan.userId !== userId) {
      throw new NotFoundError('Loan');
    }
    if (loan.status !== 'ACTIVE') {
      throw new LoanNotActiveError();
    }
    if (loan.renewCount >= MAX_RENEWALS) {
      throw new MaxRenewalsReachedError();
    }

    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + LOAN_DAYS);

    return this.loanRepo.renew(loanId, newDueDate);
  }
}
