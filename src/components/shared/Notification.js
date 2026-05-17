import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Notification({
  type = 'success',
  message,
  onClose,
  duration = 5000,
  className = '',
}) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100/50',
    error: 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100/50',
    info: 'bg-sky-50 border-sky-200 text-sky-800 shadow-sky-100/50',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-lg transition-all duration-300 animate-slide-in-right ${styles[type]} ${className}`}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 text-sm font-medium leading-5">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-0.5 hover:bg-black/5 transition-colors focus:outline-none"
        >
          <X className="h-4 w-4 text-current" />
        </button>
      )}
    </div>
  );
}
