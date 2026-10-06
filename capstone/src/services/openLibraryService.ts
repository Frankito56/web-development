/**
 * UniLib - Open Library API Service
 * Fetches real-time academic catalog data with resilience, caching & fallback to local repository.
 */

import { APP_CONFIG } from '@/config';
import { Book } from '@/types';
import { StorageService } from './storageService';
import { sanitizeInput } from '@/utils/sanitizer';

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

export const OpenLibraryService = {
  /**
   * Fetches books based on query and/or subject filter
   */
  async searchBooks(query: string = '', category: string = '', page: number = 1): Promise<{ books: Book[]; total: number }> {
    const cleanQuery = sanitizeInput(query);
    const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);

    // If query is empty and category is 'all' or empty, prioritize local catalog + popular academic books
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
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s network timeout

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
        
        // Check if book exists in local storage for persisted loan state
        const existing = localBooks.find((b) => b.id === id);
        if (existing) {
          return existing;
        }

        const coverUrl = doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : undefined;

        const newBook: Book = {
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
          totalCopies: 3,
          availableCopies: 3,
          locationShelf: `LIB-${String(id).slice(-3).toUpperCase()}`,
        };

        return newBook;
      });

      // Merge and save any newly discovered books to local database
      const mergedLocal = [...localBooks];
      mappedBooks.forEach((mb) => {
        if (!mergedLocal.some((lb) => lb.id === mb.id)) {
          mergedLocal.push(mb);
        }
      });
      StorageService.setItem(StorageService.KEYS.BOOKS, mergedLocal);

      return {
        books: mappedBooks,
        total: Math.min(data.numFound, 120), // cap to reasonable academic pagination range
      };
    } catch (error) {
      console.warn('Network fetch from Open Library failed or timed out. Falling back to local catalog:', error);
      
      // Filter local books in offline/fallback mode
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

  /**
   * Fetches specific book details by ID
   */
  async getBookById(id: string): Promise<Book | null> {
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
        totalCopies: 3,
        availableCopies: 3,
        locationShelf: `LIB-${id.slice(-4).toUpperCase()}`,
      };

      StorageService.setItem(StorageService.KEYS.BOOKS, [...localBooks, newBook]);
      return newBook;
    } catch {
      return null;
    }
  },
};
