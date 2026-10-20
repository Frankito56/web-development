import React from 'react';
import './Badge.css';

export type BadgeVariant =
  | 'available'
  | 'on_loan'
  | 'reserved'
  | 'safe'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  withDot = true,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`unilib-badge unilib-badge--${variant} ${className}`}
      {...props}
    >
      {withDot && <span className="unilib-badge__dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};
