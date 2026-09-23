import { useSyncExternalStore } from 'react';

export interface ProcurementLine {
  name: string;
  quantity: number;
  /** Unit price. */
  price: number;
  /** Set when the line was raised from, or linked to, an inventory item. */
  itemId?: string;
  unit?: string;
}

export interface ProcurementRecord {
  id: string;
  poNumber: string;
  vendor: string;
  amount: number;
  date: string;
  status: string;
  items: ProcurementLine[];
  submittedBy: string;
  submittedByName: string;
  approvedBy: string | null;
  approvedByName?: string | null;
  approvedDate: string | null;
  rejectedBy: string | null;
  rejectedByName?: string | null;
  rejectedDate: string | null;
  rejectionReason: string;
  source?: 'inventory' | 'manual' | 'agent';
  expectedDate?: string;
  notes?: string;
  receivedDate?: string;
}

/** Statuses against which goods can still be received into stock. */
export const RECEIVABLE_PO_STATUSES = ['Approved', 'Partially Received'];
/** Statuses whose unreceived quantity counts as "on order". */
export const OPEN_PO_STATUSES = ['Pending', 'Approved', 'Partially Received'];

const seedProcurements: ProcurementRecord[] = [
  { 
    id: '1', 
    poNumber: 'PO-1042', 
    vendor: 'Sri Pooja Supplies', 
    amount: 45000, 
    date: 'Feb 20, 2026', 
    status: 'Received',
    items: [
      { name: 'Incense Sticks', quantity: 50, price: 500, itemId: 'itm-PJ-002' },
      { name: 'Camphor', quantity: 20, price: 800, itemId: 'itm-PJ-001' }
    ],
    submittedBy: 'manager1',
    submittedByName: 'Ramesh Kumar',
    approvedBy: 'admin1',
    approvedByName: 'Admin User',
    approvedDate: 'Feb 21, 2026',
    rejectedBy: null,
    rejectedDate: null,
    rejectionReason: ''
  },
  { 
    id: '2', 
    poNumber: 'PO-1043', 
    vendor: 'Kitchen World', 
    amount: 120000, 
    date: 'Feb 22, 2026', 
    status: 'Pending',
    items: [
      { name: 'Rice (50kg)', quantity: 10, price: 5000 },
      { name: 'Toor Dal (10kg)', quantity: 5, price: 3000 },
      { name: 'Cooking Oil (15L)', quantity: 2, price: 4000 }
    ],
    submittedBy: 'manager2',
    submittedByName: 'Suresh Yadav',
    approvedBy: null,
    approvedByName: null,
    approvedDate: null,
    rejectedBy: null,
    rejectedDate: null,
    rejectionReason: ''
  },
  { 
    id: '3', 
    poNumber: 'PO-1041', 
    vendor: 'Electrical Corp', 
    amount: 88000, 
    date: 'Feb 18, 2026', 
    status: 'Rejected',
    items: [
      { name: 'LED Lights - 20W', quantity: 20, price: 40000 },
      { name: 'Copper Wires (100m)', quantity: 5, price: 8000 },
      { name: 'Switches', quantity: 15, price: 3000 }
    ],
    submittedBy: 'manager1',
    submittedByName: 'Ramesh Kumar',
    approvedBy: null,
    approvedByName: null,
    approvedDate: null,
    rejectedBy: 'admin1',
    rejectedByName: 'Admin User',
    rejectedDate: 'Feb 19, 2026',
    rejectionReason: 'Budget constraints, please reduce quantity'
  },
  { 
    id: '4', 
    poNumber: 'PO-1044', 
    vendor: 'Flower Mandapam', 
    amount: 35000, 
    date: 'Feb 23, 2026', 
    status: 'Pending',
    items: [
      { name: 'Fresh Roses', quantity: 100, price: 5000 },
      { name: 'Marigold', quantity: 200, price: 8000 },
      { name: 'Jasmine', quantity: 50, price: 4000 }
    ],
    submittedBy: 'manager1',
    submittedByName: 'Ramesh Kumar',
    approvedBy: null,
    approvedByName: null,
    approvedDate: null,
    rejectedBy: null,
    rejectedDate: null,
    rejectionReason: ''
  },
  {
    id: '5',
    poNumber: 'PO-1045',
    vendor: 'Shree Suppliers',
    amount: 2700,
    date: 'Sep 19, 2026',
    status: 'Approved',
    items: [
      { name: 'Camphor', quantity: 60, price: 45, itemId: 'itm-PJ-001' }
    ],
    submittedBy: 'manager1',
    submittedByName: 'Ramesh Kumar',
    approvedBy: 'admin1',
    approvedByName: 'Admin User',
    approvedDate: 'Sep 20, 2026',
    rejectedBy: null,
    rejectedDate: null,
    rejectionReason: '',
    source: 'inventory',
    expectedDate: '2026-09-24'
  },
];

const STORAGE_KEY = 'omg_procurement_v1';

function load(): ProcurementRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fall back to seed data.
  }
  return seedProcurements;
}

let records: ProcurementRecord[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot() {
  if (!records) records = load();
  return records;
}

function commit(next: ProcurementRecord[]) {
  records = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep working in memory.
  }
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const formatPODate = (date = new Date()) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function nextPONumber(items: ProcurementRecord[] = getSnapshot()) {
  const last = items.reduce((max, i) => {
    const n = parseInt(i.poNumber.split('-')[1], 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 1044);
  return `PO-${last + 1}`;
}

export const procurementActions = {
  add(item: ProcurementRecord) {
    const created = { ...item, id: item.id || `po-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
    commit([created, ...getSnapshot()]);
    return created;
  },
  update(id: string, data: Partial<ProcurementRecord>) {
    commit(getSnapshot().map(i => (i.id === id ? { ...i, ...data } : i)));
  },
  remove(id: string) {
    commit(getSnapshot().filter(i => i.id !== id));
  },
};

export function useProcurementStore() {
  const items = useSyncExternalStore(subscribe, getSnapshot);
  return { items, ...procurementActions };
}
