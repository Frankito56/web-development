import { IReadingRecordRepository } from '../../domain/repositories/IReadingRecordRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IOpenLibraryFetcher } from './BookUseCases';
import { ReadingRecordEntity } from '../../domain/entities/ReadingRecordEntity';
import { NotFoundError } from '../../domain/errors/DomainErrors';
import { UpsertReadingRecordDTO } from '../dtos';

export class GetUserReadingRecordsUseCase {
  constructor(private readonly recordRepo: IReadingRecordRepository) {}

  async execute(userId: string): Promise<ReadingRecordEntity[]> {
    return this.recordRepo.findByUserId(userId);
  }
}

export class UpsertReadingRecordUseCase {
  constructor(
    private readonly recordRepo: IReadingRecordRepository,
    private readonly bookRepo: IBookRepository,
    private readonly openLibraryFetcher?: IOpenLibraryFetcher,
  ) {}

  async execute(userId: string, dto: UpsertReadingRecordDTO): Promise<ReadingRecordEntity> {
    let book = await this.bookRepo.findById(dto.bookId);
    if (!book) {
      book = await this.bookRepo.findByOpenLibraryKey(dto.bookId);
    }

    if (!book && this.openLibraryFetcher && (dto.bookId.startsWith('/works/') || dto.bookId.startsWith('OL'))) {
      const remote = await this.openLibraryFetcher.fetchBookByWorkKey(dto.bookId);
      if (remote) {
        book = await this.bookRepo.create({
          openLibraryKey: dto.bookId,
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

    return this.recordRepo.upsert({
      userId,
      bookId: book.id,
      status: dto.status,
      progressPercentage: dto.progressPercentage,
      notes: dto.notes,
    });
  }
}

export class DeleteReadingRecordUseCase {
  constructor(private readonly recordRepo: IReadingRecordRepository) {}

  async execute(userId: string, bookId: string): Promise<void> {
    await this.recordRepo.delete(userId, bookId);
  }
}
