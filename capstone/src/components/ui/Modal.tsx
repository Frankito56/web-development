/**
 * UniLib - Accessible Modal Component (ARIA compliant, keyboard navigable)
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="unilib-modal-backdrop"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-desc' : undefined}
        className={`unilib-modal unilib-modal--${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="unilib-modal__header">
          <div>
            {title && (
              <h2 id="modal-title" className="unilib-modal__title">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-desc" className="unilib-modal__description">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="unilib-modal__close-btn"
          >
            <X size={18} />
          </button>
        </div>

        <div className="unilib-modal__content">{children}</div>
      </div>
    </div>
  );
};
