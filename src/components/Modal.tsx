import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  containerClassName?: string;
  bodyClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, containerClassName = '', bodyClassName = 'p-6' }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up max-h-[90vh] overflow-y-auto border border-border/50 ${containerClassName}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/70 bg-card">
          <h2 className="text-lg font-display font-semibold text-foreground">{title}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full hover:bg-muted/80 text-foreground transition-all duration-200 hover:rotate-90"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={`${bodyClassName} bg-card text-foreground`}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
