import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, CalendarIcon, List, ChevronLeft, ChevronRight, X, MapPin, Clock, User, Calendar, Bell, Flower2, Utensils, Star, Phone } from 'lucide-react';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { type TempleEvent, useTempleEventsStore } from '@/hooks/useTempleEventsStore';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type EventForm = Omit<TempleEvent, 'id' | 'templeId'>;

const EventsPage: React.FC = () => {
  const { templeProfile, items, add, update, remove } = useTempleEventsStore();
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [detailEvent, setDetailEvent] = useState<TempleEvent | null>(null);
  const [filter, setFilter] = useState<'all' | 'festivals' | 'daily'>('all');

  const [form, setForm] = useState<EventForm>({
    name: '',
    description: '',
    date: '',
    time: '',
    organizer: templeProfile.organizer,
    status: 'Planned',
    poojaType: '',
    resourceNeeded: '',
    prasadam: '',
    attendees: 0,
    festivalName: '',
  });

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    setSelectedDate(todayStr);
  }, [todayStr]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const openAdd = () => {
    setForm({
      name: '',
      description: '',
      date: selectedDate || todayStr,
      time: '06:00',
      organizer: templeProfile.organizer,
      status: 'Planned',
      poojaType: '',
      resourceNeeded: '',
      prasadam: '',
      attendees: 0,
      festivalName: '',
    });
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (item: TempleEvent) => {
    setForm({
      name: item.name,
      description: item.description,
      date: item.date,
      time: item.time,
      organizer: item.organizer,
      status: item.status,
      poojaType: item.poojaType,
      resourceNeeded: item.resourceNeeded,
      prasadam: item.prasadam,
      attendees: item.attendees,
      festivalName: item.festivalName,
    });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.date || !form.time) return;
    if (editId) {
      update(editId, form);
    } else {
      add(form);
    }
    setModalOpen(false);
  };

  const setField = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean; date: string }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({ day: d, isCurrentMonth: false, date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, isCurrentMonth: true, date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      days.push({ day: d, isCurrentMonth: false, date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }

    return days;
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, TempleEvent[]> = {};
    items.forEach(item => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [items]);

  const statusDotColors: Record<TempleEvent['status'], string> = {
    Scheduled: 'bg-secondary',
    Planned: 'bg-accent',
    'In Progress': 'bg-primary',
    Completed: 'bg-muted-foreground',
  };

  const selectedDateEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const filteredEvents = selectedDateEvents.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'festivals') return Boolean(item.festivalName);
    if (filter === 'daily') return !item.festivalName;
    return true;
  });

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="events-premium space-y-6 max-w-[1500px] mx-auto">
      <div className="page-header-banner events-header">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Temple Events & Poojas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage daily poojas, festivals, and specialized temple gatherings dynamically.</p>
        </div>
        <div className="events-view-toggle flex bg-muted/80 backdrop-blur-sm rounded-lg p-1 border border-border/60">
          <button onClick={() => setView('list')} className={`events-view-btn px-4 py-2 text-sm rounded-md transition-all font-medium ${view === 'list' ? 'events-view-btn-active bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>List View</button>
          <button onClick={() => setView('calendar')} className={`events-view-btn px-4 py-2 text-sm rounded-md transition-all font-medium ${view === 'calendar' ? 'events-view-btn-active bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Calendar</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
        <div className="stat-card events-stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Temple</p>
          <p className="text-sm font-bold text-foreground truncate">{templeProfile.name}</p>
        </div>
        <div className="stat-card events-stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Deity</p>
          <p className="text-sm font-bold text-foreground truncate">{templeProfile.deity}</p>
        </div>
        <div className="stat-card events-stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Location</p>
          <p className="text-sm font-bold text-foreground truncate">{templeProfile.location}</p>
        </div>
        <div className="stat-card events-stat-card flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Contact</p>
            <p className="text-sm font-bold text-foreground truncate">{templeProfile.contact}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="section-panel events-list-panel animate-slide-up">
          <div className="section-panel-header gap-4">
            <h2 className="text-base font-semibold">All Events List</h2>
            <Button onClick={openAdd} className="shadow-md hover:shadow-lg"><Plus className="h-4 w-4 mr-2" />Add Event</Button>
          </div>
          <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-xs whitespace-nowrap">Event/Pooja</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs whitespace-nowrap">Date & Time</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs whitespace-nowrap">Pooja Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs whitespace-nowrap">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-xs whitespace-nowrap">Actions</th>
              </tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      {item.festivalName && <p className="text-[11px] text-orange-600 mt-0.5 inline-flex items-center gap-1"><Star className="h-3 w-3" />{item.festivalName}</p>}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <p className="font-medium text-foreground text-xs">{formatDateDDMMYYYY(item.date)}</p>
                      <p className="text-[11px] mt-0.5">{formatTime(item.time)}</p>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs"><span className="bg-muted px-2 py-1 rounded-md">{item.poojaType || 'General'}</span></td>
                    <td className="p-4"><StatusBadge status={item.status} /></td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 animate-slide-up">
          <div className="flex-1 section-panel events-calendar-panel p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {MONTHS[currentDate.getMonth()]} <span className="text-primary">{currentDate.getFullYear()}</span>
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-sm hover:translate-y-[-1px] transition-transform" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-sm hover:translate-y-[-1px] transition-transform" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {DAYS.map((day, ix) => <div key={ix} className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, i) => {
                const cellEvents = eventsByDate[cell.date] || [];
                const isToday = cell.date === todayStr;
                const isSelected = cell.date === selectedDate;
                const hasFestival = cellEvents.some(event => event.festivalName);
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`aspect-square p-1.5 rounded-xl transition-all cursor-pointer border ${cell.isCurrentMonth ? 'bg-background hover:bg-muted/30 border-border/40' : 'bg-muted/10 text-muted-foreground/40 border-transparent'} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-card shadow-sm border-transparent' : ''} ${hasFestival && cell.isCurrentMonth ? 'bg-gradient-to-br from-orange-50 to-background border-orange-100' : ''}`}
                  >
                    <div className="h-full flex flex-col justify-between">
                      <span className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full self-end ${isToday ? 'bg-primary text-primary-foreground shadow-sm' : ''}`}>
                        {cell.day}
                      </span>
                      {cellEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {cellEvents.slice(0, 3).map(event => (
                            <div key={event.id} className={`w-1.5 h-1.5 rounded-full shadow-sm ${event.festivalName ? 'bg-orange-500' : statusDotColors[event.status]}`} title={event.name} />
                          ))}
                          {cellEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" title="More events" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-[400px] flex flex-col gap-4">
            <div className="section-panel events-day-panel p-5 min-h-[550px] flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedDate ? formatDateDDMMYYYY(selectedDate) : 'Select a date'}</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{filteredEvents.length} events scheduled</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 shadow-sm hover:shadow-md" onClick={openAdd} title="Add event">
                  <Plus className="h-3 w-3 mr-1.5" /> Add
                </Button>
              </div>

              <div className="flex gap-2 w-full mb-5">
                {[
                  { key: 'all' as const, label: 'All', color: 'bg-blue-600 border-blue-700' },
                  { key: 'festivals' as const, label: 'Festivals', color: 'bg-orange-600 border-orange-700' },
                  { key: 'daily' as const, label: 'Daily Pooja', color: 'bg-emerald-600 border-emerald-700' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key)}
                    className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-xl border-2 transition-all duration-200 shadow-sm
                      ${filter === item.key 
                        ? `${item.color} text-white shadow-md scale-[1.03]` 
                        : 'bg-background border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted/40'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {filteredEvents.length > 0 ? filteredEvents.map(event => (
                  <div key={event.id} onClick={() => setDetailEvent(event)} className="events-event-card bg-background border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden">
                    {event.festivalName && <div className="absolute top-0 right-0 w-12 h-12 bg-orange-100/50 rounded-bl-full -z-0" />}
                    <div className="relative z-10">
                      <div className="flex gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${event.festivalName ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                          {event.festivalName ? <Star className="h-4 w-4" /> : <Flower2 className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm leading-tight pr-4">{event.name}</h4>
                          <p className="text-[11px] font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> {formatTime(event.time)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                        <div className="flex items-center gap-1.5"><Bell className="h-3 w-3 shrink-0" /><span className="truncate">{event.poojaType || 'Pooja'}</span></div>
                        <div className="flex items-center gap-1.5"><Utensils className="h-3 w-3 shrink-0" /><span className="truncate">{event.prasadam || 'Annadhanam'}</span></div>
                        <div className="col-span-2 flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{event.location}</span></div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/10">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No events planned</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Nothing scheduled for {selectedDate ? formatDateDDMMYYYY(selectedDate) : 'this date'}.</p>
                    <Button variant="outline" size="sm" onClick={openAdd} className="bg-background"><Plus className="h-3.5 w-3.5 mr-1.5" />Add New Event</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {detailEvent && (
        <div className="modal-overlay" onClick={() => setDetailEvent(null)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="relative p-6 pt-8 bg-gradient-to-br from-primary/5 to-background border-b border-border/60">
              <button onClick={() => setDetailEvent(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"><X className="h-4 w-4" /></button>

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm border ${detailEvent.festivalName ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-primary text-primary-foreground border-primary'}`}>
                {detailEvent.festivalName ? <Star className="h-6 w-6" /> : <Flower2 className="h-6 w-6" />}
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2 leading-tight">{detailEvent.name}</h3>
              <StatusBadge status={detailEvent.status} />
            </div>

            <div className="p-6 space-y-4">
              {detailEvent.description && (
                <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{detailEvent.description}"</p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><Calendar className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Date & Time</p>
                    <p className="text-sm font-medium text-foreground">{formatDateDDMMYYYY(detailEvent.date)} at {formatTime(detailEvent.time)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-emerald-600" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Resources Needed</p>
                    <p className="text-sm font-medium text-foreground">{detailEvent.resourceNeeded || 'None'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><User className="h-4 w-4 text-blue-600" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Organizer</p>
                    <p className="text-sm font-medium text-foreground">{detailEvent.organizer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><Flower2 className="h-4 w-4 text-accent" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Pooja Type</p>
                    <p className="text-sm font-medium text-foreground">{detailEvent.poojaType || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 bg-muted/20 border-t border-border/60">
              <Button variant="outline" className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all font-medium" onClick={() => { setDetailEvent(null); setDeleteId(detailEvent.id); }}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
              <Button className="flex-1 shadow-md hover:shadow-lg font-medium" onClick={() => { setDetailEvent(null); openEdit(detailEvent); }}><Pencil className="h-4 w-4 mr-2" />Edit</Button>
            </div>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Temple Event' : 'Add Temple Event'}>
        <div className="space-y-4 px-1">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Event/Pooja Name" value={form.name} onChange={v => setField('name', v)} required />
            <FormField label="Festival Name (if any)" value={form.festivalName} onChange={v => setField('festivalName', v)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)} className="w-full rounded-lg border border-input bg-background/60 hover:border-border px-3 py-2 text-sm min-h-[60px] resize-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Provide extra details for devotees..." />
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-border/60 py-4 my-2">
            <FormField label="Date" value={form.date} onChange={v => setField('date', v)} type="date" />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Time</label>
              <input type="time" value={form.time} onChange={e => setField('time', e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <FormField label="Organizer Name" value={form.organizer} onChange={v => setField('organizer', v)} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select value={form.status} onChange={e => setField('status', e.target.value as EventForm['status'])} className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                <option>Planned</option><option>Scheduled</option><option>In Progress</option><option>Completed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Expected Devotees</label>
              <input type="number" value={String(form.attendees)} onChange={e => setField('attendees', Number(e.target.value) || 0)} className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border px-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Pooja Type" value={form.poojaType} onChange={v => setField('poojaType', v)} placeholder="E.g. Abhishekam" />
            <FormField label="Prasadam Planned" value={form.prasadam} onChange={v => setField('prasadam', v)} placeholder="E.g. Puliyodarai" />
            <div className="col-span-2">
              <FormField label="Resource Needed" value={form.resourceNeeded} onChange={v => setField('resourceNeeded', v)} placeholder="E.g. 5kg Milk, 2kg Flowers" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border/60">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 py-5">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 py-5 shadow-md">Save Event</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Temple Event" message="Are you absolutely sure you want to delete this temple event? This action will remove it from the public calendar." />
    </div>
  );
};

export default EventsPage;
