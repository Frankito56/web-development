import { Op, Order } from 'sequelize';
import {
  IBookRepository,
  CreateBookInput,
  UpdateBookInput,
  BookFilters,
  PaginatedBooks,
} from '../../domain/repositories/IBookRepository';
import { BookEntity } from '../../domain/entities/BookEntity';
import { AvailabilityStatus } from '../../domain/types';
import { BookModel } from '../database/models';

export class SequelizeBookRepository implements IBookRepository {
  private toEntity(record: BookModel): BookEntity {
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

  private isUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  async findById(id: string): Promise<BookEntity | null> {
    if (!this.isUUID(id)) {
      return null;
    }
    const record = await BookModel.findByPk(id);
    return record ? this.toEntity(record) : null;
  }

  async findByOpenLibraryKey(key: string): Promise<BookEntity | null> {
    const clean = key.replace(/^\/?works\//, '');
    const record = await BookModel.findOne({
      where: {
        openLibraryKey: {
          [Op.in]: [clean, `/works/${clean}`],
        },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async findAll(filters: BookFilters): Promise<PaginatedBooks> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, Math.min(50, filters.limit ?? 12));
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filters.search) {
      const q = filters.search.trim();
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { authors: { [Op.iLike]: `%${q}%` } },
        { isbn: { [Op.iLike]: `%${q}%` } },
      ];
    }

    if (filters.subject) {
      where.subjects = { [Op.iLike]: `%${filters.subject}%` };
    }

    if (filters.availabilityStatus) {
      where.availabilityStatus = filters.availabilityStatus;
    }

    const sortDir = (filters.sortDir ?? 'asc').toUpperCase();
    let order: Order;
    if (filters.sortBy === 'publishYear') {
      order = [['publishYear', filters.sortDir ? sortDir : 'DESC']];
    } else if (filters.sortBy === 'authors') {
      order = [['authors', sortDir]];
    } else {
      order = [['title', sortDir]];
    }

    const { count, rows } = await BookModel.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });

    return {
      books: rows.map((r) => this.toEntity(r)),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit) || 1,
    };
  }

  async create(input: CreateBookInput): Promise<BookEntity> {
    const totalCopies = Math.min(8, Math.max(1, input.totalCopies ?? 8));
    const cleanKey = input.openLibraryKey ? input.openLibraryKey.replace(/^\/?works\//, '') : undefined;
    const created = await BookModel.create({
      openLibraryKey: cleanKey,
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
    });
    return this.toEntity(created);
  }

  async update(id: string, input: UpdateBookInput): Promise<BookEntity> {
    const book = await BookModel.findByPk(id);
    if (!book) {
      throw new Error(`Book with id ${id} not found`);
    }

    if (input.totalCopies !== undefined) {
      book.totalCopies = Math.min(8, Math.max(1, input.totalCopies));
    }
    if (input.availableCopies !== undefined) {
      book.availableCopies = Math.min(book.totalCopies, Math.max(0, input.availableCopies));
      book.availabilityStatus = book.availableCopies > 0 ? 'AVAILABLE' : 'ON_LOAN';
    }
    if (input.shelfLocation !== undefined) book.shelfLocation = input.shelfLocation;
    if (input.availabilityStatus !== undefined) book.availabilityStatus = input.availabilityStatus;
    if (input.coverUrl !== undefined) book.coverUrl = input.coverUrl;
    if (input.description !== undefined) book.description = input.description;

    await book.save();
    return this.toEntity(book);
  }

  async delete(id: string): Promise<void> {
    await BookModel.destroy({ where: { id } });
  }

  async incrementAvailable(id: string): Promise<void> {
    const book = await BookModel.findByPk(id);
    if (!book) return;

    const newAvailable = Math.min(book.totalCopies, book.availableCopies + 1);
    book.availableCopies = newAvailable;
    book.availabilityStatus = newAvailable > 0 ? 'AVAILABLE' : 'ON_LOAN';
    await book.save();
  }

  async decrementAvailable(id: string): Promise<void> {
    const book = await BookModel.findByPk(id);
    if (!book) return;

    const newAvailable = Math.max(0, book.availableCopies - 1);
    book.availableCopies = newAvailable;
    book.availabilityStatus = newAvailable > 0 ? 'AVAILABLE' : 'ON_LOAN';
    await book.save();
  }
}
