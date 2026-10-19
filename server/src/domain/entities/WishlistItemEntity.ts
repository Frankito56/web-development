import { BookEntity } from './BookEntity';

export interface WishlistItemEntity {
  id: string;
  userId: string;
  bookId: string;
  addedAt: Date;
  notifyWhenAvailable: boolean;
  book?: BookEntity;
}
