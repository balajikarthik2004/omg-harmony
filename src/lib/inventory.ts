import { toISODate } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Masters                                                             */
/* ------------------------------------------------------------------ */

export type StoreId = 'MAIN' | 'KITCHEN' | 'SANCTUM';

export const STORES: { id: StoreId; name: string; short: string }[] = [
  { id: 'MAIN', name: 'Main Store', short: 'Main' },
  { id: 'KITCHEN', name: 'Kitchen Store', short: 'Kitchen' },
  { id: 'SANCTUM', name: 'Sanctum Store', short: 'Sanctum' },
];

export const storeName = (id: string) => STORES.find(s => s.id === id)?.name ?? id;

/** Who each store serves - shown wherever an approver has to pick one. */
export const STORE_PURPOSE: Record<StoreId, string> = {
  MAIN: 'Bulk & general stock',
  KITCHEN: 'Madapalli, prasadam & annadhanam',
  SANCTUM: 'Pooja, abhishekam & alankaram',
};

export const CATEGORIES: { name: string; prefix: string }[] = [
  { name: 'Pooja Items', prefix: 'PJ' },
  { name: 'Lamps & Oil', prefix: 'LO' },
  { name: 'Abhishekam', prefix: 'AB' },
  { name: 'Flowers & Garlands', prefix: 'FL' },
  { name: 'Kitchen & Prasadam', prefix: 'KT' },
  { name: 'Cleaning & Maintenance', prefix: 'CM' },
];

export const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'pkt', 'box', 'bundle', 'dozen', 'tin', 'roll'];

/** Units that cannot be split when counting or issuing. */
export const WHOLE_UNITS = new Set(['pcs', 'pkt', 'box', 'bundle', 'dozen', 'tin', 'roll']);

export const ISSUE_PURPOSES = [
  'Daily Pooja', 'Abhishekam', 'Alankaram', 'Homam', 'Annadhanam',
  'Prasadam Kitchen', 'Festival / Event', 'Maintenance', 'Other',
];

export const ADJUST_REASONS = ['Physical count correction', 'Data entry correction', 'Found / excess stock', 'Theft / missing'];
export const WASTAGE_REASONS = ['Expired', 'Damaged / spoiled', 'Spillage', 'Pest damage', 'Quality rejected'];

/** Items with a shelf life shorter than this are "fresh goods" - bought daily, not expiry-tracked in alerts. */
export const FRESH_SHELF_DAYS = 14;
export const EXPIRY_WARNING_DAYS = 15;

/* ------------------------------------------------------------------ */
/* Records                                                             */
/* ------------------------------------------------------------------ */

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  localName: string;
  category: string;
  unit: string;
  minStock: number;
  reorderLevel: number;
  maxStock: number;
  unitCost: number;
  defaultStore: StoreId;
  supplier: string;
  leadTimeDays: number;
  perishable: boolean;
  shelfLifeDays: number | null;
  active: boolean;
  createdAt: string;
  notes: string;
}

export type MovementType =
  | 'OPENING' | 'RECEIPT' | 'DONATION' | 'ISSUE'
  | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUSTMENT' | 'WASTAGE';

export const MOVEMENT_META: Record<MovementType, { label: string; prefix: string; direction: 'in' | 'out' | 'both' }> = {
  OPENING: { label: 'Opening stock', prefix: 'OPN', direction: 'in' },
  RECEIPT: { label: 'Received', prefix: 'GRN', direction: 'in' },
  DONATION: { label: 'Donation', prefix: 'DON', direction: 'in' },
  ISSUE: { label: 'Issued', prefix: 'ISS', direction: 'out' },
  TRANSFER_OUT: { label: 'Moved out', prefix: 'TRF', direction: 'out' },
  TRANSFER_IN: { label: 'Moved in', prefix: 'TRF', direction: 'in' },
  ADJUSTMENT: { label: 'Correction', prefix: 'ADJ', direction: 'both' },
  WASTAGE: { label: 'Written off', prefix: 'WST', direction: 'out' },
};

export interface StockMovement {
  id: string;
  refNo: string;
  date: string; // ISO datetime
  type: MovementType;
  itemId: string;
  store: StoreId;
  /** Signed: positive = into the store, negative = out of it. */
  qty: number;
  unitCost: number;
  batchNo: string;
  expiryDate: string | null; // yyyy-mm-dd
  purpose?: string;
  reason?: string;
  /** Supplier, donor, receiving department or counter-store - whoever is on the other side. */
  party?: string;
  poId?: string;
  poNumber?: string;
  invoiceNo?: string;
  donorPhone?: string;
  receiptNo?: string;
  templateId?: string;
  countId?: string;
  user: string;
  notes?: string;
}

export interface StockCountLine {
  itemId: string;
  systemQty: number;
  countedQty: number | null;
}

export type StockCountStatus = 'In Progress' | 'Submitted' | 'Approved' | 'Cancelled';

export interface StockCount {
  id: string;
  refNo: string;
  store: StoreId;
  status: StockCountStatus;
  createdAt: string;
  createdBy: string;
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  adjustmentRef?: string;
  notes: string;
  lines: StockCountLine[];
}

export interface SevaTemplateLine {
  itemId: string;
  qty: number;
}

export interface SevaTemplate {
  id: string;
  name: string;
  kind: 'Seva' | 'Annadhanam' | 'Prasadam';
  /** Line quantities are per this many units (1 seva, 100 meals ...). */
  basisQty: number;
  basisLabel: string;
  purpose: string;
  store: StoreId;
  lines: SevaTemplateLine[];
}

export type StockRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface StockRequestLine {
  itemId: string;
  qty: number;
}

/** A request to use stock. Nothing leaves the store until an admin approves it. */
export interface StockRequest {
  id: string;
  refNo: string;
  status: StockRequestStatus;
  store: StoreId;
  purpose: string;
  party: string;
  templateId?: string;
  notes?: string;
  lines: StockRequestLine[];
  requestedAt: string;
  requestedBy: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNote?: string;
  /** What was actually issued, set only when the approver changed the request. */
  approvedStore?: StoreId;
  approvedLines?: StockRequestLine[];
  issueRef?: string;
}

export interface InventoryState {
  version: number;
  items: InventoryItem[];
  movements: StockMovement[];
  counts: StockCount[];
  templates: SevaTemplate[];
  requests: StockRequest[];
  counters: Record<string, number>;
}

export const STATE_VERSION = 1;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function uid(prefix = 'id') {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `${prefix}-${rand}`;
}

export function fmtQty(n: number) {
  return round3(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function fmtMoney(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function fmtDate(iso?: string | null) {
  if (!iso) return '-';
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(iso?: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysBetween(fromISO: string, to: Date) {
  const from = new Date(fromISO.length === 10 ? `${fromISO}T00:00:00` : fromISO);
  const start = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((from.getTime() - start.getTime()) / 86400000);
}

/** Indian financial year label, April to March: 2026-09-23 -> "26-27". */
export function fyLabel(date: Date) {
  const y = date.getFullYear() % 100;
  return date.getMonth() >= 3
    ? `${String(y).padStart(2, '0')}-${String((y + 1) % 100).padStart(2, '0')}`
    : `${String((y + 99) % 100).padStart(2, '0')}-${String(y).padStart(2, '0')}`;
}

export function nextRef(counters: Record<string, number>, prefix: string, date = new Date()) {
  const fy = fyLabel(date);
  const key = `${prefix}/${fy}`;
  const n = (counters[key] ?? 0) + 1;
  return { refNo: `${prefix}/${fy}/${String(n).padStart(4, '0')}`, counters: { ...counters, [key]: n } };
}

export function nextItemCode(items: InventoryItem[], category: string) {
  const prefix = CATEGORIES.find(c => c.name === category)?.prefix ?? 'GN';
  const max = items.reduce((acc, item) => {
    const m = new RegExp(`^${prefix}-(\\d+)$`).exec(item.code);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

/* ------------------------------------------------------------------ */
/* Derived stock position                                              */
/* ------------------------------------------------------------------ */

export type StockStatus = 'Out of Stock' | 'Critical' | 'Low Stock' | 'Healthy' | 'Overstock';

export const STATUS_ORDER: StockStatus[] = ['Out of Stock', 'Critical', 'Low Stock', 'Healthy', 'Overstock'];

export function getStockStatus(item: Pick<InventoryItem, 'minStock' | 'reorderLevel' | 'maxStock'>, onHand: number): StockStatus {
  if (onHand <= 0) return 'Out of Stock';
  if (onHand < item.minStock) return 'Critical';
  if (onHand <= item.reorderLevel) return 'Low Stock';
  if (onHand > item.maxStock) return 'Overstock';
  return 'Healthy';
}

export const needsReorder = (status: StockStatus) => status === 'Out of Stock' || status === 'Critical' || status === 'Low Stock';

export interface BatchBalance {
  itemId: string;
  store: StoreId;
  batchNo: string;
  expiryDate: string | null;
  qty: number;
  unitCost: number;
  receivedAt: string;
}

export interface ItemSummary {
  onHand: number;
  byStore: Record<StoreId, number>;
  /** Stock that can be issued: on hand minus expired batches. */
  usableByStore: Record<StoreId, number>;
  batches: BatchBalance[];
  avgCost: number;
  value: number;
  used30: number;
  avgDaily: number;
  daysCover: number | null;
  lastMovement: string | null;
  status: StockStatus;
  nearestExpiry: string | null;
  expiredQty: number;
  expiringQty: number;
}

const INFLOW_VALUED: MovementType[] = ['OPENING', 'RECEIPT', 'DONATION'];

export function computeSummaries(state: InventoryState, now = new Date()): Record<string, ItemSummary> {
  const today = toISODate(now);
  const warnUntil = toISODate(addDays(now, EXPIRY_WARNING_DAYS));
  const since30 = addDays(now, -30).toISOString();

  const batchMap = new Map<string, BatchBalance>();
  const agg = new Map<string, { inQty: number; inValue: number; used30: number; last: string | null }>();

  for (const m of state.movements) {
    const key = `${m.itemId}|${m.store}|${m.batchNo}`;
    let b = batchMap.get(key);
    if (!b) {
      b = { itemId: m.itemId, store: m.store, batchNo: m.batchNo, expiryDate: m.expiryDate, qty: 0, unitCost: m.unitCost, receivedAt: m.date };
      batchMap.set(key, b);
    }
    b.qty = round3(b.qty + m.qty);

    let a = agg.get(m.itemId);
    if (!a) { a = { inQty: 0, inValue: 0, used30: 0, last: null }; agg.set(m.itemId, a); }
    if (INFLOW_VALUED.includes(m.type) && m.qty > 0) {
      a.inQty += m.qty;
      a.inValue += m.qty * m.unitCost;
    }
    if ((m.type === 'ISSUE' || m.type === 'WASTAGE') && m.date >= since30) a.used30 += -m.qty;
    if (!a.last || m.date > a.last) a.last = m.date;
  }

  const byItem = new Map<string, BatchBalance[]>();
  for (const b of batchMap.values()) {
    if (b.qty <= 0.0001) continue;
    const list = byItem.get(b.itemId) ?? [];
    list.push(b);
    byItem.set(b.itemId, list);
  }

  const result: Record<string, ItemSummary> = {};
  for (const item of state.items) {
    const batches = (byItem.get(item.id) ?? []).sort(fefoCompare);
    const byStore = { MAIN: 0, KITCHEN: 0, SANCTUM: 0 } as Record<StoreId, number>;
    const usableByStore = { MAIN: 0, KITCHEN: 0, SANCTUM: 0 } as Record<StoreId, number>;
    let expiredQty = 0;
    let expiringQty = 0;
    let nearestExpiry: string | null = null;
    const trackExpiry = item.perishable && (item.shelfLifeDays ?? 0) >= FRESH_SHELF_DAYS;
    for (const b of batches) {
      byStore[b.store] = round3(byStore[b.store] + b.qty);
      if (!b.expiryDate || b.expiryDate >= today) usableByStore[b.store] = round3(usableByStore[b.store] + b.qty);
      if (b.expiryDate) {
        if (b.expiryDate < today) expiredQty += b.qty;
        else if (trackExpiry && b.expiryDate <= warnUntil) expiringQty += b.qty;
        if (b.expiryDate >= today && (!nearestExpiry || b.expiryDate < nearestExpiry)) nearestExpiry = b.expiryDate;
      }
    }
    const onHand = round3(byStore.MAIN + byStore.KITCHEN + byStore.SANCTUM);
    const a = agg.get(item.id);
    const avgCost = a && a.inQty > 0 ? a.inValue / a.inQty : item.unitCost;
    const used30 = round3(a?.used30 ?? 0);
    const avgDaily = used30 / 30;
    result[item.id] = {
      onHand,
      byStore,
      usableByStore,
      batches,
      avgCost,
      value: onHand * avgCost,
      used30,
      avgDaily,
      daysCover: avgDaily > 0 ? onHand / avgDaily : null,
      lastMovement: a?.last ?? null,
      status: getStockStatus(item, onHand),
      nearestExpiry,
      expiredQty: round3(expiredQty),
      expiringQty: round3(expiringQty),
    };
  }
  return result;
}

function fefoCompare(a: BatchBalance, b: BatchBalance) {
  if (a.expiryDate && b.expiryDate && a.expiryDate !== b.expiryDate) return a.expiryDate < b.expiryDate ? -1 : 1;
  if (a.expiryDate && !b.expiryDate) return -1;
  if (!a.expiryDate && b.expiryDate) return 1;
  return a.receivedAt < b.receivedAt ? -1 : a.receivedAt > b.receivedAt ? 1 : 0;
}

/** First-expiry-first-out allocation of `qty` across a store's batches. Throws if short. */
/** Picks batches first-expiry-first. Expired batches are never issued; only a write-off may take them. */
export function allocateFEFO(batches: BatchBalance[], store: StoreId, qty: number, itemName = 'item', includeExpired = false) {
  const today = toISODate(new Date());
  const pool = batches
    .filter(b => b.store === store && b.qty > 0 && (includeExpired || !b.expiryDate || b.expiryDate >= today))
    .sort(fefoCompare);
  const available = round3(pool.reduce((s, b) => s + b.qty, 0));
  if (qty > available + 0.0001) {
    throw new Error(`Only ${fmtQty(available)} of ${itemName} available in ${storeName(store)}${includeExpired ? '' : ' (expired stock excluded)'}; ${fmtQty(qty)} requested.`);
  }
  const picks: { batch: BatchBalance; qty: number }[] = [];
  let remaining = qty;
  for (const batch of pool) {
    if (remaining <= 0.0001) break;
    const take = round3(Math.min(batch.qty, remaining));
    picks.push({ batch, qty: take });
    remaining = round3(remaining - take);
  }
  return picks;
}

export function suggestedOrderQty(item: InventoryItem, onHand: number, onOrder: number) {
  const raw = Math.max(0, item.maxStock - onHand - onOrder);
  return WHOLE_UNITS.has(item.unit) ? Math.ceil(raw) : Math.ceil(raw * 10) / 10;
}

/** Quantity already received into stock against each item of a PO. */
export function receivedAgainstPO(state: InventoryState, poId: string) {
  const map: Record<string, number> = {};
  for (const m of state.movements) {
    if (m.poId === poId && m.qty > 0) map[m.itemId] = round3((map[m.itemId] ?? 0) + m.qty);
  }
  return map;
}

/** The inventory item a PO line refers to: its linked id, else an active item with exactly the same name. */
export function matchPOLineItem(items: InventoryItem[], line: { name: string; itemId?: string }) {
  if (line.itemId && items.some(i => i.id === line.itemId)) return line.itemId;
  const n = line.name.trim().toLowerCase();
  if (!n) return '';
  return items.find(i => i.active && i.name.trim().toLowerCase() === n)?.id ?? '';
}

/* ------------------------------------------------------------------ */
/* Transactions - pure reducers; each returns the next state           */
/* ------------------------------------------------------------------ */

/** Best-guess category for a PO line that is not yet in the item master. */
export function guessCategory(name: string) {
  const n = name.toLowerCase();
  if (/flower|rose|marigold|jasmine|garland/.test(n)) return 'Flowers & Garlands';
  if (/rice|dal|oil|sugar|ghee|kitchen|provisions|jaggery|vegetable/.test(n)) return 'Kitchen & Prasadam';
  if (/milk|curd|honey|panchamrit|abhishekam/.test(n)) return 'Abhishekam';
  if (/lamp|wick|deepam/.test(n)) return 'Lamps & Oil';
  if (/clean|soap|light|wire|switch|maintenance|broom|phenyl/.test(n)) return 'Cleaning & Maintenance';
  return 'Pooja Items';
}

const CATEGORY_STORE: Record<string, StoreId> = {
  'Kitchen & Prasadam': 'KITCHEN',
  'Pooja Items': 'SANCTUM',
  Abhishekam: 'SANCTUM',
  'Flowers & Garlands': 'SANCTUM',
  'Lamps & Oil': 'MAIN',
  'Cleaning & Maintenance': 'MAIN',
};

/** The store a PO line goes to: the approved choice, else the item's home store, else a guess from its name. */
export function suggestedStore(items: InventoryItem[], line: { name: string; itemId?: string; store?: StoreId }): StoreId {
  if (line.store) return line.store;
  const item = items.find(i => i.id === matchPOLineItem(items, line));
  return item?.defaultStore ?? CATEGORY_STORE[guessCategory(line.name)] ?? 'MAIN';
}

type Result = { state: InventoryState; refNo: string };

const itemOf = (state: InventoryState, itemId: string) => {
  const item = state.items.find(i => i.id === itemId);
  if (!item) throw new Error('Unknown item.');
  return item;
};

const assertQty = (qty: number, label: string) => {
  if (!Number.isFinite(qty) || qty <= 0) throw new Error(`${label}: quantity must be greater than zero.`);
};

export interface ReceiveLine { itemId: string; qty: number; unitCost: number; batchNo?: string; expiryDate?: string | null }
export interface ReceiveInput {
  type: 'RECEIPT' | 'DONATION' | 'OPENING';
  store: StoreId;
  date?: string;
  lines: ReceiveLine[];
  party?: string;
  invoiceNo?: string;
  poId?: string;
  poNumber?: string;
  donorPhone?: string;
  receiptNo?: string;
  notes?: string;
  user: string;
}

export function receiveStock(state: InventoryState, input: ReceiveInput): Result {
  if (!input.lines.length) throw new Error('Add at least one line.');
  const date = input.date ?? new Date().toISOString();
  const { refNo, counters } = nextRef(state.counters, MOVEMENT_META[input.type].prefix, new Date(date));
  const rows: StockMovement[] = input.lines.map(line => {
    const item = itemOf(state, line.itemId);
    assertQty(line.qty, item.name);
    if (line.unitCost < 0) throw new Error(`${item.name}: cost cannot be negative.`);
    const expiry = line.expiryDate || (item.perishable && item.shelfLifeDays
      ? toISODate(addDays(new Date(date), item.shelfLifeDays)) : null);
    return {
      id: uid('mv'), refNo, date, type: input.type, itemId: item.id, store: input.store,
      qty: round3(line.qty), unitCost: line.unitCost, batchNo: line.batchNo?.trim() || refNo, expiryDate: expiry,
      party: input.party, invoiceNo: input.invoiceNo, poId: input.poId, poNumber: input.poNumber,
      donorPhone: input.donorPhone, receiptNo: input.receiptNo, user: input.user, notes: input.notes,
    };
  });
  return { state: { ...state, counters, movements: [...state.movements, ...rows] }, refNo };
}

export interface IssueInput {
  store: StoreId;
  lines: { itemId: string; qty: number }[];
  purpose: string;
  party?: string;
  templateId?: string;
  notes?: string;
  user: string;
  date?: string;
}

export function issueStock(state: InventoryState, input: IssueInput): Result {
  const lines = input.lines.filter(l => l.qty > 0);
  if (!lines.length) throw new Error('Add at least one line with a quantity.');
  const summaries = computeSummaries(state);
  const date = input.date ?? new Date().toISOString();
  const { refNo, counters } = nextRef(state.counters, 'ISS', new Date(date));
  const rows: StockMovement[] = [];
  const merged = new Map<string, number>();
  lines.forEach(l => merged.set(l.itemId, round3((merged.get(l.itemId) ?? 0) + l.qty)));
  for (const [itemId, qty] of merged) {
    const item = itemOf(state, itemId);
    for (const pick of allocateFEFO(summaries[itemId].batches, input.store, qty, item.name)) {
      rows.push({
        id: uid('mv'), refNo, date, type: 'ISSUE', itemId, store: input.store, qty: -pick.qty,
        unitCost: pick.batch.unitCost, batchNo: pick.batch.batchNo, expiryDate: pick.batch.expiryDate,
        purpose: input.purpose, party: input.party, templateId: input.templateId, user: input.user, notes: input.notes,
      });
    }
  }
  return { state: { ...state, counters, movements: [...state.movements, ...rows] }, refNo };
}

export interface TransferInput {
  from: StoreId;
  to: StoreId;
  lines: { itemId: string; qty: number }[];
  notes?: string;
  user: string;
}

export function transferStock(state: InventoryState, input: TransferInput): Result {
  if (input.from === input.to) throw new Error('Choose two different stores.');
  const merged = new Map<string, number>();
  input.lines.filter(l => l.qty > 0).forEach(l => merged.set(l.itemId, round3((merged.get(l.itemId) ?? 0) + l.qty)));
  const lines = [...merged].map(([itemId, qty]) => ({ itemId, qty }));
  if (!lines.length) throw new Error('Add at least one line with a quantity.');
  const summaries = computeSummaries(state);
  const date = new Date().toISOString();
  const { refNo, counters } = nextRef(state.counters, 'TRF');
  const rows: StockMovement[] = [];
  for (const line of lines) {
    const item = itemOf(state, line.itemId);
    for (const pick of allocateFEFO(summaries[item.id].batches, input.from, line.qty, item.name)) {
      const base = { refNo, date, itemId: item.id, unitCost: pick.batch.unitCost, batchNo: pick.batch.batchNo, expiryDate: pick.batch.expiryDate, user: input.user, notes: input.notes };
      rows.push({ ...base, id: uid('mv'), type: 'TRANSFER_OUT', store: input.from, qty: -pick.qty, party: storeName(input.to) });
      rows.push({ ...base, id: uid('mv'), type: 'TRANSFER_IN', store: input.to, qty: pick.qty, party: storeName(input.from) });
    }
  }
  return { state: { ...state, counters, movements: [...state.movements, ...rows] }, refNo };
}

export interface AdjustInput {
  type: 'ADJUSTMENT' | 'WASTAGE';
  store: StoreId;
  itemId: string;
  /** Signed change. Wastage is always negative. */
  delta: number;
  reason: string;
  batchNo?: string;
  countId?: string;
  notes?: string;
  user: string;
}

function adjustmentRows(state: InventoryState, summaries: Record<string, ItemSummary>, input: AdjustInput, refNo: string, date: string): StockMovement[] {
  const item = itemOf(state, input.itemId);
  const delta = round3(input.type === 'WASTAGE' ? -Math.abs(input.delta) : input.delta);
  if (!delta) throw new Error(`${item.name}: no change to post.`);
  const base = { refNo, date, type: input.type, itemId: item.id, store: input.store, reason: input.reason, countId: input.countId, user: input.user, notes: input.notes };
  if (delta > 0) {
    const cost = summaries[item.id]?.avgCost ?? item.unitCost;
    return [{ ...base, id: uid('mv'), qty: delta, unitCost: cost, batchNo: input.batchNo || refNo, expiryDate: null }];
  }
  const batches = summaries[item.id].batches;
  const picks = input.batchNo
    ? (() => {
        const b = batches.find(x => x.store === input.store && x.batchNo === input.batchNo);
        if (!b || b.qty + 0.0001 < -delta) throw new Error(`Batch ${input.batchNo} holds only ${fmtQty(b?.qty ?? 0)} ${item.unit}.`);
        return [{ batch: b, qty: -delta }];
      })()
    : allocateFEFO(batches, input.store, -delta, item.name, true);
  return picks.map(p => ({ ...base, id: uid('mv'), qty: -p.qty, unitCost: p.batch.unitCost, batchNo: p.batch.batchNo, expiryDate: p.batch.expiryDate }));
}

export function adjustStock(state: InventoryState, input: AdjustInput): Result {
  if (!input.reason) throw new Error('A reason is required.');
  const date = new Date().toISOString();
  const { refNo, counters } = nextRef(state.counters, MOVEMENT_META[input.type].prefix);
  const rows = adjustmentRows(state, computeSummaries(state), input, refNo, date);
  return { state: { ...state, counters, movements: [...state.movements, ...rows] }, refNo };
}

/* Stock usage requests ---------------------------------------------- */

export interface StockRequestInput {
  store: StoreId;
  purpose: string;
  party: string;
  lines: StockRequestLine[];
  templateId?: string;
  notes?: string;
  user: string;
}

function cleanLines(state: InventoryState, lines: StockRequestLine[]) {
  const merged = new Map<string, number>();
  lines.filter(l => l.itemId && l.qty > 0).forEach(l => merged.set(l.itemId, round3((merged.get(l.itemId) ?? 0) + l.qty)));
  if (!merged.size) throw new Error('Add at least one item with a quantity.');
  return [...merged].map(([itemId, qty]) => ({ itemId: itemOf(state, itemId).id, qty }));
}

export function createStockRequest(state: InventoryState, input: StockRequestInput): Result {
  if (!input.party.trim()) throw new Error('Enter who the stock is for.');
  const lines = cleanLines(state, input.lines);
  const date = new Date().toISOString();
  const { refNo, counters } = nextRef(state.counters, 'REQ');
  const request: StockRequest = {
    id: uid('req'), refNo, status: 'Pending', store: input.store, purpose: input.purpose, party: input.party.trim(),
    templateId: input.templateId, notes: input.notes, lines, requestedAt: date, requestedBy: input.user,
  };
  return { state: { ...state, counters, requests: [request, ...state.requests] }, refNo };
}

export interface StockRequestDecision {
  store: StoreId;
  purpose: string;
  party: string;
  lines: StockRequestLine[];
  note?: string;
  user: string;
}

/** Approving posts the issue, using the approver's store and quantities rather than the requester's. */
export function approveStockRequest(state: InventoryState, requestId: string, decision: StockRequestDecision): Result {
  const request = state.requests.find(r => r.id === requestId);
  if (!request) throw new Error('Request not found.');
  if (request.status !== 'Pending') throw new Error(`${request.refNo} has already been ${request.status.toLowerCase()}.`);
  const lines = cleanLines(state, decision.lines);
  const party = decision.party.trim() || request.party;
  const issued = issueStock(state, {
    store: decision.store, purpose: decision.purpose, party, lines, templateId: request.templateId, user: decision.user,
    notes: [`Request ${request.refNo} by ${request.requestedBy}`, decision.note?.trim()].filter(Boolean).join(' · '),
  });
  const changed = decision.store !== request.store || JSON.stringify(lines) !== JSON.stringify(request.lines);
  const requests = issued.state.requests.map(r => r.id === requestId ? {
    ...r, status: 'Approved' as const, decidedAt: new Date().toISOString(), decidedBy: decision.user,
    decisionNote: decision.note?.trim() || undefined, issueRef: issued.refNo, purpose: decision.purpose, party,
    approvedStore: changed ? decision.store : undefined, approvedLines: changed ? lines : undefined,
  } : r);
  return { state: { ...issued.state, requests }, refNo: issued.refNo };
}

export function rejectStockRequest(state: InventoryState, requestId: string, reason: string, user: string): Result {
  const request = state.requests.find(r => r.id === requestId);
  if (!request) throw new Error('Request not found.');
  if (request.status !== 'Pending') throw new Error(`${request.refNo} has already been ${request.status.toLowerCase()}.`);
  if (!reason.trim()) throw new Error('Give a reason so the requester knows what to change.');
  const requests = state.requests.map(r => r.id === requestId
    ? { ...r, status: 'Rejected' as const, decidedAt: new Date().toISOString(), decidedBy: user, decisionNote: reason.trim() }
    : r);
  return { state: { ...state, requests }, refNo: request.refNo };
}

/* Stock counts ------------------------------------------------------ */

export function createStockCount(state: InventoryState, store: StoreId, user: string, notes = ''): Result {
  const summaries = computeSummaries(state);
  const { refNo, counters } = nextRef(state.counters, 'PSV');
  const lines = state.items
    .filter(i => i.active && (i.defaultStore === store || (summaries[i.id]?.byStore[store] ?? 0) > 0))
    .sort((a, b) => a.code.localeCompare(b.code))
    .map(i => ({ itemId: i.id, systemQty: summaries[i.id]?.byStore[store] ?? 0, countedQty: null }));
  if (!lines.length) throw new Error(`No active items are stocked in ${storeName(store)}.`);
  const count: StockCount = { id: uid('cnt'), refNo, store, status: 'In Progress', createdAt: new Date().toISOString(), createdBy: user, notes, lines };
  return { state: { ...state, counters, counts: [count, ...state.counts] }, refNo };
}

export function approveStockCount(state: InventoryState, countId: string, user: string): Result {
  const count = state.counts.find(c => c.id === countId);
  if (!count) throw new Error('Count not found.');
  if (count.status !== 'Submitted') throw new Error('Only submitted counts can be approved.');
  const summaries = computeSummaries(state);
  const date = new Date().toISOString();
  // Compare with stock now, not at the start of the count, so movements during the count are not undone.
  const current = (itemId: string) => summaries[itemId]?.byStore[count.store] ?? 0;
  const variances = count.lines.filter(l => l.countedQty !== null && round3(l.countedQty - current(l.itemId)) !== 0);
  let counters = state.counters;
  let refNo = '';
  const rows: StockMovement[] = [];
  if (variances.length) {
    ({ refNo, counters } = nextRef(state.counters, 'ADJ'));
    for (const line of variances) {
      rows.push(...adjustmentRows(state, summaries, {
        type: 'ADJUSTMENT', store: count.store, itemId: line.itemId, delta: round3((line.countedQty as number) - current(line.itemId)),
        reason: 'Physical count correction', countId: count.id, notes: `Physical verification ${count.refNo}`, user,
      }, refNo, date));
    }
  }
  const counts = state.counts.map(c => c.id === countId
    ? { ...c, status: 'Approved' as const, approvedAt: date, approvedBy: user, adjustmentRef: refNo || undefined }
    : c);
  return { state: { ...state, counters, counts, movements: [...state.movements, ...rows] }, refNo };
}

/* ------------------------------------------------------------------ */
/* Seed data: a simulated 60-day ledger so every figure is derived      */
/* ------------------------------------------------------------------ */

interface SeedSpec {
  code: string; name: string; localName?: string; category: string; unit: string;
  min: number; reorder: number; max: number; cost: number; store: StoreId; issueFrom?: StoreId;
  supplier: string; lead: number; shelf: number | null; use: number; purposes: string[];
  /** Fresh goods on a daily standing order instead of reorder-point buying. */
  daily?: boolean;
  /** Reorders suppressed for the last N days - leaves the item short today. */
  stall?: number;
  opening?: number;
  openingExpiryInDays?: number;
}

const SEED: SeedSpec[] = [
  { code: 'PJ-001', name: 'Camphor', localName: 'Karpooram', category: 'Pooja Items', unit: 'pkt', min: 10, reorder: 20, max: 80, cost: 45, store: 'MAIN', issueFrom: 'SANCTUM', supplier: 'Shree Suppliers', lead: 3, shelf: null, use: 2.2, purposes: ['Daily Pooja'], stall: 26 },
  { code: 'PJ-002', name: 'Incense Sticks', localName: 'Agarbatti', category: 'Pooja Items', unit: 'box', min: 8, reorder: 15, max: 60, cost: 120, store: 'SANCTUM', supplier: 'Agarbatti House', lead: 4, shelf: null, use: 1.4, purposes: ['Daily Pooja'] },
  { code: 'PJ-003', name: 'Kumkum', category: 'Pooja Items', unit: 'pkt', min: 5, reorder: 10, max: 40, cost: 30, store: 'SANCTUM', supplier: 'Shubham Stores', lead: 3, shelf: null, use: 0.8, purposes: ['Daily Pooja', 'Alankaram'] },
  { code: 'PJ-004', name: 'Turmeric Powder', localName: 'Manjal', category: 'Pooja Items', unit: 'kg', min: 2, reorder: 5, max: 20, cost: 260, store: 'SANCTUM', supplier: 'Shubham Stores', lead: 3, shelf: 365, use: 0.3, purposes: ['Abhishekam', 'Daily Pooja'] },
  { code: 'PJ-005', name: 'Sandalwood Paste', localName: 'Chandanam', category: 'Pooja Items', unit: 'kg', min: 1, reorder: 2, max: 8, cost: 1800, store: 'SANCTUM', supplier: 'Mysore Sandal House', lead: 7, shelf: 90, use: 0.07, purposes: ['Alankaram'], opening: 0.95, openingExpiryInDays: 9 },
  { code: 'PJ-006', name: 'Coconuts', localName: 'Thengai', category: 'Pooja Items', unit: 'pcs', min: 30, reorder: 60, max: 300, cost: 32, store: 'SANCTUM', supplier: 'Fresh Fruits Co.', lead: 2, shelf: 21, use: 16, purposes: ['Daily Pooja', 'Homam'] },
  { code: 'PJ-007', name: 'Betel Leaves', localName: 'Vetrilai', category: 'Pooja Items', unit: 'bundle', min: 1, reorder: 1, max: 12, cost: 40, store: 'SANCTUM', supplier: 'Green Leaf Traders', lead: 1, shelf: 4, use: 3, purposes: ['Daily Pooja'], daily: true },
  { code: 'PJ-008', name: 'Cotton Wicks', localName: 'Thiri', category: 'Pooja Items', unit: 'pkt', min: 10, reorder: 20, max: 100, cost: 25, store: 'SANCTUM', supplier: 'Shree Suppliers', lead: 3, shelf: null, use: 2, purposes: ['Daily Pooja'] },
  { code: 'LO-001', name: 'Pure Cow Ghee', localName: 'Nei', category: 'Lamps & Oil', unit: 'L', min: 8, reorder: 15, max: 60, cost: 650, store: 'MAIN', issueFrom: 'SANCTUM', supplier: 'Dairy Fresh', lead: 3, shelf: 180, use: 1.9, purposes: ['Homam', 'Daily Pooja'], stall: 18 },
  { code: 'LO-002', name: 'Sesame Oil', localName: 'Nallennai', category: 'Lamps & Oil', unit: 'L', min: 10, reorder: 20, max: 80, cost: 280, store: 'MAIN', issueFrom: 'SANCTUM', supplier: 'Ayyappa Oils', lead: 4, shelf: 365, use: 2.4, purposes: ['Daily Pooja'] },
  { code: 'LO-003', name: 'Lamp Oil', localName: 'Deepa Ennai', category: 'Lamps & Oil', unit: 'L', min: 10, reorder: 25, max: 100, cost: 160, store: 'SANCTUM', supplier: 'Ayyappa Oils', lead: 4, shelf: null, use: 3, purposes: ['Daily Pooja'] },
  { code: 'AB-001', name: 'Milk', localName: 'Paal', category: 'Abhishekam', unit: 'L', min: 3, reorder: 5, max: 40, cost: 56, store: 'SANCTUM', supplier: 'Dairy Fresh', lead: 1, shelf: 2, use: 18, purposes: ['Abhishekam'], daily: true },
  { code: 'AB-002', name: 'Curd', localName: 'Thayir', category: 'Abhishekam', unit: 'kg', min: 0.5, reorder: 1, max: 8, cost: 70, store: 'SANCTUM', supplier: 'Dairy Fresh', lead: 1, shelf: 3, use: 2.5, purposes: ['Abhishekam'], daily: true },
  { code: 'AB-003', name: 'Honey', localName: 'Then', category: 'Abhishekam', unit: 'kg', min: 1, reorder: 3, max: 10, cost: 450, store: 'SANCTUM', supplier: 'Nilgiri Naturals', lead: 5, shelf: 365, use: 0.2, purposes: ['Abhishekam'] },
  { code: 'AB-004', name: 'Rose Water', localName: 'Panneer', category: 'Abhishekam', unit: 'L', min: 1, reorder: 3, max: 10, cost: 150, store: 'SANCTUM', supplier: 'Shubham Stores', lead: 3, shelf: 180, use: 0.15, purposes: ['Abhishekam'], opening: 0.4, openingExpiryInDays: 12 },
  { code: 'FL-001', name: 'Marigold Flowers', localName: 'Samanthi', category: 'Flowers & Garlands', unit: 'kg', min: 1, reorder: 2, max: 20, cost: 120, store: 'SANCTUM', supplier: 'Garden Fresh', lead: 1, shelf: 2, use: 8, purposes: ['Alankaram', 'Daily Pooja'], daily: true },
  { code: 'FL-002', name: 'Jasmine Strings', localName: 'Malli', category: 'Flowers & Garlands', unit: 'bundle', min: 1, reorder: 1, max: 15, cost: 90, store: 'SANCTUM', supplier: 'Garden Fresh', lead: 1, shelf: 1, use: 6, purposes: ['Alankaram'], daily: true },
  { code: 'FL-003', name: 'Bilva Leaves', localName: 'Vilvam', category: 'Flowers & Garlands', unit: 'bundle', min: 1, reorder: 1, max: 8, cost: 30, store: 'SANCTUM', supplier: 'Green Leaf Traders', lead: 1, shelf: 3, use: 2, purposes: ['Daily Pooja'], daily: true },
  { code: 'KT-001', name: 'Raw Rice (Ponni)', localName: 'Arisi', category: 'Kitchen & Prasadam', unit: 'kg', min: 75, reorder: 150, max: 600, cost: 58, store: 'KITCHEN', supplier: 'Grain Mart', lead: 3, shelf: 270, use: 36, purposes: ['Annadhanam', 'Prasadam Kitchen'] },
  { code: 'KT-002', name: 'Toor Dal', localName: 'Thuvaram Paruppu', category: 'Kitchen & Prasadam', unit: 'kg', min: 20, reorder: 40, max: 150, cost: 150, store: 'KITCHEN', supplier: 'Grain Mart', lead: 3, shelf: 270, use: 6, purposes: ['Annadhanam'] },
  { code: 'KT-003', name: 'Jaggery', localName: 'Vellam', category: 'Kitchen & Prasadam', unit: 'kg', min: 10, reorder: 20, max: 80, cost: 65, store: 'KITCHEN', supplier: 'Sweet Source', lead: 3, shelf: 180, use: 3, purposes: ['Prasadam Kitchen'] },
  { code: 'KT-004', name: 'Moong Dal', localName: 'Pasi Paruppu', category: 'Kitchen & Prasadam', unit: 'kg', min: 10, reorder: 20, max: 60, cost: 130, store: 'KITCHEN', supplier: 'Grain Mart', lead: 3, shelf: 270, use: 2, purposes: ['Prasadam Kitchen'] },
  { code: 'KT-005', name: 'Cashew Nuts', localName: 'Mundhiri', category: 'Kitchen & Prasadam', unit: 'kg', min: 1, reorder: 3, max: 10, cost: 900, store: 'KITCHEN', supplier: 'Sweet Source', lead: 4, shelf: 120, use: 0.3, purposes: ['Prasadam Kitchen'] },
  { code: 'KT-006', name: 'Cardamom', localName: 'Elakkai', category: 'Kitchen & Prasadam', unit: 'kg', min: 0.25, reorder: 0.5, max: 2, cost: 2800, store: 'KITCHEN', supplier: 'Spice Route Traders', lead: 5, shelf: 365, use: 0.03, purposes: ['Prasadam Kitchen'], stall: 60, opening: 1 },
  { code: 'KT-007', name: 'Groundnut Oil', localName: 'Kadalai Ennai', category: 'Kitchen & Prasadam', unit: 'L', min: 15, reorder: 30, max: 100, cost: 190, store: 'KITCHEN', supplier: 'Ayyappa Oils', lead: 4, shelf: 270, use: 4, purposes: ['Annadhanam'] },
  { code: 'KT-008', name: 'Banana Leaves', localName: 'Vazhai Ilai', category: 'Kitchen & Prasadam', unit: 'pcs', min: 50, reorder: 100, max: 1200, cost: 3, store: 'KITCHEN', supplier: 'Green Leaf Traders', lead: 1, shelf: 3, use: 260, purposes: ['Annadhanam'], daily: true },
  { code: 'CM-001', name: 'Floor Cleaner', category: 'Cleaning & Maintenance', unit: 'L', min: 5, reorder: 10, max: 30, cost: 110, store: 'MAIN', supplier: 'CleanCare Distributors', lead: 5, shelf: null, use: 0.6, purposes: ['Maintenance'] },
  { code: 'CM-002', name: 'Brass Polish', localName: 'Pitambari', category: 'Cleaning & Maintenance', unit: 'pkt', min: 2, reorder: 5, max: 20, cost: 95, store: 'MAIN', supplier: 'CleanCare Distributors', lead: 5, shelf: null, use: 0.25, purposes: ['Maintenance'] },
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED_USERS = { store: 'Murugan (Store Keeper)', manager: 'Temple Manager', admin: 'Admin' };

export function buildSeedState(now = new Date()): InventoryState {
  const rng = mulberry32(20260923);
  const DAYS = 60;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - DAYS);
  const items: InventoryItem[] = SEED.map(s => ({
    id: `itm-${s.code}`, code: s.code, name: s.name, localName: s.localName ?? '', category: s.category, unit: s.unit,
    minStock: s.min, reorderLevel: s.reorder, maxStock: s.max, unitCost: s.cost, defaultStore: s.store, supplier: s.supplier,
    leadTimeDays: s.lead, perishable: s.shelf !== null, shelfLifeDays: s.shelf, active: true,
    createdAt: start.toISOString(), notes: '',
  }));

  let counters: Record<string, number> = {};
  const movements: StockMovement[] = [];
  const batches = new Map<string, BatchBalance>();

  const at = (day: number, hour: number, minute = 0) => {
    const d = new Date(start);
    d.setDate(d.getDate() + day);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  const ref = (prefix: string, d: Date) => {
    const r = nextRef(counters, prefix, d);
    counters = r.counters;
    return r.refNo;
  };
  const balance = (itemId: string, store: StoreId) =>
    round3([...batches.values()].filter(b => b.itemId === itemId && b.store === store).reduce((s, b) => s + b.qty, 0));
  const post = (row: Omit<StockMovement, 'id'>) => {
    movements.push({ ...row, id: uid('mv') });
    const key = `${row.itemId}|${row.store}|${row.batchNo}`;
    const b = batches.get(key) ?? { itemId: row.itemId, store: row.store, batchNo: row.batchNo, expiryDate: row.expiryDate, qty: 0, unitCost: row.unitCost, receivedAt: row.date };
    b.qty = round3(b.qty + row.qty);
    if (b.qty <= 0.0001) batches.delete(key); else batches.set(key, b);
  };
  const take = (item: InventoryItem, store: StoreId, qty: number, build: (b: BatchBalance, q: number) => Omit<StockMovement, 'id'>) => {
    const pool = [...batches.values()].filter(b => b.itemId === item.id && b.store === store).sort(fefoCompare);
    let remaining = qty;
    for (const b of pool) {
      if (remaining <= 0.0001) break;
      const q = round3(Math.min(b.qty, remaining));
      post(build({ ...b }, q));
      remaining = round3(remaining - q);
    }
    return round3(qty - remaining);
  };
  const receive = (item: InventoryItem, spec: SeedSpec, store: StoreId, qty: number, d: Date, type: MovementType, extra: Partial<StockMovement> = {}) => {
    const refNo = extra.refNo ?? ref(MOVEMENT_META[type].prefix, d);
    const expiry = extra.expiryDate !== undefined ? extra.expiryDate : spec.shelf ? toISODate(addDays(d, spec.shelf)) : null;
    const costJitter = type === 'RECEIPT' ? 1 + (rng() - 0.5) * 0.08 : 1;
    post({
      refNo, date: d.toISOString(), type, itemId: item.id, store, qty: round3(qty), unitCost: Math.round(spec.cost * costJitter * 100) / 100,
      batchNo: refNo, expiryDate: expiry, party: type === 'RECEIPT' ? spec.supplier : undefined,
      invoiceNo: type === 'RECEIPT' ? `INV-${Math.floor(1000 + rng() * 9000)}` : undefined,
      user: SEED_USERS.store, ...extra,
    });
    return refNo;
  };
  const qtyFor = (spec: SeedSpec, base: number) => {
    if (WHOLE_UNITS.has(spec.unit)) return base < 1 ? (rng() < base ? 1 : 0) : Math.max(1, Math.round(base));
    return base >= 5 ? Math.round(base) : Math.round(base * 100) / 100;
  };

  const pending = new Map<string, { arrive: number; qty: number }>();
  const counts: StockCount[] = [];

  // Opening balances
  items.forEach((item, idx) => {
    const spec = SEED[idx];
    const openQty = qtyFor(spec, spec.max * (spec.opening ?? 0.65));
    const expiry = spec.openingExpiryInDays !== undefined
      ? toISODate(addDays(now, spec.openingExpiryInDays))
      : spec.shelf ? toISODate(addDays(start, Math.max(1, Math.round(spec.shelf * 0.6)))) : null;
    receive(item, spec, spec.store, openQty, at(0, 6), 'OPENING', { refNo: 'OPN/OPENING', expiryDate: expiry, user: SEED_USERS.admin, notes: 'Opening balance migrated from manual register' });
  });

  for (let day = 0; day <= DAYS; day++) {
    const dayStr = toISODate(at(day, 0));
    const festival = day % 15 === 7; // Pradosham / Pournami style peaks
    const isToday = day === DAYS;

    items.forEach((item, idx) => {
      const spec = SEED[idx];

      // 1. Write off anything that expired before today.
      const expired = [...batches.values()].filter(b => b.itemId === item.id && b.expiryDate && b.expiryDate < dayStr);
      if (expired.length && !isToday) {
        const refNo = ref('WST', at(day, 6, 30));
        expired.forEach(b => post({
          refNo, date: at(day, 6, 30).toISOString(), type: 'WASTAGE', itemId: item.id, store: b.store, qty: -b.qty,
          unitCost: b.unitCost, batchNo: b.batchNo, expiryDate: b.expiryDate, reason: 'Expired', user: SEED_USERS.store,
        }));
      }

      // 2. Deliveries
      if (spec.daily && day > 0) {
        // Standing order tops the store up to roughly one day's need.
        const need = spec.use * (festival ? 1.8 : 1) * (1.02 + rng() * 0.15) - balance(item.id, spec.store);
        const qty = need > 0 ? qtyFor(spec, need) : 0;
        if (qty > 0) receive(item, spec, spec.store, qty, at(day, 5, 15), 'RECEIPT');
      }
      const due = pending.get(item.id);
      if (due && due.arrive <= day) {
        receive(item, spec, spec.store, due.qty, at(day, 10, 30), 'RECEIPT');
        pending.delete(item.id);
      }

      // 3. Replenish the issuing store from bulk storage.
      const issueStore = spec.issueFrom ?? spec.store;
      if (spec.issueFrom && balance(item.id, issueStore) < spec.use * 2) {
        const want = qtyFor(spec, spec.use * 7);
        const refNo = ref('TRF', at(day, 7));
        take(item, spec.store, want, (b, q) => ({
          refNo, date: at(day, 7).toISOString(), type: 'TRANSFER_OUT', itemId: item.id, store: spec.store, qty: -q,
          unitCost: b.unitCost, batchNo: b.batchNo, expiryDate: b.expiryDate, party: storeName(issueStore), user: SEED_USERS.store,
        }));
        const moved = movements.filter(m => m.refNo === refNo);
        moved.forEach(m => post({ ...m, type: 'TRANSFER_IN', store: issueStore, qty: -m.qty, party: storeName(spec.store) }));
      }

      // 4. Consumption (today: morning issues only)
      const demand = qtyFor(spec, spec.use * (festival ? 1.8 : 1) * (0.75 + rng() * 0.5) * (isToday ? 0.35 : 1));
      if (demand > 0) {
        const purpose = spec.purposes[day % spec.purposes.length];
        const refNo = ref('ISS', at(day, 8, 15));
        take(item, issueStore, demand, (b, q) => ({
          refNo, date: at(day, 8, 15).toISOString(), type: 'ISSUE', itemId: item.id, store: issueStore, qty: -q,
          unitCost: b.unitCost, batchNo: b.batchNo, expiryDate: b.expiryDate, purpose,
          party: purpose === 'Annadhanam' || purpose === 'Prasadam Kitchen' ? 'Madapalli (Temple Kitchen)' : 'Archakar - Sanctum',
          user: SEED_USERS.store,
        }));
      }

      // 5. Reorder point check
      const stalled = spec.stall !== undefined && day > DAYS - spec.stall;
      const onHand = balance(item.id, 'MAIN') + balance(item.id, 'KITCHEN') + balance(item.id, 'SANCTUM');
      if (!spec.daily && !stalled && !pending.has(item.id) && onHand <= spec.reorder && !isToday) {
        pending.set(item.id, { arrive: day + spec.lead, qty: qtyFor(spec, spec.max - onHand) });
      }
    });

    // In-kind donations from devotees
    const donation = (code: string, qty: number, donor: string, phone: string, receiptNo: string, hour: number) => {
      const idx = SEED.findIndex(s => s.code === code);
      receive(items[idx], SEED[idx], SEED[idx].store, qty, at(day, hour), 'DONATION', {
        party: donor, donorPhone: phone, receiptNo, user: SEED_USERS.manager, notes: 'Donated at temple counter',
      });
    };
    if (day === 38) donation('LO-001', 10, 'Smt. Lakshmi Narayanan', '98410 22314', 'DR/26-27/0418', 11);
    if (day === 52) donation('PJ-006', 100, 'Sri Ramesh Kumar', '94440 51872', 'DR/26-27/0467', 9);
    if (day === 58) donation('KT-001', 600, 'Sri Venkatesh Iyer & Family', '98848 10032', 'DR/26-27/0489', 12);

    // Physical verification of the sanctum store, 20 days ago
    if (day === DAYS - 20) {
      const refNo = ref('PSV', at(day, 18));
      const adjRef = ref('ADJ', at(day, 18, 30));
      const lines: StockCountLine[] = items.filter(i => i.defaultStore === 'SANCTUM' || balance(i.id, 'SANCTUM') > 0).map(i => {
        const systemQty = balance(i.id, 'SANCTUM');
        const variance = i.code === 'PJ-002' ? -1 : i.code === 'PJ-003' ? -2 : i.code === 'LO-003' ? 0.5 : 0;
        return { itemId: i.id, systemQty, countedQty: round3(Math.max(0, systemQty + variance)) };
      });
      const countId = 'cnt-seed-001';
      lines.forEach(line => {
        const delta = round3((line.countedQty as number) - line.systemQty);
        if (!delta) return;
        const item = items.find(i => i.id === line.itemId)!;
        const base = { refNo: adjRef, date: at(day, 18, 30).toISOString(), type: 'ADJUSTMENT' as const, itemId: item.id, store: 'SANCTUM' as StoreId, reason: 'Physical count correction', countId, notes: `Physical verification ${refNo}`, user: SEED_USERS.admin };
        if (delta > 0) post({ ...base, qty: delta, unitCost: item.unitCost, batchNo: adjRef, expiryDate: null });
        else take(item, 'SANCTUM', -delta, (b, q) => ({ ...base, qty: -q, unitCost: b.unitCost, batchNo: b.batchNo, expiryDate: b.expiryDate }));
      });
      counts.push({
        id: countId, refNo, store: 'SANCTUM', status: 'Approved', createdAt: at(day, 17).toISOString(), createdBy: SEED_USERS.store,
        submittedAt: at(day, 18).toISOString(), submittedBy: SEED_USERS.store, approvedAt: at(day, 18, 30).toISOString(),
        approvedBy: SEED_USERS.admin, adjustmentRef: adjRef, notes: 'Monthly sanctum store verification', lines,
      });
    }
  }
  const templates: SevaTemplate[] = [
    { id: 'tpl-abhishekam', name: 'Maha Abhishekam', kind: 'Seva', basisQty: 1, basisLabel: 'seva', purpose: 'Abhishekam', store: 'SANCTUM', lines: [
      { itemId: 'itm-AB-001', qty: 5 }, { itemId: 'itm-AB-002', qty: 1 }, { itemId: 'itm-AB-003', qty: 0.25 },
      { itemId: 'itm-AB-004', qty: 0.2 }, { itemId: 'itm-PJ-004', qty: 0.1 }, { itemId: 'itm-PJ-005', qty: 0.05 }, { itemId: 'itm-PJ-006', qty: 3 },
    ] },
    { id: 'tpl-homam', name: 'Ganapathi Homam', kind: 'Seva', basisQty: 1, basisLabel: 'homam', purpose: 'Homam', store: 'SANCTUM', lines: [
      { itemId: 'itm-LO-001', qty: 1 }, { itemId: 'itm-PJ-006', qty: 8 }, { itemId: 'itm-PJ-001', qty: 2 },
      { itemId: 'itm-PJ-003', qty: 1 }, { itemId: 'itm-PJ-002', qty: 1 }, { itemId: 'itm-FL-001', qty: 1 },
    ] },
    { id: 'tpl-archana', name: 'Archana', kind: 'Seva', basisQty: 10, basisLabel: 'archanas', purpose: 'Daily Pooja', store: 'SANCTUM', lines: [
      { itemId: 'itm-PJ-006', qty: 10 }, { itemId: 'itm-PJ-007', qty: 1 }, { itemId: 'itm-PJ-001', qty: 1 }, { itemId: 'itm-FL-001', qty: 1 },
    ] },
    { id: 'tpl-deepa', name: 'Evening Deepa Aradhana', kind: 'Seva', basisQty: 1, basisLabel: 'evening', purpose: 'Daily Pooja', store: 'SANCTUM', lines: [
      { itemId: 'itm-LO-003', qty: 1.5 }, { itemId: 'itm-PJ-008', qty: 1 }, { itemId: 'itm-LO-001', qty: 0.25 }, { itemId: 'itm-PJ-001', qty: 1 },
    ] },
    { id: 'tpl-annadhanam', name: 'Annadhanam Lunch', kind: 'Annadhanam', basisQty: 100, basisLabel: 'meals', purpose: 'Annadhanam', store: 'KITCHEN', lines: [
      { itemId: 'itm-KT-001', qty: 12 }, { itemId: 'itm-KT-002', qty: 2 }, { itemId: 'itm-KT-007', qty: 1.5 },
      { itemId: 'itm-KT-008', qty: 100 }, { itemId: 'itm-KT-003', qty: 1.5 }, { itemId: 'itm-KT-004', qty: 1 },
    ] },
    { id: 'tpl-pongal', name: 'Sakkarai Pongal Prasadam', kind: 'Prasadam', basisQty: 100, basisLabel: 'servings', purpose: 'Prasadam Kitchen', store: 'KITCHEN', lines: [
      { itemId: 'itm-KT-001', qty: 4 }, { itemId: 'itm-KT-004', qty: 1 }, { itemId: 'itm-KT-003', qty: 4 },
      { itemId: 'itm-KT-005', qty: 0.2 }, { itemId: 'itm-KT-006', qty: 0.02 },
    ] },
  ];

  /* Two usage requests waiting on the admin, so a fresh demo has something in the approval queue. */
  const requests: StockRequest[] = [
    {
      id: 'req-seed-kitchen', refNo: ref('REQ', at(DAYS, 7, 45)), status: 'Pending', store: 'KITCHEN', purpose: 'Annadhanam',
      party: 'Annadhanam Hall', templateId: 'tpl-annadhanam', notes: 'Saturday annadhanam - 200 meals expected',
      lines: [{ itemId: 'itm-KT-001', qty: 24 }, { itemId: 'itm-KT-002', qty: 4 }, { itemId: 'itm-KT-007', qty: 3 }, { itemId: 'itm-KT-003', qty: 3 }],
      requestedAt: at(DAYS, 7, 45).toISOString(), requestedBy: SEED_USERS.store,
    },
    {
      id: 'req-seed-sanctum', refNo: ref('REQ', at(DAYS, 8, 10)), status: 'Pending', store: 'SANCTUM', purpose: 'Abhishekam',
      party: 'Archakar - Sanctum', templateId: 'tpl-abhishekam', notes: 'Pradosham maha abhishekam',
      lines: [{ itemId: 'itm-AB-001', qty: 5 }, { itemId: 'itm-AB-002', qty: 1 }, { itemId: 'itm-PJ-006', qty: 3 }, { itemId: 'itm-PJ-004', qty: 0.1 }],
      requestedAt: at(DAYS, 8, 10).toISOString(), requestedBy: SEED_USERS.manager,
    },
  ];

  return { version: STATE_VERSION, items, movements, counts, templates, requests, counters };
}

/* ------------------------------------------------------------------ */
/* Export helpers                                                      */
/* ------------------------------------------------------------------ */

export function toCSV(rows: (string | number | null | undefined)[][]) {
  return rows.map(r => r.map(cell => {
    const s = cell === null || cell === undefined ? '' : String(cell);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',')).join('\r\n');
}

export function downloadCSV(filename: string, rows: (string | number | null | undefined)[][]) {
  const blob = new Blob(['﻿' + toCSV(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printDocument(title: string, bodyHtml: string) {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return false;
  w.document.write(`<!doctype html><html><head><title>${title}</title><style>
    body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#111;margin:32px;font-size:12px}
    h1{font-size:18px;margin:0 0 4px} p.meta{color:#555;margin:0 0 16px}
    table{width:100%;border-collapse:collapse} th,td{border:1px solid #bbb;padding:6px 8px;text-align:left}
    th{background:#f1f1f1} td.num{text-align:right} .sign{margin-top:48px;display:flex;justify-content:space-between}
    .sign div{border-top:1px solid #333;padding-top:4px;width:30%;text-align:center}
  </style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
  return true;
}
