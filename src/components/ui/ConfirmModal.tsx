'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open (safer default)
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  const variantStyles = {
    danger: {
      iconBg: 'rgba(239,68,68,0.12)',
      iconColor: '#ef4444',
      confirmBg: '#ef4444',
      confirmHover: '#dc2626',
    },
    warning: {
      iconBg: 'rgba(245,158,11,0.12)',
      iconColor: '#f59e0b',
      confirmBg: '#f59e0b',
      confirmHover: '#d97706',
    },
    info: {
      iconBg: 'var(--app-primary-light)',
      iconColor: 'var(--app-primary)',
      confirmBg: 'var(--app-primary)',
      confirmHover: 'var(--app-secondary)',
    },
  }[variant];

  const defaultIcon = variant === 'danger'
    ? <Trash2 className="w-5 h-5" />
    : <AlertTriangle className="w-5 h-5" />;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[500] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onCancel}
      >
        {/* Modal */}
        <div
          className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{
            background: 'var(--app-bg-card)',
            border: '1px solid var(--app-border)',
          }}
          onClick={e => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 p-1.5 rounded-lg transition-all hover:opacity-70"
            style={{ color: 'var(--app-text-muted)', background: 'var(--app-bg-gray)' }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="px-6 pt-6 pb-5">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: variantStyles.iconBg, color: variantStyles.iconColor }}
            >
              {icon || defaultIcon}
            </div>

            {/* Title */}
            <h2
              id="confirm-title"
              className="text-base font-black mb-1.5"
              style={{ color: 'var(--app-text)' }}
            >
              {title}
            </h2>

            {/* Message */}
            <p
              id="confirm-message"
              className="text-sm leading-relaxed"
              style={{ color: 'var(--app-text-secondary)' }}
            >
              {message}
            </p>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-2.5 px-6 pb-5"
          >
            {/* Cancel */}
            <button
              ref={cancelRef}
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
              style={{
                background: 'var(--app-bg-gray)',
                border: '1px solid var(--app-border)',
                color: 'var(--app-text-secondary)',
              }}
            >
              {cancelLabel}
            </button>

            {/* Confirm */}
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: variantStyles.confirmBg }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Hook to use ConfirmModal imperatively.
 * Usage:
 *   const { confirmModal, askConfirm } = useConfirm();
 *   await askConfirm({ message: 'Delete this?' }) → true/false
 *   return <>{confirmModal}</>
 */
export function useConfirm() {
  const [state, setState] = React.useState<{
    open: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmModalProps['variant'];
    icon?: React.ReactNode;
    resolve?: (value: boolean) => void;
  }>({ open: false, message: '' });

  const askConfirm = React.useCallback((opts: {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmModalProps['variant'];
    icon?: React.ReactNode;
  }): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ ...opts, open: true, resolve });
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true);
    setState(s => ({ ...s, open: false }));
  }, [state]);

  const handleCancel = React.useCallback(() => {
    state.resolve?.(false);
    setState(s => ({ ...s, open: false }));
  }, [state]);

  const confirmModal = (
    <ConfirmModal
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      icon={state.icon}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirmModal, askConfirm };
}
