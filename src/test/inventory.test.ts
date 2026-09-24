import {
  adjustStock, approveStockCount, buildSeedState, computeSummaries, createStockCount, fyLabel, getStockStatus,
  approveStockRequest, createStockRequest, issueStock, receiveStock, rejectStockRequest, suggestedOrderQty, suggestedStore,
  transferStock, type InventoryState,
} from '@/lib/inventory';

const NOW = new Date('2026-09-23T14:00:00');
const seed = () => buildSeedState(NOW);

/** A tiny ledger with one item so every expectation can be worked out by hand. */
function blank(): InventoryState {
  const s = seed();
  const item = { ...s.items[0], id: 'itm-test', code: 'T-001', name: 'Test Ghee', unit: 'L', minStock: 2, reorderLevel: 5, maxStock: 20, unitCost: 100, perishable: true, shelfLifeDays: 30, defaultStore: 'MAIN' as const };
  return { ...s, items: [item], movements: [], counts: [], templates: [], requests: [], counters: {} };
}

describe('inventory ledger', () => {
  it('derives every seeded balance from movements and never goes negative', () => {
    const s = seed();
    const sums = computeSummaries(s, NOW);
    s.items.forEach(i => {
      const net = s.movements.filter(m => m.itemId === i.id).reduce((a, m) => a + m.qty, 0);
      expect(sums[i.id].onHand, i.name).toBeCloseTo(net, 2);
      Object.values(sums[i.id].byStore).forEach(q => expect(q, i.name).toBeGreaterThanOrEqual(0));
      sums[i.id].batches.forEach(b => expect(b.qty, `${i.name} ${b.batchNo}`).toBeGreaterThan(0));
    });
  });

  it('seeds a realistic mix of stock positions', () => {
    const s = seed();
    const statuses = Object.values(computeSummaries(s, NOW)).map(x => x.status);
    expect(statuses).toContain('Healthy');
    expect(statuses).toContain('Out of Stock');
    expect(statuses).toContain('Overstock');
    expect(statuses.filter(x => x === 'Low Stock' || x === 'Critical').length).toBeGreaterThan(0);
    expect(s.movements.some(m => m.type === 'DONATION')).toBe(true);
    expect(s.counts[0]?.status).toBe('Approved');
  });

  it('classifies stock against min / reorder / max', () => {
    const item = { minStock: 2, reorderLevel: 5, maxStock: 20 };
    expect(getStockStatus(item, 0)).toBe('Out of Stock');
    expect(getStockStatus(item, 1)).toBe('Critical');
    expect(getStockStatus(item, 5)).toBe('Low Stock');
    expect(getStockStatus(item, 12)).toBe('Healthy');
    expect(getStockStatus(item, 21)).toBe('Overstock');
  });

  it('issues first-expiry-first-out across batches', () => {
    let s = blank();
    s = receiveStock(s, { type: 'RECEIPT', store: 'MAIN', user: 't', lines: [{ itemId: 'itm-test', qty: 4, unitCost: 100, batchNo: 'LATE', expiryDate: '2026-12-31' }] }).state;
    s = receiveStock(s, { type: 'RECEIPT', store: 'MAIN', user: 't', lines: [{ itemId: 'itm-test', qty: 3, unitCost: 120, batchNo: 'EARLY', expiryDate: '2026-10-15' }] }).state;
    const r = issueStock(s, { store: 'MAIN', purpose: 'Homam', user: 't', lines: [{ itemId: 'itm-test', qty: 5 }] });
    const rows = r.state.movements.filter(m => m.type === 'ISSUE');
    expect(rows.map(m => [m.batchNo, m.qty])).toEqual([['EARLY', -3], ['LATE', -2]]);
    expect(r.refNo).toBe('ISS/26-27/0001');
    const sum = computeSummaries(r.state, NOW)['itm-test'];
    expect(sum.onHand).toBe(2);
    expect(sum.avgCost).toBeCloseTo((4 * 100 + 3 * 120) / 7, 5);
  });

  it('refuses to issue more than the store holds', () => {
    const s = receiveStock(blank(), { type: 'RECEIPT', store: 'MAIN', user: 't', lines: [{ itemId: 'itm-test', qty: 2, unitCost: 100 }] }).state;
    expect(() => issueStock(s, { store: 'MAIN', purpose: 'x', user: 't', lines: [{ itemId: 'itm-test', qty: 3 }] })).toThrow(/Only 2/);
    expect(() => issueStock(s, { store: 'SANCTUM', purpose: 'x', user: 't', lines: [{ itemId: 'itm-test', qty: 1 }] })).toThrow();
  });

  it('transfers keep the batch and expiry and net to zero', () => {
    let s = receiveStock(blank(), { type: 'RECEIPT', store: 'MAIN', user: 't', lines: [{ itemId: 'itm-test', qty: 10, unitCost: 100, batchNo: 'B1', expiryDate: '2026-11-01' }] }).state;
    s = transferStock(s, { from: 'MAIN', to: 'SANCTUM', user: 't', lines: [{ itemId: 'itm-test', qty: 4 }] }).state;
    const sum = computeSummaries(s, NOW)['itm-test'];
    expect(sum.byStore).toEqual({ MAIN: 6, KITCHEN: 0, SANCTUM: 4 });
    expect(sum.batches.find(b => b.store === 'SANCTUM')).toMatchObject({ batchNo: 'B1', expiryDate: '2026-11-01' });
  });

  it('writes off a chosen batch and posts count variances on approval', () => {
    let s = receiveStock(blank(), { type: 'RECEIPT', store: 'MAIN', user: 't', lines: [{ itemId: 'itm-test', qty: 10, unitCost: 100, batchNo: 'B1' }] }).state;
    s = adjustStock(s, { type: 'WASTAGE', store: 'MAIN', itemId: 'itm-test', delta: 1.5, reason: 'Spillage', batchNo: 'B1', user: 't' }).state;
    expect(computeSummaries(s, NOW)['itm-test'].onHand).toBe(8.5);

    s = createStockCount(s, 'MAIN', 't').state;
    const count = s.counts[0];
    s = { ...s, counts: [{ ...count, status: 'Submitted', lines: count.lines.map(l => ({ ...l, countedQty: 8 })) }] };
    const approved = approveStockCount(s, count.id, 'admin');
    expect(approved.refNo).toMatch(/^ADJ\//);
    expect(computeSummaries(approved.state, NOW)['itm-test'].onHand).toBe(8);
    expect(approved.state.counts[0].status).toBe('Approved');
  });

  it('suggests an order that tops up to max net of stock on order', () => {
    const item = { ...blank().items[0], maxStock: 20, unit: 'pcs' };
    expect(suggestedOrderQty(item, 4, 6)).toBe(10);
    expect(suggestedOrderQty(item, 25, 0)).toBe(0);
  });

  it('labels the Indian financial year', () => {
    expect(fyLabel(new Date('2026-09-23'))).toBe('26-27');
    expect(fyLabel(new Date('2027-02-10'))).toBe('26-27');
    expect(fyLabel(new Date('2027-04-01'))).toBe('27-28');
  });

  it('holds a usage request until approved, then issues the approved store and quantity', () => {
    let s = receiveStock(blank(), { type: 'RECEIPT', store: 'MAIN', user: 't', lines: [{ itemId: 'itm-test', qty: 10, unitCost: 100 }] }).state;
    s = receiveStock(s, { type: 'RECEIPT', store: 'KITCHEN', user: 't', lines: [{ itemId: 'itm-test', qty: 4, unitCost: 100 }] }).state;
    s = createStockRequest(s, { store: 'MAIN', purpose: 'Homam', party: 'Sanctum', user: 'staff', lines: [{ itemId: 'itm-test', qty: 6 }] }).state;
    const req = s.requests[0];
    expect(req.status).toBe('Pending');
    expect(computeSummaries(s, NOW)['itm-test'].onHand).toBe(14);

    expect(() => approveStockRequest(s, req.id, { store: 'KITCHEN', purpose: 'Homam', party: 'Sanctum', user: 'admin', lines: [{ itemId: 'itm-test', qty: 6 }] })).toThrow();
    const r = approveStockRequest(s, req.id, { store: 'KITCHEN', purpose: 'Homam', party: 'Sanctum', user: 'admin', lines: [{ itemId: 'itm-test', qty: 3 }] });
    const done = r.state.requests[0];
    expect(done.status).toBe('Approved');
    expect(done.approvedStore).toBe('KITCHEN');
    expect(done.approvedLines).toEqual([{ itemId: 'itm-test', qty: 3 }]);
    expect(computeSummaries(r.state, NOW)['itm-test'].byStore).toMatchObject({ MAIN: 10, KITCHEN: 1 });
    expect(() => approveStockRequest(r.state, req.id, { store: 'MAIN', purpose: 'x', party: 'x', user: 'admin', lines: [{ itemId: 'itm-test', qty: 1 }] })).toThrow(/already/);
  });

  it('requires a reason to reject a usage request and posts no stock', () => {
    const s = createStockRequest(blank(), { store: 'MAIN', purpose: 'Homam', party: 'Sanctum', user: 'staff', lines: [{ itemId: 'itm-test', qty: 1 }] }).state;
    expect(() => rejectStockRequest(s, s.requests[0].id, ' ', 'admin')).toThrow(/reason/);
    const r = rejectStockRequest(s, s.requests[0].id, 'Not needed', 'admin').state;
    expect(r.requests[0].status).toBe('Rejected');
    expect(r.movements.length).toBe(s.movements.length);
  });

  it('routes PO lines to the approved store, else the item home store, else a guess', () => {
    const items = seed().items;
    expect(suggestedStore(items, { name: 'Camphor', store: 'KITCHEN' })).toBe('KITCHEN');
    expect(suggestedStore(items, { name: 'Raw Rice (Ponni)' })).toBe('KITCHEN');
    expect(suggestedStore(items, { name: 'Jasmine garland (new)' })).toBe('SANCTUM');
  });

  it('seeds pending usage requests for the approval queue', () => {
    expect(seed().requests.filter(r => r.status === 'Pending').length).toBeGreaterThan(0);
  });
});
