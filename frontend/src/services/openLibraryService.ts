import { APP_CONFIG } from '@/config';
import { Book } from '@/types';
import { StorageService } from './storageService';
import { sanitizeInput } from '@/utils/sanitizer';
import { apiClient, ApiBook } from './apiClient';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
  isbn?: string[];
  ratings_average?: number;
  ratings_count?: number;
  number_of_pages_median?: number;
  publisher?: string[];
}

interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryDoc[];
}

function findMatchingBackendBook(book: { id: string; title: string }, backendBooks: ApiBook[]): ApiBook | undefined {
  const cleanId = book.id.replace(/^\/?works\//, '');
  return backendBooks.find((bb) => {
    const cleanKey = bb.openLibraryKey ? bb.openLibraryKey.replace(/^\/?works\//, '') : '';
    return (
      bb.id === book.id ||
      (cleanKey && cleanKey === cleanId) ||
      (bb.title && book.title && bb.title.toLowerCase().trim() === book.title.toLowerCase().trim())
    );
  });
}

export const OpenLibraryService = {
  async searchBooks(query: string = '', category: string = '', page: number = 1): Promise<{ books: Book[]; total: number }> {
    const cleanQuery = sanitizeInput(query);
    const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);

    let backendBooks: ApiBook[] = [];
    try {
      const backendRes = await apiClient.books.getAll({ limit: 100 });
      if (backendRes && Array.isArray(backendRes.books)) {
        backendBooks = backendRes.books;
      }
    } catch {
    }

    let searchQuery = cleanQuery;
    if (!searchQuery && category && category !== 'all') {
      searchQuery = category;
    }

    if (!searchQuery) {
      searchQuery = 'computer science literature science history';
    }

    try {
      const url = new URL(`${APP_CONFIG.API_BASE_URL}/search.json`);
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('limit', String(APP_CONFIG.DEFAULT_PAGE_SIZE));
      url.searchParams.set('page', String(page));
      url.searchParams.set('fields', 'key,title,author_name,cover_i,first_publish_year,subject,isbn,ratings_average,ratings_count,number_of_pages_median,publisher');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Open Library API responded with status ${response.status}`);
      }

      const data: OpenLibrarySearchResponse = await response.json();

      const mappedBooks: Book[] = data.docs.map((doc) => {
        const id = doc.key ? doc.key.replace('/works/', '') : `ol-${Math.random().toString(36).substring(2, 9)}`;

        const existing = localBooks.find((b) => b.id === id);

        const coverUrl = doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : undefined;

        const newBook: Book = existing ? { ...existing } : {
          id,
          title: doc.title || 'Untitled Academic Work',
          authors: doc.author_name || ['Unknown Author'],
          coverUrl,
          firstPublishYear: doc.first_publish_year,
          subjects: (doc.subject || ['General Academics']).slice(0, 5),
          description: `An academic title available in the university library catalog. Published in ${doc.first_publish_year || 'historical period'}.`,
          isbn: doc.isbn?.[0],
          publisher: doc.publisher?.[0] || 'University Press',
          pageCount: doc.number_of_pages_median || 350,
          averageRating: doc.ratings_average ? Number(doc.ratings_average.toFixed(1)) : 4.5,
          ratingsCount: doc.ratings_count || 120,
          availabilityStatus: 'AVAILABLE',
          totalCopies: 8,
          availableCopies: 8,
          locationShelf: `LIB-${String(id).slice(-3).toUpperCase()}`,
        };

        const backendMatch = findMatchingBackendBook(newBook, backendBooks);
        if (backendMatch) {
          newBook.totalCopies = backendMatch.totalCopies;
          newBook.availableCopies = backendMatch.availableCopies;
          newBook.availabilityStatus = backendMatch.availableCopies > 0 ? 'AVAILABLE' : 'ON_LOAN';
          if (backendMatch.shelfLocation) {
            newBook.locationShelf = backendMatch.shelfLocation;
          }
        }

        return newBook;
      });

      if (page === 1 && backendBooks.length > 0) {
        backendBooks.forEach((bb) => {
          const cleanKey = bb.openLibraryKey ? bb.openLibraryKey.replace(/^\/?works\//, '') : '';
          const alreadyExists = mappedBooks.some((mb) => {
            const cleanMbId = mb.id.replace(/^\/?works\//, '');
            return (
              mb.id === bb.id ||
              (cleanKey && cleanMbId === cleanKey) ||
              mb.title.toLowerCase().trim() === bb.title.toLowerCase().trim()
            );
          });

          if (!alreadyExists) {
            const lowerQuery = cleanQuery.toLowerCase();
            const matchesQuery = !cleanQuery ||
              bb.title.toLowerCase().includes(lowerQuery) ||
              bb.authors.some((a) => a.toLowerCase().includes(lowerQuery)) ||
              bb.subjects.some((s) => s.toLowerCase().includes(lowerQuery));

            const matchesCategory = !category || category === 'all' ||
              bb.subjects.some((s) => s.toLowerCase().includes(category.toLowerCase()));

            if (matchesQuery && matchesCategory) {
              mappedBooks.unshift({
                id: cleanKey || bb.id,
                title: bb.title,
                authors: bb.authors,
                coverUrl: bb.coverUrl,
                firstPublishYear: bb.publishYear,
                subjects: bb.subjects,
                description: bb.description || 'Academic catalog resource.',
                isbn: bb.isbn,
                availabilityStatus: bb.availableCopies > 0 ? 'AVAILABLE' : 'ON_LOAN',
                totalCopies: bb.totalCopies,
                availableCopies: bb.availableCopies,
                locationShelf: bb.shelfLocation,
              });
            }
          }
        });
      }

      const mergedLocal = [...localBooks];
      mappedBooks.forEach((mb) => {
        const idx = mergedLocal.findIndex((lb) => lb.id === mb.id);
        if (idx >= 0) {
          mergedLocal[idx] = mb;
        } else {
          mergedLocal.push(mb);
        }
      });
      StorageService.setItem(StorageService.KEYS.BOOKS, mergedLocal);

      return {
        books: mappedBooks,
        total: Math.max(data.numFound, mappedBooks.length),
      };
    } catch (error) {
      console.warn('Network fetch from Open Library failed or timed out. Falling back to local catalog:', error);

      let filtered = [...localBooks];
      if (cleanQuery) {
        const lowerQ = cleanQuery.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(lowerQ) ||
            b.authors.some((a) => a.toLowerCase().includes(lowerQ)) ||
            b.subjects.some((s) => s.toLowerCase().includes(lowerQ))
        );
      }
      if (category && category !== 'all') {
        const lowerCat = category.toLowerCase();
        filtered = filtered.filter((b) =>
          b.subjects.some((s) => s.toLowerCase().includes(lowerCat))
        );
      }

      return {
        books: filtered,
        total: filtered.length,
      };
    }
  },

  async getBookById(id: string): Promise<Book | null> {
    try {
      const backendBook = await apiClient.books.getById(id);
      if (backendBook) {
        const cleanKey = backendBook.openLibraryKey ? backendBook.openLibraryKey.replace(/^\/?works\//, '') : '';
        const mapped: Book = {
          id: cleanKey || backendBook.id,
          title: backendBook.title,
          authors: backendBook.authors,
          coverUrl: backendBook.coverUrl,
          firstPublishYear: backendBook.publishYear,
          subjects: backendBook.subjects,
          description: backendBook.description || 'Academic title available in university library catalog.',
          isbn: backendBook.isbn,
          availabilityStatus: backendBook.availableCopies > 0 ? 'AVAILABLE' : 'ON_LOAN',
          totalCopies: backendBook.totalCopies,
          availableCopies: backendBook.availableCopies,
          locationShelf: backendBook.shelfLocation || `LIB-${String(id).slice(-4).toUpperCase()}`,
        };

        const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);
        const filtered = localBooks.filter((b) => b.id !== mapped.id && b.id !== id && b.id !== backendBook.id);
        StorageService.setItem(StorageService.KEYS.BOOKS, [...filtered, mapped]);
        return mapped;
      }
    } catch {
    }

    const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);
    const existing = localBooks.find((b) => b.id === id);
    if (existing) {
      return existing;
    }

    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/works/${id}.json`);
      if (!response.ok) return null;
      const data = await response.json();

      let description = 'No detailed description available.';
      if (typeof data.description === 'string') {
        description = data.description;
      } else if (data.description && typeof data.description.value === 'string') {
        description = data.description.value;
      }

      const coverId = Array.isArray(data.covers) ? data.covers[0] : null;
      const coverUrl = coverId && coverId > 0
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : undefined;

      const newBook: Book = {
        id,
        title: data.title || 'Untitled Work',
        authors: ['Academic Contributor'],
        coverUrl,
        firstPublishYear: data.created?.value ? new Date(data.created.value).getFullYear() : undefined,
        subjects: Array.isArray(data.subjects) ? data.subjects.slice(0, 6) : ['Academics'],
        description,
        availabilityStatus: 'AVAILABLE',
        totalCopies: 8,
        availableCopies: 8,
        locationShelf: `LIB-${id.slice(-4).toUpperCase()}`,
      };

      StorageService.setItem(StorageService.KEYS.BOOKS, [...localBooks, newBook]);
      return newBook;
    } catch {
      return null;
    }
  },
};
