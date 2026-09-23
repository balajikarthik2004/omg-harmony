import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Archive, ArchiveRestore, ArrowDownLeft, ArrowLeftRight, ArrowUpDown, ArrowUpRight, Download, MoreHorizontal,
  Pencil, Scale, Search, ShoppingCart, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { CATEGORIES, STATUS_ORDER, STORES, StockStatus, StoreId, downloadCSV, fmtDate, fmtMoney, fmtQty, needsReorder } from '@/lib/inventory';
import { cn } from '@/lib/utils';
import { EmptyRow, Pager, STATUS_LABEL, StockBar, StockStatusBadge, selectCls, tdCls, thCls, useInventoryRole } from './shared';
import type { ItemAction } from './ItemDetailSheet';

export type RegisterFilter = 'all' | 'reorder' | 'expiring' | 'archived' | StockStatus;

type SortKey = 'name' | 'onHand' | 'value' | 'status';

const FILTERS: { key: RegisterFilter; label: string }[] = [
  { key: 'all', label: 'All items' },
  { key: 'reorder', label: 'Needs reorder' },
  { key: 'expiring', label: 'Expiring soon' },
  { key: 'Overstock', label: 'Excess stock' },
  { key: 'archived', label: 'Archived' },
];

const StockRegisterTab: React.FC<{
  filter: RegisterFilter;
  onFilter: (f: RegisterFilter) => void;
  onOrder: Record<string, number>;
  onOpen: (itemId: string) => void;
  onAction: (action: ItemAction, itemId: string) => void;
  onBulkPO: (itemIds: string[]) => void;
}> = ({ filter, onFilter, onOrder, onOpen, onAction, onBulkPO }) => {
  const { state, summaries, actions } = useInventoryStore();
  const { canArchive, canAdjust } = useInventoryRole();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [store, setStore] = useState<'ALL' | StoreId>('ALL');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'status', dir: 1 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => setPage(1), [search, category, store, filter, pageSize]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = state.items.filter(item => {
      if (filter === 'archived' ? item.active : !item.active) return false;
      const s = summaries[item.id];
      if (category !== 'All' && item.category !== category) return false;
      if (store !== 'ALL' && item.defaultStore !== store && s.byStore[store] <= 0) return false;
      if (filter === 'reorder' && !needsReorder(s.status)) return false;
      if (filter === 'expiring' && !(s.expiringQty > 0 || s.expiredQty > 0)) return false;
      if (STATUS_ORDER.includes(filter as StockStatus) && s.status !== filter) return false;
      if (q && ![item.name, item.localName, item.code, item.supplier].some(v => v?.toLowerCase().includes(q))) return false;
      return true;
    });
    const val = (id: string): string | number => {
      const s = summaries[id];
      switch (sort.key) {
        case 'name': return state.items.find(i => i.id === id)!.name.toLowerCase();
        case 'onHand': return store === 'ALL' ? s.onHand : s.byStore[store];
        case 'value': return s.value;
        case 'status': return STATUS_ORDER.indexOf(s.status) * 1e6 + (s.daysCover ?? 1e5);
      }
    };
    return [...list].sort((a, b) => {
      const x = val(a.id);
      const y = val(b.id);
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });
  }, [state.items, summaries, search, category, store, filter, sort]);

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every(r => selected.has(r.id));

  const toggleSort = (key: SortKey) => setSort(prev => (prev.key === key ? { key, dir: prev.dir === 1 ? -1 : 1 } : { key, dir: key === 'value' ? -1 : 1 }));
  const toggle = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const sortTh = (k: SortKey, label: string, right = false) => (
    <th className={cn(thCls, right && 'text-right')} aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button className={cn('inline-flex items-center gap-1 hover:text-foreground', sort.key === k && 'text-foreground')} onClick={() => toggleSort(k)}>
        {label} <ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </th>
  );

  const exportCSV = () => {
    downloadCSV(`stock-list-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Code', 'Item', 'Local name', 'Category', 'Unit', 'Main store', 'Kitchen store', 'Sanctum store', 'Total in stock', 'Reorder at', 'Maximum', 'On order', 'Average cost', 'Stock value', 'Status', 'Supplier'],
      ...rows.map(i => {
        const s = summaries[i.id];
        return [i.code, i.name, i.localName, i.category, i.unit, s.byStore.MAIN, s.byStore.KITCHEN, s.byStore.SANCTUM, s.onHand,
          i.reorderLevel, i.maxStock, onOrder[i.id] ?? 0, s.avgCost.toFixed(2), s.value.toFixed(2), STATUS_LABEL[s.status], i.supplier];
      }),
    ]);
    toast.success(`Downloaded ${rows.length} items`);
  };

  const archive = (id: string, active: boolean) => {
    try {
      actions.setActive(id, active);
      toast.success(active ? 'Item restored' : 'Item archived');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="section-panel inventory-main-panel shadow-sm">
      <div className="section-panel-header flex-col items-stretch gap-3 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by item name, code or supplier"
              className="inventory-search-input w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <select className={cn(selectCls, 'inventory-field w-auto min-w-[170px]')} value={category} onChange={e => setCategory(e.target.value)} aria-label="Category">
            <option value="All">All categories</option>
            {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
          </select>
          <select className={cn(selectCls, 'inventory-field w-auto min-w-[150px]')} value={store} onChange={e => setStore(e.target.value as 'ALL' | StoreId)} aria-label="Store">
            <option value="ALL">All stores</option>
            {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Button variant="outline" size="sm" className="h-10" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5" />Download</Button>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter">
          {FILTERS.map(c => (
            <button key={c.key} onClick={() => onFilter(c.key)}
              className={cn('h-8 px-3.5 rounded-full text-xs font-medium border transition-colors',
                filter === c.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground')}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-primary/10 border-b border-primary/20 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { onBulkPO([...selected]); setSelected(new Set()); }}><ShoppingCart className="h-4 w-4 mr-1.5" />Order selected</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-3 py-3 w-10">
                <Checkbox checked={allOnPageSelected} onCheckedChange={v => setSelected(prev => {
                  const n = new Set(prev);
                  pageRows.forEach(r => (v ? n.add(r.id) : n.delete(r.id)));
                  return n;
                })} aria-label="Select all on this page" />
              </th>
              {sortTh('name', 'Item')}
              {sortTh('onHand', store === 'ALL' ? 'In stock' : `In ${STORES.find(s => s.id === store)?.short} store`, true)}
              <th className={thCls}>Stock level</th>
              {sortTh('status', 'Status')}
              {sortTh('value', 'Value', true)}
              <th className="w-12"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {pageRows.length === 0 && <EmptyRow colSpan={7} message={filter === 'reorder' ? 'Nothing needs reordering right now.' : 'No items match your search.'} />}
            {pageRows.map(item => {
              const s = summaries[item.id];
              const qty = store === 'ALL' ? s.onHand : s.byStore[store];
              const ordered = onOrder[item.id] ?? 0;
              return (
                <tr key={item.id} className="inventory-row border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => onOpen(item.id)}>
                  <td className={tdCls} onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} aria-label={`Select ${item.name}`} disabled={!item.active} />
                  </td>
                  <td className={cn(tdCls, 'min-w-[200px]')}>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}{item.localName && ` · ${item.localName}`}</p>
                  </td>
                  <td className={cn(tdCls, 'text-right whitespace-nowrap')}>
                    <p className="font-semibold tabular-nums text-base">{fmtQty(qty)} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span></p>
                    {ordered > 0 && <p className="text-[11px] text-primary font-medium">+{fmtQty(ordered)} ordered</p>}
                  </td>
                  <td className={cn(tdCls, 'min-w-[160px]')}>
                    <StockBar item={item} onHand={s.onHand} status={s.status} />
                    <p className="text-[11px] text-muted-foreground mt-1.5 tabular-nums">Reorder at {fmtQty(item.reorderLevel)} {item.unit}</p>
                  </td>
                  <td className={tdCls}>
                    <div className="flex flex-col items-start gap-1">
                      <StockStatusBadge status={s.status} />
                      {s.expiredQty > 0 && <span className="text-[11px] font-medium text-destructive">Has expired stock</span>}
                      {!s.expiredQty && s.expiringQty > 0 && <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Expires {fmtDate(s.nearestExpiry)}</span>}
                    </div>
                  </td>
                  <td className={cn(tdCls, 'text-right tabular-nums whitespace-nowrap text-muted-foreground')}>{fmtMoney(s.value)}</td>
                  <td className={cn(tdCls, 'text-right')} onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${item.name}`}><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        {item.active ? <>
                          <DropdownMenuItem onClick={() => onAction('receive', item.id)}><ArrowDownLeft className="h-4 w-4 mr-2" />Receive stock</DropdownMenuItem>
                          <DropdownMenuItem disabled={s.onHand <= 0} onClick={() => onAction('issue', item.id)}><ArrowUpRight className="h-4 w-4 mr-2" />Issue stock</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onAction('po', item.id)}><ShoppingCart className="h-4 w-4 mr-2" />Order from supplier</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled={s.onHand <= 0} onClick={() => onAction('transfer', item.id)}><ArrowLeftRight className="h-4 w-4 mr-2" />Move to another store</DropdownMenuItem>
                          <DropdownMenuItem disabled={s.onHand <= 0} onClick={() => onAction('wastage', item.id)}><Trash2 className="h-4 w-4 mr-2" />Write off</DropdownMenuItem>
                          {canAdjust && <DropdownMenuItem onClick={() => onAction('adjust', item.id)}><Scale className="h-4 w-4 mr-2" />Correct quantity</DropdownMenuItem>}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onAction('edit', item.id)}><Pencil className="h-4 w-4 mr-2" />Edit details</DropdownMenuItem>
                          {canArchive && <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => archive(item.id, false)}><Archive className="h-4 w-4 mr-2" />Archive</DropdownMenuItem>}
                        </> : canArchive && <DropdownMenuItem onClick={() => archive(item.id, true)}><ArchiveRestore className="h-4 w-4 mr-2" />Restore</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageSize={pageSize} total={rows.length} onPage={setPage} onPageSize={setPageSize} />
    </div>
  );
};

export default StockRegisterTab;
