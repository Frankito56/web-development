import React from 'react';
import { Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Book } from '@/types';
import './ReserveBookModal.css';

interface ReserveBookModalProps {
  isOpen: boolean;
  book: Book | null;
  actionLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ReserveBookModal: React.FC<ReserveBookModalProps> = ({
  isOpen,
  book,
  actionLoading,
  onClose,
  onConfirm,
}) => {
  if (!book) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Place Book Reservation"
      description="All copies of this title are currently loaned out."
    >
      <div className="unilib-modal-form">
        <div className="unilib-modal-alert-box">
          <Clock size={20} color="var(--color-warning)" className="unilib-modal-alert-icon" />
          <div className="unilib-modal-alert-text">
            Placing a reservation puts you into the priority pickup queue. As soon as another student returns a copy, you will receive an in-app alert.
          </div>
        </div>

        <div className="unilib-modal-reserve-summary">
          <p className="unilib-modal-reserve-summary-title">{book.title}</p>
          <p className="unilib-modal-reserve-summary-authors">{book.authors.join(', ')}</p>
        </div>

        <div className="unilib-modal-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={actionLoading}
            onClick={onConfirm}
          >
            Join Reservation Queue
          </Button>
        </div>
      </div>
    </Modal>
  );
};
