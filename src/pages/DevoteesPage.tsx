import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, MessageSquare, MessageCircle, Mail, Phone, MapPin, Calendar, Search, Users, ShieldCheck, HeartHandshake, History, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { mockDevotees, mockDonations, mockBookings, mockEvents } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';
import { sendCampaignEmails } from '@/lib/emailService';

const emptyForm = {
  name: '', phone: '', email: '', address: '',
  city: '', state: '', country: 'India',
  status: 'Active', totalDonations: 0, lastVisit: ''
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function fmtAmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function fmtDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString('en-GB');
  return dateStr;
}

function bookingBadgeClass(status: string) {
  const map: Record<string, string> = {
    Confirmed: 'bg-green-50 text-green-800 border-[0.5px] border-green-200',
    Pending: 'bg-amber-50 text-amber-800 border-[0.5px] border-amber-200',
    Completed: 'bg-blue-50 text-blue-800 border-[0.5px] border-blue-200',
    Cancelled: 'bg-red-50 text-red-800 border-[0.5px] border-red-200',
  };
  return map[status] ?? 'bg-muted text-muted-foreground';
}

type Devotee = typeof mockDevotees[0];
type TabName = 'info' | 'donations' | 'bookings' | 'notify';

type Donation = typeof mockDonations[0];
type Booking = typeof mockBookings[0];

function deriveDevoteeProfile(devotee: Devotee, donations: Donation[], bookings: Booking[]) {
  const seed = devotee.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const year = 1970 + (seed % 25);
  const month = (seed % 12) + 1;
  const day = ((seed * 7) % 28) + 1;
  const dateOfBirth = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

  const memberSince = donations.length > 0
    ? donations.map(d => d.date).sort()[0]
    : devotee.lastVisit || 'N/A';

  const serviceCount: Record<string, number> = {};
  bookings.forEach(b => { serviceCount[b.serviceName] = (serviceCount[b.serviceName] || 0) + 1; });
  const preferredSeva = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General Temple Visit';

  const lastDonation = donations.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const offeringSummary = lastDonation
    ? `${fmtAmt(lastDonation.amount)} on ${fmtDate(lastDonation.date)}`
    : 'No recent offerings';

  return { dateOfBirth, memberSince: fmtDate(memberSince), preferredSeva, offeringSummary };
}

const DevoteesPage: React.FC = () => {
  const { items, add, update, remove } = useStore(mockDevotees);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDevotee, setSelectedDevotee] = useState<Devotee | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('info');

  const [notifSubject, setNotifSubject] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [channels, setChannels] = useState({ sms: true, email: true, whatsapp: true });
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [notifSent, setNotifSent] = useState('');
  const [notifSending, setNotifSending] = useState(false);

  const selectedEventDetails = useMemo(
    () => mockEvents.filter(event => selectedEvents.has(event.id)),
    [selectedEvents]
  );

  useEffect(() => {
    if (!selectedDevotee || selectedEventDetails.length === 0) return;

    const title = selectedEventDetails.length === 1
      ? `Invitation: ${selectedEventDetails[0].name}`
      : `Temple Event Updates (${selectedEventDetails.length} Events)`;

    const eventLines = selectedEventDetails
      .map(event => `- ${event.name} | Date: ${fmtDate(event.date)} | Time: ${event.time}`)
      .join('\n');

    const message = `Dear ${selectedDevotee.name},\n\nGreetings from Temple Harmony. We are pleased to invite you to the following upcoming temple event${selectedEventDetails.length > 1 ? 's' : ''}:\n\n${eventLines}\n\nYour participation and blessings are deeply valued. If you need any assistance with booking or timing, please contact the temple office.\n\nWith prayers and regards,\nTemple Harmony Communication Desk`;

    setNotifSubject(title);
    setNotifMessage(message);
  }, [selectedDevotee, selectedEventDetails]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/\s/g, '');
    if (!q) return items;
    return items.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.phone.replace(/\s/g, '').includes(q) ||
      d.email.toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalDevotees = items.length;
  const activeDevotees = items.filter(d => d.status === 'Active').length;
  const recentVisits = items.filter(d => {
    if (!d.lastVisit) return false;
    const visitDate = new Date(d.lastVisit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return visitDate >= thirtyDaysAgo;
  }).length;
  const majorDonors = items.filter(d => d.totalDonations > 50000).length;


  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (e: React.MouseEvent, item: Devotee) => {
    e.stopPropagation();
    setForm({ name: item.name, phone: item.phone, email: item.email, address: item.address, city: item.city, state: item.state, country: item.country, status: item.status, totalDonations: item.totalDonations, lastVisit: item.lastVisit });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editId) update(editId, form);
    else add(form as Omit<Devotee, 'id'>);
    setModalOpen(false);
  };

  const setFormField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const openDrawer = (item: Devotee) => {
    setSelectedDevotee(item);
    setActiveTab('info');
    setNotifSent('');
    setNotifSubject('');
    setNotifMessage('');
    setChannels({ sms: true, email: true, whatsapp: true });
    setSelectedEvents(new Set());
    setDrawerOpen(true);
  };

  const toggleEvent = (id: string) => {
    setSelectedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendNotification = async () => {
    if (!notifSubject.trim() || !notifMessage.trim()) return;
    if (!selectedDevotee) return;
    const enabledChannels = [channels.sms && 'SMS', channels.email && 'Email', channels.whatsapp && 'WhatsApp'].filter(Boolean);
    if (enabledChannels.length === 0) return;

    setNotifSending(true);
    const channelSummaries: string[] = [];

    if (channels.email) {
      if (!selectedDevotee.email?.trim()) {
        channelSummaries.push('Email skipped (no email address)');
      } else {
        try {
          const result = await sendCampaignEmails({
            subject: notifSubject.trim(),
            message: notifMessage.trim(),
            recipients: [{ name: selectedDevotee.name, email: selectedDevotee.email }],
          });

          if (result.sent > 0) {
            channelSummaries.push(`Email sent (${result.sent}/${result.attempted || 1})`);
          } else {
            const reason = result.errors[0] || 'unknown reason';
            channelSummaries.push(`Email failed (${reason})`);
          }
        } catch (error) {
          channelSummaries.push(`Email failed (${error instanceof Error ? error.message : 'unexpected error'})`);
        }
      }
    }

    if (channels.sms) channelSummaries.push('SMS queued');
    if (channels.whatsapp) channelSummaries.push('WhatsApp queued');

    const summary = channelSummaries.length ? channelSummaries.join(' | ') : 'No channel dispatched';
    setNotifSent(`Dispatch for ${selectedDevotee.name}: ${summary}`);
    setNotifSubject('');
    setNotifMessage('');
    setSelectedEvents(new Set());
    setNotifSending(false);
  };

  const devDonations = selectedDevotee ? mockDonations.filter(d => d.donorName === selectedDevotee.name) : [];
  const devBookings = selectedDevotee ? mockBookings.filter(b => b.devoteeName === selectedDevotee.name) : [];
  const devoteeProfile = selectedDevotee ? deriveDevoteeProfile(selectedDevotee, devDonations, devBookings) : null;

  return (
    <div className="devotees-premium max-w-[1500px] mx-auto animate-fade-in pb-8">
      <div className="devotees-header flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5 px-5 py-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Devotees</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage devotee records, analyze donation trends, and coordinate engagements.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={openAdd} className="devotees-cta shadow-sm"><Plus className="h-4 w-4 mr-2" />Add Devotee</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <div className="stat-card devotees-stat-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Total Members</p>
          <p className="text-2xl font-bold mt-2 text-foreground">{totalDevotees.toLocaleString()}</p>
        </div>
        <div className="stat-card devotees-stat-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Active Members</p>
          <p className="text-2xl font-bold mt-2 text-blue-600">{activeDevotees.toLocaleString()}</p>
        </div>
        <div className="stat-card devotees-stat-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5"><HeartHandshake className="w-3.5 h-3.5" /> Major Donors</p>
          <p className="text-2xl font-bold mt-2 text-emerald-600">{majorDonors.toLocaleString()}</p>
        </div>
        <div className="stat-card devotees-stat-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Visited this Month</p>
          <p className="text-2xl font-bold mt-2 text-indigo-600">{recentVisits.toLocaleString()}</p>
        </div>
      </div>

      <div className="devotees-table-shell bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden flex flex-col relative z-10 mt-4">
        <div className="devotees-table-toolbar p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 bg-muted/10">
          <div className="flex items-center gap-3">
             <div className="relative max-w-sm w-full md:w-80">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <input
                 className="devotees-search-input w-full pl-9 pr-4 h-9 rounded-md border border-input bg-background text-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm"
                 placeholder="Search by name, phone, email..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
             </div>
          </div>
          <span className="devotees-record-chip text-sm font-medium text-muted-foreground whitespace-nowrap bg-muted px-2.5 py-1 rounded-md border border-border/50 shadow-sm">{filtered.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-muted-foreground">Devotee Name</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Contact Info</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Location</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Last Visit Date</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground font-medium">No results found for your search.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="devotees-row border-b border-border/60 cursor-pointer transition-colors hover:bg-muted/40 group" onClick={() => openDrawer(d)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="devotees-avatar-chip w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 border border-primary/20">
                        {getInitials(d.name)}
                      </div>
                      <p className="devotees-row-name font-semibold text-foreground group-hover:text-primary transition-colors">{d.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <p className="font-semibold text-foreground text-xs">{d.phone}</p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{d.email}</p>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                     <span className="font-semibold">{d.city}</span>{d.state && `, ${d.state}`}
                  </td>
                  <td className="p-4"><StatusBadge status={d.status} /></td>
                  <td className="p-4 text-muted-foreground text-xs font-medium">
                     <div className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-60" /> {fmtDate(d.lastVisit)}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/80 hover:text-foreground text-muted-foreground" onClick={e => openEdit(e, d)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground" onClick={e => { e.stopPropagation(); setDeleteId(d.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Devotee Details' : 'Add New Devotee'}>
        <div className="devotees-form-shell space-y-4 px-1 py-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" value={form.name} onChange={v => setFormField('name', v)} required />
            <FormField label="Phone Number" value={form.phone} onChange={v => setFormField('phone', v)} placeholder="+91" />
          </div>
          <FormField label="Email Address" value={form.email} onChange={v => setFormField('email', v)} type="email" placeholder="email@example.com" />
          <FormField label="Street Address" value={form.address} onChange={v => setFormField('address', v)} placeholder="Plot, Street, Area" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="City" value={form.city} onChange={v => setFormField('city', v)} />
            <FormField label="State" value={form.state} onChange={v => setFormField('state', v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <FormField label="Country" value={form.country} onChange={v => setFormField('country', v)} />
             <div className="space-y-1.5">
               <label className="text-xs font-semibold text-foreground">Status</label>
               <select value={form.status} onChange={e => setFormField('status', e.target.value)} className="devotees-form-select w-full h-10 rounded-md border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                 <option>Active</option><option>Inactive</option>
               </select>
             </div>
          </div>
          <div className="devotees-form-actions flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 shadow-sm">Save Details</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Devotee Account" message="Are you sure you want to permanently delete this devotee account? Related history and logs might be retained for audit purposes." />

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end" onClick={() => setDrawerOpen(false)}>
          <div className="devotees-drawer-overlay absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity" />
          <div className="devotees-drawer relative h-[100vh] w-full max-w-[600px] bg-background shadow-[0_0_60px_rgba(0,0,0,0.3)] flex flex-col animate-slide-in-right overflow-hidden" onClick={e => e.stopPropagation()}>
            
            {/* Header / Profile Hero */}
            <div className="devotees-drawer-hero px-6 py-8 border-b border-border/80 bg-gradient-to-b from-blue-50/50 to-background flex-shrink-0 relative">
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-9 w-9 rounded-full bg-background border border-border/60 hover:bg-muted text-muted-foreground shadow-sm" onClick={() => setDrawerOpen(false)}><X className="h-5 w-5" /></Button>
              
              <div className="flex items-center gap-5">
                  <div className="devotees-drawer-avatar w-20 h-20 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 border-4 border-white shadow-md flex items-center justify-center text-blue-700 font-display font-bold text-3xl shrink-0">
                    {selectedDevotee && getInitials(selectedDevotee.name)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display text-foreground leading-tight tracking-tight mb-1">{selectedDevotee?.name}</h2>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {selectedDevotee?.city}, {selectedDevotee?.state}</p>
                    <div className="flex gap-2 mt-3 items-center">
                       <StatusBadge status={selectedDevotee?.status || 'Active'} />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded border border-border bg-muted/40 text-center shadow-sm">ID #{selectedDevotee?.id.padStart(4, '0')}</span>
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-8">
                <div className="devotees-drawer-stat bg-card rounded-xl p-4 border border-border/60 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-[3px] bg-emerald-500" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Total Donations</p>
                  <p className="text-xl font-bold text-emerald-600 font-display">{fmtAmt(selectedDevotee?.totalDonations ?? 0)}</p>
                </div>
                <div className="devotees-drawer-stat bg-card rounded-xl p-4 border border-border/60 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-[3px] bg-blue-500" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Donations</p>
                  <p className="text-xl font-bold text-foreground font-display">{devDonations.length}</p>
                </div>
                <div className="devotees-drawer-stat bg-card rounded-xl p-4 border border-border/60 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-[3px] bg-amber-500" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Bookings</p>
                  <p className="text-xl font-bold text-foreground font-display">{devBookings.length}</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="devotees-drawer-tabs flex p-4 px-6 border-b border-border/60 gap-3 shrink-0 bg-background">
              {([ { key: 'info', label: 'Info' }, { key: 'donations', label: 'Donations', count: devDonations.length }, { key: 'bookings', label: 'Bookings', count: devBookings.length }, { key: 'notify', label: 'Message' } ] as Array<{ key: TabName; label: string; count?: number }>).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`devotees-drawer-tab flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-bold rounded-xl transition-all border-2 active:scale-[0.98] ${activeTab === tab.key ? 'devotees-drawer-tab-active bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 transform scale-105' : 'bg-background text-muted-foreground border-input hover:border-primary/40 hover:bg-muted/30 hover:text-foreground'}`}
                >
                  <span className="truncate">{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[11px] font-extrabold ${activeTab === tab.key ? 'bg-background/25 text-white' : 'bg-muted border border-border text-muted-foreground'}`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto bg-card relative">
              {activeTab === 'info' && selectedDevotee && (
                <div className="p-6 space-y-8 pb-10 animate-fade-in">
                   {/* Contact Section */}
                   <div className="space-y-4">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Direct Contact</h3>
                     <div className="grid gap-3">
                       <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background shadow-sm group hover:border-blue-200 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform"><Phone className="w-4 h-4 text-blue-600" /></div>
                          <div>
                            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Mobile Contact</p>
                            <p className="text-sm font-bold mt-0.5 text-foreground">{selectedDevotee.phone}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background shadow-sm group hover:border-blue-200 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100 group-hover:scale-110 transition-transform"><Mail className="w-4 h-4 text-sky-600" /></div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Email Address</p>
                            <p className="text-sm font-bold mt-0.5 truncate text-foreground">{selectedDevotee.email || 'N/A'}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background shadow-sm group hover:border-blue-200 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 mt-1 group-hover:scale-110 transition-transform"><MapPin className="w-4 h-4 text-amber-600" /></div>
                          <div>
                            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Registered Address</p>
                            <p className="text-sm font-medium mt-1 leading-relaxed text-foreground">{selectedDevotee.address || 'Address not listed'}</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1.5 bg-muted/50 px-2 py-0.5 rounded border border-border inline-block">{selectedDevotee.city}{selectedDevotee.state && `, ${selectedDevotee.state}`} {selectedDevotee.country && ` - ${selectedDevotee.country}`}</p>
                          </div>
                       </div>
                     </div>
                   </div>

                   {/* Demographics Section */}
                   <div className="space-y-4">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Profile Meta</h3>
                     <div className="bg-muted/10 rounded-2xl border border-border/60 p-1">
                       <div className="flex justify-between items-center p-4 border-b border-border/40">
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Date of Birth</span>
                          <span className="text-sm font-bold text-foreground">{devoteeProfile?.dateOfBirth ?? 'N/A'}</span>
                       </div>
                       <div className="flex justify-between items-center p-4 border-b border-border/40">
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Joint Date</span>
                          <span className="text-xs font-bold text-foreground bg-background px-2.5 py-1 rounded shadow-sm border border-border">{devoteeProfile?.memberSince ?? 'N/A'}</span>
                       </div>
                       <div className="flex justify-between items-center p-4">
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2"><HeartHandshake className="w-4 h-4 text-primary" /> Preferred Seva</span>
                          <span className="text-xs font-bold text-foreground max-w-[180px] break-words text-right">{devoteeProfile?.preferredSeva}</span>
                       </div>
                     </div>
                   </div>
                </div>
              )}

              {activeTab === 'donations' && (
                <div className="p-6 space-y-4 animate-fade-in bg-muted/5 min-h-full">
                  {devDonations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><HeartHandshake className="w-8 h-8 text-muted-foreground/40" /></div>
                      <p className="text-base font-bold text-foreground">No Donations Found</p>
                      <p className="text-sm text-muted-foreground mt-1">There are no financial logs for this devotee.</p>
                    </div>
                  ) : devDonations.map(dn => (
                    <div key={dn.id} className="rounded-xl border border-border/80 bg-background p-5 shadow-sm hover:border-emerald-300 transition-all hover:shadow-md relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                           <p className="text-sm font-bold text-foreground">{dn.category}</p>
                           <p className="text-xs font-mono font-semibold text-muted-foreground mt-1 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> ID: {dn.id}</p>
                        </div>
                        <p className="text-2xl font-bold font-display text-emerald-600">{fmtAmt(dn.amount)}</p>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/40 relative z-10">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded"><Calendar className="w-3.5 h-3.5" />{fmtDate(dn.date)}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">{dn.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="p-6 space-y-4 animate-fade-in bg-muted/5 min-h-full">
                  {devBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><History className="w-8 h-8 text-muted-foreground/40" /></div>
                      <p className="text-base font-bold text-foreground">No Services Booked</p>
                      <p className="text-sm text-muted-foreground mt-1">There are no service bookings or history.</p>
                    </div>
                  ) : devBookings.map(bk => (
                    <div key={bk.id} className="rounded-xl border border-border/80 bg-background p-5 shadow-sm hover:border-blue-300 transition-all hover:shadow-md relative overflow-hidden grid">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/20" />
                      <div className="flex justify-between items-start mb-4 relative z-10 pl-2">
                         <p className="text-sm font-bold text-foreground max-w-[70%] leading-relaxed">{bk.serviceName}</p>
                         <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${bookingBadgeClass(bk.bookingStatus)}`}>{bk.bookingStatus}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-4 border-t border-border/40 relative z-10 pl-2">
                         <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded"><Calendar className="w-3.5 h-3.5" />{fmtDate(bk.date)}</span>
                         <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" />{bk.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notify' && selectedDevotee && (
                <div className="p-6 space-y-6 pb-[100px] animate-fade-in">
                   <div className="space-y-4 border border-border/60 bg-background p-5 rounded-xl shadow-sm">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-foreground pb-2">Delivery Channels</h3>
                     <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setChannels(p => ({ ...p, sms: !p.sms }))} className={`flex flex-col items-center justify-center gap-2.5 p-3 rounded-lg font-bold transition-all border-2 ${channels.sms ? 'bg-primary/5 text-primary border-primary/30 shadow-sm' : 'bg-background border-border text-muted-foreground hover:bg-muted/40'}`}>
                           <MessageSquare className="w-5 h-5" /> <span className="text-[10px]">SMS</span>
                        </button>
                        <button onClick={() => setChannels(p => ({ ...p, email: !p.email }))} className={`flex flex-col items-center justify-center gap-2.5 p-3 rounded-lg font-bold transition-all border-2 ${channels.email ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm' : 'bg-background border-border text-muted-foreground hover:bg-muted/40'}`}>
                           <Mail className="w-5 h-5" /> <span className="text-[10px]">EMAIL</span>
                        </button>
                        <button onClick={() => setChannels(p => ({ ...p, whatsapp: !p.whatsapp }))} className={`flex flex-col items-center justify-center gap-2.5 p-3 rounded-lg font-bold transition-all border-2 ${channels.whatsapp ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-background border-border text-muted-foreground hover:bg-muted/40'}`}>
                           <MessageCircle className="w-5 h-5" /> <span className="text-[10px]">WHATSAPP</span>
                        </button>
                     </div>
                   </div>

                   <div className="space-y-4 border border-border/60 bg-background p-5 rounded-xl shadow-sm">
                     <div className="flex justify-between items-center pb-2">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Attach Events</h3>
                       <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">Optional</span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {mockEvents.map(ev => (
                          <button key={ev.id} onClick={() => toggleEvent(ev.id)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedEvents.has(ev.id) ? 'bg-muted border-foreground/30 text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]' : 'bg-background border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30'}`}>
                             {ev.name}
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="space-y-4">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-foreground px-1">Message Detail</h3>
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Subject / Header</label>
                         <input value={notifSubject} onChange={e => setNotifSubject(e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background/50 hover:bg-background px-4 text-sm font-semibold transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none shadow-sm" placeholder="Subject line..." />
                       </div>
                       <div>
                         <div className="flex items-center justify-between mb-1.5 px-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notification Body</label>
                            <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase bg-muted/60 border border-border/50 px-2 py-0.5 rounded shadow-sm">{notifMessage.length} characters</span>
                         </div>
                         <textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)} className="w-full rounded-xl border border-input bg-background/50 hover:bg-background p-5 text-base min-h-[220px] resize-y transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none shadow-sm placeholder:text-muted-foreground/60 leading-7 font-medium" placeholder={`Type your message...`} />
                       </div>
                     </div>
                     
                     {notifSent && (
                       <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold text-center shadow-sm flex items-center justify-center gap-2">
                         <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {notifSent}
                       </div>
                     )}
                   </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            {activeTab === 'notify' && (
               <div className="absolute bottom-0 left-0 w-full p-5 bg-card/90 backdrop-blur-md border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                 <Button className="w-full h-12 text-sm font-bold rounded-xl shadow-lg border-b-4 border-black/10 active:border-b-0 active:translate-y-1 transition-all" onClick={sendNotification} disabled={notifSending || !notifSubject.trim() || !notifMessage.trim() || (!channels.sms && !channels.email && !channels.whatsapp)}>
                   {notifSending ? 'Dispatching...' : `Execute Dispatch (${Number(channels.sms) + Number(channels.email) + Number(channels.whatsapp)} Routes)`}
                 </Button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevoteesPage;
