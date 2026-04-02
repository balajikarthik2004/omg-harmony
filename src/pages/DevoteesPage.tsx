import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, MessageSquare, MessageCircle, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { mockDevotees, mockDonations, mockBookings, mockEvents } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';

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
    Confirmed: 'bg-green-50 text-green-800',
    Pending: 'bg-amber-50 text-amber-800',
    Completed: 'bg-blue-50 text-blue-800',
    Cancelled: 'bg-red-50 text-red-800',
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
    : 'No recent offering';

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
      .map(event => `- ${event.name} on ${fmtDate(event.date)}`)
      .join('\n');

    const message = `Dear ${selectedDevotee.name},\n\nYou are warmly invited to the following event${selectedEventDetails.length > 1 ? 's' : ''}:\n${eventLines}\n\nPlease join us and receive blessings.\n\n- Temple Harmony`;

    setNotifSubject(title);
    setNotifMessage(message);
  }, [selectedDevotee, selectedEventDetails]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/\s/g, '');
    if (!q) return items;
    return items.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.phone.replace(/\s/g, '').includes(q)
    );
  }, [items, search]);

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

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

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

  const sendNotification = () => {
    if (!notifSubject.trim() || !notifMessage.trim()) return;
    const chs = [channels.sms && 'SMS', channels.email && 'Email', channels.whatsapp && 'WhatsApp'].filter(Boolean).join(' & ');
    if (!chs) return;

    const evNames = mockEvents.filter(e => selectedEvents.has(e.id)).map(e => e.name);
    console.log('NOTIFY', { to: selectedDevotee, chs, notifSubject, notifMessage, events: evNames });
    setNotifSent(`Sent via ${chs} to ${selectedDevotee?.name}${evNames.length ? ' for ' + evNames.join(', ') : ''}.`);
    setNotifSubject('');
    setNotifMessage('');
    setSelectedEvents(new Set());
  };

  const devDonations = selectedDevotee ? mockDonations.filter(d => d.donorName === selectedDevotee.name) : [];
  const devBookings = selectedDevotee ? mockBookings.filter(b => b.devoteeName === selectedDevotee.name) : [];
  const devoteeProfile = selectedDevotee ? deriveDevoteeProfile(selectedDevotee, devDonations, devBookings) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Devotees</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Devotee</Button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="relative max-w-sm w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} devotee{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-container rounded-xl border border-border/70 bg-background shadow-sm transition-shadow hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 font-medium text-muted-foreground">City</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Last Visit</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No devotees match your search.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="border-b border-border cursor-pointer transition-all duration-200 hover:bg-amber-50/30" onClick={() => openDrawer(d)}>
                  <td className="p-4 font-medium text-foreground">{d.name}</td>
                  <td className="p-4 text-muted-foreground">{d.phone}</td>
                  <td className="p-4 text-muted-foreground">{d.email}</td>
                  <td className="p-4 text-muted-foreground">{d.city}</td>
                  <td className="p-4"><StatusBadge status={d.status} /></td>
                  <td className="p-4 text-muted-foreground">{fmtDate(d.lastVisit)}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="transition-all hover:-translate-y-0.5 hover:bg-amber-100/70" onClick={e => openEdit(e, d)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="transition-all hover:-translate-y-0.5 hover:bg-red-50" onClick={e => { e.stopPropagation(); setDeleteId(d.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Devotee' : 'Add Devotee'}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Name" value={form.name} onChange={v => set('name', v)} required />
          <FormField label="Phone" value={form.phone} onChange={v => set('phone', v)} />
          <FormField label="Email" value={form.email} onChange={v => set('email', v)} type="email" />
          <FormField label="Address" value={form.address} onChange={v => set('address', v)} />
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <FormField label="City" value={form.city} onChange={v => set('city', v)} />
            <FormField label="State" value={form.state} onChange={v => set('state', v)} />
          </div>
          <FormField label="Country" value={form.country} onChange={v => set('country', v)} />
          <div className="col-span-2 flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Devotee" message="Are you sure you want to delete this devotee? This action cannot be undone." />

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] transition-opacity" />

          <div
            className="relative h-full w-[560px] max-w-[97vw] bg-background border-l border-border/80 flex flex-col shadow-[0_28px_80px_rgba(15,23,42,0.34)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-border bg-gradient-to-r from-amber-50/80 via-background to-rose-50/70">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 ring-2 ring-white flex items-center justify-center text-amber-800 font-semibold text-sm flex-shrink-0 shadow-sm">
                    {selectedDevotee && getInitials(selectedDevotee.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm tracking-tight">{selectedDevotee?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDevotee?.city}, {selectedDevotee?.state} · {selectedDevotee?.status}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg border border-slate-200/80 bg-white/85 text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-slate-900 hover:shadow-md active:scale-[0.98]"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                {[
                  { label: 'Total Donated', value: fmtAmt(selectedDevotee?.totalDonations ?? 0), tone: 'text-emerald-700' },
                  { label: 'Donations', value: devDonations.length, tone: '' },
                  { label: 'Bookings', value: devBookings.length, tone: '' },
                ].map(s => (
                  <div key={s.label} className="px-3 py-2 rounded-lg border border-border/70 bg-background/95 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{s.label}</p>
                    <p className={`text-base font-semibold ${s.tone}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-1 p-2 border-b border-border bg-muted/20 flex-shrink-0">
              {([
                { key: 'info', label: 'Info' },
                { key: 'donations', label: 'Donations', count: devDonations.length },
                { key: 'bookings', label: 'Bookings', count: devBookings.length },
                { key: 'notify', label: 'Notify' },
              ] as Array<{ key: TabName; label: string; count?: number }>).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${activeTab === tab.key ? 'bg-background text-foreground font-semibold shadow-sm border border-border/60' : 'text-muted-foreground hover:text-foreground hover:bg-background/70'}`}
                >
                  {tab.label}
                  {typeof tab.count === 'number' && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-muted text-foreground' : 'bg-muted/60 text-muted-foreground'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className={`flex-1 overflow-y-auto ${activeTab === 'info' ? 'p-0' : 'p-5'}`}>
              {activeTab === 'info' && selectedDevotee && (
                <div className="bg-background">
                  <div className="px-4 py-4 border-b border-border bg-muted/20">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Devotee Profile</p>
                    <p className="text-sm text-foreground mt-1">Member ID #{selectedDevotee.id.padStart(4, '0')} · {selectedDevotee.country}</p>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="rounded-xl border border-border bg-background p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
                          <Phone className="h-3.5 w-3.5 text-emerald-700" />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Contact</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-muted/20 border border-border/70">
                          <span className="text-xs text-muted-foreground">Phone</span>
                          <span className="text-xs font-medium text-blue-700 truncate">{selectedDevotee.phone}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-muted/20 border border-border/70">
                          <span className="text-xs text-muted-foreground">Email</span>
                          <span className="text-[11px] font-medium text-blue-700 truncate">{selectedDevotee.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                          <MapPin className="h-3.5 w-3.5 text-amber-700" />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Location</p>
                      </div>
                      <div className="flex items-start gap-3 px-3 py-2.5 rounded-md bg-muted/20 border border-border/70">
                        <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-amber-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium break-words">{selectedDevotee.address || 'Address not available'}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 break-words">{selectedDevotee.city}, {selectedDevotee.state}, {selectedDevotee.country}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-6 h-6 rounded-md bg-teal-100 flex items-center justify-center">
                          <Calendar className="h-3.5 w-3.5 text-teal-700" />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Personal </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/20 border border-border/70">
                          <span className="text-xs text-muted-foreground">Date of Birth</span>
                          <span className="text-xs font-medium text-blue-700">{devoteeProfile?.dateOfBirth ?? 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/20 border border-border/70">
                          <span className="text-xs text-muted-foreground">Member Since</span>
                            <span className="text-xs font-medium">{devoteeProfile?.memberSince ?? 'N/A'}</span>
                        </div>
                        {/* <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/20 border border-border/70 gap-3">
                          <span className="text-xs text-muted-foreground">Preferred Seva</span>
                          <span className="text-xs font-medium text-right">{devoteeProfile?.preferredSeva ?? 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/20 border border-border/70 gap-3">
                          <span className="text-xs text-muted-foreground">Recent Offering</span>
                          <span className="text-xs font-medium text-right text-emerald-700">{devoteeProfile?.offeringSummary ?? 'N/A'}</span>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'donations' && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-3">Donation History</p>
                  {devDonations.length === 0
                    ? <p className="text-sm text-muted-foreground py-6 text-center">No donations recorded.</p>
                    : devDonations.map(dn => (
                      <div key={dn.id} className="rounded-xl border border-border p-3 mb-2.5 bg-background/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{dn.id}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-800">{dn.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{fmtAmt(dn.amount)}</p>
                            <p className="text-xs text-muted-foreground">{dn.paymentMethod}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2">{fmtDate(dn.date)}</p>
                      </div>
                    ))}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-3">Booking History</p>
                  {devBookings.length === 0
                    ? <p className="text-sm text-muted-foreground py-6 text-center">No bookings recorded.</p>
                    : devBookings.map(bk => (
                      <div key={bk.id} className="rounded-xl border border-border p-3 mb-2.5 bg-background/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{bk.serviceName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(bk.date)} · {bk.time}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Payment: {bk.paymentStatus}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bookingBadgeClass(bk.bookingStatus)}`}>{bk.bookingStatus}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {activeTab === 'notify' && selectedDevotee && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-gradient-to-r from-sky-50/70 via-background to-emerald-50/70 p-3 transition-all duration-200 hover:shadow-sm">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Recipient</p>
                    <p className="text-sm font-semibold text-foreground">{selectedDevotee.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedDevotee.phone} · {selectedDevotee.email}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-3 space-y-3 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Channel</p>
                      <span className="text-[11px] text-muted-foreground">
                        {Number(channels.sms) + Number(channels.email) + Number(channels.whatsapp)} selected
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['sms', 'email', 'whatsapp'] as const).map(ch => (
                        <button
                          key={ch}
                          onClick={() => setChannels(p => ({ ...p, [ch]: !p[ch] }))}
                          className={`flex flex-col items-center justify-center gap-1.5 py-2.5 text-[11px] border rounded-lg transition-all duration-200 hover:-translate-y-0.5 ${channels[ch] ? 'border-blue-300 bg-blue-50 text-blue-800 font-semibold hover:shadow-sm' : 'border-border text-muted-foreground hover:bg-muted/40 hover:shadow-sm'}`}
                        >
                          {ch === 'sms' ? <MessageSquare className="h-4 w-4" /> : ch === 'email' ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                          {ch.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-3 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Link to Event (optional)</p>
                      <span className="text-[11px] text-muted-foreground">{selectedEvents.size} linked</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {mockEvents.map(ev => (
                        <button
                          key={ev.id}
                          onClick={() => toggleEvent(ev.id)}
                          className={`px-3 py-1 rounded-full text-xs border transition-all duration-200 hover:-translate-y-0.5 ${selectedEvents.has(ev.id) ? 'bg-muted border-foreground/30 text-foreground font-medium hover:shadow-sm' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:shadow-sm'}`}
                        >
                          {ev.name}
                          <span className="ml-1 text-[10px] opacity-60">{fmtDate(ev.date)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-3 space-y-3 transition-all duration-200 hover:shadow-sm">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Subject / Title</label>
                      <input
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="e.g. You're invited: Maha Shivaratri 2026"
                        value={notifSubject}
                        onChange={e => setNotifSubject(e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-muted-foreground">Message</label>
                        <span className="text-[11px] text-muted-foreground">{notifMessage.length} chars</span>
                      </div>
                      <textarea
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none min-h-[110px] font-sans"
                        placeholder={`Write your message to ${selectedDevotee.name}...`}
                        value={notifMessage}
                        onChange={e => setNotifMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full h-10 transition-all duration-200 hover:-translate-y-0.5"
                    onClick={sendNotification}
                    disabled={!notifSubject.trim() || !notifMessage.trim() || (!channels.sms && !channels.email && !channels.whatsapp)}
                  >
                    Send Notification
                  </Button>

                  {notifSent && (
                    <p className="text-xs text-green-700 bg-green-50 rounded-md px-3 py-2 text-center">{notifSent}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevoteesPage;
