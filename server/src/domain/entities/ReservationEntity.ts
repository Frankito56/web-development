import { ReservationStatus } from '../types';
import { BookEntity } from './BookEntity';
import { UserPublic } from './UserEntity';

export interface ReservationEntity {
  id: string;
  bookId: string;
  userId: string;
  reservedAt: Date;
  status: ReservationStatus;
  priorityOrder: number;
  book?: BookEntity;
  user?: UserPublic;
}
