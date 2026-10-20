import React from 'react';
import { BookMarked, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './LoansMetrics.css';

interface LoansMetricsProps {
  activeCount: number;
  pendingPickupCount: number;
  dueSoonCount: number;
  overdueCount: number;
  historyCount: number;
}

export const LoansMetrics: React.FC<LoansMetricsProps> = ({
  activeCount,
  pendingPickupCount,
  dueSoonCount,
  overdueCount,
  historyCount,
}) => {
  return (
    <div className="unilib-metrics-grid">
      <div className="unilib-metric-card">
        <div className="unilib-metric-card__header">
          <span>Active & Pickups</span>
          <BookMarked size={16} color="var(--color-primary-500)" />
        </div>
        <span className="unilib-metric-card__value">{activeCount}</span>
        <p className="unilib-metric-card__subtext">
          {pendingPickupCount > 0 ? `${pendingPickupCount} pending pickup` : 'In your possession'}
        </p>
      </div>

      <div className="unilib-metric-card">
        <div className="unilib-metric-card__header unilib-metric-card__header--warning">
          <span>Due in ≤ 3 Days</span>
          <Clock size={16} />
        </div>
        <span className="unilib-metric-card__value unilib-metric-card__value--warning">
          {dueSoonCount}
        </span>
        <p className="unilib-metric-card__subtext">Return at desk soon</p>
      </div>

      <div className="unilib-metric-card">
        <div className="unilib-metric-card__header unilib-metric-card__header--danger">
          <span>Overdue Loans</span>
          <AlertTriangle size={16} />
        </div>
        <span className="unilib-metric-card__value unilib-metric-card__value--danger">
          {overdueCount}
        </span>
        <p className="unilib-metric-card__subtext">Needs immediate return</p>
      </div>

      <div className="unilib-metric-card">
        <div className="unilib-metric-card__header unilib-metric-card__header--success">
          <span>Past Returns</span>
          <CheckCircle2 size={16} />
        </div>
        <span className="unilib-metric-card__value">{historyCount}</span>
        <p className="unilib-metric-card__subtext">Successfully returned</p>
      </div>
    </div>
  );
};
