import React from 'react';
import { Sparkles } from 'lucide-react';
import { SearchBar } from './SearchBar';
import './CatalogHero.css';

interface CatalogHeroProps {
  searchQuery: string;
  totalResults: number;
  isLoading: boolean;
  onSearchChange: (query: string) => void;
}

export const CatalogHero: React.FC<CatalogHeroProps> = ({
  searchQuery,
  totalResults,
  isLoading,
  onSearchChange,
}) => {
  return (
    <section className="unilib-hero-banner">
      <div className="unilib-hero-content">
        <div className="unilib-hero-badge">
          <Sparkles size={14} />
          <span>Academic Resource Discovery System</span>
        </div>

        <h1 className="unilib-hero-title">
          Explore the Central Academic Library Repository
        </h1>

        <p className="unilib-hero-description">
          Access thousands of academic works, textbooks, research monographs, and classic literature.
          Manage instant loans, reserve waiting copies, and track your scholarly reading progress.
        </p>

        <div className="unilib-hero-search-wrap">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            totalResults={totalResults}
            isLoading={isLoading}
            placeholder="Search by title, author, or research domain..."
          />
        </div>
      </div>

      <div className="unilib-hero-stats-row">
        <div>
          <div className="unilib-stat-number">14 Days</div>
          <div className="unilib-stat-label">Standard Loan Period</div>
        </div>
        <div>
          <div className="unilib-stat-number">24/7</div>
          <div className="unilib-stat-label">Digital Reservation Queue</div>
        </div>
        <div>
          <div className="unilib-stat-number">Auto-Sync</div>
          <div className="unilib-stat-label">Real-Time Open Library API</div>
        </div>
        <div>
          <div className="unilib-stat-number">Zero Penalties</div>
          <div className="unilib-stat-label">On-Time Return Alerts</div>
        </div>
      </div>
    </section>
  );
};
