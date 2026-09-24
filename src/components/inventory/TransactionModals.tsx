import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { RECEIVABLE_PO_STATUSES, ProcurementRecord, formatPODate, procurementActions, useProcurementStore } from '@/hooks/useProcurementStore';
import {
  ADJUST_REASONS, ISSUE_PURPOSES, InventoryItem, STORES, matchPOLineItem, receivedAgainstPO, StoreId, WASTAGE_REASONS, WHOLE_UNITS,
  addDays, fmtDate, fmtMoney, fmtQty, round3, storeName,
} from '@/lib/inventory';
import { toISODate } from '@/lib/utils';
import { ErrorNote, Field, ItemSelect, inputCls, parseNum, selectCls, useInventoryRole } from './shared';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import { triggerStockNotification } from './StockNotificationToast';

const newKey = () => Math.random().toString(36).slice(2);

function dateToISO(day: string) {
  const today = toISODate(new Date());
  if (!day || day === today) return new Date().toISOString();
  return new Date(`${day}T12:00:00`).toISOString();
}

/* ================================================================== */
/* Goods receipt                                                        */
/* ================================================================== */

type ReceiveMode = 'RECEIPT' | 'PO' | 'DONATION';
interface ReceiveLineState { key: string; itemId: string; qty: string; unitCost: string; batchNo: string; expiryDate: string; ordered?: number; received?: number }

export const ReceiveModal: React.FC<{ open: boolean; onClose: () => void; preset?: { itemId?: string; poId?: string; mode?: ReceiveMode } }> = ({ open, onClose, preset }) => {
  const { state, summaries, actions } = useInventoryStore();
  const { items: pos } = useProcurementStore();
  const { userName } = useInventoryRole();
  const activeItems = useMemo(() => state.items.filter(i => i.active), [state.items]);

  const [mode, setMode] = useState<ReceiveMode>('RECEIPT');
  const [store, setStore] = useState<StoreId>('MAIN');
  const [date, setDate] = useState(toISODate(new Date()));
  const [party, setParty] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [notes, setNotes] = useState('');
  const [poId, setPoId] = useState('');
  const [lines, setLines] = useState<ReceiveLineState[]>([]);
  const [error, setError] = useState<string | null>(null);

  const receivablePOs = pos.filter(p => RECEIVABLE_PO_STATUSES.includes(p.status));

  const lineFor = (item: InventoryItem | undefined, day = date): ReceiveLineState => ({
    key: newKey(), itemId: item?.id ?? '', qty: '', unitCost: item ? String(item.unitCost) : '', batchNo: '',
    expiryDate: item?.perishable && item.shelfLifeDays ? toISODate(addDays(new Date(`${day}T12:00:00`), item.shelfLifeDays)) : '',
  });

  const loadPO = (id: string) => {
    setPoId(id);
    const po = pos.find(p => p.id === id);
    if (!po) { setLines([]); return; }
    const received = receivedAgainstPO(state, po.id);
    const next = po.items.map(l => {
      const itemId = matchPOLineItem(state.items, l);
      const item = state.items.find(i => i.id === itemId);
      const done = itemId ? received[itemId] ?? 0 : 0;
      const outstanding = Math.max(0, round3(l.quantity - done));
      return { ...lineFor(item), itemId, qty: outstanding ? String(outstanding) : '', unitCost: String(l.price), ordered: l.quantity, received: done };
    });
    setLines(next);
    setParty(po.vendor);
    const first = state.items.find(i => i.id === next.find(l => l.itemId)?.itemId);
    if (first) setStore(first.defaultStore);
  };

  useEffect(() => {
    if (!open) return;
    setError(null); setParty(''); setInvoiceNo(''); setDonorPhone(''); setReceiptNo(''); setNotes(''); setPoId('');
    setDate(toISODate(new Date()));
    const m = preset?.mode ?? (preset?.poId ? 'PO' : 'RECEIPT');
    setMode(m);
    const item = state.items.find(i => i.id === preset?.itemId);
    setStore(item?.defaultStore ?? 'MAIN');
    if (item && m !== 'DONATION') setParty(item.supplier);
    setLines([lineFor(item)]);
    if (m === 'PO' && preset?.poId) loadPO(preset.poId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const switchMode = (m: ReceiveMode) => {
    setMode(m); setError(null); setPoId(''); setParty('');
    setLines([lineFor(undefined)]);
  };

  const updateLine = (key: string, patch: Partial<ReceiveLineState>) =>
    setLines(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)));

  const pickItem = (key: string, itemId: string) => {
    const item = state.items.find(i => i.id === itemId);
    const fresh = lineFor(item);
    updateLine(key, { itemId, unitCost: mode === 'PO' ? lines.find(l => l.key === key)?.unitCost ?? fresh.unitCost : fresh.unitCost, expiryDate: fresh.expiryDate });
    if (item && mode === 'RECEIPT' && !party) setParty(item.supplier);
    if (item && lines.length === 1) setStore(item.defaultStore);
  };

  const total = lines.reduce((s, l) => s + parseNum(l.qty) * parseNum(l.unitCost), 0);
  const showExpiry = lines.some(l => state.items.find(i => i.id === l.itemId)?.perishable);

  const submit = () => {
    try {
      setError(null);
      const valid = lines.filter(l => l.itemId && parseNum(l.qty) > 0);
      if (!valid.length) throw new Error('Enter a quantity for at least one item.');
      if (mode !== 'DONATION' && !party.trim()) throw new Error('Supplier is required.');
      if (mode === 'DONATION' && !party.trim()) throw new Error('Donor name is required.');
      if (mode === 'PO') {
        if (!poId) throw new Error('Select the order you are receiving.');
        for (const l of valid) {
          const outstanding = round3((l.ordered ?? 0) - (l.received ?? 0));
          if (l.ordered !== undefined && parseNum(l.qty) > outstanding + 0.0001) {
            const item = state.items.find(i => i.id === l.itemId);
            throw new Error(`${item?.name}: only ${fmtQty(outstanding)} is still pending on this order.`);
          }
        }
      }
      const po = pos.find(p => p.id === poId);
      const refNo = actions.receive({
        type: mode === 'DONATION' ? 'DONATION' : 'RECEIPT',
        store, date: dateToISO(date), party: party.trim(), user: userName, notes: notes.trim() || undefined,
        invoiceNo: mode !== 'DONATION' ? invoiceNo.trim() || undefined : undefined,
        donorPhone: mode === 'DONATION' ? donorPhone.trim() || undefined : undefined,
        receiptNo: mode === 'DONATION' ? receiptNo.trim() || undefined : undefined,
        poId: po?.id, poNumber: po?.poNumber,
        lines: valid.map(l => ({ itemId: l.itemId, qty: parseNum(l.qty), unitCost: parseNum(l.unitCost), batchNo: l.batchNo, expiryDate: l.expiryDate || null })),
      });
      if (po) updatePOStatus(po, valid);
      triggerStockNotification({
        poNumber: po?.poNumber,
        refNo,
        storeName: storeName(store),
        party: party.trim(),
        totalValue: total,
        items: valid.map(l => {
          const itm = state.items.find(i => i.id === l.itemId);
          return {
            name: itm?.name || 'Item',
            qty: parseNum(l.qty),
            unit: itm?.unit,
          };
        }),
        duration: 5500,
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const updatePOStatus = (po: ProcurementRecord, received: ReceiveLineState[]) => {
    const already = receivedAgainstPO(state, po.id);
    received.forEach(l => { already[l.itemId] = round3((already[l.itemId] ?? 0) + parseNum(l.qty)); });
    const complete = po.items.every(line => {
      const id = matchPOLineItem(state.items, line);
      return id && (already[id] ?? 0) + 0.0001 >= line.quantity;
    });
    procurementActions.update(po.id, {
      status: complete ? 'Received' : 'Partially Received',
      receivedDate: formatPODate(),
      items: po.items.map(line => ({ ...line, itemId: line.itemId ?? (matchPOLineItem(state.items, line) || undefined) })),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Receive Stock" containerClassName="max-w-4xl">
      <div className="inventory-form-shell space-y-5">
        <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1 text-sm" role="tablist">
          {([['RECEIPT', 'Purchase'], ['PO', 'From an order'], ['DONATION', 'Donation']] as [ReceiveMode, string][]).map(([m, label]) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => switchMode(m)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mode === m ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
        <ErrorNote message={error} />

        {mode === 'PO' && (
          <Field label="Which order?" required>
            <ThemeSelect
              value={poId}
              onChange={loadPO}
              options={[{ value: '', label: receivablePOs.length ? 'Select an order' : 'No orders are waiting for delivery' }, ...receivablePOs.map(p => ({ value: p.id, label: `${p.poNumber} · ${p.vendor} · ${fmtMoney(p.amount)} · ${p.status}` }))]}
            />
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Field label="Store" required>
            <ThemeSelect value={store} onChange={v => setStore(v as StoreId)} options={STORES.map(s => ({ value: s.id, label: s.name }))} />
          </Field>
          <Field label="Date" required>
            <DatePicker value={date} maxDate={new Date()} onChange={setDate} />
          </Field>
          {mode === 'DONATION' ? (
            <>
              <Field label="Donor name" required><input className={inputCls} value={party} onChange={e => setParty(e.target.value)} placeholder="Sri / Smt ..." /></Field>
              <Field label="Phone (optional)"><input className={inputCls} value={donorPhone} onChange={e => setDonorPhone(e.target.value)} /></Field>
            </>
          ) : (
            <>
              <Field label="Supplier" required><input className={inputCls} value={party} onChange={e => setParty(e.target.value)} disabled={mode === 'PO'} /></Field>
              <Field label="Bill no. (optional)"><input className={inputCls} value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></Field>
            </>
          )}
        </div>
        {mode === 'DONATION' && (
          <Field label="Donation receipt no. (optional)">
            <input className={inputCls} value={receiptNo} onChange={e => setReceiptNo(e.target.value)} placeholder="DR/26-27/...." />
          </Field>
        )}

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/50">
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="text-left px-3 py-2 min-w-[240px]">Item</th>
                  {mode === 'PO' && <th className="text-right px-3 py-2">Pending</th>}
                  <th className="text-right px-3 py-2 w-28">Qty</th>
                  <th className="text-right px-3 py-2 w-28">{mode === 'DONATION' ? 'Approx. value (₹)' : 'Rate (₹)'}</th>
                  {showExpiry && <th className="text-left px-3 py-2 w-44">Expiry date</th>}
                  <th className="text-right px-3 py-2 w-28">Amount</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {lines.map(l => {
                  const item = state.items.find(i => i.id === l.itemId);
                  return (
                    <tr key={l.key} className="border-t border-border">
                      <td className="px-3 py-2">
                        <ItemSelect items={activeItems} summaries={summaries} value={l.itemId} onChange={id => pickItem(l.key, id)} placeholder={mode === 'PO' ? 'Map to inventory item' : 'Select item'} />
                      </td>
                      {mode === 'PO' && <td className="px-3 py-2 text-right tabular-nums text-muted-foreground whitespace-nowrap">{fmtQty(Math.max(0, (l.ordered ?? 0) - (l.received ?? 0)))} / {fmtQty(l.ordered ?? 0)}</td>}
                      <td className="px-3 py-2"><input type="number" min={0} step={item && WHOLE_UNITS.has(item.unit) ? 1 : 'any'} className={`${inputCls} text-right`} value={l.qty} onChange={e => updateLine(l.key, { qty: e.target.value })} aria-label="Quantity" /></td>
                      <td className="px-3 py-2"><input type="number" min={0} step="any" className={`${inputCls} text-right`} value={l.unitCost} onChange={e => updateLine(l.key, { unitCost: e.target.value })} aria-label="Rate" /></td>
                      {showExpiry && <td className="px-3 py-2">{item?.perishable ? <DatePicker value={l.expiryDate} onChange={val => updateLine(l.key, { expiryDate: val })} placeholder="Expiry date" /> : <span className="text-xs text-muted-foreground">Not needed</span>}</td>}
                      <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{fmtMoney(parseNum(l.qty) * parseNum(l.unitCost))}</td>
                      <td className="px-2 py-2">
                        {mode !== 'PO' && lines.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLines(prev => prev.filter(x => x.key !== l.key))} aria-label="Remove line"><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30">
            {mode !== 'PO' ? (
              <Button variant="ghost" size="sm" onClick={() => setLines(prev => [...prev, lineFor(undefined)])}><Plus className="h-4 w-4 mr-1" /> Add line</Button>
            ) : <span className="text-xs text-muted-foreground">You can receive part of the order now; the rest stays pending.</span>}
            <span className="text-sm font-semibold">Total {fmtMoney(total)}</span>
          </div>
        </div>

        <Field label="Notes (optional)"><input className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. 2 packets damaged, checked by Murugan" /></Field>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </div>
      </div>
    </Modal>
  );
};

/* ================================================================== */
/* Issue                                                                */
/* ================================================================== */

interface QtyLine { key: string; itemId: string; qty: string }

export const IssueModal: React.FC<{ open: boolean; onClose: () => void; preset?: { itemId?: string; store?: StoreId; templateId?: string; count?: number } }> = ({ open, onClose, preset }) => {
  const { state, summaries, actions } = useInventoryStore();
  const { userName } = useInventoryRole();
  const activeItems = useMemo(() => state.items.filter(i => i.active), [state.items]);
  const [store, setStore] = useState<StoreId>('SANCTUM');
  const [purpose, setPurpose] = useState(ISSUE_PURPOSES[0]);
  const [party, setParty] = useState('');
  const [notes, setNotes] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [count, setCount] = useState('1');
  const [lines, setLines] = useState<QtyLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const applyTemplate = (id: string, n: number) => {
    setTemplateId(id);
    const t = state.templates.find(x => x.id === id);
    if (!t) return;
    setStore(t.store);
    setPurpose(t.purpose);
    setLines(t.lines.map(l => {
      const item = state.items.find(i => i.id === l.itemId);
      const raw = (l.qty * n) / t.basisQty;
      const qty = item && WHOLE_UNITS.has(item.unit) ? Math.ceil(raw - 0.0001) : round3(raw);
      return { key: newKey(), itemId: l.itemId, qty: String(qty) };
    }));
  };

  useEffect(() => {
    if (!open) return;
    setError(null); setParty(''); setNotes(''); setTemplateId('');
    const item = state.items.find(i => i.id === preset?.itemId);
    const s = preset?.store ?? (item ? (['MAIN', 'KITCHEN', 'SANCTUM'] as StoreId[]).sort((a, b) => (summaries[item.id]?.byStore[b] ?? 0) - (summaries[item.id]?.byStore[a] ?? 0))[0] : 'SANCTUM');
    setStore(s);
    setPurpose(item?.category === 'Kitchen & Prasadam' ? 'Annadhanam' : item?.category === 'Cleaning & Maintenance' ? 'Maintenance' : 'Daily Pooja');
    setCount(String(preset?.count ?? 1));
    setLines([{ key: newKey(), itemId: item?.id ?? '', qty: '' }]);
    if (preset?.templateId) applyTemplate(preset.templateId, preset.count ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const template = state.templates.find(t => t.id === templateId);
  const updateLine = (key: string, patch: Partial<QtyLine>) => setLines(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)));
  const value = lines.reduce((s, l) => s + parseNum(l.qty) * (summaries[l.itemId]?.avgCost ?? 0), 0);

  const submit = () => {
    try {
      setError(null);
      if (!party.trim()) throw new Error('Enter who the stock is issued to.');
      const refNo = actions.issue({
        store, purpose, party: party.trim(), notes: notes.trim() || undefined, user: userName, templateId: templateId || undefined,
        lines: lines.filter(l => l.itemId).map(l => ({ itemId: l.itemId, qty: parseNum(l.qty) })),
      });
      toast.success('Stock issued', { description: `${purpose} · from ${storeName(store)} · Ref ${refNo}` });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Issue Stock" containerClassName="max-w-2xl">
      <div className="inventory-form-shell space-y-5">
        <ErrorNote message={error} />
        <div className="rounded-xl border border-dashed border-border p-3 grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3 bg-muted/20">
          <Field label="Use a seva template (optional)" hint="Fills in the materials needed automatically.">
            <ThemeSelect
              value={templateId}
              onChange={val => val ? applyTemplate(val, parseNum(count) || 1) : setTemplateId('')}
              options={[{ value: '', label: 'No template - choose items myself' }, ...state.templates.map(t => ({ value: t.id, label: `${t.name} (per ${t.basisQty} ${t.basisLabel})` }))]}
            />
          </Field>
          <Field label={template ? `How many ${template.basisLabel}?` : 'How many?'}>
            <input type="number" min={1} className={inputCls} value={count} disabled={!template}
              onChange={e => { setCount(e.target.value); if (templateId) applyTemplate(templateId, parseNum(e.target.value) || 0); }} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="From store" required>
            <ThemeSelect value={store} onChange={v => setStore(v as StoreId)} options={STORES.map(s => ({ value: s.id, label: s.name }))} />
          </Field>
          <Field label="Purpose" required>
            <ThemeSelect value={purpose} onChange={setPurpose} options={ISSUE_PURPOSES.map(p => ({ value: p, label: p }))} />
          </Field>
          <Field label="Issued to" required>
            <input className={inputCls} list="inv-issued-to" value={party} onChange={e => setParty(e.target.value)} placeholder="Department / person" />
            <datalist id="inv-issued-to">
              {['Archakar - Sanctum', 'Madapalli (Temple Kitchen)', 'Annadhanam Hall', 'Housekeeping', 'Festival Committee'].map(o => <option key={o} value={o} />)}
            </datalist>
          </Field>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="text-left px-3 py-2">Item</th>
                <th className="text-right px-3 py-2 w-32">Available</th>
                <th className="text-right px-3 py-2 w-32">Quantity</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {lines.map(l => {
                const item = state.items.find(i => i.id === l.itemId);
                const available = summaries[l.itemId]?.byStore[store] ?? 0;
                const short = parseNum(l.qty) > available + 0.0001;
                return (
                  <tr key={l.key} className="border-t border-border">
                    <td className="px-3 py-2"><ItemSelect items={activeItems} summaries={summaries} store={store} value={l.itemId} onChange={id => updateLine(l.key, { itemId: id })} /></td>
                    <td className={`px-3 py-2 text-right tabular-nums whitespace-nowrap ${short ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{item ? `${fmtQty(available)} ${item.unit}` : '-'}</td>
                    <td className="px-3 py-2"><input type="number" min={0} step="any" className={`${inputCls} text-right ${short ? 'border-destructive' : ''}`} value={l.qty} onChange={e => updateLine(l.key, { qty: e.target.value })} aria-label="Issue quantity" /></td>
                    <td className="px-2 py-2">{lines.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLines(prev => prev.filter(x => x.key !== l.key))} aria-label="Remove line"><Trash2 className="h-4 w-4" /></Button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30">
            <Button variant="ghost" size="sm" onClick={() => setLines(prev => [...prev, { key: newKey(), itemId: '', qty: '' }])}><Plus className="h-4 w-4 mr-1" /> Add line</Button>
            <span className="text-xs text-muted-foreground">Stock that expires first is used first</span>
          </div>
        </div>
        <Field label="Notes (optional)"><input className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Pradosham evening seva" /></Field>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Issue stock</Button>
        </div>
      </div>
    </Modal>
  );
};

/* ================================================================== */
/* Transfer                                                             */
/* ================================================================== */

export const TransferModal: React.FC<{ open: boolean; onClose: () => void; preset?: { itemId?: string } }> = ({ open, onClose, preset }) => {
  const { state, summaries, actions } = useInventoryStore();
  const { userName } = useInventoryRole();
  const activeItems = useMemo(() => state.items.filter(i => i.active), [state.items]);
  const [from, setFrom] = useState<StoreId>('MAIN');
  const [to, setTo] = useState<StoreId>('SANCTUM');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<QtyLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null); setNotes('');
    const item = state.items.find(i => i.id === preset?.itemId);
    const src = item?.defaultStore ?? 'MAIN';
    setFrom(src);
    setTo(src === 'SANCTUM' ? 'MAIN' : src === 'KITCHEN' ? 'MAIN' : 'SANCTUM');
    setLines([{ key: newKey(), itemId: item?.id ?? '', qty: '' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateLine = (key: string, patch: Partial<QtyLine>) => setLines(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)));

  const submit = () => {
    try {
      setError(null);
      const refNo = actions.transfer({ from, to, notes: notes.trim() || undefined, user: userName, lines: lines.filter(l => l.itemId).map(l => ({ itemId: l.itemId, qty: parseNum(l.qty) })) });
      toast.success('Stock moved', { description: `${storeName(from)} → ${storeName(to)} · Ref ${refNo}` });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Move Stock Between Stores" containerClassName="max-w-2xl">
      <div className="inventory-form-shell space-y-5">
        <ErrorNote message={error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="From store" required>
            <ThemeSelect value={from} onChange={v => setFrom(v as StoreId)} options={STORES.map(s => ({ value: s.id, label: s.name }))} />
          </Field>
          <Field label="To store" required>
            <ThemeSelect value={to} onChange={v => setTo(v as StoreId)} options={STORES.filter(s => s.id !== from).map(s => ({ value: s.id, label: s.name }))} />
          </Field>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="text-left px-3 py-2">Item</th>
                <th className="text-right px-3 py-2 w-32">In {STORES.find(s => s.id === from)?.short}</th>
                <th className="text-right px-3 py-2 w-32">Quantity</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {lines.map(l => {
                const item = state.items.find(i => i.id === l.itemId);
                const available = summaries[l.itemId]?.byStore[from] ?? 0;
                const short = parseNum(l.qty) > available + 0.0001;
                return (
                  <tr key={l.key} className="border-t border-border">
                    <td className="px-3 py-2"><ItemSelect items={activeItems} summaries={summaries} store={from} value={l.itemId} onChange={id => updateLine(l.key, { itemId: id })} /></td>
                    <td className={`px-3 py-2 text-right tabular-nums ${short ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{item ? `${fmtQty(available)} ${item.unit}` : '-'}</td>
                    <td className="px-3 py-2"><input type="number" min={0} step="any" className={`${inputCls} text-right`} value={l.qty} onChange={e => updateLine(l.key, { qty: e.target.value })} aria-label="Transfer quantity" /></td>
                    <td className="px-2 py-2">{lines.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLines(prev => prev.filter(x => x.key !== l.key))} aria-label="Remove line"><Trash2 className="h-4 w-4" /></Button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-border bg-muted/30">
            <Button variant="ghost" size="sm" onClick={() => setLines(prev => [...prev, { key: newKey(), itemId: '', qty: '' }])}><Plus className="h-4 w-4 mr-1" /> Add line</Button>
          </div>
        </div>
        <Field label="Remarks"><input className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} /></Field>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Move stock</Button>
        </div>
      </div>
    </Modal>
  );
};

/* ================================================================== */
/* Adjustment & wastage                                                 */
/* ================================================================== */

export const AdjustModal: React.FC<{ open: boolean; onClose: () => void; preset?: { itemId?: string; store?: StoreId; type?: 'ADJUSTMENT' | 'WASTAGE'; batchNo?: string } }> = ({ open, onClose, preset }) => {
  const { state, summaries, actions } = useInventoryStore();
  const { userName, canAdjust } = useInventoryRole();
  const [type, setType] = useState<'ADJUSTMENT' | 'WASTAGE'>('WASTAGE');
  const [itemId, setItemId] = useState('');
  const [store, setStore] = useState<StoreId>('MAIN');
  const [newQty, setNewQty] = useState('');
  const [wasteQty, setWasteQty] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null); setNotes(''); setWasteQty(''); setNewQty('');
    const t = preset?.type ?? (canAdjust ? 'ADJUSTMENT' : 'WASTAGE');
    setType(t === 'ADJUSTMENT' && !canAdjust ? 'WASTAGE' : t);
    setReason(t === 'WASTAGE' ? WASTAGE_REASONS[0] : ADJUST_REASONS[0]);
    const item = state.items.find(i => i.id === preset?.itemId);
    setItemId(item?.id ?? '');
    const s = preset?.store ?? (item ? (['MAIN', 'KITCHEN', 'SANCTUM'] as StoreId[]).sort((a, b) => (summaries[item.id]?.byStore[b] ?? 0) - (summaries[item.id]?.byStore[a] ?? 0))[0] : 'MAIN');
    setStore(s);
    setBatchNo(preset?.batchNo ?? '');
    if (preset?.batchNo && item) {
      const b = summaries[item.id]?.batches.find(x => x.batchNo === preset.batchNo && x.store === s);
      if (b) setWasteQty(String(b.qty));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const item = state.items.find(i => i.id === itemId);
  const current = summaries[itemId]?.byStore[store] ?? 0;
  const batches = (summaries[itemId]?.batches ?? []).filter(b => b.store === store);
  const delta = type === 'ADJUSTMENT' ? round3(parseNum(newQty) - current) : -parseNum(wasteQty);

  const submit = () => {
    try {
      setError(null);
      if (!item) throw new Error('Select an item.');
      if (type === 'ADJUSTMENT' && newQty === '') throw new Error('Enter the correct quantity on hand.');
      if (type === 'ADJUSTMENT' && parseNum(newQty) < 0) throw new Error('Quantity cannot be negative.');
      if (type === 'WASTAGE' && !(parseNum(wasteQty) > 0)) throw new Error('Enter the quantity written off.');
      if (!notes.trim() && type === 'ADJUSTMENT') throw new Error('Please explain why the quantity is different.');
      const refNo = actions.adjust({ type, store, itemId, delta, reason, batchNo: type === 'WASTAGE' ? batchNo || undefined : undefined, notes: notes.trim() || undefined, user: userName });
      toast.success(type === 'WASTAGE' ? 'Stock written off' : 'Quantity corrected', { description: `${item.name}: ${delta > 0 ? '+' : ''}${fmtQty(delta)} ${item.unit} · Ref ${refNo}` });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={type === 'WASTAGE' ? 'Write Off Stock' : 'Correct Stock Quantity'} containerClassName="max-w-xl">
      <div className="inventory-form-shell space-y-4">
        <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1 text-sm">
          {(['WASTAGE', 'ADJUSTMENT'] as const).map(t => (
            <button key={t} disabled={t === 'ADJUSTMENT' && !canAdjust} onClick={() => { setType(t); setReason(t === 'WASTAGE' ? WASTAGE_REASONS[0] : ADJUST_REASONS[0]); }}
              title={t === 'ADJUSTMENT' && !canAdjust ? 'Only administrators can correct quantities' : undefined}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-40 ${type === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {t === 'WASTAGE' ? 'Write off' : 'Correct quantity'}
            </button>
          ))}
        </div>
        <ErrorNote message={error} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Item" required>
            <ItemSelect items={state.items.filter(i => i.active)} summaries={summaries} store={store} value={itemId} onChange={id => { setItemId(id); setBatchNo(''); }} />
          </Field>
          <Field label="Store" required>
            <ThemeSelect value={store} onChange={v => { setStore(v as StoreId); setBatchNo(''); }} options={STORES.map(s => ({ value: s.id, label: s.name }))} />
          </Field>
        </div>
        <div className="rounded-lg bg-muted/40 border border-border px-3 py-2 text-sm flex justify-between">
          <span className="text-muted-foreground">Quantity in system ({storeName(store)})</span>
          <span className="font-semibold tabular-nums">{fmtQty(current)} {item?.unit}</span>
        </div>
        {type === 'ADJUSTMENT' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Actual quantity counted" required>
              <input type="number" min={0} step="any" className={inputCls} value={newQty} onChange={e => setNewQty(e.target.value)} />
            </Field>
            <Field label="Difference">
              <input className={`${inputCls} ${delta < 0 ? 'text-destructive' : delta > 0 ? 'text-emerald-600' : ''}`} value={newQty === '' ? '' : `${delta > 0 ? '+' : ''}${fmtQty(delta)} (${fmtMoney(delta * (summaries[itemId]?.avgCost ?? 0))})`} disabled />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Which stock?">
              <ThemeSelect
                value={batchNo}
                onChange={v => { setBatchNo(v); const b = batches.find(x => x.batchNo === v); if (b) setWasteQty(String(b.qty)); }}
                options={[{ value: '', label: 'Oldest expiry first' }, ...batches.map(b => ({ value: b.batchNo, label: `${b.batchNo} · ${fmtQty(b.qty)} ${item?.unit}${b.expiryDate ? ` · exp ${fmtDate(b.expiryDate)}` : ''}` }))]}
              />
            </Field>
            <Field label="Quantity to write off" required>
              <input type="number" min={0} step="any" className={inputCls} value={wasteQty} onChange={e => setWasteQty(e.target.value)} />
            </Field>
          </div>
        )}
        <Field label="Reason" required>
          <ThemeSelect value={reason} onChange={setReason} options={(type === 'WASTAGE' ? WASTAGE_REASONS : ADJUST_REASONS).map(r => ({ value: r, label: r }))} />
        </Field>
        <Field label={type === 'ADJUSTMENT' ? 'Why is it different?' : 'Notes (optional)'}>
          <textarea className={`${inputCls} h-20 py-2 resize-none`} value={notes} onChange={e => setNotes(e.target.value)} placeholder={type === 'ADJUSTMENT' ? 'Required for the audit record' : 'e.g. rats damaged 2 packets'} />
        </Field>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant={type === 'WASTAGE' ? 'destructive' : 'default'} onClick={submit}>{type === 'WASTAGE' ? 'Write off' : 'Save correction'}</Button>
        </div>
      </div>
    </Modal>
  );
};
