import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ReceiptText, CalendarDays, UserCog, Flower2, Search, CheckCircle2, Ticket, Filter, Lock } from 'lucide-react';
import { mockBookings } from '@/data/mockData';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { useTempleEventsStore, type TempleEvent } from '@/hooks/useTempleEventsStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import FormField from '@/components/FormField';

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
  return `₹ ${n.toLocaleString('en-IN')}`;
}

function normalizePoojaName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
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

function getPoojaDetails(name: PoojaType, catalog: CatalogEntry[]) {
  return catalog.find(item => item.name.toLowerCase() === name.toLowerCase());
}

function buildCatalogFromEvents(eventItems: TempleEvent[]): CatalogEntry[] {
  const catalog = new Map<string, CatalogEntry>();
  eventItems.forEach(event => {
    // Safely collect possible pooja names from the event
    const poojaNames = [event.poojaType, event.name]
      .filter(Boolean)
      .map(name => name.trim().replace(/\s+/g, ' '))
      .filter(name => name.length > 2); // Avoid very short or empty strings

    poojaNames.forEach(name => {
      const key = name.toLowerCase();
      if (catalog.has(key)) return;
      catalog.set(key, {
        name,
        category: event.festivalName ? 'Festival Seva' : 'Daily Seva',
        duration: '45 mins',
        amount: 501,
        desc: `Ritual arrangement as part of: ${event.name}`,
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

    const eventKeys = new Set(eventPoojaCatalog.map(item => normalizePoojaName(item.name)));
    const fallbackFromBase = basePoojaCatalog.filter(item => !eventKeys.has(normalizePoojaName(item.name)));

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

  // Fake payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const formDatePoojaCatalog = useMemo(() => {
    if (!form.date) return poojaCatalog;
    const byFormDate = buildCatalogFromEvents(templeEvents.filter(event => event.date === form.date));
    return byFormDate.length > 0 ? byFormDate : poojaCatalog;
  }, [form.date, templeEvents, poojaCatalog]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter(item => {
      const category = getPoojaDetails(item.poojaType, poojaCatalog)?.category || 'Daily Seva';
      const matchesCategory = activeCategory === 'All' || category === activeCategory;
      const matchesSearch = !q ||
        item.bookingCode.toLowerCase().includes(q) ||
        item.devoteeName.toLowerCase().includes(q) ||
        item.poojaType.toLowerCase().includes(q) ||
        item.priestName.toLowerCase().includes(q);
      const matchesDate = !selectedServiceDate || item.date === selectedServiceDate;
      return matchesCategory && matchesSearch && matchesDate;
    });
  }, [items, search, activeCategory, poojaCatalog, selectedServiceDate]);

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
        count: items.filter(item => {
          const c = getPoojaDetails(item.poojaType, poojaCatalog)?.category || 'Daily Seva';
          return c === category;
        }).length,
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

  const performSave = (finalForm = form) => {
    if (editId) {
      update(editId, finalForm);
      const existing = items.find(item => item.id === editId);
      if (existing) {
        setReceiptItem({ ...existing, ...finalForm });
      }
    } else {
      const created = add({
        bookingCode: nextBookingCode(items),
        receiptNumber: nextReceipt(items),
        ...finalForm,
      });
      setReceiptItem(created);
    }
    setModalOpen(false);
  }

  const handleSave = () => {
    if (!form.devoteeName.trim() || !form.date) {
      setFormError('Please fill devotee name and date to record booking.');
      return;
    }
    setFormError('');

    if (!editId && form.paymentStatus !== 'Paid') {
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        performSave({ ...form, paymentStatus: 'Paid', bookingStatus: 'Confirmed' });
      }, 2500);
    } else {
      performSave();
    }
  };

  const setFormField = <K extends keyof Omit<SevaBooking, 'id' | 'bookingCode' | 'receiptNumber'>>(k: K, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (formError) setFormError('');
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto animate-fade-in relative">
      <div className="page-header-banner bg-gradient-to-r from-pink-50/70 via-background to-amber-50/70">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Flower2 className="w-5 h-5 text-pink-600" /> Pooja & Seva Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure pooja offerings, manage devotee bookings, assign priests, and issue digital Passes.</p>
        </div>
        <Button onClick={openAdd} className="shadow-md bg-pink-600 hover:bg-pink-700 text-white"><Plus className="h-4 w-4 mr-2" />Book Pooja slot/users</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Bookings</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{totals.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">Confirmed Slots</p>
          <p className="text-2xl font-bold mt-1 text-emerald-700">{totals.confirmed}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-blue-800">Paid Receipts</p>
          <p className="text-2xl font-bold mt-1 text-blue-700">{totals.paid}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-800">Pending Approvals</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{totals.pending}</p>
        </div>
        <div className="stat-card md:col-span-3 xl:col-span-1">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">Completed Poojas</p>
          <p className="text-2xl font-bold mt-1 text-emerald-700">{totals.completed}</p>
        </div>
      </div>

      <section className="section-panel shadow-sm">
        <div className="section-panel-header gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> View Date-wise Events & Available Poojas</h2>
            <p className="text-xs text-muted-foreground mt-1">Select any date to see the sync between general Events and specific Pooja setups.</p>
          </div>
          <div className="flex gap-2 ml-auto items-center">
            {selectedServiceDate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedServiceDate('')}
                className="text-muted-foreground hover:text-foreground text-[11px] font-bold uppercase tracking-wider"
              >
                Show All Data
              </Button>
            )}
            <input
              type="date"
              value={selectedServiceDate}
              onChange={e => setSelectedServiceDate(e.target.value)}
              className="h-10 w-full sm:w-auto rounded-lg border border-input bg-background/60 shadow-sm px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none hover:border-border transition-all font-semibold"
            />
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/10">
          <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-10 h-10 bg-primary/5 rounded-bl-full" />
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Date Context</p>
            <p className="text-lg font-bold mt-1 text-foreground">{selectedServiceDate ? formatDateDDMMYYYY(selectedServiceDate) : 'Showing All Timelines'}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-10 h-10 bg-primary/5 rounded-bl-full" />
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Active Events</p>
            <p className="text-xl font-bold mt-1 text-primary">{eventsForSelectedDate.length}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-10 h-10 bg-primary/5 rounded-bl-full" />
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Pooja Variants</p>
            <p className="text-xl font-bold mt-1 text-primary">{dateWisePoojaCatalog.length}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-10 h-10 bg-primary/5 rounded-bl-full" />
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Bookings on Date</p>
            <p className="text-xl font-bold mt-1 text-primary">{items.filter(item => item.date === selectedServiceDate).length}</p>
          </div>
        </div>
        <div className="px-4 pb-4">
          {eventsForSelectedDate.length === 0 ? (
            <p className="text-sm text-muted-foreground italic px-2">No special events found for {formatDateDDMMYYYY(selectedServiceDate)}.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-2">
              {eventsForSelectedDate.map(event => (
                <div key={event.id} className="rounded-lg border border-border/60 px-4 py-3 bg-background shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-foreground">{event.name}</p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{event.time} · {event.poojaType}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 animate-slide-up">
        {/* Main List Column */}
        <div className="xl:col-span-3 space-y-4">
          <section className="section-panel shadow-sm">
            <div className="section-panel-header gap-3 flex-wrap border-b border-border/60 pb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap"><Filter className="w-4 h-4 text-primary" /> Filtered Bookings Explorer</h2>
              <div className="flex-1 flex justify-end">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className="h-10 w-full pl-9 pr-3 rounded-lg border border-input bg-background/60 text-sm focus:ring-2 focus:ring-primary/20 hover:border-border transition-all outline-none shadow-sm"
                    placeholder="Search bookings, devotees..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-muted/10 border-b border-border/60 flex flex-wrap gap-2">
              {categorySummary.map(item => (
                <button
                  key={item.category}
                  onClick={() => setActiveCategory(item.category)}
                  className={`px-4 py-1.5 flex items-center gap-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase border transition-all duration-200 ${activeCategory === item.category ? 'bg-primary border-primary text-primary-foreground shadow-md scale-[1.02]' : 'text-muted-foreground border-border bg-background hover:text-foreground hover:bg-muted/50'}`}
                >
                  {item.category} <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeCategory === item.category ? 'bg-background/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{item.count}</span>
                </button>
              ))}
            </div>

            <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Booking ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Devotee</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Pooja Detail</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Schedule & Priest</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Status Group</th>
                    <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-background">
                  {filtered.length === 0 ? <tr><td colSpan={6} className="p-10 text-center font-medium text-muted-foreground">No bookings found for the current filters.</td></tr> : filtered.map(item => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 align-top">
                        <p className="font-bold text-foreground text-sm tracking-wide">{item.bookingCode}</p>
                      </td>
                      <td className="p-4 align-top">
                        <p className="font-semibold text-foreground max-w-[150px] truncate" title={item.devoteeName}>{item.devoteeName}</p>
                      </td>
                      <td className="p-4 align-top">
                        <p className="font-bold text-primary max-w-[200px] truncate" title={item.poojaType}>{item.poojaType}</p>
                        <span className="text-accent text-[11px] font-bold tracking-wider uppercase italic">
                          {getPoojaDetails(item.poojaType, poojaCatalog)?.category || 'Daily Seva'}
                        </span>
                      </td>
                      <td className="p-4 align-top whitespace-nowrap">
                        <p className="text-[11px] font-bold text-foreground mb-0.5">{item.date}</p>
                        <p className="text-[11px] text-muted-foreground font-semibold">{item.slot}</p>
                        <p className="text-[11px] font-bold text-muted-foreground mt-1.5 flex items-center gap-1.5"><UserCog className="w-3.5 h-3.5" />{item.priestName || 'Pending Assignment'}</p>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-2 w-max">
                           <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${item.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                             <span className="font-bold text-[11px] text-foreground/70 uppercase tracking-tighter">Pay: {item.paymentStatus}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${item.bookingStatus === 'Confirmed' || item.bookingStatus === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                             <span className="font-bold text-[11px] text-foreground/70 uppercase tracking-tighter">Ops: {item.bookingStatus}</span>
                           </div>
                        </div>
                      </td>
                      <td className="p-4 text-right align-top">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setReceiptItem(item)} className="text-amber-600 hover:bg-amber-50 hover:text-amber-700" title="Generate E-Seva Pass"><ReceiptText className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Edit Booking"><Pencil className="h-4 w-4 text-foreground" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="hover:text-destructive hover:bg-destructive/10" title="Delete Booking"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4 xl:sticky xl:top-4 self-start">
          <div className="section-panel shadow-sm">
            <div className="section-panel-header px-4 py-3 border-b border-border/60 bg-gradient-to-b from-sky-50/50 to-background">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Flower2 className="w-4 h-4 text-primary" /> Global Catalog</h2>
              <span className="text-[10px] py-0.5 px-2 bg-primary/10 text-primary rounded-full font-bold">{eventPoojaCatalog.length} derived</span>
            </div>
            <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {poojaCatalog.map(item => (
                <div key={item.name} className="rounded-lg border border-border/60 p-3 bg-background shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-foreground truncate max-w-[150px]" title={item.name}>{item.name}</p>
                    <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">{money(item.amount)}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">{item.category} <span className="text-muted-foreground font-medium lowercase">({item.duration})</span></p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-panel shadow-sm">
            <div className="section-panel-header px-4 py-3 border-b border-border/60 bg-gradient-to-b from-amber-50/50 to-background">
              <h2 className="text-sm font-semibold flex items-center gap-2"><UserCog className="w-4 h-4 text-primary" /> Priest Duty Pool</h2>
            </div>
            <div className="p-3 space-y-1.5 max-h-[300px] overflow-y-auto">
              {priestOptions.map((name, idx) => (
                <div key={name} className="rounded-lg border border-border/50 px-3 py-2 text-sm flex items-center justify-between bg-background">
                  <span className="font-medium">{name}</span>
                  <span className={`text-[10px] font-bold uppercase ${idx % 3 === 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {idx % 3 === 0 ? 'Busy' : 'Free'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={modalOpen && !isProcessingPayment} onClose={() => setModalOpen(false)} title={editId ? 'Modify Booking Info' : 'Create New Pooja Booking'}>
        <div className="space-y-4 px-1 pb-2">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2 animate-pulse-slow">
              <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-sm font-medium text-red-800">{formError}</p>
            </div>
          )}

          <FormField label="Devotee Name" value={form.devoteeName} onChange={v => setFormField('devoteeName', v)} required placeholder="e.g. Ramesh Kumar" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Select Pooja Package</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-semibold" value={form.poojaType} onChange={e => setFormField('poojaType', e.target.value as PoojaType)}>
                {formDatePoojaCatalog.map(item => <option key={item.name} value={item.name}>{item.name} (₹{item.amount})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Service Date</label>
              <input type="date" value={form.date} className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-semibold" onChange={e => {
                const nextDate = e.target.value;
                const nextDateCatalog = buildCatalogFromEvents(templeEvents.filter(event => event.date === nextDate));
                const nextDefaultPooja = nextDateCatalog[0]?.name;
                setForm(prev => ({ ...prev, date: nextDate, poojaType: nextDefaultPooja || prev.poojaType }));
                if (formError) setFormError('');
              }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Preferred Time Slot</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-semibold" value={form.slot} onChange={e => setFormField('slot', e.target.value)}>
                {slotOptions.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Assign Purohit (Priest)</label>
                {!editId && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-100">Assigned during check-in</span>}
              </div>
              <select 
                className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed" 
                value={form.priestName} 
                onChange={e => setFormField('priestName', e.target.value)}
                disabled={!editId}
              >
                {!editId && <option value="">To be Assigned later</option>}
                {priestOptions.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>

          {editId && (
            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Fee Payment Status</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-semibold" value={form.paymentStatus} onChange={e => setFormField('paymentStatus', e.target.value as SevaBooking['paymentStatus'])}>
                  <option value="Pending">Pending / Unpaid</option><option value="Paid">Processed & Paid</option><option value="Refunded">Refunded / Reverted</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Operational Status</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-semibold" value={form.bookingStatus} onChange={e => setFormField('bookingStatus', e.target.value as SevaBooking['bookingStatus'])}>
                  <option value="Pending">Pending Schedule</option><option value="Confirmed">Confirmed by Officer</option><option value="Completed">Pooja Completed</option><option value="Cancelled">Service Cancelled</option>
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Instructions / Notes (Sankalpam details)</label>
            <textarea className="w-full min-h-[80px] rounded-lg border border-input bg-background/60 hover:border-border p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm resize-none placeholder:text-muted-foreground/60 font-semibold" placeholder="e.g. Include specific star details for archana..." value={form.notes} onChange={e => setFormField('notes', e.target.value)} />
          </div>

          {getPoojaDetails(form.poojaType, formDatePoojaCatalog) && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-0.5">Calculated Est. Amount</p>
                <p className="font-bold text-sm tracking-tight">{form.poojaType}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground font-display">{money(getPoojaDetails(form.poojaType, formDatePoojaCatalog)?.amount || 0)}</p>
                <p className="text-[11px] text-muted-foreground font-medium">approx {getPoojaDetails(form.poojaType, formDatePoojaCatalog)?.duration}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-[0.4] py-5">Discard</Button>
            <Button onClick={handleSave} className="flex-1 py-5 shadow-lg font-bold bg-primary hover:bg-primary/90">
              {editId ? 'Save Changes' : (
                <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Process Payment & Book</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Fake Payment Modal */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-border">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Processing Payment</h2>
            <p className="text-sm text-muted-foreground text-center">Contacting secure payment gateway to finalize {form.poojaType} booking...</p>
          </div>
        </div>
      )}

      <Modal open={!!receiptItem} onClose={() => setReceiptItem(null)} title="Temple Booking Receipt">
        {receiptItem && (
          <div className="space-y-5 px-1 pb-1">
            <div className="rounded-2xl border border-border p-6 bg-gradient-to-br from-card to-muted/30 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-[100px] -z-0 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-border/60 pb-5 mb-5 relative z-10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Booking Receipt</p>
                  <p className="text-2xl font-display font-black text-foreground tracking-tight">{receiptItem.receiptNumber}</p>
                </div>
                <StatusBadge status={receiptItem.paymentStatus} />
              </div>

              <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm relative z-10">
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Booking Ref</p><p className="font-bold text-foreground">{receiptItem.bookingCode}</p></div>
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Date of Seva</p><p className="font-bold text-foreground">{receiptItem.date}</p></div>
                <div className="col-span-2 bg-background p-4 rounded-xl border border-border/80 shadow-sm group hover:border-primary/30 transition-colors">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Pooja Configuration</p>
                  <p className="font-bold text-lg text-foreground mb-1">{receiptItem.poojaType}</p>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> For Devotee: <span className="text-foreground">{receiptItem.devoteeName}</span></p>
                </div>
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Reporting Time</p><p className="font-bold text-foreground">{receiptItem.slot}</p></div>
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Assigned Purohit</p><p className="font-bold text-foreground">{receiptItem.priestName}</p></div>
              </div>

              <div className="mt-6 pt-5 border-t-2 border-dashed border-border/80 flex justify-between items-center relative z-10">
                <p className="text-[12px] uppercase tracking-widest font-extrabold text-foreground">Total Paid Amount</p>
                <p className="text-2xl font-black font-display text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-200">{money(getPoojaDetails(receiptItem.poojaType, poojaCatalog)?.amount || 0)}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 h-12 font-bold rounded-xl" onClick={() => setReceiptItem(null)}>Dismiss Receipt</Button>
              <Button className="flex-1 h-12 shadow-lg rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90" onClick={() => window.print()}><ReceiptText className="w-4 h-4 mr-2" />Print Booking Receipt</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Scrap Booking" message="Are you extremely sure you want to permanently delete this booking record? Analytics will be affected." />
    </div>
  );
};

export default PoojaSevaPage;
