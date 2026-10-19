import { ReservationStatus } from '../types';
import { BookEntity } from './BookEntity';

export interface ReservationEntity {
  id: string;
  bookId: string;
  userId: string;
  reservedAt: Date;
  status: ReservationStatus;
  priorityOrder: number;
  book?: BookEntity;
}
