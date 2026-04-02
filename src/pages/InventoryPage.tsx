import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, AlertTriangle, Package } from 'lucide-react';
import { mockInventory } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';
import ProcurementPage from '@/pages/ProcurementPage';

const emptyForm = { name: '', category: '', quantity: 0, unit: '', stockStatus: 'In Stock', supplier: '' };

const MAX_QUANTITY: Record<string, number> = {
  default: 100,
};

function getStockPercent(quantity: number, name: string): number {
  const max = MAX_QUANTITY[name] ?? MAX_QUANTITY.default;
  return Math.min(100, Math.round((quantity / max) * 100));
}

function getProgressColor(pct: number): string {
  if (pct === 0) return 'bg-red-500';
  if (pct < 30) return 'bg-amber-400';
  return 'bg-emerald-500';
}

const InventoryPage: React.FC = () => {
  const { items, add, update, remove } = useStore(mockInventory);
  const [activeSection, setActiveSection] = useState<'inventory' | 'procurement'>('inventory');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: typeof mockInventory[0]) => {
    setForm({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, stockStatus: item.stockStatus, supplier: item.supplier });
    setEditId(item.id); setModalOpen(true);
  };
  const handleSave = () => {
    if (editId) update(editId, { ...form, quantity: Number(form.quantity) });
    else add({ ...form, quantity: Number(form.quantity) } as any);
    setModalOpen(false);
  };
  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: key === 'quantity' ? Number(val) : val }));

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category)))], [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(item => {
      const matchesSearch = !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const poojaMaterialsCount = items.filter(i => i.category.toLowerCase().includes('pooja')).length;
  const prasadamStockCount = items.filter(i => ['kitchen', 'prasadam'].some(k => i.category.toLowerCase().includes(k))).length;
  const lowStockItems = items.filter(i => i.stockStatus !== 'In Stock');
  const inStockCount = items.filter(i => i.stockStatus === 'In Stock').length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-gradient-to-r from-amber-50/70 via-background to-orange-50/70 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Inventory & Material Tracking</h1>
          <p className="text-sm text-muted-foreground">Pooja materials, prasadam stock, and replenishment alerts.</p>
        </div>
        {activeSection === 'inventory' && <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Item</Button>}
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm p-2">
        <div className="grid grid-cols-2 gap-2">
          {([
            ['inventory', 'Inventory Ledger'],
            ['procurement', 'Procurement'],
          ] as Array<['inventory' | 'procurement', string]>).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`rounded-lg px-3 py-2 text-sm transition-colors border ${activeSection === key ? 'bg-muted text-foreground border-foreground/20 font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'procurement' && <ProcurementPage />}

      {activeSection === 'inventory' && (
      <>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Items</p>
          <p className="text-2xl font-semibold mt-1">{items.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pooja Materials</p>
          <p className="text-2xl font-semibold mt-1">{poojaMaterialsCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Prasadam Stock</p>
          <p className="text-2xl font-semibold mt-1">{prasadamStockCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Stock Alerts</p>
          <p className="text-2xl font-semibold mt-1 text-red-600">{lowStockItems.length}</p>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Low Stock Alert</p>
            <p className="text-xs text-red-700/90 mt-0.5">{lowStockItems.map(i => i.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h2 className="text-sm font-semibold">Inventory Ledger</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search item or supplier"
                className="h-8 w-52 pl-8 pr-3 rounded-md border border-border bg-background text-xs"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="table-container"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 font-medium text-muted-foreground">Item</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
            <th className="text-right p-4 font-medium text-muted-foreground">Quantity</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Unit</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Stock Level</th>
            <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {filteredItems.map(i => {
              const pct = getStockPercent(i.quantity, i.name);
              const barColor = getProgressColor(pct);
              return (
                <tr key={i.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{i.name}</td>
                  <td className="p-4 text-muted-foreground">{i.category}</td>
                  <td className="p-4 text-right text-foreground">{i.quantity}</td>
                  <td className="p-4 text-muted-foreground">{i.unit}</td>
                  <td className="p-4"><StatusBadge status={i.stockStatus} /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No inventory items found for the current filter.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><Package className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-semibold">Healthy Stock</p>
            <p className="text-xs text-muted-foreground">{inStockCount} items are currently in stock.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-sm font-semibold">Temple Inventory Focus</p>
          <p className="text-xs text-muted-foreground mt-1">Track pooja essentials (oil, flowers, camphor), kitchen and prasadam materials, and raise quick alerts for procurement.</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Item' : 'Add Item'}>
        <div className="space-y-4">
          <FormField label="Item Name" value={form.name} onChange={v => set('name', v)} required />
          <FormField label="Category" value={form.category} onChange={v => set('category', v)} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity" value={String(form.quantity)} onChange={v => set('quantity', v)} type="number" />
            <FormField label="Unit" value={form.unit} onChange={v => set('unit', v)} />
          </div>
          <FormField label="Supplier" value={form.supplier} onChange={v => set('supplier', v)} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Item" message="Are you sure?" />
      </>
      )}
    </div>
  );
};

export default InventoryPage;