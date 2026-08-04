import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
        };
      case 'error':
        return {
          iconBg: 'bg-rose-100',
          iconColor: 'text-rose-600',
          buttonBg: 'bg-rose-600 hover:bg-rose-700',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          buttonBg: 'bg-amber-600 hover:bg-amber-700',
        };
      case 'confirm':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          iconBg: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
          buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
        };
    }
  };

  const styles = getTypeStyles();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ position: 'fixed', inset: 0 }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md sm:max-w-lg w-full max-h-[min(92dvh,720px)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`${styles.iconBg} ${styles.iconColor} p-2 rounded-lg flex-shrink-0`}>
              {getIcon()}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          {type === 'confirm' && onConfirm ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 sm:py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium transition-colors text-sm sm:text-base min-h-[44px]"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-4 py-2.5 sm:py-3 ${styles.buttonBg} text-white rounded-lg font-medium transition-colors text-sm sm:text-base min-h-[44px]`}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`w-full px-4 py-2.5 sm:py-3 ${styles.buttonBg} text-white rounded-lg font-medium transition-colors text-sm sm:text-base min-h-[44px]`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
