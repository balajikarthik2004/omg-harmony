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

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  containerClassName = '',
  bodyClassName = 'px-4 pt-2.5 pb-4 sm:px-5 sm:pt-3 sm:pb-5',
  headerClassName = '',
}) => {
  if (!open) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-auto animate-slide-up max-h-[92vh] sm:max-h-[88vh] flex flex-col border border-border/70 overflow-hidden',
          containerClassName
        )}
        onClick={e => e.stopPropagation()}
      >
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-2.5 border-b border-border/70 bg-card/95 backdrop-blur-xs shrink-0',
            headerClassName
          )}
        >
          <h2 className="text-sm sm:text-base font-display font-semibold text-foreground truncate pr-2">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:rotate-90 shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn('bg-card text-foreground overflow-y-auto flex-1', bodyClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
