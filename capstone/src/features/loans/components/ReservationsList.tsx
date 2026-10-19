/**
 * UniLib - ReservationsList Component
 * Displays books queued for reservation, queue position, pickup deadline, and cancel option.
 */

import React, { useState } from 'react';
import { Reservation } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/dateUtils';
import { LoanService } from '@/services/loanService';
import { useNotification } from '@/context/NotificationContext';
import { Clock, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../loans.css';

export const ReservationsList: React.FC<{
  reservations: Reservation[];
  onRefresh: () => void;
}> = ({ reservations, onRefresh }) => {
  const { showToast } = useNotification();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (res: Reservation) => {
    setCancellingId(res.id);
    const result = await LoanService.cancelReservation(res.id);
    setCancellingId(null);

    if (result.success) {
      showToast('Reservation Cancelled', `Removed "${res.bookTitle}" from queue.`, 'INFO');
      onRefresh();
    }
  };

  return (
    <div className="unilib-loans-list">
      {reservations.map((res) => {
        const isReady = res.status === 'READY_FOR_PICKUP';

        return (
          <article
            key={res.id}
            className="unilib-loan-card"
            style={{
              backgroundColor: isReady ? 'var(--color-warning-bg)' : undefined,
              borderColor: isReady ? 'var(--color-warning-border)' : undefined,
            }}
          >
            <div className="unilib-loan-card__main">
              {res.bookCoverUrl ? (
                <img
                  src={res.bookCoverUrl}
                  alt={res.bookTitle}
                  className="unilib-loan-card__cover"
                />
              ) : (
                <div className="unilib-loan-card__cover" style={{ backgroundColor: 'var(--color-bg-card-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} color="var(--color-text-subtle)" />
                </div>
              )}

              <div className="unilib-loan-card__info">
                <Link
                  to={`/books/${res.bookId}`}
                  className="unilib-loan-card__title"
                >
                  {res.bookTitle}
                </Link>
                <p className="unilib-loan-card__author">
                  Reserved on: {formatDate(res.reservationDate)}
                </p>

                {isReady ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-warning-text)', paddingTop: '0.35rem' }}>
                    <AlertCircle size={14} color="var(--color-warning)" />
                    <span>Ready for pickup! Desk deadline: {formatDate(res.pickupDeadline || '')}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', paddingTop: '0.35rem' }}>
                    <Clock size={14} />
                    <span>Queue Position: <strong style={{ color: 'var(--color-primary-600)' }}>#{res.queuePosition}</strong> in line</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                size="sm"
                isLoading={cancellingId === res.id}
                onClick={() => handleCancel(res)}
                style={{ color: 'var(--color-danger)' }}
              >
                Cancel Queue
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
};
