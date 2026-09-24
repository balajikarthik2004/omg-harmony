import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Info, Trash2, XCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { ThemeSelect } from '@/components/ui/theme-select';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { ISSUE_PURPOSES, StoreId, fmtDateTime, fmtMoney, fmtQty, round3, storeName } from '@/lib/inventory';
import { cn } from '@/lib/utils';
import { ErrorNote, Field, ItemSelect, StorePicker, inputCls, parseNum, useInventoryRole } from './shared';

interface Line { key: string; itemId: string; qty: string; requested: number | null }

const newKey = () => Math.random().toString(36).slice(2);

/** Admin review of a stock usage request: confirm the store, adjust quantities, then approve (posts the issue) or reject. */
const StockRequestApprovalModal: React.FC<{ requestId: string | null; onClose: () => void }> = ({ requestId, onClose }) => {
  const { state, summaries, actions } = useInventoryStore();
  const { userName } = useInventoryRole();
  const request = state.requests.find(r => r.id === requestId);
  const activeItems = useMemo(() => state.items.filter(i => i.active), [state.items]);
  const template = state.templates.find(t => t.id === request?.templateId);

  const [store, setStore] = useState<StoreId>('MAIN');
  const [purpose, setPurpose] = useState('');
  const [party, setParty] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!request) return;
    setStore(request.store); setPurpose(request.purpose); setParty(request.party);
    setLines(request.lines.map(l => ({ key: newKey(), itemId: l.itemId, qty: String(l.qty), requested: l.qty })));
    setNote(''); setReason(''); setRejecting(false); setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const available = (itemId: string, s: StoreId) => summaries[itemId]?.usableByStore[s] ?? 0;
  const active = lines.filter(l => l.itemId && parseNum(l.qty) > 0);
  const shortIn = (s: StoreId) => active.filter(l => parseNum(l.qty) > available(l.itemId, s) + 0.0001);
  const short = shortIn(store);
  const value = active.reduce((a, l) => a + parseNum(l.qty) * (summaries[l.itemId]?.avgCost ?? 0), 0);
  const edited = !!request && (store !== request.store || lines.length !== request.lines.length ||
    lines.some(l => l.requested === null || parseNum(l.qty) !== l.requested));

  if (!request) return null;

  const update = (key: string, patch: Partial<Line>) => setLines(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)));

  const approve = () => {
    try {
      setError(null);
      if (short.length) {
        const names = short.map(l => state.items.find(i => i.id === l.itemId)?.name).join(', ');
        throw new Error(`Not enough stock in ${storeName(store)} for ${names}. Reduce the quantity, pick another store, or move stock there first.`);
      }
      const refNo = actions.approveRequest(request.id, {
        store, purpose, party, note, user: userName,
        lines: active.map(l => ({ itemId: l.itemId, qty: round3(parseNum(l.qty)) })),
      });
      toast.success(`${request.refNo} approved`, { description: `Issued from ${storeName(store)} · Ref ${refNo}${edited ? ' · with changes' : ''}` });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const reject = () => {
    try {
      actions.rejectRequest(request.id, reason, userName);
      toast.success(`${request.refNo} rejected`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Review Stock Request · ${request.refNo}`} containerClassName="max-w-5xl w-full" bodyClassName="px-4 py-3 sm:px-6 sm:py-4">
      <div className="inventory-form-shell space-y-4">
        <ErrorNote message={error} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl border border-border bg-muted/20 p-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Request</p>
            <p className="text-sm font-semibold mt-1 flex items-center gap-2">{request.refNo} <StatusBadge status={request.status} /></p>
            <p className="text-xs text-muted-foreground">{fmtDateTime(request.requestedAt)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Requested by</p>
            <p className="text-sm font-semibold mt-1">{request.requestedBy}</p>
            <p className="text-xs text-muted-foreground">{template ? `Template: ${template.name}` : 'Items chosen manually'}</p>
          </div>
          <Field label="Purpose" required>
            <ThemeSelect value={purpose} onChange={setPurpose} options={ISSUE_PURPOSES.map(p => ({ value: p, label: p }))} />
          </Field>
          <Field label="Issued to" required>
            <input className={inputCls} value={party} onChange={e => setParty(e.target.value)} />
          </Field>
        </div>
        {request.notes && (
          <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><span className="font-semibold">Requester note:</span> {request.notes}</span>
          </div>
        )}

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Issue from store {store !== request.store && <span className="normal-case font-medium text-amber-600 dark:text-amber-400">· changed from {storeName(request.store)}</span>}
          </p>
          <StorePicker value={store} onChange={setStore} note={s => {
            const n = shortIn(s).length;
            return n
              ? <span className="text-destructive font-medium">{n} item{n > 1 ? 's' : ''} short</span>
              : <span className="text-emerald-600 dark:text-emerald-400 font-medium">All items available</span>;
          }} />
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/50">
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="text-left px-3 py-2">Item</th>
                  <th className="text-right px-3 py-2 w-28">Requested</th>
                  <th className="text-right px-3 py-2 w-32">In {storeName(store).replace(' Store', '')}</th>
                  <th className="text-right px-3 py-2 w-32">Approve qty</th>
                  <th className="text-right px-3 py-2 w-32">Left after</th>
                  <th className="text-right px-3 py-2 w-28">Value</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {lines.map(l => {
                  const item = state.items.find(i => i.id === l.itemId);
                  const qty = parseNum(l.qty);
                  const avail = l.itemId ? available(l.itemId, store) : 0;
                  const isShort = qty > avail + 0.0001;
                  const after = round3(avail - qty);
                  const lowAfter = item && !isShort && after < item.minStock;
                  const changed = l.requested !== null && qty !== l.requested;
                  return (
                    <tr key={l.key} className={cn('border-t border-border', isShort && 'bg-destructive/5')}>
                      <td className="px-3 py-2">
                        {l.requested !== null && item ? (
                          <>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">{item.code} · {item.category}</p>
                          </>
                        ) : (
                          <ItemSelect items={activeItems} summaries={summaries} store={store} value={l.itemId} onChange={id => update(l.key, { itemId: id })} placeholder="Add an item" />
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap text-muted-foreground">
                        {l.requested !== null ? `${fmtQty(l.requested)} ${item?.unit ?? ''}` : <span className="text-[11px]">added by you</span>}
                      </td>
                      <td className={cn('px-3 py-2 text-right tabular-nums whitespace-nowrap', isShort ? 'text-destructive font-semibold' : 'text-muted-foreground')}>
                        {item ? `${fmtQty(avail)} ${item.unit}` : '-'}
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} step="any" value={l.qty} onChange={e => update(l.key, { qty: e.target.value })}
                          className={cn(inputCls, 'text-right', isShort ? 'border-destructive' : changed && 'border-amber-400')} aria-label={`Approved quantity for ${item?.name ?? 'item'}`} />
                      </td>
                      <td className={cn('px-3 py-2 text-right tabular-nums whitespace-nowrap', isShort ? 'text-destructive' : lowAfter ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
                        {item ? (isShort ? `short ${fmtQty(-after)}` : `${fmtQty(after)} ${item.unit}`) : '-'}
                        {lowAfter && <p className="text-[10px]">below minimum</p>}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{fmtMoney(qty * (summaries[l.itemId]?.avgCost ?? 0))}</td>
                      <td className="px-1.5 py-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label="Remove line"
                          onClick={() => setLines(prev => prev.filter(x => x.key !== l.key))}><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-border bg-muted/30">
            <Button variant="ghost" size="sm" onClick={() => setLines(prev => [...prev, { key: newKey(), itemId: '', qty: '', requested: null }])}>+ Add item</Button>
            <span className="text-sm font-semibold">
              {active.length} item{active.length === 1 ? '' : 's'} · Value {fmtMoney(value)}
            </span>
          </div>
        </div>

        {rejecting ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-3">
            <Field label="Reason for rejecting" required hint="The requester sees this on the request.">
              <textarea className={cn(inputCls, 'h-20 py-2 resize-none')} value={reason} onChange={e => setReason(e.target.value)} autoFocus
                placeholder="e.g. Annadhanam is cancelled this Saturday" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRejecting(false); setError(null); }}>Back to review</Button>
              <Button variant="destructive" onClick={reject}><XCircle className="h-4 w-4 mr-1.5" />Reject request</Button>
            </div>
          </div>
        ) : (
          <>
            <Field label="Approval note (optional)" hint="Saved on the request and the issue entry.">
              <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Reduced rice, 150 meals confirmed" />
            </Field>
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
              <Button variant="ghost" className="text-destructive hover:text-destructive justify-start" onClick={() => { setRejecting(true); setError(null); }}>
                <XCircle className="h-4 w-4 mr-1.5" />Reject…
              </Button>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={approve} className="inventory-cta" disabled={!active.length}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />{edited ? 'Approve changes & issue' : 'Approve & issue'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default StockRequestApprovalModal;
