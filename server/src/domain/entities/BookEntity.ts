import { AvailabilityStatus } from '../types';

export interface BookEntity {
  id: string;
  openLibraryKey?: string;
  isbn?: string;
  title: string;
  authors: string[];
  publishYear?: number;
  coverUrl?: string;
  description?: string;
  subjects: string[];
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  availabilityStatus: AvailabilityStatus;
  createdAt: Date;
  updatedAt: Date;
}
