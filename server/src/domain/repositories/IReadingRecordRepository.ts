import { ReadingRecordEntity } from '../entities/ReadingRecordEntity';
import { ReadingStatus } from '../types';

export interface UpsertReadingRecordInput {
  userId: string;
  bookId: string;
  status: ReadingStatus;
  progressPercentage?: number;
  notes?: string;
}

export interface IReadingRecordRepository {
  findByUserId(userId: string): Promise<ReadingRecordEntity[]>;
  findByUserAndBook(userId: string, bookId: string): Promise<ReadingRecordEntity | null>;
  upsert(input: UpsertReadingRecordInput): Promise<ReadingRecordEntity>;
  delete(userId: string, bookId: string): Promise<void>;
}
