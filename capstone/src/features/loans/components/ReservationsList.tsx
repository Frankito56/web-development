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
import { Clock, BookOpen, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReservationsList: React.FC<{
  reservations: Reservation[];
  onRefresh: () => void;
}> = ({ reservations, onRefresh }) => {
  const { showToast } = useNotification();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = (res: Reservation) => {
    setCancellingId(res.id);
    const result = LoanService.cancelReservation(res.id);
    setCancellingId(null);

    if (result.success) {
      showToast('Reservation Cancelled', `Removed "${res.bookTitle}" from queue.`, 'INFO');
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {reservations.map((res) => {
        const isReady = res.status === 'READY_FOR_PICKUP';

        return (
          <article
            key={res.id}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border shadow-xs transition-all gap-4 ${
              isReady
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start gap-4 min-w-0">
              {res.bookCoverUrl ? (
                <img
                  src={res.bookCoverUrl}
                  alt={res.bookTitle}
                  className="w-12 h-18 object-cover rounded-lg shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-12 h-18 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                </div>
              )}

              <div className="min-w-0 space-y-1">
                <Link
                  to={`/books/${res.bookId}`}
                  className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-primary-600 transition-colors line-clamp-1"
                >
                  {res.bookTitle}
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reserved on: {formatDate(res.reservationDate)}
                </p>

                {isReady ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 pt-1">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Ready for pickup! Desk deadline: {formatDate(res.pickupDeadline || '')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Queue Position: <strong className="text-primary-600 dark:text-primary-400">#{res.queuePosition}</strong> in line</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end w-full sm:w-auto pt-2 sm:pt-0">
              <Button
                variant="ghost"
                size="sm"
                isLoading={cancellingId === res.id}
                onClick={() => handleCancel(res)}
                className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
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
