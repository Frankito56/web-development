import { ReservationStatus } from '../types';

export interface ReservationEntity {
  id: string;
  bookId: string;
  userId: string;
  reservedAt: Date;
  status: ReservationStatus;
  priorityOrder: number;
}
