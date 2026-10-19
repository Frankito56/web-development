import { WishlistItemEntity } from '../entities/WishlistItemEntity';

export interface IWishlistRepository {
  findByUserId(userId: string): Promise<WishlistItemEntity[]>;
  findByUserAndBook(userId: string, bookId: string): Promise<WishlistItemEntity | null>;
  add(userId: string, bookId: string, notify?: boolean): Promise<WishlistItemEntity>;
  remove(userId: string, bookId: string): Promise<void>;
}
