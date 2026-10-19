import { ReadingStatus } from '../types';

export interface ReadingRecordEntity {
  id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  progressPercentage: number;
  notes?: string;
  updatedAt: Date;
}
