import { PrismaClient, Prisma } from '@prisma/client';
import {
  IBookRepository,
  CreateBookInput,
  UpdateBookInput,
  BookFilters,
  PaginatedBooks,
} from '../../domain/repositories/IBookRepository';
import { BookEntity } from '../../domain/entities/BookEntity';
import { AvailabilityStatus } from '../../domain/types';

export class PrismaBookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: {
    id: string;
    openLibraryKey: string | null;
    isbn: string | null;
    title: string;
    authors: string;
    publishYear: number | null;
    coverUrl: string | null;
    description: string | null;
    subjects: string;
    totalCopies: number;
    availableCopies: number;
    shelfLocation: string;
    availabilityStatus: string;
    createdAt: Date;
    updatedAt: Date;
  }): BookEntity {
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

  async findById(id: string): Promise<BookEntity | null> {
    const record = await this.prisma.book.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByOpenLibraryKey(key: string): Promise<BookEntity | null> {
    const record = await this.prisma.book.findUnique({ where: { openLibraryKey: key } });
    return record ? this.toEntity(record) : null;
  }

  async findAll(filters: BookFilters): Promise<PaginatedBooks> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, Math.min(50, filters.limit ?? 12));
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q } },
        { authors: { contains: q } },
        { isbn: { contains: q } },
      ];
    }

    if (filters.subject) {
      where.subjects = { contains: filters.subject };
    }

    if (filters.availabilityStatus) {
      where.availabilityStatus = filters.availabilityStatus;
    }

    const orderBy: Prisma.BookOrderByWithRelationInput = {};
    if (filters.sortBy === 'publishYear') {
      orderBy.publishYear = filters.sortDir ?? 'desc';
    } else if (filters.sortBy === 'authors') {
      orderBy.authors = filters.sortDir ?? 'asc';
    } else {
      orderBy.title = filters.sortDir ?? 'asc';
    }

    const [total, records] = await Promise.all([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    return {
      books: records.map((r) => this.toEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async create(input: CreateBookInput): Promise<BookEntity> {
    const totalCopies = input.totalCopies ?? 1;
    const created = await this.prisma.book.create({
      data: {
        openLibraryKey: input.openLibraryKey,
        isbn: input.isbn,
        title: input.title,
        authors: JSON.stringify(input.authors),
        publishYear: input.publishYear,
        coverUrl: input.coverUrl,
        description: input.description,
        subjects: JSON.stringify(input.subjects ?? []),
        totalCopies,
        availableCopies: totalCopies,
        shelfLocation: input.shelfLocation ?? 'Floor 1 - Main Desk',
        availabilityStatus: totalCopies > 0 ? 'AVAILABLE' : 'ON_LOAN',
      },
    });
    return this.toEntity(created);
  }

  async update(id: string, input: UpdateBookInput): Promise<BookEntity> {
    const data: Prisma.BookUpdateInput = {};

    if (input.totalCopies !== undefined) data.totalCopies = input.totalCopies;
    if (input.availableCopies !== undefined) {
      data.availableCopies = input.availableCopies;
      data.availabilityStatus = input.availableCopies > 0 ? 'AVAILABLE' : 'ON_LOAN';
    }
    if (input.shelfLocation !== undefined) data.shelfLocation = input.shelfLocation;
    if (input.availabilityStatus !== undefined) data.availabilityStatus = input.availabilityStatus;
    if (input.coverUrl !== undefined) data.coverUrl = input.coverUrl;
    if (input.description !== undefined) data.description = input.description;

    const updated = await this.prisma.book.update({
      where: { id },
      data,
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.book.delete({ where: { id } });
  }

  async incrementAvailable(id: string): Promise<void> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) return;

    const newAvailable = Math.min(book.totalCopies, book.availableCopies + 1);
    await this.prisma.book.update({
      where: { id },
      data: {
        availableCopies: newAvailable,
        availabilityStatus: newAvailable > 0 ? 'AVAILABLE' : 'ON_LOAN',
      },
    });
  }

  async decrementAvailable(id: string): Promise<void> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) return;

    const newAvailable = Math.max(0, book.availableCopies - 1);
    await this.prisma.book.update({
      where: { id },
      data: {
        availableCopies: newAvailable,
        availabilityStatus: newAvailable > 0 ? 'AVAILABLE' : 'ON_LOAN',
      },
    });
  }
}
