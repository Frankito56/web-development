import React from 'react';
import './LoansTabs.css';

export type LoanTab = 'active' | 'reservations' | 'history';

interface LoansTabsProps {
  currentTab: LoanTab;
  onTabChange: (tab: LoanTab) => void;
  activeCount: number;
  reservationsCount: number;
  historyCount: number;
}

export const LoansTabs: React.FC<LoansTabsProps> = ({
  currentTab,
  onTabChange,
  activeCount,
  reservationsCount,
  historyCount,
}) => {
  return (
    <div className="unilib-loans-tabs-bar">
      <button
        onClick={() => onTabChange('active')}
        className={`unilib-loan-tab-btn ${currentTab === 'active' ? 'unilib-loan-tab-btn--active' : ''}`}
      >
        <span>Active Checkouts</span>
        <span className="unilib-tab-counter">{activeCount}</span>
      </button>

      <button
        onClick={() => onTabChange('reservations')}
        className={`unilib-loan-tab-btn ${currentTab === 'reservations' ? 'unilib-loan-tab-btn--active' : ''}`}
      >
        <span>Reservations Queue</span>
        <span className="unilib-tab-counter">{reservationsCount}</span>
      </button>

      <button
        onClick={() => onTabChange('history')}
        className={`unilib-loan-tab-btn ${currentTab === 'history' ? 'unilib-loan-tab-btn--active' : ''}`}
      >
        <span>Borrowing History</span>
        <span className="unilib-tab-counter">{historyCount}</span>
      </button>
    </div>
  );
};
