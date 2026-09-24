import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Building2, Info, PackageOpen, PackagePlus, Trash2 } from 'lucide-react';
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
      containerClassName="max-w-6xl w-full"
      bodyClassName="px-4 py-3 sm:px-6 sm:py-4"
    >
      <div className="inventory-form-shell space-y-4">
        <ErrorNote message={error} />

        {/* 2-Column Spacious Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT SIDE: Order Details & Fixed-Height PO Generation Plan */}
          <div className="lg:col-span-5 space-y-3">
            {/* Info Notice */}
            <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3.5 py-2 text-[11.5px] text-muted-foreground">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span>Quantities are pre-filled to maximum capacity. One PO is generated per supplier.</span>
            </div>

            {/* Add Item Field */}
            <Field label="Add Item to Order" hint={`${availableItems.length} available`}>
              <ItemSelect
                items={availableItems}
                summaries={summaries}
                value=""
                onChange={addItem}
                placeholder="+ Select an item to add..."
                disabled={availableItems.length === 0}
              />
            </Field>

            {/* Delivery Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Expected Delivery Date">
                <DatePicker value={expected} onChange={setExpected} />
              </Field>
              <Field label="Notes to Supplier">
                <input
                  className={`${inputCls} h-10 text-xs`}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. 6 AM - 10 AM"
                />
              </Field>
            </div>

            {/* Fixed-Height Generated POs Plan Section (Maintains Constant Size for 0, 1, 2, or more POs) */}
            <div className="rounded-xl border border-border bg-card/60 p-3.5 shadow-2xs h-[182px] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border/60 pb-2 shrink-0">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  Generated POs Plan ({groups.length})
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {lines.length} Line Item{lines.length === 1 ? '' : 's'}
                </span>
              </div>

              {groups.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-2">
                  <Building2 className="h-5 w-5 text-muted-foreground/30 mb-1" />
                  <p className="text-xs font-medium text-foreground">No POs generated yet</p>
                  <p className="text-[11px] text-muted-foreground">Add items above to see supplier PO breakdown</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1 space-y-2 pt-2 min-h-0">
                  {groups.map(([vendor, itemsInGroup], idx) => {
                    const groupTotal = itemsInGroup.reduce((s, l) => s + parseNum(l.qty) * parseNum(l.price), 0);
                    return (
                      <div
                        key={vendor}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-background/80 hover:bg-background hover:border-primary/30 transition-colors shadow-2xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                              PO #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-foreground truncate max-w-[170px]" title={vendor}>
                              {vendor}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block truncate mt-0.5 max-w-[210px]">
                            {itemsInGroup.map(l => {
                              const item = state.items.find(i => i.id === l.itemId);
                              return `${item?.name || 'Item'} (${l.qty})`;
                            }).join(', ')}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-primary tabular-nums">
                            {fmtMoney(groupTotal)}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {itemsInGroup.length} item{itemsInGroup.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Selected Order Preview & Total Valuation */}
          <div className="lg:col-span-7 space-y-3 flex flex-col">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <PackageOpen className="w-4 h-4 text-primary" />
                Selected Order Items Preview
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {lines.length} item{lines.length === 1 ? '' : 's'} selected
              </span>
            </div>

            {/* Spacious Fixed-Height Items Table Preview */}
            <div className="rounded-xl border border-border overflow-hidden shadow-2xs bg-card">
              <div className="h-[250px] sm:h-[275px] overflow-y-auto overflow-x-auto">
                <table className="w-full text-xs min-w-[560px]">
                  <thead className="bg-muted/75 sticky top-0 z-10 border-b border-border shadow-2xs">
                    <tr className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <th className="text-left px-3 py-2.5">Item</th>
                      <th className="text-right px-2.5 py-2.5">In Stock</th>
                      <th className="text-left px-2.5 py-2.5 w-36">Supplier</th>
                      <th className="text-right px-2 py-2.5 w-20">Qty</th>
                      <th className="text-right px-2 py-2.5 w-22">Rate (₹)</th>
                      <th className="text-right px-3 py-2.5 w-26">Amount</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {lines.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <PackagePlus className="h-8 w-8 text-muted-foreground/35" />
                            <p className="font-semibold text-sm text-foreground">No items added yet</p>
                            <p className="text-xs text-muted-foreground max-w-xs">
                              Select items from the dropdown on the left to populate this order preview.
                            </p>
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
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="font-semibold text-foreground text-xs block truncate max-w-[150px]" title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-[10.5px] text-muted-foreground">
                              Max {fmtQty(item.maxStock)} {item.unit}
                            </span>
                          </td>
                          <td className="px-2.5 py-2 text-right tabular-nums whitespace-nowrap">
                            <span className="font-medium text-foreground text-xs">
                              {fmtQty(summaries[item.id]?.onHand ?? 0)}
                            </span>
                          </td>
                          <td className="px-2.5 py-2">
                            <input
                              className={`${inputCls} h-8 px-2 text-xs`}
                              value={l.supplier}
                              onChange={e => update(l.itemId, { supplier: e.target.value })}
                              placeholder="Supplier"
                              aria-label="Supplier"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              className={`${inputCls} h-8 px-2 text-right text-xs font-medium`}
                              value={l.qty}
                              onChange={e => update(l.itemId, { qty: e.target.value })}
                              placeholder="0"
                              aria-label="Order quantity"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              className={`${inputCls} h-8 px-2 text-right text-xs font-medium`}
                              value={l.price}
                              onChange={e => update(l.itemId, { price: e.target.value })}
                              placeholder="0"
                              aria-label="Rate"
                            />
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap font-bold text-foreground text-xs">
                            {fmtMoney(itemQty * itemPrice)}
                          </td>
                          <td className="px-1.5 py-2 text-center">
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

            {/* Total Valuation Card */}
            <div className="rounded-xl bg-gradient-to-r from-primary/5 via-muted/35 to-background border border-primary/20 px-4 py-3 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider font-bold text-muted-foreground block">
                  Total Order Valuation
                </span>
                <span className="text-xs text-foreground font-medium">
                  {groups.length} Purchase Order{groups.length === 1 ? '' : 's'} to be generated · {lines.length} Line Item{lines.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-primary font-display tabular-nums tracking-tight">
                  {fmtMoney(total)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer: Auto-approve checkbox & Prominent Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
          <div>
            {isAdmin && (
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                <Checkbox checked={approveNow} onCheckedChange={v => setApproveNow(v === true)} />
                <span>Auto-approve immediately (skip pending approval)</span>
              </label>
            )}
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-11 px-6 text-sm font-semibold rounded-xl border-border/80 hover:bg-muted/80 shadow-2xs transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              className="inventory-cta h-11 px-8 text-sm font-bold tracking-wide rounded-xl shadow-md active:scale-98 transition-all"
            >
              {approveNow ? 'Place Order' : 'Send for Approval'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePOModal;
