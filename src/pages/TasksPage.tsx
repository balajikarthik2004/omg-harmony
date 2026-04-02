import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, CheckCircle2, ListTodo, CalendarClock, Target, AlertCircle } from 'lucide-react';
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
  const completedCount = items.filter(t => t.status === 'Completed').length;
  const pendingCount = items.length - completedCount;

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

  const renderTable = (title: string, data: typeof mockTasks, showTime: boolean, icon: React.ElementType, borderColor: string, headerGradient: string) => (
    <div className="section-panel shadow-sm mb-6 border-l-4" style={{ borderLeftColor: borderColor }}>
      <div className={`section-panel-header gap-3 border-b border-border/60 pb-3 bg-gradient-to-r ${headerGradient} to-transparent`}>
        <h2 className="text-sm font-semibold flex items-center gap-2">
          {React.createElement(icon, { className: "w-4 h-4", style: { color: borderColor } })}
          {title}
        </h2>
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-background rounded px-2.5 py-1 border border-border/60 shadow-sm">{data.length} assigned</span>
      </div>
      <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Task Directive</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Assignee</th>
              {showTime && <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Time</th>}
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Target Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Current Status</th>
              <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {data.length > 0 ? data.map(t => (
              <tr key={t.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                <td className="p-4 font-semibold text-foreground max-w-[250px] truncate" title={t.name}>{t.name}</td>
                <td className="p-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20 shrink-0">{t.assignedTo.charAt(0)}</div>
                    <span className="font-medium text-foreground text-xs truncate max-w-[120px]" title={t.assignedTo}>{t.assignedTo}</span>
                  </div>
                </td>
                {showTime && <td className="p-4 text-muted-foreground font-medium text-xs">
                   {t.time ? <span className="bg-muted/50 border border-border/50 px-2 py-0.5 rounded">{t.time}</span> : '-'}
                </td>}
                <td className="p-4 text-muted-foreground font-medium text-xs">{t.dueDate}</td>
                <td className="p-4"><StatusBadge status={t.status} /></td>
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex gap-1.5 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)} title="Edit Configuration"><Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)} className="hover:text-destructive hover:bg-destructive/10 text-muted-foreground" title="Remove Task"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={showTime ? 6 : 5} className="p-10 text-center text-sm font-medium text-muted-foreground border-b border-border">No tasks currently registered for this queue.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <div className="page-header-banner bg-gradient-to-r from-blue-50/80 via-background to-indigo-50/80">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><ListTodo className="w-5 h-5 text-blue-600" /> Duty Center & Logistics</h1>
          <p className="text-sm text-muted-foreground mt-1">Orchestrate daily poojas, generic duties, and overall logistical operations.</p>
        </div>
        <Button onClick={openAdd} className="shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4 mr-2" />Assign Duty</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-stagger">
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-muted/30 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Total Directives</p>
          <p className="text-3xl font-display font-bold mt-2 text-foreground relative z-10">{items.length}</p>
        </div>
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-amber-100 bg-amber-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-amber-800 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Rituals Assigned</p>
          <p className="text-3xl font-display font-bold mt-2 text-amber-700 relative z-10">{poojas.length}</p>
        </div>
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-emerald-100 bg-emerald-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-800 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Tasks Achieved</p>
          <p className="text-3xl font-display font-bold mt-2 text-emerald-700 relative z-10">{completedCount}</p>
        </div>
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-blue-100 bg-blue-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-blue-800 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Operations Pending</p>
          <p className="text-3xl font-display font-bold mt-2 text-blue-700 relative z-10">{pendingCount}</p>
        </div>
      </div>

      <div className="mt-2 space-y-6">
        {renderTable('Daily Rituals & Poojas Queue', poojas, true, CalendarClock, 'hsl(38 92% 50%)', 'from-amber-50')}
        {renderTable('General Management & Site Tasks', general, false, Target, 'hsl(233 53% 35%)', 'from-blue-50')}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Revise Task Directive' : 'Assign New Duty'}>
        <div className="space-y-4 px-1 pb-2">
          <FormField label="Task / Duty Specification" value={form.name} onChange={v => set('name', v)} required placeholder="Describe the duty clearly..." />
          
          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4 mt-2">
             <div className="space-y-1.5">
               <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Queue Classification</label>
               <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-semibold">
                 <option value="pooja">Ritual & Pooja</option>
                 <option value="general">Management Task</option>
               </select>
             </div>
             <FormField label="Designated Assignee" value={form.assignedTo} onChange={v => set('assignedTo', v)} placeholder="E.g., Pandit Ji, Maintenance" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 opacity-90">
            <FormField label="Target Deadline Date" value={form.dueDate} onChange={v => set('dueDate', v)} type="date" />
            <FormField label="Target Shift / Time" value={form.time} onChange={v => set('time', v)} type="time" disabled={form.type !== 'pooja'} />
          </div>
          
          <div className="pt-2">
             <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">Tracking Status</label>
             <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-medium">
               <option value="Pending">Queue - Pending dispatch</option>
               <option value="In Progress">Active - In Progress</option>
               <option value="Completed">Resolved - Completed</option>
             </select>
          </div>

          <div className="flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 py-5">Discard Edits</Button>
            <Button onClick={handleSave} className="flex-1 py-5 shadow-md bg-blue-600 hover:bg-blue-700 text-white">Deploy Task</Button>
          </div>
        </div>
      </Modal>
      
      <ConfirmDialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteId && remove(deleteId)} 
        title="Revoke Task" 
        message="Are you certain you wish to purge this task? Accountability logs will be updated." 
      />
    </div>
  );
};

export default TasksPage;
