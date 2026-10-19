/**
 * UniLib - Toast Notification Popups
 */

import React from 'react';
import { useNotification, ToastMessage } from '@/context/NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="unilib-toast-container"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const icons = {
    SUCCESS: <CheckCircle2 size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />,
    WARNING: <AlertTriangle size={18} color="var(--color-warning)" style={{ flexShrink: 0 }} />,
    ERROR: <AlertCircle size={18} color="var(--color-danger)" style={{ flexShrink: 0 }} />,
    INFO: <Info size={18} color="var(--color-info)" style={{ flexShrink: 0 }} />,
  };

  return (
    <div className={`unilib-toast unilib-toast--${toast.type}`}>
      {icons[toast.type]}
      <div className="unilib-toast__body">
        <h4 className="unilib-toast__title">{toast.title}</h4>
        <p className="unilib-toast__message">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss toast"
        className="unilib-toast__close-btn"
      >
        <X size={14} />
      </button>
    </div>
  );
};
