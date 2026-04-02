import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { mockServices } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';

const emptyForm = { name: '', description: '', price: 0, duration: '', status: 'Active' };

const ServicesPage: React.FC = () => {
  const { items, add, update, remove } = useStore(mockServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: typeof mockServices[0]) => {
    setForm({ name: item.name, description: item.description, price: item.price, duration: item.duration, status: item.status });
    setEditId(item.id); setModalOpen(true);
  };
  const handleSave = () => {
    if (editId) update(editId, { ...form, price: Number(form.price) });
    else add({ ...form, price: Number(form.price) } as any);
    setModalOpen(false);
  };
  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: key === 'price' ? Number(val) : val }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Services</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Service</Button>
      </div>
      <div className="table-container"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 font-medium text-muted-foreground">Service Name</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
            <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Duration</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
            <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium text-foreground">{s.name}</td>
                <td className="p-4 text-muted-foreground">{s.description}</td>
                <td className="p-4 text-right font-medium text-foreground">₹{s.price.toLocaleString()}</td>
                <td className="p-4 text-muted-foreground">{s.duration}</td>
                <td className="p-4"><StatusBadge status={s.status} /></td>
                <td className="p-4 text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Service' : 'Add Service'}>
        <div className="space-y-4">
          <FormField label="Service Name" value={form.name} onChange={v => set('name', v)} required />
          <FormField label="Description" value={form.description} onChange={v => set('description', v)} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (₹)" value={String(form.price)} onChange={v => set('price', v)} type="number" />
            <FormField label="Duration" value={form.duration} onChange={v => set('duration', v)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Service" message="Are you sure?" />
    </div>
  );
};

export default ServicesPage;
