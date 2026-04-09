import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Pencil,
  Trash2,
  ReceiptText,
  CalendarDays,
  UserCog,
  Flower2,
  Search,
  Ticket,
  Filter,
  CreditCard,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { mockBookings } from '@/data/mockData';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import {
  useTempleEventsStore,
  type TempleEvent,
} from '@/hooks/useTempleEventsStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import FormField from '@/components/FormField';
import PoojaSevaPaymentFlow from '@/components/PoojaSevaPaymentFlow';

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

const basePoojaCatalog: Array<{
  name: PoojaType;
  category: PoojaCategory;
  duration: string;
  amount: number;
  desc: string;
}> = [
  {
    name: 'Archana',
    category: 'Daily Seva',
    duration: '20 mins',
    amount: 300,
    desc: 'Name-based chanting and flower offering.',
  },
  {
    name: 'Abhishekam',
    category: 'Daily Seva',
    duration: '45 mins',
    amount: 900,
    desc: 'Sacred abhishekam with mantra recitation.',
  },
  {
    name: 'Sahasranama Archana',
    category: 'Daily Seva',
    duration: '35 mins',
    amount: 700,
    desc: '108/1000 name archana with sankalpam.',
  },
  {
    name: 'Lakshmi Homam',
    category: 'Special Seva',
    duration: '100 mins',
    amount: 3200,
    desc: 'Homam for prosperity and abundance.',
  },
  {
    name: 'Ganapathi Homam',
    category: 'Special Seva',
    duration: '90 mins',
    amount: 2800,
    desc: 'Removes obstacles and starts ventures auspiciously.',
  },
  {
    name: 'Navagraha Shanti',
    category: 'Special Seva',
    duration: '75 mins',
    amount: 2400,
    desc: 'Planetary peace and dosha remedies.',
  },
  {
    name: 'Satyanarayana Pooja',
    category: 'Festival Seva',
    duration: '80 mins',
    amount: 2100,
    desc: 'Monthly and festival family pooja.',
  },
  {
    name: 'Rudrabhishekam',
    category: 'Festival Seva',
    duration: '60 mins',
    amount: 1800,
    desc: 'Sacred Shiva abhishekam during special days.',
  },
  {
    name: 'Chandi Homam',
    category: 'Festival Seva',
    duration: '130 mins',
    amount: 4500,
    desc: 'Powerful homam for protection and wellbeing.',
  },
];

const slotOptions = [
  '05:00 AM - 09:00 AM',
  '09:00 AM - 01:00 PM',
  '01:00 PM - 05:00 PM',
  '05:00 PM - 09:00 PM',
];

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

function money(n: number) {
  return `₹ ${n.toLocaleString('en-IN')}`;
}

function normalizePoojaName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function inferPoojaType(serviceName: string): PoojaType {
  const v = serviceName.toLowerCase();
  if (v.includes('satya')) return 'Satyanarayana Pooja';
  if (v.includes('rudra')) return 'Rudrabhishekam';
  if (v.includes('abhishekam')) return 'Abhishekam';
  if (v.includes('homam')) return 'Ganapathi Homam';
  return 'Archana';
}

function nextBookingCode(records: SevaBooking[]) {
  const max = records.reduce((acc, r) => {
    const m = r.bookingCode.match(/^BK(\d+)$/i);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `BK${String(max + 1).padStart(3, '0')}`;
}

function nextReceipt(records: SevaBooking[]) {
  const max = records.reduce((acc, r) => {
    const m = r.receiptNumber.match(/^ESP-(\d+)$/i);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `ESP-${String(max + 1).padStart(4, '0')}`;
}

function getPoojaDetails(name: PoojaType, catalog: typeof basePoojaCatalog) {
  return catalog.find((i) => i.name.toLowerCase() === name.toLowerCase());
}

function buildCatalogFromEvents(
  eventItems: TempleEvent[],
): typeof basePoojaCatalog {
  const catalog = new Map<string, (typeof basePoojaCatalog)[0]>();
  eventItems.forEach((event) => {
    [event.poojaType, event.name]
      .filter(Boolean)
      .map((n) => n.trim().replace(/\s+/g, ' '))
      .filter((n) => n.length > 2)
      .forEach((name) => {
        const key = name.toLowerCase();
        if (!catalog.has(key)) {
          catalog.set(key, {
            name,
            category: event.festivalName ? 'Festival Seva' : 'Daily Seva',
            duration: '45 mins',
            amount: 501,
            desc: `Ritual arrangement as part of: ${event.name}`,
          });
        }
      });
  });
  return Array.from(catalog.values());
}

const initialBookings: SevaBooking[] = mockBookings.map((item, idx) => ({
  id: item.id,
  bookingCode: item.id,
  devoteeName: item.devoteeName,
  poojaType: inferPoojaType(item.serviceName),
  date: item.date,
  slot: item.time,
  priestName: priestOptions[idx % priestOptions.length],
  paymentStatus:
    (item.paymentStatus as SevaBooking['paymentStatus']) || 'Pending',
  bookingStatus:
    (item.bookingStatus as SevaBooking['bookingStatus']) || 'Pending',
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const PoojaSevaPage: React.FC = () => {
  const { items, add, update, remove } = useStore<SevaBooking>(initialBookings);
  const { items: templeEvents } = useTempleEventsStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedServiceDate, setSelectedServiceDate] = useState(todayStr);

  const eventPoojaCatalog = useMemo(
    () => buildCatalogFromEvents(templeEvents),
    [templeEvents],
  );
  const eventsForSelectedDate = useMemo(
    () => templeEvents.filter((e) => e.date === selectedServiceDate),
    [templeEvents, selectedServiceDate],
  );
  const dateWisePoojaCatalog = useMemo(
    () => buildCatalogFromEvents(eventsForSelectedDate),
    [eventsForSelectedDate],
  );

  const poojaCatalog = useMemo(() => {
    if (eventPoojaCatalog.length === 0) return basePoojaCatalog;
    const eventKeys = new Set(
      eventPoojaCatalog.map((i) => normalizePoojaName(i.name)),
    );
    return [
      ...eventPoojaCatalog,
      ...basePoojaCatalog.filter(
        (i) => !eventKeys.has(normalizePoojaName(i.name)),
      ),
    ];
  }, [eventPoojaCatalog]);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | PoojaCategory>(
    'All',
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [receiptItem, setReceiptItem] = useState<SevaBooking | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  // Payment state
  const [payTarget, setPayTarget] = useState<{
    booking: SevaBooking;
    amount: number;
  } | null>(null);

  const formDatePoojaCatalog = useMemo(() => {
    if (!form.date) return poojaCatalog;
    const byDate = buildCatalogFromEvents(
      templeEvents.filter((e) => e.date === form.date),
    );
    return byDate.length > 0 ? byDate : poojaCatalog;
  }, [form.date, templeEvents, poojaCatalog]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      const category =
        getPoojaDetails(item.poojaType, poojaCatalog)?.category || 'Daily Seva';
      const matchesCategory =
        activeCategory === 'All' || category === activeCategory;
      const matchesSearch =
        !q ||
        item.bookingCode.toLowerCase().includes(q) ||
        item.devoteeName.toLowerCase().includes(q) ||
        item.poojaType.toLowerCase().includes(q) ||
        item.priestName.toLowerCase().includes(q);
      const matchesDate =
        !selectedServiceDate || item.date === selectedServiceDate;
      return matchesCategory && matchesSearch && matchesDate;
    });
  }, [items, search, activeCategory, poojaCatalog, selectedServiceDate]);

  const totals = useMemo(
    () => ({
      total: items.length,
      confirmed: items.filter((i) => i.bookingStatus === 'Confirmed').length,
      paid: items.filter((i) => i.paymentStatus === 'Paid').length,
      pending: items.filter((i) => i.bookingStatus === 'Pending').length,
      completed: items.filter((i) => i.bookingStatus === 'Completed').length,
    }),
    [items],
  );

  const categorySummary = useMemo(() => {
    const categories: Array<'All' | PoojaCategory> = [
      'All',
      'Daily Seva',
      'Special Seva',
      'Festival Seva',
    ];
    return categories.map((cat) => ({
      category: cat,
      count:
        cat === 'All'
          ? items.length
          : items.filter(
              (item) =>
                (getPoojaDetails(item.poojaType, poojaCatalog)?.category ||
                  'Daily Seva') === cat,
            ).length,
    }));
  }, [items, poojaCatalog]);

  const openAdd = () => {
    const defaultPooja =
      dateWisePoojaCatalog[0]?.name ||
      poojaCatalog[0]?.name ||
      emptyForm.poojaType;
    setForm({
      ...emptyForm,
      date: selectedServiceDate,
      poojaType: defaultPooja,
    });
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
      setFormError('Please fill devotee name and date.');
      return;
    }
    setFormError('');
    if (editId) {
      update(editId, form);
      const existing = items.find((i) => i.id === editId);
      if (existing) setReceiptItem({ ...existing, ...form });
      setModalOpen(false);
    } else {
      // Create booking then open payment
      const created = add({
        bookingCode: nextBookingCode(items),
        receiptNumber: nextReceipt(items),
        ...form,
      });
      setModalOpen(false);
      const amount =
        getPoojaDetails(form.poojaType, formDatePoojaCatalog)?.amount ?? 501;
      setPayTarget({ booking: created, amount });
    }
  };

  const handlePayNow = (item: SevaBooking) => {
    const amount = getPoojaDetails(item.poojaType, poojaCatalog)?.amount ?? 501;
    setPayTarget({ booking: item, amount });
  };

  const handlePaymentPaid = (updatedBooking: SevaBooking) => {
    update(updatedBooking.id, {
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
    });
  };

  const setFormField = <K extends keyof typeof emptyForm>(
    k: K,
    v: (typeof emptyForm)[K],
  ) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (formError) setFormError('');
  };

  return (
    <div className="pooja-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in relative">
      {/* Header */}
      <div className="page-header-banner poojs-header">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Flower2 className="w-5 h-5 text-primary" /> Pooja & Seva Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure pooja offerings, manage devotee bookings, assign priests, and issue digital Passes.</p>
        </div>
        <Button onClick={openAdd} className="pooja-cta shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Book Pooja Slot
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          {
            label: 'Total Bookings',
            val: totals.total,
            cls: 'border-border/60',
          },
          {
            label: 'Confirmed Slots',
            val: totals.confirmed,
            cls: 'border-success/25 bg-success/10',
            textCls: 'text-success',
          },
          {
            label: 'Paid Receipts',
            val: totals.paid,
            cls: 'border-primary/25 bg-primary/10',
            textCls: 'text-primary',
          },
          {
            label: 'Pending Approvals',
            val: totals.pending,
            cls: 'border-warning/25 bg-warning/10',
            textCls: 'text-warning',
          },
          {
            label: 'Completed Poojas',
            val: totals.completed,
            cls: 'border-success/25 bg-success/10 md:col-span-3 xl:col-span-1',
            textCls: 'text-success',
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`stat-card pooja-stat-card ${card.cls}`}
          >
            <p
              className={`text-[11px] uppercase tracking-wider font-semibold text-muted-foreground ${card.textCls || ''}`}
            >
              {card.label}
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${card.textCls || 'text-foreground'}`}
            >
              {card.val}
            </p>
          </div>
        ))}
      </div>

      {/* Date panel */}
      <section className="section-panel pooja-date-panel shadow-sm">
        <div className="section-panel-header gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" /> View Date-wise
              Events & Available Poojas
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select any date to see events and pooja setups.
            </p>
          </div>
          <div className="flex gap-2 ml-auto items-center">
            {selectedServiceDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedServiceDate('')}
                className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider"
              >
                Show All
              </Button>
            )}
            <div className="relative w-full sm:w-auto">
              <input
                type="date"
                value={selectedServiceDate}
                onChange={(e) => setSelectedServiceDate(e.target.value)}
                className="pooja-date-input h-10 w-full sm:w-auto rounded-lg border border-input bg-background/60 shadow-sm pl-3 pr-10 text-sm outline-none font-semibold"
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/75" />
            </div>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/10">
          {[
            {
              label: 'Date Context',
              val: selectedServiceDate
                ? formatDateDDMMYYYY(selectedServiceDate)
                : 'All Timelines',
            },
            { label: 'Active Events', val: eventsForSelectedDate.length },
            { label: 'Pooja Variants', val: dateWisePoojaCatalog.length },
            {
              label: 'Bookings on Date',
              val: items.filter((i) => i.date === selectedServiceDate).length,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="pooja-date-stat rounded-xl border border-border/60 bg-background p-4 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-10 h-10 bg-primary/5 rounded-bl-full" />
              <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                {s.label}
              </p>
              <p className="text-xl font-bold mt-1 text-primary">{s.val}</p>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          {eventsForSelectedDate.length === 0 ? (
            <p className="text-sm text-muted-foreground italic px-2">
              No special events found for{' '}
              {formatDateDDMMYYYY(selectedServiceDate)}.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-2">
              {eventsForSelectedDate.map((event) => (
                <div
                  key={event.id}
                  className="pooja-event-chip rounded-lg border border-border/60 px-4 py-3 bg-background shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {event.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {event.time} · {event.poojaType}
                    </p>
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

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 animate-slide-up">
        <div className="xl:col-span-3 space-y-4">
          <section className="section-panel pooja-main-panel shadow-sm">
            <div className="section-panel-header gap-3 flex-wrap border-b border-border/60 pb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                <Filter className="w-4 h-4 text-primary" /> Filtered Bookings
                Explorer
              </h2>
              <div className="flex-1 flex justify-end">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className="pooja-search-input h-10 w-full pl-9 pr-3 rounded-lg border border-input bg-background/60 text-sm outline-none shadow-sm"
                    placeholder="Search bookings, devotees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-muted/10 border-b border-border/60 flex flex-wrap gap-2">
              {categorySummary.map((item) => (
                <button
                  key={item.category}
                  onClick={() => setActiveCategory(item.category)}
                  className={`pooja-filter-chip px-4 py-1.5 flex items-center gap-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase border transition-all duration-200 ${activeCategory === item.category ? 'bg-primary border-primary text-primary-foreground shadow-md scale-[1.02]' : 'text-foreground/85 border-border bg-background hover:text-foreground hover:bg-muted/50'}`}
                >
                  {item.category} <span className={`min-w-5 px-1.5 py-0.5 rounded-full text-[10px] text-center font-extrabold ${activeCategory === item.category ? 'bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30' : 'bg-muted/80 text-foreground/85 border border-border/60'}`}>{item.count}</span>
                </button>
              ))}
            </div>

            <div className="table-container border-0 rounded-none shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">
                        Booking ID
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">
                        Devotee
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">
                        Pooja Detail
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">
                        Schedule & Priest
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background">
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-10 text-center font-medium text-muted-foreground"
                        >
                          No bookings found for the current filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr
                          key={item.id}
                          className="pooja-row border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 align-top">
                            <p className="font-bold text-foreground text-sm tracking-wide">
                              {item.bookingCode}
                            </p>
                          </td>
                          <td className="p-4 align-top">
                            <p className="font-semibold text-foreground max-w-[150px] truncate">
                              {item.devoteeName}
                            </p>
                          </td>
                          <td className="p-4 align-top">
                            <p className="font-bold text-foreground max-w-[200px] truncate">
                              {item.poojaType}
                            </p>
                            <span className="text-accent text-[11px] font-bold tracking-wider uppercase italic">
                              {getPoojaDetails(item.poojaType, poojaCatalog)
                                ?.category || 'Daily Seva'}
                            </span>
                            <p className="text-[11px] font-bold text-primary mt-0.5">
                              {money(
                                getPoojaDetails(item.poojaType, poojaCatalog)
                                  ?.amount || 0,
                              )}
                            </p>
                          </td>
                          <td className="p-4 align-top whitespace-nowrap">
                            <p className="text-[11px] font-bold text-foreground mb-0.5">
                              {item.date}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-semibold">
                              {item.slot}
                            </p>
                            <p className="text-[11px] font-bold text-muted-foreground mt-1.5 flex items-center gap-1.5">
                              <UserCog className="w-3.5 h-3.5" />
                              {item.priestName || 'Pending'}
                            </p>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-col gap-2 w-max">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${item.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                />
                                <span className="font-bold text-[11px] text-foreground/70 uppercase tracking-tighter">
                                  Pay: {item.paymentStatus}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${item.bookingStatus === 'Confirmed' || item.bookingStatus === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                />
                                <span className="font-bold text-[11px] text-foreground/70 uppercase tracking-tighter">
                                  Ops: {item.bookingStatus}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right align-top">
                            <div className="flex justify-end gap-1 items-center">
                              {/* Pay Now button for unpaid bookings */}
                              {item.paymentStatus !== 'Paid' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs font-bold border-brand-blue-600/40 text-brand-blue-600 hover:bg-brand-blue-50 gap-1.5"
                                  onClick={() => handlePayNow(item)}
                                >
                                  <CreditCard className="w-3 h-3" /> Pay
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setReceiptItem(item)}
                                className="text-foreground/75 hover:bg-primary/10"
                                title="E-Seva Pass"
                              >
                                <ReceiptText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(item)}
                              >
                                <Pencil className="h-4 w-4 text-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(item.id)}
                                className="hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 xl:sticky xl:top-4 self-start">
          <div className="section-panel pooja-side-panel shadow-sm">
            <div className="section-panel-header px-4 py-3 border-b border-border/60">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Flower2 className="w-4 h-4 text-primary" /> Seva Offerings
              </h2>
              <span className="text-[10px] py-0.5 px-2 bg-primary/10 text-primary rounded-full font-bold">
                {eventPoojaCatalog.length} derived
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {poojaCatalog.map((item) => (
                <div
                  key={item.name}
                  className="pooja-catalog-item rounded-lg border border-border/60 p-3 bg-background shadow-sm hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-foreground truncate max-w-[150px]">
                      {item.name}
                    </p>
                    <span className="text-[11px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded border border-success/25">
                      {money(item.amount)}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                    {item.category}{' '}
                    <span className="text-muted-foreground font-medium lowercase">
                      ({item.duration})
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-panel pooja-side-panel shadow-sm">
            <div className="section-panel-header px-4 py-3 border-b border-border/60">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <UserCog className="w-4 h-4 text-primary" /> Priest Duty Pool
              </h2>
            </div>
            <div className="p-3 space-y-1.5 max-h-[300px] overflow-y-auto">
              {priestOptions.map((name, idx) => (
                <div
                  key={name}
                  className="pooja-priest-item rounded-lg border border-border/50 px-3 py-2 text-sm flex items-center justify-between bg-background"
                >
                  <span className="font-medium">{name}</span>
                  <span
                    className={`text-[10px] font-bold uppercase ${idx % 3 === 0 ? 'text-warning' : 'text-success'}`}
                  >
                    {idx % 3 === 0 ? 'Busy' : 'Free'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Modify Booking' : 'Create New Pooja Booking'}
      >
        <div className="pooja-form-shell space-y-4 px-1 pb-2">
          {formError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm font-medium text-destructive">
                {formError}
              </p>
            </div>
          )}
          <FormField
            label="Devotee Name"
            value={form.devoteeName}
            onChange={(v) => setFormField('devoteeName', v)}
            required
            placeholder="e.g. Ramesh Kumar"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Select Pooja Package
              </label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none font-semibold"
                value={form.poojaType}
                onChange={(e) =>
                  setFormField('poojaType', e.target.value as PoojaType)
                }
              >
                {formDatePoojaCatalog.map((i) => (
                  <option key={i.name} value={i.name}>
                    {i.name} (₹{i.amount})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Service Date
              </label>
              <input
                type="date"
                value={form.date}
                className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none font-semibold"
                onChange={(e) => {
                  const d = e.target.value;
                  const dc = buildCatalogFromEvents(
                    templeEvents.filter((ev) => ev.date === d),
                  );
                  setForm((p) => ({
                    ...p,
                    date: d,
                    poojaType: dc[0]?.name || p.poojaType,
                  }));
                  if (formError) setFormError('');
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Preferred Time Slot
              </label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none font-semibold"
                value={form.slot}
                onChange={(e) => setFormField('slot', e.target.value)}
              >
                {slotOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Assign Purohit
              </label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none font-semibold disabled:opacity-60"
                value={form.priestName}
                onChange={(e) => setFormField('priestName', e.target.value)}
                disabled={!editId}
              >
                {!editId && <option value="">To be assigned later</option>}
                {priestOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editId && (
            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Payment Status
                </label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none font-semibold"
                  value={form.paymentStatus}
                  onChange={(e) =>
                    setFormField(
                      'paymentStatus',
                      e.target.value as SevaBooking['paymentStatus'],
                    )
                  }
                >
                  <option value="Pending">Pending / Unpaid</option>
                  <option value="Paid">Processed & Paid</option>
                  <option value="Refunded">Refunded / Reverted</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Booking Status
                </label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none font-semibold"
                  value={form.bookingStatus}
                  onChange={(e) =>
                    setFormField(
                      'bookingStatus',
                      e.target.value as SevaBooking['bookingStatus'],
                    )
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Notes / Sankalpam Details
            </label>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-input bg-background/60 p-3 text-sm outline-none resize-none font-semibold"
              placeholder="e.g. Star details for archana..."
              value={form.notes}
              onChange={(e) => setFormField('notes', e.target.value)}
            />
          </div>

          {getPoojaDetails(form.poojaType, formDatePoojaCatalog) && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-0.5">
                  Estimated Amount
                </p>
                <p className="font-bold text-sm">{form.poojaType}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground font-display">
                  {money(
                    getPoojaDetails(form.poojaType, formDatePoojaCatalog)
                      ?.amount || 0,
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {
                    getPoojaDetails(form.poojaType, formDatePoojaCatalog)
                      ?.duration
                  }
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-5 border-t border-border/60">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-[0.4] py-5"
            >
              Discard
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 py-5 shadow-lg font-bold bg-primary hover:bg-primary/90"
            >
              {editId ? (
                'Save Changes'
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Book & Proceed to Pay
                </span>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Gateway Modal */}
      {payTarget && (
        <PoojaSevaPaymentFlow
          booking={payTarget.booking}
          amount={payTarget.amount}
          onClose={() => setPayTarget(null)}
          onPaid={handlePaymentPaid}
          onViewEsevaPass={(b) => {
            setPayTarget(null);
            setReceiptItem(b);
          }}
        />
      )}

      {/* E-Seva Pass Modal */}
      <Modal
        open={!!receiptItem}
        onClose={() => setReceiptItem(null)}
        title="Temple E-Seva Pass"
        bodyClassName="pooja-receipt-context p-6"
      >
        {receiptItem && (
          <div className="space-y-5 px-1 pb-1">
            <div className="pooja-receipt-shell rounded-2xl border border-border p-6 bg-gradient-to-br from-card to-muted/30 relative overflow-hidden shadow-sm text-slate-900">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-[100px] -z-0 pointer-events-none" />
              <div className="flex items-center justify-between border-b border-border/60 pb-5 mb-5 relative z-10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Booking Receipt</p>
                  <p className="text-2xl font-display font-black text-slate-900 tracking-tight">{receiptItem.receiptNumber}</p>
                </div>
                <StatusBadge status={receiptItem.paymentStatus} />
              </div>
              <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm relative z-10">
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Booking Ref</p><p className="font-bold text-slate-900">{receiptItem.bookingCode}</p></div>
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Date of Seva</p><p className="font-bold text-slate-900">{formatDateDDMMYYYY(receiptItem.date)}</p></div>
                <div className="col-span-2 bg-white/90 p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-slate-300 transition-colors">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600 mb-1">Pooja Configuration</p>
                  <p className="font-bold text-lg text-slate-900 mb-1">{receiptItem.poojaType}</p>
                  <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5 text-slate-500" /> For Devotee: <span className="text-slate-900">{receiptItem.devoteeName}</span></p>
                </div>
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Reporting Time</p><p className="font-bold text-slate-900">{receiptItem.slot}</p></div>
                <div><p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Assigned Purohit</p><p className="font-bold text-slate-900">{receiptItem.priestName}</p></div>
              </div>

              <div className="mt-6 pt-5 border-t-2 border-dashed border-border/80 flex justify-between items-center relative z-10">
                <p className="text-[12px] uppercase tracking-widest font-extrabold text-slate-800">Total Paid Amount</p>
                <p className="text-2xl font-black font-display text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-200">{money(getPoojaDetails(receiptItem.poojaType, poojaCatalog)?.amount || 0)}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-12 font-bold rounded-xl"
                onClick={() => setReceiptItem(null)}
              >
                Dismiss
              </Button>
              <Button
                className="flex-1 h-12 shadow-lg rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Seva Pass
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Delete Booking"
        message="Are you sure you want to permanently delete this booking record?"
      />
    </div>
  );
};

export default PoojaSevaPage;
