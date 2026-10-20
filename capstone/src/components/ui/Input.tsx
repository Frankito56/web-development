import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="unilib-input-group">
        {label && (
          <label htmlFor={inputId} className="unilib-input__label">
            {label}
          </label>
        )}
        <div className="unilib-input__wrapper">
          {leftIcon && (
            <span className="unilib-input__icon unilib-input__icon--left">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`unilib-input ${leftIcon ? 'unilib-input--has-left-icon' : ''} ${
              rightIcon ? 'unilib-input--has-right-icon' : ''
            } ${error ? 'unilib-input--error' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="unilib-input__icon unilib-input__icon--right">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="unilib-input__error">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="unilib-input__helper">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
