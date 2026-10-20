import { IBookRepository, BookFilters, PaginatedBooks } from '../../domain/repositories/IBookRepository';
import { BookEntity } from '../../domain/entities/BookEntity';
import { NotFoundError } from '../../domain/errors/DomainErrors';
import { ImportBookDTO, UpdateBookInventoryDTO } from '../dtos';

export interface IOpenLibraryFetcher {
  fetchBookByWorkKey(workKey: string): Promise<{
    title: string;
    authors: string[];
    publishYear?: number;
    coverUrl?: string;
    description?: string;
    subjects: string[];
    isbn?: string;
  } | null>;
}

export class GetBooksUseCase {
  constructor(private readonly bookRepo: IBookRepository) {}

  async execute(filters: BookFilters): Promise<PaginatedBooks> {
    return this.bookRepo.findAll(filters);
  }
}

export class GetBookByIdUseCase {
  constructor(private readonly bookRepo: IBookRepository) {}

  async execute(id: string): Promise<BookEntity> {
    let book = await this.bookRepo.findById(id);
    if (!book) {
      book = await this.bookRepo.findByOpenLibraryKey(id);
    }
    if (!book) {
      const cleanKey = id.replace(/^\/?works\//, '');
      book = await this.bookRepo.findByOpenLibraryKey(cleanKey);
      if (!book) {
        book = await this.bookRepo.findByOpenLibraryKey(`/works/${cleanKey}`);
      }
    }
    if (!book) {
      throw new NotFoundError('Book');
    }
    return book;
  }
}

export class ImportBookUseCase {
  constructor(
    private readonly bookRepo: IBookRepository,
    private readonly openLibraryFetcher: IOpenLibraryFetcher,
  ) {}

  async execute(dto: ImportBookDTO): Promise<BookEntity> {
    const cleanKey = dto.openLibraryKey.replace(/^\/?works\//, '');
    const existing = await this.bookRepo.findByOpenLibraryKey(cleanKey);
    if (existing) {
      return existing;
    }

    const remoteData = await this.openLibraryFetcher.fetchBookByWorkKey(cleanKey);
    if (!remoteData) {
      throw new NotFoundError('Open Library book');
    }

    const totalCopies = Math.min(8, Math.max(1, dto.totalCopies ?? 8));

    return this.bookRepo.create({
      openLibraryKey: cleanKey,
      isbn: remoteData.isbn,
      title: remoteData.title,
      authors: remoteData.authors,
      publishYear: remoteData.publishYear,
      coverUrl: remoteData.coverUrl,
      description: remoteData.description,
      subjects: remoteData.subjects,
      totalCopies,
      shelfLocation: dto.shelfLocation ?? 'Floor 1 - Main Desk',
    });
  }
}

export class UpdateBookInventoryUseCase {
  constructor(private readonly bookRepo: IBookRepository) {}

  async execute(bookId: string, dto: UpdateBookInventoryDTO): Promise<BookEntity> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book');
    }

    const updateData: Parameters<IBookRepository['update']>[1] = {};

    if (dto.shelfLocation !== undefined) {
      updateData.shelfLocation = dto.shelfLocation;
    }

    if (dto.totalCopies !== undefined) {
      const clampedCopies = Math.min(8, Math.max(1, dto.totalCopies));
      const diff = clampedCopies - book.totalCopies;
      const newAvailable = Math.min(clampedCopies, Math.max(0, book.availableCopies + diff));
      updateData.totalCopies = clampedCopies;
      updateData.availableCopies = newAvailable;
      updateData.availabilityStatus = newAvailable > 0 ? 'AVAILABLE' : 'ON_LOAN';
    }

    return this.bookRepo.update(bookId, updateData);
  }
}
