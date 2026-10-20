import { ILoanRepository } from '../../domain/repositories/ILoanRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IReservationRepository } from '../../domain/repositories/IReservationRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IOpenLibraryFetcher } from './BookUseCases';
import { LoanEntity } from '../../domain/entities/LoanEntity';
import {
  BookNotAvailableError,
  AlreadyBorrowedError,
  NotFoundError,
  LoanNotActiveError,
  MaxRenewalsReachedError,
  MaxLoansReachedError,
  ForbiddenError,
} from '../../domain/errors/DomainErrors';

/** Maximum simultaneous active loans by role */
const MAX_LOANS_BY_ROLE: Record<string, number> = {
  STUDENT: 5,
  PROFESSOR: 15,
  LIBRARIAN: 25,
};

/** Statuses that count toward the active-loan quota */
const ACTIVE_STATUSES = new Set(['PENDING_PICKUP', 'DELIVERED', 'OVERDUE']);

const LOAN_DAYS = 14;
const MAX_RENEWALS = 2;

export class GetUserLoansUseCase {
  constructor(private readonly loanRepo: ILoanRepository) { }

  async execute(userId: string): Promise<LoanEntity[]> {
    return this.loanRepo.findByUserId(userId);
  }
}

export class BorrowBookUseCase {
  constructor(
    private readonly loanRepo: ILoanRepository,
    private readonly bookRepo: IBookRepository,
    private readonly userRepo: IUserRepository,
    private readonly openLibraryFetcher?: IOpenLibraryFetcher,
  ) { }

  async execute(userId: string, bookIdOrKey: string): Promise<LoanEntity> {
    const cleanKey = bookIdOrKey.replace(/^\/?works\//, '');
    let book = await this.bookRepo.findById(bookIdOrKey);
    if (!book) {
      book = await this.bookRepo.findByOpenLibraryKey(cleanKey);
    }

    if (!book && this.openLibraryFetcher && (cleanKey.startsWith('OL') || bookIdOrKey.startsWith('/works/'))) {
      const remote = await this.openLibraryFetcher.fetchBookByWorkKey(cleanKey);
      if (remote) {
        book = await this.bookRepo.create({
          openLibraryKey: cleanKey,
          isbn: remote.isbn,
          title: remote.title,
          authors: remote.authors,
          publishYear: remote.publishYear,
          coverUrl: remote.coverUrl,
          description: remote.description,
          subjects: remote.subjects,
          totalCopies: 8,
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

    const user = await this.userRepo.findById(userId);
    const maxLoans = MAX_LOANS_BY_ROLE[user?.role ?? 'STUDENT'] ?? 5;
    const userLoans = await this.loanRepo.findByUserId(userId);
    const activeCount = userLoans.filter((l) => ACTIVE_STATUSES.has(l.status)).length;
    if (activeCount >= maxLoans) {
      throw new MaxLoansReachedError(maxLoans);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_DAYS);

    const loan = await this.loanRepo.create({
      bookId: book.id,
      userId,
      dueDate,
      status: 'PENDING_PICKUP',
    });
    await this.bookRepo.decrementAvailable(book.id);

    const updatedBook = await this.bookRepo.findById(book.id);
    if (updatedBook) {
      loan.book = updatedBook;
    }

    return loan;
  }
}

export class ReturnBookUseCase {
  constructor(
    private readonly loanRepo: ILoanRepository,
    private readonly bookRepo: IBookRepository,
    private readonly reservationRepo?: IReservationRepository,
  ) { }

  async execute(loanId: string, userId?: string, userRole?: string): Promise<LoanEntity> {
    const loan = await this.loanRepo.findById(loanId);
    if (!loan) {
      throw new NotFoundError('Loan');
    }
    if (userId && userRole !== 'LIBRARIAN' && loan.userId !== userId) {
      throw new ForbiddenError('You can only return your own loans.');
    }
    if (loan.status !== 'ACTIVE' && loan.status !== 'OVERDUE' && loan.status !== 'DELIVERED') {
      throw new LoanNotActiveError();
    }

    const returned = await this.loanRepo.returnBook(loanId, new Date());

    if (this.reservationRepo) {
      const activeReservations = await this.reservationRepo.findActiveByBookId(loan.bookId);
      if (activeReservations.length > 0) {
        const nextReservation = activeReservations[0];
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + LOAN_DAYS);

        await this.loanRepo.create({
          bookId: nextReservation.bookId,
          userId: nextReservation.userId,
          dueDate: nextDueDate,
          status: 'PENDING_PICKUP',
        });

        await this.reservationRepo.updateStatus(nextReservation.id, 'FULFILLED');

        for (let i = 1; i < activeReservations.length; i++) {
          if (this.reservationRepo.updatePriority) {
            await this.reservationRepo.updatePriority(activeReservations[i].id, i);
          }
        }

        const updatedBook = await this.bookRepo.findById(loan.bookId);
        if (updatedBook) {
          returned.book = updatedBook;
        }

        return returned;
      }
    }

    await this.bookRepo.incrementAvailable(loan.bookId);

    const updatedBook = await this.bookRepo.findById(loan.bookId);
    if (updatedBook) {
      returned.book = updatedBook;
    }

    return returned;
  }
}

export class RenewLoanUseCase {
  constructor(private readonly loanRepo: ILoanRepository) { }

  async execute(loanId: string, userId: string, userRole?: string): Promise<LoanEntity> {
    const loan = await this.loanRepo.findById(loanId);
    if (!loan) {
      throw new NotFoundError('Loan');
    }
    if (userId && userRole !== 'LIBRARIAN' && loan.userId !== userId) {
      throw new NotFoundError('Loan');
    }
    if (loan.status !== 'ACTIVE' && loan.status !== 'DELIVERED') {
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

export class GetCirculationLoansUseCase {
  constructor(private readonly loanRepo: ILoanRepository) { }

  async execute(filters?: { status?: string; overdueOnly?: boolean; userId?: string }): Promise<LoanEntity[]> {
    return this.loanRepo.findCirculation(filters);
  }
}

export class GetOverdueLoansUseCase {
  constructor(private readonly loanRepo: ILoanRepository) { }

  async execute(): Promise<LoanEntity[]> {
    return this.loanRepo.findOverdue();
  }
}

export class DeliverLoanUseCase {
  constructor(private readonly loanRepo: ILoanRepository) { }

  async execute(loanId: string): Promise<LoanEntity> {
    const loan = await this.loanRepo.findById(loanId);
    if (!loan) {
      throw new NotFoundError('Loan');
    }
    if (loan.status !== 'PENDING_PICKUP' && loan.status !== 'ACTIVE') {
      throw new LoanNotActiveError();
    }

    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + LOAN_DAYS);

    return this.loanRepo.deliver(loanId, newDueDate);
  }
}
