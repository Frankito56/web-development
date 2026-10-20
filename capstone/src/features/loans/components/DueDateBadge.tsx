import React from 'react';
import { getDueStatus } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/Badge';

export const DueDateBadge: React.FC<{ dueDate: string | Date; className?: string }> = ({
  dueDate,
  className = '',
}) => {
  const { label, badgeVariant } = getDueStatus(dueDate);

  return (
    <Badge variant={badgeVariant} className={className}>
      {label}
    </Badge>
  );
};
