/**
 * Purchase-order evaluation.
 *
 * Checks a purchase order against what the temple actually has and uses: stock on hand (net of
 * usage already requested), consumption over the last 30 days, supplier lead time, other open
 * orders, shelf life, and the rates paid on past receipts. Every figure comes from the inventory
 * ledger and purchase history - nothing is typed in by hand.
 */
import type { ProcurementRecord } from '@/data/mockData';
import {
  InventoryItem, InventoryState, ItemSummary, StoreId, WHOLE_UNITS, addDays, daysBetween, fmtDate, fmtMoney, fmtQty,
  matchPOLineItem, receivedAgainstPO, round3, storeName,
} from '@/lib/inventory';
import { toISODate } from '@/lib/utils';

export type Severity = 'risk' | 'warn' | 'info' | 'good';

export interface Finding {
  severity: Severity;
  title: string;
  detail: string;
}

export interface EvalLine {
  key: string;
  name: string;
  itemId?: string;
  qty: number;
  price: number;
  store: StoreId;
}

export interface SupplierQuote {
  supplier: string;
  avgRate: number;
  lastRate: number;
  lastDate: string;
  receipts: number;
}

export interface LineEvaluation {
  key: string;
  item: InventoryItem | null;
  findings: Finding[];
  /** Quantity the evaluation would order instead, when it differs from the line. */
  suggestedQty: number | null;
  /** Rate the evaluation would expect instead, when the line is well above what was paid before. */
  suggestedPrice: number | null;
  onHand: number;
  reserved: number;
  available: number;
  avgDaily: number;
  daysCover: number | null;
  stockOutDate: string | null;
  otherOnOrder: { poNumber: string; qty: number }[];
  quotes: SupplierQuote[];
  usualRate: number | null;
  score: number;
}

export interface SupplierRecord {
  name: string;
  receipts: number;
  lastReceipt: string | null;
  itemsSupplied: number;
  deliveries: number;
  onTime: number;
  avgDelayDays: number | null;
}

export type Verdict = 'approve' | 'approve_with_changes' | 'review';

export interface POEvaluation {
  score: number;
  verdict: Verdict;
  headline: string;
  urgency: 'critical' | 'high' | 'normal';
  lines: LineEvaluation[];
  total: number;
  suggestedTotal: number;
  changes: number;
  supplier: SupplierRecord;
  approval: { role: string; reason: string };
  monthSpend: number;
  generatedAt: string;
}

/* Value bands for sign-off, matching the procurement approval policy. */
export function approvalAuthority(value: number) {
  if (value <= 10000) return { role: 'Store manager', reason: 'Orders up to ₹10,000 can be cleared by the store manager.' };
  if (value <= 50000) return { role: 'Temple manager', reason: 'Orders from ₹10,001 to ₹50,000 need the temple manager.' };
  return { role: 'Trustee', reason: 'Orders above ₹50,000 need a trustee to sign off.' };
}

/** PO dates are stored as "Sep 24, 2026"; expected dates as ISO. */
export function parsePODate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const OPEN = ['Pending', 'Approved', 'Partially Received'];
const PENALTY: Record<Severity, number> = { risk: 30, warn: 12, info: 2, good: 0 };
const roundQty = (item: InventoryItem, q: number) => (WHOLE_UNITS.has(item.unit) ? Math.ceil(q - 0.0001) : Math.ceil(q * 10) / 10);

export function supplierRecord(name: string, state: InventoryState, pos: ProcurementRecord[]): SupplierRecord {
  const key = name.trim().toLowerCase();
  const receipts = state.movements.filter(m => m.type === 'RECEIPT' && m.party?.trim().toLowerCase() === key);
  const refs = new Set(receipts.map(m => m.refNo));
  const delays = pos
    .filter(p => p.vendor.trim().toLowerCase() === key && p.expectedDate && p.receivedDate)
    .map(p => {
      const got = parsePODate(p.receivedDate);
      const due = parsePODate(p.expectedDate);
      return got && due ? Math.round((got.getTime() - due.getTime()) / 86400000) : null;
    })
    .filter((d): d is number => d !== null);
  return {
    name,
    receipts: refs.size,
    lastReceipt: receipts.reduce<string | null>((a, m) => (!a || m.date > a ? m.date : a), null),
    itemsSupplied: new Set(receipts.map(m => m.itemId)).size,
    deliveries: delays.length,
    onTime: delays.filter(d => d <= 0).length,
    avgDelayDays: delays.length ? round3(delays.reduce((a, d) => a + Math.max(0, d), 0) / delays.length) : null,
  };
}

/** Rates actually paid for an item, per supplier, most recent first. */
export function supplierQuotes(state: InventoryState, itemId: string): SupplierQuote[] {
  const by = new Map<string, { qty: number; value: number; lastRate: number; lastDate: string; refs: Set<string> }>();
  for (const m of state.movements) {
    if (m.type !== 'RECEIPT' || m.itemId !== itemId || !m.party || m.qty <= 0) continue;
    const s = by.get(m.party) ?? { qty: 0, value: 0, lastRate: m.unitCost, lastDate: m.date, refs: new Set<string>() };
    s.qty += m.qty;
    s.value += m.qty * m.unitCost;
    s.refs.add(m.refNo);
    if (m.date >= s.lastDate) { s.lastDate = m.date; s.lastRate = m.unitCost; }
    by.set(m.party, s);
  }
  return [...by].map(([supplier, s]) => ({
    supplier, avgRate: Math.round((s.value / s.qty) * 100) / 100, lastRate: s.lastRate, lastDate: s.lastDate, receipts: s.refs.size,
  })).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
}

export interface EvaluateInput {
  poId: string;
  supplier: string;
  expectedDate?: string;
  lines: EvalLine[];
  state: InventoryState;
  summaries: Record<string, ItemSummary>;
  pos: ProcurementRecord[];
  now?: Date;
}

export function evaluatePO({ poId, supplier, expectedDate, lines, state, summaries, pos, now = new Date() }: EvaluateInput): POEvaluation {
  const vendorKey = supplier.trim().toLowerCase();
  const supplierInfo = supplierRecord(supplier, state, pos);

  // Stock other open orders will still bring in, per item.
  const onOrder = new Map<string, { poNumber: string; qty: number }[]>();
  pos.filter(p => p.id !== poId && OPEN.includes(p.status)).forEach(p => {
    const got = receivedAgainstPO(state, p.id);
    p.items.forEach(l => {
      const id = matchPOLineItem(state.items, l);
      if (!id) return;
      const due = Math.max(0, round3(l.quantity - (got[id] ?? 0)));
      if (due > 0) onOrder.set(id, [...(onOrder.get(id) ?? []), { poNumber: p.poNumber, qty: due }]);
    });
  });

  // Usage already requested but not yet approved will take stock out soon.
  const reserved = new Map<string, number>();
  state.requests.filter(r => r.status === 'Pending').forEach(r =>
    r.lines.forEach(l => reserved.set(l.itemId, round3((reserved.get(l.itemId) ?? 0) + l.qty))));

  const evaluated: LineEvaluation[] = lines.map(line => {
    const item = state.items.find(i => i.id === (line.itemId || matchPOLineItem(state.items, line))) ?? null;
    const findings: Finding[] = [];
    let suggestedQty: number | null = null;
    let suggestedPrice: number | null = null;

    if (!(line.price > 0)) findings.push({ severity: 'risk', title: 'No rate', detail: 'The line has no unit rate. Confirm the price with the supplier before approving.' });

    if (!item) {
      findings.push({ severity: 'info', title: 'New item', detail: 'Not in the item master, so there is no stock or price history to check against. It is added on receipt.' });
      return {
        key: line.key, item: null, findings, suggestedQty, suggestedPrice, onHand: 0, reserved: 0, available: 0, avgDaily: 0,
        daysCover: null, stockOutDate: null, otherOnOrder: [], quotes: [], usualRate: null,
        score: Math.max(0, 100 - findings.reduce((a, f) => a + PENALTY[f.severity], 0)),
      };
    }

    const sum = summaries[item.id];
    const onHand = sum?.onHand ?? 0;
    const usable = sum ? round3(sum.usableByStore.MAIN + sum.usableByStore.KITCHEN + sum.usableByStore.SANCTUM) : 0;
    const held = reserved.get(item.id) ?? 0;
    const available = Math.max(0, round3(usable - held));
    const avgDaily = sum?.avgDaily ?? 0;
    const daysCover = avgDaily > 0 ? available / avgDaily : null;
    const stockOutDate = daysCover !== null ? toISODate(addDays(now, Math.floor(daysCover))) : null;
    const others = onOrder.get(item.id) ?? [];
    const incoming = round3(others.reduce((a, o) => a + o.qty, 0));
    const deliveryDays = expectedDate ? Math.max(0, daysBetween(expectedDate, now)) : item.leadTimeDays;
    const deliveryLabel = expectedDate ? fmtDate(expectedDate) : `about ${item.leadTimeDays} days (usual lead time)`;
    const u = item.unit;

    /* Timing: will the shelf run empty before this delivery arrives? */
    if (daysCover !== null && daysCover < deliveryDays) {
      findings.push({
        severity: 'risk', title: 'Runs out before delivery',
        detail: `${fmtQty(available)} ${u} usable at ${fmtQty(round3(avgDaily))} ${u}/day lasts until ${fmtDate(stockOutDate)}, but delivery is ${deliveryLabel}. Ask ${supplier} to deliver sooner or buy a small quantity locally.`,
      });
    } else if (daysCover !== null && daysCover < deliveryDays + 2) {
      findings.push({ severity: 'warn', title: 'Tight timing', detail: `Stock lasts about ${Math.floor(daysCover)} days and delivery is ${deliveryLabel}. Any delay means a stock-out.` });
    } else if (daysCover !== null && available <= item.reorderLevel) {
      findings.push({ severity: 'good', title: 'Needed now', detail: `Below reorder level (${fmtQty(item.reorderLevel)} ${u}) with ${Math.floor(daysCover)} days of cover.` });
    }

    /* Quantity: stock is used while waiting for delivery, so judge what will be on the shelf when it arrives. */
    const atDelivery = Math.max(0, round3(available - avgDaily * deliveryDays));
    const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`;
    let ideal = roundQty(item, Math.max(0, item.maxStock - atDelivery - incoming));
    let spoilCap: number | null = null;
    if (item.perishable && item.shelfLifeDays && avgDaily > 0) {
      spoilCap = roundQty(item, Math.max(0, avgDaily * item.shelfLifeDays - atDelivery));
      ideal = Math.min(ideal, spoilCap);
    }
    const after = round3(atDelivery + incoming + line.qty);
    const shelf = `${fmtQty(atDelivery)} ${u} expected on the shelf at delivery${incoming ? ` plus ${fmtQty(incoming)} ${u} already on order` : ''}`;
    if (line.qty > 0 && spoilCap !== null && line.qty > spoilCap * 1.15 && after <= item.maxStock * 1.1) {
      suggestedQty = ideal;
      findings.push({ severity: 'warn', title: 'May spoil', detail: `Keeps ${days(item.shelfLifeDays ?? 0)} and about ${fmtQty(round3(avgDaily * (item.shelfLifeDays ?? 0)))} ${u} is used in that time. With ${shelf}, order ${fmtQty(ideal)} ${u}.` });
    } else if (line.qty > 0 && (after > item.maxStock * 1.1 || (spoilCap !== null && line.qty > spoilCap * 1.15))) {
      suggestedQty = ideal;
      const spoils = spoilCap !== null && line.qty > spoilCap * 1.15;
      findings.push({
        severity: ideal === 0 ? 'risk' : 'warn', title: ideal === 0 ? 'Not needed now' : 'Over-ordering',
        detail: `With ${shelf}, this order takes stock to ${fmtQty(after)} ${u} against a maximum of ${fmtQty(item.maxStock)} ${u}${spoils ? ` and it keeps only ${days(item.shelfLifeDays ?? 0)}` : ''}. ${ideal === 0 ? 'Remove this line.' : `Order ${fmtQty(ideal)} ${u} instead.`}`,
      });
    } else if (line.qty > 0 && after < item.reorderLevel) {
      suggestedQty = ideal;
      findings.push({ severity: 'warn', title: 'Too little', detail: `With ${shelf}, stock would still be below reorder level (${fmtQty(after)} of ${fmtQty(item.reorderLevel)} ${u}). Order ${fmtQty(ideal)} ${u}.` });
    }
    if (others.length) {
      findings.push({ severity: 'info', title: 'Already on order', detail: `${others.map(o => `${fmtQty(o.qty)} ${u} on ${o.poNumber}`).join(', ')} is still due.` });
    }
    if (held > 0) {
      findings.push({ severity: 'info', title: 'Usage waiting', detail: `${fmtQty(held)} ${u} is requested in pending stock usage and is counted as already used.` });
    }
    if (avgDaily === 0 && line.qty > 0) {
      findings.push({ severity: 'warn', title: 'No recent usage', detail: 'Nothing was issued in the last 30 days. Check the item is still needed.' });
    }

    /* Price: compare with what was actually paid on past receipts. */
    const quotes = supplierQuotes(state, item.id);
    const usualRate = quotes.length
      ? Math.round((quotes.reduce((a, q) => a + q.avgRate * q.receipts, 0) / quotes.reduce((a, q) => a + q.receipts, 0)) * 100) / 100
      : item.unitCost;
    if (line.price > 0 && usualRate > 0) {
      const diff = (line.price - usualRate) / usualRate;
      if (diff > 0.1) {
        suggestedPrice = Math.round(usualRate * 100) / 100;
        findings.push({ severity: diff > 0.25 ? 'risk' : 'warn', title: `${Math.round(diff * 100)}% above usual rate`, detail: `Past receipts average ${fmtMoney(usualRate)} per ${u}. Negotiate, or note the reason for the higher rate.` });
      } else if (diff < -0.2) {
        findings.push({ severity: 'warn', title: 'Unusually cheap', detail: `${Math.round(-diff * 100)}% below the usual ${fmtMoney(usualRate)}. Check the pack size, grade and quality.` });
      }
    }
    const cheaper = quotes.find(q => q.supplier.trim().toLowerCase() !== vendorKey && q.avgRate < line.price * 0.92);
    if (cheaper) {
      findings.push({ severity: 'info', title: 'Cheaper elsewhere', detail: `${cheaper.supplier} supplied at ${fmtMoney(cheaper.avgRate)} (last on ${fmtDate(cheaper.lastDate)}).` });
    }

    if (line.store !== item.defaultStore) {
      findings.push({ severity: 'info', title: 'Different store', detail: `Normally kept in ${storeName(item.defaultStore)}; this order sends it to ${storeName(line.store)}.` });
    }

    return {
      key: line.key, item, findings, suggestedQty: suggestedQty !== null && suggestedQty !== line.qty ? suggestedQty : null,
      suggestedPrice, onHand, reserved: held, available, avgDaily, daysCover, stockOutDate, otherOnOrder: others, quotes, usualRate,
      score: Math.max(0, 100 - findings.reduce((a, f) => a + PENALTY[f.severity], 0)),
    };
  });

  /* A late supplier matters only where timing is already tight. */
  if (supplierInfo.deliveries >= 2 && supplierInfo.onTime / supplierInfo.deliveries < 0.7) {
    evaluated
      .filter(l => l.findings.some(f => f.title === 'Tight timing' || f.title === 'Runs out before delivery'))
      .forEach(l => l.findings.push({ severity: 'warn', title: 'Supplier often late', detail: `${supplier} delivered on time ${supplierInfo.onTime} of ${supplierInfo.deliveries} times, ${supplierInfo.avgDelayDays} days late on average.` }));
  }

  const total = lines.reduce((a, l) => a + l.qty * l.price, 0);
  const suggestedTotal = evaluated.reduce((a, e, i) => a + (e.suggestedQty ?? lines[i].qty) * (e.suggestedPrice ?? lines[i].price), 0);
  const changes = evaluated.filter(e => e.suggestedQty !== null || e.suggestedPrice !== null).length;
  const risks = evaluated.flatMap(e => e.findings).filter(f => f.severity === 'risk');
  const warns = evaluated.flatMap(e => e.findings).filter(f => f.severity === 'warn');
  const weight = total > 0 ? total : 1;
  const score = lines.length
    ? Math.round(evaluated.reduce((a, e, i) => a + e.score * (total > 0 ? (lines[i].qty * lines[i].price) / weight : 1 / lines.length), 0)
      - (supplierInfo.receipts === 0 ? 5 : 0))
    : 0;
  const urgency = evaluated.some(e => e.findings.some(f => f.title === 'Runs out before delivery'))
    ? 'critical' : evaluated.some(e => e.findings.some(f => f.title === 'Tight timing' || f.title === 'Needed now')) ? 'high' : 'normal';
  const blocking = risks.filter(r => r.title !== 'Runs out before delivery');
  const verdict: Verdict = blocking.length ? 'review' : changes ? 'approve_with_changes' : 'approve';

  const headline = verdict === 'review'
    ? `Review before approving: ${blocking.map(r => r.title.toLowerCase()).filter((t, i, a) => a.indexOf(t) === i).join(', ')}.`
    : verdict === 'approve_with_changes'
      ? `Approve with ${changes} change${changes > 1 ? 's' : ''}; saves ${fmtMoney(Math.max(0, total - suggestedTotal))}${warns.length ? ` and clears ${warns.length} warning${warns.length > 1 ? 's' : ''}` : ''}.`
      : urgency === 'critical'
        ? 'Quantities and rates look right. Approve now: stock runs out before delivery.'
        : 'Quantities and rates are in line with stock levels and past purchases. Safe to approve.';

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthSpend = pos
    .filter(p => p.id !== poId && ['Approved', 'Partially Received', 'Received'].includes(p.status))
    .filter(p => { const d = parsePODate(p.approvedDate ?? p.date); return !!d && d >= monthStart; })
    .reduce((a, p) => a + p.amount, 0);

  return {
    score: Math.max(0, Math.min(100, score)), verdict, headline, urgency, lines: evaluated, total, suggestedTotal, changes,
    supplier: supplierInfo, approval: approvalAuthority(total), monthSpend, generatedAt: new Date(now).toISOString(),
  };
}
