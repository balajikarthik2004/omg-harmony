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
  if (pct === 0) return 'bg-rose-500';
  if (pct < 30) return 'bg-amber-500';
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
    <div className="space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner bg-gradient-to-r from-amber-50/80 via-background to-orange-50/80">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Package className="w-5 h-5 text-amber-600" /> Inventory & Material Central</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage pooja materials, prasadam ingredients, and monitor critical replenishment alerts.</p>
        </div>
        {activeSection === 'inventory' && <Button onClick={openAdd} className="shadow-md hover:shadow-lg bg-amber-600 hover:bg-amber-700 text-white"><Plus className="h-4 w-4 mr-2" />Log New Item</Button>}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-1.5 flex w-full max-w-sm mx-auto md:mx-0">
         {([
           ['inventory', 'Inventory Ledger', Layers],
           ['procurement', 'Procurement & Orders', Package],
         ] as Array<['inventory' | 'procurement', string, React.ElementType]>).map(([key, label, Icon]) => (
           <button
             key={key}
             onClick={() => setActiveSection(key)}
             className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-300 font-bold ${activeSection === key ? 'bg-amber-600 text-white shadow-md scale-[1.02]' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent'}`}
           >
             <Icon className="w-4 h-4" /> {label}
           </button>
         ))}
      </div>

      {activeSection === 'procurement' && <ProcurementPage />}

      {activeSection === 'inventory' && (
      <div className="animate-slide-up space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-muted/30 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Total Articles</p>
            <p className="text-3xl font-display font-bold mt-2 text-foreground relative z-10">{items.length}</p>
          </div>
          <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-amber-100 bg-amber-50/30">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-100/50 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] uppercase tracking-widest font-bold text-amber-800">Pooja Reserves</p>
            <p className="text-3xl font-display font-bold mt-2 text-amber-700 relative z-10">{poojaMaterialsCount}</p>
          </div>
          <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-emerald-100 bg-emerald-50/30">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-100/50 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-800">Prasadam Staples</p>
            <p className="text-3xl font-display font-bold mt-2 text-emerald-700 relative z-10">{prasadamStockCount}</p>
          </div>
          <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-rose-200 bg-rose-50/80 shadow-[0_4px_12px_-4px_rgba(244,63,94,0.3)]">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-rose-200/50 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] uppercase tracking-widest font-bold text-rose-800 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Stock Alerts</p>
            <p className="text-3xl font-display font-bold mt-2 text-rose-700 relative z-10">{lowStockItems.length}</p>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-background p-5 flex items-start gap-4 shadow-sm animate-pulse-slow">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200">
               <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900 tracking-wide">Critical Replenishment Required</p>
              <p className="text-sm text-rose-800/80 mt-1 leading-relaxed">
                The following operational items have breached minimum threshold levels: <span className="font-bold bg-rose-100 text-rose-900 px-1.5 rounded">{lowStockItems.map(i => i.name).join(', ')}</span>.
              </p>
            </div>
          </div>
        )}

        <div className="section-panel shadow-sm">
          <div className="section-panel-header gap-4 py-4 border-b border-border/60">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Layers className="w-4 h-4 text-amber-600" /> Master Inventory Ledger</h2>
            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles, suppliers..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background/60 text-sm transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none shadow-sm"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background/60 px-3 text-sm transition-all focus:border-amber-500 hover:border-border outline-none min-w-[140px] shadow-sm font-medium"
              >
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Article Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Category Group</th>
                <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Current Qty</th>
                <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Vol/Wt</th>
                <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Condition</th>
                <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Health Indicator</th>
                <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Controls</th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {filteredItems.map(i => {
                const pct = getStockPercent(i.quantity, i.name);
                const barColor = getProgressColor(pct);
                return (
                  <tr key={i.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-bold text-foreground">
                      <p>{i.name}</p>
                      {i.supplier && <p className="text-[10px] text-muted-foreground font-medium mt-0.5" title="Primary Supplier">{i.supplier}</p>}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-wide uppercase">{i.category}</span>
                    </td>
                    <td className="p-4 text-right font-display font-bold text-xl text-foreground tracking-tight">{i.quantity}</td>
                    <td className="p-4 text-muted-foreground font-semibold"><Droplets className="w-3.5 h-3.5 inline mr-1 opacity-50" />{i.unit}</td>
                    <td className="p-4"><StatusBadge status={i.stockStatus} /></td>
                    <td className="p-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 rounded-full bg-muted/60 border border-border/40 overflow-hidden shadow-inner flex items-center">
                          <div
                            className={`h-full rounded-full transition-all duration-[800ms] ease-bounce ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground w-10 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(i)} title="Modify Stock"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(i.id)} className="hover:bg-rose-50 hover:text-rose-700 text-muted-foreground" title="Delete Register"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-sm font-medium text-muted-foreground border-b border-border">No inventory articles match the current filter.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div></div>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Manage Article Detail' : 'Log New Article'}>
          <div className="space-y-5 px-1 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Article Specification" value={form.name} onChange={v => set('name', v)} required placeholder="E.g., Turmeric Powder" />
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category Block</label>
                <input value={form.category} onChange={e => set('category', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all focus:ring-2 focus:ring-amber-500/20 outline-none shadow-sm font-medium" placeholder="E.g., Pooja Essentials" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Volume / Count</label>
                <input type="number" value={String(form.quantity)} onChange={e => set('quantity', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-amber-50/50 hover:border-amber-200 px-3 text-lg transition-all focus:border-amber-500 font-display font-bold outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm" />
              </div>
              <FormField label="Measurement Unit" value={form.unit} onChange={v => set('unit', v)} placeholder="Kg, Ltr, Pkt, Bags" />
            </div>
            <FormField label="Vendor / Source" value={form.supplier} onChange={v => set('supplier', v)} placeholder="Approved merchant details" />
            
            <div className="flex gap-3 pt-5 border-t border-border/60">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 py-5">Cancel Mod</Button>
              <Button onClick={handleSave} className="flex-1 py-5 shadow-md bg-amber-600 hover:bg-amber-700 text-white">Commit Record</Button>
            </div>
          </div>
        </Modal>
        <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Sever Article Link" message="Are you absolutely certain you want to eradicate this material from the master ledger? Audit trails will shift." />
      </div>
      )}
    </div>
  );
};

export default InventoryPage;