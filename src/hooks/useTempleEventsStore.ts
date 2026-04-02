import { useSyncExternalStore } from 'react';

export type TempleProfile = {
  id: string;
  name: string;
  deity: string;
  location: string;
  city: string;
  timings: string;
  contact: string;
  organizer: string;
};

export type TempleEvent = {
  id: string;
  templeId: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  status: 'Planned' | 'Scheduled' | 'In Progress' | 'Completed';
  poojaType: string;
  offerings: string;
  specialPooja: string;
  prasadam: string;
  attendees: number;
  festivalName: string;
};

const templeProfile: TempleProfile = {
  id: 'TH-001',
  name: 'Sri Harmony Temple',
  deity: 'Lord Shiva & Devi',
  location: 'Temple Street, Mylapore',
  city: 'Chennai',
  timings: '05:00 AM - 09:00 PM',
  contact: '+91 98765 12345',
  organizer: 'Temple Management Committee',
};

function buildInitialTempleEvents(): TempleEvent[] {
  const startDate = new Date('2026-04-01T00:00:00');
  const eventTemplates: Array<{ name: string; poojaType: string; specialPooja: string; prasadam: string; offerings: string; festivalName?: string }> = [
    { name: 'Morning Maha Abhishekam', poojaType: 'Abhishekam', specialPooja: 'Rudrabhishekam', prasadam: 'Sakkarai Pongal', offerings: 'Flowers, Bilva Leaves' },
    { name: 'Ganapathi Homam Seva', poojaType: 'Ganapathi Homam', specialPooja: 'Maha Ganapathi Archana', prasadam: 'Modakam', offerings: 'Durva Grass, Coconut' },
    { name: 'Navagraha Shanti Seva', poojaType: 'Navagraha Shanti', specialPooja: 'Navagraha Homam', prasadam: 'Lemon Rice', offerings: 'Sesame Oil, Grains' },
    { name: 'Satyanarayana Pooja', poojaType: 'Satyanarayana Pooja', specialPooja: 'Vishnu Sahasranama Archana', prasadam: 'Kesari', offerings: 'Tulsi, Fruits' },
    { name: 'Pradosham Seva', poojaType: 'Pradosham Pooja', specialPooja: 'Maha Deeparadhana', prasadam: 'Curd Rice', offerings: 'Ghee Deepam, Flowers', festivalName: 'Pradosham' },
    { name: 'Lakshmi Kubera Pooja', poojaType: 'Lakshmi Pooja', specialPooja: 'Kubera Archana', prasadam: 'Sweet Pongal', offerings: 'Lotus, Kumkum' },
    { name: 'Rudra Japam & Homam', poojaType: 'Rudra Japam', specialPooja: 'Rudra Homam, Rudrabhishekam', prasadam: 'Ven Pongal', offerings: 'Honey, Bilva' },
    { name: 'Annadhanam Seva', poojaType: 'Annadhanam Pooja', specialPooja: 'Anna Purna Archana', prasadam: 'Full Meal', offerings: 'Rice, Dal, Vegetables' },
    { name: 'Chandi Homam', poojaType: 'Chandi Homam', specialPooja: 'Durga Archana', prasadam: 'Kesari Bath', offerings: 'Red Flowers, Ghee' },
    { name: 'Pournami Deepa Seva', poojaType: 'Deepa Aradhana', specialPooja: 'Chandra Pooja', prasadam: 'Panchamritam', offerings: 'Oil Lamps, Flowers', festivalName: 'Pournami' },
    { name: 'Hanuman Jayanthi Utsavam', poojaType: 'Hanuman Pooja', specialPooja: 'Sundara Kanda Parayanam', prasadam: 'Vada Mala', offerings: 'Betel Leaves, Butter', festivalName: 'Hanuman Jayanthi' },
    { name: 'Maha Shivaratri Special', poojaType: 'Maha Shivaratri Pooja', specialPooja: 'Lingodbhava Pooja, Rudrabhishekam', prasadam: 'Panakam', offerings: 'Milk, Bilva', festivalName: 'Maha Shivaratri' },
  ];
  const timeSlots = ['05:30', '06:15', '07:00', '08:30', '10:00', '11:30', '17:30', '18:15', '19:00'];

  const events: TempleEvent[] = [];
  let serial = 1;

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + dayOffset);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const perDayCount = dayOffset % 2 === 0 ? 5 : 4;

    for (let i = 0; i < perDayCount; i++) {
      const template = eventTemplates[(dayOffset * 3 + i) % eventTemplates.length];
      const time = timeSlots[(dayOffset + i) % timeSlots.length];
      const isToday = dayOffset === 0;

      events.push({
        id: `TE${String(serial).padStart(3, '0')}`,
        templeId: templeProfile.id,
        name: template.name,
        description: `${template.name} at ${templeProfile.name}. Devotees are welcome for sankalpam and blessings.`,
        date: dateStr,
        time,
        location: templeProfile.location,
        organizer: templeProfile.organizer,
        status: isToday ? 'In Progress' : dayOffset <= 3 ? 'Scheduled' : 'Planned',
        poojaType: template.poojaType,
        offerings: template.offerings,
        specialPooja: template.specialPooja,
        prasadam: template.prasadam,
        attendees: 120 + ((dayOffset * 35 + i * 25) % 420),
        festivalName: template.festivalName || '',
      });
      serial += 1;
    }
  }

  return events;
}

const initialTempleEvents: TempleEvent[] = buildInitialTempleEvents();

let templeEventsState: TempleEvent[] = initialTempleEvents;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return templeEventsState;
}

function nextTempleEventId(items: TempleEvent[]) {
  const max = items.reduce((acc, item) => {
    const m = /^TE(\d+)$/i.exec(item.id);
    if (!m) return acc;
    const n = Number(m[1]);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `TE${String(max + 1).padStart(3, '0')}`;
}

export function useTempleEventsStore() {
  const items = useSyncExternalStore(subscribe, getSnapshot);

  const add = (payload: Omit<TempleEvent, 'id' | 'templeId'>) => {
    const created: TempleEvent = {
      ...payload,
      id: nextTempleEventId(templeEventsState),
      templeId: templeProfile.id,
    };
    templeEventsState = [created, ...templeEventsState];
    emitChange();
    return created;
  };

  const update = (id: string, data: Partial<TempleEvent>) => {
    templeEventsState = templeEventsState.map(item => (item.id === id ? { ...item, ...data } : item));
    emitChange();
  };

  const remove = (id: string) => {
    templeEventsState = templeEventsState.filter(item => item.id !== id);
    emitChange();
  };

  return { templeProfile, items, add, update, remove };
}
