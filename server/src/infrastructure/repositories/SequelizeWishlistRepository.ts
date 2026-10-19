import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';
import { WishlistItemEntity } from '../../domain/entities/WishlistItemEntity';
import { WishlistItemModel, BookModel } from '../database/models';

export class SequelizeWishlistRepository implements IWishlistRepository {
  private toEntity(record: WishlistItemModel): WishlistItemEntity {
    return {
      id: record.id,
      userId: record.userId,
      bookId: record.bookId,
      addedAt: record.addedAt,
      notifyWhenAvailable: record.notifyWhenAvailable,
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
