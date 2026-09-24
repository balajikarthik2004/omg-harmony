import { mockProcurements } from '@/data/mockData';
import { addDays, buildSeedState, computeSummaries } from '@/lib/inventory';
import { rfqDraft, runProcurementAgent } from '@/lib/procurementAgent';
import { toISODate } from '@/lib/utils';

const NOW = new Date();
const state = buildSeedState(NOW);
const summaries = computeSummaries(state, NOW);
const base = { state, summaries, pos: mockProcurements, budget: 250000, demandFactor: 1, now: NOW };
const inDays = (n: number) => toISODate(addDays(NOW, n));

describe('procurement agent', () => {
  it('shortlists only suppliers the temple actually uses and ranks them', () => {
    const r = runProcurementAgent({ ...base, itemId: 'itm-KT-002', qty: 40, requiredBy: inDays(5), store: 'KITCHEN' });
    const known = new Set([...state.items.map(i => i.supplier), ...state.movements.map(m => m.party)]);
    expect(r.vendors.length).toBeGreaterThan(1);
    r.vendors.forEach(v => expect(known.has(v.name), v.name).toBe(true));
    expect(r.vendors.map(v => v.rank)).toEqual(r.vendors.map((_, i) => i + 1));
    expect(r.recommended?.name).toBe(r.vendors[0].name);
  });

  it('uses past receipt rates for suppliers who delivered the item and marks others as estimates', () => {
    const r = runProcurementAgent({ ...base, itemId: 'itm-KT-002', qty: 40, requiredBy: inDays(5), store: 'KITCHEN' });
    const grain = r.vendors.find(v => v.name === 'Grain Mart')!;
    expect(grain.rateBasis).toBe('past receipts');
    expect(grain.receipts).toBeGreaterThan(0);
    r.vendors.filter(v => v.receipts === 0).forEach(v => expect(v.rateBasis).toBe('item master rate'));
  });

  it('takes lead time and punctuality from past purchase orders', () => {
    const r = runProcurementAgent({ ...base, itemId: 'itm-LO-002', qty: 20, requiredBy: inDays(8), store: 'MAIN' });
    const oils = r.vendors.find(v => v.name === 'Ayyappa Oils')!;
    expect(oils.leadDays).toBe(6); // ordered 16 days ago, received 10 days ago
    expect(oils.deliveries).toBe(1);
    expect(oils.onTime).toBe(0); // arrived 2 days late
  });

  it('raises urgency when demand spikes', () => {
    const normal = runProcurementAgent({ ...base, itemId: 'itm-FL-001', qty: 10, requiredBy: inDays(1), store: 'SANCTUM' });
    const festival = runProcurementAgent({ ...base, itemId: 'itm-FL-001', qty: 10, requiredBy: inDays(1), store: 'SANCTUM', demandFactor: 1.6 });
    expect(festival.adjustedDaily).toBeGreaterThan(normal.adjustedDaily);
    expect(['critical', 'high']).toContain(festival.urgency);
  });

  it('warns when the budget would be exceeded', () => {
    const r = runProcurementAgent({ ...base, budget: 1000, itemId: 'itm-KT-002', qty: 40, requiredBy: inDays(5), store: 'KITCHEN' });
    expect(r.warnings.some(w => w.includes('over the'))).toBe(true);
  });

  it('rejects an empty request', () => {
    expect(() => runProcurementAgent({ ...base, itemId: '', qty: 1, requiredBy: inDays(3), store: 'MAIN' })).toThrow();
    expect(() => runProcurementAgent({ ...base, itemId: 'itm-KT-002', qty: 0, requiredBy: inDays(3), store: 'MAIN' })).toThrow();
  });

  it('drafts a quotation request with the real item and store', () => {
    const r = runProcurementAgent({ ...base, itemId: 'itm-KT-002', qty: 40, requiredBy: inDays(5), store: 'KITCHEN' });
    const d = rfqDraft(r, 'Grain Mart', 40, 'Admin');
    expect(d.subject).toContain('Toor Dal');
    expect(d.body).toContain('Kitchen');
  });
});
