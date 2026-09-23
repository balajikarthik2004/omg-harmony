import React from 'react';
import { AlertOctagon, AlertTriangle, ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CheckCircle2, Gift, PackageX, Scale, Trash2, TrendingUp, Warehouse } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  InventoryItem, ItemSummary, MOVEMENT_META, MovementType, StockStatus, StoreId, fmtQty,
} from '@/lib/inventory';
import { cn } from '@/lib/utils';

export const inputCls =
  'w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60 disabled:cursor-not-allowed';
export const selectCls = `${inputCls} pr-8`;
export const thCls = 'text-left px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap';
export const tdCls = 'px-3 py-3 align-middle';

export function useInventoryRole() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return {
    userName: user?.name ?? 'Store Keeper',
    isAdmin,
    canAdjust: isAdmin,
    canApprove: isAdmin,
    canArchive: isAdmin,
  };
}

/** What staff see; the underlying status names stay stable for data and exports. */
export const STATUS_LABEL: Record<StockStatus, string> = {
  'Out of Stock': 'Out of stock',
  Critical: 'Very low',
  'Low Stock': 'Low',
  Healthy: 'In stock',
  Overstock: 'Excess',
};

const STATUS_STYLE: Record<StockStatus, { cls: string; Icon: React.ElementType }> = {
  'Out of Stock': { cls: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900', Icon: PackageX },
  Critical: { cls: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900', Icon: AlertOctagon },
  'Low Stock': { cls: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900', Icon: AlertTriangle },
  Healthy: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900', Icon: CheckCircle2 },
  Overstock: { cls: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900', Icon: TrendingUp },
};

export const StockStatusBadge: React.FC<{ status: StockStatus; className?: string }> = ({ status, className }) => {
  const { cls, Icon } = STATUS_STYLE[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap', cls, className)}>
      <Icon className="h-3 w-3" aria-hidden /> {STATUS_LABEL[status]}
    </span>
  );
};

const MOVEMENT_ICON: Record<MovementType, React.ElementType> = {
  OPENING: Warehouse,
  RECEIPT: ArrowDownLeft,
  DONATION: Gift,
  ISSUE: ArrowUpRight,
  TRANSFER_OUT: ArrowLeftRight,
  TRANSFER_IN: ArrowLeftRight,
  ADJUSTMENT: Scale,
  WASTAGE: Trash2,
};

export const MovementBadge: React.FC<{ type: MovementType }> = ({ type }) => {
  const Icon = MOVEMENT_ICON[type];
  const dir = MOVEMENT_META[type].direction;
  const cls = type === 'WASTAGE'
    ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-900'
    : type === 'DONATION'
      ? 'text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-950/40 dark:border-violet-900'
      : dir === 'in'
        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900'
        : dir === 'out'
          ? 'text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-900/60 dark:border-slate-700'
          : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900';
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap', cls)}>
      <Icon className="h-3 w-3" aria-hidden /> {MOVEMENT_META[type].label}
    </span>
  );
};

export const Field: React.FC<{ label: string; hint?: string; required?: boolean; className?: string; children: React.ReactNode }> = ({ label, hint, required, className, children }) => (
  <label className={cn('block space-y-1.5', className)}>
    <span className="text-xs font-semibold text-foreground">
      {label}{required && <span className="text-destructive"> *</span>}
    </span>
    {children}
    {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
  </label>
);

export const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className="space-y-3">
    <legend className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</legend>
    {children}
  </fieldset>
);

export const ErrorNote: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> <span>{message}</span>
    </div>
  ) : null;

/** Stock bar scaled to the item's own maximum, with the reorder level marked. */
export const StockBar: React.FC<{ item: InventoryItem; onHand: number; status: StockStatus }> = ({ item, onHand, status }) => {
  const scale = Math.max(item.maxStock * 1.15, onHand, 1);
  const pct = Math.min(100, (onHand / scale) * 100);
  const reorderPct = Math.min(100, (item.reorderLevel / scale) * 100);
  const maxPct = Math.min(100, (item.maxStock / scale) * 100);
  const color = status === 'Out of Stock' || status === 'Critical' ? 'bg-red-500' : status === 'Low Stock' ? 'bg-amber-500' : status === 'Overstock' ? 'bg-sky-500' : 'bg-emerald-500';
  return (
    <div className="w-full min-w-[120px]" title={`${fmtQty(onHand)} ${item.unit} in stock · reorder at ${fmtQty(item.reorderLevel)} · maximum ${fmtQty(item.maxStock)}`}>
      <div className="relative h-2 rounded-full bg-muted overflow-visible">
        <div className={cn('absolute inset-y-0 left-0 rounded-full', color)} style={{ width: `${pct}%` }} />
        <div className="absolute -top-1 -bottom-1 w-0.5 bg-foreground/60 rounded" style={{ left: `${reorderPct}%` }} />
        <div className="absolute -top-0.5 -bottom-0.5 w-px bg-foreground/25" style={{ left: `${maxPct}%` }} />
      </div>
    </div>
  );
};

export function itemLabel(item: InventoryItem) {
  return `${item.code} · ${item.name}`;
}

export const ItemSelect: React.FC<{
  items: InventoryItem[];
  summaries: Record<string, ItemSummary>;
  value: string;
  onChange: (id: string) => void;
  store?: StoreId;
  placeholder?: string;
  disabled?: boolean;
}> = ({ items, summaries, value, onChange, store, placeholder = 'Select item', disabled }) => (
  <select className={selectCls} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
    <option value="">{placeholder}</option>
    {items.map(i => {
      const qty = store ? summaries[i.id]?.byStore[store] ?? 0 : summaries[i.id]?.onHand ?? 0;
      return <option key={i.id} value={i.id}>{i.name} - {fmtQty(qty)} {i.unit} available</option>;
    })}
  </select>
);

export const EmptyRow: React.FC<{ colSpan: number; message: string }> = ({ colSpan, message }) => (
  <tr><td colSpan={colSpan} className="p-10 text-center text-sm text-muted-foreground">{message}</td></tr>
);

export const Pager: React.FC<{ page: number; pageSize: number; total: number; onPage: (p: number) => void; onPageSize: (n: number) => void }> = ({ page, pageSize, total, onPage, onPageSize }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border text-xs text-muted-foreground">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-2">
        <select className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={pageSize} onChange={e => onPageSize(Number(e.target.value))} aria-label="Rows per page">
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button className="h-8 px-3 rounded-md border border-input bg-background disabled:opacity-40" disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
        <span className="tabular-nums">{page} / {pages}</span>
        <button className="h-8 px-3 rounded-md border border-input bg-background disabled:opacity-40" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export function parseNum(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
