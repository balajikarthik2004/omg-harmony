import { useSyncExternalStore } from 'react';
import {
  mockProcurements,
  type ProcurementLine,
  type ProcurementRecord,
} from '@/data/mockData';

export type { ProcurementLine, ProcurementRecord };

/** Statuses against which goods can still be received into stock. */
export const RECEIVABLE_PO_STATUSES = ['Approved', 'Partially Received'];
/** Statuses whose unreceived quantity counts as "on order". */
export const OPEN_PO_STATUSES = ['Pending', 'Approved', 'Partially Received'];

const STORAGE_KEY = 'omg_procurement_v1';

function syncMockData(records: ProcurementRecord[]) {
  mockProcurements.length = 0;
  mockProcurements.push(...records);
}

function load(): ProcurementRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        syncMockData(parsed);
        return parsed;
      }
    }
  } catch {
    // Fall back to mockData seed.
  }
  return mockProcurements;
}

let records: ProcurementRecord[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot() {
  if (!records) records = load();
  return records;
}

function commit(next: ProcurementRecord[]) {
  records = next;
  syncMockData(next);
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
