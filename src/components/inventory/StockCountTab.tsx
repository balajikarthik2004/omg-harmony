import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, ClipboardCheck, Plus, Printer, Send, XCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { STORES, StockCount, StoreId, fmtDateTime, fmtMoney, fmtQty, printDocument, round3, storeName } from '@/lib/inventory';
import { EmptyRow, Field, inputCls, selectCls, tdCls, thCls, useInventoryRole } from './shared';
import { ThemeSelect } from '@/components/ui/theme-select';

const StockCountTab: React.FC = () => {
  const { state, summaries, actions } = useInventoryStore();
  const { userName, canApprove } = useInventoryRole();
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newStore, setNewStore] = useState<StoreId>('SANCTUM');
  const [newNotes, setNewNotes] = useState('');

  const count = state.counts.find(c => c.id === openId) ?? null;
  const itemById = useMemo(() => new Map(state.items.map(i => [i.id, i])), [state.items]);

  const varianceValue = (c: StockCount) => c.lines.reduce((s, l) => s + (l.countedQty === null ? 0 : (l.countedQty - l.systemQty) * (summaries[l.itemId]?.avgCost ?? 0)), 0);

  const create = () => {
    try {
      if (state.counts.some(c => c.store === newStore && (c.status === 'In Progress' || c.status === 'Submitted'))) {
        throw new Error(`${storeName(newStore)} already has a stock check in progress. Finish or cancel it first.`);
      }
      const c = actions.createCount(newStore, userName, newNotes.trim());
      toast.success(`Stock check started for ${storeName(newStore)}`);
      setNewOpen(false); setNewNotes('');
      setOpenId(c.id);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const printSheet = (c: StockCount, blind: boolean) => {
    const rows = c.lines.map((l, idx) => {
      const i = itemById.get(l.itemId);
      return `<tr><td>${idx + 1}</td><td>${i?.code ?? ''}</td><td>${i?.name ?? ''}${i?.localName ? ` (${i.localName})` : ''}</td><td>${i?.unit ?? ''}</td>${blind ? '' : `<td class="num">${fmtQty(l.systemQty)}</td>`}<td class="num">${l.countedQty === null || blind ? '' : fmtQty(l.countedQty)}</td><td></td></tr>`;
    }).join('');
    const ok = printDocument(`${c.refNo} - Stock count sheet`, `
      <h1>Physical Stock Verification - ${storeName(c.store)}</h1>
      <p class="meta">${c.refNo} · Started ${fmtDateTime(c.createdAt)} by ${c.createdBy}${blind ? ' · Blind count (system quantities hidden)' : ''}</p>
      <table><thead><tr><th>#</th><th>Code</th><th>Item</th><th>Unit</th>${blind ? '' : '<th>System qty</th>'}<th>Counted qty</th><th>Remarks</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="sign"><div>Counted by</div><div>Verified by</div><div>Approved by</div></div>`);
    if (!ok) toast.error('Allow pop-ups to print the count sheet.');
  };

  if (count) {
    const editable = count.status === 'In Progress';
    const counted = count.lines.filter(l => l.countedQty !== null).length;
    const setLine = (itemId: string, value: string) => actions.updateCount(count.id, {
      lines: count.lines.map(l => (l.itemId === itemId ? { ...l, countedQty: value === '' ? null : Math.max(0, Number(value)) } : l)),
    });
    const submit = () => {
      if (counted < count.lines.length) { toast.error(`${count.lines.length - counted} item(s) still need a count.`); return; }
      actions.updateCount(count.id, { status: 'Submitted', submittedAt: new Date().toISOString(), submittedBy: userName });
      toast.success('Sent to admin for approval');
    };
    const approve = () => {
      try {
        const ref = actions.approveCount(count.id, userName);
        toast.success('Stock check approved', { description: ref ? 'Stock quantities have been corrected.' : 'Everything matched - no corrections needed.' });
      } catch (e) { toast.error((e as Error).message); }
    };

    return (
      <div className="section-panel inventory-main-panel shadow-sm">
        <div className="section-panel-header flex-wrap gap-3 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setOpenId(null)} aria-label="Back to counts"><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">{count.refNo} · {storeName(count.store)} <StatusBadge status={count.status} /></h2>
              <p className="text-[11px] text-muted-foreground">Started {fmtDateTime(count.createdAt)} by {count.createdBy}{count.approvedBy && ` · Approved by ${count.approvedBy} ${fmtDateTime(count.approvedAt)}`}{count.adjustmentRef && ` · ${count.adjustmentRef}`}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => printSheet(count, editable)}><Printer className="h-4 w-4 mr-1.5" />{editable ? 'Print count sheet' : 'Print'}</Button>
            {editable && <Button variant="outline" size="sm" className="text-destructive" onClick={() => { actions.updateCount(count.id, { status: 'Cancelled' }); toast('Count cancelled'); }}><XCircle className="h-4 w-4 mr-1.5" />Cancel</Button>}
            {editable && <Button size="sm" onClick={submit}><Send className="h-4 w-4 mr-1.5" />Submit ({counted}/{count.lines.length})</Button>}
            {count.status === 'Submitted' && canApprove && <Button size="sm" onClick={approve}><CheckCircle2 className="h-4 w-4 mr-1.5" />Approve & correct stock</Button>}
            {count.status === 'Submitted' && !canApprove && <span className="text-xs text-muted-foreground self-center">Awaiting administrator approval</span>}
          </div>
        </div>
        <div className="px-4 py-3 text-xs text-muted-foreground border-b border-border flex flex-wrap gap-4">
          <span>Enter what you actually counted. When approved, the system quantity is corrected to match.</span>
          <span className="font-semibold text-foreground">Value difference {fmtMoney(varianceValue(count))}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className={thCls}>Item</th>
                <th className={`${thCls} text-right`}>In system</th><th className={`${thCls} text-right w-40`}>Counted</th>
                <th className={`${thCls} text-right`}>Difference</th><th className={`${thCls} text-right`}>Value</th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {count.lines.map(l => {
                const item = itemById.get(l.itemId);
                const v = l.countedQty === null ? null : round3(l.countedQty - l.systemQty);
                return (
                  <tr key={l.itemId} className="border-b border-border">
                    <td className={tdCls}><span className="font-medium">{item?.name}</span> <span className="text-xs text-muted-foreground">({item?.unit})</span></td>
                    <td className={`${tdCls} text-right tabular-nums`}>{fmtQty(l.systemQty)}</td>
                    <td className={`${tdCls} text-right`}>
                      {editable
                        ? <input type="number" min={0} step="any" className={`${inputCls} text-right h-9`} value={l.countedQty ?? ''} onChange={e => setLine(l.itemId, e.target.value)} aria-label={`Counted ${item?.name}`} />
                        : <span className="tabular-nums">{l.countedQty === null ? '-' : fmtQty(l.countedQty)}</span>}
                    </td>
                    <td className={`${tdCls} text-right tabular-nums font-semibold ${v === null || v === 0 ? 'text-muted-foreground' : v < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>{v === null ? '-' : `${v > 0 ? '+' : ''}${fmtQty(v)}`}</td>
                    <td className={`${tdCls} text-right tabular-nums`}>{v ? fmtMoney(v * (summaries[l.itemId]?.avgCost ?? 0)) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="section-panel inventory-main-panel shadow-sm">
      <div className="section-panel-header py-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-primary" /> Stock checks</h2>
        <Button size="sm" onClick={() => setNewOpen(true)}><Plus className="h-4 w-4 mr-1" />Start stock check</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className={thCls}>Store</th><th className={thCls}>Started</th><th className={thCls}>By</th>
              <th className={`${thCls} text-right`}>Counted</th><th className={`${thCls} text-right`}>Items different</th><th className={`${thCls} text-right`}>Value difference</th><th className={thCls}>Status</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {state.counts.length === 0 && <EmptyRow colSpan={7} message="No stock checks yet. Count a store to make sure the system matches the shelves." />}
            {state.counts.map(c => (
              <tr key={c.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => setOpenId(c.id)}>
                <td className={tdCls}><p className="font-medium">{storeName(c.store)}</p><p className="text-[11px] text-muted-foreground">{c.refNo}</p></td>
                <td className={`${tdCls} text-xs text-muted-foreground`}>{fmtDateTime(c.createdAt)}</td>
                <td className={`${tdCls} text-xs`}>{c.createdBy}</td>
                <td className={`${tdCls} text-right tabular-nums`}>{c.lines.filter(l => l.countedQty !== null).length}/{c.lines.length}</td>
                <td className={`${tdCls} text-right tabular-nums`}>{c.lines.filter(l => l.countedQty !== null && round3(l.countedQty - l.systemQty) !== 0).length}</td>
                <td className={`${tdCls} text-right tabular-nums`}>{fmtMoney(varianceValue(c))}</td>
                <td className={tdCls}><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Start a Stock Check">
        <div className="inventory-form-shell space-y-4">
          <Field label="Which store?" required>
            <ThemeSelect value={newStore} onChange={v => setNewStore(v as StoreId)} options={STORES.map(s => ({ value: s.id, label: s.name }))} />
          </Field>
          <Field label="Notes"><input className={inputCls} value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="e.g. Monthly check" /></Field>
          <p className="text-xs text-muted-foreground">Print the count sheet, count what is on the shelves, then enter the numbers here. Differences are corrected once an admin approves.</p>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={create}>Start</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StockCountTab;
