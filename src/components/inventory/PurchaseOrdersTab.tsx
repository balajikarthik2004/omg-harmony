import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, ExternalLink, PackageCheck, Plus } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { RECEIVABLE_PO_STATUSES, formatPODate, procurementActions, useProcurementStore } from '@/hooks/useProcurementStore';
import { fmtMoney, fmtQty, matchPOLineItem, receivedAgainstPO } from '@/lib/inventory';
import { cn } from '@/lib/utils';
import { EmptyRow, tdCls, thCls, useInventoryRole } from './shared';

const FILTERS = [
  { key: 'open', label: 'Open', statuses: ['Pending', 'Approved', 'Partially Received'] },
  { key: 'Pending', label: 'Awaiting approval', statuses: ['Pending'] },
  { key: 'due', label: 'Awaiting delivery', statuses: RECEIVABLE_PO_STATUSES },
  { key: 'closed', label: 'Completed', statuses: ['Received', 'Rejected'] },
  { key: 'all', label: 'All', statuses: [] as string[] },
];

const PurchaseOrdersTab: React.FC<{ onReceive: (poId: string) => void; onNewOrder: () => void }> = ({ onReceive, onNewOrder }) => {
  const { state } = useInventoryStore();
  const { items: pos } = useProcurementStore();
  const { isAdmin, userName } = useInventoryRole();
  const [filter, setFilter] = useState('open');
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    const statuses = FILTERS.find(f => f.key === filter)?.statuses ?? [];
    return pos.filter(p => !statuses.length || statuses.includes(p.status));
  }, [pos, filter]);

  const decide = (id: string, approve: boolean) => {
    const today = formatPODate();
    procurementActions.update(id, approve
      ? { status: 'Approved', approvedBy: userName, approvedByName: userName, approvedDate: today }
      : { status: 'Rejected', rejectedBy: userName, rejectedByName: userName, rejectedDate: today, rejectionReason: 'Rejected from inventory' });
    toast.success(approve ? 'Order approved' : 'Order rejected');
  };

  return (
    <div className="section-panel inventory-main-panel shadow-sm">
      <div className="section-panel-header flex-wrap gap-3 py-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter orders">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn('h-8 px-3.5 rounded-full text-xs font-medium border transition-colors',
                filter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground')}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/procurement"><ExternalLink className="h-4 w-4 mr-1.5" />Full procurement</Link>
          </Button>
          <Button size="sm" onClick={onNewOrder}><Plus className="h-4 w-4 mr-1.5" />New order</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="w-8" />
              <th className={thCls}>Order</th>
              <th className={thCls}>Supplier</th>
              <th className={thCls}>Items</th>
              <th className={cn(thCls, 'text-right')}>Amount</th>
              <th className={thCls}>Status</th>
              <th className={cn(thCls, 'text-right')}>Action</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {rows.length === 0 && <EmptyRow colSpan={7} message="No orders here." />}
            {rows.map(po => {
              const open = expanded === po.id;
              const received = receivedAgainstPO(state, po.id);
              return (
                <React.Fragment key={po.id}>
                  <tr className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(open ? null : po.id)}>
                    <td className="pl-3 text-muted-foreground">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                    <td className={tdCls}>
                      <p className="font-semibold">{po.poNumber}</p>
                      <p className="text-xs text-muted-foreground">{po.date}{po.expectedDate && ` · due ${new Date(po.expectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}</p>
                    </td>
                    <td className={tdCls}>{po.vendor}</td>
                    <td className={cn(tdCls, 'text-muted-foreground max-w-[260px] truncate')}>{po.items.map(i => i.name).join(', ')}</td>
                    <td className={cn(tdCls, 'text-right tabular-nums font-medium')}>{fmtMoney(po.amount)}</td>
                    <td className={tdCls}><StatusBadge status={po.status} /></td>
                    <td className={cn(tdCls, 'text-right whitespace-nowrap')} onClick={e => e.stopPropagation()}>
                      {RECEIVABLE_PO_STATUSES.includes(po.status) && (
                        <Button size="sm" variant="outline" onClick={() => onReceive(po.id)}><PackageCheck className="h-4 w-4 mr-1.5" />Receive</Button>
                      )}
                      {po.status === 'Pending' && isAdmin && (
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => decide(po.id, false)}>Reject</Button>
                          <Button size="sm" onClick={() => decide(po.id, true)}>Approve</Button>
                        </div>
                      )}
                      {po.status === 'Pending' && !isAdmin && <span className="text-xs text-muted-foreground">With admin</span>}
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-border bg-muted/20">
                      <td />
                      <td colSpan={6} className="px-3 py-3">
                        <table className="w-full max-w-2xl text-sm">
                          <thead><tr className="text-xs text-muted-foreground"><th className="text-left font-medium py-1">Item</th><th className="text-right font-medium py-1">Ordered</th><th className="text-right font-medium py-1">Received</th><th className="text-right font-medium py-1">Rate</th></tr></thead>
                          <tbody>
                            {po.items.map((line, idx) => {
                              const itemId = matchPOLineItem(state.items, line);
                              return (
                                <tr key={idx}>
                                  <td className="py-1">{line.name}</td>
                                  <td className="py-1 text-right tabular-nums">{fmtQty(line.quantity)} {line.unit ?? ''}</td>
                                  <td className="py-1 text-right tabular-nums">{itemId ? fmtQty(received[itemId] ?? 0) : '-'}</td>
                                  <td className="py-1 text-right tabular-nums">{fmtMoney(line.price)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {po.rejectionReason && po.status === 'Rejected' && <p className="text-xs text-destructive mt-2">Reason: {po.rejectionReason}</p>}
                        {po.notes && <p className="text-xs text-muted-foreground mt-2">Note: {po.notes}</p>}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrdersTab;
