import React from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import './CirculationHeader.css';

interface CirculationHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export const CirculationHeader: React.FC<CirculationHeaderProps> = ({ loading, onRefresh }) => (
  <div className="circ-page__header">
    <div className="circ-page__header-icon">
      <ClipboardList size={28} />
    </div>
    <div>
      <h1 className="circ-page__title">Circulation Desk</h1>
      <p className="circ-page__subtitle">Manage active loans, pickup queue, and overdue returns</p>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={onRefresh}
      disabled={loading}
      className="circ-page__refresh-btn"
    >
      <RefreshCw size={14} className={loading ? 'circ-spin' : ''} />
      Refresh
    </Button>
  </div>
);
