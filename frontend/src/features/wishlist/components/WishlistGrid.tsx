import React from 'react';
import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { WishlistItem, User } from '@/types';
import { WishlistCard } from './WishlistCard';
import './WishlistGrid.css';

interface WishlistGridProps {
  wishlist: WishlistItem[];
  user: User | null;
  onRemove: (item: WishlistItem) => void;
  onQuickBorrow: (item: WishlistItem) => void;
  onQuickReserve: (item: WishlistItem) => void;
}

export const WishlistGrid: React.FC<WishlistGridProps> = ({
  wishlist,
  user,
  onRemove,
  onQuickBorrow,
  onQuickReserve,
}) => {
  if (wishlist.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={32} color="var(--color-text-muted)" />}
        title="Your wishlist is empty"
        description="Browse the library catalog and click the heart icon on any book to add it here."
        actionText="Explore Academic Catalog"
        onAction={() => (window.location.href = '/books')}
      />
    );
  }

  return (
    <div className="unilib-wishlist-grid">
      {wishlist.map((item) => (
        <WishlistCard
          key={item.id}
          item={item}
          user={user}
          onRemove={onRemove}
          onQuickBorrow={onQuickBorrow}
          onQuickReserve={onQuickReserve}
        />
      ))}
    </div>
  );
};
