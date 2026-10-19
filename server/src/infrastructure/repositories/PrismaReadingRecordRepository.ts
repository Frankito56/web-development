import { PrismaClient } from '@prisma/client';
import {
  IReadingRecordRepository,
  UpsertReadingRecordInput,
} from '../../domain/repositories/IReadingRecordRepository';
import { ReadingRecordEntity } from '../../domain/entities/ReadingRecordEntity';
import { ReadingStatus } from '../../domain/types';

export class PrismaReadingRecordRepository implements IReadingRecordRepository {
  constructor(private readonly prisma: PrismaClient) { }

  private toEntity(record: {
    id: string;
    userId: string;
    bookId: string;
    status: string;
    progressPercentage: number;
    notes: string | null;
    updatedAt: Date;
  }): ReadingRecordEntity {
    return {
      id: record.id,
      userId: record.userId,
      bookId: record.bookId,
      status: record.status as ReadingStatus,
      progressPercentage: record.progressPercentage,
      notes: record.notes ?? undefined,
      updatedAt: record.updatedAt,
    };
  }

  async findByUserId(userId: string): Promise<ReadingRecordEntity[]> {
    const records = await this.prisma.readingRecord.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { book: true },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<ReadingRecordEntity | null> {
    const record = await this.prisma.readingRecord.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async upsert(input: UpsertReadingRecordInput): Promise<ReadingRecordEntity> {
    const record = await this.prisma.readingRecord.upsert({
      where: {
        userId_bookId: { userId: input.userId, bookId: input.bookId },
      },
      update: {
        status: input.status,
        progressPercentage: input.progressPercentage ?? 0,
        notes: input.notes,
      },
      create: {
        userId: input.userId,
        bookId: input.bookId,
        status: input.status,
        progressPercentage: input.progressPercentage ?? 0,
        notes: input.notes,
      },
    });
    return this.toEntity(record);
  }

  async delete(userId: string, bookId: string): Promise<void> {
    await this.prisma.readingRecord.deleteMany({
      where: { userId, bookId },
    });
  }
}
