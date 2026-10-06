/**
 * UniLib - useBooks Hook
 * Fetches and filters the academic book catalog with debouncing, sorting, and pagination.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Book, BookFiltersState } from '@/types';
import { OpenLibraryService } from '@/services/openLibraryService';
import { StorageService } from '@/services/storageService';
import { useDebounce } from './useDebounce';
import { APP_CONFIG } from '@/config';

export function useBooks() {
  const [filters, setFilters] = useState<BookFiltersState>({
    searchQuery: '',
    category: 'all',
    sortBy: 'relevance',
    availability: 'ALL',
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const debouncedQuery = useDebounce(filters.searchQuery, APP_CONFIG.SEARCH_DEBOUNCE_MS);

  // Sync inventory changes from storage
  const syncWithStorage = useCallback(() => {
    const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);
    setBooks((prevBooks) => {
      return prevBooks.map((book) => {
        const matchingLocal = localBooks.find((lb) => lb.id === book.id);
        return matchingLocal || book;
      });
    });
  }, []);

  useEffect(() => {
    const unsubscribe = StorageService.subscribe(syncWithStorage);
    return () => unsubscribe();
  }, [syncWithStorage]);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await OpenLibraryService.searchBooks(
        debouncedQuery,
        filters.category,
        currentPage
      );
      setBooks(result.books);
      setTotalItems(result.total);
    } catch (err) {
      console.error('Failed to load catalog books:', err);
      setError('Unable to reach the library catalog server. Showing cached works.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters.category, currentPage]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Client-side filtering & sorting on currently loaded results
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Filter by availability
    if (filters.availability === 'AVAILABLE') {
      result = result.filter((b) => b.availabilityStatus === 'AVAILABLE' && b.availableCopies > 0);
    } else if (filters.availability === 'ON_LOAN') {
      result = result.filter((b) => b.availabilityStatus === 'ON_LOAN' || b.availableCopies === 0);
    }

    // Sort
    switch (filters.sortBy) {
      case 'title_asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'year_desc':
        result.sort((a, b) => (b.firstPublishYear || 0) - (a.firstPublishYear || 0));
        break;
      case 'year_asc':
        result.sort((a, b) => (a.firstPublishYear || 0) - (b.firstPublishYear || 0));
        break;
      case 'rating_desc':
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'relevance':
      default:
        // Keep standard relevance order
        break;
    }

    return result;
  }, [books, filters.availability, filters.sortBy]);

  const updateSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    setCurrentPage(1); // reset to page 1 on new search
  };

  const updateCategory = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, category: categoryId }));
    setCurrentPage(1);
  };

  const updateSortBy = (sortBy: BookFiltersState['sortBy']) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const updateAvailability = (availability: BookFiltersState['availability']) => {
    setFilters((prev) => ({ ...prev, availability }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      sortBy: 'relevance',
      availability: 'ALL',
    });
    setCurrentPage(1);
  };

  return {
    books: filteredAndSortedBooks,
    allBooksCount: totalItems,
    isLoading,
    error,
    filters,
    currentPage,
    setCurrentPage,
    updateSearchQuery,
    updateCategory,
    updateSortBy,
    updateAvailability,
    resetFilters,
    refetch: fetchCatalog,
  };
}
