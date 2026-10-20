import React from 'react';
import { Button } from '@/components/ui/Button';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`unilib-empty-state ${className}`}>
      {icon && <div className="unilib-empty-state__icon-wrap">{icon}</div>}
      <h3 className="unilib-empty-state__title">{title}</h3>
      <p className="unilib-empty-state__description">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
