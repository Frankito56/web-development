/**
 * UniLib - usePagination Hook
 * Calculates page slices, bounds, and provides navigation helpers.
 */

import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  pageSize?: number;
}

export function usePagination({ totalItems, initialPage = 1, pageSize = 12 }: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  // Ensure current page stays within valid boundaries
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const goToPage = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
  };

  const nextPage = () => {
    goToPage(validPage + 1);
  };

  const prevPage = () => {
    goToPage(validPage - 1);
  };

  return {
    currentPage: validPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
  };
}
