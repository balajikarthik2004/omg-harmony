import { useMemo, useSyncExternalStore } from 'react';
import {
  InventoryItem, InventoryState, SevaTemplate, StockCount, StoreId, STATE_VERSION,
  adjustStock, approveStockCount, buildSeedState, computeSummaries, createStockCount, issueStock,
  nextItemCode, receiveStock, transferStock, uid,
  type AdjustInput, type IssueInput, type ItemSummary, type ReceiveInput, type TransferInput,
} from '@/lib/inventory';

const STORAGE_KEY = 'omg_inventory_v1';

function load(): InventoryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InventoryState;
      if (parsed?.version === STATE_VERSION && Array.isArray(parsed.items)) return parsed;
    }
  } catch {
    // Storage blocked or corrupt - fall back to seed data.
  }
  return buildSeedState();
}

let state: InventoryState | null = null;
const listeners = new Set<() => void>();

function getState() {
  if (!state) state = load();
  return state;
}

function setState(next: InventoryState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota or privacy mode - keep working in memory.
  }
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let summaryCache: { state: InventoryState | null; value: Record<string, ItemSummary> } = { state: null, value: {} };
function getSummaries(s: InventoryState) {
  if (summaryCache.state !== s) summaryCache = { state: s, value: computeSummaries(s) };
  return summaryCache.value;
}

type ItemDraft = Omit<InventoryItem, 'id' | 'code' | 'createdAt' | 'active'>;

function validateItem(s: InventoryState, draft: ItemDraft, id?: string) {
  const name = draft.name.trim();
  if (!name) throw new Error('Item name is required.');
  if (s.items.some(i => i.id !== id && i.name.trim().toLowerCase() === name.toLowerCase())) {
    throw new Error(`An item named "${name}" already exists.`);
  }
  if (!draft.category) throw new Error('Choose a category.');
  if (!draft.unit) throw new Error('Choose a unit of measure.');
  if (draft.maxStock <= 0) throw new Error('Maximum stock must be greater than zero.');
  if (draft.minStock < 0 || draft.reorderLevel < 0) throw new Error('Stock levels cannot be negative.');
  if (!(draft.minStock <= draft.reorderLevel && draft.reorderLevel <= draft.maxStock)) {
    throw new Error('Levels must satisfy Minimum ≤ Reorder level ≤ Maximum.');
  }
  if (draft.unitCost < 0) throw new Error('Unit cost cannot be negative.');
  if (draft.perishable && !(draft.shelfLifeDays && draft.shelfLifeDays > 0)) {
    throw new Error('Perishable items need a shelf life in days.');
  }
}

export const inventoryActions = {
  addItem(draft: ItemDraft, opening?: { qty: number; store: StoreId; user: string }) {
    const s = getState();
    validateItem(s, draft);
    const item: InventoryItem = {
      ...draft,
      name: draft.name.trim(),
      shelfLifeDays: draft.perishable ? draft.shelfLifeDays : null,
      id: uid('itm'),
      code: nextItemCode(s.items, draft.category),
      createdAt: new Date().toISOString(),
      active: true,
    };
    let next: InventoryState = { ...s, items: [...s.items, item] };
    if (opening && opening.qty > 0) {
      next = receiveStock(next, {
        type: 'OPENING', store: opening.store, user: opening.user, notes: 'Opening stock on item creation',
        lines: [{ itemId: item.id, qty: opening.qty, unitCost: item.unitCost }],
      }).state;
    }
    setState(next);
    return item;
  },

  updateItem(id: string, draft: ItemDraft) {
    const s = getState();
    validateItem(s, draft, id);
    setState({
      ...s,
      items: s.items.map(i => i.id === id
        ? { ...i, ...draft, name: draft.name.trim(), shelfLifeDays: draft.perishable ? draft.shelfLifeDays : null }
        : i),
    });
  },

  setActive(id: string, active: boolean) {
    const s = getState();
    if (!active && (getSummaries(s)[id]?.onHand ?? 0) > 0) {
      throw new Error('Issue, transfer or write off the remaining stock before archiving this item.');
    }
    setState({ ...s, items: s.items.map(i => (i.id === id ? { ...i, active } : i)) });
  },

  receive(input: ReceiveInput) {
    const r = receiveStock(getState(), input);
    setState(r.state);
    return r.refNo;
  },

  issue(input: IssueInput) {
    const r = issueStock(getState(), input);
    setState(r.state);
    return r.refNo;
  },

  transfer(input: TransferInput) {
    const r = transferStock(getState(), input);
    setState(r.state);
    return r.refNo;
  },

  adjust(input: AdjustInput) {
    const r = adjustStock(getState(), input);
    setState(r.state);
    return r.refNo;
  },

  createCount(store: StoreId, user: string, notes = '') {
    const r = createStockCount(getState(), store, user, notes);
    setState(r.state);
    return r.state.counts[0];
  },

  updateCount(id: string, patch: Partial<StockCount>) {
    const s = getState();
    setState({ ...s, counts: s.counts.map(c => (c.id === id ? { ...c, ...patch } : c)) });
  },

  approveCount(id: string, user: string) {
    const r = approveStockCount(getState(), id, user);
    setState(r.state);
    return r.refNo;
  },

  saveTemplate(template: Omit<SevaTemplate, 'id'> & { id?: string }) {
    const s = getState();
    if (!template.name.trim()) throw new Error('Template name is required.');
    if (!template.lines.length || template.lines.some(l => !l.itemId || !(l.qty > 0))) {
      throw new Error('Every line needs an item and a quantity above zero.');
    }
    if (!(template.basisQty > 0)) throw new Error('Basis quantity must be greater than zero.');
    if (template.id) {
      setState({ ...s, templates: s.templates.map(t => (t.id === template.id ? (template as SevaTemplate) : t)) });
    } else {
      setState({ ...s, templates: [...s.templates, { ...template, id: uid('tpl') }] });
    }
  },

  deleteTemplate(id: string) {
    const s = getState();
    setState({ ...s, templates: s.templates.filter(t => t.id !== id) });
  },

  resetDemoData() {
    setState(buildSeedState());
  },
};

export function useInventoryStore() {
  const s = useSyncExternalStore(subscribe, getState);
  const summaries = useMemo(() => getSummaries(s), [s]);
  return { state: s, summaries, actions: inventoryActions };
}
