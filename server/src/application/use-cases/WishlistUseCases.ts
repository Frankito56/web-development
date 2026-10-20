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
    const cleanKey = bookIdOrKey.replace(/^\/?works\//, '');
    let book = await this.bookRepo.findById(bookIdOrKey);
    if (!book) {
      book = await this.bookRepo.findByOpenLibraryKey(cleanKey);
    }

    if (!book && this.openLibraryFetcher && (cleanKey.startsWith('OL') || bookIdOrKey.startsWith('/works/'))) {
      const remote = await this.openLibraryFetcher.fetchBookByWorkKey(cleanKey);
      if (remote) {
        book = await this.bookRepo.create({
          openLibraryKey: cleanKey,
          isbn: remote.isbn,
          title: remote.title,
          authors: remote.authors,
          publishYear: remote.publishYear,
          coverUrl: remote.coverUrl,
          description: remote.description,
          subjects: remote.subjects,
          totalCopies: 8,
          shelfLocation: 'Floor 1 - Main Desk',
        });
      }
    }

    if (!book) {
      throw new NotFoundError('Book');
    }

    const entity = await this.wishlistRepo.add(userId, book.id, notify ?? true);
    entity.book = book;
    return entity;
  }
}

export class RemoveFromWishlistUseCase {
  constructor(
    private readonly wishlistRepo: IWishlistRepository,
    private readonly bookRepo?: IBookRepository,
  ) {}

  async execute(userId: string, bookId: string): Promise<void> {
    let targetBookId = bookId;
    if (this.bookRepo) {
      const book = (await this.bookRepo.findById(bookId)) || (await this.bookRepo.findByOpenLibraryKey(bookId));
      if (book) {
        targetBookId = book.id;
      }
    }
    await this.wishlistRepo.remove(userId, targetBookId);
  }
}

