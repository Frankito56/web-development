import React from 'react';
import './LoansHeader.css';

interface LoansHeaderProps {
  activeCount: number;
  limit: number;
}

export const LoansHeader: React.FC<LoansHeaderProps> = ({ activeCount, limit }) => {
  return (
    <div className="unilib-loans-header-row">
      <div>
        <h1 className="unilib-loans-title">Circulation & Loan Center</h1>
        <p className="unilib-loans-subtitle">
          Manage your borrowed university literature, track pickups, and monitor reservations.
        </p>
      </div>

      <div className="unilib-allowance-badge">
        <span className="unilib-allowance-label">Borrow Allowance:</span>
        <strong className="unilib-allowance-value">
          {activeCount} / {limit} books
        </strong>
      </div>
    </div>
  );
};
