import React from 'react';
import { toast } from 'sonner';
import { Check, CheckCircle2, Layers, RotateCw, X } from 'lucide-react';
import { fmtMoney, fmtQty } from '@/lib/inventory';

export interface StockNotificationProps {
  id?: string | number;
  poNumber?: string;
  refNo?: string;
  storeName?: string;
  party?: string;
  totalValue?: number;
  items: Array<{ name: string; qty: number; unit?: string }>;
  onViewStock?: () => void;
  onDismiss?: () => void;
  duration?: number;
}

export const StockNotificationCard: React.FC<StockNotificationProps> = ({
  poNumber,
  refNo,
  storeName,
  party,
  totalValue,
  items,
  onViewStock,
  onDismiss,
  duration = 5000,
}) => {
  return (
    <div
      className="relative w-full min-w-[340px] max-w-[390px] overflow-hidden rounded-xl border border-emerald-500/30 bg-background/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md dark:bg-card/95 transition-all animate-in slide-in-from-top-2 fade-in duration-250"
      style={{
        borderTop: '3.5px solid #10b981', // Green shade top border
        boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.16), 0 2px 10px -2px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Top green accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400" />

      <div className="flex items-start gap-2.5">
        {/* Rotating Main Loading / Sync Icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 shadow-inner mt-0.5">
          <RotateCw
            className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400"
            style={{ animationDuration: '2s' }}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-bold tracking-tight text-foreground">
                Stock Quantity Appended
              </h4>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20">
                <Layers className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                Updated in Stock
              </span>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground rounded-md p-0.5 transition-colors hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Compact Items & Summary Box */}
          <div className="mt-1.5 rounded-lg bg-muted/40 px-2.5 py-1.5 border border-border/50 text-xs">
            <div className="flex flex-wrap gap-1 items-center">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/90 border border-emerald-500/20 text-foreground text-[11px] font-medium shadow-2xs"
                >
                  <span className="truncate max-w-[120px]">{it.name}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{fmtQty(it.qty)} {it.unit ?? ''}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 mt-1 border-t border-border/40">
              <span className="truncate max-w-[180px]">
                {storeName ? `Store: ${storeName}` : (party ? `From: ${party}` : (poNumber ? `Order: ${poNumber}` : ''))}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {totalValue ? <span className="font-semibold text-foreground">{fmtMoney(totalValue)}</span> : null}
                {refNo && <span className="font-mono bg-muted px-1 rounded text-muted-foreground">{refNo}</span>}
              </div>
            </div>
          </div>

          {/* Footer Action Row */}
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1 text-[10.5px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Ledger recorded
            </span>
            {onViewStock && (
              <button
                type="button"
                onClick={() => {
                  onViewStock();
                  onDismiss?.();
                }}
                className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
              >
                View in Stock table &rarr;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar with Green Gradient */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-emerald-950/10 dark:bg-emerald-950/40">
        <div
          className="h-full rounded-full toast-progress-bar bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-xs"
          style={
            {
              '--toast-duration': `${duration}ms`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
};

export function triggerStockNotification(props: Omit<StockNotificationProps, 'onDismiss'>) {
  const duration = props.duration ?? 5000;
  toast.custom(
    t => (
      <StockNotificationCard
        {...props}
        duration={duration}
        onDismiss={() => toast.dismiss(t)}
      />
    ),
    {
      duration,
      position: 'top-right',
    }
  );
}
