import { PrismaClient } from '@prisma/client';
import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';
import { WishlistItemEntity } from '../../domain/entities/WishlistItemEntity';

export class PrismaWishlistRepository implements IWishlistRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: {
    id: string;
    userId: string;
    bookId: string;
    addedAt: Date;
    notifyWhenAvailable: boolean;
  }): WishlistItemEntity {
    return {
      id: record.id,
      userId: record.userId,
      bookId: record.bookId,
      addedAt: record.addedAt,
      notifyWhenAvailable: record.notifyWhenAvailable,
    };
  }

  async findByUserId(userId: string): Promise<WishlistItemEntity[]> {
    const records = await this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
      include: { book: true },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<WishlistItemEntity | null> {
    const record = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async add(userId: string, bookId: string, notify = true): Promise<WishlistItemEntity> {
    const record = await this.prisma.wishlistItem.upsert({
      where: {
        userId_bookId: { userId, bookId },
      },
      update: {
        notifyWhenAvailable: notify,
      },
      create: {
        userId,
        bookId,
        notifyWhenAvailable: notify,
      },
    });
    return this.toEntity(record);
  }

  async remove(userId: string, bookId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({
      where: { userId, bookId },
    });
  }
}
