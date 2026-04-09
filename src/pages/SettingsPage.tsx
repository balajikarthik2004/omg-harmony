import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, ShieldCheck, UserPlus, ShieldAlert, Pencil, Trash2, Mail, BadgeCheck, Users } from 'lucide-react';
import Modal from '@/components/Modal';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';

const initialMembers = [
   { id: 'M-001', name: 'Karthik Balaji', email: 'admin@temple.org', role: 'Admin', status: 'Active', joined: '2024-01-12' },
   { id: 'M-002', name: 'Ramachandran S', email: 'ram@temple.org', role: 'Staff', status: 'Active', joined: '2024-03-05' },
   { id: 'M-003', name: 'Lakshmi Priya', email: 'lakshmi@temple.org', role: 'Manager', status: 'Active', joined: '2024-02-20' },
   { id: 'M-004', name: 'Srinivasan', email: 'srini@temple.org', role: 'Volunteer', status: 'Inactive', joined: '2024-05-15' },
];

const SettingsPage: React.FC = () => {
   const { user, logout } = useAuth();
   const [members, setMembers] = useState(initialMembers);
   const [modalOpen, setModalOpen] = useState(false);
   const [form, setForm] = useState({ name: '', email: '', role: 'Staff' });

   const handleAddMember = () => {
      const newMember = {
         id: `M-00${members.length + 1}`,
         ...form,
         status: 'Active',
         joined: new Date().toISOString().split('T')[0]
      };
      setMembers([newMember, ...members]);
      setModalOpen(false);
      setForm({ name: '', email: '', role: 'Staff' });
   };

   return (
      <div className="settings-premium space-y-6 max-w-[1400px] mx-auto animate-fade-in">
         <div className="page-header-banner settings-header">
            <div>
               <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Users className="w-6 h-6 text-foreground" /> Member Access & Roles</h1>
               <p className="text-sm text-muted-foreground mt-1">Manage staff entries, grant new access, and set permission levels for the temple ERP.</p>
            </div>
            <Button onClick={() => setModalOpen(true)} className="settings-cta shadow-md"><UserPlus className="h-4 w-4 mr-2" />Grant New Access</Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile Card */}
            <section className="section-panel settings-profile-panel shadow-sm h-fit">
               <div className="section-panel-header settings-panel-header gap-3 border-b border-border/60 pb-3">
                  <h2 className="text-sm font-semibold flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-success" /> My Access Status</h2>
               </div>
               <div className="p-6 flex flex-col items-center">
                  <div className="settings-avatar w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-sm mb-4">
                     <span className="text-2xl font-display font-bold text-foreground">{user?.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{user?.name}</h3>
                  <span className="settings-chip mt-2 text-[10px] font-bold uppercase tracking-widest text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">Full {user?.role} Access</span>
               </div>
               <div className="p-4 pt-0">
                  <Button variant="outline" onClick={logout} className="settings-logout-btn w-full text-xs font-bold border-destructive/20 text-destructive hover:bg-destructive/10 h-10">Logout of System</Button>
               </div>
            </section>

            {/* Member List */}
            <section className="lg:col-span-3 section-panel settings-members-panel shadow-sm">
               <div className="section-panel-header settings-panel-header border-b border-border/60 pb-4">
                  <h2 className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-foreground" /> Registered Staff & Members</h2>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead className="settings-table-head bg-muted/40 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                        <tr>
                           <th className="text-left p-4">Member Name</th>
                           <th className="text-left p-4">Role / Permission</th>
                           <th className="text-left p-4">Joined Date</th>
                           <th className="p-4 text-center">Status</th>
                           <th className="text-right p-4">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {members.map(m => (
                           <tr key={m.id} className="settings-row border-b border-border/50 hover:bg-muted/20 transition-colors">
                              <td className="p-4">
                                 <p className="font-bold text-foreground">{m.name}</p>
                                 <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {m.email}</p>
                              </td>
                              <td className="p-4">
                                 <div className="flex items-center gap-1.5">
                                    <ShieldCheck className={`w-3.5 h-3.5 ${m.role === 'Admin' ? 'text-foreground' : 'text-muted-foreground/60'}`} />
                                    <span className="font-semibold text-xs text-foreground/80">{m.role}</span>
                                 </div>
                              </td>
                              <td className="p-4 text-muted-foreground text-xs font-medium">{m.joined}</td>
                              <td className="p-4">
                                 <div className="flex justify-center">
                                    <div className="flex items-center gap-1.5">
                                       <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                       <span className="font-semibold text-[11px]">{m.status}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-4 text-right">
                                 <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>
         </div>

         <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Grant New System Access">
            <div className="settings-form-shell space-y-4 px-1 py-1">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">Member Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="settings-field w-full h-11 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Enter member name" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">Email Address</label>
                  <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="settings-field w-full h-11 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="member@temple.org" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">Permission Level (Role)</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="settings-field w-full h-11 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-medium">
                     <option>Admin</option>
                     <option>Manager</option>
                     <option>Staff</option>
                     <option>Volunteer</option>
                  </select>
               </div>
               <div className="settings-note pt-4 flex gap-3 text-sm italic text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <ShieldAlert className="w-5 h-5 text-foreground shrink-0" />
                  <p>New members will be sent a login invitation via email once you grant access.</p>
               </div>
               <div className="flex gap-3 pt-4 border-t mt-2">
                  <Button variant="outline" className="flex-1 h-11" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddMember} className="settings-cta flex-1 h-11 shadow-md">Grant Access</Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default SettingsPage;
