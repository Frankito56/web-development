import { BookEntity } from '../entities/BookEntity';
import { AvailabilityStatus } from '../types';

export interface CreateBookInput {
  openLibraryKey?: string;
  isbn?: string;
  title: string;
  authors: string[];
  publishYear?: number;
  coverUrl?: string;
  description?: string;
  subjects?: string[];
  totalCopies?: number;
  shelfLocation?: string;
}

export interface UpdateBookInput {
  totalCopies?: number;
  availableCopies?: number;
  shelfLocation?: string;
  availabilityStatus?: AvailabilityStatus;
  coverUrl?: string;
  description?: string;
}

export interface BookFilters {
  search?: string;
  subject?: string;
  availabilityStatus?: AvailabilityStatus;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'publishYear' | 'authors';
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedBooks {
  books: BookEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBookRepository {
  findById(id: string): Promise<BookEntity | null>;
  findByOpenLibraryKey(key: string): Promise<BookEntity | null>;
  findAll(filters: BookFilters): Promise<PaginatedBooks>;
  create(input: CreateBookInput): Promise<BookEntity>;
  update(id: string, input: UpdateBookInput): Promise<BookEntity>;
  delete(id: string): Promise<void>;
  incrementAvailable(id: string): Promise<void>;
  decrementAvailable(id: string): Promise<void>;
}
