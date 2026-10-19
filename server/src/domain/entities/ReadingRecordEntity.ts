import { ReadingStatus } from '../types';
import { BookEntity } from './BookEntity';

export interface ReadingRecordEntity {
  id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  progressPercentage: number;
  notes?: string;
  updatedAt: Date;
  book?: BookEntity;
}
