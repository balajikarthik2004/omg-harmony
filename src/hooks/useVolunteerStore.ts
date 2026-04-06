import { useSyncExternalStore } from 'react';

export type VolunteerStatus = 'Active' | 'On Leave' | 'Inactive' | 'Registered' | 'Assigned';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Expert';

export interface Volunteer {
  id: string;
  name: string;
  contact: string;
  email: string;
  skills: string[];
  availability: string;
  experienceLevel: ExperienceLevel;
  participationCount: number;
  reliabilityScore: number;
  status: VolunteerStatus;
  lastParticipation: string;
  preferredArea?: string; // For HR compatibility
  assignedDutyId?: string; // For HR compatibility
}

export interface CampaignRole {
  name: string;
  required: number;
  assigned: number;
  skills_needed: string[];
}

export interface VolunteerCampaign {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'Festival Support' | 'Annadhanam' | 'Crowd Control' | 'Cleaning' | 'Technical';
  status: 'Draft' | 'Active' | 'Completed';
  roles: CampaignRole[];
  assignedVolunteers: string[]; // volunteer IDs
}

const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 'V-001',
    name: 'Anand Kumar',
    contact: '9876543210',
    email: 'anand.k@example.com',
    skills: ['Crowd Control', 'First Aid'],
    availability: 'Weekends',
    experienceLevel: 'Expert',
    participationCount: 24,
    reliabilityScore: 98,
    status: 'Active',
    lastParticipation: '2026-03-20',
    preferredArea: 'Events Desk'
  },
  {
    id: 'V-002',
    name: 'Lakshmi Priya',
    contact: '8765432109',
    email: 'lakshmi.p@example.com',
    skills: ['Annadhanam', 'Food Service'],
    availability: 'Full Day',
    experienceLevel: 'Intermediate',
    participationCount: 15,
    reliabilityScore: 85,
    status: 'Assigned',
    lastParticipation: '2026-03-25',
    preferredArea: 'Kitchen'
  },
  {
    id: 'V-003',
    name: 'Ramesh Singh',
    contact: '7654321098',
    email: 'ramesh.s@example.com',
    skills: ['Cleaning', 'Logistics'],
    availability: 'Morning',
    experienceLevel: 'Beginner',
    participationCount: 5,
    reliabilityScore: 92,
    status: 'Active',
    lastParticipation: '2026-03-28',
    preferredArea: 'Temple Maintenance'
  },
  {
    id: 'V-004',
    name: 'Suresh Raina',
    contact: '6543210987',
    email: 'suresh.r@example.com',
    skills: ['Technical', 'Sound Setup'],
    availability: 'Evening',
    experienceLevel: 'Intermediate',
    participationCount: 12,
    reliabilityScore: 78,
    status: 'On Leave',
    lastParticipation: '2026-02-15',
    preferredArea: 'Technical'
  },
  {
    id: 'V-005',
    name: 'Deepa Jain',
    contact: '5432109876',
    email: 'deepa.j@example.com',
    skills: ['Queue Management', 'Crowd Control'],
    availability: 'Full Day',
    experienceLevel: 'Expert',
    participationCount: 30,
    reliabilityScore: 95,
    status: 'Active',
    lastParticipation: '2026-04-01',
    preferredArea: 'Crowd Management'
  },
  {
    id: 'V-006',
    name: 'Meena Devi',
    contact: '9000011111',
    email: 'meena@email.com',
    skills: ['Events Desk', 'Administration'],
    availability: 'Weekends',
    experienceLevel: 'Intermediate',
    participationCount: 8,
    reliabilityScore: 88,
    status: 'Assigned',
    lastParticipation: '2026-03-10',
    preferredArea: 'Events Desk',
    assignedDutyId: 'DT003'
  },
  {
    id: 'V-007',
    name: 'Rahul Jain',
    contact: '9000011112',
    email: 'rahul@email.com',
    skills: ['Crowd Management'],
    availability: 'Evenings',
    experienceLevel: 'Beginner',
    participationCount: 2,
    reliabilityScore: 75,
    status: 'Registered',
    lastParticipation: '2026-02-28',
    preferredArea: 'Crowd Management'
  }
];

const INITIAL_CAMPAIGNS: VolunteerCampaign[] = [
  {
    id: 'C-101',
    title: 'Maha Shivaratri 2026',
    description: 'Megafestival support for crowd control, annadhanam and temple maintenance.',
    startDate: '2026-02-26',
    endDate: '2026-02-27',
    type: 'Festival Support',
    status: 'Completed',
    roles: [
      { name: 'Crowd Control', required: 50, assigned: 50, skills_needed: ['Queue Management'] },
      { name: 'Food Service', required: 30, assigned: 30, skills_needed: ['Annadhanam'] }
    ],
    assignedVolunteers: ['V-001', 'V-002', 'V-005']
  },
  {
    id: 'C-102',
    title: 'Weekly Sunday Annadhanam',
    description: 'Weekly food distribution for the needy and pilgrims.',
    startDate: '2026-04-12',
    endDate: '2026-04-12',
    type: 'Annadhanam',
    status: 'Active',
    roles: [
      { name: 'Food Service', required: 10, assigned: 8, skills_needed: ['Annadhanam'] },
      { name: 'Cleaning', required: 5, assigned: 5, skills_needed: ['Cleaning'] }
    ],
    assignedVolunteers: ['V-002', 'V-003']
  },
  {
    id: 'C-103',
    title: 'Pooja Hall Sound Upgrade',
    description: 'Technical assistance for sound system installation.',
    startDate: '2026-04-15',
    endDate: '2026-04-16',
    type: 'Technical',
    status: 'Draft',
    roles: [
      { name: 'Technical Support', required: 3, assigned: 0, skills_needed: ['Technical'] }
    ],
    assignedVolunteers: []
  }
];

let volunteersState: Volunteer[] = INITIAL_VOLUNTEERS;
let campaignsState: VolunteerCampaign[] = INITIAL_CAMPAIGNS;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return volunteersState;
}

function getCampaignSnapshot() {
  return campaignsState;
}

function nextVolunteerId(items: Volunteer[]) {
  const max = items.reduce((acc, item) => {
    const m = /^V-(\d+)$/i.exec(item.id);
    if (!m) return acc;
    const n = Number(m[1]);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `V-${String(max + 1).padStart(3, '0')}`;
}

export function useVolunteerStore() {
  const items = useSyncExternalStore(subscribe, getSnapshot);
  const campaigns = useSyncExternalStore(subscribe, getCampaignSnapshot);

  const add = (payload: Omit<Volunteer, 'id'>) => {
    const created: Volunteer = {
      ...payload,
      id: nextVolunteerId(volunteersState),
    };
    volunteersState = [created, ...volunteersState];
    emitChange();
    return created;
  };

  const update = (id: string, data: Partial<Volunteer>) => {
    volunteersState = volunteersState.map(item => (item.id === id ? { ...item, ...data } : item));
    emitChange();
  };

  const remove = (id: string) => {
    volunteersState = volunteersState.filter(item => item.id !== id);
    emitChange();
  };

  const updateCampaign = (id: string, data: Partial<VolunteerCampaign>) => {
    campaignsState = campaignsState.map(item => (item.id === id ? { ...item, ...data } : item));
    emitChange();
  };

  const addCampaign = (payload: Omit<VolunteerCampaign, 'id'>) => {
    const created: VolunteerCampaign = {
        ...payload,
        id: `C-${Math.floor(Math.random() * 900) + 100}`,
    };
    campaignsState = [created, ...campaignsState];
    emitChange();
    return created;
  };

  return { items, add, update, remove, campaigns, updateCampaign, addCampaign };
}
