import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { mockTasks } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';

const emptyForm = { name: '', assignedTo: '', dueDate: '', time: '', status: 'Pending', type: 'general' as string };

const TasksPage: React.FC = () => {
  const { items, add, update, remove } = useStore(mockTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const poojas = items.filter(t => t.type === 'pooja');
  const general = items.filter(t => t.type === 'general');

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (item: typeof mockTasks[0]) => {
    setForm({ name: item.name, assignedTo: item.assignedTo, dueDate: item.dueDate, time: item.time || '', status: item.status, type: item.type });
    setEditId(item.id); setModalOpen(true);
  };
  const handleSave = () => {
    if (editId) update(editId, form as any);
    else add(form as any);
    setModalOpen(false);
  };
  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const renderTable = (title: string, data: typeof mockTasks, showTime: boolean) => (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-foreground">{title}</h2>
      <div className="table-container"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 font-medium text-muted-foreground">Task</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Assigned To</th>
            {showTime && <th className="text-left p-4 font-medium text-muted-foreground">Time</th>}
            <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
            <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {data.map(t => (
              <tr key={t.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium text-foreground">{t.name}</td>
                <td className="p-4 text-muted-foreground">{t.assignedTo}</td>
                {showTime && <td className="p-4 text-muted-foreground">{t.time}</td>}
                <td className="p-4 text-muted-foreground">{t.dueDate}</td>
                <td className="p-4"><StatusBadge status={t.status} /></td>
                <td className="p-4 text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Tasks</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Task</Button>
      </div>
      {renderTable('Daily Poojas', poojas, true)}
      {renderTable('General Tasks', general, false)}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Task' : 'Add Task'}>
        <div className="space-y-4">
          <FormField label="Task Name" value={form.name} onChange={v => set('name', v)} required />
          <FormField label="Assigned To" value={form.assignedTo} onChange={v => set('assignedTo', v)} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Due Date" value={form.dueDate} onChange={v => set('dueDate', v)} type="date" />
            <FormField label="Time" value={form.time} onChange={v => set('time', v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="pooja">Daily Pooja</option><option value="general">General Task</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option>Pending</option><option>In Progress</option><option>Completed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Task" message="Are you sure?" />
    </div>
  );
};

export default TasksPage;
