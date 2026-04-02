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
    location: templeProfile.location,
    organizer: templeProfile.organizer,
    status: 'Planned',
    poojaType: '',
    offerings: '',
    specialPooja: '',
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
      location: templeProfile.location,
      organizer: templeProfile.organizer,
      status: 'Planned',
      poojaType: '',
      offerings: '',
      specialPooja: '',
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
      location: item.location,
      organizer: item.organizer,
      status: item.status,
      poojaType: item.poojaType,
      offerings: item.offerings,
      specialPooja: item.specialPooja,
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
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-xl border border-border bg-gradient-to-r from-amber-50/60 via-background to-emerald-50/60 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Temple Events & Poojas</h1>
            <p className="text-sm text-muted-foreground mt-1">Single temple setup: event and pooja updates here are linked dynamically to Pooja & Seva.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}><List className="h-4 w-4" /></button>
              <button onClick={() => setView('calendar')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'calendar' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}><CalendarIcon className="h-4 w-4" /></button>
            </div>
            <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Event</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Temple</p>
            <p className="text-sm font-semibold">{templeProfile.name}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Deity</p>
            <p className="text-sm font-semibold">{templeProfile.deity}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Location</p>
            <p className="text-sm font-semibold truncate">{templeProfile.location}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Contact</p>
            <p className="text-sm font-semibold flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{templeProfile.contact}</p>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="table-container"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Event/Pooja</th>
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Date</th>
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Time</th>
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Pooja Type</th>
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
              <th className="text-right p-3 font-medium text-muted-foreground text-xs">Actions</th>
            </tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium text-foreground text-sm">{item.name}</td>
                  <td className="p-3 text-muted-foreground text-sm">{formatDateDDMMYYYY(item.date)}</td>
                  <td className="p-3 text-muted-foreground text-sm">{formatTime(item.time)}</td>
                  <td className="p-3 text-muted-foreground text-sm">{item.poojaType || '-'}</td>
                  <td className="p-3"><StatusBadge status={item.status} /></td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(item.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      ) : (
        <div className="flex gap-6">
          <div className="w-[60%] bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => <div key={day} className="text-center text-xs font-medium text-muted-foreground">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, i) => {
                const cellEvents = eventsByDate[cell.date] || [];
                const isToday = cell.date === todayStr;
                const isSelected = cell.date === selectedDate;
                const hasFestival = cellEvents.some(event => event.festivalName);
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`aspect-square p-1 rounded-lg transition-all cursor-pointer ${cell.isCurrentMonth ? 'bg-background' : 'bg-muted/20 text-muted-foreground/50'} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''} ${hasFestival ? 'bg-orange-50' : ''} hover:bg-muted/50`}
                  >
                    <div className="h-full flex flex-col">
                      <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                        {cell.day}
                      </span>
                      {cellEvents.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {cellEvents.slice(0, 3).map(event => (
                            <div key={event.id} className={`w-1.5 h-1.5 rounded-full ${event.festivalName ? 'bg-orange-500' : statusDotColors[event.status]}`} title={event.name} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-[40%] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{selectedDate ? formatDateDDMMYYYY(selectedDate) : 'Select a date'}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={openAdd} title="Add temple event">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <button onClick={() => setFilter('all')} className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${filter === 'all' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>All</button>
              <button onClick={() => setFilter('festivals')} className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${filter === 'festivals' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>Festivals</button>
              <button onClick={() => setFilter('daily')} className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${filter === 'daily' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>Daily</button>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredEvents.length > 0 ? filteredEvents.map(event => (
                <div key={event.id} onClick={() => setDetailEvent(event)} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {event.festivalName ? <Star className="h-4 w-4 text-orange-500" /> : <Flower2 className="h-4 w-4 text-orange-500" />}
                      <h4 className="font-medium text-foreground">{event.name}</h4>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><Bell className="h-3 w-3" /><span>{formatTime(event.time)} · {event.poojaType || 'Pooja'}</span></div>
                    <div className="flex items-center gap-2"><Utensils className="h-3 w-3" /><span>Prasadam: {event.prasadam || 'Annadhanam'}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /><span className="truncate">{event.location}</span></div>
                    <div className="flex items-center gap-2"><User className="h-3 w-3" /><span>{event.organizer}</span></div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" onClick={(e) => { e.stopPropagation(); openEdit(event); }}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs flex-1 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(event.id); }}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  </div>
                </div>
              )) : (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Flower2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No events for selected date</p>
                  <Button variant="outline" size="sm" onClick={openAdd}><Plus className="h-3 w-3 mr-1" />Add Event</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetailEvent(null)}>
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-4 border-b border-border">
              <div className="flex-1 pr-2">
                <h3 className="text-base font-semibold text-foreground">{detailEvent.name}</h3>
                <StatusBadge status={detailEvent.status} />
              </div>
              <button onClick={() => setDetailEvent(null)} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"><X className="h-4 w-4" /></button>
            </div>

            <div className="p-4 space-y-3">
              {detailEvent.description && <p className="text-sm text-muted-foreground">{detailEvent.description}</p>}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{formatDateDDMMYYYY(detailEvent.date)}</span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{formatTime(detailEvent.time)}</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{detailEvent.location}</span></div>
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>{detailEvent.organizer}</span></div>
                <div className="flex items-center gap-2"><Flower2 className="h-4 w-4 text-muted-foreground" /><span>Pooja: {detailEvent.poojaType || '-'}</span></div>
              </div>
            </div>

            <div className="flex gap-2 px-4 pb-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDetailEvent(null); setDeleteId(detailEvent.id); }}><Trash2 className="h-3.5 w-3.5 mr-1 text-destructive" />Delete</Button>
              <Button size="sm" className="flex-1" onClick={() => { setDetailEvent(null); openEdit(detailEvent); }}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
            </div>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Temple Event' : 'Add Temple Event'}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Event/Pooja Name" value={form.name} onChange={v => setField('name', v)} required />
          <FormField label="Festival Name (if any)" value={form.festivalName} onChange={v => setField('festivalName', v)} />
          <FormField label="Description" value={form.description} onChange={v => setField('description', v)} />
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <FormField label="Date" value={form.date} onChange={v => setField('date', v)} type="date" />
            <FormField label="Time" value={form.time} onChange={v => setField('time', v)} type="time" />
          </div>
          <FormField label="Pooja Type" value={form.poojaType} onChange={v => setField('poojaType', v)} />
          <FormField label="Prasadam" value={form.prasadam} onChange={v => setField('prasadam', v)} />
          <FormField label="Offerings" value={form.offerings} onChange={v => setField('offerings', v)} />
          <FormField label="Special Poojas" value={form.specialPooja} onChange={v => setField('specialPooja', v)} />
          <FormField label="Location/Temple" value={form.location} onChange={v => setField('location', v)} />
          <FormField label="Organizer" value={form.organizer} onChange={v => setField('organizer', v)} />
          <FormField label="Expected Devotees" value={String(form.attendees)} onChange={v => setField('attendees', Number(v) || 0)} type="number" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select value={form.status} onChange={e => setField('status', e.target.value as EventForm['status'])} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option>Planned</option><option>Scheduled</option><option>In Progress</option><option>Completed</option>
            </select>
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Temple Event" message="Are you sure you want to delete this temple event?" />
    </div>
  );
};

export default EventsPage;
