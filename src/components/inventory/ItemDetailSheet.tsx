import React, { useMemo } from 'react';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, MoreHorizontal, Pencil, Scale, ShoppingCart, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { STORES, StoreId, daysBetween, fmtDate, fmtDateTime, fmtMoney, fmtQty } from '@/lib/inventory';
import { MovementBadge, StockBar, StockStatusBadge, useInventoryRole } from './shared';

export type ItemAction = 'receive' | 'issue' | 'transfer' | 'adjust' | 'wastage' | 'edit' | 'po';

const ItemDetailSheet: React.FC<{
  itemId: string | null;
  onClose: () => void;
  onAction: (action: ItemAction, itemId: string, extra?: { store?: StoreId; batchNo?: string }) => void;
  onOrder: Record<string, number>;
}> = ({ itemId, onClose, onAction, onOrder }) => {
  const { state, summaries } = useInventoryStore();
  const { canAdjust } = useInventoryRole();
  const item = state.items.find(i => i.id === itemId);
  const s = item ? summaries[item.id] : null;

  const history = useMemo(
    () => (item ? state.movements.filter(m => m.itemId === item.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 25) : []),
    [state.movements, item],
  );

  const now = new Date();
  const lasts = s?.daysCover == null ? 'Not used recently' : s.daysCover >= 60 ? 'Over 2 months' : s.daysCover < 1 ? 'Less than a day' : `About ${Math.round(s.daysCover)} day${Math.round(s.daysCover) === 1 ? '' : 's'}`;

  return (
    <Sheet open={!!item} onOpenChange={o => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        {item && s && (
          <div className="flex flex-col">
            <SheetHeader className="p-6 pb-5 border-b border-border text-left space-y-2">
              <div className="flex items-center gap-2">
                <StockStatusBadge status={s.status} />
                {!item.active && <span className="text-[11px] rounded-full border px-2 py-0.5 text-muted-foreground">Archived</span>}
              </div>
              <SheetTitle className="text-xl font-display">{item.name}</SheetTitle>
              <SheetDescription>
                {item.localName && `${item.localName} · `}{item.category} · Code {item.code}
              </SheetDescription>
              {item.active && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" onClick={() => onAction('receive', item.id)}><ArrowDownLeft className="h-4 w-4 mr-1" />Receive</Button>
                  <Button size="sm" variant="outline" onClick={() => onAction('issue', item.id)} disabled={s.onHand <= 0}><ArrowUpRight className="h-4 w-4 mr-1" />Request</Button>
                  <Button size="sm" variant="outline" onClick={() => onAction('po', item.id)}><ShoppingCart className="h-4 w-4 mr-1" />Order</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" aria-label="More actions"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem disabled={s.onHand <= 0} onClick={() => onAction('transfer', item.id)}><ArrowLeftRight className="h-4 w-4 mr-2" />Move to another store</DropdownMenuItem>
                      <DropdownMenuItem disabled={s.onHand <= 0} onClick={() => onAction('wastage', item.id)}><Trash2 className="h-4 w-4 mr-2" />Write off</DropdownMenuItem>
                      {canAdjust && <DropdownMenuItem onClick={() => onAction('adjust', item.id)}><Scale className="h-4 w-4 mr-2" />Correct quantity</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => onAction('edit', item.id)}><Pencil className="h-4 w-4 mr-2" />Edit details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </SheetHeader>

            <div className="p-6 space-y-7">
              <section className="grid grid-cols-2 gap-3">
                {[
                  ['In stock', `${fmtQty(s.onHand)} ${item.unit}`],
                  ['Will last', lasts],
                  ['Ordered, not received', (onOrder[item.id] ?? 0) > 0 ? `${fmtQty(onOrder[item.id])} ${item.unit}` : 'None'],
                  ['Stock value', fmtMoney(s.value)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-base font-semibold tabular-nums mt-0.5">{value}</p>
                  </div>
                ))}
              </section>

              <section className="space-y-2">
                <StockBar item={item} onHand={s.onHand} status={s.status} />
                <p className="text-xs text-muted-foreground">
                  Reorder when it falls to <b className="text-foreground">{fmtQty(item.reorderLevel)} {item.unit}</b> · keep up to {fmtQty(item.maxStock)} {item.unit} · uses about {fmtQty(s.avgDaily)} {item.unit} a day
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold mb-2">Where it is stored</h3>
                <div className="grid grid-cols-3 gap-3">
                  {STORES.map(st => (
                    <div key={st.id} className="rounded-lg border border-border px-3 py-2">
                      <p className="text-xs text-muted-foreground">{st.name}</p>
                      <p className="text-base font-semibold tabular-nums">{fmtQty(s.byStore[st.id])} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span></p>
                    </div>
                  ))}
                </div>
              </section>

              {item.perishable && s.batches.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold mb-2">Expiry dates</h3>
                  <ul className="rounded-lg border border-border divide-y divide-border text-sm">
                    {s.batches.map(b => {
                      const days = b.expiryDate ? daysBetween(b.expiryDate, now) : null;
                      const expired = days !== null && days < 0;
                      const soon = days !== null && days >= 0 && days <= 15;
                      return (
                        <li key={`${b.store}-${b.batchNo}`} className="flex items-center justify-between gap-3 px-3 py-2">
                          <span className="tabular-nums font-medium">{fmtQty(b.qty)} {item.unit} <span className="font-normal text-muted-foreground">in {STORES.find(x => x.id === b.store)?.short}</span></span>
                          <span className="flex items-center gap-2">
                            <span className={expired ? 'text-destructive font-semibold' : soon ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-muted-foreground'}>
                              {expired ? `Expired ${fmtDate(b.expiryDate)}` : `Expires ${fmtDate(b.expiryDate)}`}
                            </span>
                            {(expired || soon) && item.active && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => onAction('wastage', item.id, { store: b.store, batchNo: b.batchNo })}>Write off</Button>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              <section>
                <h3 className="text-sm font-semibold mb-2">Recent activity</h3>
                <ul className="rounded-lg border border-border divide-y divide-border">
                  {history.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No activity yet.</li>}
                  {history.map(m => (
                    <li key={m.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <MovementBadge type={m.type} />
                          <span className="text-xs text-muted-foreground">{fmtDateTime(m.date)}</span>
                          {m.poNumber && (
                            <span className="text-[11px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                              PO #{m.poNumber}
                            </span>
                          )}
                          {m.refNo && (
                            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {m.refNo}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {[m.party, m.purpose, m.reason].filter(Boolean).join(' · ') || STORES.find(x => x.id === m.store)?.name} · by {m.user}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold tabular-nums whitespace-nowrap ${m.qty > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{m.qty > 0 ? '+' : ''}{fmtQty(m.qty)} {item.unit}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="text-xs text-muted-foreground border-t border-border pt-4 space-y-1">
                <p>Supplier: <span className="text-foreground">{item.supplier || 'Not set'}</span> · Delivery takes about {item.leadTimeDays} day{item.leadTimeDays === 1 ? '' : 's'}</p>
                <p>Average cost: <span className="text-foreground">{fmtMoney(s.avgCost)} per {item.unit}</span>{item.perishable && ` · Shelf life ${item.shelfLifeDays} days`}</p>
                {item.notes && <p>Notes: <span className="text-foreground">{item.notes}</span></p>}
              </section>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ItemDetailSheet;
