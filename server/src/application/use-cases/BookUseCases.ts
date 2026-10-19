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
    const book = await this.bookRepo.findById(id);
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
    const existing = await this.bookRepo.findByOpenLibraryKey(dto.openLibraryKey);
    if (existing) {
      return existing;
    }

    const remoteData = await this.openLibraryFetcher.fetchBookByWorkKey(dto.openLibraryKey);
    if (!remoteData) {
      throw new NotFoundError('Open Library book');
    }

    const totalCopies = dto.totalCopies ?? 1;

    return this.bookRepo.create({
      openLibraryKey: dto.openLibraryKey,
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
      const diff = dto.totalCopies - book.totalCopies;
      const newAvailable = Math.max(0, book.availableCopies + diff);
      updateData.totalCopies = dto.totalCopies;
      updateData.availableCopies = newAvailable;
      updateData.availabilityStatus = newAvailable > 0 ? 'AVAILABLE' : 'ON_LOAN';
    }

    return this.bookRepo.update(bookId, updateData);
  }
}
