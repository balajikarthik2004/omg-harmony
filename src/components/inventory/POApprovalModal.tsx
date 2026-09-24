import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Info, PackagePlus, Trash2, XCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { formatPODate, procurementActions, useProcurementStore } from '@/hooks/useProcurementStore';
import { STORES, StoreId, fmtMoney, fmtQty, matchPOLineItem, round3, suggestedStore } from '@/lib/inventory';
import { cn } from '@/lib/utils';
import { evaluatePO } from '@/lib/poEvaluation';
import POEvaluationPanel, { FindingChip } from './POEvaluationPanel';
import { ErrorNote, Field, STORE_ICON, StoreBadge, inputCls, parseNum, useInventoryRole } from './shared';

interface Line {
  key: string;
  name: string;
  unit: string;
  itemId: string;
  qty: string;
  price: string;
  store: StoreId;
  origQty: number;
  origPrice: number;
  origStore: StoreId;
}

const storeOptions = STORES.map(s => ({ value: s.id, label: s.name }));

/** Admin review of a pending purchase order: check each line, confirm where it goes, adjust, then approve or reject. */
const POApprovalModal: React.FC<{ poId: string | null; onClose: () => void }> = ({ poId, onClose }) => {
  const { state, summaries } = useInventoryStore();
  const { items: pos } = useProcurementStore();
  const { userName } = useInventoryRole();
  const po = pos.find(p => p.id === poId);

  const [vendor, setVendor] = useState('');
  const [expected, setExpected] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [evalRun, setEvalRun] = useState(0);

  useEffect(() => {
    if (!po) return;
    setEvalRun(0);
    setVendor(po.vendor);
    setExpected(po.expectedDate ?? '');
    setNote(''); setReason(''); setRejecting(false); setError(null);
    setLines(po.items.map((l, idx) => {
      const itemId = matchPOLineItem(state.items, l);
      const item = state.items.find(i => i.id === itemId);
      const store = suggestedStore(state.items, l);
      return {
        key: `${idx}`, name: l.name, unit: l.unit ?? item?.unit ?? '', itemId,
        qty: String(l.quantity), price: String(l.price), store,
        origQty: l.quantity, origPrice: l.price, origStore: store,
      };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poId]);

  const update = (key: string, patch: Partial<Line>) => setLines(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)));
  const kept = lines.filter(l => parseNum(l.qty) > 0);
  const total = kept.reduce((s, l) => s + parseNum(l.qty) * parseNum(l.price), 0);
  const originalTotal = po?.amount ?? 0;
  const removed = (po?.items.length ?? 0) - kept.length;
  const edited = removed > 0 || vendor.trim() !== po?.vendor || lines.some(l =>
    parseNum(l.qty) !== l.origQty || parseNum(l.price) !== l.origPrice || l.store !== l.origStore);

  const byStore = useMemo(() => STORES.map(s => {
    const group = kept.filter(l => l.store === s.id);
    return { ...s, count: group.length, value: group.reduce((a, l) => a + parseNum(l.qty) * parseNum(l.price), 0) };
  }), [kept]);

  // Once run, the evaluation follows every edit so the advice always matches what will be approved.
  const evaluation = useMemo(() => (!po || !evalRun ? null : evaluatePO({
    poId: po.id, supplier: vendor, expectedDate: expected || undefined, state, summaries, pos,
    lines: lines.map(l => ({ key: l.key, name: l.name, itemId: l.itemId || undefined, qty: parseNum(l.qty), price: parseNum(l.price), store: l.store })),
  })), [evalRun, po, vendor, expected, lines, state, summaries, pos]);
  const lineEval = (key: string) => evaluation?.lines.find(x => x.key === key);

  const applySuggestions = () => {
    if (!evaluation) return;
    setLines(prev => prev.map(l => {
      const e = evaluation.lines.find(x => x.key === l.key);
      if (!e) return l;
      return { ...l, qty: e.suggestedQty !== null ? String(e.suggestedQty) : l.qty, price: e.suggestedPrice !== null ? String(e.suggestedPrice) : l.price };
    }));
    toast.success('Suggestions applied', { description: 'Check the changes, then approve.' });
  };

  if (!po) return null;

  const approve = () => {
    try {
      setError(null);
      if (po.status !== 'Pending') throw new Error(`${po.poNumber} was already ${po.status.toLowerCase()}. Close this form and refresh.`);
      if (!vendor.trim()) throw new Error('Supplier is required.');
      if (!kept.length) throw new Error('Keep at least one item with a quantity, or reject the order instead.');
      const noRate = kept.find(l => !(parseNum(l.price) > 0));
      if (noRate) throw new Error(`${noRate.name}: enter a rate above zero.`);
      const today = formatPODate();
      procurementActions.update(po.id, {
        vendor: vendor.trim(),
        expectedDate: expected || undefined,
        amount: Math.round(total),
        items: kept.map(l => ({
          name: l.name, quantity: round3(parseNum(l.qty)), price: parseNum(l.price), unit: l.unit || undefined,
          itemId: l.itemId || undefined, store: l.store,
        })),
        status: 'Approved', approvedBy: userName, approvedByName: userName, approvedDate: today,
        approvalNote: [note.trim(), evaluation && `AI check ${evaluation.score}/100`].filter(Boolean).join(' · ') || undefined,
        revisedOnApproval: edited,
      });
      const where = byStore.filter(s => s.count).map(s => `${s.short} ${s.count}`).join(' · ');
      toast.success(`${po.poNumber} approved`, { description: `${fmtMoney(total)} · deliver to ${where}${edited ? ' · revised' : ''}` });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const reject = () => {
    if (po.status !== 'Pending') { setError(`${po.poNumber} was already ${po.status.toLowerCase()}.`); return; }
    if (!reason.trim()) { setError('Give a reason so the requester knows what to change.'); return; }
    procurementActions.update(po.id, {
      status: 'Rejected', rejectedBy: userName, rejectedByName: userName, rejectedDate: formatPODate(), rejectionReason: reason.trim(),
    });
    toast.success(`${po.poNumber} rejected`);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={`Review Purchase Order · ${po.poNumber}`} containerClassName="max-w-6xl w-full" bodyClassName="px-4 py-3 sm:px-6 sm:py-4">
      <div className="inventory-form-shell space-y-4">
        <ErrorNote message={error} />

        {/* Who asked, for what, and when */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl border border-border bg-muted/20 p-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Order</p>
            <p className="text-sm font-semibold mt-1 flex items-center gap-2">{po.poNumber} <StatusBadge status={po.status} /></p>
            <p className="text-xs text-muted-foreground">Raised {po.date}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Requested by</p>
            <p className="text-sm font-semibold mt-1">{po.submittedByName || po.submittedBy || '-'}</p>
            <p className="text-xs text-muted-foreground">{po.source === 'inventory' ? 'From inventory reorder' : po.source === 'agent' ? 'From purchase request' : 'Manual entry'}</p>
          </div>
          <Field label="Supplier" required>
            <input className={inputCls} value={vendor} onChange={e => setVendor(e.target.value)} />
          </Field>
          <Field label="Expected delivery">
            <DatePicker value={expected} onChange={setExpected} />
          </Field>
        </div>
        {po.notes && (
          <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><span className="font-semibold">Requester note:</span> {po.notes}</span>
          </div>
        )}

        <POEvaluationPanel evaluation={evaluation} lineNames={Object.fromEntries(lines.map(l => [l.key, l.name]))}
          onRun={() => setEvalRun(n => n + 1)} onApply={applySuggestions} />

        {/* Where the goods will land */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery by store</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Send everything to</span>
              <div className="w-40">
                <ThemeSelect value="" placeholder="Choose store" options={storeOptions} aria-label="Send all lines to store"
                  onChange={v => v && setLines(prev => prev.map(l => ({ ...l, store: v as StoreId })))} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {byStore.map(s => {
              const Icon = STORE_ICON[s.id];
              return (
                <div key={s.id} className={cn('flex items-center gap-3 rounded-xl border p-3', s.count ? 'border-primary/30 bg-primary/5' : 'border-border bg-background opacity-70')}>
                  <Icon className={cn('h-5 w-5', s.count ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.count ? `${s.count} item${s.count > 1 ? 's' : ''}` : 'Nothing for this store'}</p>
                  </div>
                  {s.count > 0 && <span className="text-sm font-bold tabular-nums">{fmtMoney(s.value)}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Line-by-line review */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-muted/50">
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="text-left px-3 py-2">Item</th>
                  <th className="text-left px-3 py-2 w-44">Deliver to</th>
                  <th className="text-right px-3 py-2 w-36">Now in that store</th>
                  <th className="text-right px-3 py-2 w-28">Qty</th>
                  <th className="text-right px-3 py-2 w-28">Rate (₹)</th>
                  <th className="text-right px-3 py-2 w-28">Amount</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    <PackagePlus className="h-6 w-6 mx-auto mb-1 opacity-40" />Every line was removed. Reject the order instead.
                  </td></tr>
                )}
                {lines.map(l => {
                  const item = state.items.find(i => i.id === l.itemId);
                  const inStore = item ? summaries[item.id]?.byStore[l.store] ?? 0 : null;
                  const qty = parseNum(l.qty);
                  const price = parseNum(l.price);
                  const qtyChanged = qty !== l.origQty;
                  const priceChanged = price !== l.origPrice;
                  const ev = lineEval(l.key);
                  return (
                    <tr key={l.key} className={cn('border-t border-border align-top', qty <= 0 && 'opacity-50')}>
                      <td className="px-3 py-2">
                        <p className="font-semibold">{l.name}</p>
                        {item
                          ? <p className="text-[11px] text-muted-foreground">{item.code} · {item.category} · home: {STORES.find(s => s.id === item.defaultStore)?.short}</p>
                          : <p className="text-[11px] text-amber-600 dark:text-amber-400">Not in item master yet · added when received</p>}
                        {ev && (
                          <div className="mt-1.5 space-y-1">
                            {ev.daysCover !== null && (
                              <p className="text-[11px] text-muted-foreground">
                                Uses {fmtQty(Math.round(ev.avgDaily * 100) / 100)} {item?.unit}/day · lasts {Math.floor(ev.daysCover)} days
                                {ev.usualRate !== null && ` · usual rate ${fmtMoney(ev.usualRate)}`}
                              </p>
                            )}
                            {ev.findings.length > 0 && <div className="flex flex-wrap gap-1">{ev.findings.map((f, i) => <FindingChip key={i} finding={f} />)}</div>}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <ThemeSelect value={l.store} onChange={v => update(l.key, { store: v as StoreId })} options={storeOptions} aria-label={`Store for ${l.name}`} />
                        {l.store !== l.origStore && <p className="text-[11px] text-muted-foreground mt-1">was <StoreBadge store={l.origStore} /></p>}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                        {item && inStore !== null ? (
                          <>
                            <p className="font-medium">{fmtQty(inStore)} {item.unit}</p>
                            <p className="text-[11px] text-muted-foreground">reorder at {fmtQty(item.reorderLevel)}</p>
                          </>
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} step="any" className={cn(inputCls, 'text-right', qtyChanged && 'border-amber-400')} value={l.qty}
                          onChange={e => update(l.key, { qty: e.target.value })} aria-label={`Quantity for ${l.name}`} />
                        <p className="text-[11px] text-muted-foreground text-right mt-1">{qtyChanged ? `was ${fmtQty(l.origQty)}` : l.unit}</p>
                        {ev?.suggestedQty != null && (
                          <button type="button" className="block ml-auto text-[11px] font-semibold text-primary hover:underline" onClick={() => update(l.key, { qty: String(ev.suggestedQty) })}>
                            Use {fmtQty(ev.suggestedQty)}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} step="any" className={cn(inputCls, 'text-right', priceChanged && 'border-amber-400')} value={l.price}
                          onChange={e => update(l.key, { price: e.target.value })} aria-label={`Rate for ${l.name}`} />
                        {priceChanged && <p className="text-[11px] text-muted-foreground text-right mt-1">was {fmtMoney(l.origPrice)}</p>}
                        {ev?.suggestedPrice != null && (
                          <button type="button" className="block ml-auto text-[11px] font-semibold text-primary hover:underline" onClick={() => update(l.key, { price: String(ev.suggestedPrice) })}>
                            Use {fmtMoney(ev.suggestedPrice)}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold whitespace-nowrap pt-4">{fmtMoney(qty * price)}</td>
                      <td className="px-1.5 py-2 pt-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label={`Remove ${l.name}`}
                          onClick={() => setLines(prev => prev.filter(x => x.key !== l.key))}><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 border-t border-border bg-muted/30 text-sm">
            <span className="text-xs text-muted-foreground">
              {kept.length} item{kept.length === 1 ? '' : 's'}{removed > 0 && ` · ${removed} removed`}{edited && ' · changes will be recorded on the order'}
            </span>
            <span className="font-semibold">
              {Math.round(total) !== Math.round(originalTotal) && <span className="text-muted-foreground line-through font-normal mr-2">{fmtMoney(originalTotal)}</span>}
              Total {fmtMoney(total)}
            </span>
          </div>
        </div>

        {rejecting ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-3">
            <Field label="Reason for rejecting" required hint="The requester sees this on the order.">
              <textarea className={cn(inputCls, 'h-20 py-2 resize-none')} value={reason} onChange={e => setReason(e.target.value)} autoFocus
                placeholder="e.g. Rice already ordered on PO-1046; raise dal separately" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRejecting(false); setError(null); }}>Back to review</Button>
              <Button variant="destructive" onClick={reject}><XCircle className="h-4 w-4 mr-1.5" />Reject order</Button>
            </div>
          </div>
        ) : (
          <>
            <Field label="Approval note (optional)" hint="Saved on the order, e.g. why a quantity or rate was changed.">
              <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Reduced rice to 5 bags, kitchen has enough for this week" />
            </Field>
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
              <Button variant="ghost" className="text-destructive hover:text-destructive justify-start" onClick={() => { setRejecting(true); setError(null); }}>
                <XCircle className="h-4 w-4 mr-1.5" />Reject…
              </Button>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={approve} className="inventory-cta"><CheckCircle2 className="h-4 w-4 mr-1.5" />{edited ? 'Approve with changes' : 'Approve order'}</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default POApprovalModal;
