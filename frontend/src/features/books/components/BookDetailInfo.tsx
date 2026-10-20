import React from 'react';
import { Star } from 'lucide-react';
import { Book } from '@/types';
import './BookDetailInfo.css';

interface BookDetailInfoProps {
  book: Book;
}

export const BookDetailInfo: React.FC<BookDetailInfoProps> = ({ book }) => {
  return (
    <div>
      <div className="unilib-subjects-list">
        {book.subjects.slice(0, 4).map((sub, i) => (
          <span key={i} className="unilib-subject-chip">
            {sub}
          </span>
        ))}
      </div>

      <h1 className="unilib-detail-title">{book.title}</h1>

      <p className="unilib-detail-authors unilib-detail-authors--spaced">
        By <strong>{book.authors.join(', ')}</strong>
      </p>

      <div className="unilib-meta-cards-row">
        <div>
          <span className="unilib-meta-card-label">Campus Shelf</span>
          <span className="unilib-meta-card-value unilib-meta-card-value--mono">
            {book.locationShelf || 'Circulation Desk'}
          </span>
        </div>
        <div>
          <span className="unilib-meta-card-label">First Published</span>
          <span className="unilib-meta-card-value">
            {book.firstPublishYear || 'Classical Edition'}
          </span>
        </div>
        <div>
          <span className="unilib-meta-card-label">Rating Score</span>
          <span className="unilib-meta-card-value unilib-meta-card-value--rating">
            <Star size={14} fill="currentColor" />
            {book.averageRating || '4.5'} / 5.0
          </span>
        </div>
      </div>

      <div>
        <h3 className="unilib-detail-section-title">Overview & Abstract</h3>
        <p className="unilib-overview-text">
          {book.description || 'Academic catalog summary currently in preparation.'}
        </p>
      </div>

      <div className="unilib-bibliographic-grid">
        <div>
          <span className="unilib-meta-card-label">Publisher</span>
          <span>{book.publisher || 'University Press'}</span>
        </div>
        <div>
          <span className="unilib-meta-card-label">ISBN</span>
          <span className="unilib-detail-isbn">{book.isbn || 'N/A'}</span>
        </div>
        <div>
          <span className="unilib-meta-card-label">Length</span>
          <span>{book.pageCount ? `${book.pageCount} pages` : 'Standard monograph'}</span>
        </div>
      </div>
    </div>
  );
};
