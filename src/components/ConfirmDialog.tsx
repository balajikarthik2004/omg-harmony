import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, onClose, onConfirm, title, message }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        <div className="flex gap-3 p-6 pt-0 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
