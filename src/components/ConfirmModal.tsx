import React from 'react';
import { AlertTriangle, LogOut, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  iconType?: 'trash' | 'logout' | 'alert';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  iconType = 'alert',
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (iconType === 'trash') return <Trash2 className="w-5 h-5 text-rose-500" />;
    if (iconType === 'logout') return <LogOut className="w-5 h-5 text-amber-500" />;
    return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  };

  const getConfirmButtonClass = () => {
    if (variant === 'danger') {
      return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25';
    }
    if (variant === 'warning') {
      return 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25';
    }
    return 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25';
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {getIcon()}
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer ${getConfirmButtonClass()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
