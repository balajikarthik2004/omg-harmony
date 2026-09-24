import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { formatPODate, nextPONumber, procurementActions, useProcurementStore } from '@/hooks/useProcurementStore';
import { addDays, fmtMoney, fmtQty, suggestedOrderQty } from '@/lib/inventory';
import { toISODate } from '@/lib/utils';
import { ErrorNote, Field, ItemSelect, inputCls, parseNum, useInventoryRole } from './shared';
import { DatePicker } from '@/components/ui/date-picker';

export interface POSuggestion { itemId: string; qty?: number }

interface Line { itemId: string; qty: string; price: string; supplier: string }

const CreatePOModal: React.FC<{
  open: boolean;
  onClose: () => void;
  suggestions: POSuggestion[];
  onOrder: Record<string, number>;
  onCreated?: () => void;
}> = ({ open, onClose, suggestions, onOrder, onCreated }) => {
  const { state, summaries } = useInventoryStore();
  const { items: pos } = useProcurementStore();
  const { userName, isAdmin } = useInventoryRole();
  const [lines, setLines] = useState<Line[]>([]);
  const [expected, setExpected] = useState('');
  const [notes, setNotes] = useState('');
  const [approveNow, setApproveNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null); setNotes(''); setApproveNow(false);
    let maxLead = 3;
    setLines(suggestions.map(s => {
      const item = state.items.find(i => i.id === s.itemId);
      if (!item) return null;
      maxLead = Math.max(maxLead, item.leadTimeDays);
      const qty = s.qty ?? suggestedOrderQty(item, summaries[item.id]?.onHand ?? 0, onOrder[item.id] ?? 0);
      return { itemId: item.id, qty: String(qty || ''), price: String(item.unitCost), supplier: item.supplier || 'Unassigned supplier' };
    }).filter(Boolean) as Line[]);
    setExpected(toISODate(addDays(new Date(), maxLead)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const groups = useMemo(() => {
    const map = new Map<string, Line[]>();
    lines.forEach(l => {
      if (!(parseNum(l.qty) > 0)) return;
      const key = l.supplier.trim() || 'Unassigned supplier';
      map.set(key, [...(map.get(key) ?? []), l]);
    });
    return [...map.entries()];
  }, [lines]);

  const addItem = (itemId: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item || lines.some(l => l.itemId === itemId)) return;
    const qty = suggestedOrderQty(item, summaries[item.id]?.onHand ?? 0, onOrder[item.id] ?? 0);
    setLines(prev => [...prev, { itemId, qty: String(qty || ''), price: String(item.unitCost), supplier: item.supplier || 'Unassigned supplier' }]);
  };

  const total = lines.reduce((s, l) => s + parseNum(l.qty) * parseNum(l.price), 0);
  const update = (itemId: string, patch: Partial<Line>) => setLines(prev => prev.map(l => (l.itemId === itemId ? { ...l, ...patch } : l)));

  const submit = () => {
    try {
      setError(null);
      if (!groups.length) throw new Error('Add at least one item with a quantity.');
      if (lines.some(l => parseNum(l.qty) > 0 && !(parseNum(l.price) > 0))) throw new Error('Every ordered line needs a unit price.');
      const created: string[] = [];
      let all = pos;
      const today = formatPODate();
      for (const [vendor, group] of groups) {
        const poNumber = nextPONumber(all);
        const record = procurementActions.add({
          id: '', poNumber, vendor, date: today,
          amount: Math.round(group.reduce((s, l) => s + parseNum(l.qty) * parseNum(l.price), 0)),
          status: approveNow ? 'Approved' : 'Pending',
          items: group.map(l => {
            const item = state.items.find(i => i.id === l.itemId)!;
            return { name: item.name, quantity: parseNum(l.qty), price: parseNum(l.price), itemId: item.id, unit: item.unit };
          }),
          submittedBy: userName, submittedByName: userName,
          approvedBy: approveNow ? userName : null, approvedByName: approveNow ? userName : null, approvedDate: approveNow ? today : null,
          rejectedBy: null, rejectedDate: null, rejectionReason: '',
          source: 'inventory', expectedDate: expected, notes: notes.trim(),
        });
        all = [record, ...all];
        created.push(poNumber);
      }
      toast.success(`${created.length} order${created.length > 1 ? 's' : ''} created`, {
        description: `${created.join(', ')} · ${approveNow ? 'approved' : 'sent for approval'} · ${fmtMoney(total)}`,
      });
      onCreated?.();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Order from Supplier" containerClassName="max-w-4xl">
      <div className="inventory-form-shell space-y-5">
        <p className="text-sm text-muted-foreground">
          Quantities are pre-filled to bring each item back up to its maximum level. One order is created per supplier.
        </p>
        <ErrorNote message={error} />
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="text-left px-3 py-2">Item</th>
                <th className="text-right px-3 py-2">In stock</th>
                <th className="text-left px-3 py-2 w-48">Supplier</th>
                <th className="text-right px-3 py-2 w-28">Quantity</th>
                <th className="text-right px-3 py-2 w-28">Rate (₹)</th>
                <th className="text-right px-3 py-2">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Add the items you want to order below.</td></tr>}
              {lines.map(l => {
                const item = state.items.find(i => i.id === l.itemId)!;
                return (
                  <tr key={l.itemId} className="border-t border-border">
                    <td className="px-3 py-2"><p className="font-medium">{item.name}</p><p className="text-[11px] text-muted-foreground">Max {fmtQty(item.maxStock)} {item.unit}</p></td>
                    <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{fmtQty(summaries[item.id]?.onHand ?? 0)} {item.unit}{(onOrder[item.id] ?? 0) > 0 && <span className="block text-[11px] text-primary">+{fmtQty(onOrder[item.id])} ordered</span>}</td>
                    <td className="px-3 py-2"><input className={inputCls} value={l.supplier} onChange={e => update(l.itemId, { supplier: e.target.value })} aria-label="Supplier" /></td>
                    <td className="px-3 py-2"><input type="number" min={0} step="any" className={`${inputCls} text-right`} value={l.qty} onChange={e => update(l.itemId, { qty: e.target.value })} aria-label="Order quantity" /></td>
                    <td className="px-3 py-2"><input type="number" min={0} step="any" className={`${inputCls} text-right`} value={l.price} onChange={e => update(l.itemId, { price: e.target.value })} aria-label="Rate" /></td>
                    <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{fmtMoney(parseNum(l.qty) * parseNum(l.price))}</td>
                    <td className="px-2 py-2"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLines(prev => prev.filter(x => x.itemId !== l.itemId))} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="max-w-md">
          <ItemSelect items={state.items.filter(i => i.active && !lines.some(l => l.itemId === i.id))} summaries={summaries} value="" onChange={addItem} placeholder="+ Add an item to this order" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Field label="Expected delivery"><DatePicker value={expected} onChange={setExpected} /></Field>
          <Field label="Notes to supplier" className="sm:col-span-2"><input className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Delivery to temple stores, 6 AM - 10 AM" /></Field>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 border border-border px-4 py-3">
          <div className="text-sm">
            <span className="font-semibold">{groups.length}</span> order{groups.length === 1 ? '' : 's'} ·{' '}
            {groups.map(([v]) => v).join(', ') || '-'} · <span className="font-semibold">{fmtMoney(total)}</span>
          </div>
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={approveNow} onCheckedChange={v => setApproveNow(v === true)} /> Approve now
            </label>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{approveNow ? 'Place order' : 'Send for approval'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePOModal;
