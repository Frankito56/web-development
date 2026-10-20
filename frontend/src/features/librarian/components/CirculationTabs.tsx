import React from 'react';
import { BookOpen, Clock, AlertTriangle } from 'lucide-react';
import type { Tab } from '../pages/CirculationPage';
import './CirculationTabs.css';

interface CirculationTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  loansCount: number;
  reservationsCount: number;
  overdueCount: number;
}

export const CirculationTabs: React.FC<CirculationTabsProps> = ({
  activeTab,
  onTabChange,
  loansCount,
  reservationsCount,
  overdueCount,
}) => (
  <div className="circ-tabs">
    <button
      className={`circ-tab ${activeTab === 'loans' ? 'circ-tab--active' : ''}`}
      onClick={() => onTabChange('loans')}
    >
      <BookOpen size={15} />
      Loans
      {loansCount > 0 && (
        <span className="circ-tab__badge">{loansCount}</span>
      )}
    </button>
    <button
      className={`circ-tab ${activeTab === 'reservations' ? 'circ-tab--active' : ''}`}
      onClick={() => onTabChange('reservations')}
    >
      <Clock size={15} />
      Reservations Queue
      {reservationsCount > 0 && (
        <span className="circ-tab__badge">{reservationsCount}</span>
      )}
    </button>
    <button
      className={`circ-tab ${activeTab === 'overdue' ? 'circ-tab--active' : ''} ${overdueCount > 0 ? 'circ-tab--danger' : ''}`}
      onClick={() => onTabChange('overdue')}
    >
      <AlertTriangle size={15} />
      Overdue
      {overdueCount > 0 && (
        <span className="circ-tab__badge circ-tab__badge--danger">{overdueCount}</span>
      )}
    </button>
  </div>
);
