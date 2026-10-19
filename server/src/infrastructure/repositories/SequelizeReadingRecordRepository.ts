import {
  IReadingRecordRepository,
  UpsertReadingRecordInput,
} from '../../domain/repositories/IReadingRecordRepository';
import { ReadingRecordEntity } from '../../domain/entities/ReadingRecordEntity';
import { ReadingStatus } from '../../domain/types';
import { ReadingRecordModel, BookModel } from '../database/models';

export class SequelizeReadingRecordRepository implements IReadingRecordRepository {
  private toEntity(record: ReadingRecordModel): ReadingRecordEntity {
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
    const records = await ReadingRecordModel.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      include: [{ model: BookModel, as: 'book' }],
    });
    return records.map((r) => this.toEntity(r));
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<ReadingRecordEntity | null> {
    const record = await ReadingRecordModel.findOne({
      where: { userId, bookId },
    });
    return record ? this.toEntity(record) : null;
  }

  async upsert(input: UpsertReadingRecordInput): Promise<ReadingRecordEntity> {
    const existing = await ReadingRecordModel.findOne({
      where: { userId: input.userId, bookId: input.bookId },
    });

    if (existing) {
      existing.status = input.status;
      existing.progressPercentage = input.progressPercentage ?? 0;
      existing.notes = input.notes ?? null;
      await existing.save();
      return this.toEntity(existing);
    }

    const created = await ReadingRecordModel.create({
      userId: input.userId,
      bookId: input.bookId,
      status: input.status,
      progressPercentage: input.progressPercentage ?? 0,
      notes: input.notes,
    });
    return this.toEntity(created);
  }

  async delete(userId: string, bookId: string): Promise<void> {
    await ReadingRecordModel.destroy({
      where: { userId, bookId },
    });
  }
}
