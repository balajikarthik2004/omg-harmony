import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Landmark, ShieldAlert, Building, Gem, Calendar, AlertCircle } from 'lucide-react';
import { mockAssets } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';

const emptyForm = { name: '', category: '', purchaseDate: '', condition: 'Good', maintenanceStatus: 'Up to Date', notes: '' };

const AssetsPage: React.FC = () => {
  const { items, add, update, remove } = useStore(mockAssets);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: typeof mockAssets[0]) => {
    setForm({ name: item.name, category: item.category, purchaseDate: item.purchaseDate, condition: item.condition, maintenanceStatus: item.maintenanceStatus, notes: item.notes || '' });
    setEditId(item.id); setModalOpen(true);
  };
  const handleSave = () => {
    const payload = {
      name: form.name,
      category: form.category,
      purchaseDate: form.purchaseDate,
      condition: form.condition,
      maintenanceStatus: form.maintenanceStatus,
      notes: form.notes,
    };

    if (editId) update(editId, payload);
    else add(payload);
    setModalOpen(false);
  };
  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const maintenanceDueCount = items.filter(a => a.maintenanceStatus !== 'Up to Date').length;
  const protectedAssetsCount = items.filter(a => ['Temple Fixtures', 'Security'].includes(a.category)).length;
  const strategicAssetsCount = items.filter(a => ['Land', 'Vehicle', 'Gold', 'Treasury', 'Temple Fixtures'].includes(a.category)).length;

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.condition.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className="assets-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner assets-header">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Landmark className="w-5 h-5 text-emerald-500" /> Temple Assets & Property</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage buildings, land, valuable items, and check their maintenance.</p>
        </div>
        <Button onClick={openAdd} className="assets-cta shadow-md hover:shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white"><Plus className="h-4 w-4 mr-2" />Add New Asset</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <div className="stat-card assets-stat-card flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-muted/30 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Total Assets</p>
          <p className="text-3xl font-display font-bold mt-2 text-foreground relative z-10">{items.length}</p>
        </div>
        <div className="stat-card assets-stat-card flex flex-col justify-between group overflow-hidden relative border-blue-500/20 bg-blue-500/5">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-500/10 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-blue-500 flex items-center gap-1.5"><Gem className="w-3.5 h-3.5" /> Main Items</p>
          <p className="text-3xl font-display font-bold mt-2 text-blue-500 relative z-10">{strategicAssetsCount}</p>
        </div>
        <div className="stat-card assets-stat-card flex flex-col justify-between group overflow-hidden relative border-emerald-500/20 bg-emerald-500/5">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/10 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-500 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Secured Assets</p>
          <p className="text-3xl font-display font-bold mt-2 text-emerald-500 relative z-10">{protectedAssetsCount}</p>
        </div>
        <div className="stat-card assets-stat-card flex flex-col justify-between group overflow-hidden relative border-destructive/20 bg-destructive/5">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-destructive/10 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-destructive flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Need Maintenance</p>
          <p className="text-3xl font-display font-bold mt-2 text-destructive relative z-10">{maintenanceDueCount}</p>
        </div>
      </div>

      <div className="section-panel assets-main-panel shadow-sm">
        <div className="section-panel-header assets-main-header whitespace-nowrap overflow-hidden">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Landmark className="w-4 h-4 text-emerald-600" /> All Asset List</h2>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="assets-search-input w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background/80 text-sm transition-all shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none hover:border-border"
            />
          </div>
        </div>
        <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b border-border">
               <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Asset Name</th>
               <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Category</th>
               <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Bought Date</th>
               <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Condition</th>
               <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Maintenance</th>
               <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {filteredItems.map(a => (
              <tr key={a.id} className="assets-row border-b border-border hover:bg-muted/30 transition-colors group">
                <td className="p-4 font-bold text-foreground">
                   {a.name}
                </td>
                <td className="p-4">
                  <span className="text-accent text-[11px] font-bold tracking-wider uppercase italic">{a.category}</span>
                </td>
                <td className="p-4 text-muted-foreground font-medium text-[11px] flex items-center gap-1.5 pt-6 border-0 align-middle"><Calendar className="w-3.5 h-3.5 opacity-50" /> {new Date(a.purchaseDate).toLocaleDateString('en-GB')}</td>
                <td className="p-4">
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${a.condition === 'Excellent' ? 'bg-emerald-500' : a.condition === 'Good' ? 'bg-blue-500' : a.condition === 'Fair' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                     <span className="font-semibold text-xs text-foreground/80">{a.condition}</span>
                   </div>
                </td>
                <td className="p-4">
                  <div className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold", 
                    a.maintenanceStatus === 'Up to Date' ? "text-emerald-500" :
                    a.maintenanceStatus === 'Overdue' ? "text-rose-500" : "text-amber-500"
                  )}>
                    {a.maintenanceStatus !== 'Up to Date' && <AlertCircle className="w-3.5 h-3.5" />}
                    {a.maintenanceStatus}
                  </div>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex gap-1.5 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)} title="Edit Asset"><Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)} className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground" title="Delete Asset"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                 <td colSpan={6} className="p-12 text-center text-sm font-medium text-muted-foreground border-b border-border">No assets found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div></div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Asset' : 'Add New Asset'}>
       <div className="assets-form-shell space-y-5 px-1 py-2">
          <div className="grid grid-cols-2 gap-4">
             <FormField label="Asset Name" value={form.name} onChange={v => set('name', v)} required placeholder="E.g., Central Bronze Bell" />
             <div className="space-y-1.5">
               <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
               <input value={form.category} onChange={e => set('category', e.target.value)} className="assets-field w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-sm font-semibold" placeholder="E.g., Furniture, Vehicles" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <FormField label="Date Bought" value={form.purchaseDate} onChange={v => set('purchaseDate', v)} type="date" />
             <div className="space-y-1.5">
               <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Current Condition</label>
               <select value={form.condition} onChange={e => set('condition', e.target.value)} className="assets-field w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm text-foreground transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none hover:border-border shadow-sm font-semibold">
                 <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
               </select>
             </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Maintenance Status</label>
             <select value={form.maintenanceStatus} onChange={e => set('maintenanceStatus', e.target.value)} className="assets-field w-full h-11 rounded-lg border border-input transition-all bg-card hover:border-border px-3 text-sm text-foreground focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-sm font-bold">
                <option>Up to Date</option><option>Due Soon</option><option>Overdue</option>
             </select>
          </div>

          <div className="space-y-1.5 mt-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Notes & Details</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="assets-field w-full rounded-lg border border-input bg-background/80 px-3 py-3 text-sm min-h-[100px] resize-none transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none hover:border-border shadow-sm font-medium leading-relaxed" placeholder="Description, location, or serial numbers..." />
          </div>

          <div className="flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 py-5">Cancel</Button>
            <Button onClick={handleSave} className="assets-cta flex-1 py-5 shadow-md bg-emerald-500 hover:bg-emerald-600 text-white">Save Asset</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Asset" message="Are you sure you want to remove this asset? This cannot be undone." />
    </div>
  );
};

export default AssetsPage;
