import { ReservationEntity } from '../entities/ReservationEntity';
import { ReservationStatus } from '../types';

export interface CreateReservationInput {
  bookId: string;
  userId: string;
  priorityOrder: number;
}

export interface IReservationRepository {
  findById(id: string): Promise<ReservationEntity | null>;
  findByUserId(userId: string): Promise<ReservationEntity[]>;
  findActiveByBookId(bookId: string): Promise<ReservationEntity[]>;
  findActiveByUserAndBook(userId: string, bookId: string): Promise<ReservationEntity | null>;
  countActiveByBookId(bookId: string): Promise<number>;
  findAllQueue(filters?: { bookId?: string; status?: string }): Promise<ReservationEntity[]>;
  create(input: CreateReservationInput): Promise<ReservationEntity>;
  updateStatus(id: string, status: ReservationStatus): Promise<ReservationEntity>;
  updatePriority?(id: string, priorityOrder: number): Promise<void>;
  cancel(id: string): Promise<ReservationEntity>;
}
