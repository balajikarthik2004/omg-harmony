import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Landmark, ShieldAlert } from 'lucide-react';
import { mockAssets } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';

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
    setForm({ name: item.name, category: item.category, purchaseDate: item.purchaseDate, condition: item.condition, maintenanceStatus: item.maintenanceStatus, notes: '' });
    setEditId(item.id); setModalOpen(true);
  };
  const handleSave = () => {
    const payload = {
      name: form.name,
      category: form.category,
      purchaseDate: form.purchaseDate,
      condition: form.condition,
      maintenanceStatus: form.maintenanceStatus,
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
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-gradient-to-r from-sky-50/70 via-background to-cyan-50/70 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Asset Register & Tracking</h1>
          <p className="text-sm text-muted-foreground">Temple assets including fixtures, land, vehicles, and high-value holdings.</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Asset</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Assets</p>
          <p className="text-2xl font-semibold mt-1">{items.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Key Temple Assets</p>
          <p className="text-2xl font-semibold mt-1">{strategicAssetsCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Protected Assets</p>
          <p className="text-2xl font-semibold mt-1">{protectedAssetsCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Maintenance Alerts</p>
          <p className="text-2xl font-semibold mt-1 text-amber-700">{maintenanceDueCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center"><Landmark className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-semibold">Temple Asset Coverage</p>
            <p className="text-xs text-muted-foreground mt-1">Use categories like Gold, Land, and Vehicle while adding assets for complete valuation visibility.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><ShieldAlert className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-semibold">Maintenance Tracker</p>
            <p className="text-xs text-muted-foreground mt-1">Monitor due and overdue assets to avoid operational disruptions.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h2 className="text-sm font-semibold">Asset Ledger</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets"
              className="h-8 w-52 pl-8 pr-3 rounded-md border border-border bg-background text-xs"
            />
          </div>
        </div>
        <div className="table-container"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 font-medium text-muted-foreground">Asset</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Purchase Date</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Condition</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Maintenance</th>
            <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {filteredItems.map(a => (
              <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium text-foreground">{a.name}</td>
                <td className="p-4 text-muted-foreground">{a.category}</td>
                <td className="p-4 text-muted-foreground">{a.purchaseDate}</td>
                <td className="p-4"><StatusBadge status={a.condition} /></td>
                <td className="p-4"><StatusBadge status={a.maintenanceStatus} /></td>
                <td className="p-4 text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No assets found for this search.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div></div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Asset' : 'Add Asset'}>
        <div className="space-y-4">
          <FormField label="Asset Name" value={form.name} onChange={v => set('name', v)} required />
          <FormField label="Category" value={form.category} onChange={v => set('category', v)} />
          <FormField label="Purchase Date" value={form.purchaseDate} onChange={v => set('purchaseDate', v)} type="date" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Condition</label>
            <select value={form.condition} onChange={e => set('condition', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
            </select>
          </div>
          <FormField label="Notes" value={form.notes} onChange={v => set('notes', v)} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Asset" message="Are you sure?" />
    </div>
  );
};

export default AssetsPage;
