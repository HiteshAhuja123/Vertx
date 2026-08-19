'use client';

import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropClassName?: string;
  /** Set false for flows that shouldn't be dismissed by a stray click/Escape mid-way (e.g. a payment dialog). */
  dismissible?: boolean;
}

/**
 * Shared overlay shell: fixed positioning, backdrop click-to-close, and Escape-to-close.
 * The caller renders its own surface (div or form) as `children`, keeping full control
 * over the card's width/padding/content while the repeated overlay boilerplate lives once.
 */
export function Modal({
  open,
  onClose,
  children,
  backdropClassName = 'bg-black/75 backdrop-blur-sm',
  dismissible = true,
}: ModalProps) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className={`absolute inset-0 ${backdropClassName}`} onClick={dismissible ? onClose : undefined} />
      {children}
    </div>
  );
}
