import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';
import { WishlistItemEntity } from '../../domain/entities/WishlistItemEntity';
import { BookEntity } from '../../domain/entities/BookEntity';
import { AvailabilityStatus } from '../../domain/types';
import { WishlistItemModel, BookModel } from '../database/models';

export class SequelizeWishlistRepository implements IWishlistRepository {
  private bookToEntity(record: BookModel): BookEntity {
    let parsedAuthors: string[] = [];
    try {
      parsedAuthors = JSON.parse(record.authors);
    } catch {
      parsedAuthors = [record.authors];
    }

    let parsedSubjects: string[] = [];
    try {
      parsedSubjects = JSON.parse(record.subjects);
    } catch {
      parsedSubjects = [];
    }

    return {
      id: record.id,
      openLibraryKey: record.openLibraryKey ?? undefined,
      isbn: record.isbn ?? undefined,
      title: record.title,
      authors: parsedAuthors,
      publishYear: record.publishYear ?? undefined,
      coverUrl: record.coverUrl ?? undefined,
      description: record.description ?? undefined,
      subjects: parsedSubjects,
      totalCopies: record.totalCopies,
      availableCopies: record.availableCopies,
      shelfLocation: record.shelfLocation,
      availabilityStatus: record.availabilityStatus as AvailabilityStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toEntity(record: WishlistItemModel): WishlistItemEntity {
    return {
      id: record.id,
      userId: record.userId,
      bookId: record.bookId,
      addedAt: record.addedAt,
      notifyWhenAvailable: record.notifyWhenAvailable,
      book: record.book ? this.bookToEntity(record.book as BookModel) : undefined,
    };
  }

  async findByUserId(userId: string): Promise<WishlistItemEntity[]> {
    const records = await WishlistItemModel.findAll({
      where: { userId },
      order: [['addedAt', 'DESC']],
      include: [{ model: BookModel, as: 'book' }],
    });
    return records.map((r) => this.toEntity(r));
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<WishlistItemEntity | null> {
    const record = await WishlistItemModel.findOne({
      where: { userId, bookId },
    });
    return record ? this.toEntity(record) : null;
  }

  async add(userId: string, bookId: string, notify = true): Promise<WishlistItemEntity> {
    const existing = await WishlistItemModel.findOne({
      where: { userId, bookId },
    });

    if (existing) {
      existing.notifyWhenAvailable = notify;
      await existing.save();
      return this.toEntity(existing);
    }

    const created = await WishlistItemModel.create({
      userId,
      bookId,
      notifyWhenAvailable: notify,
    });
    return this.toEntity(created);
  }

  async remove(userId: string, bookId: string): Promise<void> {
    await WishlistItemModel.destroy({
      where: { userId, bookId },
    });
  }
}
