import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { mockBookings } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';
import { formatDateDDMMYYYY } from '@/lib/utils';

const emptyForm = { devoteeName: '', serviceName: '', date: '', time: '', notes: '', paymentStatus: 'Pending', bookingStatus: 'Pending' };

const BookingsPage: React.FC = () => {
  const { items, add, update, remove } = useStore(mockBookings);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: typeof mockBookings[0]) => {
    setForm({ devoteeName: item.devoteeName, serviceName: item.serviceName, date: item.date, time: item.time, notes: '', paymentStatus: item.paymentStatus, bookingStatus: item.bookingStatus });
    setEditId(item.id); setModalOpen(true);
  };
  const handleSave = () => {
    if (editId) update(editId, form);
    else add(form as any);
    setModalOpen(false);
  };
  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Bookings</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Create Booking</Button>
      </div>
      <div className="table-container"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 font-medium text-muted-foreground">Booking ID</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Devotee</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Service</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Payment</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
            <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {items.map(b => (
              <tr key={b.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium text-foreground">{b.id}</td>
                <td className="p-4 text-foreground">{b.devoteeName}</td>
                <td className="p-4 text-muted-foreground">{b.serviceName}</td>
                <td className="p-4 text-muted-foreground">{formatDateDDMMYYYY(b.date)}</td>
                <td className="p-4 text-muted-foreground">{b.time}</td>
                <td className="p-4"><StatusBadge status={b.paymentStatus} /></td>
                <td className="p-4"><StatusBadge status={b.bookingStatus} /></td>
                <td className="p-4 text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Booking' : 'Create Booking'}>
        <div className="space-y-4">
          <FormField label="Devotee Name" value={form.devoteeName} onChange={v => set('devoteeName', v)} required />
          <FormField label="Service Name" value={form.serviceName} onChange={v => set('serviceName', v)} required />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" value={form.date} onChange={v => set('date', v)} type="date" />
            <FormField label="Time" value={form.time} onChange={v => set('time', v)} />
          </div>
          <FormField label="Notes" value={form.notes} onChange={v => set('notes', v)} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Booking" message="Are you sure?" />
    </div>
  );
};

export default BookingsPage;
