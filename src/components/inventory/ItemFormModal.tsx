import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { inventoryActions } from '@/hooks/useInventoryStore';
import { CATEGORIES, InventoryItem, STORES, StoreId, UNITS, nextItemCode } from '@/lib/inventory';
import { ErrorNote, Field, FormSection, inputCls, parseNum, selectCls, useInventoryRole } from './shared';

interface Props {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  items: InventoryItem[];
}

const blank = {
  name: '', localName: '', category: CATEGORIES[0].name, unit: 'kg', defaultStore: 'MAIN' as StoreId, supplier: '',
  minStock: '', reorderLevel: '', maxStock: '', leadTimeDays: '3', unitCost: '', perishable: false, shelfLifeDays: '', notes: '',
  openingQty: '',
};

type FormState = typeof blank;

const ItemFormModal: React.FC<Props> = ({ open, onClose, item, items }) => {
  const { userName } = useInventoryRole();
  const [form, setForm] = useState<FormState>(blank);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(item ? {
      name: item.name, localName: item.localName, category: item.category, unit: item.unit, defaultStore: item.defaultStore,
      supplier: item.supplier, minStock: String(item.minStock), reorderLevel: String(item.reorderLevel), maxStock: String(item.maxStock),
      leadTimeDays: String(item.leadTimeDays), unitCost: String(item.unitCost), perishable: item.perishable,
      shelfLifeDays: item.shelfLifeDays ? String(item.shelfLifeDays) : '', notes: item.notes, openingQty: '',
    } : blank);
  }, [open, item]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const suppliers = Array.from(new Set(items.map(i => i.supplier).filter(Boolean))).sort();

  const save = () => {
    try {
      const draft = {
        name: form.name, localName: form.localName.trim(), category: form.category, unit: form.unit, defaultStore: form.defaultStore,
        supplier: form.supplier.trim(), minStock: parseNum(form.minStock), reorderLevel: parseNum(form.reorderLevel),
        maxStock: parseNum(form.maxStock), leadTimeDays: Math.max(0, Math.round(parseNum(form.leadTimeDays))),
        unitCost: parseNum(form.unitCost), perishable: form.perishable,
        shelfLifeDays: form.perishable ? Math.round(parseNum(form.shelfLifeDays)) : null, notes: form.notes.trim(),
      };
      if (item) {
        inventoryActions.updateItem(item.id, draft);
        toast.success(`${form.name.trim()} saved`);
      } else {
        const opening = parseNum(form.openingQty);
        if (opening < 0) throw new Error('Current stock cannot be negative.');
        const created = inventoryActions.addItem(draft, opening > 0 ? { qty: opening, store: form.defaultStore, user: userName } : undefined);
        toast.success(`${created.name} added`, { description: `Item code ${created.code}` });
      }
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const code = item?.code ?? nextItemCode(items, form.category);

  return (
    <Modal open={open} onClose={onClose} title={item ? `Edit ${item.name}` : 'Add New Item'} containerClassName="max-w-2xl">
      <div className="inventory-form-shell space-y-6">
        <ErrorNote message={error} />
        <FormSection title="Basic details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Item code" hint="Created automatically">
              <input className={`${inputCls} font-mono`} value={code} disabled />
            </Field>
            <Field label="Item name" required className="sm:col-span-2">
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Pure Cow Ghee" autoFocus />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Tamil / local name">
              <input className={inputCls} value={form.localName} onChange={e => set('localName', e.target.value)} placeholder="e.g. Nei" />
            </Field>
            <Field label="Category" required>
              <select className={selectCls} value={form.category} onChange={e => set('category', e.target.value)} disabled={!!item}>
                {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Measured in" required>
              <select className={selectCls} value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="When to reorder">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Minimum" required hint="Very low below this">
              <input type="number" min={0} step="any" className={inputCls} value={form.minStock} onChange={e => set('minStock', e.target.value)} />
            </Field>
            <Field label="Reorder at" required hint="Order more at this level">
              <input type="number" min={0} step="any" className={inputCls} value={form.reorderLevel} onChange={e => set('reorderLevel', e.target.value)} />
            </Field>
            <Field label="Maximum" required hint="Order up to this level">
              <input type="number" min={0} step="any" className={inputCls} value={form.maxStock} onChange={e => set('maxStock', e.target.value)} />
            </Field>
            <Field label="Delivery takes (days)">
              <input type="number" min={0} className={inputCls} value={form.leadTimeDays} onChange={e => set('leadTimeDays', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Usually kept in">
              <select className={selectCls} value={form.defaultStore} onChange={e => set('defaultStore', e.target.value as StoreId)}>
                {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Preferred supplier">
              <input className={inputCls} list="inv-suppliers" value={form.supplier} onChange={e => set('supplier', e.target.value)} placeholder="Select or type a supplier" />
              <datalist id="inv-suppliers">{suppliers.map(s => <option key={s} value={s} />)}</datalist>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Price & expiry">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <Field label={`Price (₹ per ${form.unit})`} required>
              <input type="number" min={0} step="any" className={inputCls} value={form.unitCost} onChange={e => set('unitCost', e.target.value)} />
            </Field>
            <div className="flex items-center gap-3 h-10">
              <Switch id="inv-perishable" checked={form.perishable} onCheckedChange={v => set('perishable', v)} />
              <label htmlFor="inv-perishable" className="text-sm font-medium">Has an expiry date</label>
            </div>
            <Field label="Shelf life (days)">
              <input type="number" min={1} className={inputCls} value={form.shelfLifeDays} onChange={e => set('shelfLifeDays', e.target.value)} disabled={!form.perishable} />
            </Field>
          </div>
          {!item && (
            <Field label={`Current stock (${form.unit})`} hint="Optional. How much you already have today.">
              <input type="number" min={0} step="any" className={inputCls} value={form.openingQty} onChange={e => set('openingQty', e.target.value)} />
            </Field>
          )}
          <Field label="Notes">
            <textarea className={`${inputCls} h-20 py-2 resize-none`} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="e.g. Keep in a cool, dry place" />
          </Field>
        </FormSection>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>{item ? 'Save changes' : 'Add item'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ItemFormModal;
