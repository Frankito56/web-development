import React from 'react';
import { BookOpen } from 'lucide-react';
import { BookCard } from './BookCard';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Book } from '@/types';
import './CatalogBookGrid.css';

interface CatalogBookGridProps {
  books: Book[];
  isLoading: boolean;
  onBorrowClick: (book: Book) => void;
  onReserveClick: (book: Book) => void;
  onResetFilters: () => void;
}

export const CatalogBookGrid: React.FC<CatalogBookGridProps> = ({
  books,
  isLoading,
  onBorrowClick,
  onReserveClick,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="unilib-books-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={32} />}
        title="No books match your current search"
        description="Try broadening your search term, switching categories, or clearing active filters."
        actionText="Clear All Filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="unilib-books-grid">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onBorrowClick={handleBorrowClick}
          onReserveClick={handleReserveClick}
        />
      ))}
    </div>
  );

  function handleBorrowClick(book: Book) {
    onBorrowClick(book);
  }

  function handleReserveClick(book: Book) {
    onReserveClick(book);
  }
};
