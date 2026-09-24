import { mockProcurements, type ProcurementRecord } from '@/data/mockData';
import { buildSeedState, computeSummaries, receiveStock, type InventoryState } from '@/lib/inventory';
import { approvalAuthority, evaluatePO, supplierQuotes, type EvalLine } from '@/lib/poEvaluation';

const NOW = new Date();
const seed = () => buildSeedState(NOW);

/** One item with a known ledger: 10 L in stock, used 1 L/day, lead time 3 days, max 30. */
function oneItem(): InventoryState {
  const s = seed();
  const item = { ...s.items[0], id: 'itm-t', name: 'Test Oil', unit: 'L', minStock: 5, reorderLevel: 10, maxStock: 30, unitCost: 100, perishable: false, shelfLifeDays: null, defaultStore: 'MAIN' as const, leadTimeDays: 3, active: true };
  let st: InventoryState = { ...s, items: [item], movements: [], counts: [], templates: [], requests: [], counters: {} };
  st = receiveStock(st, { type: 'RECEIPT', store: 'MAIN', party: 'Oil House', user: 't', date: new Date(NOW.getTime() - 40 * 86400000).toISOString(), lines: [{ itemId: 'itm-t', qty: 40, unitCost: 100 }] }).state;
  // 30 days of 1 L/day usage.
  st = { ...st, movements: [...st.movements, ...Array.from({ length: 30 }, (_, d) => ({
    ...st.movements[0], id: `use-${d}`, refNo: `ISS-${d}`, type: 'ISSUE' as const, qty: -1, party: undefined,
    date: new Date(NOW.getTime() - (d + 1) * 86400000).toISOString(),
  }))] };
  return st;
}

const run = (state: InventoryState, lines: EvalLine[], extra: Partial<Parameters<typeof evaluatePO>[0]> = {}) =>
  evaluatePO({ poId: 'po-x', supplier: 'Oil House', state, summaries: computeSummaries(state, NOW), pos: [], lines, now: NOW, ...extra });

const line = (qty: number, price = 100): EvalLine => ({ key: 'a', name: 'Test Oil', itemId: 'itm-t', qty, price, store: 'MAIN' });

describe('purchase order evaluation', () => {
  it('approves an order that tops stock up to the maximum at the usual rate', () => {
    const e = run(oneItem(), [line(20)]);
    expect(e.lines[0].available).toBe(10);
    expect(e.lines[0].daysCover).toBeCloseTo(10, 0);
    expect(e.verdict).toBe('approve');
    expect(e.score).toBeGreaterThanOrEqual(80);
  });

  it('flags over-ordering and suggests topping up to the maximum, allowing for use until delivery', () => {
    // 10 L now, 1 L/day for the 3-day lead time leaves 7 L on arrival, so 23 L reaches the 30 L maximum.
    const e = run(oneItem(), [line(80)]);
    expect(e.lines[0].findings.map(f => f.title)).toContain('Over-ordering');
    expect(e.lines[0].suggestedQty).toBe(23);
    expect(e.verdict).toBe('approve_with_changes');
    expect(e.suggestedTotal).toBeLessThan(e.total);
  });

  it('counts stock already on another open order', () => {
    const other = { ...mockProcurements[0], id: 'po-other', poNumber: 'PO-9', status: 'Approved', items: [{ name: 'Test Oil', itemId: 'itm-t', quantity: 25, price: 100 }] } as ProcurementRecord;
    const e = run(oneItem(), [line(20)], { pos: [other] });
    expect(e.lines[0].otherOnOrder).toEqual([{ poNumber: 'PO-9', qty: 25 }]);
    expect(e.lines[0].findings.map(f => f.title)).toEqual(expect.arrayContaining(['Already on order', 'Not needed now']));
    expect(e.verdict).toBe('review');
  });

  it('warns when stock runs out before the delivery date', () => {
    const late = new Date(NOW.getTime() + 20 * 86400000).toISOString().slice(0, 10);
    const e = run(oneItem(), [line(20)], { expectedDate: late });
    expect(e.lines[0].findings[0].title).toBe('Runs out before delivery');
    expect(e.urgency).toBe('critical');
  });

  it('flags a rate well above what was paid before and suggests the usual rate', () => {
    const e = run(oneItem(), [line(20, 130)]);
    expect(e.lines[0].findings.some(f => f.title.includes('above usual rate'))).toBe(true);
    expect(e.lines[0].suggestedPrice).toBe(100);
  });

  it('treats pending usage requests as stock already committed', () => {
    const s = oneItem();
    const withReq = { ...s, requests: [{ id: 'r', refNo: 'REQ/1', status: 'Pending' as const, store: 'MAIN' as const, purpose: 'x', party: 'x', lines: [{ itemId: 'itm-t', qty: 6 }], requestedAt: NOW.toISOString(), requestedBy: 'x' }] };
    expect(run(withReq, [line(20)]).lines[0].available).toBe(4);
  });

  it('reads past rates per supplier from receipts', () => {
    expect(supplierQuotes(oneItem(), 'itm-t')).toEqual([expect.objectContaining({ supplier: 'Oil House', avgRate: 100, receipts: 1 })]);
  });

  it('maps order value to the right sign-off', () => {
    expect(approvalAuthority(8000).role).toBe('Store manager');
    expect(approvalAuthority(30000).role).toBe('Temple manager');
    expect(approvalAuthority(90000).role).toBe('Trustee');
  });

  it('evaluates every seeded pending order without errors and links each line to a real item', () => {
    const s = seed();
    const sums = computeSummaries(s, NOW);
    mockProcurements.filter(p => p.status === 'Pending').forEach(po => {
      const e = evaluatePO({
        poId: po.id, supplier: po.vendor, expectedDate: po.expectedDate, state: s, summaries: sums, pos: mockProcurements, now: NOW,
        lines: po.items.map((l, i) => ({ key: String(i), name: l.name, itemId: l.itemId, qty: l.quantity, price: l.price, store: l.store ?? 'MAIN' })),
      });
      e.lines.forEach(l => expect(l.item, po.poNumber).not.toBeNull());
      expect(e.score).toBeGreaterThanOrEqual(0);
    });
  });
});
