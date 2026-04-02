import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ReceiptText, CalendarDays, UserCog, Flower2, Search, CheckCircle2, Ticket, Filter } from 'lucide-react';
import { mockBookings } from '@/data/mockData';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { useTempleEventsStore } from '@/hooks/useTempleEventsStore';
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

function getPoojaDetails(name: PoojaType, catalog: CatalogEntry[]) {
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
        desc: `Special offering setup for ${event.name}`,
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

  const setFormField = <K extends keyof Omit<SevaBooking, 'id' | 'bookingCode' | 'receiptNumber'>>(k: K, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (formError) setFormError('');
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner bg-gradient-to-r from-pink-50/70 via-background to-amber-50/70">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Flower2 className="w-5 h-5 text-pink-600" /> Pooja & Seva Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure pooja offerings, manage devotee bookings, assign priests, and issue digital E-Seva Passes.</p>
        </div>
        <Button onClick={openAdd} className="shadow-md bg-pink-600 hover:bg-pink-700 text-white"><Plus className="h-4 w-4 mr-2" />Book Pooja slot</Button>
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
          <input
            type="date"
            value={selectedServiceDate}
            onChange={e => setSelectedServiceDate(e.target.value)}
            className="h-10 ml-auto w-full sm:w-auto rounded-lg border border-input bg-background/60 shadow-sm px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none hover:border-border transition-all"
          />
        </div>
        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/10">
          <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-10 h-10 bg-primary/5 rounded-bl-full" />
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Selected Date</p>
            <p className="text-lg font-bold mt-1 text-foreground">{formatDateDDMMYYYY(selectedServiceDate)}</p>
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
           <section className="section-panel shadow-sm object-cover">
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
                     <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Receipt/Ref</th>
                     <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Devotee</th>
                     <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Pooja Detail</th>
                     <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Schedule & Priest</th>
                     <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Status Group</th>
                     <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="bg-background">
                   {filtered.length === 0 ? <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No bookings found for the current filters.</td></tr> : filtered.map(item => (
                     <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                       <td className="p-4 align-top">
                         <p className="font-bold text-foreground">{item.bookingCode}</p>
                         <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{item.receiptNumber}</p>
                       </td>
                       <td className="p-4 align-top">
                         <p className="font-semibold text-foreground max-w-[150px] truncate" title={item.devoteeName}>{item.devoteeName}</p>
                       </td>
                       <td className="p-4 align-top">
                         <p className="font-semibold text-primary max-w-[200px] truncate" title={item.poojaType}>{item.poojaType}</p>
                         <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded border border-border/60 bg-muted/50 text-foreground font-medium uppercase tracking-wider">
                           {getPoojaDetails(item.poojaType, poojaCatalog)?.category || 'Daily Seva'}
                         </span>
                       </td>
                       <td className="p-4 align-top whitespace-nowrap">
                         <p className="text-[11px] font-bold text-foreground mb-0.5">{item.date}</p>
                         <p className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded inline-block border border-border/50">{item.slot}</p>
                         <p className="text-[11px] font-medium text-muted-foreground mt-1.5 flex items-center gap-1"><UserCog className="w-3 h-3" />{item.priestName}</p>
                       </td>
                       <td className="p-4 align-top">
                         <div className="flex flex-col gap-1.5 w-max">
                           <StatusBadge status={item.paymentStatus} />
                           <StatusBadge status={item.bookingStatus} />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modify Booking Info' : 'Create New Pooja Booking'}>
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
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" value={form.poojaType} onChange={e => setFormField('poojaType', e.target.value as PoojaType)}>
                {formDatePoojaCatalog.map(item => <option key={item.name} value={item.name}>{item.name} (₹{item.amount})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Service Date</label>
              <input type="date" value={form.date} className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" onChange={e => {
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
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" value={form.slot} onChange={e => setFormField('slot', e.target.value)}>
                {slotOptions.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Assign Purohit (Priest)</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" value={form.priestName} onChange={e => setFormField('priestName', e.target.value)}>
                {priestOptions.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Fee Payment Status</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" value={form.paymentStatus} onChange={e => setFormField('paymentStatus', e.target.value as SevaBooking['paymentStatus'])}>
                <option value="Pending">Pending / Unpaid</option><option value="Paid">Processed & Paid</option><option value="Refunded">Refunded / Reverted</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Operational Status</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" value={form.bookingStatus} onChange={e => setFormField('bookingStatus', e.target.value as SevaBooking['bookingStatus'])}>
                <option value="Pending">Pending Schedule</option><option value="Confirmed">Confirmed by Officer</option><option value="Completed">Pooja Completed</option><option value="Cancelled">Service Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Instructions / Notes (Sankalpam details)</label>
            <textarea className="w-full min-h-[80px] rounded-lg border border-input bg-background/60 hover:border-border p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm resize-none placeholder:text-muted-foreground/60" placeholder="e.g. Include specific star details for archana..." value={form.notes} onChange={e => setFormField('notes', e.target.value)} />
          </div>

          {getPoojaDetails(form.poojaType, formDatePoojaCatalog) && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center shadow-sm">
               <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-0.5">Calculated Est. Amount</p>
                  <p className="font-semibold text-sm">{form.poojaType}</p>
               </div>
               <div className="text-right">
                 <p className="text-2xl font-bold text-foreground font-display">{money(getPoojaDetails(form.poojaType, formDatePoojaCatalog)?.amount || 0)}</p>
                 <p className="text-[11px] text-muted-foreground font-medium">approx {getPoojaDetails(form.poojaType, formDatePoojaCatalog)?.duration}</p>
               </div>
            </div>
          )}

          <div className="flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 py-5">Discard</Button>
            <Button onClick={handleSave} className="flex-1 py-5 shadow-md">{editId ? 'Persist Changes' : 'Record Booking'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!receiptItem} onClose={() => setReceiptItem(null)} title="Official E-Seva Pass">
        {receiptItem && (
           <div className="space-y-5 px-1 pb-1">
             <div className="rounded-xl border-2 border-border p-6 bg-gradient-to-b from-card to-muted/20 relative overflow-hidden shadow-inner">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0" />
                 
                 <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4 relative z-10">
                   <div>
                      <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Pass Number</p>
                      <p className="text-xl font-display font-bold text-foreground">{receiptItem.receiptNumber}</p>
                   </div>
                   <StatusBadge status={receiptItem.paymentStatus} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm relative z-10">
                   <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Booking Ref</p><p className="font-semibold">{receiptItem.bookingCode}</p></div>
                   <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Date of Seva</p><p className="font-semibold">{receiptItem.date}</p></div>
                   <div className="col-span-2 bg-muted/40 p-3 rounded-lg border border-border/60">
                      <p className="text-[10px] uppercase font-bold text-primary mb-1">Pooja Configuration</p>
                      <p className="font-bold text-base text-foreground mb-0.5">{receiptItem.poojaType}</p>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> For Devotee: <span className="text-foreground">{receiptItem.devoteeName}</span></p>
                   </div>
                   <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Reporting Time</p><p className="font-semibold">{receiptItem.slot}</p></div>
                   <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Assigned Purohit</p><p className="font-semibold">{receiptItem.priestName}</p></div>
                 </div>

                 <div className="mt-5 pt-4 border-t-2 border-dashed border-border/80 flex justify-between items-center relative z-10">
                     <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Authorized Access amount</p>
                     <p className="text-2xl font-bold font-display text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">{money(getPoojaDetails(receiptItem.poojaType, poojaCatalog)?.amount || 0)}</p>
                 </div>
             </div>
             <div className="flex gap-3 pt-2">
                 <Button variant="outline" className="flex-1 h-11" onClick={() => setReceiptItem(null)}>Dismiss</Button>
                 <Button className="flex-1 h-11 shadow-md bg-foreground text-background hover:bg-foreground/90" onClick={() => window.print()}><ReceiptText className="w-4 h-4 mr-2" />Print Terminal Pass</Button>
             </div>
           </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Scrap Booking" message="Are you extremely sure you want to permanently delete this booking record? Analytics will be affected." />
    </div>
  );
};

export default PoojaSevaPage;
