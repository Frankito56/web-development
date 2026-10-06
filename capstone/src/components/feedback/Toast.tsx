/**
 * UniLib - Toast Notification Popups
 */

import React from 'react';
import { useNotification, ToastMessage } from '@/context/NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const icons = {
    SUCCESS: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    WARNING: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    ERROR: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    INFO: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    SUCCESS: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/90 dark:bg-slate-900',
    WARNING: 'border-amber-200 dark:border-amber-800 bg-amber-50/90 dark:bg-slate-900',
    ERROR: 'border-rose-200 dark:border-rose-800 bg-rose-50/90 dark:bg-slate-900',
    INFO: 'border-blue-200 dark:border-blue-800 bg-blue-50/90 dark:bg-slate-900',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borders[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{toast.title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss toast"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
