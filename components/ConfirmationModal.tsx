import React from 'react';
import { Button } from './ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-war-panel border border-zinc-700 rounded-lg p-6 max-w-md w-full shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <h3 className="text-xl font-orbitron font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} className="text-xs">
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm} 
            className={`text-xs ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
