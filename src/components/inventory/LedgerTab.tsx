import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { MOVEMENT_META, MovementType, STORES, StoreId, addDays, downloadCSV, fmtDateTime, fmtQty, storeName } from '@/lib/inventory';
import { cn, toISODate } from '@/lib/utils';
import { EmptyRow, MovementBadge, Pager, inputCls, selectCls, tdCls, thCls } from './shared';
import { ThemeSelect } from '@/components/ui/theme-select';
import { DatePicker } from '@/components/ui/date-picker';

const TYPE_GROUPS: { key: string; label: string; types: MovementType[] }[] = [
  { key: 'all', label: 'All activity', types: [] },
  { key: 'in', label: 'Received', types: ['RECEIPT', 'OPENING'] },
  { key: 'don', label: 'Donations', types: ['DONATION'] },
  { key: 'iss', label: 'Issued', types: ['ISSUE'] },
  { key: 'trf', label: 'Moved between stores', types: ['TRANSFER_IN'] },
  { key: 'wst', label: 'Written off', types: ['WASTAGE'] },
  { key: 'adj', label: 'Corrections', types: ['ADJUSTMENT'] },
];

const LedgerTab: React.FC<{ onOpenItem: (itemId: string) => void }> = ({ onOpenItem }) => {
  const { state } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const [store, setStore] = useState<'ALL' | StoreId>('ALL');
  const [from, setFrom] = useState(toISODate(addDays(new Date(), -30)));
  const [to, setTo] = useState(toISODate(new Date()));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => setPage(1), [search, group, store, from, to, pageSize]);

  const itemById = useMemo(() => new Map(state.items.map(i => [i.id, i])), [state.items]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const types = TYPE_GROUPS.find(g => g.key === group)?.types ?? [];
    return state.movements
      .filter(m => {
        const day = toISODate(new Date(m.date));
        if (from && day < from) return false;
        if (to && day > to) return false;
        if (types.length ? !types.includes(m.type) : m.type === 'TRANSFER_OUT') return false;
        if (store !== 'ALL' && m.store !== store) return false;
        if (q) {
          const item = itemById.get(m.itemId);
          const hay = [m.refNo, item?.name, item?.code, m.party, m.purpose, m.reason, m.poNumber, m.invoiceNo, m.receiptNo, m.batchNo, m.user].join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.refNo.localeCompare(b.refNo));
  }, [state.movements, itemById, search, group, store, from, to]);


  const exportCSV = () => {
    downloadCSV(`stock-history-${from}-to-${to}.csv`, [
      ['Date', 'Ref no', 'Type', 'Item code', 'Item', 'Store', 'Batch', 'Expiry', 'Qty', 'Unit', 'Unit cost', 'Value', 'Purpose / Reason', 'Party', 'PO', 'Invoice', 'Donation receipt', 'User', 'Remarks'],
      ...rows.map(m => {
        const item = itemById.get(m.itemId);
        return [fmtDateTime(m.date), m.refNo, MOVEMENT_META[m.type].label, item?.code, item?.name, storeName(m.store), m.batchNo, m.expiryDate ?? '', m.qty, item?.unit,
          m.unitCost.toFixed(2), (m.qty * m.unitCost).toFixed(2), m.purpose ?? m.reason ?? '', m.party ?? '', m.poNumber ?? '', m.invoiceNo ?? '', m.receiptNo ?? '', m.user, m.notes ?? ''];
      }),
    ]);
    toast.success(`Exported ${rows.length} ledger lines`);
  };

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="section-panel inventory-main-panel shadow-sm">
      <div className="section-panel-header flex-col items-stretch gap-3 py-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search item, supplier, donor or reference"
              className="inventory-search-input w-full h-10 pl-9 pr-8 rounded-lg border border-input bg-background text-sm outline-none focus:border-primary" />
            {search && <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setSearch('')} aria-label="Clear search"><X className="h-4 w-4" /></button>}
          </div>
          <ThemeSelect
            className="w-auto min-w-[160px]"
            value={group}
            onChange={setGroup}
            options={TYPE_GROUPS.map(g => ({ value: g.key, label: g.label }))}
            aria-label="Movement type"
          />
          <ThemeSelect
            className="w-auto min-w-[140px]"
            value={store}
            onChange={v => setStore(v as 'ALL' | StoreId)}
            options={[{ value: 'ALL', label: 'All stores' }, ...STORES.map(s => ({ value: s.id, label: s.name }))]}
            aria-label="Store"
          />
          <div className="w-[140px]">
            <DatePicker value={from} onChange={setFrom} placeholder="From date" />
          </div>
          <span className="text-xs text-muted-foreground pb-3">to</span>
          <div className="w-[140px]">
            <DatePicker value={to} onChange={setTo} placeholder="To date" />
          </div>
          <Button variant="outline" size="sm" className="h-10" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5" />Download</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className={thCls}>Date</th>
              <th className={thCls}>Activity</th>
              <th className={thCls}>Item</th>
              <th className={`${thCls} text-right`}>Quantity</th>
              <th className={thCls}>Details</th>
              <th className={thCls}>By</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {pageRows.length === 0 && <EmptyRow colSpan={6} message="No activity in this period." />}
            {pageRows.map(m => {
              const item = itemById.get(m.itemId);
              return (
                <tr key={m.id} className="border-b border-border hover:bg-muted/30">
                  <td className={`${tdCls} text-xs whitespace-nowrap text-muted-foreground`}>{fmtDateTime(m.date)}</td>
                  <td className={tdCls}><MovementBadge type={m.type} /></td>
                  <td className={`${tdCls} min-w-[160px]`}>
                    <button className="text-left hover:underline" onClick={() => item && onOpenItem(item.id)}>
                      <span className="font-medium">{item?.name ?? 'Unknown'}</span>
                      <span className="block text-[11px] text-muted-foreground">{m.type === 'TRANSFER_IN' ? `${m.party} → ${storeName(m.store)}` : storeName(m.store)}</span>
                    </button>
                  </td>
                  <td className={`${tdCls} text-right tabular-nums font-semibold whitespace-nowrap ${m.qty > 0 && m.type !== 'TRANSFER_IN' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{m.qty > 0 && m.type !== 'TRANSFER_IN' ? '+' : ''}{fmtQty(m.qty)} <span className="text-[11px] font-normal text-muted-foreground">{item?.unit}</span></td>
                  <td className={`${tdCls} text-xs text-muted-foreground max-w-[260px]`}>
                    {(m.type === 'TRANSFER_IN' ? m.notes : [m.purpose, m.reason, m.party].filter(Boolean).join(' · ')) || m.notes || '-'}
                    <span className="block text-[10px] opacity-80">Ref {[m.refNo, m.poNumber, m.receiptNo].filter(Boolean).join(' · ')}</span>
                  </td>
                  <td className={`${tdCls} text-xs text-muted-foreground whitespace-nowrap`}>{m.user}</td>
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

export default LedgerTab;
