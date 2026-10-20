import React from 'react';
import { Package, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import './CirculationStatsBar.css';

interface CirculationStatsBarProps {
  pendingCount: number;
  activeCount: number;
  queueCount: number;
  overdueCount: number;
}

export const CirculationStatsBar: React.FC<CirculationStatsBarProps> = ({
  pendingCount,
  activeCount,
  queueCount,
  overdueCount,
}) => (
  <div className="circ-stats-bar">
    <div className="circ-stat">
      <Package size={18} className="circ-stat__icon circ-stat__icon--pending" />
      <div>
        <div className="circ-stat__value">{pendingCount}</div>
        <div className="circ-stat__label">Pending Pickup</div>
      </div>
    </div>
    <div className="circ-stat">
      <BookOpen size={18} className="circ-stat__icon circ-stat__icon--active" />
      <div>
        <div className="circ-stat__value">{activeCount}</div>
        <div className="circ-stat__label">Active Loans</div>
      </div>
    </div>
    <div className="circ-stat">
      <Clock size={18} className="circ-stat__icon circ-stat__icon--queue" />
      <div>
        <div className="circ-stat__value">{queueCount}</div>
        <div className="circ-stat__label">In Queue</div>
      </div>
    </div>
    <div className="circ-stat">
      <AlertTriangle size={18} className="circ-stat__icon circ-stat__icon--overdue" />
      <div>
        <div className="circ-stat__value">{overdueCount}</div>
        <div className="circ-stat__label">Overdue</div>
      </div>
    </div>
  </div>
);
