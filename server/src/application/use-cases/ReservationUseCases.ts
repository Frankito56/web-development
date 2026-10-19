import { IReservationRepository } from '../../domain/repositories/IReservationRepository';
import { ILoanRepository } from '../../domain/repositories/ILoanRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IOpenLibraryFetcher } from './BookUseCases';
import { ReservationEntity } from '../../domain/entities/ReservationEntity';
import {
  AlreadyReservedError,
  AlreadyBorrowedError,
  NotFoundError,
  ReservationNotReadyError,
} from '../../domain/errors/DomainErrors';
import { LoanEntity } from '../../domain/entities/LoanEntity';

const LOAN_DAYS = 14;

export class GetUserReservationsUseCase {
  constructor(private readonly reservationRepo: IReservationRepository) {}

  async execute(userId: string): Promise<ReservationEntity[]> {
    return this.reservationRepo.findByUserId(userId);
  }
}

export class CreateReservationUseCase {
  constructor(
    private readonly reservationRepo: IReservationRepository,
    private readonly loanRepo: ILoanRepository,
    private readonly bookRepo: IBookRepository,
    private readonly openLibraryFetcher?: IOpenLibraryFetcher,
  ) {}

  async execute(userId: string, bookIdOrKey: string): Promise<ReservationEntity> {
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
          totalCopies: 1,
          shelfLocation: 'Floor 1 - Main Desk',
        });
      }
    }

    if (!book) {
      throw new NotFoundError('Book');
    }

    const existingLoan = await this.loanRepo.findActiveByUserAndBook(userId, book.id);
    if (existingLoan) {
      throw new AlreadyBorrowedError();
    }

    const existingReservation = await this.reservationRepo.findActiveByUserAndBook(userId, book.id);
    if (existingReservation) {
      throw new AlreadyReservedError();
    }

    const queueLength = await this.reservationRepo.countActiveByBookId(book.id);

    return this.reservationRepo.create({
      bookId: book.id,
      userId,
      priorityOrder: queueLength + 1,
    });
  }
}

export class CancelReservationUseCase {
  constructor(private readonly reservationRepo: IReservationRepository) {}

  async execute(reservationId: string, userId: string): Promise<ReservationEntity> {
    const reservation = await this.reservationRepo.findById(reservationId);
    if (!reservation || reservation.userId !== userId) {
      throw new NotFoundError('Reservation');
    }

    return this.reservationRepo.cancel(reservationId);
  }
}

export class FulfillReservationUseCase {
  constructor(
    private readonly reservationRepo: IReservationRepository,
    private readonly loanRepo: ILoanRepository,
    private readonly bookRepo: IBookRepository,
  ) {}

  async execute(reservationId: string): Promise<LoanEntity> {
    const reservation = await this.reservationRepo.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError('Reservation');
    }
    if (reservation.status !== 'READY_FOR_PICKUP') {
      throw new ReservationNotReadyError();
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_DAYS);

    const loan = await this.loanRepo.create({
      bookId: reservation.bookId,
      userId: reservation.userId,
      dueDate,
    });

    await this.reservationRepo.updateStatus(reservationId, 'FULFILLED');
    await this.bookRepo.decrementAvailable(reservation.bookId);

    return loan;
  }
}
