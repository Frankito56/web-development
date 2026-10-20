import React from 'react';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ReadingProgressItem } from '@/types';
import { ReadingTrackerCard } from './ReadingTrackerCard';
import './ReadingTrackerList.css';

interface ReadingTrackerListProps {
  items: ReadingProgressItem[];
  onUpdatePercentage: (item: ReadingProgressItem, percentage: number) => void;
  onRemove: (bookId: string) => void;
}

export const ReadingTrackerList: React.FC<ReadingTrackerListProps> = ({
  items,
  onUpdatePercentage,
  onRemove,
}) => {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={32} />}
        title="No books in this reading list"
        description="Browse the catalog to add textbooks, literature or research papers to your tracker."
        actionText="Find Books in Catalog"
        onAction={() => (window.location.href = '/books')}
      />
    );
  }

  return (
    <div className="unilib-tracker-items-grid">
      {items.map((item) => (
        <ReadingTrackerCard
          key={item.id}
          item={item}
          onUpdatePercentage={onUpdatePercentage}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
