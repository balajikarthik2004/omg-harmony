import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle, ArrowDownLeft, ArrowLeftRight, ArrowUpRight, BarChart3, CalendarClock, ChevronDown, ClipboardCheck,
  ClipboardList, Gift, IndianRupee, Layers, Package, PackagePlus, RotateCcw, Scale, ScrollText, ShoppingCart, Trash2, Truck, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { OPEN_PO_STATUSES, RECEIVABLE_PO_STATUSES, formatPODate, procurementActions, useProcurementStore } from '@/hooks/useProcurementStore';
import { InventoryItem, StoreId, fmtMoney, fmtQty, matchPOLineItem, needsReorder, receivedAgainstPO, round3 } from '@/lib/inventory';
import { toISODate } from '@/lib/utils';
import { useInventoryRole } from '@/components/inventory/shared';
import StockRegisterTab, { RegisterFilter } from '@/components/inventory/StockRegisterTab';
import LedgerTab from '@/components/inventory/LedgerTab';
import PurchaseOrdersTab from '@/components/inventory/PurchaseOrdersTab';
import PlanningTab from '@/components/inventory/PlanningTab';
import StockCountTab from '@/components/inventory/StockCountTab';
import ReportsTab from '@/components/inventory/ReportsTab';
import ItemDetailSheet, { ItemAction } from '@/components/inventory/ItemDetailSheet';
import ItemFormModal from '@/components/inventory/ItemFormModal';
import CreatePOModal, { POSuggestion } from '@/components/inventory/CreatePOModal';
import { triggerStockNotification } from '@/components/inventory/StockNotificationToast';
import { AdjustModal, IssueModal, ReceiveModal, TransferModal } from '@/components/inventory/TransactionModals';

type Tab = 'stock' | 'orders' | 'history' | 'planning' | 'check' | 'reports';

const TABS: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: 'stock', label: 'Stock', Icon: Layers },
  { key: 'orders', label: 'Purchase Orders', Icon: Truck },
  { key: 'history', label: 'History', Icon: ScrollText },
  { key: 'planning', label: 'Seva Planning', Icon: ClipboardList },
  { key: 'check', label: 'Stock Check', Icon: ClipboardCheck },
  { key: 'reports', label: 'Reports', Icon: BarChart3 },
];

type ReceivePreset = { itemId?: string; poId?: string; mode?: 'RECEIPT' | 'PO' | 'DONATION' };
type AdjustPreset = { itemId?: string; store?: StoreId; type?: 'ADJUSTMENT' | 'WASTAGE'; batchNo?: string };
type IssuePreset = { itemId?: string; store?: StoreId; templateId?: string; count?: number };

const listNames = (items: InventoryItem[], max = 3) =>
  items.length <= max ? items.map(i => i.name).join(', ') : `${items.slice(0, max).map(i => i.name).join(', ')} and ${items.length - max} more`;

const InventoryPage: React.FC = () => {
  const { state, summaries, actions } = useInventoryStore();
  const { items: pos } = useProcurementStore();
  const { isAdmin, canAdjust, userName } = useInventoryRole();

  const [tab, setTab] = useState<Tab>('stock');
  const [filter, setFilter] = useState<RegisterFilter>('all');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const [receive, setReceive] = useState<ReceivePreset | null>(null);
  const [issue, setIssue] = useState<IssuePreset | null>(null);
  const [transfer, setTransfer] = useState<{ itemId?: string } | null>(null);
  const [adjust, setAdjust] = useState<AdjustPreset | null>(null);
  const [itemForm, setItemForm] = useState<{ item: InventoryItem | null } | null>(null);
  const [poSuggestions, setPoSuggestions] = useState<POSuggestion[] | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  /* Quantity still due on open purchase orders, per item. */
  const { onOrder, receivablePOs, pendingValue, overduePOs } = useMemo(() => {
    const map: Record<string, number> = {};
    const today = toISODate(new Date());
    let value = 0;
    const receivable = pos.filter(p => RECEIVABLE_PO_STATUSES.includes(p.status));
    pos.filter(p => OPEN_PO_STATUSES.includes(p.status)).forEach(po => {
      const received = receivedAgainstPO(state, po.id);
      po.items.forEach(line => {
        const itemId = matchPOLineItem(state.items, line);
        if (!itemId) return;
        const due = Math.max(0, round3(line.quantity - (received[itemId] ?? 0)));
        map[itemId] = round3((map[itemId] ?? 0) + due);
        if (RECEIVABLE_PO_STATUSES.includes(po.status)) value += due * line.price;
      });
    });
    return { onOrder: map, receivablePOs: receivable, pendingValue: value, overduePOs: receivable.filter(p => p.expectedDate && p.expectedDate < today) };
  }, [pos, state]);

  const kpi = useMemo(() => {
    const active = state.items.filter(i => i.active);
    return {
      active,
      value: active.reduce((s, i) => s + summaries[i.id].value, 0),
      reorder: active.filter(i => needsReorder(summaries[i.id].status)),
      urgent: active.filter(i => summaries[i.id].status === 'Out of Stock' || summaries[i.id].status === 'Critical'),
      expiring: active.filter(i => summaries[i.id].expiringQty > 0),
      expired: active.filter(i => summaries[i.id].expiredQty > 0),
    };
  }, [state.items, summaries]);

  const toOrder = kpi.reorder.filter(i => !(onOrder[i.id] > 0));
  const orderLowItems = () => setPoSuggestions(toOrder.map(i => ({ itemId: i.id })));
  const showFilter = (f: RegisterFilter) => { setTab('stock'); setFilter(f); };

  const handleAction = (action: ItemAction, itemId: string, extra?: { store?: StoreId; batchNo?: string }) => {
    switch (action) {
      case 'receive': setReceive({ itemId }); break;
      case 'issue': setIssue({ itemId }); break;
      case 'transfer': setTransfer({ itemId }); break;
      case 'adjust': setAdjust({ itemId, type: 'ADJUSTMENT' }); break;
      case 'wastage': setAdjust({ itemId, type: 'WASTAGE', ...extra }); break;
      case 'edit': setItemForm({ item: state.items.find(i => i.id === itemId) ?? null }); break;
      case 'po': setPoSuggestions([{ itemId }]); break;
    }
  };

  const handleDirectReceivePO = (poId: string) => {
    const po = pos.find(p => p.id === poId);
    if (!po) {
      toast.error('Purchase order not found');
      return;
    }

    try {
      const received = receivedAgainstPO(state, po.id);
      const itemsToReceive: { itemId: string; name: string; qty: number; unitCost: number; store: StoreId; unit?: string }[] = [];

      let currentItems = [...state.items];

      for (const line of po.items) {
        let itemId = matchPOLineItem(currentItems, line);
        let item = currentItems.find(i => i.id === itemId);

        if (!item) {
          const guessCategory = (name: string) => {
            const n = name.toLowerCase();
            if (n.includes('flower') || n.includes('rose') || n.includes('marigold') || n.includes('jasmine') || n.includes('garland')) return 'Flowers & Garlands';
            if (n.includes('rice') || n.includes('dal') || n.includes('oil') || n.includes('sugar') || n.includes('ghee') || n.includes('kitchen') || n.includes('provisions')) return 'Kitchen & Prasadam';
            if (n.includes('milk') || n.includes('curd') || n.includes('honey') || n.includes('panchamrit') || n.includes('abhishekam')) return 'Abhishekam';
            if (n.includes('lamp') || n.includes('wick') || n.includes('deepam')) return 'Lamps & Oil';
            if (n.includes('clean') || n.includes('soap') || n.includes('light') || n.includes('wire') || n.includes('switch') || n.includes('maintenance')) return 'Cleaning & Maintenance';
            return 'Pooja Items';
          };

          item = actions.addItem({
            name: line.name,
            localName: '',
            category: guessCategory(line.name),
            unit: line.unit || 'pkt',
            minStock: 5,
            reorderLevel: 10,
            maxStock: Math.max(50, line.quantity * 2),
            unitCost: line.price,
            defaultStore: 'MAIN',
            supplier: po.vendor,
            leadTimeDays: 3,
            perishable: false,
            shelfLifeDays: null,
            notes: `Auto-created from ${po.poNumber}`,
          });
          itemId = item.id;
          currentItems = [...currentItems, item];
        }

        const done = itemId ? received[itemId] ?? 0 : 0;
        const due = Math.max(0, round3(line.quantity - done));
        const qtyToTake = due > 0 ? due : line.quantity;

        if (qtyToTake > 0) {
          itemsToReceive.push({
            itemId: item.id,
            name: item.name,
            qty: qtyToTake,
            unitCost: line.price,
            store: item.defaultStore || 'MAIN',
            unit: item.unit,
          });
        }
      }

      if (!itemsToReceive.length) {
        toast.info(`All items for ${po.poNumber} are already marked as received.`);
        return;
      }

      // Group by store and execute receive movements
      const byStore = new Map<StoreId, typeof itemsToReceive>();
      itemsToReceive.forEach(it => {
        const list = byStore.get(it.store) ?? [];
        list.push(it);
        byStore.set(it.store, list);
      });

      byStore.forEach((lines, store) => {
        actions.receive({
          type: 'RECEIPT',
          store,
          party: po.vendor,
          poId: po.id,
          poNumber: po.poNumber,
          user: userName || 'Admin User',
          notes: `Goods received against ${po.poNumber}`,
          lines: lines.map(l => ({
            itemId: l.itemId,
            qty: l.qty,
            unitCost: l.unitCost,
          })),
        });
      });

      // Update PO status to Received
      procurementActions.update(po.id, {
        status: 'Received',
        receivedDate: formatPODate(),
        items: po.items.map(l => ({
          ...l,
          itemId: l.itemId ?? (matchPOLineItem(state.items, l) || undefined),
        })),
      });

      // Show notification in top right corner with green highlight and progress bar
      triggerStockNotification({
        poNumber: po.poNumber,
        party: po.vendor,
        totalValue: po.amount,
        items: itemsToReceive.map(i => ({
          name: i.name,
          qty: i.qty,
          unit: i.unit,
        })),
        onViewStock: () => setTab('stock'),
        duration: 5500,
      });
    } catch (err) {
      toast.error('Failed to receive stock', { description: (err as Error).message });
    }
  };

  type Alert = { id: string; tone: 'danger' | 'warn'; text: string; action: string; run: () => void };
  const alerts: Alert[] = [];
  const urgentToOrder = kpi.urgent.filter(i => !(onOrder[i.id] > 0));
  if (urgentToOrder.length) {
    alerts.push({ id: 'urgent', tone: 'danger', text: `Running out: ${listNames(urgentToOrder)}. No order has been placed yet.`, action: 'Order now', run: orderLowItems });
  }
  if (kpi.expired.length) {
    alerts.push({ id: 'expired', tone: 'danger', text: `Expired stock found in ${listNames(kpi.expired)}. Write it off so it is not used.`, action: 'Review', run: () => showFilter('expiring') });
  }
  if (kpi.expiring.length) {
    alerts.push({ id: 'expiring', tone: 'warn', text: `Use soon: ${listNames(kpi.expiring)} will expire within 15 days.`, action: 'View', run: () => showFilter('expiring') });
  }
  if (overduePOs.length) {
    alerts.push({ id: 'overdue', tone: 'warn', text: `Delivery late: ${overduePOs.map(p => `${p.poNumber} from ${p.vendor}`).join(', ')}.`, action: 'Receive', run: () => handleDirectReceivePO(overduePOs[0].id) });
  }
  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));

  const cards = [
    { label: 'Stock value', value: fmtMoney(kpi.value), sub: `${kpi.active.length} items across 3 stores`, Icon: IndianRupee, tone: 'text-primary', onClick: () => setTab('reports') },
    { label: 'Needs reorder', value: String(kpi.reorder.length), sub: kpi.reorder.length ? `${kpi.reorder.length - toOrder.length} already ordered` : 'All items well stocked', Icon: AlertTriangle, tone: kpi.reorder.length ? 'text-destructive' : 'text-emerald-600', onClick: () => showFilter('reorder') },
    { label: 'Expiring soon', value: String(kpi.expiring.length + kpi.expired.length), sub: 'Items to use within 15 days', Icon: CalendarClock, tone: kpi.expiring.length + kpi.expired.length ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600', onClick: () => showFilter('expiring') },
    { label: 'Deliveries due', value: String(receivablePOs.length), sub: receivablePOs.length ? `${fmtMoney(pendingValue)} of approved orders` : 'Nothing awaiting delivery', Icon: Truck, tone: 'text-foreground', onClick: () => setTab('orders') },
  ];

  return (
    <div className="inventory-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner inventory-header flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Track pooja materials, flowers and kitchen provisions. Receive deliveries, issue stock and reorder on time.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setReceive({})} className="inventory-cta"><ArrowDownLeft className="h-4 w-4 mr-1.5" />Receive stock</Button>
          <Button variant="secondary" onClick={() => setIssue({})}><ArrowUpRight className="h-4 w-4 mr-1.5" />Issue stock</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">More <ChevronDown className="h-4 w-4 ml-1" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onClick={() => setItemForm({ item: null })}><PackagePlus className="h-4 w-4 mr-2" />Add new item</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReceive({ mode: 'DONATION' })}><Gift className="h-4 w-4 mr-2" />Record donated items</DropdownMenuItem>
              <DropdownMenuItem disabled={!toOrder.length} onClick={orderLowItems}><ShoppingCart className="h-4 w-4 mr-2" />Order all low items{toOrder.length ? ` (${toOrder.length})` : ''}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTransfer({})}><ArrowLeftRight className="h-4 w-4 mr-2" />Move stock between stores</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAdjust({ type: 'WASTAGE' })}><Trash2 className="h-4 w-4 mr-2" />Write off damaged / expired</DropdownMenuItem>
              {canAdjust && <DropdownMenuItem onClick={() => setAdjust({ type: 'ADJUSTMENT' })}><Scale className="h-4 w-4 mr-2" />Correct a stock quantity</DropdownMenuItem>}
              {isAdmin && <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground" onClick={() => setResetOpen(true)}><RotateCcw className="h-4 w-4 mr-2" />Reset sample data</DropdownMenuItem>
              </>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <button key={c.label} onClick={c.onClick} className="stat-card inventory-stat-card text-left flex flex-col gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              {c.label} <c.Icon className={`h-4 w-4 ${c.tone}`} aria-hidden />
            </span>
            <span className={`text-2xl font-display font-bold tabular-nums ${c.tone}`}>{c.value}</span>
            <span className="text-xs text-muted-foreground">{c.sub}</span>
          </button>
        ))}
      </div>

      {visibleAlerts.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border" role="region" aria-label="Needs attention">
          {visibleAlerts.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={`h-2 w-2 rounded-full shrink-0 ${a.tone === 'danger' ? 'bg-destructive' : 'bg-amber-500'}`} aria-hidden />
              <p className="text-sm flex-1">{a.text}</p>
              <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={a.run}>{a.action}</Button>
              <button className="text-muted-foreground hover:text-foreground shrink-0" onClick={() => setDismissed(prev => new Set(prev).add(a.id))} aria-label="Dismiss"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="inventory-tabbar rounded-xl border border-border bg-card shadow-sm p-1.5 flex gap-1 overflow-x-auto" role="tablist">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`inventory-tab-btn flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${tab === key ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="animate-slide-up">
        {tab === 'stock' && (
          <StockRegisterTab filter={filter} onFilter={setFilter} onOrder={onOrder} onOpen={setDetailId} onAction={handleAction}
            onBulkPO={ids => setPoSuggestions(ids.map(itemId => ({ itemId })))} />
        )}
        {tab === 'orders' && (
          <PurchaseOrdersTab
            onReceive={handleDirectReceivePO}
            onCustomReceive={poId => setReceive({ mode: 'PO', poId })}
            onNewOrder={() => setPoSuggestions([])}
          />
        )}
        {tab === 'history' && <LedgerTab onOpenItem={setDetailId} />}
        {tab === 'planning' && (
          <PlanningTab onOrder={onOrder} onIssueTemplate={(templateId, count) => setIssue({ templateId, count })} onRaisePO={lines => setPoSuggestions(lines)} />
        )}
        {tab === 'check' && <StockCountTab />}
        {tab === 'reports' && <ReportsTab onOpenItem={setDetailId} />}
      </div>

      <ItemDetailSheet itemId={detailId} onClose={() => setDetailId(null)} onOrder={onOrder}
        onAction={(a, id, extra) => { setDetailId(null); handleAction(a, id, extra); }} />
      <ReceiveModal open={!!receive} onClose={() => setReceive(null)} preset={receive ?? undefined} />
      <IssueModal open={!!issue} onClose={() => setIssue(null)} preset={issue ?? undefined} />
      <TransferModal open={!!transfer} onClose={() => setTransfer(null)} preset={transfer ?? undefined} />
      <AdjustModal open={!!adjust} onClose={() => setAdjust(null)} preset={adjust ?? undefined} />
      <ItemFormModal open={!!itemForm} onClose={() => setItemForm(null)} item={itemForm?.item ?? null} items={state.items} />
      <CreatePOModal open={!!poSuggestions} onClose={() => setPoSuggestions(null)} suggestions={poSuggestions ?? []} onOrder={onOrder}
        onCreated={() => setTab('orders')} />
      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} title="Reset sample data" confirmLabel="Reset"
        message="This replaces all items, stock history, stock checks and templates with fresh sample data. Purchase orders are kept."
        onConfirm={() => { actions.resetDemoData(); toast.success('Sample data restored'); }} />
    </div>
  );
};

export default InventoryPage;
