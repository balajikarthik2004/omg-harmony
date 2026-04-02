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
    <div className="space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner bg-gradient-to-r from-emerald-50/80 via-background to-teal-50/80">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Landmark className="w-5 h-5 text-emerald-600" /> Temple Real Asset & Wealth Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage physical infrastructure, real estate, precious holdings, and required maintenance.</p>
        </div>
        <Button onClick={openAdd} className="shadow-md hover:shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="h-4 w-4 mr-2" />Register Asset</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-muted/30 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Total Registered</p>
          <p className="text-3xl font-display font-bold mt-2 text-foreground relative z-10">{items.length}</p>
        </div>
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-blue-100 bg-blue-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-blue-800 flex items-center gap-1.5"><Gem className="w-3.5 h-3.5" /> Core Assets</p>
          <p className="text-3xl font-display font-bold mt-2 text-blue-700 relative z-10">{strategicAssetsCount}</p>
        </div>
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-teal-100 bg-teal-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-teal-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-teal-800 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Protected Status</p>
          <p className="text-3xl font-display font-bold mt-2 text-teal-700 relative z-10">{protectedAssetsCount}</p>
        </div>
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-rose-200 bg-rose-50/70 shadow-[0_4px_12px_-4px_rgba(244,63,94,0.3)]">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-rose-200/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-rose-800 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Requires Action</p>
          <p className="text-3xl font-display font-bold mt-2 text-rose-700 relative z-10">{maintenanceDueCount}</p>
        </div>
      </div>

      <div className="section-panel shadow-sm">
        <div className="section-panel-header gap-4 border-b border-border/60 pb-4 bg-gradient-to-r from-emerald-50/50 to-transparent">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Landmark className="w-4 h-4 text-emerald-600" /> Core Asset Inventory</h2>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Query asset database..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background/80 text-sm transition-all shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none hover:border-border"
            />
          </div>
        </div>
        <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Asset Designation</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Asset Class</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Acquisition Timeline</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Physical Condition</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Lifecycle Status</th>
              <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Controls</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {filteredItems.map(a => (
              <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                <td className="p-4 font-bold text-foreground">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0 shadow-sm group-hover:scale-105 transition-transform"><Building className="w-4 h-4" /></div>
                     {a.name}
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-wide uppercase">{a.category}</span>
                </td>
                <td className="p-4 text-muted-foreground font-medium text-xs flex items-center gap-1.5 pt-6 border-0 align-middle"><Calendar className="w-3.5 h-3.5 opacity-50" /> {new Date(a.purchaseDate).toLocaleDateString('en-GB')}</td>
                <td className="p-4"><StatusBadge status={a.condition} /></td>
                <td className="p-4">
                  <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-bold shadow-sm", 
                    a.maintenanceStatus === 'Up to Date' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    a.maintenanceStatus === 'Overdue' ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse-slow" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {a.maintenanceStatus !== 'Up to Date' && <AlertCircle className="w-3.5 h-3.5" />}
                    {a.maintenanceStatus}
                  </div>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex gap-1.5 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)} title="Update Ledger"><Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)} className="hover:bg-rose-50 hover:text-rose-700 text-muted-foreground" title="Write-off Asset"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-sm font-medium text-muted-foreground border-b border-border">No assets found matching the query criteria in the ledger.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div></div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Amend Asset Entry' : 'Register New Asset'}>
        <div className="space-y-5 px-1 py-2">
          <div className="grid grid-cols-2 gap-4">
             <FormField label="Asset Identification / Name" value={form.name} onChange={v => set('name', v)} required placeholder="E.g., Central Bronze Bell" />
             <div className="space-y-1.5">
               <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Classification Cohort</label>
               <input value={form.category} onChange={e => set('category', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-sm font-semibold" placeholder="E.g., Temple Fixtures" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <FormField label="Date of Acquisition" value={form.purchaseDate} onChange={v => set('purchaseDate', v)} type="date" />
             <div className="space-y-1.5">
               <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Current Condition</label>
               <select value={form.condition} onChange={e => set('condition', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none hover:border-border shadow-sm font-semibold">
                 <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
               </select>
             </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Lifecycle & Maintenance Status</label>
             <select value={form.maintenanceStatus} onChange={e => set('maintenanceStatus', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-emerald-50/50 hover:border-emerald-200 px-3 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none shadow-sm font-bold">
                <option>Up to Date</option><option>Due Soon</option><option>Overdue</option>
             </select>
          </div>

          <div className="space-y-1.5 mt-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Audit Notes & Details</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full rounded-lg border border-input bg-background/80 px-3 py-3 text-sm min-h-[100px] resize-none transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none hover:border-border shadow-sm font-medium leading-relaxed" placeholder="Detailed physical description, serial numbers, locations..." />
          </div>

          <div className="flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 py-5">Cancel Entry</Button>
            <Button onClick={handleSave} className="flex-1 py-5 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">Append Ledger</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Liquidation / Write-off" message="Are you absolutely sure you want to strike this asset from the master register? This action cannot be seamlessly reversed." />
    </div>
  );
};

export default AssetsPage;
