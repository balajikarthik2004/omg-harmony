/**
 * Procurement agent: shortlists and ranks suppliers for one inventory item.
 *
 * Candidates are the temple's own suppliers - those who have delivered this item, the item's
 * regular supplier, and suppliers of other items in the same category. Rates come from past
 * receipts, lead times and punctuality from past purchase orders, and the need from the stock
 * ledger. Nothing is invented: when a figure is not known it is marked as an estimate.
 */
import type { ProcurementRecord } from '@/data/mockData';
import {
  InventoryItem, InventoryState, ItemSummary, StoreId, WHOLE_UNITS, addDays, daysBetween, fmtDate, fmtMoney, fmtQty,
  matchPOLineItem, receivedAgainstPO, round3,
} from '@/lib/inventory';
import { approvalAuthority, parsePODate, supplierQuotes } from '@/lib/poEvaluation';
import { toISODate } from '@/lib/utils';

export const DEMAND_OUTLOOKS = [
  { key: 'low', label: 'Quieter than usual', factor: 0.8 },
  { key: 'normal', label: 'Normal days', factor: 1 },
  { key: 'festival', label: 'Festival week (+30%)', factor: 1.3 },
  { key: 'major', label: 'Major festival / Brahmotsavam (+60%)', factor: 1.6 },
] as const;
export type DemandKey = (typeof DEMAND_OUTLOOKS)[number]['key'];

export type RateBasis = 'past receipts' | 'item master rate';
export type VendorSource = 'supplied this item' | 'regular supplier' | 'same category';

export interface VendorOption {
  name: string;
  source: VendorSource;
  rate: number;
  rateBasis: RateBasis;
  lastRate: number | null;
  lastSupplied: string | null;
  receipts: number;
  leadDays: number;
  leadBasis: string;
  eta: string;
  meetsRequiredDate: boolean;
  beforeStockOut: boolean;
  onTime: number;
  deliveries: number;
  reliability: number;
  reliabilityBasis: string;
  total: number;
  score: number;
  rank: number;
  pros: string[];
  cons: string[];
}

export interface SplitPlan {
  fast: VendorOption;
  cheap: VendorOption;
  urgentQty: number;
  balanceQty: number;
  total: number;
  saving: number;
}

export interface AgentResult {
  item: InventoryItem;
  qty: number;
  store: StoreId;
  requiredBy: string;
  demandFactor: number;
  available: number;
  reserved: number;
  incoming: number;
  avgDaily: number;
  adjustedDaily: number;
  daysCover: number | null;
  stockOutDate: string | null;
  suggestedQty: number;
  urgency: 'critical' | 'high' | 'normal';
  vendors: VendorOption[];
  recommended: VendorOption | null;
  split: SplitPlan | null;
  strategy: 'lowest_cost' | 'fastest_delivery' | 'best_value' | 'split';
  reason: string;
  monthSpend: number;
  budget: number;
  approval: { role: string; reason: string };
  warnings: string[];
}

export interface AgentInput {
  itemId: string;
  qty: number;
  requiredBy: string;
  store: StoreId;
  demandFactor: number;
  budget: number;
  state: InventoryState;
  summaries: Record<string, ItemSummary>;
  pos: ProcurementRecord[];
  now?: Date;
}

const OPEN = ['Pending', 'Approved', 'Partially Received'];
const same = (a?: string | null, b?: string | null) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
const roundFor = (item: InventoryItem, q: number) => (WHOLE_UNITS.has(item.unit) ? Math.ceil(q - 0.0001) : Math.ceil(q * 10) / 10);
const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`;

/** Days from order to receipt on this supplier's past purchase orders. */
function supplierHistory(name: string, pos: ProcurementRecord[]) {
  const done = pos.filter(p => same(p.vendor, name) && p.receivedDate);
  const leads = done
    .map(p => { const a = parsePODate(p.date); const b = parsePODate(p.receivedDate); return a && b ? Math.round((b.getTime() - a.getTime()) / 86400000) : null; })
    .filter((d): d is number => d !== null && d >= 0);
  const timed = done
    .map(p => { const due = parsePODate(p.expectedDate); const got = parsePODate(p.receivedDate); return due && got ? Math.round((got.getTime() - due.getTime()) / 86400000) : null; })
    .filter((d): d is number => d !== null);
  return {
    avgLead: leads.length ? Math.round(leads.reduce((a, d) => a + d, 0) / leads.length) : null,
    orders: leads.length,
    deliveries: timed.length,
    onTime: timed.filter(d => d <= 0).length,
    avgDelay: timed.length ? timed.reduce((a, d) => a + Math.max(0, d), 0) / timed.length : 0,
  };
}

export function runProcurementAgent(input: AgentInput): AgentResult {
  const { itemId, qty, requiredBy, store, demandFactor, budget, state, summaries, pos, now = new Date() } = input;
  const item = state.items.find(i => i.id === itemId);
  if (!item) throw new Error('Choose an inventory item.');
  if (!(qty > 0)) throw new Error('Enter the quantity needed.');
  const s = summaries[item.id];
  const u = item.unit;
  const warnings: string[] = [];

  /* The need: what is usable now, what is already coming, and how fast it is used. */
  const usable = s ? round3(s.usableByStore.MAIN + s.usableByStore.KITCHEN + s.usableByStore.SANCTUM) : 0;
  const reserved = round3(state.requests.filter(r => r.status === 'Pending').flatMap(r => r.lines).filter(l => l.itemId === item.id).reduce((a, l) => a + l.qty, 0));
  const available = Math.max(0, round3(usable - reserved));
  const incoming = round3(pos.filter(p => OPEN.includes(p.status)).reduce((a, p) => {
    const got = receivedAgainstPO(state, p.id);
    return a + p.items.filter(l => matchPOLineItem(state.items, l) === item.id).reduce((b, l) => b + Math.max(0, l.quantity - (got[item.id] ?? 0)), 0);
  }, 0));
  // Approved orders due by tomorrow will land before the shelf empties, so they count towards cover.
  const soon = toISODate(addDays(now, 1));
  const arriving = round3(pos.filter(p => ['Approved', 'Partially Received'].includes(p.status) && p.expectedDate && p.expectedDate <= soon).reduce((a, p) => {
    const got = receivedAgainstPO(state, p.id);
    return a + p.items.filter(l => matchPOLineItem(state.items, l) === item.id).reduce((b, l) => b + Math.max(0, l.quantity - (got[item.id] ?? 0)), 0);
  }, 0));
  const avgDaily = s?.avgDaily ?? 0;
  const adjustedDaily = round3(avgDaily * demandFactor);
  const daysCover = adjustedDaily > 0 ? (available + arriving) / adjustedDaily : null;
  const stockOutDate = daysCover !== null ? toISODate(addDays(now, Math.floor(daysCover))) : null;
  const daysToRequired = Math.max(0, daysBetween(requiredBy, now));
  const atArrival = Math.max(0, available - adjustedDaily * item.leadTimeDays);
  let suggestedQty = roundFor(item, Math.max(0, item.maxStock - atArrival - incoming));
  if (item.perishable && item.shelfLifeDays && adjustedDaily > 0) suggestedQty = Math.min(suggestedQty, roundFor(item, adjustedDaily * item.shelfLifeDays));

  if (incoming > 0) warnings.push(`${fmtQty(incoming)} ${u} is already on open purchase orders.`);
  if (reserved > 0) warnings.push(`${fmtQty(reserved)} ${u} is requested in pending stock usage.`);
  if (qty > suggestedQty * 1.25 && suggestedQty > 0) warnings.push(`${fmtQty(qty)} ${u} is more than needed; ${fmtQty(suggestedQty)} ${u} brings stock to its maximum of ${fmtQty(item.maxStock)} ${u}.`);
  if (suggestedQty === 0) warnings.push(`Stock is already at or above the ${fmtQty(item.maxStock)} ${u} maximum once open orders arrive.`);
  if (avgDaily === 0) warnings.push('Nothing was issued in the last 30 days, so urgency cannot be judged from usage.');

  /* Candidates: the temple's own suppliers only. */
  const quotes = supplierQuotes(state, item.id);
  const names = new Map<string, VendorSource>();
  quotes.forEach(q => names.set(q.supplier, 'supplied this item'));
  if (item.supplier && ![...names.keys()].some(n => same(n, item.supplier))) names.set(item.supplier, 'regular supplier');
  // A few alternatives who already supply this category - the busiest first - so there is always a comparison.
  const receiptCount = (n: string) => new Set(state.movements.filter(m => m.type === 'RECEIPT' && same(m.party, n)).map(m => m.refNo)).size;
  [...new Set(state.items.filter(i => i.active && i.category === item.category && i.id !== item.id && i.supplier).map(i => i.supplier))]
    .filter(n => ![...names.keys()].some(k => same(k, n)))
    .sort((a, b) => receiptCount(b) - receiptCount(a))
    .slice(0, 3)
    .forEach(n => names.set(n, 'same category'));

  const usualRate = quotes.length
    ? quotes.reduce((a, q) => a + q.avgRate * q.receipts, 0) / quotes.reduce((a, q) => a + q.receipts, 0)
    : item.unitCost;

  const raw = [...names].map(([name, source]) => {
    const q = quotes.find(x => same(x.supplier, name));
    const hist = supplierHistory(name, pos);
    const categoryLeads = state.items.filter(i => same(i.supplier, name)).map(i => i.leadTimeDays);
    const leadDays = hist.avgLead ?? (same(name, item.supplier) ? item.leadTimeDays
      : categoryLeads.length ? Math.round(categoryLeads.reduce((a, d) => a + d, 0) / categoryLeads.length) : item.leadTimeDays + 2);
    const leadBasis = hist.avgLead !== null ? `average of ${hist.orders} past order${hist.orders > 1 ? 's' : ''}`
      : same(name, item.supplier) ? 'item lead time' : categoryLeads.length ? 'their usual lead time' : 'estimate';
    const receiptsAll = new Set(state.movements.filter(m => m.type === 'RECEIPT' && same(m.party, name)).map(m => m.refNo)).size;
    const reliability = hist.deliveries
      ? Math.max(40, Math.round(100 - (1 - hist.onTime / hist.deliveries) * 35 - hist.avgDelay * 5))
      : receiptsAll >= 10 ? 85 : receiptsAll >= 3 ? 75 : 60;
    const reliabilityBasis = hist.deliveries
      ? `${hist.onTime} of ${hist.deliveries} orders on time`
      : receiptsAll ? `${receiptsAll} deliveries received, dates not tracked` : 'no delivery history';
    const rate = q ? q.avgRate : Math.round(usualRate * 100) / 100;
    const eta = toISODate(addDays(now, leadDays));
    return {
      name, source, rate, rateBasis: (q ? 'past receipts' : 'item master rate') as RateBasis, lastRate: q?.lastRate ?? null,
      lastSupplied: q?.lastDate ?? null, receipts: q?.receipts ?? 0, leadDays, leadBasis, eta,
      meetsRequiredDate: leadDays <= daysToRequired, beforeStockOut: daysCover === null || leadDays <= daysCover,
      onTime: hist.onTime, deliveries: hist.deliveries, reliability, reliabilityBasis, total: Math.round(rate * qty),
      receiptsAll,
    };
  });
  if (!raw.length) throw new Error(`No supplier is on record for ${item.name} or its category. Add one in the item master first.`);

  const urgency: AgentResult['urgency'] = daysCover !== null && daysCover < Math.min(...raw.map(v => v.leadDays)) + 1 ? 'critical'
    : (daysCover !== null && daysCover < item.leadTimeDays + 3) || daysToRequired <= 2 ? 'high' : 'normal';
  const w = urgency === 'normal' ? { cost: 0.4, time: 0.3, rel: 0.2, exp: 0.1 } : { cost: 0.25, time: 0.45, rel: 0.2, exp: 0.1 };
  const tested = raw.filter(v => v.rateBasis === 'past receipts');
  const minRate = Math.min(...(tested.length ? tested : raw).map(v => v.rate));
  const uniqueLowest = (tested.length ? tested : raw).filter(v => v.rate === minRate).length === 1;

  const vendors: VendorOption[] = raw.map(v => {
    const cost = (minRate / v.rate) * 100 * (v.rateBasis === 'past receipts' ? 1 : 0.9);
    const time = v.meetsRequiredDate && v.beforeStockOut ? 100 : v.beforeStockOut ? 70 : v.meetsRequiredDate ? 50 : 15;
    const exp = v.receipts ? Math.min(100, 40 + v.receipts * 6) : v.receiptsAll ? 35 : 15;
    // A supplier who has never delivered this item is a risk on quality and price until they quote.
    const untested = v.rateBasis !== 'past receipts' ? 0.8 : 1;
    const score = Math.round((Math.min(100, cost) * w.cost + time * w.time + v.reliability * w.rel + exp * w.exp) * untested);
    const pros: string[] = [];
    const cons: string[] = [];
    if (v.rateBasis === 'past receipts' && v.rate === minRate && uniqueLowest && tested.length > 1) pros.push('Lowest rate');
    if (v.rateBasis === 'past receipts') pros.push(`Paid ${fmtMoney(v.rate)}/${u} on average`);
    else cons.push(`Has not supplied ${item.name}; rate to be quoted (estimated ${fmtMoney(v.rate)})`);
    if (v.meetsRequiredDate) pros.push(`Delivers by ${fmtDate(v.eta)}`);
    else cons.push(`Earliest delivery ${fmtDate(v.eta)}, after the required date`);
    if (!v.beforeStockOut) cons.push(`Arrives after stock runs out (${fmtDate(stockOutDate)})`);
    if (v.deliveries && v.onTime === v.deliveries) pros.push('Always on time so far');
    if (v.deliveries && v.onTime < v.deliveries) cons.push(`Late on ${v.deliveries - v.onTime} of ${v.deliveries} orders`);
    if (v.source === 'regular supplier' || same(v.name, item.supplier)) pros.push('Regular supplier for this item');
    return {
      name: v.name, source: v.source, rate: v.rate, rateBasis: v.rateBasis, lastRate: v.lastRate, lastSupplied: v.lastSupplied,
      receipts: v.receipts, leadDays: v.leadDays, leadBasis: v.leadBasis, eta: v.eta, meetsRequiredDate: v.meetsRequiredDate,
      beforeStockOut: v.beforeStockOut, onTime: v.onTime, deliveries: v.deliveries, reliability: v.reliability,
      reliabilityBasis: v.reliabilityBasis, total: v.total, score, rank: 0, pros, cons,
    };
  }).sort((a, b) => b.score - a.score || a.rate - b.rate).map((v, i) => ({ ...v, rank: i + 1 }));

  const recommended = vendors[0];
  const priced = vendors.filter(v => v.rateBasis === 'past receipts');
  const cheapest = [...(priced.length ? priced : vendors)].sort((a, b) => a.rate - b.rate)[0];
  const fastest = [...vendors].sort((a, b) => a.leadDays - b.leadDays || a.rate - b.rate)[0];

  /* Split: the cheap supplier is too slow, so a small bridging quantity comes from the fast one. */
  let split: SplitPlan | null = null;
  if (daysCover !== null && !cheapest.beforeStockOut && fastest.beforeStockOut && fastest.name !== cheapest.name && cheapest.rate < fastest.rate * 0.95) {
    const gapDays = Math.max(1, cheapest.leadDays - Math.floor(daysCover) + 1);
    const urgentQty = Math.min(qty, roundFor(item, adjustedDaily * gapDays));
    const balanceQty = round3(qty - urgentQty);
    if (balanceQty > 0) {
      const total = Math.round(urgentQty * fastest.rate + balanceQty * cheapest.rate);
      split = { fast: fastest, cheap: cheapest, urgentQty, balanceQty, total, saving: Math.round(fastest.rate * qty - total) };
    }
  }

  let strategy: AgentResult['strategy'] = 'best_value';
  let reason: string;
  if (split && split.saving > 0 && urgency !== 'normal') {
    strategy = 'split';
    reason = `${cheapest.name} is cheapest but delivers in ${days(cheapest.leadDays)}, after stock runs out on ${fmtDate(stockOutDate)}. Order ${fmtQty(split.urgentQty)} ${u} from ${fastest.name} to bridge the gap and the remaining ${fmtQty(split.balanceQty)} ${u} from ${cheapest.name}. This saves ${fmtMoney(split.saving)} against buying everything from ${fastest.name}.`;
  } else if (recommended.name === cheapest.name && priced.length > 1) {
    strategy = 'lowest_cost';
    reason = `${recommended.name} has the lowest rate paid for ${item.name} (${fmtMoney(recommended.rate)}/${u})${recommended.meetsRequiredDate ? ` and can deliver by ${fmtDate(recommended.eta)}` : ''}. ${recommended.reliabilityBasis}.`;
  } else if (recommended.rateBasis === 'past receipts' && priced.length === 1) {
    reason = `${recommended.name} is the only supplier who has delivered ${item.name} (${recommended.receipts} receipt${recommended.receipts === 1 ? '' : 's'} at ${fmtMoney(recommended.rate)}/${u} on average)${recommended.meetsRequiredDate
      ? ` and can deliver by ${fmtDate(recommended.eta)}` : `, but their earliest delivery is ${fmtDate(recommended.eta)}, after the needed-by date. Ask them to expedite or move the date`}. Others shown have not supplied it; ask them to quote if you want a comparison.`;
  } else if (recommended.name === fastest.name && urgency !== 'normal') {
    strategy = 'fastest_delivery';
    reason = `Stock is ${urgency === 'critical' ? 'about to run out' : 'low'}, so speed matters more than price. ${recommended.name} delivers in ${days(recommended.leadDays)}, costing ${fmtMoney(recommended.total - cheapest.rate * qty)} more than ${cheapest.name}.`;
  } else {
    reason = `${recommended.name} gives the best balance of rate (${fmtMoney(recommended.rate)}/${u}), delivery (${fmtDate(recommended.eta)}) and track record (${recommended.reliabilityBasis}).`;
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthSpend = pos
    .filter(p => ['Approved', 'Partially Received', 'Received'].includes(p.status))
    .filter(p => { const d = parsePODate(p.approvedDate ?? p.date); return !!d && d >= monthStart; })
    .reduce((a, p) => a + p.amount, 0);
  const value = strategy === 'split' && split ? split.total : recommended.total;
  if (budget > 0 && monthSpend + value > budget) warnings.push(`This order takes the month's approved purchases to ${fmtMoney(monthSpend + value)}, over the ${fmtMoney(budget)} budget.`);

  return {
    item, qty, store, requiredBy, demandFactor, available, reserved, incoming, avgDaily, adjustedDaily, daysCover, stockOutDate,
    suggestedQty, urgency, vendors, recommended, split, strategy, reason, monthSpend, budget, approval: approvalAuthority(value), warnings,
  };
}

/** Request for quotation / order note to paste into an email or WhatsApp - not sent automatically. */
export function rfqDraft(r: AgentResult, vendor: string, qty: number, requester: string) {
  return {
    subject: `Quotation request - ${r.item.name}, ${fmtQty(qty)} ${r.item.unit}, needed by ${fmtDate(r.requiredBy)}`,
    body: `Dear ${vendor},\n\nPlease quote your best rate and earliest delivery for:\n\n  Item      : ${r.item.name}${r.item.localName ? ` (${r.item.localName})` : ''}\n  Quantity  : ${fmtQty(qty)} ${r.item.unit}\n  Deliver to: Temple ${r.store === 'KITCHEN' ? 'Kitchen (Madapalli)' : r.store === 'SANCTUM' ? 'Sanctum' : 'Main'} Store\n  Needed by : ${fmtDate(r.requiredBy)}\n\nPlease include GST and delivery charges.\n\nRegards,\n${requester}\nTemple Stores`,
  };
}
