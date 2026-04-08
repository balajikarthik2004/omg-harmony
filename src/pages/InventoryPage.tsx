import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, AlertTriangle, Package, Layers, Droplets } from 'lucide-react';
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
  if (pct === 0) return 'bg-destructive';
  if (pct < 30) return 'bg-warning';
  return 'bg-primary';
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
    <div className="inventory-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner inventory-header">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Inventory & Material Central</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage pooja items, food stock, and see what needs to be ordered.</p>
        </div>
        {activeSection === 'inventory' && <Button onClick={openAdd} className="inventory-cta shadow-md hover:shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add New Item</Button>}
      </div>

      <div className="inventory-tabbar rounded-xl border border-border bg-card shadow-sm p-1.5 flex w-full max-w-sm mx-auto md:mx-0">
        {([
          ['inventory', 'Inventory Ledger', Layers],
          ['procurement', 'Procurement & Orders', Package],
        ] as Array<['inventory' | 'procurement', string, React.ElementType]>).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`inventory-tab-btn flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-300 font-bold ${activeSection === key ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {activeSection === 'procurement' && <ProcurementPage />}

      {activeSection === 'inventory' && (
        <div className="animate-slide-up space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card inventory-stat-card flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-muted/30 group-hover:scale-110 transition-transform" />
              <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Total Items</p>
              <p className="text-3xl font-display font-bold mt-2 text-foreground relative z-10">{items.length}</p>
            </div>
            <div className="stat-card inventory-stat-card flex flex-col justify-between group overflow-hidden relative border-secondary/20 bg-secondary/5">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-secondary/10 group-hover:scale-110 transition-transform" />
              <p className="text-[11px] uppercase tracking-widest font-bold text-secondary">Pooja Items</p>
              <p className="text-3xl font-display font-bold mt-2 text-secondary relative z-10">{poojaMaterialsCount}</p>
            </div>
            <div className="stat-card inventory-stat-card flex flex-col justify-between group overflow-hidden relative border-primary/20 bg-primary/5">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary/10 group-hover:scale-110 transition-transform" />
              <p className="text-[11px] uppercase tracking-widest font-bold text-primary">Food Stock</p>
              <p className="text-3xl font-display font-bold mt-2 text-primary relative z-10">{prasadamStockCount}</p>
            </div>
            <div className="stat-card inventory-stat-card flex flex-col justify-between group overflow-hidden relative border-destructive/20 bg-destructive/5">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-destructive/10 group-hover:scale-110 transition-transform" />
              <p className="text-[11px] uppercase tracking-widest font-bold text-destructive flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning</p>
              <p className="text-3xl font-display font-bold mt-2 text-destructive relative z-10">{lowStockItems.length}</p>
            </div>
          </div>

          {lowStockItems.length > 0 && (
            <div className="inventory-alert rounded-xl border border-destructive/20 bg-destructive/5 p-5 flex items-start gap-4 shadow-sm animate-pulse-slow">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 border border-destructive/20">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-bold text-destructive tracking-wide uppercase">Refill Needed Immediately</p>
                <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                  The following items are running very low and need to be ordered: <span className="font-bold bg-destructive/10 text-destructive px-1.5 rounded">{lowStockItems.map(i => i.name).join(', ')}</span>.
                </p>
              </div>
            </div>
          )}

          <div className="section-panel inventory-main-panel shadow-sm">
            <div className="section-panel-header gap-4 py-4 border-b border-border/60">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Main Stock List</h2>
              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 flex-wrap">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search items, suppliers..."
                    className="inventory-search-input w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background/60 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none shadow-sm"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="inventory-field h-10 rounded-lg border border-input bg-background/60 px-3 text-sm transition-all focus:border-primary hover:border-border outline-none min-w-[140px] shadow-sm font-medium"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Item Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Category</th>
                    <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Current Stock</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Unit</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Stock Level</th>
                    <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-background">
                  {filteredItems.map(i => {
                    const pct = getStockPercent(i.quantity, i.name);
                    const barColor = getProgressColor(pct);
                    return (
                      <tr key={i.id} className="inventory-row border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold text-foreground">
                          <p>{i.name}</p>
                          {i.supplier && <p className="text-[10px] text-foreground/60 font-medium mt-0.5" title="Primary Supplier">{i.supplier}</p>}
                        </td>
                        <td className="p-4">
                          <span className="text-primary text-[11px] font-bold tracking-wider uppercase italic">{i.category}</span>
                        </td>
                        <td className="p-4 text-right font-display font-bold text-xl text-foreground tracking-tight">{i.quantity}</td>
                        <td className="p-4 text-foreground/70 font-semibold"><Droplets className="w-3.5 h-3.5 inline mr-1 opacity-50" />{i.unit}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${i.stockStatus === 'In Stock' ? 'bg-primary' : 'bg-destructive'}`} />
                            <span className="font-semibold text-xs text-foreground/80">{i.stockStatus}</span>
                          </div>
                        </td>
                        <td className="p-4 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 rounded-full bg-muted/60 border border-border/40 overflow-hidden shadow-inner flex items-center">
                              <div
                                className={`h-full rounded-full transition-all duration-[800ms] ease-bounce ${barColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-foreground/60 w-10 text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex gap-1.5 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(i)} title="Modify Stock"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(i.id)} className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground" title="Delete Register"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-sm font-medium text-muted-foreground border-b border-border">No items found in stock list.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div></div>
          </div>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Item Details' : 'Add New Item'}>
            <div className="inventory-form-shell space-y-5 px-1 py-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Item Name" value={form.name} onChange={v => set('name', v)} required placeholder="E.g., Turmeric Powder" />
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                  <input value={form.category} onChange={e => set('category', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-medium" placeholder="E.g., Pooja Items" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Quantity</label>
                  <input type="number" value={String(form.quantity)} onChange={e => set('quantity', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-card hover:border-primary/50 px-3 text-lg transition-all focus:border-primary font-display font-bold outline-none focus:ring-2 focus:ring-primary/10 shadow-sm" />
                </div>
                <FormField label="Unit (kg/ltr/pkt)" value={form.unit} onChange={v => set('unit', v)} placeholder="e.g. Kg, Ltr, Pkt" />
              </div>
              <FormField label="Supplier Name" value={form.supplier} onChange={v => set('supplier', v)} placeholder="Where do we buy this from?" />

              <div className="flex gap-3 pt-5 border-t border-border/60">
                <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 py-5">Cancel</Button>
                <Button onClick={handleSave} className="flex-1 py-5 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">Save Item</Button>
              </div>
            </div>
          </Modal>
          <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Item" message="Are you sure you want to delete this item from the stock list? This cannot be undone." />
        </div>
      )}
    </div>
  );
};

export default InventoryPage;