/**
 * UniLib - Accessible Button Component
 */

import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`unilib-btn unilib-btn--${size} unilib-btn--${variant} ${className}`}
        {...props}
      >
        {isLoading && <span className="unilib-btn__spinner" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="unilib-btn__icon">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="unilib-btn__icon">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
