import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IOpenLibraryFetcher } from './BookUseCases';
import { WishlistItemEntity } from '../../domain/entities/WishlistItemEntity';
import { NotFoundError } from '../../domain/errors/DomainErrors';

export class GetUserWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(userId: string): Promise<WishlistItemEntity[]> {
    return this.wishlistRepo.findByUserId(userId);
  }
}

export class AddToWishlistUseCase {
  constructor(
    private readonly wishlistRepo: IWishlistRepository,
    private readonly bookRepo: IBookRepository,
    private readonly openLibraryFetcher?: IOpenLibraryFetcher,
  ) {}

  async execute(userId: string, bookIdOrKey: string, notify?: boolean): Promise<WishlistItemEntity> {
    let book = await this.bookRepo.findById(bookIdOrKey);
    if (!book) {
      book = await this.bookRepo.findByOpenLibraryKey(bookIdOrKey);
    }

    if (!book && this.openLibraryFetcher && (bookIdOrKey.startsWith('/works/') || bookIdOrKey.startsWith('OL'))) {
      const remote = await this.openLibraryFetcher.fetchBookByWorkKey(bookIdOrKey);
      if (remote) {
        book = await this.bookRepo.create({
          openLibraryKey: bookIdOrKey,
          isbn: remote.isbn,
          title: remote.title,
          authors: remote.authors,
          publishYear: remote.publishYear,
          coverUrl: remote.coverUrl,
          description: remote.description,
          subjects: remote.subjects,
          totalCopies: 1,
          shelfLocation: 'Floor 1 - Main Desk',
        });
      }
    }

    if (!book) {
      throw new NotFoundError('Book');
    }

    return this.wishlistRepo.add(userId, book.id, notify ?? true);
  }
}

export class RemoveFromWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(userId: string, bookId: string): Promise<void> {
    await this.wishlistRepo.remove(userId, bookId);
  }
}
