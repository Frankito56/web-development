import React from 'react';
import './WishlistHeader.css';

interface WishlistHeaderProps {
  totalCount: number;
}

export const WishlistHeader: React.FC<WishlistHeaderProps> = ({ totalCount }) => {
  return (
    <div className="unilib-wishlist-header-row">
      <div>
        <h1 className="unilib-wishlist-title">
          Scholarly Wishlist & Availability Alerts
        </h1>
        <p className="unilib-wishlist-subtitle">
          Track books you intend to read later and receive instant in-app alerts when physical copies are returned.
        </p>
      </div>

      <div className="unilib-wishlist-count-badge">
        {totalCount} Saved {totalCount === 1 ? 'Title' : 'Titles'}
      </div>
    </div>
  );
};
