import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Building2, Calendar, FileText, Info, PackagePlus, Plus, Sparkles, Trash2, Truck } from 'lucide-react';
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
    if (!itemId) return;
    const item = state.items.find(i => i.id === itemId);
    if (!item || lines.some(l => l.itemId === itemId)) return;
    const qty = suggestedOrderQty(item, summaries[item.id]?.onHand ?? 0, onOrder[item.id] ?? 0);
    setLines(prev => [...prev, { itemId, qty: String(qty || ''), price: String(item.unitCost), supplier: item.supplier || 'Unassigned supplier' }]);
  };

  const total = lines.reduce((s, l) => s + parseNum(l.qty) * parseNum(l.price), 0);
  const update = (itemId: string, patch: Partial<Line>) => setLines(prev => prev.map(l => (l.itemId === itemId ? { ...l, ...patch } : l)));

  const availableItems = state.items.filter(i => i.active && !lines.some(l => l.itemId === i.id));

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
    <Modal
      open={open}
      onClose={onClose}
      title="Order from Supplier"
      containerClassName="max-w-4xl max-h-[92vh] overflow-y-auto"
      bodyClassName="p-5"
    >
      <div className="inventory-form-shell space-y-3">
        {/* Compact Info Banner */}
        <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-1.5 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Quantities are pre-filled to maximum capacity. One purchase order is created per supplier.</span>
        </div>

        <ErrorNote message={error} />

        {/* Fixed Height Items Table Area with internal Scrollbar */}
        <div className="rounded-xl border border-border overflow-hidden shadow-2xs bg-card">
          <div className="h-[170px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/75 sticky top-0 z-10 border-b border-border shadow-2xs">
                <tr className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="text-left px-3 py-2">Item</th>
                  <th className="text-right px-3 py-2">In Stock</th>
                  <th className="text-left px-3 py-2 w-44">Supplier</th>
                  <th className="text-right px-3 py-2 w-24">Qty</th>
                  <th className="text-right px-3 py-2 w-24">Rate (₹)</th>
                  <th className="text-right px-3 py-2 w-28">Amount</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {lines.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <PackagePlus className="h-6 w-6 text-muted-foreground/40" />
                        <p className="font-medium text-xs text-foreground">No items added yet</p>
                        <p className="text-[11px] text-muted-foreground">Select an item below to add it to this purchase order.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {lines.map(l => {
                  const item = state.items.find(i => i.id === l.itemId)!;
                  const itemQty = parseNum(l.qty);
                  const itemPrice = parseNum(l.price);
                  return (
                    <tr key={l.itemId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className="font-semibold text-foreground text-xs">{item.name}</span>
                        <span className="text-[10.5px] text-muted-foreground ml-1.5">
                          (Max {fmtQty(item.maxStock)} {item.unit})
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums whitespace-nowrap">
                        <span className="font-medium text-foreground text-xs">
                          {fmtQty(summaries[item.id]?.onHand ?? 0)} {item.unit}
                        </span>
                        {(onOrder[item.id] ?? 0) > 0 && (
                          <span className="text-[10px] text-primary font-medium ml-1">
                            (+{fmtQty(onOrder[item.id])})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          className={`${inputCls} h-7.5 px-2 text-xs`}
                          value={l.supplier}
                          onChange={e => update(l.itemId, { supplier: e.target.value })}
                          placeholder="Vendor name"
                          aria-label="Supplier"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          className={`${inputCls} h-7.5 px-2 text-right text-xs font-medium`}
                          value={l.qty}
                          onChange={e => update(l.itemId, { qty: e.target.value })}
                          placeholder="0"
                          aria-label="Order quantity"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          className={`${inputCls} h-7.5 px-2 text-right text-xs font-medium`}
                          value={l.price}
                          onChange={e => update(l.itemId, { price: e.target.value })}
                          placeholder="0"
                          aria-label="Rate"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums whitespace-nowrap font-bold text-foreground text-xs">
                        {fmtMoney(itemQty * itemPrice)}
                      </td>
                      <td className="px-1.5 py-1.5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => setLines(prev => prev.filter(x => x.itemId !== l.itemId))}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Item Dropdown Section - Always Fully Visible */}
        <div className="w-full">
          <ItemSelect
            items={availableItems}
            summaries={summaries}
            value=""
            onChange={addItem}
            placeholder="+ Add an item to this order..."
            disabled={availableItems.length === 0}
          />
        </div>

        {/* Delivery Details & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Field label="Expected Delivery Date">
            <DatePicker value={expected} onChange={setExpected} />
          </Field>
          <Field label="Notes to Supplier" className="sm:col-span-2">
            <input
              className={`${inputCls} h-10 text-xs`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Delivery to temple stores, 6 AM - 10 AM"
            />
          </Field>
        </div>

        {/* Order Summary Breakdown Card with compact scroll for multi-vendor badges */}
        <div className="rounded-xl bg-muted/40 border border-border p-3 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap text-xs max-h-[58px] overflow-y-auto pr-1">
              <span className="font-bold text-foreground shrink-0">
                {groups.length} PO{groups.length === 1 ? '' : 's'}:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {groups.map(([v, itemsInGroup]) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-background border border-border shadow-2xs text-foreground"
                  >
                    <Building2 className="w-3 h-3 text-primary" />
                    {v}: <span className="text-primary font-bold">{fmtMoney(itemsInGroup.reduce((s, l) => s + parseNum(l.qty) * parseNum(l.price), 0))}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-muted-foreground">Total:</span>
              <span className="text-base font-bold text-foreground font-display tabular-nums">
                {fmtMoney(total)}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="pt-1.5 border-t border-border/40 flex items-center justify-between">
              <label className="flex items-center gap-2 text-[11.5px] font-medium text-foreground cursor-pointer select-none">
                <Checkbox checked={approveNow} onCheckedChange={v => setApproveNow(v === true)} />
                <span>Auto-approve immediately (skip pending approval)</span>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-4">
            Cancel
          </Button>
          <Button size="sm" onClick={submit} className="inventory-cta h-9 px-5 font-semibold">
            {approveNow ? 'Place Order' : 'Send for Approval'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePOModal;
