import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ReceiptText, CalendarDays, UserCog } from 'lucide-react';
import { mockBookings } from '@/data/mockData';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { useTempleEventsStore } from '@/hooks/useTempleEventsStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';

type PoojaType = string;
type PoojaCategory = 'Daily Seva' | 'Special Seva' | 'Festival Seva';

type SevaBooking = {
  id: string;
  bookingCode: string;
  devoteeName: string;
  poojaType: PoojaType;
  date: string;
  slot: string;
  priestName: string;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  bookingStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  receiptNumber: string;
  notes: string;
};

const basePoojaCatalog: Array<{ name: PoojaType; category: PoojaCategory; duration: string; amount: number; desc: string }> = [
  { name: 'Archana', category: 'Daily Seva', duration: '20 mins', amount: 300, desc: 'Name-based chanting and flower offering.' },
  { name: 'Abhishekam', category: 'Daily Seva', duration: '45 mins', amount: 900, desc: 'Sacred abhishekam with mantra recitation.' },
  { name: 'Sahasranama Archana', category: 'Daily Seva', duration: '35 mins', amount: 700, desc: '108/1000 name archana with sankalpam.' },
  { name: 'Lakshmi Homam', category: 'Special Seva', duration: '100 mins', amount: 3200, desc: 'Homam for prosperity and abundance.' },
  { name: 'Ganapathi Homam', category: 'Special Seva', duration: '90 mins', amount: 2800, desc: 'Removes obstacles and starts ventures auspiciously.' },
  { name: 'Navagraha Shanti', category: 'Special Seva', duration: '75 mins', amount: 2400, desc: 'Planetary peace and dosha remedies.' },
  { name: 'Satyanarayana Pooja', category: 'Festival Seva', duration: '80 mins', amount: 2100, desc: 'Monthly and festival family pooja.' },
  { name: 'Rudrabhishekam', category: 'Festival Seva', duration: '60 mins', amount: 1800, desc: 'Sacred Shiva abhishekam during special days.' },
  { name: 'Chandi Homam', category: 'Festival Seva', duration: '130 mins', amount: 4500, desc: 'Powerful homam for protection and wellbeing.' },
];

const slotOptions = ['05:00 AM - 09:00 AM', '09:00 AM - 01:00 PM', '01:00 PM - 05:00 PM', '05:00 PM - 09:00 PM'];
const priestOptions = [
  'Pandit Sharma',
  'Pandit Iyer',
  'Pandit Verma',
  'Pandit Raghavan',
  'Pandit Narayan',
  'Pandit Krishnan',
  'Pandit Gopal',
  'Pandit Mahesh',
];

function inferPoojaType(serviceName: string): PoojaType {
  const value = serviceName.toLowerCase();
  if (value.includes('satya')) return 'Satyanarayana Pooja';
  if (value.includes('rudra')) return 'Rudrabhishekam';
  if (value.includes('abhishekam')) return 'Abhishekam';
  if (value.includes('homam')) return 'Ganapathi Homam';
  return 'Archana';
}

const initialBookings: SevaBooking[] = mockBookings.map((item, idx) => ({
  id: item.id,
  bookingCode: item.id,
  devoteeName: item.devoteeName,
  poojaType: inferPoojaType(item.serviceName),
  date: item.date,
  slot: item.time,
  priestName: priestOptions[idx % priestOptions.length],
  paymentStatus: (item.paymentStatus as SevaBooking['paymentStatus']) || 'Pending',
  bookingStatus: (item.bookingStatus as SevaBooking['bookingStatus']) || 'Pending',
  receiptNumber: `ESP-${String(idx + 1).padStart(4, '0')}`,
  notes: '',
}));

const emptyForm: Omit<SevaBooking, 'id' | 'bookingCode' | 'receiptNumber'> = {
  devoteeName: '',
  poojaType: 'Archana',
  date: new Date().toISOString().split('T')[0],
  slot: slotOptions[0],
  priestName: priestOptions[0],
  paymentStatus: 'Pending',
  bookingStatus: 'Pending',
  notes: '',
};

type CatalogEntry = { name: PoojaType; category: PoojaCategory; duration: string; amount: number; desc: string };

function money(n: number) {
  return `Rs ${n.toLocaleString('en-IN')}`;
}

function normalizePoojaName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function nextBookingCode(records: SevaBooking[]) {
  const max = records.reduce((acc, record) => {
    const match = record.bookingCode.match(/^BK(\d+)$/i);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `BK${String(max + 1).padStart(3, '0')}`;
}

function nextReceipt(records: SevaBooking[]) {
  const max = records.reduce((acc, record) => {
    const match = record.receiptNumber.match(/^ESP-(\d+)$/i);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `ESP-${String(max + 1).padStart(4, '0')}`;
}

function getPoojaDetails(
  name: PoojaType,
  catalog: CatalogEntry[]
) {
  return catalog.find(item => item.name === name);
}

function buildCatalogFromEvents(eventItems: Array<{ poojaType: string; specialPooja: string; festivalName: string; name: string }>): CatalogEntry[] {
  const catalog = new Map<string, CatalogEntry>();
  eventItems.forEach(event => {
    const poojaNames = [event.poojaType, ...event.specialPooja.split(',')]
      .map(name => normalizePoojaName(name))
      .filter(Boolean);

    poojaNames.forEach(name => {
      const key = name.toLowerCase();
      if (catalog.has(key)) return;
      catalog.set(key, {
        name,
        category: event.festivalName ? 'Festival Seva' : 'Special Seva',
        duration: '60 mins',
        amount: 1500,
        desc: `Synced from temple event: ${event.name}`,
      });
    });
  });
  return Array.from(catalog.values());
}

const PoojaSevaPage: React.FC = () => {
  const { items, add, update, remove } = useStore<SevaBooking>(initialBookings);
  const { items: templeEvents } = useTempleEventsStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedServiceDate, setSelectedServiceDate] = useState(todayStr);

  const eventPoojaCatalog = useMemo(() => {
    return buildCatalogFromEvents(templeEvents);
  }, [templeEvents]);

  const eventsForSelectedDate = useMemo(
    () => templeEvents.filter(event => event.date === selectedServiceDate),
    [templeEvents, selectedServiceDate]
  );

  const dateWisePoojaCatalog = useMemo(
    () => buildCatalogFromEvents(eventsForSelectedDate),
    [eventsForSelectedDate]
  );

  const poojaCatalog = useMemo(() => {
    if (eventPoojaCatalog.length === 0) return basePoojaCatalog;

    const eventKeys = new Set(eventPoojaCatalog.map(item => normalizePoojaName(item.name).toLowerCase()));
    const fallbackFromBase = basePoojaCatalog.filter(item => !eventKeys.has(normalizePoojaName(item.name).toLowerCase()));

    // Event-derived poojas come first so this module is primarily event-driven.
    return [...eventPoojaCatalog, ...fallbackFromBase];
  }, [eventPoojaCatalog]);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | PoojaCategory>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [receiptItem, setReceiptItem] = useState<SevaBooking | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const formDatePoojaCatalog = useMemo(() => {
    if (!form.date) return poojaCatalog;
    const byFormDate = buildCatalogFromEvents(templeEvents.filter(event => event.date === form.date));
    return byFormDate.length > 0 ? byFormDate : poojaCatalog;
  }, [form.date, templeEvents, poojaCatalog]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter(item => {
      const category = getPoojaDetails(item.poojaType, poojaCatalog)?.category;
      const matchesCategory = activeCategory === 'All' || category === activeCategory;
      const matchesSearch = !q ||
        item.bookingCode.toLowerCase().includes(q) ||
        item.devoteeName.toLowerCase().includes(q) ||
        item.poojaType.toLowerCase().includes(q) ||
        item.priestName.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, search, activeCategory, poojaCatalog]);

  const totals = useMemo(() => {
    const total = items.length;
    const confirmed = items.filter(item => item.bookingStatus === 'Confirmed').length;
    const paid = items.filter(item => item.paymentStatus === 'Paid').length;
    const pending = items.filter(item => item.bookingStatus === 'Pending').length;
    const completed = items.filter(item => item.bookingStatus === 'Completed').length;
    return { total, confirmed, paid, pending, completed };
  }, [items]);

  const categorySummary = useMemo(() => {
    const categories: Array<'All' | PoojaCategory> = ['All', 'Daily Seva', 'Special Seva', 'Festival Seva'];
    return categories.map(category => {
      if (category === 'All') return { category, count: items.length };
      return {
        category,
        count: items.filter(item => getPoojaDetails(item.poojaType, poojaCatalog)?.category === category).length,
      };
    });
  }, [items, poojaCatalog]);

  const openAdd = () => {
    const defaultPooja = dateWisePoojaCatalog[0]?.name || poojaCatalog[0]?.name || emptyForm.poojaType;
    setForm({ ...emptyForm, date: selectedServiceDate, poojaType: defaultPooja });
    setFormError('');
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (item: SevaBooking) => {
    setForm({
      devoteeName: item.devoteeName,
      poojaType: item.poojaType,
      date: item.date,
      slot: item.slot,
      priestName: item.priestName,
      paymentStatus: item.paymentStatus,
      bookingStatus: item.bookingStatus,
      notes: item.notes,
    });
    setFormError('');
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.devoteeName.trim() || !form.date) {
      setFormError('Please fill devotee name and date to save booking.');
      return;
    }
    setFormError('');

    if (editId) {
      update(editId, form);
      const existing = items.find(item => item.id === editId);
      if (existing) {
        setReceiptItem({ ...existing, ...form });
      }
    } else {
      const created = add({
        bookingCode: nextBookingCode(items),
        receiptNumber: nextReceipt(items),
        ...form,
      });
      setReceiptItem(created);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="rounded-xl border border-border bg-gradient-to-r from-amber-50/60 via-background to-emerald-50/60 px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pooja & Seva Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Define pooja types, manage bookings, assign priests, and issue E-Seva Pass receipts.</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Book Pooja</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <div className="rounded-xl border border-border bg-background shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Bookings</p>
          <p className="text-2xl font-semibold mt-1">{totals.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-background shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Confirmed</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-700">{totals.confirmed}</p>
        </div>
        <div className="rounded-xl border border-border bg-background shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Paid</p>
          <p className="text-2xl font-semibold mt-1 text-blue-700">{totals.paid}</p>
        </div>
        <div className="rounded-xl border border-border bg-background shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pending</p>
          <p className="text-2xl font-semibold mt-1 text-amber-700">{totals.pending}</p>
        </div>
        <div className="rounded-xl border border-border bg-background shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-700">{totals.completed}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Date-wise Events & Poojas</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select a date to view event count and synced pooja list.</p>
          </div>
          <input
            type="date"
            value={selectedServiceDate}
            onChange={e => setSelectedServiceDate(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-[11px] text-muted-foreground">Selected Date</p>
            <p className="text-sm font-semibold mt-1">{formatDateDDMMYYYY(selectedServiceDate)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-[11px] text-muted-foreground">Events</p>
            <p className="text-xl font-semibold mt-1">{eventsForSelectedDate.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-[11px] text-muted-foreground">Pooja Types</p>
            <p className="text-xl font-semibold mt-1">{dateWisePoojaCatalog.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-[11px] text-muted-foreground">Bookings On Date</p>
            <p className="text-xl font-semibold mt-1">{items.filter(item => item.date === selectedServiceDate).length}</p>
          </div>
        </div>
        <div className="px-4 pb-4">
          {eventsForSelectedDate.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events found for {formatDateDDMMYYYY(selectedServiceDate)}.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {eventsForSelectedDate.map(event => (
                <div key={event.id} className="rounded-md border border-border px-3 py-2 bg-background">
                  <p className="text-sm font-medium">{event.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.time} · {event.poojaType}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden xl:col-span-3">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Slot Booking & Priest Assignment</h2>
            <input
              className="w-full max-w-xs px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Search booking, devotee, pooja, priest..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="px-4 py-2.5 border-b border-border bg-background flex flex-wrap gap-2">
            {categorySummary.map(item => (
              <button
                key={item.category}
                onClick={() => setActiveCategory(item.category)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${activeCategory === item.category ? 'bg-muted text-foreground border-foreground/30 font-medium' : 'text-muted-foreground border-border hover:text-foreground hover:bg-muted/50'}`}
              >
                {item.category} ({item.count})
              </button>
            ))}
          </div>

          <div className="overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Booking</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Devotee</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Pooja Details</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Schedule</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Priest</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No bookings found.</td></tr>
                ) : (
                  filtered.map(item => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-3 align-top">
                        <p className="font-medium leading-tight">{item.bookingCode}</p>
                      </td>
                      <td className="p-3 align-top">
                        <p className="leading-tight">{item.devoteeName}</p>
                      </td>
                      <td className="p-3 align-top">
                        <p className="text-muted-foreground leading-tight">{item.poojaType}</p>
                        <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-muted text-foreground mt-1">
                          {getPoojaDetails(item.poojaType, poojaCatalog)?.category || 'Daily Seva'}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <p className="text-muted-foreground whitespace-nowrap leading-tight">{item.date}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{item.slot}</p>
                      </td>
                      <td className="p-3 text-muted-foreground align-top">{item.priestName}</td>
                      <td className="p-3 align-top">
                        <div className="space-y-1.5">
                          <StatusBadge status={item.paymentStatus} />
                          <StatusBadge status={item.bookingStatus} />
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setReceiptItem(item)}><ReceiptText className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 xl:sticky xl:top-4 self-start">
          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Pooja Catalog</h2>
              <span className="text-[11px] text-muted-foreground">({eventPoojaCatalog.length} from Events)</span>
            </div>
            <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
              {poojaCatalog.map(item => (
                <div key={item.name} className="rounded-lg border border-border p-2.5 bg-background">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <span className="text-[11px] font-semibold text-emerald-700">{money(item.amount)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{item.category} · {item.duration}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Priest Pool</h2>
            </div>
            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
              {priestOptions.map((name, idx) => (
                <div key={name} className="rounded-md border border-border px-3 py-2 text-sm flex items-center justify-between">
                  <span>{name}</span>
                  <span className={`text-xs ${idx % 3 === 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {idx % 3 === 0 ? 'On Pooja' : 'Available'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Booking' : 'Create Booking'}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Devotee Name</label>
            <input
              value={form.devoteeName}
              onChange={e => {
                setForm(prev => ({ ...prev, devoteeName: e.target.value }));
                if (formError) setFormError('');
              }}
              className="w-full h-10 rounded-md border border-input px-3 text-sm bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Pooja Type</label>
              <select
                value={form.poojaType}
                onChange={e => setForm(prev => ({ ...prev, poojaType: e.target.value as PoojaType }))}
                className="w-full h-10 rounded-md border border-input px-3 text-sm bg-background"
              >
                {formDatePoojaCatalog.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => {
                  const nextDate = e.target.value;
                  const nextDateCatalog = buildCatalogFromEvents(templeEvents.filter(event => event.date === nextDate));
                  const nextDefaultPooja = nextDateCatalog[0]?.name;
                  setForm(prev => ({ ...prev, date: nextDate, poojaType: nextDefaultPooja || prev.poojaType }));
                  if (formError) setFormError('');
                }}
                className="w-full h-10 rounded-md border border-input px-3 text-sm bg-background"
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{formError}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Slot</label>
              <select
                value={form.slot}
                onChange={e => setForm(prev => ({ ...prev, slot: e.target.value }))}
                className="w-full h-10 rounded-md border border-input px-3 text-sm bg-background"
              >
                {slotOptions.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Priest Assignment</label>
              <select
                value={form.priestName}
                onChange={e => setForm(prev => ({ ...prev, priestName: e.target.value }))}
                className="w-full h-10 rounded-md border border-input px-3 text-sm bg-background"
              >
                {priestOptions.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Payment Status</label>
              <select
                value={form.paymentStatus}
                onChange={e => setForm(prev => ({ ...prev, paymentStatus: e.target.value as SevaBooking['paymentStatus'] }))}
                className="w-full h-10 rounded-md border border-input px-3 text-sm bg-background"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Booking Status</label>
              <select
                value={form.bookingStatus}
                onChange={e => setForm(prev => ({ ...prev, bookingStatus: e.target.value as SevaBooking['bookingStatus'] }))}
                className="w-full h-10 rounded-md border border-input px-3 text-sm bg-background"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background min-h-[80px]"
            />
          </div>

          {getPoojaDetails(form.poojaType, formDatePoojaCatalog) && (
            <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
              <p className="font-medium">Estimated Offerings</p>
              <p className="text-muted-foreground mt-1">
                {form.poojaType} · {getPoojaDetails(form.poojaType, formDatePoojaCatalog)?.duration} · {money(getPoojaDetails(form.poojaType, formDatePoojaCatalog)?.amount || 0)}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save Booking</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!receiptItem} onClose={() => setReceiptItem(null)} title="E-Seva Pass (Online Receipt)">
        {receiptItem && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{receiptItem.receiptNumber}</p>
                <StatusBadge status={receiptItem.paymentStatus} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <p><span className="text-muted-foreground">Booking:</span> {receiptItem.bookingCode}</p>
                <p><span className="text-muted-foreground">Devotee:</span> {receiptItem.devoteeName}</p>
                <p><span className="text-muted-foreground">Pooja:</span> {receiptItem.poojaType}</p>
                <p><span className="text-muted-foreground">Priest:</span> {receiptItem.priestName}</p>
                <p><span className="text-muted-foreground">Date:</span> {receiptItem.date}</p>
                <p><span className="text-muted-foreground">Slot:</span> {receiptItem.slot}</p>
                <p className="col-span-2"><span className="text-muted-foreground">Amount:</span> {money(getPoojaDetails(receiptItem.poojaType, poojaCatalog)?.amount || 0)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setReceiptItem(null)}>Close</Button>
              <Button className="flex-1" onClick={() => window.print()}>Print Pass</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Delete Booking"
        message="Are you sure you want to delete this booking?"
      />
    </div>
  );
};

export default PoojaSevaPage;
