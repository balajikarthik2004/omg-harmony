import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  containerClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, containerClassName = '', bodyClassName = 'p-5', headerClassName = '' }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={cn('bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up max-h-[90vh] overflow-y-auto border border-border/50', containerClassName)}
        onClick={e => e.stopPropagation()}
      >
        <div className={cn('flex items-center justify-between px-5 py-3 border-b border-border/70 bg-card', headerClassName)}>
          <h2 className="text-base font-display font-semibold text-foreground">{title}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted/80 text-foreground transition-all duration-200 hover:rotate-90"
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
